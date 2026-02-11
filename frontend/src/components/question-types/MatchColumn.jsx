import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

const MatchColumn = ({ question, onSelect, selectedAnswer, isCorrect, showFeedback }) => {
    const { columnA, columnB, question_text } = question.content;
    const [currentSelection, setCurrentSelection] = useState({});

    const handlePairing = (indexA, valB) => {
        if (showFeedback) return;
        const newSelection = { ...selectedAnswer, [indexA]: valB };
        onSelect(newSelection);
    };

    // Helper to get labels (A, B, C...) and (p, q, r...)
    const getLabelA = (i) => String.fromCharCode(65 + i); // A, B, C...
    const getLabelB = (i) => String.fromCharCode(112 + i); // p, q, r...

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-200 mb-6">{question_text}</h3>

            <div className="grid grid-cols-2 gap-8 relative">
                {/* Column I */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-2">Column I</p>
                    {columnA.map((item, i) => (
                        <div key={i} className="glass-card p-4 flex items-center justify-between border-slate-700/50">
                            <span className="font-bold text-primary-500 mr-3">{getLabelA(i)}</span>
                            <span className="flex-1 text-slate-300">{item}</span>
                        </div>
                    ))}
                </div>

                {/* Column II */}
                <div className="space-y-4">
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Column II</p>
                    {columnB.map((item, i) => (
                        <div key={i} className="glass-card p-4 flex items-center justify-between border-slate-700/50">
                            <span className="font-bold text-indigo-500 mr-3">{getLabelB(i)}</span>
                            <span className="flex-1 text-slate-300">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pairing Interface */}
            <div className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                <p className="text-sm text-slate-400 mb-4 font-medium uppercase">Select Correct Matches:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {columnA.map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center font-bold text-primary-400">
                                {getLabelA(i)}
                            </span>
                            <select
                                disabled={showFeedback}
                                value={selectedAnswer?.[i] || ''}
                                onChange={(e) => handlePairing(i, e.target.value)}
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none appearance-none"
                            >
                                <option value="">Match with...</option>
                                {columnB.map((_, bj) => (
                                    <option key={bj} value={getLabelB(bj)}>
                                        {getLabelB(bj)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {showFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 font-bold ${isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                >
                    {isCorrect ? <Check size={20} /> : <X size={20} />}
                    {isCorrect ? 'Perfectly Matched!' : 'Incorrect Combination'}
                </motion.div>
            )}
        </div>
    );
};

export default MatchColumn;
