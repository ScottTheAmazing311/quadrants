'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, Player, Response } from '@/types';
import { QuadrantGrid } from './QuadrantGrid';

interface QuestionRevealProps {
  questions: Question[];
  responses: Response[];
  players: Player[];
  onClose: () => void;
}

export function QuestionReveal({ questions, responses, players, onClose }: QuestionRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const question = questions[currentIndex];

  const goNext = useCallback(() => {
    if (isLast) {
      onClose();
    } else {
      setCurrentIndex(i => i + 1);
    }
  }, [isLast, onClose]);

  const goPrev = useCallback(() => {
    if (!isFirst) setCurrentIndex(i => i - 1);
  }, [isFirst]);

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col texture-concrete" style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-[#7a7a9e] hover:text-white transition-colors"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="pt-8 pb-4 px-8 text-center">
        <p className="text-xs font-bold text-[#7a7a9e] uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-mono), monospace' }}>
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question prompt — re-animates on change */}
      <div className="px-8 text-center" key={currentIndex}>
        <h2
          className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider animate-fade-up"
          style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}
        >
          {question.prompt}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-3 animate-fade-up delay-1">
          <span className="text-sm font-bold text-rust-primary uppercase tracking-wider">{question.label_left}</span>
          <span className="w-16 h-0.5 bg-steel-gray"></span>
          <span className="text-sm font-bold text-amber-secondary uppercase tracking-wider">{question.label_right}</span>
        </div>
      </div>

      {/* Grid — fills remaining space */}
      <div className="flex-1 min-h-0 px-4 md:px-12 py-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <QuadrantGrid
            questions={questions}
            responses={responses}
            players={players}
            selectedXQuestionId={question.id}
            selectedYQuestionId={question.id}
            hideSelectors={true}
          />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="pb-8 px-8 flex items-center justify-center gap-6">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className={`px-6 py-3 rounded-none font-bold uppercase text-xs tracking-wider transition-all ${
            isFirst
              ? 'border-2 border-[#3a322d] text-[#3a322d] cursor-not-allowed'
              : 'border-2 border-rust-primary text-rust-primary hover:bg-rust-primary hover:text-black'
          }`}
        >
          Previous
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-rust-primary scale-125'
                  : i < currentIndex
                  ? 'bg-rust-primary/40'
                  : 'bg-[#3a322d]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          className="px-6 py-3 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          {isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
}
