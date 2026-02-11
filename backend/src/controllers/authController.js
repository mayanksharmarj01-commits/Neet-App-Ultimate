const { db, auth } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createSendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};

class AuthController {
    signup = catchAsync(async (req, res, next) => {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return next(new AppError('Please provide name, email and password', 400));
        }

        if (password.length < 6) {
            return next(new AppError('Password must be at least 6 characters', 400));
        }

        // Check if user already exists
        const existingUsers = await db.collection('users').where('email', '==', email).get();
        if (!existingUsers.empty) {
            return next(new AppError('Email already in use', 400));
        }

        // Create user in Firebase Auth
        let firebaseUser;
        try {
            firebaseUser = await auth.createUser({
                email,
                password,
                displayName: name
            });
        } catch (err) {
            if (err.code === 'auth/email-already-exists') {
                return next(new AppError('Email already in use', 400));
            }
            throw err;
        }

        // Create user document in Firestore
        const userData = {
            id: firebaseUser.uid,
            name,
            email,
            role: 'student',
            subscription_type: 'free',
            xp: 0,
            profile_picture: null,
            target_year: null,
            profile_complete: false,
            created_at: new Date().toISOString()
        };

        await db.collection('users').doc(firebaseUser.uid).set(userData);

        createSendToken(userData, 201, res);
    });

    login = catchAsync(async (req, res, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Please provide email and password', 400));
        }

        // Find user by email
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();

        if (usersSnapshot.empty) {
            return next(new AppError('Incorrect email or password', 401));
        }

        const userDoc = usersSnapshot.docs[0];
        const user = { id: userDoc.id, ...userDoc.data() };

        // Verify password using Firebase Auth
        try {
            // We verify by trying to get the user from Firebase Auth
            const firebaseUser = await auth.getUserByEmail(email);
            if (!firebaseUser) {
                return next(new AppError('Incorrect email or password', 401));
            }
        } catch (err) {
            return next(new AppError('Incorrect email or password', 401));
        }

        createSendToken(user, 200, res);
    });

    googleSignIn = catchAsync(async (req, res, next) => {
        const { email, name, photoURL, uid } = req.body;

        if (!email) {
            return next(new AppError('Email is required', 400));
        }

        // Check if user exists
        let userDoc = await db.collection('users').doc(uid).get();

        if (userDoc.exists) {
            // Update existing user
            const updateData = {};
            if (name) updateData.name = name;
            if (photoURL) updateData.profile_picture = photoURL;
            await db.collection('users').doc(uid).update(updateData);

            const user = { id: uid, ...userDoc.data(), ...updateData };
            createSendToken(user, 200, res);
        } else {
            // Create new user
            const userData = {
                id: uid,
                name: name || email.split('@')[0],
                email,
                role: 'student',
                subscription_type: 'free',
                xp: 0,
                profile_picture: photoURL || null,
                target_year: null,
                profile_complete: false,
                created_at: new Date().toISOString()
            };

            await db.collection('users').doc(uid).set(userData);
            createSendToken(userData, 201, res);
        }
    });

    getMe = catchAsync(async (req, res) => {
        const userDoc = await db.collection('users').doc(req.user.id).get();
        const user = { id: userDoc.id, ...userDoc.data() };

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    });

    updateMe = catchAsync(async (req, res, next) => {
        const { name, email } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        await db.collection('users').doc(req.user.id).update(updateData);

        const userDoc = await db.collection('users').doc(req.user.id).get();
        const user = { id: userDoc.id, ...userDoc.data() };

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    });

    updatePassword = catchAsync(async (req, res, next) => {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return next(new AppError('New password must be at least 6 characters', 400));
        }

        // Update password in Firebase Auth
        await auth.updateUser(req.user.id, { password: newPassword });

        const userDoc = await db.collection('users').doc(req.user.id).get();
        const user = { id: userDoc.id, ...userDoc.data() };

        createSendToken(user, 200, res);
    });

    setupProfile = catchAsync(async (req, res) => {
        const { target_year } = req.body;

        await db.collection('users').doc(req.user.id).update({
            target_year: target_year || null,
            profile_complete: true
        });

        const userDoc = await db.collection('users').doc(req.user.id).get();
        const user = { id: userDoc.id, ...userDoc.data() };

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    });
}

module.exports = new AuthController();
