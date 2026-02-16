'use client';

import { useMemo, useState, useRef } from 'react';
import { Player, Question, Response } from '@/types';
import { Avatar } from './Avatar';
import html2canvas from 'html2canvas';

interface QuadrantGridProps {
  questions: Question[];
  responses: Response[];
  players: Player[];
  selectedXQuestionId: string;
  selectedYQuestionId: string;
  onAxisChange?: (axis: 'x' | 'y', questionId: string) => void;
}

interface PlayerPosition {
  player: Player;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export function QuadrantGrid({
  questions,
  responses,
  players,
  selectedXQuestionId,
  selectedYQuestionId,
  onAxisChange
}: QuadrantGridProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    console.log('Export button clicked');

    if (!gridRef.current) {
      console.error('Grid ref not found');
      return;
    }

    try {
      console.log('Starting html2canvas...');
      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        backgroundColor: '#0a0b1a',
        logging: false,
        allowTaint: true,
        useCORS: true,
        imageTimeout: 0, // Don't timeout on images
        onclone: (clonedDoc) => {
          // Ensure all images are visible in clone
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            img.style.display = 'block';
          });
        },
      });

      console.log('Canvas created, converting to image...');

      // Convert to data URL and download
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `quadrant-${xQuestion?.prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Download triggered');
    } catch (error) {
      console.error('Failed to export PNG:', error);
    }
  };

  const xQuestion = questions.find(q => q.id === selectedXQuestionId);
  const yQuestion = questions.find(q => q.id === selectedYQuestionId);

  // Calculate positions with collision detection
  const playerPositions = useMemo(() => {
    if (!xQuestion || !yQuestion) return [];

    const positions: PlayerPosition[] = players.map(player => {
      const xResponse = responses.find(
        r => r.player_id === player.id && r.question_id === selectedXQuestionId
      );
      const yResponse = responses.find(
        r => r.player_id === player.id && r.question_id === selectedYQuestionId
      );

      const xValue = xResponse?.value ?? 5.5;
      const yValue = yResponse?.value ?? 5.5;

      // Map 1-10 range to 0-100% of grid
      const x = ((xValue - 1) / 9) * 100;
      const y = ((10 - yValue) / 9) * 100; // Invert Y so higher values are at top

      return { player, x, y, offsetX: 0, offsetY: 0 };
    });

    // Collision detection and handling
    const COLLISION_THRESHOLD = 8; // percentage
    const SPOKE_RADIUS = 6; // percentage

    positions.forEach((pos1, i) => {
      const colliding: PlayerPosition[] = [pos1];

      positions.forEach((pos2, j) => {
        if (i >= j) return;
        const distance = Math.sqrt(
          Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
        );

        if (distance < COLLISION_THRESHOLD) {
          if (!colliding.some(p => p.player.id === pos2.player.id)) {
            colliding.push(pos2);
          }
        }
      });

      if (colliding.length > 1) {
        // Arrange in spoke pattern
        colliding.forEach((pos, idx) => {
          const angle = (idx / colliding.length) * 2 * Math.PI;
          pos.offsetX = SPOKE_RADIUS * Math.cos(angle);
          pos.offsetY = SPOKE_RADIUS * Math.sin(angle);
        });
      }
    });

    return positions;
  }, [players, responses, selectedXQuestionId, selectedYQuestionId, xQuestion, yQuestion]);

  if (!xQuestion || !yQuestion) {
    return (
      <div className="text-center text-[#b8b8d1] py-20">
        Select questions for both axes
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportPNG}
          className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black rounded-none font-bold uppercase text-xs tracking-wider hover:scale-105 transition-all"
        >
          Export as PNG
        </button>
      </div>

      {/* Axis selectors with buttons */}
      {onAxisChange && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-8 items-start">
          {/* X-Axis questions (left side) */}
          <div>
            <h3 className="text-sm font-bold text-[#7a7a9e] uppercase tracking-wider mb-3">
              X-Axis (Horizontal)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {questions.map(q => (
                <button
                  key={q.id}
                  onClick={() => onAxisChange('x', q.id)}
                  className={`w-full text-left px-4 py-3 rounded-none transition-all text-sm ${
                    selectedXQuestionId === q.id
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] text-black font-bold'
                      : 'bg-[#1a1b2e] border-2 border-[#00f0ff]/30 text-[#b8b8d1] hover:border-[#00f0ff] hover:text-white'
                  }`}
                >
                  {q.prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Grid (center) */}
          <div ref={gridRef} className="relative w-full aspect-square max-w-4xl mx-auto bg-[#0a0b1a] rounded-none border-2 border-[#00f0ff]/50 p-8">
            {/* Quadrant backgrounds */}
            <div className="absolute inset-8 grid grid-cols-2 grid-rows-2 pointer-events-none">
              <div className="bg-[#00f0ff]/5"></div>
              <div className="bg-[#ff00aa]/5"></div>
              <div className="bg-[#39ff14]/5"></div>
              <div className="bg-[#ffed00]/5"></div>
            </div>

            {/* Axes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-full h-0.5 bg-[#00f0ff]/50"></div>
              <div className="absolute h-full w-0.5 bg-[#00f0ff]/50"></div>
            </div>

            {/* Axis labels - repositioned */}
            {/* X-Axis left label (bottom left of line) */}
            <div className="absolute right-[52%] bottom-6 text-xs font-bold text-[#00f0ff] uppercase tracking-wider max-w-[150px] text-right">
              {xQuestion.label_left}
            </div>
            {/* X-Axis right label (top right of line) */}
            <div className="absolute left-[52%] top-6 text-xs font-bold text-[#ff00aa] uppercase tracking-wider max-w-[150px]">
              {xQuestion.label_right}
            </div>

            {/* Y-Axis left label (bottom right, below line) */}
            <div className="absolute right-6 bottom-[48%] text-xs font-bold text-[#00f0ff] uppercase tracking-wider max-w-[120px] text-right translate-y-full pt-2">
              {yQuestion.label_left}
            </div>
            {/* Y-Axis right label (top left, above line) */}
            <div className="absolute left-6 top-[48%] text-xs font-bold text-[#ff00aa] uppercase tracking-wider max-w-[120px] -translate-y-full pb-2">
              {yQuestion.label_right}
            </div>

            {/* Player avatars */}
            <div className="absolute inset-0">
              {playerPositions.map(({ player, x, y, offsetX, offsetY }) => (
                <div
                  key={player.id}
                  className="absolute transition-all duration-500 ease-in-out"
                  style={{
                    left: `calc(${x}% + ${offsetX}%)`,
                    top: `calc(${y}% + ${offsetY}%)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onMouseEnter={() => setHoveredPlayer(player.id)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                >
                  <div className={`transition-transform ${hoveredPlayer === player.id ? 'scale-110' : ''}`}>
                    <Avatar
                      imageUrl={player.avatar_url}
                      name={player.name}
                      size="md"
                    />
                  </div>

                  {/* Tooltip */}
                  {hoveredPlayer === player.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#00f0ff] text-black text-sm font-bold rounded-none whitespace-nowrap pointer-events-none z-10 uppercase tracking-wider neon-glow-cyan">
                      {player.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#00f0ff]"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Y-Axis questions (right side) */}
          <div>
            <h3 className="text-sm font-bold text-[#7a7a9e] uppercase tracking-wider mb-3">
              Y-Axis (Vertical)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pl-2">
              {questions.map(q => (
                <button
                  key={q.id}
                  onClick={() => onAxisChange('y', q.id)}
                  className={`w-full text-left px-4 py-3 rounded-none transition-all text-sm ${
                    selectedYQuestionId === q.id
                      ? 'bg-gradient-to-r from-[#ff00aa] to-[#00f0ff] text-black font-bold'
                      : 'bg-[#1a1b2e] border-2 border-[#ff00aa]/30 text-[#b8b8d1] hover:border-[#ff00aa] hover:text-white'
                  }`}
                >
                  {q.prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="text-center text-sm text-[#7a7a9e] uppercase tracking-wider">
        Hover over avatars to see names
      </div>
    </div>
  );
}
