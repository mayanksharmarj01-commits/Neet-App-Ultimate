import React from 'react';
import StandardMCQ from './StandardMCQ';

const AssertionReason = (props) => {
    const { assertion, reason } = props.question.content;

    const arOptions = {
        "A": "Both A and R are true and R is the correct explanation of A",
        "B": "Both A and R are true but R is NOT the correct explanation of A",
        "C": "A is true but R is false",
        "D": "A is false but R is true"
    };

    // We wrap the MCQ but provide a custom layout for the question text
    const modifiedQuestion = {
        ...props.question,
        content: {
            ...props.question.content,
            options: arOptions,
            question_text: (
                <div className="space-y-4">
                    <div className="p-4 bg-primary-500/5 rounded-xl border border-primary-500/20">
                        <span className="text-xs font-black text-primary-400 uppercase tracking-widest block mb-1">Assertion (A)</span>
                        <p className="text-slate-200">{assertion}</p>
                    </div>
                    <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block mb-1">Reason (R)</span>
                        <p className="text-slate-200">{reason}</p>
                    </div>
                </div>
            )
        }
    };

    return <StandardMCQ {...props} question={modifiedQuestion} />;
};

export default AssertionReason;
