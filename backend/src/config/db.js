const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

    if (serviceAccount.project_id) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Fallback: try default credentials
        admin.initializeApp();
    }
}

const db = admin.firestore();
const auth = admin.auth();

console.log('✅ Firebase Firestore Connected');

module.exports = { db, auth, admin };
