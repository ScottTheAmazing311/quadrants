'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { Group, Player } from '@/types';

export default function GroupLobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      // Fetch group
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (groupData) {
        setGroup(groupData as Group);

        // Fetch players in this group
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('group_id', groupData.id);

        if (playersData) {
          setPlayers(playersData as Player[]);
        }

        // Check if user has a player ID for this group
        const storedPlayerId = storage.getPlayerId();
        const storedGroupCode = storage.getGroupCode();

        if (storedPlayerId && storedGroupCode === code.toUpperCase()) {
          // Verify the player exists in this group
          const playerExists = playersData?.some(p => p.id === storedPlayerId);
          if (playerExists) {
            setCurrentPlayerId(storedPlayerId);
          }
        }
      }

      setLoading(false);
    };

    loadGroup();
  }, [code]);

  const handleSelectPlayer = (playerId: string) => {
    storage.setPlayerId(playerId);
    storage.setGroupCode(code.toUpperCase());
    setCurrentPlayerId(playerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-xl text-rust-primary relative z-10 animate-glow-pulse" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}>Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen industrial-base relative flex items-center justify-center">
        <div className="text-center premium-card p-12 rounded-none max-w-lg relative z-10">
          <h1 className="text-4xl font-black text-white uppercase mb-4">Group Not Found</h1>
          <p className="text-[#b8b8d1] mb-6">The code "{code}" doesn't match any group.</p>
          <Link href="/group" className="text-rust-primary hover:text-amber-secondary transition-colors">
            Back to Join/Create
          </Link>
        </div>
      </div>
    );
  }

  // If user hasn't selected their player yet, show selection screen
  if (!currentPlayerId) {
    return (
      <div className="min-h-screen industrial-base relative py-16">
        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <div className="mb-8">
            <Link
              href="/group"
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
              {group.name}
            </h1>
            <div className="h-1 w-32 bg-rust-primary texture-brushed mb-4"></div>
            <p className="text-[#b8b8d1] mb-8">
              Select your name to join the group
            </p>

            {players.length === 0 ? (
              <div className="text-center py-12 text-[#b8b8d1]">
                <p className="mb-4">No members in this group yet.</p>
                <p className="text-sm">Ask the group creator to add members.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player.id)}
                    className="p-6 bg-bg-warm-2 border-2 border-rust-primary/30 rounded-none hover:border-rust-primary hover:scale-105 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-4">
                      {player.avatar_url ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-rust-primary group-hover:warm-glow transition-all">
                          <img
                            src={player.avatar_url}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-rust-primary flex items-center justify-center border-2 border-rust-primary group-hover:warm-glow transition-all">
                          <span className="text-3xl font-black text-black">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xl font-bold text-white uppercase tracking-wider">
                        {player.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User has selected their player - show group lobby
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  return (
    <div className="min-h-screen industrial-base relative py-16">
      <div className="\!-- scanlines removed --" />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-rust-primary hover:text-amber-secondary flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="premium-card rounded-none p-8 md:p-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-wider">
                {group.name}
              </h1>
              <div className="h-1 w-32 bg-rust-primary texture-brushed mb-4"></div>
              <p className="text-[#b8b8d1]">
                Playing as: <span className="text-rust-primary font-bold">{currentPlayer?.name}</span>
              </p>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">Group Code</div>
              <div className="text-3xl font-black text-burnt-orange font-mono ">
                {code.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-white uppercase mb-4 tracking-wider">Members</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`text-center p-4 rounded-none ${
                    player.id === currentPlayerId
                      ? 'bg-[#00f0ff]/10 border-2 border-rust-primary'
                      : 'bg-bg-warm-2 border-2 border-rust-primary/20'
                  }`}
                >
                  {player.avatar_url ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-rust-primary mx-auto mb-2">
                      <img
                        src={player.avatar_url}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-rust-primary flex items-center justify-center border-2 border-rust-primary mx-auto mb-2">
                      <span className="text-2xl font-black text-black">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-sm font-bold text-white truncate">{player.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-rust-primary/30 pt-8">
            <h2 className="text-xl font-black text-white uppercase mb-4 tracking-wider">Play a Quad</h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="px-6 py-4 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all text-center"
              >
                Browse Public Quads
              </Link>
              <Link
                href="/create"
                className="px-6 py-4 border-2 border-rust-primary text-rust-primary rounded-none font-bold uppercase tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all text-center"
              >
                Create a Quad for This Group
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
