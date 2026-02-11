import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Toaster, toast } from 'react-hot-toast';

const SetupProfile = () => {
    const { user, setupProfile, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const [targetYear, setTargetYear] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetYear) {
            toast.error('Please select your target year');
            return;
        }

        const result = await setupProfile(parseInt(targetYear));
        if (result.success) {
            toast.success('Profile setup complete! Welcome aboard! 🚀');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } else {
            toast.error(result.message || 'Setup failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-4">
            <Toaster position="top-right" />

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-card p-8 relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-20 h-20 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-primary-500/20"
                    >
                        <UserCheck className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-white mb-2">Welcome, {user?.name}!</h1>
                    <p className="text-slate-400">Let's personalize your learning path.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-4 text-center">
                            When are you targeting NEET?
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {[2025, 2026].map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => setTargetYear(year)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${targetYear === year
                                            ? 'border-primary-500 bg-primary-500/10 text-white shadow-lg shadow-primary-500/20'
                                            : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                                        }`}
                                >
                                    <Target className={targetYear === year ? 'text-primary-400' : 'text-slate-500'} />
                                    <span className="font-bold text-lg">{year}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !targetYear}
                        className="btn-premium w-full flex items-center justify-center gap-2 py-4 text-lg group"
                    >
                        {isLoading ? 'Setting up...' : 'Start Learning'}
                        {!isLoading && <ArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default SetupProfile;
