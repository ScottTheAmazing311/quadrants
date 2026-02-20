'use client';

import { useState, useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}

export function Slider({ value, onChange, leftLabel, rightLabel }: SliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Calculate bowtie effect - track gets wider towards extremes
  const getTrackHeight = (position: number) => {
    // position is 0-100 representing percentage along track
    // Convert to value (1-10 scale)
    const val = 1 + (position / 100) * 9;
    const distanceFromCenter = Math.abs(val - 5.5);
    const normalizedDistance = distanceFromCenter / 4.5; // 0 at center, 1 at extremes
    const minHeight = 8;
    const maxHeight = 32;
    return minHeight + (maxHeight - minHeight) * normalizedDistance;
  };

  return (
    <div className="w-full space-y-6">
      {/* Labels */}
      <div className="flex justify-between px-4">
        <div className="text-left flex-1">
          <div className="text-base font-bold text-rust-primary uppercase tracking-wide" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{leftLabel}</div>
        </div>
        <div className="text-right flex-1">
          <div className="text-base font-bold text-amber-secondary uppercase tracking-wide" style={{ fontFamily: 'var(--font-display), system-ui, sans-serif' }}>{rightLabel}</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4 py-12">
        {/* Bowtie Background Track - using SVG for smooth taper */}
        <svg
          className="absolute left-4 right-4 top-1/2 -translate-y-1/2 w-[calc(100%-2rem)] pointer-events-none"
          height="80"
          preserveAspectRatio="none"
          viewBox="0 0 100 80"
        >
          {/* Background bowtie shape - much more dramatic */}
          <defs>
            <linearGradient id="bowtieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgba(200, 115, 65, 0.15)' }} />
              <stop offset="50%" style={{ stopColor: 'rgba(84, 110, 122, 0.1)' }} />
              <stop offset="100%" style={{ stopColor: 'rgba(255, 152, 0, 0.15)' }} />
            </linearGradient>
          </defs>

          {/* Main bowtie shape - starts at 60px wide on edges, 12px in center */}
          <polygon
            points="0,10 50,34 100,10 100,70 50,46 0,70"
            fill="url(#bowtieGradient)"
            stroke="rgba(200, 115, 65, 0.4)"
            strokeWidth="0.8"
            className="transition-all duration-300"
          />

          {/* Inner bowtie for depth */}
          <polygon
            points="0,20 50,36 100,20 100,60 50,44 0,60"
            fill="rgba(42, 34, 24, 0.6)"
            stroke="rgba(200, 115, 65, 0.2)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Position indicator - glowing line at thumb position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 pointer-events-none transition-all duration-200"
          style={{
            left: `calc(1rem + ${((localValue - 1) / 9) * 100}% - 2px)`,
            height: `${20 + Math.abs(localValue - 5.5) / 4.5 * 40}px`,
            background: localValue < 5.5
              ? 'linear-gradient(to bottom, rgba(200, 115, 65, 0), rgba(200, 115, 65, 0.8), rgba(200, 115, 65, 0))'
              : 'linear-gradient(to bottom, rgba(255, 152, 0, 0), rgba(255, 152, 0, 0.8), rgba(255, 152, 0, 0))',
            boxShadow: localValue < 5.5
              ? '0 0 12px rgba(200, 115, 65, 0.6)'
              : '0 0 12px rgba(255, 152, 0, 0.6)'
          }}
        ></div>

        {/* Center indicator line */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-12 bg-steel-gray/40 pointer-events-none"></div>

        {/* Input Range */}
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          value={localValue}
          onChange={handleChange}
          className="w-full relative z-10 appearance-none bg-transparent cursor-pointer slider-retro"
        />
      </div>

      {/* Subtle position indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-bg-warm-2/50 border border-rust-primary/20 rounded-none">
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => {
              const dotValue = i + 1;
              const isActive = Math.round(localValue) >= dotValue;
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? dotValue <= 5
                        ? 'bg-rust-primary'
                        : 'bg-amber-secondary'
                      : 'bg-bg-warm-3'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-retro::-webkit-slider-thumb {
          appearance: none;
          width: 40px;
          height: 40px;
          border-radius: 0;
          background: ${localValue < 5.5 ? '#c87341' : '#ff9800'};
          background-image:
            radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.3) 35%, transparent 35%),
            radial-gradient(circle at 50% 50%, transparent 45%, ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.2)' : 'rgba(255, 152, 0, 0.2)'} 45%, ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.2)' : 'rgba(255, 152, 0, 0.2)'} 50%, transparent 50%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.2) 65%, transparent 65%);
          border: 3px solid #1a1410;
          box-shadow:
            0 0 0 3px ${localValue < 5.5 ? '#c87341' : '#ff9800'},
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.1)' : 'rgba(255, 152, 0, 0.1)'},
            0 6px 12px rgba(0, 0, 0, 0.5),
            0 0 20px ${localValue < 5.5 ? 'rgba(200, 115, 65, 0.4)' : 'rgba(255, 152, 0, 0.4)'};
          cursor: grab;
          transition: all 0.2s ease;
        }

        .slider-retro::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow:
            0 0 0 3px ${localValue < 5.5 ? '#c87341' : '#ff9800'},
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.15)' : 'rgba(255, 152, 0, 0.15)'},
            0 8px 16px rgba(0, 0, 0, 0.6),
            0 0 30px ${localValue < 5.5 ? 'rgba(200, 115, 65, 0.6)' : 'rgba(255, 152, 0, 0.6)'};
        }

        .slider-retro::-webkit-slider-thumb:active {
          transform: scale(1.05);
          cursor: grabbing;
        }

        .slider-retro::-moz-range-thumb {
          width: 40px;
          height: 40px;
          border-radius: 0;
          background: ${localValue < 5.5 ? '#c87341' : '#ff9800'};
          background-image:
            radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.3) 35%, transparent 35%),
            radial-gradient(circle at 50% 50%, transparent 45%, ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.2)' : 'rgba(255, 152, 0, 0.2)'} 45%, ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.2)' : 'rgba(255, 152, 0, 0.2)'} 50%, transparent 50%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.2) 65%, transparent 65%);
          border: 3px solid #1a1410;
          box-shadow:
            0 0 0 3px ${localValue < 5.5 ? '#c87341' : '#ff9800'},
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.1)' : 'rgba(255, 152, 0, 0.1)'},
            0 6px 12px rgba(0, 0, 0, 0.5),
            0 0 20px ${localValue < 5.5 ? 'rgba(200, 115, 65, 0.4)' : 'rgba(255, 152, 0, 0.4)'};
          cursor: grab;
          transition: all 0.2s ease;
        }

        .slider-retro::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow:
            0 0 0 3px ${localValue < 5.5 ? '#c87341' : '#ff9800'},
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px ${localValue < 5.5 ? 'rgba(255, 147, 65, 0.15)' : 'rgba(255, 152, 0, 0.15)'},
            0 8px 16px rgba(0, 0, 0, 0.6),
            0 0 30px ${localValue < 5.5 ? 'rgba(200, 115, 65, 0.6)' : 'rgba(255, 152, 0, 0.6)'};
        }

        .slider-retro::-moz-range-thumb:active {
          transform: scale(1.05);
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}
