const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class TeacherController {
    // Get students following this teacher
    getMyStudents = catchAsync(async (req, res) => {
        const teacherId = req.user.id;

        const query = `
            SELECT 
                u.id,
                u.name,
                u.email,
                u.xp,
                u.created_at,
                f.created_at as followed_at,
                (SELECT COUNT(*) FROM attempts WHERE user_id = u.id) as total_attempts,
                (SELECT COUNT(*) FROM attempts WHERE user_id = u.id AND is_correct = false) as wrong_attempts
            FROM followers f
            JOIN users u ON f.follower_id = u.id
            WHERE f.following_id = $1
            ORDER BY f.created_at DESC
        `;

        const result = await db.query(query, [teacherId]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                students: result.rows
            }
        });
    });

    // Get student analytics (weak chapters and recent mistakes)
    getStudentAnalytics = catchAsync(async (req, res, next) => {
        const { studentId } = req.params;
        const teacherId = req.user.id;

        // Verify teacher-student relationship
        const relationship = await db.query(
            'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
            [studentId, teacherId]
        );

        if (relationship.rows.length === 0) {
            return next(new AppError('This student does not follow you', 403));
        }

        // Get weak chapters (lowest accuracy)
        const weakChapters = await db.query(
            `SELECT 
                c.id,
                c.name as chapter_name,
                s.name as subject_name,
                COUNT(DISTINCT a.question_id) as attempted,
                SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct,
                ROUND(
                    (SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END)::NUMERIC / 
                    NULLIF(COUNT(DISTINCT a.question_id), 0)) * 100, 2
                ) as accuracy
            FROM chapters c
            JOIN subjects s ON c.subject_id = s.id
            LEFT JOIN questions q ON q.chapter_id = c.id
            LEFT JOIN attempts a ON a.question_id = q.id AND a.user_id = $1
            WHERE a.id IS NOT NULL
            GROUP BY c.id, c.name, s.name
            HAVING COUNT(DISTINCT a.question_id) > 0
            ORDER BY accuracy ASC NULLS FIRST, attempted DESC
            LIMIT 5`,
            [studentId]
        );

        // Get recent mistakes (last 10 wrong attempts)
        const recentMistakes = await db.query(
            `SELECT 
                q.id as question_id,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.explanation,
                a.user_answer,
                a.attempted_at,
                c.name as chapter_name,
                s.name as subject_name
            FROM attempts a
            JOIN questions q ON a.question_id = q.id
            JOIN chapters c ON q.chapter_id = c.id
            JOIN subjects s ON c.subject_id = s.id
            WHERE a.user_id = $1 AND a.is_correct = false
            ORDER BY a.attempted_at DESC
            LIMIT 10`,
            [studentId]
        );

        res.status(200).json({
            status: 'success',
            data: {
                weakChapters: weakChapters.rows,
                recentMistakes: recentMistakes.rows
            }
        });
    });

    // Send notification to student
    sendNotification = catchAsync(async (req, res, next) => {
        const { studentId, message } = req.body;
        const teacherId = req.user.id;

        if (!studentId || !message) {
            return next(new AppError('Student ID and message are required', 400));
        }

        // Verify relationship
        const relationship = await db.query(
            'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
            [studentId, teacherId]
        );

        if (relationship.rows.length === 0) {
            return next(new AppError('This student does not follow you', 403));
        }

        // Create notification (we'll use messages table for now)
        const result = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [teacherId, studentId, message]
        );

        // Emit socket event if available
        if (req.app.get('io')) {
            req.app.get('io').to(studentId).emit('teacher_notification', {
                from: req.user.name,
                message: message,
                timestamp: new Date()
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Notification sent successfully',
            data: {
                notification: result.rows[0]
            }
        });
    });

    // Get doubts/questions shared with teacher
    getDoubts = catchAsync(async (req, res) => {
        const teacherId = req.user.id;

        // Get messages with questions from students who follow this teacher
        const query = `
            SELECT 
                m.id,
                m.content,
                m.question_id,
                m.created_at,
                m.is_read,
                u.id as student_id,
                u.name as student_name,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer,
                q.explanation
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN followers f ON f.follower_id = u.id AND f.following_id = $1
            LEFT JOIN questions q ON m.question_id = q.id
            WHERE m.receiver_id = $1 AND m.question_id IS NOT NULL
            ORDER BY m.created_at DESC
            LIMIT 50
        `;

        const result = await db.query(query, [teacherId]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                doubts: result.rows
            }
        });
    });
}

module.exports = new TeacherController();
