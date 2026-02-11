import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, SortAsc, AlertCircle, ArrowLeft, BookOpen, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Toaster, toast } from 'react-hot-toast';

const SubjectDashboard = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [subjectName, setSubjectName] = useState('Subject'); // Placeholder
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('default'); // default, progress, name

    useEffect(() => {
        const fetchChapters = async () => {
            setIsLoading(true);
            try {
                const response = await axiosClient.get(`/subjects/${subjectId}/chapters`);
                const data = response.data.data.chapters;
                setChapters(data);
                if (data.length > 0) {
                    setSubjectName(data[0].subject_name);
                } else {
                    // Fallback if no chapters (rare but possible)
                    // We might want to fetch subject details separately if list is empty, 
                    // but usually subjects have chapters.
                    setSubjectName('Subject Details');
                }
            } catch (error) {
                console.error("Failed to fetch chapters:", error);
                toast.error("Could not load chapters.");
            } finally {
                setIsLoading(false);
            }
        };

        if (subjectId) {
            fetchChapters();
        }
    }, [subjectId]);

    // Filtering Logic
    const filteredChapters = chapters.filter(chapter => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'weak') return parseFloat(chapter.progress) < 30 && parseFloat(chapter.progress) > 0; // Example logic for weak
        if (activeFilter === 'not-started') return parseFloat(chapter.progress) === 0;
        if (activeFilter === 'completed') return parseFloat(chapter.progress) === 100;
        if (activeFilter === 'class-12') return chapter.class_level === 12;
        if (activeFilter === 'class-11') return chapter.class_level === 11;
        return true;
    });

    // Sorting Logic
    const sortedChapters = [...filteredChapters].sort((a, b) => {
        if (sortOrder === 'progress') return parseFloat(b.progress) - parseFloat(a.progress);
        if (sortOrder === 'name') return a.name.localeCompare(b.name);
        return a.id - b.id; // Default by ID
    });

    const overallProgress = chapters.length > 0
        ? Math.round(chapters.reduce((acc, curr) => acc + parseFloat(curr.progress || 0), 0) / chapters.length)
        : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="mb-10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                        >
                            {isLoading ? 'Loading...' : subjectName}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 flex items-center gap-2"
                        >
                            <BookOpen size={16} className="text-primary-400" />
                            <span>{chapters.length} Chapters</span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full" />
                            <span>{overallProgress}% Mastered</span>
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'class-11', label: 'Class 11' },
                        { id: 'class-12', label: 'Class 12' },
                        { id: 'weak', label: 'Weak Topics' },
                        { id: 'not-started', label: 'Unattempted' }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeFilter === filter.id
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder(prev => prev === 'default' ? 'progress' : prev === 'progress' ? 'name' : 'default')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/50 text-slate-300 hover:text-white transition-colors border border-white/10 hover:border-white/20 backdrop-blur-sm"
                    >
                        <SortAsc size={18} />
                        <span className="text-sm font-bold">
                            {sortOrder === 'default' ? 'Default' : sortOrder === 'progress' ? 'Progress' : 'Name'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse border border-white/5" />
                    ))}
                </div>
            )}

            {/* Chapter List */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedChapters.map((chapter, index) => (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, y: -2 }}
                            onClick={() => navigate(`/chapters/${chapter.id}`)}
                            className="group glass-card p-5 cursor-pointer hover:border-primary-500/30 transition-all border-l-4 border-l-transparent hover:border-l-primary-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <BookOpen size={80} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${chapter.class_level === 12
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            }`}>
                                            {chapter.class_level}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                                                {chapter.name}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Check size={12} />
                                                    {chapter.completed_questions || 0}/{chapter.total_questions || 0} Qs
                                                </span>
                                                {parseFloat(chapter.progress) < 30 && parseFloat(chapter.progress) > 0 && (
                                                    <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                                        <AlertCircle size={10} /> Focus Needed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className={`text-2xl font-black ${parseFloat(chapter.progress) === 100 ? 'text-green-400' : 'text-slate-200'
                                            }`}>
                                            {chapter.progress || 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${chapter.progress || 0}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${parseFloat(chapter.progress) >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-600 to-primary-400'
                                            }`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {sortedChapters.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <p className="text-lg">No chapters found for this filter.</p>
                            <button
                                onClick={() => setActiveFilter('all')}
                                className="mt-4 text-primary-400 hover:text-primary-300 font-bold"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubjectDashboard;
