import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Atom, Dna, Activity, ChevronRight, Trophy, Zap, Target, LogOut, Sparkles, User, ArrowRight, Search, MessageCircle, Users, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import UserSearch from '../../components/social/UserSearch';
import Logo from '../../components/common/Logo';
import axiosClient from '../../api/axiosClient';


const SubjectCard = ({ subject, color, icon: Icon, onClick, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer border border-white/10 bg-gradient-to-br ${color} group transition-all duration-500`}
    >
        {/* Animated Background Glow */}
        <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
                background: `radial-gradient(circle at 50% 50%, ${subject.glowColor}, transparent 70%)`
            }}
        />

        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12">
            <Icon size={120} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20"
                >
                    <Icon size={28} className="text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-white mb-1">{subject.name}</h3>
                <p className="text-white/60 text-sm font-medium">{subject.totalQs} Questions</p>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40">Progress</span>
                    <span className="text-lg font-bold text-white">{subject.progress}%</span>
                    {/* Progress Bar */}
                    <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.progress}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 1, ease: "easeOut" }}
                            className="h-full bg-white rounded-full translate-x-0"
                        />
                    </div>
                </div>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
                >
                    <ChevronRight size={24} />
                </motion.div>
            </div>
        </div>
    </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="glass-card p-6 border border-white/10"
    >
        <div className="flex items-center gap-4">
            <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}
            >
                <Icon className="w-7 h-7 text-white" />
            </motion.div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
            </div>
        </div>
    </motion.div>
);

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [greeting, setGreeting] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [subjectError, setSubjectError] = useState(null);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    // Fetch real subject data
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setSubjectError(null);
                const response = await axiosClient.get('/content/subjects');
                const subjectsData = response.data.data.subjects;

                // Map subjects with proper icons and colors
                const subjectConfig = {
                    Physics: { icon: Atom, color: 'from-orange-500/20 to-orange-600/5 hover:from-orange-500/30 hover:to-orange-600/10', glowColor: 'rgba(249, 115, 22, 0.3)' },
                    Chemistry: { icon: Activity, color: 'from-blue-500/20 to-blue-600/5 hover:from-blue-500/30 hover:to-blue-600/10', glowColor: 'rgba(59, 130, 246, 0.3)' },
                    Botany: { icon: Book, color: 'from-green-500/20 to-green-600/5 hover:from-green-500/30 hover:to-green-600/10', glowColor: 'rgba(34, 197, 94, 0.3)' },
                    Zoology: { icon: Dna, color: 'from-pink-500/20 to-pink-600/5 hover:from-pink-500/30 hover:to-pink-600/10', glowColor: 'rgba(236, 72, 153, 0.3)' }
                };

                const mappedSubjects = subjectsData.map(subject => ({
                    ...subject,
                    totalQs: subject.total_questions || 0,
                    progress: Math.round(parseFloat(subject.progress) || 0),
                    ...(subjectConfig[subject.name] || { icon: Book, color: 'from-slate-500/20 to-slate-600/5', glowColor: 'rgba(100, 116, 139, 0.3)' })
                }));

                setSubjects(mappedSubjects);
            } catch (error) {
                console.error('Failed to fetch subjects:', error);
                setSubjectError(error.response?.data?.message || 'Failed to load subjects. Please try again.');
                toast.error('Could not load subjects. Please refresh the page.');
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, []);



    // Dynamic stats - only show real data
    const stats = [
        { icon: Trophy, label: 'Total XP', value: user?.xp || '0', color: 'from-amber-500 to-orange-500' },
        // Remove hardcoded streak and accuracy for now - these should come from backend
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Check if user is new (XP is 0 and no attempts)
    const isNewUser = (user?.xp || 0) === 0;

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.08, 0.15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-500 to-blue-600 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-indigo-600 to-purple-600 rounded-full blur-[120px]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4"
                >
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <h1 className="text-3xl md:text-4xl font-black text-white">
                                {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">{user?.name || 'Aspirant'}</span>
                            </h1>
                            <motion.div
                                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                                👋
                            </motion.div>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-slate-400"
                        >
                            Your NEET preparation journey starts here 🚀
                        </motion.p>
                    </div>

                    <div className="flex gap-3">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSearch(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-300 hover:text-white transition-all"
                        >
                            <Search className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Find Friends</span>
                        </motion.button>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/chat')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-300 hover:text-white transition-all"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Messages</span>
                        </motion.button>

                        {/* Teacher Dashboard Button */}
                        {user?.role === 'teacher' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.32 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/teacher/dashboard')}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:text-white transition-all"
                            >
                                <Users className="w-5 h-5" />
                                <span className="font-semibold hidden sm:inline">My Students</span>
                            </motion.button>
                        )}

                        {/* Admin Dashboard Button */}
                        {user?.role === 'admin' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.32 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admin/questions')}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 hover:text-white transition-all"
                            >
                                <FileQuestion className="w-5 h-5" />
                                <span className="font-semibold hidden sm:inline">Manage Questions</span>
                            </motion.button>
                        )}

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all"
                        >
                            <User className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Profile</span>
                        </motion.button>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-semibold hidden sm:inline">Logout</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* New User Hero Section */}
                {isNewUser && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-sky-900/40 to-indigo-900/40 border border-sky-500/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                <Logo size="lg" className="shadow-2xl shadow-sky-500/20" />
                                <h2 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">Welcome to the Academy, {user?.name}! 🚀</h2>
                            </div>
                            <p className="text-slate-300 text-lg mb-6 max-w-2xl">
                                Your journey to AIIMS and IIT starts now. Select a subject below to begin your first diagnostic drill.
                                We'll track your progress and personalize your path.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="btn-premium flex items-center gap-2 cursor-pointer">
                                    Start Learning <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Grid - Hide if new user, or show simplistic view */}
                {!isNewUser && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        {stats.map((stat, index) => (
                            <StatCard key={stat.label} {...stat} index={index} />
                        ))}
                    </div>
                )}

                {/* Subjects Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                        <Book className="w-6 h-6 text-sky-400" />
                        Your Subjects
                    </h2>

                    {subjectError && (
                        <div className="text-center py-12 glass-card border border-red-500/20">
                            <p className="text-red-400 mb-4">{subjectError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-premium"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!isLoadingSubjects && subjects.length === 0 && !subjectError && (
                        <div className="text-center py-12 glass-card border border-amber-500/20">
                            <p className="text-amber-400 mb-2 font-bold">No subjects available</p>
                            <p className="text-slate-400 text-sm mb-4">The database may need to be seeded. Please contact support or check the backend logs.</p>
                        </div>
                    )}

                    {!subjectError && subjects.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {subjects.map((sub, index) => (
                                <SubjectCard
                                    key={sub.id}
                                    subject={sub}
                                    color={sub.color}
                                    icon={sub.icon}
                                    index={index}
                                    onClick={() => navigate(`/subjects/${sub.id}/chapters`)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Quick Continue Section - Only for users with progress */}
                {!isNewUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-16"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Continue Learning
                        </h2>
                        <motion.div
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-white/10 transition-all border border-white/10 gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/30 to-orange-600/10 flex items-center justify-center text-orange-400 border border-orange-500/20"
                                >
                                    <Atom size={32} />
                                </motion.div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">Electrostatics</h4>
                                    <p className="text-slate-400 text-sm">Physics • Class 12</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-white">24</span>
                                    <span className="text-slate-500 ml-1">/ 120 Qs</span>
                                    <div className="w-32 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '20%' }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                        />
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-slate-400" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* User Search Modal */}
            <AnimatePresence>
                {showSearch && <UserSearch onClose={() => setShowSearch(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default Home;
