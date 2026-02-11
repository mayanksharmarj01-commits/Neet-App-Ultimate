const express = require('express');
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/subjects', contentController.getSubjects);
router.get('/subjects/:subjectId/chapters', contentController.getChaptersBySubject);
router.get('/chapters/:chapterId/breakdown', contentController.getChapterBreakdown);
router.get('/practice', contentController.getPracticeQuestions);

module.exports = router;
