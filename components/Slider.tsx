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
          <div className="text-base font-bold text-[#00f0ff] uppercase tracking-wide">{leftLabel}</div>
        </div>
        <div className="text-right flex-1">
          <div className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">6-10 →</div>
          <div className="text-base font-bold text-[#ff00aa] uppercase tracking-wide">{rightLabel}</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4">
        {/* Background Track */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 bg-[#1a1b2e] border border-[#00f0ff]/30"></div>

        {/* Filled Track */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-[#00f0ff] to-[#ff00aa] pointer-events-none transition-all duration-200"
          style={{ width: `calc(${((localValue - 1) / 9) * 100}% - 1rem)` }}
        ></div>

        {/* Tick Marks */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tick) => (
            <div key={tick} className="relative">
              <div
                className={`w-0.5 h-4 transition-all ${
                  tick <= localValue
                    ? tick <= 5
                      ? 'bg-[#00f0ff]'
                      : 'bg-[#ff00aa]'
                    : 'bg-[#2a2b3e]'
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
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff] rounded-none">
          <div className="text-xs text-[#7a7a9e] uppercase tracking-wider">Value</div>
          <div className="text-4xl font-black text-white neon-text-cyan font-mono">{localValue}</div>
        </div>
      </div>

      <style jsx>{`
        .slider-retro::-webkit-slider-thumb {
          appearance: none;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #00f0ff 0%, #ff00aa 100%);
          border: 3px solid #0a0b1a;
          box-shadow:
            0 0 0 2px #00f0ff,
            0 0 20px rgba(0, 240, 255, 0.5),
            0 0 40px rgba(255, 0, 170, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-retro::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow:
            0 0 0 2px #00f0ff,
            0 0 30px rgba(0, 240, 255, 0.8),
            0 0 50px rgba(255, 0, 170, 0.5);
        }

        .slider-retro::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }

        .slider-retro::-moz-range-thumb {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #00f0ff 0%, #ff00aa 100%);
          border: 3px solid #0a0b1a;
          box-shadow:
            0 0 0 2px #00f0ff,
            0 0 20px rgba(0, 240, 255, 0.5),
            0 0 40px rgba(255, 0, 170, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-retro::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow:
            0 0 0 2px #00f0ff,
            0 0 30px rgba(0, 240, 255, 0.8),
            0 0 50px rgba(255, 0, 170, 0.5);
        }

        .slider-retro::-moz-range-thumb:active {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
