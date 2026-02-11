import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Key, Check, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Toaster, toast } from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile, updatePassword, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('general'); // general, security

    // Form States
    const [generalForm, setGeneralForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        const result = await updateProfile(generalForm.name, generalForm.email);
        if (result.success) {
            toast.success('Profile updated successfully! ✨');
        } else {
            toast.error(result.message || 'Update failed');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
        if (result.success) {
            toast.success('Password changed securely! 🔒');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            toast.error(result.message || 'Password update failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 md:px-6 py-8 md:py-12 relative overflow-hidden">
            <Toaster position="top-right" />

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2">Account Settings</h1>
                    <p className="text-slate-400">Manage your profile and security preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="col-span-12 md:col-span-3 space-y-2">
                        {[
                            { id: 'general', icon: User, label: 'General' },
                            { id: 'security', icon: Shield, label: 'Security' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === tab.id
                                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="col-span-12 md:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' ? (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="glass-card p-6 md:p-8"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <User className="text-primary-400" /> Personal Information
                                    </h2>
                                    <form onSubmit={handleGeneralSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={generalForm.name}
                                                    onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    value={generalForm.email}
                                                    onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-premium w-full md:w-auto flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="glass-card p-6 md:p-8"
                                >
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Lock className="text-primary-400" /> Change Password
                                    </h2>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">Current Password</label>
                                            <div className="relative">
                                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                    <input
                                                        type="password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                                                        placeholder="At least 6 chars"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
                                                <div className="relative">
                                                    <Check className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                                    <input
                                                        type="password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                                                        placeholder="Repeat password"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="btn-premium w-full md:w-auto flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
