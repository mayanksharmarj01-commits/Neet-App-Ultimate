import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const StandardMCQ = ({ question, onSelect, selectedAnswer, showFeedback, isCorrect }) => {
    const { question_text, options, image_url } = question.content;

    return (
        <div className="space-y-6">
            <div className="text-xl font-medium text-slate-200 leading-relaxed">
                {question_text}
            </div>

            {image_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-white/5 p-4">
                    <img src={image_url} alt="Question Graphic" className="max-h-96 mx-auto object-contain" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {Object.entries(options).map(([key, value]) => {
                    const isSelected = selectedAnswer === key;
                    const isTrueCorrect = question.correct_answer === key;

                    let stateStyles = "border-slate-800 hover:border-slate-600 bg-slate-900/50";
                    if (isSelected) stateStyles = "border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/20";

                    if (showFeedback) {
                        if (isTrueCorrect) stateStyles = "border-green-500 bg-green-500/10 ring-2 ring-green-500/20";
                        else if (isSelected && !isTrueCorrect) stateStyles = "border-red-500 bg-red-500/10 ring-2 ring-red-500/20";
                    }

                    return (
                        <motion.button
                            key={key}
                            whileHover={!showFeedback ? { scale: 1.01 } : {}}
                            whileTap={!showFeedback ? { scale: 0.99 } : {}}
                            onClick={() => !showFeedback && onSelect(key)}
                            className={`flex items-center p-5 rounded-2xl border transition-all text-left group ${stateStyles}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                                }`}>
                                {key}
                            </div>
                            <span className="flex-1 text-slate-300 font-medium">{value}</span>

                            {showFeedback && isTrueCorrect && <Check className="text-green-500 ml-3" size={24} />}
                            {showFeedback && isSelected && !isTrueCorrect && <X className="text-red-500 ml-3" size={24} />}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default StandardMCQ;
