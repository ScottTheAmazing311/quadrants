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
    const newValue = parseInt(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full space-y-6">
      {/* Labels */}
      <div className="flex justify-between px-4">
        <div className="text-left flex-1">
          <div className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">← 1-5</div>
          <div className="text-base font-bold text-rust-primary uppercase tracking-wide">{leftLabel}</div>
        </div>
        <div className="text-right flex-1">
          <div className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">6-10 →</div>
          <div className="text-base font-bold text-amber-secondary uppercase tracking-wide">{rightLabel}</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4">
        {/* Background Track */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 bg-bg-warm-2 border-2 border-rust-primary/30 texture-carbon"></div>

        {/* Filled Track - Split color design */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 pointer-events-none transition-all duration-200">
          <div
            className="absolute left-0 top-0 h-full bg-rust-primary texture-carbon transition-all duration-200"
            style={{ width: `${Math.min(((localValue - 1) / 9) * 100, 44.44)}%` }}
          ></div>
          <div
            className="absolute left-1/2 top-0 h-full bg-amber-secondary texture-carbon transition-all duration-200"
            style={{
              width: `${Math.max(0, ((localValue - 5.5) / 4.5) * 50)}%`,
              opacity: localValue > 5.5 ? 1 : 0
            }}
          ></div>
        </div>

        {/* Tick Marks */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => (
            <div key={tick} className="relative">
              <div
                className={`w-0.5 h-4 transition-all ${
                  tick <= localValue
                    ? tick <= 5
                      ? 'bg-rust-primary'
                      : 'bg-amber-secondary'
                    : 'bg-bg-warm-3'
                }`}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-[#7a7a9e] font-mono">
                {tick}
              </div>
            </div>
          ))}
        </div>

        {/* Input Range */}
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={localValue}
          onChange={handleChange}
          className="w-full relative z-10 appearance-none bg-transparent cursor-pointer slider-retro"
        />
      </div>

      {/* Current Value Display */}
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-bg-warm-2 border-embossed rounded-none texture-concrete">
          <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Value</div>
          <div className="text-4xl font-black text-rust-primary font-mono">{localValue}</div>
        </div>
      </div>

      <style jsx>{`
        .slider-retro::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 0;
          background: #c87341;
          background-image:
            radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.3) 35%, transparent 35%),
            radial-gradient(circle at 50% 50%, transparent 45%, rgba(255, 147, 65, 0.2) 45%, rgba(255, 147, 65, 0.2) 50%, transparent 50%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.2) 65%, transparent 65%);
          border: 3px solid #1a1410;
          box-shadow:
            0 0 0 2px #c87341,
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px rgba(255, 147, 65, 0.1),
            0 4px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-retro::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #ff9800;
          box-shadow:
            0 0 0 2px #ff9800,
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px rgba(255, 152, 0, 0.15),
            0 6px 12px rgba(0, 0, 0, 0.5),
            0 2px 8px rgba(200, 115, 65, 0.3);
        }

        .slider-retro::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }

        .slider-retro::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 0;
          background: #c87341;
          background-image:
            radial-gradient(circle at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.3) 35%, transparent 35%),
            radial-gradient(circle at 50% 50%, transparent 45%, rgba(255, 147, 65, 0.2) 45%, rgba(255, 147, 65, 0.2) 50%, transparent 50%),
            radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.2) 60%, rgba(0, 0, 0, 0.2) 65%, transparent 65%);
          border: 3px solid #1a1410;
          box-shadow:
            0 0 0 2px #c87341,
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px rgba(255, 147, 65, 0.1),
            0 4px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-retro::-moz-range-thumb:hover {
          transform: scale(1.15);
          background: #ff9800;
          box-shadow:
            0 0 0 2px #ff9800,
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 -2px 4px rgba(255, 152, 0, 0.15),
            0 6px 12px rgba(0, 0, 0, 0.5),
            0 2px 8px rgba(200, 115, 65, 0.3);
        }

        .slider-retro::-moz-range-thumb:active {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
