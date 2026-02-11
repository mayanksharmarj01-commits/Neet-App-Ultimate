const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // FOR DEVELOPMENT: Use a default user if no token provided to avoid blocking progress
    if (!token && process.env.NODE_ENV === 'development') {
        // Attempt to get a dummy user
        const { rows } = await db.query('SELECT id FROM users LIMIT 1');
        if (rows.length > 0) {
            req.user = rows[0];
            return next();
        }
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const { rows } = await db.query('SELECT id, name, email, role, xp, subscription_type, profile_complete, target_year FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    req.user = rows[0];
    next();
});
