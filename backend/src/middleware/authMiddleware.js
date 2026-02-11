const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');

module.exports = catchAsync(async (req, res, next) => {
    // 1) Getting token
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists in Firestore
    const userDoc = await db.collection('users').doc(decoded.id).get();
    if (!userDoc.exists) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    req.user = { id: userDoc.id, ...userDoc.data() };
    next();
});
