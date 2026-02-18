'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QuestionBuilder, QuestionData } from '@/components/QuestionBuilder';
import { createQuad, generateQuestions } from '../actions';

function CreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupCode = searchParams.get('group');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [questions, setQuestions] = useState<QuestionData[]>([
    { prompt: '', label_left: '', label_right: '', locked: false }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const generated = await generateQuestions(12 - questions.filter(q => q.locked).length);
      const lockedQuestions = questions.filter(q => q.locked);
      setQuestions([...lockedQuestions, ...generated]);
    } catch (err) {
      setError('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateFull = async () => {
    setGenerating(true);
    try {
      const generated = await generateQuestions(12);
      setQuestions(generated);
      if (!name) {
        setName(`Quick Quad #${Math.floor(Math.random() * 1000)}`);
      }
    } catch (err) {
      setError('Failed to generate quad');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (questions.length < 2) {
      setError('Please add at least 2 questions');
      return;
    }

    const invalidQuestions = questions.filter(
      q => !q.prompt || !q.label_left || !q.label_right
    );
    if (invalidQuestions.length > 0) {
      setError('Please fill out all question fields');
      return;
    }

    setSubmitting(true);

    try {
      const quad = await createQuad({
        name,
        description,
        created_by: createdBy,
        group_code: groupCode,
        is_public: isPublic && !groupCode,
        questions
      });

      if (groupCode) {
        router.push(`/group/${groupCode}`);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quad');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen industrial-base relative py-16">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-8">
          <Link
            href={groupCode ? `/group/${groupCode}` : '/'}
            className="text-rust-primary hover:text-amber-secondary flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <div className="premium-card rounded-none p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-wider">
            Create a Quad
          </h1>
          <div className="h-1 w-32 bg-rust-primary texture-brushed mb-8"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-none text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                  Quad Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none transition-colors"
                  placeholder="e.g., WEEKEND VIBES QUIZ"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none transition-colors resize-none"
                  placeholder="What's this quad about?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                  Creator Name *
                </label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              {!groupCode && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-rust-primary bg-bg-warm-2 border-2 border-rust-primary/30 rounded-none focus:ring-[#00f0ff]"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-[#b8b8d1]">
                    Make this quad public (others can find and play it)
                  </label>
                </div>
              )}
            </div>

            <div className="border-t-2 border-rust-primary/30 pt-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">Questions</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateQuestions}
                    disabled={generating}
                    className="px-4 py-2 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-rust-primary hover:text-black transition-all disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Add Random'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateFull}
                    disabled={generating}
                    className="px-4 py-2 border-2 border-burnt-orange text-burnt-orange rounded-none font-bold uppercase text-xs tracking-wider hover:bg-burnt-orange hover:text-black transition-all disabled:opacity-50"
                  >
                    Generate Full
                  </button>
                </div>
              </div>

              <QuestionBuilder questions={questions} onChange={setQuestions} />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-rust-primary texture-brushed text-black rounded-none font-black uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 text-lg"
              >
                {submitting ? 'Creating...' : 'Create Quad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
          <div className="text-xl text-rust-primary  relative z-10">Loading...</div>
      </div>
    }>
      <CreateForm />
    </Suspense>
  );
}
