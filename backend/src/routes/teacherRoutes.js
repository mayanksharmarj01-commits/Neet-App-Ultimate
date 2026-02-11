const express = require('express');
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');

const router = express.Router();

// Middleware to check teacher role
const requireTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return next(new AppError('Access denied. Teacher only.', 403));
    }
    next();
};

// All routes require authentication and teacher role
router.use(authMiddleware);
router.use(requireTeacher);

// Get my students
router.get('/students', teacherController.getMyStudents);

// Get student analytics
router.get('/students/:studentId/analytics', teacherController.getStudentAnalytics);

// Send notification to student
router.post('/notifications/send', teacherController.sendNotification);

// Get doubts
router.get('/doubts', teacherController.getDoubts);

module.exports = router;
