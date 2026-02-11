const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/send', messageController.sendMessage);

// Get conversations list
router.get('/conversations', messageController.getConversations);

// Get conversation with specific user
router.get('/conversation/:userId', messageController.getConversation);

module.exports = router;
