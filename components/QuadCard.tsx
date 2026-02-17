import Link from 'next/link';
import { QuadWithQuestions, Player } from '@/types';
import { Avatar } from './Avatar';

interface QuadCardProps {
  quad: QuadWithQuestions;
  groupCode?: string;
  completed?: boolean;
  completedPlayers?: Player[];
}

export function QuadCard({ quad, groupCode, completed = false, completedPlayers = [] }: QuadCardProps) {
  const playUrl = groupCode
    ? `/play/${quad.id}?group=${groupCode}`
    : `/play/${quad.id}`;

  const resultsUrl = groupCode
    ? `/results/${quad.id}?group=${groupCode}`
    : `/results/${quad.id}`;

  return (
    <div className="premium-card rounded-none p-6 relative overflow-hidden h-full flex flex-col">
      {/* Completed Badge */}
      {completed && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-10 h-10 bg-burnt-orange rounded-none flex items-center justify-center border-2 border-bg-warm-1 warm-glow">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Corner Accent - Embossed borders instead of gradients */}
      <div className="absolute top-0 right-0 w-16 h-16 border-b-2 border-l-2 border-rust-primary opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-t-2 border-r-2 border-amber-secondary opacity-30"></div>

      {/* Header */}
      <div className="mb-4 flex-1">
        <h3 className="text-2xl font-black text-white uppercase tracking-wide mb-3">
          {quad.name}
        </h3>

        {quad.description && (
          <p className="text-[#b8b8d1] text-sm leading-relaxed line-clamp-2">
            {quad.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-rust-primary/30 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-rust-primary rounded-none"></div>
          <span className="text-[#7a7a9e] text-xs uppercase tracking-wider">
            {quad.questionCount || quad.questions?.length || 0} Qs
          </span>
        </div>

        {quad.playerCount !== undefined && (
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-amber-secondary rounded-none"></div>
            <span className="text-[#7a7a9e] text-xs uppercase tracking-wider">
              {quad.playerCount} Played
            </span>
          </div>
        )}
      </div>

      {/* Completed Group Members */}
      {completedPlayers.length > 0 && (
        <div className="mb-4 pb-4 border-b border-rust-primary/30">
          <p className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-2">Completed By</p>
          <div className="flex flex-wrap gap-2">
            {completedPlayers.map(player => (
              <div key={player.id} className="relative group">
                <Avatar
                  imageUrl={player.avatar_url}
                  name={player.name}
                  size="sm"
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-rust-primary text-black text-xs font-bold rounded-none whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {player.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {completed ? (
        <div className="flex gap-2">
          <Link
            href={resultsUrl}
            className="flex-1 py-3 bg-burnt-orange texture-brushed text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all text-center"
            style={{
              boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
            }}
          >
            View Results
          </Link>
          <Link
            href={playUrl}
            className="flex-1 py-3 border-3 border-rust-primary text-rust-primary rounded-none font-bold uppercase text-xs tracking-wider hover:bg-rust-primary hover:text-black transition-all text-center"
          >
            Retake
          </Link>
        </div>
      ) : (
        <Link
          href={playUrl}
          className="block w-full py-3 bg-rust-primary texture-brushed text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all text-center"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          Play Quad
        </Link>
      )}
    </div>
  );
}
