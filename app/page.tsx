'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { QuadCard } from '@/components/QuadCard';
import { QuadWithQuestions } from '@/types';

export default function Home() {
  const [quads, setQuads] = useState<QuadWithQuestions[]>([]);
  const [completedQuadIds, setCompletedQuadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentGroup, setCurrentGroup] = useState<{ name: string; code: string } | null>(null);

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
          .select('name, code')
          .eq('code', groupCode)
          .single();

        if (groupData) {
          setCurrentGroup(groupData);
        }
      }
    };

    loadQuads();
    loadCurrentGroup();
  }, []);

  const handleChangeGroup = () => {
    storage.removeItem('quadrants_player_id');
    storage.removeItem('quadrants_group_code');
    window.location.href = '/group';
  };

  if (loading) {
    return (
      <div className="min-h-screen retro-grid relative flex items-center justify-center">
        <div className="scanlines" />
        <div className="text-xl text-[#00f0ff] neon-text-cyan relative z-10">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen retro-grid relative">
      {/* Scanline Effect */}
      <div className="scanlines" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-20">
          {/* Logo/Title */}
          <div className="mb-6 inline-block">
            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff 0%, #ff00aa 50%, #ffed00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                QUADRANTS
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50"></div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-[#b8b8d1] max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Discover alignment through visual data.
            <br />
            <span className="text-[#00f0ff]">Map perspectives.</span>{' '}
            <span className="text-[#ff00aa]">Find connections.</span>{' '}
            <span className="text-[#ffed00]">Unlock insights.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/create"
              className="group relative px-10 py-5 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] rounded-none font-bold text-lg text-black uppercase tracking-wider overflow-hidden transition-all hover:scale-105"
            >
              <span className="relative z-10">Create Quad</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>

            <Link
              href="/group"
              className="px-10 py-5 border-2 border-[#00f0ff] text-[#00f0ff] rounded-none font-bold text-lg uppercase tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all neon-glow-cyan"
            >
              Join Group
            </Link>

            <Link
              href="/suggest"
              className="px-10 py-5 border-2 border-[#7a7a9e] text-[#b8b8d1] rounded-none font-bold text-lg uppercase tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
            >
              Suggest Question
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="inline-flex gap-8 px-8 py-4 bg-[#1a1b2e] border border-[#00f0ff]/20 rounded-none">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00f0ff] neon-text-cyan">{quads.length}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Quads</div>
            </div>
            <div className="w-px bg-[#00f0ff]/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ff00aa] neon-text-magenta">{completedQuadIds.size}</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Completed</div>
            </div>
            <div className="w-px bg-[#00f0ff]/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ffed00]">∞</div>
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Insights</div>
            </div>
          </div>

          {/* Current Group Indicator */}
          {currentGroup && (
            <div className="mt-8 w-full flex justify-center">
              <div className="bg-[#1a1b2e] border-2 border-[#00f0ff]/50 rounded-none p-6 max-w-3xl w-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">Currently In</p>
                      <p className="text-2xl font-black text-[#00f0ff] neon-text-cyan uppercase tracking-wider">
                        {currentGroup.name}
                      </p>
                      <p className="text-sm text-[#b8b8d1] font-mono mt-1">Code: {currentGroup.code}</p>
                    </div>
                    <button
                      onClick={handleChangeGroup}
                      className="px-6 py-3 border-2 border-[#ff00aa] text-[#ff00aa] rounded-none font-bold uppercase text-xs tracking-wider hover:bg-[#ff00aa] hover:text-black transition-all whitespace-nowrap"
                    >
                      Change Group
                    </button>
                  </div>

                  {/* Shareable Link */}
                  <div className="pt-4 border-t border-[#00f0ff]/20">
                    <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-2">Invite Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/group?code=${currentGroup.code}`}
                        className="flex-1 px-4 py-2 bg-[#0a0b1a] border border-[#00f0ff]/20 text-[#00f0ff] rounded-none font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/group?code=${currentGroup.code}`);
                        }}
                        className="px-4 py-2 border-2 border-[#00f0ff] text-[#00f0ff] rounded-none font-bold uppercase text-xs tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all whitespace-nowrap"
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
              <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent flex-1"></div>
              <h2 className="text-4xl font-black text-white uppercase tracking-wider">
                <span className="text-[#00f0ff]">Popular</span> Quads
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quads.map(quad => (
                <QuadCard
                  key={quad.id}
                  quad={quad}
                  completed={completedQuadIds.has(quad.id)}
                />
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
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0b1a] to-transparent pointer-events-none"></div>
    </div>
  );
}
