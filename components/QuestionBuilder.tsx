'use client';

import { useState } from 'react';

export interface QuestionData {
  prompt: string;
  label_left: string;
  label_right: string;
  locked?: boolean;
}

interface QuestionBuilderProps {
  questions: QuestionData[];
  onChange: (questions: QuestionData[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const addQuestion = () => {
    onChange([...questions, { prompt: '', label_left: '', label_right: '', locked: false }]);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionData, value: string | boolean) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="bg-[#1a1b2e] border-2 border-[#00f0ff]/30 rounded-none p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#00f0ff] uppercase text-sm tracking-wider">Question {index + 1}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuestion(index, 'locked', !question.locked)}
                className={`p-1 rounded-none transition-colors ${question.locked ? 'text-[#ffed00]' : 'text-[#7a7a9e]'}`}
                title={question.locked ? 'Unlock' : 'Lock'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  {question.locked ? (
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  ) : (
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(index, 'up')}
                disabled={index === 0}
                className="p-1 text-[#00f0ff] disabled:text-[#2a2b3e] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveQuestion(index, 'down')}
                disabled={index === questions.length - 1}
                className="p-1 text-[#00f0ff] disabled:text-[#2a2b3e] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="p-1 text-[#ff00aa] hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-1">Question Prompt</label>
            <textarea
              value={question.prompt}
              onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0b1a] border-2 border-[#00f0ff]/20 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors resize-none"
              rows={2}
              placeholder="e.g., How do you prefer to spend your weekend?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-1">Left Label (1-5)</label>
              <input
                type="text"
                value={question.label_left}
                onChange={(e) => updateQuestion(index, 'label_left', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0b1a] border-2 border-[#00f0ff]/20 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors"
                placeholder="e.g., Out with friends"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-1">Right Label (6-10)</label>
              <input
                type="text"
                value={question.label_right}
                onChange={(e) => updateQuestion(index, 'label_right', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0b1a] border-2 border-[#ff00aa]/20 text-white rounded-none focus:border-[#ff00aa] focus:outline-none transition-colors"
                placeholder="e.g., Alone at home"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-3 border-2 border-dashed border-[#00f0ff]/50 rounded-none text-[#00f0ff] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all font-bold uppercase tracking-wider"
      >
        + Add Question
      </button>
    </div>
  );
}
