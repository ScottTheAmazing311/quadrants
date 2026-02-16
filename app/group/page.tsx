'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AvatarUpload } from '@/components/AvatarUpload';
import { createGroup, createGroupWithMembers } from '../actions';
import { storage } from '@/lib/storage';

interface Member {
  name: string;
  avatarUrl: string | null;
}

export default function GroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'create' | 'join'>('create');

  // Create group state
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { name: '', avatarUrl: null }
  ]);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Join group state
  const [joinCode, setJoinCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill join code if provided in URL
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setJoinCode(codeParam.toUpperCase());
      setTab('join');
    }
  }, [searchParams]);

  const addMember = () => {
    setMembers([...members, { name: '', avatarUrl: null }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMemberName = (index: number, name: string) => {
    const updated = [...members];
    updated[index].name = name;
    setMembers(updated);
  };

  const updateMemberAvatar = (index: number, avatarUrl: string | null) => {
    const updated = [...members];
    updated[index].avatarUrl = avatarUrl;
    setMembers(updated);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate members
    const validMembers = members.filter(m => m.name.trim() !== '');
    if (validMembers.length === 0) {
      setError('Please add at least one member');
      setSubmitting(false);
      return;
    }

    try {
      const result = await createGroupWithMembers(groupName, validMembers);
      setCreatedCode(result.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.toUpperCase();
    storage.setGroupCode(code);
    router.push(`/group/${code}`);
  };

  return (
    <div className="min-h-screen retro-grid relative py-16">
      <div className="scanlines" />
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
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

        <div className="premium-card rounded-none overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b-2 border-[#00f0ff]/30">
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-4 px-6 font-bold uppercase tracking-wider transition-all ${
                tab === 'create'
                  ? 'bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] text-black'
                  : 'bg-[#1a1b2e] text-[#7a7a9e] hover:text-[#00f0ff]'
              }`}
            >
              Create Group
            </button>
            <button
              onClick={() => setTab('join')}
              className={`flex-1 py-4 px-6 font-bold uppercase tracking-wider transition-all ${
                tab === 'join'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black'
                  : 'bg-[#1a1b2e] text-[#7a7a9e] hover:text-[#00f0ff]'
              }`}
            >
              Join Group
            </button>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-500 rounded-none text-red-400">
                {error}
              </div>
            )}

            {tab === 'create' && !createdCode && (
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-wider">
                    Create a New Group
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] mb-4"></div>
                  <p className="text-[#b8b8d1]">
                    Create a group and add all members upfront
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#ff00aa]/30 text-white rounded-none focus:border-[#ff00aa] focus:outline-none transition-colors"
                    placeholder="e.g., THE SQUAD"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider">
                      Members
                    </label>
                    <button
                      type="button"
                      onClick={addMember}
                      className="px-4 py-2 border-2 border-[#39ff14] text-[#39ff14] rounded-none font-bold uppercase text-xs tracking-wider hover:bg-[#39ff14] hover:text-black transition-all"
                    >
                      + Add Member
                    </button>
                  </div>

                  <div className="space-y-4">
                    {members.map((member, index) => (
                      <div key={index} className="bg-[#1a1b2e] border-2 border-[#00f0ff]/30 rounded-none p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[#00f0ff] font-bold uppercase text-sm">Member {index + 1}</span>
                          {members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="text-[#ff00aa] hover:text-red-500 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateMemberName(index, e.target.value)}
                          className="w-full px-4 py-3 mb-3 bg-[#0a0b1a] border-2 border-[#00f0ff]/20 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors"
                          placeholder="Member name"
                        />
                        <AvatarUpload onUpload={(url) => updateMemberAvatar(index, url)} />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] text-black rounded-none font-black uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 text-lg"
                >
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </form>
            )}

            {tab === 'create' && createdCode && (
              <div className="text-center space-y-6">
                <div className="inline-block p-8 bg-green-900/20 border-2 border-[#39ff14] rounded-none">
                  <p className="text-[#39ff14] font-bold uppercase mb-3 tracking-wider text-lg">Group Created!</p>
                  <p className="text-5xl font-black text-[#39ff14] tracking-wider mb-3 font-mono neon-text-green">
                    {createdCode}
                  </p>
                  <p className="text-sm text-[#39ff14]/80 uppercase tracking-wider">Share this code with your group</p>
                  <p className="text-xs text-[#39ff14]/60 mt-2">Members will select their name when they join</p>
                </div>

                {/* Shareable Link */}
                <div className="bg-[#1a1b2e] border-2 border-[#00f0ff]/30 rounded-none p-4">
                  <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-2">Or Share This Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/group?code=${createdCode}`}
                      className="flex-1 px-4 py-2 bg-[#0a0b1a] border border-[#00f0ff]/20 text-[#00f0ff] rounded-none font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/group?code=${createdCode}`);
                      }}
                      className="px-4 py-2 border-2 border-[#00f0ff] text-[#00f0ff] rounded-none font-bold uppercase text-xs tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCode);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-[#39ff14] text-[#39ff14] rounded-none font-bold uppercase tracking-wider hover:bg-[#39ff14] hover:text-black transition-all"
                  >
                    Copy Code
                  </button>
                  <Link
                    href={`/group/${createdCode}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black rounded-none font-bold uppercase tracking-wider hover:scale-105 transition-all text-center"
                  >
                    View Group
                  </button>
                </div>
              </div>
            )}

            {tab === 'join' && (
              <form onSubmit={handleJoinGroup} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-wider">
                    Join a Group
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] mb-4"></div>
                  <p className="text-[#b8b8d1]">
                    Enter the 6-character code, then select your name
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7a7a9e] uppercase tracking-wider mb-2">
                    Group Code *
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff]/30 text-white rounded-none focus:border-[#00f0ff] focus:outline-none transition-colors uppercase text-center text-2xl font-mono font-bold tracking-wider neon-text-cyan"
                    placeholder="ABC123"
                  />
                </div>

                <button
                  type="submit"
                  disabled={joinCode.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black rounded-none font-black uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 text-lg"
                >
                  Continue
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
