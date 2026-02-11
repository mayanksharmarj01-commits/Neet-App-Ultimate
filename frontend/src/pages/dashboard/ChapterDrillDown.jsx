import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, RefreshCw, BarChart2, BookOpen, AlertOctagon, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChapterDetails = () => {
    const navigate = useNavigate();
    // Mock data for Electrostatics (matching the request)
    const chapter = {
        name: 'Electrostatics',
        subject: 'Physics',
        buckets: [
            { id: 1, name: 'Standard MCQ', count: 120, icon: <HelpCircle size={32} className="text-orange-400" /> },
            { id: 2, name: 'Assertion Reason', count: 45, icon: <AlertOctagon size={32} className="text-red-400" /> },
            { id: 3, name: 'Diagram Based', count: 30, icon: <BarChart2 size={32} className="text-blue-400" /> },
            { id: 4, name: 'NEET PYQ Trend', count: 15, icon: <TrendingUp size={32} className="text-green-400" /> },
        ]
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
                <span className="text-slate-600">/</span>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/subject/1/chapters')}>Physics</span>
                <span className="text-slate-600">/</span>
                <span className="text-primary-400 font-bold">{chapter.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
                <div>
                    <h1 className="text-5xl font-black text-white mb-2">{chapter.name}</h1>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Master Electric Charges, Fields, and Potentials through our specialized question banks.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/practice/${chapter.name.toLowerCase()}`)}
                        className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black flex items-center gap-3 cursor-pointer shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
                    >
                        <Play fill="currentColor" size={20} />
                        <span>Practice Now</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-4 bg-slate-800 text-slate-300 rounded-xl font-bold flex items-center gap-3 cursor-pointer hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
                    >
                        <RefreshCw size={20} />
                        <span>Revise</span>
                    </motion.div>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {chapter.buckets.map((bucket, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-6 relative overflow-hidden group cursor-pointer hover:border-sidebar-active/50 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-125 duration-500">
                            {bucket.icon}
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                                {bucket.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                                {bucket.name}
                            </h3>
                            <p className="text-sm font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                                {bucket.count} Questions Available
                            </p>
                        </div>

                        <div className="mt-6 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                            <span>Start Drill</span>
                            <div className="w-4 h-4 ml-2 rounded-full border border-slate-600 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detailed Stats */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-green-400" />
                        Performance Trend
                    </h3>
                    <div className="h-48 w-full bg-slate-900/50 rounded-xl flex items-center justify-center text-slate-500 border border-dashed border-slate-700">
                        [Chart Area Placeholder]
                    </div>
                </div>

                <div className="glass-card p-8 bg-gradient-to-b from-indigo-900/20 to-transparent border-indigo-500/20">
                    <h3 className="text-xl font-bold text-white mb-4">Your Weakness</h3>
                    <p className="text-slate-400 text-sm mb-6">
                        You frequently mistake <span className="text-red-400 font-bold">Electric Dipole</span> derivations.
                    </p>
                    <button className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-500/25">
                        Fix This Topic
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChapterDetails;
