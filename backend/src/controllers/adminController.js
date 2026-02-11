const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class AdminController {
    // Get subjects, chapters, and topics for cascading dropdowns
    getQuestionMetadata = catchAsync(async (req, res) => {
        const subjects = await db.query('SELECT id, name FROM subjects ORDER BY name');
        const chapters = await db.query('SELECT id, subject_id, name FROM chapters ORDER BY name');
        const topics = await db.query('SELECT id, chapter_id, name FROM topics ORDER BY name');

        res.status(200).json({
            status: 'success',
            data: {
                subjects: subjects.rows,
                chapters: chapters.rows,
                topics: topics.rows
            }
        });
    });

    // Add a single question
    addQuestion = catchAsync(async (req, res, next) => {
        const {
            chapterId,
            topicId,
            questionType,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            explanation,
            difficulty,
            imageUrl
        } = req.body;

        // Detailed validation with specific error messages
        if (!chapterId) {
            return next(new AppError('Chapter ID is required. Please select a chapter.', 400));
        }

        if (!questionText || questionText.trim() === '') {
            return next(new AppError('Question text is required and cannot be empty.', 400));
        }

        if (!optionA || optionA.trim() === '') {
            return next(new AppError('Option A is required and cannot be empty.', 400));
        }

        if (!optionB || optionB.trim() === '') {
            return next(new AppError('Option B is required and cannot be empty.', 400));
        }

        if (!optionC || optionC.trim() === '') {
            return next(new AppError('Option C is required and cannot be empty.', 400));
        }

        if (!optionD || optionD.trim() === '') {
            return next(new AppError('Option D is required and cannot be empty.', 400));
        }

        if (!correctAnswer) {
            return next(new AppError('Correct answer is required. Please select A, B, C, or D.', 400));
        }

        // Validate correct answer is one of A, B, C, D
        if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            return next(new AppError('Correct answer must be A, B, C, or D.', 400));
        }

        // Log what we're inserting for debugging
        console.log('📝 Inserting question:', {
            chapterId,
            topicId: topicId || 'null',
            questionType: questionType || 'MCQ',
            questionText: questionText.substring(0, 50) + '...',
            correctAnswer,
            difficulty: difficulty || 'medium'
        });

        const result = await db.query(
            `INSERT INTO questions 
            (chapter_id, topic_id, type, question_text, option_a, option_b, option_c, option_d, 
             correct_answer, explanation, difficulty, image_url, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [chapterId, topicId || null, questionType || 'MCQ', questionText, optionA, optionB, optionC, optionD,
                correctAnswer, explanation || '', difficulty || 'medium', imageUrl || null, req.user.id]
        );

        console.log('✅ Question inserted successfully, ID:', result.rows[0].id);

        res.status(201).json({
            status: 'success',
            data: {
                question: result.rows[0]
            }
        });
    });

    // Bulk upload questions from JSON
    bulkUploadQuestions = catchAsync(async (req, res, next) => {
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return next(new AppError('Please provide an array of questions', 400));
        }

        const insertedQuestions = [];

        // Use transaction for bulk insert
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            for (const q of questions) {
                const result = await client.query(
                    `INSERT INTO questions 
                    (chapter_id, topic_id, type, question_text, option_a, option_b, option_c, option_d, 
                     correct_answer, explanation, difficulty, image_url, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id`,
                    [q.chapterId, q.topicId || null, q.questionType || 'MCQ', q.questionText, q.optionA, q.optionB,
                    q.optionC, q.optionD, q.correctAnswer, q.explanation || '',
                    q.difficulty || 'medium', q.imageUrl || null, req.user.id]
                );
                insertedQuestions.push(result.rows[0]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        res.status(201).json({
            status: 'success',
            message: `Successfully uploaded ${insertedQuestions.length} questions`,
            data: {
                count: insertedQuestions.length
            }
        });
    });

    // Get all questions (with pagination)
    getAllQuestions = catchAsync(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await db.query(
            `SELECT q.*, c.name as chapter_name, s.name as subject_name
             FROM questions q
             JOIN chapters c ON q.chapter_id = c.id
             JOIN subjects s ON c.subject_id = s.id
             ORDER BY q.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await db.query('SELECT COUNT(*) FROM questions');

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            total: parseInt(countResult.rows[0].count),
            data: {
                questions: result.rows
            }
        });
    });
}

module.exports = new AdminController();
