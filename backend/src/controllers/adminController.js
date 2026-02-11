const { db } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class AdminController {
    getQuestionMetadata = catchAsync(async (req, res) => {
        const subjectsSnapshot = await db.collection('subjects').orderBy('name').get();
        const chaptersSnapshot = await db.collection('chapters').orderBy('name').get();

        let topics = [];
        try {
            const topicsSnapshot = await db.collection('topics').orderBy('name').get();
            topics = topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            // topics collection may not exist
        }

        res.status(200).json({
            status: 'success',
            data: {
                subjects: subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                chapters: chaptersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                topics
            }
        });
    });

    addQuestion = catchAsync(async (req, res, next) => {
        const {
            chapterId, topicId, questionType, questionText,
            optionA, optionB, optionC, optionD,
            correctAnswer, explanation, difficulty, imageUrl
        } = req.body;

        if (!chapterId) return next(new AppError('Chapter ID is required.', 400));
        if (!questionText || questionText.trim() === '') return next(new AppError('Question text is required.', 400));
        if (!optionA?.trim()) return next(new AppError('Option A is required.', 400));
        if (!optionB?.trim()) return next(new AppError('Option B is required.', 400));
        if (!optionC?.trim()) return next(new AppError('Option C is required.', 400));
        if (!optionD?.trim()) return next(new AppError('Option D is required.', 400));
        if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            return next(new AppError('Correct answer must be A, B, C, or D.', 400));
        }

        const questionData = {
            chapter_id: chapterId,
            topic_id: topicId || null,
            type: questionType || 'MCQ',
            question_text: questionText,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer,
            explanation: explanation || '',
            difficulty: difficulty || 'medium',
            image_url: imageUrl || null,
            created_by: req.user.id,
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('questions').add(questionData);

        res.status(201).json({
            status: 'success',
            data: { question: { id: docRef.id, ...questionData } }
        });
    });

    bulkUploadQuestions = catchAsync(async (req, res, next) => {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return next(new AppError('Please provide an array of questions', 400));
        }

        const batch = db.batch();
        const insertedIds = [];

        for (const q of questions) {
            const docRef = db.collection('questions').doc();
            batch.set(docRef, {
                chapter_id: q.chapterId,
                topic_id: q.topicId || null,
                type: q.questionType || 'MCQ',
                question_text: q.questionText,
                option_a: q.optionA,
                option_b: q.optionB,
                option_c: q.optionC,
                option_d: q.optionD,
                correct_answer: q.correctAnswer,
                explanation: q.explanation || '',
                difficulty: q.difficulty || 'medium',
                image_url: q.imageUrl || null,
                created_by: req.user.id,
                created_at: new Date().toISOString()
            });
            insertedIds.push(docRef.id);
        }

        await batch.commit();

        res.status(201).json({
            status: 'success',
            message: `Successfully uploaded ${insertedIds.length} questions`,
            data: { count: insertedIds.length }
        });
    });

    getAllQuestions = catchAsync(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;

        const questionsSnapshot = await db.collection('questions')
            .orderBy('created_at', 'desc')
            .limit(parseInt(limit))
            .get();

        const questions = [];
        for (const doc of questionsSnapshot.docs) {
            const q = { id: doc.id, ...doc.data() };

            // Get chapter and subject names
            if (q.chapter_id) {
                const chapterDoc = await db.collection('chapters').doc(q.chapter_id).get();
                if (chapterDoc.exists) {
                    q.chapter_name = chapterDoc.data().name;
                    const subjectDoc = await db.collection('subjects').doc(chapterDoc.data().subject_id).get();
                    if (subjectDoc.exists) {
                        q.subject_name = subjectDoc.data().name;
                    }
                }
            }
            questions.push(q);
        }

        res.status(200).json({
            status: 'success',
            results: questions.length,
            data: { questions }
        });
    });
}

module.exports = new AdminController();
