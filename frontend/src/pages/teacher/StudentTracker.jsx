import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingDown, AlertCircle, Send, ArrowLeft, MessageSquare, Trophy, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosClient';
import { Toaster, toast } from 'react-hot-toast';

const StudentTracker = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [doubts, setDoubts] = useState([]);
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, doubts
    const [notificationMessage, setNotificationMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
        fetchDoubts();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchStudentAnalytics(selectedStudent.id);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/teacher/students');
            setStudents(response.data.data.students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        }
    };

    const fetchStudentAnalytics = async (studentId) => {
        setLoading(true);
        try {
            const response = await axios.get(`/teacher/students/${studentId}/analytics`);
            setAnalytics(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoubts = async () => {
        try {
            const response = await axios.get('/teacher/doubts');
            setDoubts(response.data.data.doubts);
        } catch (error) {
            console.error('Failed to fetch doubts:', error);
        }
    };

    const sendNotification = async () => {
        if (!notificationMessage.trim() || !selectedStudent) return;

        try {
            await axios.post('/teacher/notifications/send', {
                studentId: selectedStudent.id,
                message: notificationMessage
            });
            toast.success('Notification sent! 📧');
            setNotificationMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send notification');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Toaster position="top-right" />

            {/* Sidebar - Students List */}
            <div className="w-80 border-r border-white/10 bg-slate-900/50 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Users className="text-primary-400" />
                        My Students
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{students.length} students</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {students.length === 0 && (
                        <div className="text-center text-slate-500 py-12">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No students yet</p>
                        </div>
                    )}

                    {students.map((student) => (
                        <button
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className={`w-full p-4 rounded-xl transition-all text-left ${selectedStudent?.id === student.id
                                    ? 'bg-primary-500/20 border-2 border-primary-500/40'
                                    : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{student.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Trophy className="w-3 h-3 text-amber-400" />
                                        <span>{student.xp || 0} XP</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {student.total_attempts || 0} attempts • {student.wrong_attempts || 0} mistakes
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {selectedStudent ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-slate-900/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                                    <p className="text-slate-400">{selectedStudent.email}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'analytics'
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        Analytics
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('doubts')}
                                        className={`px-4 py-2 rounded-xl font-bold transition-all ${activeTab === 'doubts'
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        Doubts
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'analytics' && analytics && (
                                    <motion.div
                                        key="analytics"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* Weak Chapters */}
                                        <div className="glass-card p-6">
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <TrendingDown className="text-rose-400" />
                                                Weak Chapters
                                            </h3>
                                            {analytics.weakChapters.length === 0 ? (
                                                <p className="text-slate-500">No data available yet</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {analytics.weakChapters.map((chapter) => (
                                                        <div
                                                            key={chapter.id}
                                                            className="p-4 rounded-xl bg-slate-900/50 border border-white/5"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="font-bold text-white">{chapter.chapter_name}</h4>
                                                                    <p className="text-sm text-slate-400">{chapter.subject_name}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-rose-400">
                                                                        {chapter.accuracy || 0}%
                                                                    </div>
                                                                    <div className="text-xs text-slate-500">
                                                                        {chapter.attempted} attempted
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Recent Mistakes */}
                                        <div className="glass-card p-6">
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <AlertCircle className="text-orange-400" />
                                                Recent Mistakes
                                            </h3>
                                            {analytics.recentMistakes.length === 0 ? (
                                                <p className="text-slate-500">No mistakes recorded</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {analytics.recentMistakes.map((mistake, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-900 hover:border-white/10 transition-all cursor-pointer"
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1">
                                                                    <p className="text-white mb-2">{mistake.question_text}</p>
                                                                    <div className="flex gap-2 text-xs">
                                                                        <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                                                                            {mistake.subject_name}
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-slate-800 rounded text-slate-400">
                                                                            {mistake.chapter_name}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="text-slate-500 flex-shrink-0" />
                                                            </div>
                                                            <div className="text-xs text-slate-500 mt-2">
                                                                Student answered: <span className="text-rose-400 font-bold">{mistake.user_answer}</span>
                                                                {' • '}
                                                                Correct: <span className="text-green-400 font-bold">{mistake.correct_answer}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Send Notification */}
                                        <div className="glass-card p-6">
                                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <Send className="text-primary-400" />
                                                Send Notification
                                            </h3>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    value={notificationMessage}
                                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                                    placeholder="e.g., Focus on Optics today"
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                                />
                                                <button
                                                    onClick={sendNotification}
                                                    disabled={!notificationMessage.trim()}
                                                    className="btn-premium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send size={18} />
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'doubts' && (
                                    <motion.div
                                        key="doubts"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="glass-card p-6"
                                    >
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <MessageSquare className="text-indigo-400" />
                                            Student Doubts
                                        </h3>
                                        {doubts.length === 0 ? (
                                            <div className="text-center text-slate-500 py-12">
                                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>No doubts shared yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {doubts.map((doubt) => (
                                                    <div
                                                        key={doubt.id}
                                                        className="p-4 rounded-xl bg-slate-900/50 border border-white/5"
                                                    >
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                                {doubt.student_name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-white">{doubt.student_name}</h4>
                                                                <p className="text-sm text-slate-400">{doubt.content}</p>
                                                            </div>
                                                        </div>
                                                        {doubt.question_text && (
                                                            <div className="mt-3 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                                                                <p className="text-sm text-white">{doubt.question_text}</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3 text-xs text-slate-500">
                                                            {new Date(doubt.created_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <Users className="w-20 h-20 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Select a student to view analytics</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTracker;
