const express = require('express');
const socialController = require('../controllers/socialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search users
router.get('/search', socialController.searchUsers);

// Follow/Unfollow
router.post('/follow/:userId', socialController.followUser);
router.delete('/unfollow/:userId', socialController.unfollowUser);

// Get network (people I follow)
router.get('/network', socialController.getMyNetwork);

// Get public profile
router.get('/profile/:userId', socialController.getUserProfile);

module.exports = router;
