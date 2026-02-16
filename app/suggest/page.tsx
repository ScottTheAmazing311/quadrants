'use client';

import { useState } from 'react';
import Link from 'next/link';
import { suggestQuestion } from '../actions';

export default function SuggestPage() {
  const [prompt, setPrompt] = useState('');
  const [labelLeft, setLabelLeft] = useState('');
  const [labelRight, setLabelRight] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await suggestQuestion({
        prompt,
        label_left: labelLeft,
        label_right: labelRight,
        submitted_by: submittedBy || null
      });

      setSuccess(true);
      setPrompt('');
      setLabelLeft('');
      setLabelRight('');
      setSubmittedBy('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen retro-grid relative py-16">
      <div className="scanlines" />
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#00f0ff] hover:text-[#ff00aa] flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="premium-card rounded-none p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-wider">
            Suggest a Question
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] mb-4"></div>
          <p className="text-[#b8b8d1] mb-8">
            Help grow the question bank! Submit your own thought-provoking questions.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border-2 border-[#39ff14] rounded-none text-[#39ff14]">
              ✓ Question submitted successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-none text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                Question Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff]/30 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors resize-none"
                placeholder="e.g., How do you prefer to spend your weekend?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                  Left Label (1-5) *
                </label>
                <input
                  type="text"
                  value={labelLeft}
                  onChange={(e) => setLabelLeft(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff]/30 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors"
                  placeholder="e.g., Out with friends"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                  Right Label (6-10) *
                </label>
                <input
                  type="text"
                  value={labelRight}
                  onChange={(e) => setLabelRight(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#ff00aa]/30 text-white rounded-none focus:border-[#ff00aa] focus:outline-none transition-colors"
                  placeholder="e.g., Alone at home"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff]/30 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors"
                placeholder="e.g., Jane Doe"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black rounded-none font-black uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 text-lg"
            >
              {submitting ? 'Submitting...' : 'Submit Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
