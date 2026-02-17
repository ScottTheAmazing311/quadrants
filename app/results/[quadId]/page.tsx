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
  const [correlationMessage, setCorrelationMessage] = useState<string | null>(null);
  const [showingCorrelation, setShowingCorrelation] = useState(false);
  const [currentCorrelationPair, setCurrentCorrelationPair] = useState<{ q1Id: string; q2Id: string } | null>(null);

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

  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (values1: number[], values2: number[]): number => {
    const n = values1.length;
    if (n === 0) return 0;

    const mean1 = values1.reduce((a, b) => a + b, 0) / n;
    const mean2 = values2.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = values1[i] - mean1;
      const diff2 = values2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const findInterestingCorrelation = () => {
    if (questions.length < 2 || players.length < 2) {
      setCorrelationMessage("Need at least 2 questions and 2 players to find correlations");
      return;
    }

    // Find all correlations above a threshold
    const allCorrelations: { q1: Question; q2: Question; coefficient: number }[] = [];

    // Check all pairs of questions
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const q1 = questions[i];
        const q2 = questions[j];

        // Skip if this is the currently displayed pair
        if (currentCorrelationPair &&
            ((currentCorrelationPair.q1Id === q1.id && currentCorrelationPair.q2Id === q2.id) ||
             (currentCorrelationPair.q1Id === q2.id && currentCorrelationPair.q2Id === q1.id))) {
          continue;
        }

        // Get all player responses for both questions
        const values1: number[] = [];
        const values2: number[] = [];

        players.forEach(player => {
          const r1 = responses.find(r => r.player_id === player.id && r.question_id === q1.id);
          const r2 = responses.find(r => r.player_id === player.id && r.question_id === q2.id);

          if (r1 && r2) {
            values1.push(r1.value);
            values2.push(r2.value);
          }
        });

        if (values1.length >= 2) {
          const correlation = calculateCorrelation(values1, values2);

          // Only include correlations with reasonable strength (|r| > 0.25)
          if (Math.abs(correlation) > 0.25) {
            // Count which quadrant has the most people to determine the right labels
            let lowLow = 0, lowHigh = 0, highLow = 0, highHigh = 0;

            for (let i = 0; i < values1.length; i++) {
              const isLow1 = values1[i] <= 5.5;
              const isLow2 = values2[i] <= 5.5;

              if (isLow1 && isLow2) lowLow++;
              else if (isLow1 && !isLow2) lowHigh++;
              else if (!isLow1 && isLow2) highLow++;
              else highHigh++;
            }

            allCorrelations.push({ q1, q2, coefficient: correlation, lowLow, lowHigh, highLow, highHigh });
          }
        }
      }
    }

    // If no new correlations found, reset and try again with all pairs
    if (allCorrelations.length === 0 && currentCorrelationPair) {
      setCurrentCorrelationPair(null);
      findInterestingCorrelation();
      return;
    }

    if (allCorrelations.length > 0) {
      // Sort by strength and pick a random one from the top correlations
      allCorrelations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

      // Take top 3 correlations (or all if less than 3) and pick randomly
      const topCorrelations = allCorrelations.slice(0, Math.min(3, allCorrelations.length));
      const selectedPair = topCorrelations[Math.floor(Math.random() * topCorrelations.length)];

      // Update the grid to show this correlation
      setSelectedXQuestionId(selectedPair.q1.id);
      setSelectedYQuestionId(selectedPair.q2.id);
      setShowingCorrelation(true);
      setCurrentCorrelationPair({ q1Id: selectedPair.q1.id, q2Id: selectedPair.q2.id });

      // Generate correlation message
      const strength = Math.abs(selectedPair.coefficient);
      const strengthWord = strength > 0.7 ? 'strongly' : strength > 0.4 ? 'moderately' : 'slightly';

      // Determine labels based on which preference combination is most common
      let q1Label: string;
      let q2Label: string;

      if (selectedPair.coefficient > 0) {
        // Positive correlation: people cluster in (low,low) or (high,high)
        // Use the quadrant with more people
        if (selectedPair.lowLow >= selectedPair.highHigh) {
          // More people in (low, low) - e.g., Legoland + Elf
          q1Label = selectedPair.q1.label_left;
          q2Label = selectedPair.q2.label_left;
        } else {
          // More people in (high, high) - e.g., Sea World + Home Alone
          q1Label = selectedPair.q1.label_right;
          q2Label = selectedPair.q2.label_right;
        }
      } else {
        // Negative correlation: people cluster in (low,high) or (high,low)
        // Use the quadrant with more people
        if (selectedPair.lowHigh >= selectedPair.highLow) {
          // More people in (low, high) - e.g., Legoland + Home Alone
          q1Label = selectedPair.q1.label_left;
          q2Label = selectedPair.q2.label_right;
        } else {
          // More people in (high, low) - e.g., Sea World + Elf
          q1Label = selectedPair.q1.label_right;
          q2Label = selectedPair.q2.label_left;
        }
      }

      setCorrelationMessage(
        `People who prefer "${q1Label}" ${strengthWord} tend to prefer "${q2Label}"`
      );
    } else {
      setCorrelationMessage("No significant correlations found");
      setShowingCorrelation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="\!-- scanlines removed --" />
        <div className="text-xl text-rust-primary  relative z-10">Loading results...</div>
      </div>
    );
  }

  if (!quad || questions.length === 0) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="\!-- scanlines removed --" />
        <div className="text-center premium-card p-12 rounded-none max-w-lg relative z-10">
          <h1 className="text-4xl font-black text-white uppercase mb-4">Results Not Available</h1>
          <Link href="/" className="text-rust-primary hover:text-amber-secondary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen industrial-base relative py-16">
      <div className="\!-- scanlines removed --" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
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
            {quad.name}
          </h1>
          <div className="h-1 w-32 bg-rust-primary texture-brushed mb-4"></div>
          <p className="text-[#b8b8d1] mb-8">
            {isSoloMode ? 'Solo Mode' : `${players.length} ${players.length === 1 ? 'player' : 'players'} responded`}
          </p>

          {players.length === 0 ? (
            <div className="text-center py-16 text-[#b8b8d1]">
              <p className="text-lg mb-4">No responses yet!</p>
              <p>Be the first to play this quad.</p>
              <Link
                href={`/play/${quadId}${groupCode ? `?group=${groupCode}` : ''}`}
                className="inline-block mt-4 px-6 py-3 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all"
              >
                Play Now
              </Link>
            </div>
          ) : (
            <>
              {correlationMessage && (
                <div className="mb-6 p-6 bg-burnt-orange/20 border-2 border-burnt-orange rounded-none texture-concrete">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-burnt-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-burnt-orange font-black uppercase tracking-wider text-sm mb-2">Correlation Found!</h3>
                      <p className="text-white font-bold mb-4">{correlationMessage}</p>
                      <button
                        onClick={findInterestingCorrelation}
                        className="px-4 py-2 bg-burnt-orange texture-brushed text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(255, 111, 60, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        Find another!
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setCorrelationMessage(null);
                        setShowingCorrelation(false);
                        setCurrentCorrelationPair(null);
                      }}
                      className="text-burnt-orange hover:text-amber-secondary transition-colors flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <QuadrantGrid
                questions={questions}
                responses={responses}
                players={players}
                selectedXQuestionId={selectedXQuestionId}
                selectedYQuestionId={selectedYQuestionId}
                hideSelectors={showingCorrelation}
                onAxisChange={(axis, questionId) => {
                  if (axis === 'x') {
                    setSelectedXQuestionId(questionId);
                  } else {
                    setSelectedYQuestionId(questionId);
                  }
                  // Reset correlation view when manually changing questions
                  if (showingCorrelation) {
                    setShowingCorrelation(false);
                    setCorrelationMessage(null);
                    setCurrentCorrelationPair(null);
                  }
                }}
              />

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={findInterestingCorrelation}
                  className="px-6 py-3 bg-burnt-orange texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all text-center"
                  style={{
                    boxShadow: 'inset 0 1px 2px rgba(255, 111, 60, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  ⚡ Find Correlations!
                </button>
                {!isSoloMode && (
                  <Link
                    href={`/results/${quadId}/analysis${groupCode ? `?group=${groupCode}` : ''}`}
                    className="px-6 py-3 bg-amber-secondary texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all text-center"
                    style={{
                      boxShadow: 'inset 0 1px 2px rgba(255, 152, 0, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    View Analysis
                  </Link>
                )}
                <Link
                  href={`/play/${quadId}${groupCode ? `?group=${groupCode}` : ''}`}
                  className="px-6 py-3 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all text-center"
                >
                  Retake Quiz
                </Link>
                {isSoloMode && (
                  <Link
                    href="/group"
                    className="px-6 py-3 border-2 border-burnt-orange text-burnt-orange rounded-none font-bold uppercase tracking-wider hover:bg-[#39ff14] hover:text-black transition-all text-center"
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
