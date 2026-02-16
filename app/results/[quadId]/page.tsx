'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { QuadrantGrid } from '@/components/QuadrantGrid';
import { Question, Player, Response, Quad } from '@/types';

export default function ResultsPage({ params }: { params: Promise<{ quadId: string }> }) {
  const { quadId } = use(params);
  const [quad, setQuad] = useState<Quad | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [selectedXQuestionId, setSelectedXQuestionId] = useState<string>('');
  const [selectedYQuestionId, setSelectedYQuestionId] = useState<string>('');
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [isSoloMode, setIsSoloMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Get parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const gcode = urlParams.get('group');
      const solo = urlParams.get('solo') === 'true';

      setGroupCode(gcode);
      setIsSoloMode(solo);

      // Fetch quad
      const { data: quadData } = await supabase
        .from('quads')
        .select('*')
        .eq('id', quadId)
        .single();

      if (quadData) {
        setQuad(quadData as Quad);
      }

      // Fetch questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('quad_id', quadId)
        .order('order', { ascending: true });

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData as Question[]);
        setSelectedXQuestionId(questionsData[0].id);
        setSelectedYQuestionId(questionsData[1]?.id || questionsData[0].id);
      }

      if (solo) {
        // Solo mode - load from localStorage
        const soloData = storage.getItem(`solo_responses_${quadId}`);
        if (soloData) {
          const parsed = JSON.parse(soloData);

          // Create mock player
          const mockPlayer: Player = {
            id: 'solo-player',
            name: parsed.playerName || 'You',
            avatar_url: null,
            group_id: 'solo',
            created_at: new Date().toISOString()
          };
          setPlayers([mockPlayer]);

          // Create mock responses
          const mockResponses: Response[] = Object.entries(parsed.responses).map(([questionId, value]) => ({
            id: `solo-${questionId}`,
            player_id: 'solo-player',
            question_id: questionId,
            quad_id: quadId,
            value: value as number,
            created_at: new Date().toISOString()
          }));
          setResponses(mockResponses);
        }
      } else {
        // Group mode - fetch from database
        const { data: responsesData } = await supabase
          .from('responses')
          .select('*')
          .eq('quad_id', quadId);

        if (responsesData) {
          setResponses(responsesData as Response[]);

          // Get unique player IDs
          const playerIds = [...new Set(responsesData.map(r => r.player_id))];

          // Fetch players
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);

          if (playersData) {
            setPlayers(playersData as Player[]);
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, [quadId]);

  if (loading) {
    return (
      <div className="min-h-screen retro-grid relative flex items-center justify-center">
        <div className="scanlines" />
        <div className="text-xl text-[#00f0ff] neon-text-cyan relative z-10">Loading results...</div>
      </div>
    );
  }

  if (!quad || questions.length === 0) {
    return (
      <div className="min-h-screen retro-grid relative flex items-center justify-center">
        <div className="scanlines" />
        <div className="text-center premium-card p-12 rounded-none max-w-lg relative z-10">
          <h1 className="text-4xl font-black text-white uppercase mb-4">Results Not Available</h1>
          <Link href="/" className="text-[#00f0ff] hover:text-[#ff00aa] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-grid relative py-16">
      <div className="scanlines" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="mb-8">
          <Link
            href={groupCode ? `/group/${groupCode}` : '/'}
            className="text-[#00f0ff] hover:text-[#ff00aa] flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>

        <div className="premium-card rounded-none p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-wider">
            {quad.name}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] mb-4"></div>
          <p className="text-[#b8b8d1] mb-8">
            {isSoloMode ? 'Solo Mode' : `${players.length} ${players.length === 1 ? 'player' : 'players'} responded`}
          </p>

          {players.length === 0 ? (
            <div className="text-center py-16 text-[#b8b8d1]">
              <p className="text-lg mb-4">No responses yet!</p>
              <p>Be the first to play this quad.</p>
              <Link
                href={`/play/${quadId}${groupCode ? `?group=${groupCode}` : ''}`}
                className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all"
              >
                Play Now
              </Link>
            </div>
          ) : (
            <>
              <QuadrantGrid
                questions={questions}
                responses={responses}
                players={players}
                selectedXQuestionId={selectedXQuestionId}
                selectedYQuestionId={selectedYQuestionId}
                onAxisChange={(axis, questionId) => {
                  if (axis === 'x') {
                    setSelectedXQuestionId(questionId);
                  } else {
                    setSelectedYQuestionId(questionId);
                  }
                }}
              />

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                {!isSoloMode && (
                  <Link
                    href={`/results/${quadId}/analysis${groupCode ? `?group=${groupCode}` : ''}`}
                    className="px-6 py-3 bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all text-center"
                  >
                    View Analysis
                  </Link>
                )}
                <Link
                  href={`/play/${quadId}${groupCode ? `?group=${groupCode}` : ''}`}
                  className="px-6 py-3 border-2 border-[#00f0ff] text-[#00f0ff] rounded-none font-bold uppercase tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all text-center"
                >
                  Retake Quiz
                </Link>
                {isSoloMode && (
                  <Link
                    href="/group"
                    className="px-6 py-3 border-2 border-[#39ff14] text-[#39ff14] rounded-none font-bold uppercase tracking-wider hover:bg-[#39ff14] hover:text-black transition-all text-center"
                  >
                    Create Group & Invite Friends
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
