const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    user.password_hash = undefined; // Hide password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
        return next(new AppError('Please provide name, email and password!', 400));
    }

    // 2. Check if user exists
    const checkUser = await db.query('SELECT email FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
        return next(new AppError('Email already exists.', 400));
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // 4. Create new user
    const newUser = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, subscription_type, xp',
        [name, email, hash]
    );

    createSendToken(newUser.rows[0], 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2. Check if user exists & password is correct
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3. Send token
    createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
    // User is already injected by authMiddleware
    const user = req.user;

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.updateMe = catchAsync(async (req, res, next) => {
    const { name, email } = req.body;

    // 1. Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
    }

    // 2. Update user document
    const updatedUser = await db.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role, subscription_type, xp',
        [name, email, req.user.id]
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser.rows[0]
        }
    });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // 1. Get user from collection
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    // 2. Check if POSTed current password is correct
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3. Update password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    // 4. Log user in, send JWT
    const updatedUser = await db.query('SELECT id, name, email, role, subscription_type, xp FROM users WHERE id = $1', [req.user.id]);
    createSendToken(updatedUser.rows[0], 200, res);
});


exports.setupProfile = catchAsync(async (req, res, next) => {
    const { targetYear } = req.body;

    if (!targetYear) {
        return next(new AppError('Please provide a target year.', 400));
    }

    const updatedUser = await db.query(
        'UPDATE users SET target_year = $1, profile_complete = TRUE WHERE id = $2 RETURNING id, name, email, role, subscription_type, xp, target_year, profile_complete',
        [targetYear, req.user.id]
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser.rows[0]
        }
    });
});

// Google Sign-In with Firebase
exports.googleSignIn = catchAsync(async (req, res, next) => {
    const { firebaseToken, email, name, photoURL } = req.body;

    if (!firebaseToken || !email) {
        return next(new AppError('Firebase token and email are required', 400));
    }

    try {
        // For now, we'll trust the frontend Firebase authentication
        // In production, verify the token with Firebase Admin SDK

        // Check if user exists
        let userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user;

        if (userQuery.rows.length === 0) {
            // Create new user
            const newUser = await db.query(
                'INSERT INTO users (name, email, password_hash, profile_picture) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, subscription_type, xp, profile_picture',
                [name, email, 'google-oauth', photoURL || null]
            );
            user = newUser.rows[0];
        } else {
            // User exists, update profile picture if provided
            if (photoURL && !userQuery.rows[0].profile_picture) {
                await db.query(
                    'UPDATE users SET profile_picture = $1 WHERE id = $2',
                    [photoURL, userQuery.rows[0].id]
                );
            }
            user = userQuery.rows[0];
        }

        // Create and send token
        createSendToken(user, 200, res);
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        return next(new AppError('Google authentication failed', 500));
    }
});
