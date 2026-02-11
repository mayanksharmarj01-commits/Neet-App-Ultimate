const { db } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class ContentController {
  // Get all subjects with user progress
  getSubjects = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const subjectsSnapshot = await db.collection('subjects').orderBy('name').get();

    const subjects = [];
    for (const doc of subjectsSnapshot.docs) {
      const subject = { id: doc.id, ...doc.data() };

      // Get chapters count
      const chaptersSnapshot = await db.collection('chapters')
        .where('subject_id', '==', doc.id).get();

      // Get total questions count
      let totalQuestions = 0;
      let completedQuestions = 0;

      for (const chapterDoc of chaptersSnapshot.docs) {
        const questionsSnapshot = await db.collection('questions')
          .where('chapter_id', '==', chapterDoc.id).get();
        totalQuestions += questionsSnapshot.size;

        // Get user's attempts for these questions
        if (userId) {
          const questionIds = questionsSnapshot.docs.map(q => q.id);
          if (questionIds.length > 0) {
            // Firestore 'in' queries limited to 30, batch them
            for (let i = 0; i < questionIds.length; i += 30) {
              const batch = questionIds.slice(i, i + 30);
              const attemptsSnapshot = await db.collection('attempts')
                .where('user_id', '==', userId)
                .where('question_id', 'in', batch)
                .get();
              completedQuestions += attemptsSnapshot.size;
            }
          }
        }
      }

      const progress = totalQuestions > 0
        ? ((completedQuestions / totalQuestions) * 100).toFixed(2)
        : '0.00';

      subjects.push({
        ...subject,
        total_questions: totalQuestions,
        completed_questions: completedQuestions,
        progress
      });
    }

    res.status(200).json({
      status: 'success',
      results: subjects.length,
      data: { subjects }
    });
  });

  // Get chapters by subject
  getChaptersBySubject = catchAsync(async (req, res, next) => {
    const { subjectId } = req.params;
    const userId = req.user.id;
    const { class_level } = req.query;

    let query = db.collection('chapters').where('subject_id', '==', subjectId);

    if (class_level) {
      query = query.where('class_level', '==', parseInt(class_level));
    }

    const chaptersSnapshot = await query.get();

    const chapters = [];
    for (const doc of chaptersSnapshot.docs) {
      const chapter = { id: doc.id, ...doc.data() };

      // Get questions count
      const questionsSnapshot = await db.collection('questions')
        .where('chapter_id', '==', doc.id).get();
      const totalQuestions = questionsSnapshot.size;

      // Get user progress
      let completedQuestions = 0;
      const questionIds = questionsSnapshot.docs.map(q => q.id);
      if (questionIds.length > 0) {
        for (let i = 0; i < questionIds.length; i += 30) {
          const batch = questionIds.slice(i, i + 30);
          const attemptsSnapshot = await db.collection('attempts')
            .where('user_id', '==', userId)
            .where('question_id', 'in', batch)
            .get();
          completedQuestions += attemptsSnapshot.size;
        }
      }

      const progress = totalQuestions > 0
        ? ((completedQuestions / totalQuestions) * 100).toFixed(2)
        : '0.00';

      // Get chapter progress status
      const progressDoc = await db.collection('chapter_progress')
        .where('user_id', '==', userId)
        .where('chapter_id', '==', doc.id)
        .limit(1)
        .get();

      const status = progressDoc.empty ? 'not_started' : progressDoc.docs[0].data().status;

      chapters.push({
        ...chapter,
        total_questions: totalQuestions,
        completed_questions: completedQuestions,
        progress,
        status
      });
    }

    res.status(200).json({
      status: 'success',
      results: chapters.length,
      data: { chapters }
    });
  });

  // Get chapter breakdown (topics + questions)
  getChapterBreakdown = catchAsync(async (req, res, next) => {
    const { chapterId } = req.params;

    const chapterDoc = await db.collection('chapters').doc(chapterId).get();
    if (!chapterDoc.exists) {
      return next(new AppError('Chapter not found', 404));
    }

    const questionsSnapshot = await db.collection('questions')
      .where('chapter_id', '==', chapterId).get();

    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));

    res.status(200).json({
      status: 'success',
      data: {
        chapter: { id: chapterDoc.id, ...chapterDoc.data() },
        questions
      }
    });
  });

  // Get practice questions
  getPracticeQuestions = catchAsync(async (req, res) => {
    const { chapterId } = req.params;
    const { limit = 10 } = req.query;

    const questionsSnapshot = await db.collection('questions')
      .where('chapter_id', '==', chapterId)
      .limit(parseInt(limit))
      .get();

    const questions = questionsSnapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    }));

    res.status(200).json({
      status: 'success',
      results: questions.length,
      data: { questions }
    });
  });
}

module.exports = new ContentController();
