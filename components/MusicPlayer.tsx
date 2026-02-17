'use client';

import { useState, useRef, useEffect } from 'react';

// YouTube video ID extracted from: https://www.youtube.com/watch?v=FKtzkolncnk
const YOUTUBE_VIDEO_ID = 'FKtzkolncnk';

// Extend Window type to include YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30); // YouTube volume is 0-100
  const [showControls, setShowControls] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    // Don't load if already loaded
    if (window.YT) {
      initializePlayer();
      return;
    }

    // Load the IFrame Player API code asynchronously
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    // API will call this function when ready
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };
  }, []);

  const initializePlayer = () => {
    if (!playerDivRef.current) return;

    playerRef.current = new window.YT.Player(playerDivRef.current, {
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 1, // Attempt auto-play (may be blocked by browser)
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID, // Required for loop to work
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          setPlayerReady(true);
          event.target.setVolume(volume);
          // Attempt auto-play (may be blocked by browser, but that's ok)
          event.target.playVideo();
        },
        onStateChange: (event: any) => {
          // Update play state when YouTube player state changes
          setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
        },
      },
    });
  };

  // Update volume when slider changes
  useEffect(() => {
    if (playerReady && playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, playerReady]);

  const togglePlay = () => {
    if (!playerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <>
      {/* Hidden YouTube player (0x0 size) */}
      <div
        ref={playerDivRef}
        style={{
          position: 'absolute',
          width: '0',
          height: '0',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      />

      {/* Floating Music Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Control Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-14 h-14 bg-rust-primary texture-diagonal rounded-none border-3 border-rust-primary shadow-lg hover:scale-110 transition-all warm-glow flex items-center justify-center group"
          title="Music Controls"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)'
          }}
        >
          <svg
            className="w-6 h-6 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5))' }}
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </button>

        {/* Expanded Controls */}
        {showControls && (
          <div className="absolute bottom-16 right-0 premium-card rounded-none p-4 w-64 border-embossed animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-rust-primary/30">
              <span className="text-white font-bold uppercase text-sm tracking-wider">
                Audio Mix
              </span>
              <button
                onClick={() => setShowControls(false)}
                className="text-[#7a7a9e] hover:text-amber-secondary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`w-full py-3 mb-4 font-bold uppercase text-sm tracking-wider rounded-none transition-all ${
                isPlaying
                  ? 'bg-rust-primary texture-brushed text-black'
                  : 'border-3 border-rust-primary text-rust-primary hover:bg-rust-primary hover:text-black'
              }`}
              style={isPlaying ? {
                boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              } : {}}
            >
              {isPlaying ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </div>
              )}
            </button>

            {/* Volume Control */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#7a7a9e] uppercase tracking-wider">
                  Volume
                </label>
                <span className="text-xs text-rust-primary font-mono">
                  {volume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-[#1a1b2e] appearance-none cursor-pointer volume-slider"
              />
            </div>

            {/* Now Playing */}
            <div className="mt-4 pt-3 border-t border-rust-primary/30">
              <div className="text-xs text-[#7a7a9e] uppercase tracking-wider mb-1">
                Now Playing
              </div>
              <div className="text-sm text-white font-mono">
                YouTube Mix
              </div>
              {!playerReady && (
                <div className="text-xs text-[#7a7a9e] mt-1">
                  Loading player...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 0;
          background: #c87341;
          cursor: pointer;
          box-shadow: inset 0 1px 1px rgba(255, 147, 65, 0.2), 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 0;
          background: #c87341;
          border: none;
          cursor: pointer;
          box-shadow: inset 0 1px 1px rgba(255, 147, 65, 0.2), 0 2px 4px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </>
  );
}
