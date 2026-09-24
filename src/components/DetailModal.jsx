import React, { useState, useEffect } from 'react';

export function DetailModal({ story, lang, setLang, onClose }) {
  const [isStoryOpen, setIsStoryOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(53);
  const duration = 180;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(Math.floor(pct * duration));
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!story) return null;

  const storyContent = story.storyText ? story.storyText[lang] : (story.bio ? story.bio[lang] : '');

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFA] text-[#000000] overflow-y-auto font-mono text-[13px] animate-page scroll-smooth select-text">
      <div className="min-h-full max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col justify-between">
        
        {/* Top Bar: 3-digit ID on left, [ CLOSE ] on right */}
        <header className="flex items-center justify-between font-mono text-[13px] uppercase tracking-wider mb-8 md:mb-12 select-none">
          <div className="font-mono text-[13px]">{story.codePad || String(story.number).padStart(3, '0')}</div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity font-mono text-[13px]"
          >
            [ CLOSE ]
          </button>
        </header>

        {/* Main Editorial 3-Column Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr_1.1fr] gap-8 xl:gap-14 items-start my-auto">
          
          {/* Left Column: Story Text & Story Timeline Player */}
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between text-xs uppercase tracking-wider mb-5 pb-1 select-none">
                <span className="font-bold">STORY</span>
                <button
                  onClick={() => setIsStoryOpen(!isStoryOpen)}
                  className="hover:opacity-70 transition-opacity text-xs"
                >
                  [ {isStoryOpen ? '-' : '+'} ]
                </button>
              </div>

              {isStoryOpen && (
                <div className="font-mono text-[12px] md:text-[13px] leading-relaxed text-[#000000] space-y-4 whitespace-pre-line pr-2">
                  {storyContent}
                </div>
              )}
            </div>

            {/* Bottom Story Audio Scrubber */}
            <div className="mt-8 pt-4 flex items-center space-x-3 text-[11px] font-mono text-black select-none">
              <span className="tabular-nums font-mono">{formatTime(currentTime)}</span>
              
              <div
                onClick={handleTimelineClick}
                className="flex-1 relative flex items-center h-4 cursor-pointer group"
                title="Seek audio timeline"
              >
                <div className="w-full h-[1px] bg-black/40"></div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-[10px] leading-none text-black select-none transition-all"
                  style={{ left: `${(currentTime / duration) * 94}%` }}
                >
                  ■
                </div>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:opacity-70 transition-opacity font-mono text-xs px-1"
                title={isPlaying ? "Pause" : "Play"}
              >
                [ {isPlaying ? '⏸' : '▶'} ]
              </button>
            </div>
          </div>

          {/* Center Column: Portrait Artwork Illustration */}
          <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-[440px] md:max-w-[480px] bg-[#eae8e2] overflow-hidden shadow-sm">
              <img
                src={story.image}
                alt={story.name}
                className="w-full h-auto object-cover select-none"
                draggable="false"
              />
            </div>
          </div>

          {/* Right Column: Metadata Details */}
          <div className="space-y-6 text-xs font-mono">
            {/* Name */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#787670]">Name</div>
              <div className="font-normal text-[13px] md:text-sm text-black leading-snug">{story.name}</div>
            </div>

            {/* 2-Column Grid Fields */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 pt-2">
              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Place of birth</div>
                <div className="text-black">{story.placeOfBirth}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Date of birth</div>
                <div className="text-black">{story.dateOfBirth}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Place of disappearance</div>
                <div className="text-black">{story.placeOfDisappearance}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Date of disappearance</div>
                <div className="text-black">{story.dateOfDisappearance}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Age</div>
                <div className="text-black">{lang === 'es' ? story.calculatedAgeEs : story.calculatedAge}</div>
              </div>
            </div>
          </div>

        </main>

        {/* Bottom Footer: Artist on left, Language Switch on right */}
        <footer className="flex items-end justify-between font-mono text-xs mt-12 pt-6 select-none">
          <div className="space-y-1">
            <div className="text-[11px] text-[#787670]">Artist</div>
            <div className="text-black font-medium">{story.artist}</div>
          </div>

          <div className="flex items-center space-x-2 text-[13px]">
            <button
              onClick={() => setLang('es')}
              className={'hover:opacity-70 transition-opacity ' + (lang === 'es' ? 'underline underline-offset-4' : '')}
            >
              ES
            </button>
            <span>/</span>
            <button
              onClick={() => setLang('en')}
              className={'hover:opacity-70 transition-opacity ' + (lang === 'en' ? 'underline underline-offset-4' : '')}
            >
              EN
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
