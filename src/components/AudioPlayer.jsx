import React, { useState, useEffect } from 'react';

export function AudioPlayer({ soundtrackEngine }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(210); // 3 mins 30 secs
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (!soundtrackEngine) return;
    if (!isPlaying) {
      soundtrackEngine.play((time) => {
        setCurrentTime(time);
      }, currentTime);
      setIsPlaying(true);
    } else {
      soundtrackEngine.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (isPlaying && soundtrackEngine) {
      soundtrackEngine.pause();
      soundtrackEngine.play((time) => {
        setCurrentTime(time);
      }, newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (soundtrackEngine) soundtrackEngine.setVolume(newVol);
  };

  const toggleMute = () => {
    if (!soundtrackEngine) return;
    if (isMuted) {
      setIsMuted(false);
      soundtrackEngine.setVolume(volume || 0.7);
    } else {
      setIsMuted(true);
      soundtrackEngine.setVolume(0);
    }
  };

  return (
    <div className="fixed bottom-5 left-6 md:left-10 z-40 font-mono text-xs select-none">
      <div className="bg-[#121212]/90 backdrop-blur-md text-[#fafafa] border border-white/15 px-4 py-2.5 rounded-full md:rounded-2xl shadow-2xl flex items-center space-x-3 md:space-x-4 max-w-sm md:max-w-md transition-all duration-300">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
          title={isPlaying ? "Pause Ambient Soundtrack" : "Play Ambient Soundtrack"}
        >
          {isPlaying ? (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Track Info & Animated Waveform Bars */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between space-x-2 mb-1">
            <div className="flex items-center space-x-1.5 truncate">
              {isPlaying && (
                <div className="flex items-end space-x-0.5 h-2.5">
                  <span className="w-0.5 bg-white animate-pulse h-2"></span>
                  <span className="w-0.5 bg-white animate-pulse h-3" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-0.5 bg-white animate-pulse h-1.5" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}
              <span className="text-[11px] font-bold tracking-tight truncate text-white">
                Canto a la Memoria
              </span>
            </div>
            <span className="text-[10px] text-white/50 flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Real-time Interactive Seek Slider */}
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration}
              step="1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Volume Control / Mute Toggle */}
        <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-white/10">
          <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
            {isMuted || volume === 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            title="Volume"
          />
        </div>

      </div>
    </div>
  );
}
