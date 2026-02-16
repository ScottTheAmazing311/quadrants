'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/Avatar';
import { Player, Response, Quad } from '@/types';
import {
  findMostAlike,
  findMostOpposed,
  findMostExtreme,
  findMostNeutral,
  findWildcard
} from '@/lib/analytics';

export default function AnalysisPage({ params }: { params: { quadId: string } }) {
  const [quad, setQuad] = useState<Quad | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [responsesByPlayer, setResponsesByPlayer] = useState<Map<string, Response[]>>(new Map());
  const [groupCode, setGroupCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const gcode = urlParams.get('group');
      setGroupCode(gcode);

      // Fetch quad
      const { data: quadData } = await supabase
        .from('quads')
        .select('*')
        .eq('id', params.quadId)
        .single();

      if (quadData) {
        setQuad(quadData as Quad);
      }

      // Fetch responses
      const { data: responsesData } = await supabase
        .from('responses')
        .select('*')
        .eq('quad_id', params.quadId);

      if (responsesData) {
        const playerIds = [...new Set(responsesData.map(r => r.player_id))];

        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .in('id', playerIds);

        if (playersData) {
          setPlayers(playersData as Player[]);

          // Group responses by player
          const byPlayer = new Map<string, Response[]>();
          responsesData.forEach(response => {
            const existing = byPlayer.get(response.player_id) || [];
            byPlayer.set(response.player_id, [...existing, response as Response]);
          });
          setResponsesByPlayer(byPlayer);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [params.quadId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Calculating superlatives...</div>
      </div>
    );
  }

  if (!quad || players.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Not Enough Data</h1>
          <p className="text-gray-600 mb-8">At least 2 players need to complete the quad for analysis.</p>
          <Link 
            href={`/results/${params.quadId}${groupCode ? `?group=${groupCode}` : ''}`}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  const mostAlike = findMostAlike(players, responsesByPlayer);
  const mostOpposed = findMostOpposed(players, responsesByPlayer);
  const mostExtreme = findMostExtreme(players, responsesByPlayer);
  const mostNeutral = findMostNeutral(players, responsesByPlayer);
  const wildcard = findWildcard(players, responsesByPlayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link 
            href={`/results/${params.quadId}${groupCode ? `?group=${groupCode}` : ''}`}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Grid
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Analysis & Superlatives
          </h1>
          <p className="text-xl text-gray-600">
            {quad.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Alike */}
          {mostAlike && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Alike</h2>
                <p className="text-gray-600 mb-6">Two peas in a pod</p>
              </div>
              <div className="flex justify-center gap-6 mb-4">
                {mostAlike.players.map(player => (
                  <div key={player.id} className="flex flex-col items-center">
                    <Avatar imageUrl={player.avatar_url} name={player.name} size="lg" />
                    <p className="mt-2 font-medium text-gray-900">{player.name}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">Distance Score: </span>
                <span className="text-lg font-bold text-blue-600">{mostAlike.distance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Most Opposed */}
          {mostOpposed && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-200">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Opposed</h2>
                <p className="text-gray-600 mb-6">Opposite ends of the spectrum</p>
              </div>
              <div className="flex justify-center gap-6 mb-4">
                {mostOpposed.players.map(player => (
                  <div key={player.id} className="flex flex-col items-center">
                    <Avatar imageUrl={player.avatar_url} name={player.name} size="lg" />
                    <p className="mt-2 font-medium text-gray-900">{player.name}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">Distance Score: </span>
                <span className="text-lg font-bold text-red-600">{mostOpposed.distance.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Most Extreme */}
          {mostExtreme && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Extreme</h2>
                <p className="text-gray-600 mb-6">Strongest opinions</p>
              </div>
              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center">
                  <Avatar imageUrl={mostExtreme.player.avatar_url} name={mostExtreme.player.name} size="lg" />
                  <p className="mt-2 font-medium text-gray-900">{mostExtreme.player.name}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">Avg Deviation: </span>
                <span className="text-lg font-bold text-purple-600">{mostExtreme.deviation.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Most Neutral */}
          {mostNeutral && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Neutral</h2>
                <p className="text-gray-600 mb-6">Playing it safe</p>
              </div>
              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center">
                  <Avatar imageUrl={mostNeutral.player.avatar_url} name={mostNeutral.player.name} size="lg" />
                  <p className="mt-2 font-medium text-gray-900">{mostNeutral.player.name}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">Avg Deviation: </span>
                <span className="text-lg font-bold text-gray-600">{mostNeutral.deviation.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Wildcard */}
          {wildcard && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-yellow-200 md:col-span-2">
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wildcard</h2>
                <p className="text-gray-600 mb-6">All over the place</p>
              </div>
              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center">
                  <Avatar imageUrl={wildcard.player.avatar_url} name={wildcard.player.name} size="lg" />
                  <p className="mt-2 font-medium text-gray-900">{wildcard.player.name}</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-600">Variance Score: </span>
                <span className="text-lg font-bold text-yellow-600">{wildcard.variance.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
