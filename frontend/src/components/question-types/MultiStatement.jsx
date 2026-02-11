import React from 'react';
import StandardMCQ from './StandardMCQ';

const MultiStatement = (props) => {
    const { statements, question_text } = props.question.content;

    const modifiedQuestion = {
        ...props.question,
        content: {
            ...props.question.content,
            question_text: (
                <div className="space-y-4">
                    <p className="font-bold text-slate-200">{question_text}</p>
                    <div className="space-y-2">
                        {statements.map((s, i) => (
                            <div key={i} className="flex gap-3 text-sm text-slate-400 bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="font-bold text-primary-400">S{i + 1}:</span>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    };

    return <StandardMCQ {...props} question={modifiedQuestion} />;
};

export default MultiStatement;
