import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, TrendingDown, Calendar, MessageCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Toaster, toast } from 'react-hot-toast';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get(`/users/profile/${userId}`);
            setProfile(response.data.data.profile);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center text-slate-400">
                    <p>User not found</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-primary-400 hover:text-primary-300">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-950 px-4 md:px-6 py-8 md:py-12 relative overflow-hidden">
            <Toaster position="top-right" />

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-10"
                >
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-8 border-b border-white/10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-primary-500/20">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-2 -right-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-xl flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-white" />
                                <span className="text-white font-bold">{profile.xp || 0}</span>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-white mb-2">{profile.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>

                            {/* Message Button */}
                            <button
                                onClick={() => navigate('/chat')}
                                className="mt-4 btn-premium flex items-center gap-2 mx-auto md:mx-0"
                            >
                                <MessageCircle size={18} />
                                Send Message
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total XP */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Total XP</p>
                                    <p className="text-2xl font-black text-white">{profile.xp || 0}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Followers */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-primary-500/10 to-indigo-500/10 border border-primary-500/20 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Followers</p>
                                    <p className="text-2xl font-black text-white">{profile.followers_count || 0}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Weakest Subject */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/20 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 font-medium">Weakest Subject</p>
                                    <p className="text-lg font-black text-white truncate">
                                        {profile.weakest_subject?.subject_name || 'N/A'}
                                    </p>
                                    {profile.weakest_subject?.progress !== null && (
                                        <p className="text-xs text-slate-500">
                                            {profile.weakest_subject.progress}% complete
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="mt-8 p-4 bg-slate-900/50 border border-white/5 rounded-xl">
                        <p className="text-xs text-slate-500 text-center">
                            🔒 This is a public profile. Email and phone numbers are kept private.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;
