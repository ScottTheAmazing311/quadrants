'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { QuadCard } from '@/components/QuadCard';
import { QuadWithQuestions, Player } from '@/types';

const TITLE = 'QUADRANTS';

function TypewriterTitle() {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    // Brief delay so the fade-up wrapper settles first
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedCount(prev => {
          if (prev >= TITLE.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 60);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(startDelay);
  }, []);

  // Fade out cursor after all letters revealed
  useEffect(() => {
    if (displayedCount === TITLE.length) {
      const timeout = setTimeout(() => setCursorVisible(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [displayedCount]);

  return (
    <div className="mb-6 inline-block animate-fade-up delay-0">
      <div className="relative">
        <h1
          className="text-8xl md:text-9xl font-black tracking-tighter mb-2 text-letterpress"
          style={{ color: '#c87341', fontFamily: 'var(--font-display), system-ui, sans-serif' }}
          aria-label={TITLE}
        >
          {TITLE.split('').map((char, i) => (
            <span
              key={i}
              style={{ opacity: i < displayedCount ? 1 : 0 }}
            >
              {char}
            </span>
          ))}
          <span
            className={cursorVisible ? 'animate-blink-cursor' : ''}
            style={{
              opacity: cursorVisible ? undefined : 0,
              transition: 'opacity 0.3s',
              fontWeight: 300,
              marginLeft: '-0.05em',
            }}
          >
            |
          </span>
        </h1>
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-rust-primary opacity-50 animate-line-reveal delay-2"></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [quads, setQuads] = useState<QuadWithQuestions[]>([]);
  const [completedQuadIds, setCompletedQuadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<{ name: string; code: string } | null>(null);
  const [groupPlayers, setGroupPlayers] = useState<Player[]>([]);
  const [quadCompletions, setQuadCompletions] = useState<Map<string, Player[]>>(new Map());

  useEffect(() => {
    const loadQuads = async () => {
      // Fetch public quads
      const { data: quadsData, error } = await supabase
        .from('quads')
        .select(`
          *,
          questions(id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching quads:', error);
        setLoading(false);
        return;
      }

      const formattedQuads = (quadsData || []).map(quad => ({
        ...quad,
        questions: quad.questions || [],
        questionCount: quad.questions?.length || 0
      })) as QuadWithQuestions[];

      setQuads(formattedQuads);

      // Check completion status
      const playerId = storage.getPlayerId();
      if (playerId) {
        // Fetch all responses for this player
        const { data: responsesData } = await supabase
          .from('responses')
          .select('quad_id, question_id')
          .eq('player_id', playerId);

        if (responsesData) {
          // Group responses by quad_id
          const responsesByQuad: { [quadId: string]: Set<string> } = {};
          responsesData.forEach(r => {
            if (!responsesByQuad[r.quad_id]) {
              responsesByQuad[r.quad_id] = new Set();
            }
            responsesByQuad[r.quad_id].add(r.question_id);
          });

          // Check which quads are completed
          const completed = new Set<string>();
          formattedQuads.forEach(quad => {
            const questionIds = quad.questions.map(q => q.id);
            const answeredQuestions = responsesByQuad[quad.id];

            if (answeredQuestions && questionIds.length > 0) {
              // Check if all questions have been answered
              const allAnswered = questionIds.every(qId => answeredQuestions.has(qId));
              if (allAnswered) {
                completed.add(quad.id);
              }
            }
          });

          setCompletedQuadIds(completed);
        }
      }

      setLoading(false);
    };

    const loadCurrentGroup = async () => {
      const groupCode = storage.getGroupCode();
      if (groupCode) {
        const { data: groupData } = await supabase
          .from('groups')
          .select('id, name, code')
          .eq('code', groupCode)
          .single();

        if (groupData) {
          setCurrentGroup(groupData);

          // Fetch all players in the group
          const { data: playersData } = await supabase
            .from('players')
            .select('*')
            .eq('group_id', groupData.id);

          if (playersData) {
            setGroupPlayers(playersData as Player[]);
          }
        }
      }
    };

    loadQuads();
    loadCurrentGroup();
  }, []);

  // Calculate quad completions when quads and group players are loaded
  useEffect(() => {
    const calculateCompletions = async () => {
      if (quads.length === 0 || groupPlayers.length === 0) {
        console.log('Skipping completion calc - quads:', quads.length, 'players:', groupPlayers.length);
        return;
      }

      // Fetch all responses from group members
      const playerIds = groupPlayers.map(p => p.id);
      console.log('Fetching responses for players:', playerIds);

      const { data: responsesData } = await supabase
        .from('responses')
        .select('player_id, question_id, quad_id')
        .in('player_id', playerIds);

      console.log('Got responses:', responsesData?.length);

      if (responsesData) {
        // Calculate which players completed which quads
        const completionMap = new Map<string, Player[]>();

        quads.forEach(quad => {
          const questionIds = quad.questions.map(q => q.id);
          const completedPlayers: Player[] = [];

          groupPlayers.forEach(player => {
            const playerResponses = responsesData.filter(
              r => r.player_id === player.id && r.quad_id === quad.id
            );
            const answeredQuestionIds = new Set(playerResponses.map(r => r.question_id));

            // Check if player answered all questions
            const allAnswered = questionIds.every(qId => answeredQuestionIds.has(qId));
            console.log(`Quad ${quad.name}, Player ${player.name}: ${answeredQuestionIds.size}/${questionIds.length} answered, completed: ${allAnswered}`);

            if (allAnswered && questionIds.length > 0) {
              completedPlayers.push(player);
            }
          });

          if (completedPlayers.length > 0) {
            console.log(`Quad ${quad.name} completed by:`, completedPlayers.map(p => p.name));
            completionMap.set(quad.id, completedPlayers);
          }
        });

        console.log('Final completion map size:', completionMap.size);
        setQuadCompletions(completionMap);
      }
    };

    calculateCompletions();
  }, [quads, groupPlayers]);

  const handleChangeGroup = () => {
    storage.removeItem('quadrants_player_id');
    storage.removeItem('quadrants_group_code');
    window.location.href = '/group';
  };

  if (loading) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-xl text-rust-primary relative z-10 font-bold uppercase tracking-wider animate-glow-pulse" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen industrial-base relative">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-20">
          {/* Logo/Title — Typewriter Punch */}
          <TypewriterTitle />

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-[#b8b8d1] max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-up delay-2">
            Discover alignment through visual data.
            <br />
            <span className="text-rust-primary font-bold">Map perspectives.</span>{' '}
            <span className="text-amber-secondary font-bold">Find connections.</span>{' '}
            <span className="text-burnt-orange font-bold">Unlock insights.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-up delay-4">
            <Link
              href="/create"
              className="group relative px-10 py-5 bg-burnt-orange texture-brushed rounded-none font-bold text-lg text-black uppercase tracking-wider overflow-hidden transition-all hover:scale-105"
              style={{
                boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              <span className="relative z-10" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>Create Quad</span>
            </Link>

            <Link
              href="/group"
              className="px-10 py-5 border-3 border-rust-primary text-rust-primary rounded-none font-bold text-lg uppercase tracking-wider hover:bg-rust-primary hover:text-black transition-all warm-glow"
            >
              Join Group
            </Link>

            <Link
              href="/suggest"
              className="px-10 py-5 border-2 border-steel-gray text-[#b8b8d1] rounded-none font-bold text-lg uppercase tracking-wider hover:border-rust-primary hover:text-rust-primary transition-all"
            >
              Suggest Question
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="inline-flex gap-8 px-8 py-4 bg-bg-warm-2 border-embossed rounded-none texture-concrete animate-scale-in delay-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-rust-primary">{quads.length}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Quads</div>
            </div>
            <div className="w-px bg-rust-primary/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-secondary">{completedQuadIds.size}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Completed</div>
            </div>
            <div className="w-px bg-rust-primary/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-burnt-orange">∞</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Insights</div>
            </div>
          </div>

          {/* Current Group Indicator */}
          {currentGroup && (
            <div className="mt-8 w-full flex justify-center">
              <div className="bg-bg-warm-2 border-embossed rounded-none p-6 max-w-3xl w-full texture-concrete">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">Currently In</p>
                      <p className="text-2xl font-black text-rust-primary uppercase tracking-wider">
                        {currentGroup.name}
                      </p>
                      <p className="text-sm text-[#b8b8d1] font-mono mt-1">Code: {currentGroup.code}</p>
                    </div>
                    <button
                      onClick={handleChangeGroup}
                      className="px-6 py-3 border-3 border-amber-secondary text-amber-secondary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-amber-secondary hover:text-black transition-all whitespace-nowrap"
                    >
                      Change Group
                    </button>
                  </div>

                  {/* Shareable Link */}
                  <div className="pt-4 border-t border-rust-primary/30">
                    <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-2">Invite Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/group/${currentGroup.code}`}
                        className="flex-1 px-4 py-2 bg-bg-warm-1 border-2 border-rust-primary/30 text-rust-primary rounded-none font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/group/${currentGroup.code}`);
                        }}
                        className="px-4 py-2 border-3 border-rust-primary text-rust-primary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-rust-primary hover:text-black transition-all whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Public Quads Grid */}
        {quads.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-rust-primary/50 flex-1 animate-line-reveal"></div>
              <h2 className="text-4xl font-black text-white uppercase tracking-wider animate-fade-up">
                <span className="text-rust-primary">Popular</span> Quads
              </h2>
              <div className="h-px bg-rust-primary/50 flex-1 animate-line-reveal" style={{ transformOrigin: 'right' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quads.map((quad, i) => (
                <div key={quad.id} className="animate-fade-up" style={{ animationDelay: `${i * 75}ms` }}>
                  <QuadCard
                    quad={quad}
                    completed={completedQuadIds.has(quad.id)}
                    completedPlayers={quadCompletions.get(quad.id) || []}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {quads.length === 0 && (
          <div className="text-center py-20 premium-card rounded-none max-w-2xl mx-auto">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-2xl text-[#b8b8d1] mb-2 font-bold">No Quads Yet</p>
            <p className="text-[#7a7a9e]">Be the pioneer. Create the first quad.</p>
          </div>
        )}
      </div>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-warm-1 to-transparent pointer-events-none"></div>
    </div>
  );
}
