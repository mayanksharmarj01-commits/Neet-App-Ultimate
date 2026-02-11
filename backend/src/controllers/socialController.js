const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class SocialController {
    // Search users by name
    searchUsers = catchAsync(async (req, res, next) => {
        const { query } = req.query;
        const currentUserId = req.user.id;

        if (!query || query.trim().length === 0) {
            return res.status(200).json({
                status: 'success',
                results: 0,
                data: { users: [] }
            });
        }

        const searchQuery = `
            SELECT 
                u.id, 
                u.name, 
                u.email,
                u.xp,
                (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
                EXISTS(
                    SELECT 1 FROM followers 
                    WHERE follower_id = $1 AND following_id = u.id
                ) as is_following
            FROM users u
            WHERE 
                u.id != $1 
                AND LOWER(u.name) LIKE LOWER($2)
            ORDER BY u.xp DESC
            LIMIT 20
        `;

        const result = await db.query(searchQuery, [currentUserId, `%${query}%`]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                users: result.rows
            }
        });
    });

    // Follow a user
    followUser = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        if (userId === currentUserId) {
            return next(new AppError('You cannot follow yourself', 400));
        }

        // Check if already following
        const existing = await db.query(
            'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
            [currentUserId, userId]
        );

        if (existing.rows.length > 0) {
            return next(new AppError('You are already following this user', 400));
        }

        await db.query(
            'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
            [currentUserId, userId]
        );

        res.status(201).json({
            status: 'success',
            message: 'User followed successfully'
        });
    });

    // Unfollow a user
    unfollowUser = catchAsync(async (req, res, next) => {
        const { userId } = req.params;
        const currentUserId = req.user.id;

        const result = await db.query(
            'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2 RETURNING id',
            [currentUserId, userId]
        );

        if (result.rows.length === 0) {
            return next(new AppError('You are not following this user', 400));
        }

        res.status(200).json({
            status: 'success',
            message: 'User unfollowed successfully'
        });
    });

    // Get user's network (people they are following)
    getMyNetwork = catchAsync(async (req, res) => {
        const currentUserId = req.user.id;

        const query = `
            SELECT 
                u.id,
                u.name,
                u.xp,
                f.created_at as followed_at
            FROM followers f
            JOIN users u ON f.following_id = u.id
            WHERE f.follower_id = $1
            ORDER BY f.created_at DESC
        `;

        const result = await db.query(query, [currentUserId]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                network: result.rows
            }
        });
    });

    // Get public profile of a user
    getUserProfile = catchAsync(async (req, res, next) => {
        const { userId } = req.params;

        const profileQuery = `
            SELECT 
                u.id,
                u.name,
                u.xp,
                u.created_at,
                (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
            FROM users u
            WHERE u.id = $1
        `;

        const result = await db.query(profileQuery, [userId]);

        if (result.rows.length === 0) {
            return next(new AppError('User not found', 404));
        }

        // Get weakest subject (lowest progress)
        const weakestSubjectQuery = `
            SELECT 
                s.name as subject_name,
                ROUND(
                    (COUNT(DISTINCT a.question_id)::NUMERIC / NULLIF(COUNT(DISTINCT q.id), 0)) * 100,
                    2
                ) AS progress
            FROM subjects s
            LEFT JOIN chapters c ON s.id = c.subject_id
            LEFT JOIN questions q ON c.id = q.chapter_id
            LEFT JOIN attempts a ON q.id = a.question_id AND a.user_id = $1
            GROUP BY s.id, s.name
            ORDER BY progress ASC NULLS FIRST
            LIMIT 1
        `;

        const weakestResult = await db.query(weakestSubjectQuery, [userId]);

        const profile = {
            ...result.rows[0],
            weakest_subject: weakestResult.rows[0] || null
        };

        res.status(200).json({
            status: 'success',
            data: {
                profile
            }
        });
    });
}

module.exports = new SocialController();
