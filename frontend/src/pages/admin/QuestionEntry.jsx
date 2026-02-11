import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Upload, Plus, List, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Toaster, toast } from 'react-hot-toast';

const QuestionEntry = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('single'); // single, bulk, list
    const [metadata, setMetadata] = useState({ subjects: [], chapters: [], topics: [] });
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        subjectId: '',
        chapterId: '',
        topicId: '',
        questionType: 'MCQ',
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
        difficulty: 'medium',
        imageUrl: ''
    });

    // Bulk upload state
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const response = await axiosClient.get('/admin/question-metadata');
            setMetadata(response.data.data);
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
            toast.error('Failed to load form data');
        }
    };

    const filteredChapters = metadata.chapters.filter(
        ch => ch.subject_id === formData.subjectId
    );

    const filteredTopics = metadata.topics.filter(
        t => t.chapter_id === formData.chapterId
    );


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation before submission
        if (!formData.subjectId) {
            toast.error('Please select a subject');
            return;
        }

        if (!formData.chapterId) {
            toast.error('Please select a chapter');
            return;
        }

        if (!formData.questionText.trim()) {
            toast.error('Question text cannot be empty');
            return;
        }

        // Log form data for debugging
        console.log('📤 Submitting form data:', {
            ...formData,
            questionText: formData.questionText.substring(0, 50) + '...',
            timestamp: new Date().toISOString()
        });
        console.log('📋 Full form data:', formData);

        setLoading(true);

        try {
            const response = await axiosClient.post('/admin/questions', formData);
            console.log('✅ Server response:', response.data);
            toast.success('Question added successfully! ✅');

            // Reset form
            setFormData({
                ...formData,
                questionText: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                explanation: '',
                imageUrl: ''
            });
        } catch (error) {
            console.error('❌ Error submitting question:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async () => {
        setLoading(true);
        try {
            const questions = JSON.parse(bulkData);
            await axiosClient.post('/admin/questions/bulk', { questions });
            toast.success(`Uploaded ${questions.length} questions successfully! 🎉`);
            setBulkData('');
        } catch (error) {
            if (error instanceof SyntaxError) {
                toast.error('Invalid JSON format');
            } else {
                toast.error(error.response?.data?.message || 'Bulk upload failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 px-4 md:px-6 py-8 md:py-12">
            <Toaster position="top-right" />

            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <FileQuestion className="text-primary-400" />
                        Admin - Question Management
                    </h1>
                    <p className="text-slate-400">Add and manage NEET questions</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    {[
                        { id: 'single', icon: Plus, label: 'Add Question' },
                        { id: 'bulk', icon: Upload, label: 'Bulk Upload' },
                        { id: 'list', icon: List, label: 'View All' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Single Question Form */}
                {activeTab === 'single' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Cascading Dropdowns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Subject *</label>
                                    <select
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, chapterId: '', topicId: '' })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {metadata.subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Chapter *</label>
                                    <select
                                        value={formData.chapterId}
                                        onChange={(e) => setFormData({ ...formData, chapterId: e.target.value, topicId: '' })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        required
                                        disabled={!formData.subjectId}
                                    >
                                        <option value="">Select Chapter</option>
                                        {filteredChapters.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Topic (Optional)</label>
                                    <select
                                        value={formData.topicId}
                                        onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                        disabled={!formData.chapterId}
                                    >
                                        <option value="">Select Topic</option>
                                        {filteredTopics.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Question Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Question Type *</label>
                                <select
                                    value={formData.questionType}
                                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                >
                                    <option value="MCQ">Standard MCQ</option>
                                    <option value="Assertion_Reason">Assertion & Reason</option>
                                    <option value="Match_Column">Match the Column</option>
                                    <option value="Diagram_Based">Diagram Based</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.questionType === 'MCQ' && '✓ Classic 4-option multiple choice'}
                                    {formData.questionType === 'Assertion_Reason' && '✓ Statement-based reasoning questions'}
                                    {formData.questionType === 'Match_Column' && '✓ Match items from two columns'}
                                    {formData.questionType === 'Diagram_Based' && '✓ Questions based on diagrams/images'}
                                </p>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Question Text *</label>
                                <textarea
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[120px]"
                                    placeholder="Enter question text (supports LaTeX)"
                                    required
                                />
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map((opt) => (
                                    <div key={opt}>
                                        <label className="block text-sm font-semibold text-slate-300 mb-2">Option {opt} *</label>
                                        <input
                                            type="text"
                                            value={formData[`option${opt}`]}
                                            onChange={(e) => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Correct Answer & Difficulty */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Correct Answer *</label>
                                    <select
                                        value={formData.correctAnswer}
                                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Explanation (Optional)</label>
                                <textarea
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[100px]"
                                    placeholder="Detailed explanation for the answer"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    placeholder="https://example.com/image.png"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-premium w-full flex items-center justify-center gap-2"
                            >
                                <Plus size={18} />
                                {loading ? 'Adding Question...' : 'Add Question'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Bulk Upload */}
                {activeTab === 'bulk' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <p className="text-slate-400 mb-4">
                            Paste JSON array of questions. Each question should have: chapterId, questionText, optionA-D, correctAnswer.
                        </p>

                        <div className="mb-4 p-4 bg-slate-900/50 rounded-xl text-xs text-slate-500 font-mono">
                            <pre>{`[{
  "chapterId": "uuid-here",
  "topicId": "uuid-here",
  "questionType": "MCQ",
  "questionText": "Sample question?",
  "optionA": "Option 1",
  "optionB": "Option 2",
  "optionC": "Option 3",
  "optionD": "Option 4",
  "correctAnswer": "A",
  "explanation": "Explanation text",
  "difficulty": "medium"
}]`}</pre>
                        </div>

                        <textarea
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-h-[300px] font-mono text-sm mb-4"
                            placeholder="Paste JSON here"
                        />

                        <button
                            onClick={handleBulkUpload}
                            disabled={loading || !bulkData}
                            className="btn-premium w-full flex items-center justify-center gap-2"
                        >
                            <Upload size={18} />
                            {loading ? 'Uploading...' : 'Upload Questions'}
                        </button>
                    </motion.div>
                )}

                {/* List view - placeholder */}
                {activeTab === 'list' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 text-center text-slate-400"
                    >
                        <List className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Question list view coming soon...</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default QuestionEntry;
