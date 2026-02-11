// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACPgX2jqKNNGgwYPaCvJzaJkx26jevS34",
    authDomain: "neetu-jee.firebaseapp.com",
    projectId: "neetu-jee",
    storageBucket: "neetu-jee.firebasestorage.app",
    messagingSenderId: "993209842120",
    appId: "1:993209842120:web:e2dc4c5a95a4a04b4aa8fd",
    measurementId: "G-N9ZD4B1273"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Initialize Analytics (optional, only in production)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
