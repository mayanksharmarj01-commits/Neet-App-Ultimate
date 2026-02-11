const { db } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class TeacherController {
    getMyStudents = catchAsync(async (req, res) => {
        const teacherId = req.user.id;

        const followersSnapshot = await db.collection('followers')
            .where('following_id', '==', teacherId)
            .orderBy('created_at', 'desc')
            .get();

        const students = [];
        for (const doc of followersSnapshot.docs) {
            const followData = doc.data();
            const userDoc = await db.collection('users').doc(followData.follower_id).get();
            if (userDoc.exists) {
                const userData = userDoc.data();

                // Get attempt counts
                const attemptsSnapshot = await db.collection('attempts')
                    .where('user_id', '==', followData.follower_id).get();
                const wrongAttempts = attemptsSnapshot.docs.filter(d => !d.data().is_correct).length;

                students.push({
                    id: userDoc.id,
                    name: userData.name,
                    email: userData.email,
                    xp: userData.xp || 0,
                    created_at: userData.created_at,
                    followed_at: followData.created_at,
                    total_attempts: attemptsSnapshot.size,
                    wrong_attempts: wrongAttempts
                });
            }
        }

        res.status(200).json({
            status: 'success',
            results: students.length,
            data: { students }
        });
    });

    getStudentAnalytics = catchAsync(async (req, res, next) => {
        const { studentId } = req.params;
        const teacherId = req.user.id;

        // Verify relationship
        const relationship = await db.collection('followers')
            .where('follower_id', '==', studentId)
            .where('following_id', '==', teacherId)
            .limit(1)
            .get();

        if (relationship.empty) {
            return next(new AppError('This student does not follow you', 403));
        }

        // Get student's attempts
        const attemptsSnapshot = await db.collection('attempts')
            .where('user_id', '==', studentId)
            .get();

        // Build weak chapters analysis
        const chapterStats = {};
        for (const doc of attemptsSnapshot.docs) {
            const attempt = doc.data();
            if (attempt.chapter_id) {
                if (!chapterStats[attempt.chapter_id]) {
                    chapterStats[attempt.chapter_id] = { correct: 0, total: 0 };
                }
                chapterStats[attempt.chapter_id].total++;
                if (attempt.is_correct) chapterStats[attempt.chapter_id].correct++;
            }
        }

        // Get chapter details
        const weakChapters = [];
        for (const [chapterId, stats] of Object.entries(chapterStats)) {
            const chapterDoc = await db.collection('chapters').doc(chapterId).get();
            if (chapterDoc.exists) {
                const subjectDoc = await db.collection('subjects').doc(chapterDoc.data().subject_id).get();
                weakChapters.push({
                    id: chapterId,
                    chapter_name: chapterDoc.data().name,
                    subject_name: subjectDoc.exists ? subjectDoc.data().name : 'Unknown',
                    attempted: stats.total,
                    correct: stats.correct,
                    accuracy: ((stats.correct / stats.total) * 100).toFixed(2)
                });
            }
        }
        weakChapters.sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));

        // Get recent wrong attempts
        const wrongAttempts = attemptsSnapshot.docs
            .filter(d => !d.data().is_correct)
            .sort((a, b) => new Date(b.data().attempted_at) - new Date(a.data().attempted_at))
            .slice(0, 10);

        const recentMistakes = [];
        for (const doc of wrongAttempts) {
            const attempt = doc.data();
            const questionDoc = await db.collection('questions').doc(attempt.question_id).get();
            if (questionDoc.exists) {
                recentMistakes.push({
                    question_id: attempt.question_id,
                    ...questionDoc.data(),
                    user_answer: attempt.user_answer,
                    attempted_at: attempt.attempted_at
                });
            }
        }

        res.status(200).json({
            status: 'success',
            data: { weakChapters: weakChapters.slice(0, 5), recentMistakes }
        });
    });

    sendNotification = catchAsync(async (req, res, next) => {
        const { studentId, message } = req.body;
        const teacherId = req.user.id;

        if (!studentId || !message) {
            return next(new AppError('Student ID and message are required', 400));
        }

        const relationship = await db.collection('followers')
            .where('follower_id', '==', studentId)
            .where('following_id', '==', teacherId)
            .limit(1)
            .get();

        if (relationship.empty) {
            return next(new AppError('This student does not follow you', 403));
        }

        const messageData = {
            sender_id: teacherId,
            receiver_id: studentId,
            content: message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('messages').add(messageData);

        if (req.app.get('io')) {
            req.app.get('io').to(studentId).emit('teacher_notification', {
                from: req.user.name,
                message,
                timestamp: new Date()
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Notification sent successfully',
            data: { notification: { id: docRef.id, ...messageData } }
        });
    });

    getDoubts = catchAsync(async (req, res) => {
        const teacherId = req.user.id;

        const messagesSnapshot = await db.collection('messages')
            .where('receiver_id', '==', teacherId)
            .orderBy('created_at', 'desc')
            .limit(50)
            .get();

        const doubts = [];
        for (const doc of messagesSnapshot.docs) {
            const msg = doc.data();
            if (!msg.question_id) continue;

            const userDoc = await db.collection('users').doc(msg.sender_id).get();
            const questionDoc = await db.collection('questions').doc(msg.question_id).get();

            doubts.push({
                id: doc.id,
                content: msg.content,
                created_at: msg.created_at,
                is_read: msg.is_read,
                student_id: msg.sender_id,
                student_name: userDoc.exists ? userDoc.data().name : 'Unknown',
                ...(questionDoc.exists ? questionDoc.data() : {})
            });
        }

        res.status(200).json({
            status: 'success',
            results: doubts.length,
            data: { doubts }
        });
    });
}

module.exports = new TeacherController();
