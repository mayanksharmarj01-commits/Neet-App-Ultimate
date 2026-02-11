import React, { useState } from 'react';
import StandardMCQ from './question-types/StandardMCQ';
import AssertionReason from './question-types/AssertionReason';
import MatchColumn from './question-types/MatchColumn';
import MultiStatement from './question-types/MultiStatement';

const UniversalQuestion = ({ question, onAnswerSubmit }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    // Determine if the answer is correct based on type
    const checkCorrect = (answer) => {
        if (question.type === 'Match_Column') {
            return JSON.stringify(answer) === JSON.stringify(question.correct_answer);
        }
        return answer === question.correct_answer;
    };

    const handleSelection = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;
        setShowFeedback(true);
        onAnswerSubmit({
            question_id: question.id,
            selected_option: selectedAnswer,
            is_correct: checkCorrect(selectedAnswer)
        });
    };

    const renderQuestionType = () => {
        const props = {
            question,
            onSelect: handleSelection,
            selectedAnswer,
            showFeedback,
            isCorrect: selectedAnswer ? checkCorrect(selectedAnswer) : false
        };

        switch (question.type) {
            case 'Match_Column':
                return <MatchColumn {...props} />;
            case 'Assertion_Reason':
                return <AssertionReason {...props} />;
            case 'Statement_Based':
                return <MultiStatement {...props} />;
            case 'Graph_Interpretation':
                return <StandardMCQ {...props} />;
            case 'Diagram_Based':
            case 'MCQ':
            default:
                return <StandardMCQ {...props} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 min-h-[500px] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-8">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {question.level.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-medium text-primary-400">
                        {question.topic_tag}
                    </span>
                </div>

                {renderQuestionType()}

                <div className="mt-10 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer || showFeedback}
                        className={`btn-premium px-12 ${(!selectedAnswer || showFeedback) ? 'opacity-50 cursor-not-allowed scale-100' : ''}`}
                    >
                        {showFeedback ? 'Answered' : 'Check Answer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UniversalQuestion;
