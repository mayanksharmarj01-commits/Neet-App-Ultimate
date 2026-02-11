import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share, Copy, Clock, Zap, Target } from 'lucide-react';
import SubscriptionGuard from '../../components/subscription/SubscriptionGuard';

const CreateChallenge = () => {
    const [formData, setFormData] = useState({
        title: 'New Challenge',
        chapter: 'Ray Optics',
        level: 'AIIMS_PYQ',
        questionCount: 30,
        timeLimit: 60
    });

    const [generatedLink, setGeneratedLink] = useState('');
    const [copyStatus, setCopyStatus] = useState(false);

    const handleGenerate = () => {
        // In a real app, this would be an API call
        const uniqueId = Math.random().toString(36).substring(7);
        const mockLink = `https://neet.app/challenge/${uniqueId}`;
        setGeneratedLink(mockLink);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-white mb-2">Teacher's Arena</h1>
                <p className="text-slate-400">Create rigorous AIIMS-level tests for your top-performing students.</p>
            </div>

            <SubscriptionGuard requiredPlan="pro">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration Form */}
                    <div className="lg:col-span-2 glass-card p-8 space-y-6 bg-slate-900/40">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Challenge Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500/50 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Chapter</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none"
                                    value={formData.chapter}
                                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                >
                                    <option>Electrostatics</option>
                                    <option>Ray Optics</option>
                                    <option>Current Electricity</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Difficulty</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none"
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option value="NEET_PYQ">Standard NEET</option>
                                    <option value="AIIMS_PYQ">Advanced AIIMS (Hard)</option>
                                    <option value="JEE_Main_Selection">JEE Physics Drill</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Questions</label>
                                <div className="flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-xl border border-slate-700">
                                    <Target size={18} className="text-slate-500" />
                                    <input
                                        type="number"
                                        value={formData.questionCount}
                                        className="bg-transparent w-full text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Time (Min)</label>
                                <div className="flex items-center gap-2 bg-slate-950 px-4 py-3 rounded-xl border border-slate-700">
                                    <Clock size={18} className="text-slate-500" />
                                    <input
                                        type="number"
                                        value={formData.timeLimit}
                                        className="bg-transparent w-full text-white outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="w-full btn-premium flex items-center justify-center gap-2 py-4 text-lg mt-4"
                        >
                            <Zap fill="currentColor" />
                            Create Challenge Link
                        </button>
                    </div>

                    {/* Output / Preview */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20">
                            <h3 className="text-lg font-bold text-white mb-4">Sharing Center</h3>

                            {generatedLink ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ready to Share</p>

                                    <div className="bg-slate-950 p-4 rounded-xl border border-green-500/30 flex items-center justify-between text-sm text-green-400 font-mono break-all">
                                        {generatedLink}
                                    </div>

                                    <button
                                        onClick={handleCopy}
                                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${copyStatus ? 'bg-green-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'
                                            }`}
                                    >
                                        {copyStatus ? 'Copied!' : <><Copy size={16} /> Copy Link</>}
                                    </button>

                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                                            <Share size={16} /> WhatsApp
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-40 flex flex-col items-center justify-center text-slate-500/50 border-2 border-dashed border-slate-700 rounded-xl">
                                    <Zap size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Configure settings to generate</p>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Estimated Difficulty</h4>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-bold">AIIMS Level</span>
                                <span className="text-red-400 font-bold">Hard</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-gradient-to-r from-orange-500 to-red-500" />
                            </div>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
                                Based on "Ray Optics", expect questions involving multi-concept application and complex ray diagrams.
                            </p>
                        </div>
                    </div>
                </div>
            </SubscriptionGuard>
        </div>
    );
};

export default CreateChallenge;
