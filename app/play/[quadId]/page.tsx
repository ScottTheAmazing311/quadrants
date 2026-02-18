'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { Slider } from '@/components/Slider';
import { AvatarUpload } from '@/components/AvatarUpload';
import { Question, Quad } from '@/types';
import { submitResponses, createGroup, joinGroup } from '@/app/actions';

type PlayMode = 'setup' | 'playing' | 'complete';

export default function PlayPage({ params }: { params: Promise<{ quadId: string }> }) {
  const { quadId } = use(params);
  const [mode, setMode] = useState<PlayMode>('setup');
  const [setupChoice, setSetupChoice] = useState<'join' | 'create' | 'solo' | null>(null);

  const [quad, setQuad] = useState<Quad | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [questionId: string]: number }>({});
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isSoloMode, setIsSoloMode] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state for join/create
  const [playerName, setPlayerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [createdGroupCode, setCreatedGroupCode] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Get player and group from localStorage
      const pid = storage.getPlayerId();
      const gcode = storage.getGroupCode();

      // Fetch quad and questions
      const { data: quadData } = await supabase
        .from('quads')
        .select('*')
        .eq('id', quadId)
        .single();

      if (quadData) {
        setQuad(quadData as Quad);
      }

      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quad_id', quadId)
        .order('order', { ascending: true });

      if (questionsData) {
        setQuestions(questionsData as Question[]);
        const initialResponses: { [key: string]: number } = {};
        questionsData.forEach(q => {
          initialResponses[q.id] = 5;
        });
        setResponses(initialResponses);
      }

      // Check if user already has player ID and group
      if (pid && gcode) {
        setPlayerId(pid);
        setGroupCode(gcode);
        setMode('playing');
      }

      setLoading(false);
    };

    loadData();
  }, [quadId]);

  const handleJoinGroup = async () => {
    setError(null);
    try {
      const player = await joinGroup(joinCode.toUpperCase(), playerName, avatarUrl);
      storage.setPlayerId(player.id);
      storage.setGroupCode(joinCode.toUpperCase());
      setPlayerId(player.id);
      setGroupCode(joinCode.toUpperCase());
      setMode('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    }
  };

  const handleCreateGroup = async () => {
    setError(null);
    try {
      const group = await createGroup(groupName);
      const player = await joinGroup(group.code, playerName, avatarUrl);
      storage.setPlayerId(player.id);
      storage.setGroupCode(group.code);
      setPlayerId(player.id);
      setGroupCode(group.code);
      setCreatedGroupCode(group.code);
      setMode('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  const handleSoloPlay = () => {
    setIsSoloMode(true);
    setMode('playing');
  };

  const handleSubmit = async () => {
    if (!isSoloMode && !playerId) {
      setError('Please join a group first');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!isSoloMode && playerId) {
        const responsesArray = Object.entries(responses).map(([questionId, value]) => ({
          questionId,
          value
        }));
        await submitResponses(playerId, quadId, responsesArray);

        if (groupCode) {
          window.location.href = `/results/${quadId}?group=${groupCode}`;
        } else {
          window.location.href = `/results/${quadId}`;
        }
      } else {
        // Solo mode - store responses in localStorage and show results
        storage.setItem(`solo_responses_${quadId}`, JSON.stringify({
          responses,
          playerName: 'You',
          timestamp: Date.now()
        }));
        window.location.href = `/results/${quadId}?solo=true`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-xl text-rust-primary ">Loading...</div>
      </div>
    );
  }

  if (!quad || questions.length === 0) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-center premium-card p-12 rounded-none max-w-lg">
          <h1 className="text-4xl font-black text-white uppercase mb-4">Quad Not Found</h1>
          <Link href="/" className="text-rust-primary hover:text-amber-secondary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // SETUP SCREEN
  if (mode === 'setup') {
    return (
      <div className="min-h-screen industrial-base relative py-16">
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="premium-card rounded-none p-8">
            <h1 className="text-4xl font-black text-white uppercase mb-2 text-center">
              {quad.name}
            </h1>
            <p className="text-[#b8b8d1] text-center mb-8">
              {questions.length} Questions
            </p>

            {!setupChoice ? (
              <>
                <h2 className="text-2xl font-bold text-white uppercase mb-6 text-center">
                  How do you want to play?
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => setSetupChoice('join')}
                    className="w-full py-4 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase hover:bg-rust-primary hover:text-black transition-all"
                  >
                    Join Existing Group
                  </button>
                  <button
                    onClick={() => setSetupChoice('create')}
                    className="w-full py-4 border-2 border-amber-secondary text-amber-secondary rounded-none font-bold uppercase hover:bg-amber-secondary hover:text-black transition-all"
                  >
                    Create New Group
                  </button>
                  <button
                    onClick={handleSoloPlay}
                    className="w-full py-4 border-2 border-[#7a7a9e] text-[#b8b8d1] rounded-none font-bold uppercase hover:border-rust-primary hover:text-rust-primary transition-all"
                  >
                    Play Solo (No Group)
                  </button>
                </div>
              </>
            ) : setupChoice === 'join' ? (
              <>
                <button
                  onClick={() => setSetupChoice(null)}
                  className="text-[#7a7a9e] hover:text-rust-primary mb-4 flex items-center gap-2"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-white uppercase mb-6">Join Group</h2>
                {error && <div className="mb-4 p-4 bg-red-900/20 border border-red-500 text-red-400">{error}</div>}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="GROUP CODE"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary uppercase text-center font-mono text-xl"
                  />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary"
                  />
                  <AvatarUpload onUpload={setAvatarUrl} />
                  <button
                    onClick={handleJoinGroup}
                    disabled={!joinCode || !playerName}
                    className="w-full py-4 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase disabled:opacity-50"
                  >
                    Join & Start Playing
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSetupChoice(null)}
                  className="text-[#7a7a9e] hover:text-rust-primary mb-4 flex items-center gap-2"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-white uppercase mb-6">Create Group</h2>
                {error && <div className="mb-4 p-4 bg-red-900/20 border border-red-500 text-red-400">{error}</div>}
                <div className="space-y-4">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group Name"
                    className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary"
                  />
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-bg-warm-2 border-2 border-rust-primary/30 text-white rounded-none focus:border-rust-primary"
                  />
                  <AvatarUpload onUpload={setAvatarUrl} />
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName || !playerName}
                    className="w-full py-4 bg-amber-secondary texture-brushed text-black rounded-none font-bold uppercase disabled:opacity-50"
                  >
                    Create & Start Playing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE SCREEN (Solo mode)
  if (mode === 'complete') {
    return (
      <div className="min-h-screen industrial-base relative py-16">
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="premium-card rounded-none p-12 text-center">
            <h1 className="text-5xl font-black text-white uppercase mb-4">Complete!</h1>
            <p className="text-xl text-[#b8b8d1] mb-8">
              You've finished the quad in solo mode.
            </p>
            <div className="space-y-4">
              <Link
                href={`/group`}
                className="block w-full py-4 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase"
              >
                Create Group & Invite Friends
              </Link>
              <Link
                href="/"
                className="block w-full py-4 border-2 border-[#7a7a9e] text-[#b8b8d1] rounded-none font-bold uppercase hover:border-rust-primary hover:text-rust-primary transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING SCREEN
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="min-h-screen industrial-base relative py-16">

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="premium-card rounded-none p-8 md:p-12">
          {createdGroupCode && (
            <div className="mb-6 p-4 bg-green-900/20 border-2 border-burnt-orange text-burnt-orange text-center">
              <div className="font-bold mb-1">Group Created!</div>
              <div>Share code: <span className="text-2xl font-mono">{createdGroupCode}</span></div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-wide mb-2">
              {quad.name}
            </h1>
            <p className="text-[#b8b8d1]">
              Question <span className="text-rust-primary">{currentIndex + 1}</span> of {questions.length}
              {isSoloMode && <span className="ml-2 text-[#7a7a9e]">(Solo Mode)</span>}
            </p>
          </div>

          <div className="mb-8">
            <div className="w-full h-2 bg-bg-warm-2 border border-rust-primary/30">
              <div
                className="h-full bg-rust-primary texture-brushed transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-none text-red-400">
              {error}
            </div>
          )}

          {currentQuestion && (
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center leading-relaxed">
                {currentQuestion.prompt}
              </h2>

              <Slider
                value={responses[currentQuestion.id] || 5}
                onChange={(value) => setResponses({
                  ...responses,
                  [currentQuestion.id]: value
                })}
                leftLabel={currentQuestion.label_left}
                rightLabel={currentQuestion.label_right}
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="px-6 py-3 border-2 border-[#7a7a9e] text-[#b8b8d1] rounded-none font-bold uppercase tracking-wider hover:border-rust-primary hover:text-rust-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-burnt-orange texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : isSoloMode ? 'Finish' : 'Submit Answers'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
