const { db } = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class SocialController {
    searchUsers = catchAsync(async (req, res) => {
        const { query } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.trim().length === 0) {
            return res.status(200).json({
                status: 'success',
                results: 0,
                data: { users: [] }
            });
        }

        // Firestore doesn't support LIKE queries - use range query on name
        const searchLower = query.toLowerCase();
        const usersSnapshot = await db.collection('users')
            .orderBy('name')
            .get();

        const users = [];
        for (const doc of usersSnapshot.docs) {
            if (doc.id === currentUserId) continue;
            const userData = doc.data();
            if (userData.name && userData.name.toLowerCase().includes(searchLower)) {
                // Check following status
                const followDoc = await db.collection('followers')
                    .where('follower_id', '==', currentUserId)
                    .where('following_id', '==', doc.id)
                    .limit(1)
                    .get();

                users.push({
                    id: doc.id,
                    name: userData.name,
                    email: userData.email,
                    xp: userData.xp || 0,
                    profile_picture: userData.profile_picture,
                    is_following: !followDoc.empty
                });
            }
            if (users.length >= 20) break;
        }

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    });

    followUser = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return next(new AppError('You cannot follow yourself', 400));
        }

        const existing = await db.collection('followers')
            .where('follower_id', '==', currentUserId)
            .where('following_id', '==', userId)
            .limit(1)
            .get();

        if (!existing.empty) {
            return next(new AppError('You are already following this user', 400));
        }

        await db.collection('followers').add({
            follower_id: currentUserId,
            following_id: userId,
            created_at: new Date().toISOString()
        });

        res.status(201).json({
            status: 'success',
            message: 'User followed successfully'
        });
    });

    unfollowUser = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const snapshot = await db.collection('followers')
            .where('follower_id', '==', currentUserId)
            .where('following_id', '==', userId)
            .get();

        if (snapshot.empty) {
            return next(new AppError('You are not following this user', 400));
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({
            status: 'success',
            message: 'User unfollowed successfully'
        });
    });

    getMyNetwork = catchAsync(async (req, res) => {
        const currentUserId = req.user.id;

        const followingSnapshot = await db.collection('followers')
            .where('follower_id', '==', currentUserId)
            .orderBy('created_at', 'desc')
            .get();

        const network = [];
        for (const doc of followingSnapshot.docs) {
            const followData = doc.data();
            const userDoc = await db.collection('users').doc(followData.following_id).get();
            if (userDoc.exists) {
                network.push({
                    id: userDoc.id,
                    name: userDoc.data().name,
                    xp: userDoc.data().xp || 0,
                    profile_picture: userDoc.data().profile_picture,
                    followed_at: followData.created_at
                });
            }
        }

        res.status(200).json({
            status: 'success',
            results: network.length,
            data: { network }
        });
    });

    getUserProfile = catchAsync(async (req, res, next) => {
        const { userId } = req.params;

        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError('User not found', 404));
        }

        const followersSnapshot = await db.collection('followers')
            .where('following_id', '==', userId).get();
        const followingSnapshot = await db.collection('followers')
            .where('follower_id', '==', userId).get();

        const profile = {
            id: userDoc.id,
            name: userDoc.data().name,
            xp: userDoc.data().xp || 0,
            created_at: userDoc.data().created_at,
            followers_count: followersSnapshot.size,
            following_count: followingSnapshot.size
        };

        res.status(200).json({
            status: 'success',
            data: { profile }
        });
    });
}

module.exports = new SocialController();
