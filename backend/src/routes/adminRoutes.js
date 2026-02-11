const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const AppError = require('../utils/appError');

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin only.', 403));
    }
    next();
};

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Get metadata for question form
router.get('/question-metadata', adminController.getQuestionMetadata);

// Add single question
router.post('/questions', adminController.addQuestion);

// Bulk upload questions
router.post('/questions/bulk', adminController.bulkUploadQuestions);

// Get all questions
router.get('/questions', adminController.getAllQuestions);

module.exports = router;
