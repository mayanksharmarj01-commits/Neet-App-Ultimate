import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosClient.post('/auth/login', { email, password });
            const { token, data } = response.data;

            localStorage.setItem('token', token);
            set({
                user: data.user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Login failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message };
        }
    },

    register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosClient.post('/auth/signup', { name, email, password });
            const { token, data } = response.data;

            localStorage.setItem('token', token);
            set({
                user: data.user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message };
        }
    },

    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.get('/auth/me');
            set({
                user: response.data.data.user,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (err) {
            localStorage.removeItem('token');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    updateProfile: async (name, email) => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.patch('/auth/updateMe', { name, email });
            set({
                user: response.data.data.user,
                isLoading: false
            });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Update failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message };
        }
    },

    updatePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.patch('/auth/updatePassword', { currentPassword, newPassword });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                set({ token: response.data.token });
            }
            set({ isLoading: false });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Password update failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message };
        }
    },

    // Google Sign-In with Firebase
    googleSignIn: async () => {
        set({ isLoading: true, error: null });
        try {
            // Sign in with Google popup
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Get Firebase ID token
            const firebaseToken = await firebaseUser.getIdToken();

            // Send to backend for verification and user creation/login
            const response = await axiosClient.post('/auth/google-signin', {
                firebaseToken,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL
            });

            const { token, data } = response.data;

            localStorage.setItem('token', token);
            set({
                user: data.user,
                token,
                isAuthenticated: true,
                isLoading: false
            });

            return { success: true };
        } catch (err) {
            console.error('Google sign-in error:', err);
            set({
                error: err.response?.data?.message || err.message || 'Google sign-in failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message || err.message };
        }
    },

    setupProfile: async (targetYear) => {
        set({ isLoading: true });
        try {
            const response = await axiosClient.patch('/auth/setupProfile', { targetYear });
            set({
                user: response.data.data.user,
                isLoading: false
            });
            return { success: true };
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Profile setup failed',
                isLoading: false
            });
            return { success: false, message: err.response?.data?.message };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
