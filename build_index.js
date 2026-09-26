const fs = require('fs');
const stories = require('./src/data/grid_stories_detailed.json');

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="h-full bg-[#FAFAFA] text-[#000000] antialiased selection:bg-[#000000] selection:text-[#FAFAFA]">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>197 Illustrated Stories — Memorial & Archivo</title>
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕯️</text></svg>">

  <!-- Google Fonts: Space Mono, IBM Plex Mono, Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN with forms & container queries -->
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            mono: ['"Space Mono"', '"IBM Plex Mono"', 'Courier New', 'monospace'],
            sans: ['"Inter"', 'sans-serif']
          },
          colors: {
            archiveBg: '#ffffff',
            archiveDark: '#121212',
            archiveMuted: '#71717a'
          }
        }
      }
    }
  </script>

  <!-- React 18 & Babel Standalone -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    html, body {
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      cursor: default;
    }

    button, a, input, select, [role="button"], .clickable, .cursor-pointer {
      cursor: pointer !important;
    }

    .no-select {
      user-select: none;
      -webkit-user-select: none;
    }

    /* Thin elegant scrollbar */
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #e4e4e7;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #a1a1aa;
    }

    .gpu-accel {
      will-change: transform;
      backface-visibility: hidden;
      transform-style: preserve-3d;
    }

    /* Directional wipe transition: 'Image Makes Itself' */
    .portrait-wipe {
      clip-path: polygon(0 0, 0 100%, 0 100%, 0 0);
      opacity: 0.15;
      transform: translateX(-12px) scale(0.96);
      transition: clip-path 0.95s cubic-bezier(0.25, 1, 0.5, 1),
                  transform 0.85s cubic-bezier(0.25, 1, 0.5, 1),
                  opacity 0.75s cubic-bezier(0.25, 1, 0.5, 1);
      will-change: clip-path, transform, opacity;
    }

    .portrait-wipe.revealed {
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      opacity: 1;
      transform: translateX(0) scale(1);
    }

    /* Active List Item Memorial Highlight - Fixed height to avoid jumps */
    .names-list-item {
      transition: background-color 0.15s ease, color 0.15s ease;
      min-height: 40px;
      height: 40px;
      position: relative;
    }
    .names-list-item.row-active,
    .names-list-item:hover {
      background-color: #111111 !important;
      color: #ffffff !important;
    }
    .names-list-item.row-active span,
    .names-list-item:hover span {
      color: #ffffff !important;
    }

    .list-portrait-thumb {
      opacity: 0;
      transform: translateY(-50%) scale(0.94);
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .names-list-item:hover .list-portrait-thumb,
    .names-list-item.row-active .list-portrait-thumb {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    @keyframes pageFadeIn {
      from { opacity: 0; transform: scale(0.99); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-page {
      animation: pageFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  </style>
</head>
<body class="h-full w-full overflow-hidden bg-[#FAFAFA] text-[#000000] font-mono no-select">
  <div id="root" class="h-full w-full"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;

    const STORIES_DATA = ${JSON.stringify(stories, null, 2)};

    const CATEGORIES = [
      { id: 'all', label: 'All Stories' },
      { id: 'Fine line Stories', label: 'Fine line Stories' },
      { id: 'Inner Stories', label: 'Inner Stories' },
      { id: 'Love Stories', label: 'Love Stories' },
      { id: 'Midfield Stories', label: 'Midfield Stories' },
      { id: 'Neighborhood Stories', label: 'Neighborhood Stories' },
      { id: 'New World Stories', label: 'New World Stories' },
      { id: 'Outer Stories', label: 'Outer Stories' },
      { id: 'Rhythmic Stories', label: 'Rhythmic Stories' }
    ];

    // Story Audio Engine for Detail Page
    class StoryAudioEngine {
      constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.interval = null;
      }
      init() {
        if (!this.ctx && typeof window !== 'undefined') {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
          }
        }
      }
      playTap() {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(860, this.ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      }
      playStoryAudio(onTick, startTime = 0) {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isPlaying = true;

        let cur = startTime;
        if (this.interval) clearInterval(this.interval);

        const playTone = (freq, t, dur = 2.5) => {
          if (!this.ctx || !this.isPlaying) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, t);
          filter.frequency.exponentialRampToValueAtTime(300, t + dur);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(0.025, t + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur);
        };

        const chords = [
          [293.66, 369.99, 440.00],
          [220.00, 277.18, 329.63],
          [246.94, 293.66, 369.99],
          [196.00, 246.94, 293.66]
        ];

        this.interval = setInterval(() => {
          if (!this.isPlaying) return;
          cur = (cur + 1) % 180;
          if (onTick) onTick(cur);

          if (cur % 3 === 0) {
            const chord = chords[Math.floor((cur / 3) % chords.length)];
            const now = this.ctx.currentTime;
            chord.forEach((f, idx) => playTone(f, now + idx * 0.25, 2.2));
          }
        }, 1000);

        const now = this.ctx.currentTime;
        const initialChord = chords[Math.floor((cur / 3) % chords.length)];
        initialChord.forEach((f, idx) => playTone(f, now + idx * 0.25, 2.2));
      }
      pause() {
        this.isPlaying = false;
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      }
    }
    const storyAudio = new StoryAudioEngine();

    // ====================================================================
    // FULL-PAGE ARTWORK DETAIL VIEW
    // ====================================================================
    function ArtworkDetailPage({ story, onClose }) {
      const [isStoryOpen, setIsStoryOpen] = useState(true);
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentTime, setCurrentTime] = useState(53);
      const duration = 180;

      const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      };

      const togglePlay = () => {
        if (!isPlaying) {
          storyAudio.playStoryAudio((t) => setCurrentTime(t), currentTime);
          setIsPlaying(true);
        } else {
          storyAudio.pause();
          setIsPlaying(false);
        }
      };

      const handleTimelineClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = Math.floor(pct * duration);
        setCurrentTime(newTime);
        if (isPlaying) {
          storyAudio.pause();
          storyAudio.playStoryAudio((t) => setCurrentTime(t), newTime);
        }
      };

      useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
          window.removeEventListener('keydown', onKeyDown);
          storyAudio.pause();
        };
      }, [onClose]);

      const storyContent = (story.storyText && story.storyText.en) ? story.storyText.en : (story.bio && story.bio.en ? story.bio.en : (typeof story.bio === 'string' ? story.bio : ''));

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
                      style={{ left: \`\${(currentTime / duration) * 94}%\` }}
                    >
                      ■
                    </div>
                  </div>

                  <button
                    onClick={togglePlay}
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
                <div className="space-y-1">
                  <div className="text-[11px] text-[#787670]">Name</div>
                  <div className="font-normal text-[13px] md:text-sm text-black leading-snug">{story.name}</div>
                </div>

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
                    <div className="text-black">{story.calculatedAge || (story.age ? story.age + ' years old' : '')}</div>
                  </div>
                </div>
              </div>

            </main>

            {/* Bottom Footer: Artist on left, memorial tag on right */}
            <footer className="flex items-end justify-between font-mono text-xs mt-12 pt-6 select-none border-t border-black/10">
              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Artist</div>
                <div className="text-black font-medium">{story.artist}</div>
              </div>

              <div className="text-[11px] text-[#787670] uppercase tracking-wider">
                197 ILLUSTRATED STORIES
              </div>
            </footer>

          </div>
        </div>
      );
    }

    // ====================================================================
    // JUMP-FREE SMOOTH INTERACTIVE MEMORIAL LIST VIEW
    // ====================================================================
    function InteractiveListView({ stories, onSelectStory }) {
      const [activeStoryId, setActiveStoryId] = useState(null);

      return (
        <div
          data-scrollable="true"
          className="relative w-full h-full pt-36 pb-32 overflow-y-auto overflow-x-hidden font-mono select-none overscroll-contain"
        >
          {/* Interactive Memorial List with profile only visible on black bar */}
          <ul className="w-full flex flex-col py-2" role="list">
            {stories.map((story) => {
              const isActive = activeStoryId === story.id;
              return (
                <li
                  key={story.id}
                  onClick={() => {
                    setActiveStoryId(story.id);
                    onSelectStory(story);
                  }}
                  onMouseEnter={() => setActiveStoryId(story.id)}
                  className={\`names-list-item cursor-pointer px-4 w-full text-center flex items-center justify-center \${
                    isActive ? 'row-active' : ''
                  }\`}
                >
                  {/* Centered Name */}
                  <span className="text-[13px] md:text-[14px] leading-none tracking-normal select-none truncate max-w-2xl text-black">
                    {story.name}
                  </span>

                  {/* Profile Portrait only visible on the black bar with soft fade-in (200% size) */}
                  <div className="list-portrait-thumb absolute right-4 md:right-12 lg:right-20 top-1/2 z-30">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-[#111111] border border-neutral-700/80 shadow-2xl overflow-hidden relative">
                      <img
                        src={story.image}
                        alt={story.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 left-0 bg-black/85 px-2 py-1 text-[10px] text-white/95 text-center truncate tracking-widest font-mono">
                        {story.shortName || story.name}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    // ====================================================================
    // MAIN GALLERY APPLICATION
    // ====================================================================
    function App() {
      const [showIntro, setShowIntro] = useState(true);
      const [view, setView] = useState('grid');
      const [selectedStory, setSelectedStory] = useState(null);
      const [selectedCategory, setSelectedCategory] = useState('all');
      const [searchQuery, setSearchQuery] = useState('');
      const [isFilterOpen, setIsFilterOpen] = useState(false);
      const [isSearchOpen, setIsSearchOpen] = useState(false);
      const [isAboutOpen, setIsAboutOpen] = useState(false);

      const filteredStories = useMemo(() => {
        return STORIES_DATA.filter(item => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = item.name.toLowerCase().includes(q);
            const matchNum = String(item.number).includes(q);
            if (!matchName && !matchNum) return false;
          }
          return true;
        });
      }, [selectedCategory, searchQuery]);

      // --- INFINITE 2D TOROIDAL LERP PHYSICS ENGINE WITH SCROLL REVEAL ---
      const targetRef = useRef({ x: -280, y: -80 });
      const currentRef = useRef({ x: -280, y: -80 });
      const cardsRef = useRef([]);
      const imagesRef = useRef([]);
      const damping = 0.085;

      const cardWidth = 180;
      const cardHeight = 220;
      const colStepX = 275;
      const rowStepY = 320;
      const colCount = 20;
      const rowCount = Math.ceil(STORIES_DATA.length / colCount);
      const gridTotalW = colCount * colStepX;
      const gridTotalH = rowCount * rowStepY;

      const baseCoords = useMemo(() => {
        return STORIES_DATA.map((_, i) => {
          const col = i % colCount;
          const row = Math.floor(i / colCount);
          const staggerY = (col % 2 === 0) ? 65 : 0;
          return {
            x: 160 + col * colStepX,
            y: 120 + row * rowStepY + staggerY,
            col,
            row
          };
        });
      }, [STORIES_DATA.length]);

      useEffect(() => {
        if (view !== 'grid' || selectedStory) return;

        let isRunning = true;
        const loop = () => {
          if (!isRunning) return;

          const target = targetRef.current;
          const current = currentRef.current;

          current.x += (target.x - current.x) * damping;
          current.y += (target.y - current.y) * damping;

          const vpW = window.innerWidth;
          const vpH = window.innerHeight;

          for (let i = 0; i < STORIES_DATA.length; i++) {
            const el = cardsRef.current[i];
            const imgEl = imagesRef.current[i];
            if (!el) continue;

            const base = baseCoords[i];
            let screenX = ((base.x + current.x) % gridTotalW + gridTotalW) % gridTotalW;
            if (screenX > vpW + cardWidth) screenX -= gridTotalW;

            let screenY = ((base.y + current.y) % gridTotalH + gridTotalH) % gridTotalH;
            if (screenY > vpH + cardHeight) screenY -= gridTotalH;

            const inViewport = (screenX >= -cardWidth - 60 && screenX <= vpW + 60 && 
                                screenY >= -cardHeight - 60 && screenY <= vpH + 60);

            if (inViewport) {
              el.style.display = 'block';
              el.style.transform = 'translate3d(' + screenX.toFixed(1) + 'px, ' + screenY.toFixed(1) + 'px, 0)';

              if (imgEl && !imgEl.classList.contains('revealed')) {
                const staggerDelay = (base.col % 5) * 45;
                setTimeout(() => {
                  if (imgEl) imgEl.classList.add('revealed');
                }, staggerDelay);
              }
            } else {
              el.style.display = 'none';
              if (imgEl && (screenX < -cardWidth - 400 || screenX > vpW + 400 || screenY < -cardHeight - 400 || screenY > vpH + 400)) {
                imgEl.classList.remove('revealed');
              }
            }
          }

          requestAnimationFrame(loop);
        };

        const rafId = requestAnimationFrame(loop);
        return () => {
          isRunning = false;
          cancelAnimationFrame(rafId);
        };
      }, [view, selectedStory, baseCoords, gridTotalW, gridTotalH]);

      useEffect(() => {
        if (view !== 'grid' || selectedStory) return;

        const onWheel = (e) => {
          if (e.target.closest('[data-scrollable="true"]')) return;
          e.preventDefault();

          let dx = e.deltaX;
          let dy = e.deltaY;

          if (e.deltaMode === 1) {
            dx *= 24;
            dy *= 24;
          } else if (e.deltaMode === 2) {
            dx *= window.innerWidth * 0.7;
            dy *= window.innerHeight * 0.7;
          }

          targetRef.current.x -= dx * 1.0;
          targetRef.current.y -= dy * 1.0;
        };

        let touchStart = { x: 0, y: 0 };
        const onTouchStart = (e) => {
          if (e.touches.length === 1 && !e.target.closest('[data-scrollable="true"]')) {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        };

        const onTouchMove = (e) => {
          if (e.touches.length === 1 && !e.target.closest('[data-scrollable="true"]')) {
            e.preventDefault();
            const curX = e.touches[0].clientX;
            const curY = e.touches[0].clientY;
            targetRef.current.x += (curX - touchStart.x) * 1.4;
            targetRef.current.y += (curY - touchStart.y) * 1.4;
            touchStart = { x: curX, y: curY };
          }
        };

        let isMouseDown = false;
        let mouseStart = { x: 0, y: 0 };
        const onMouseDown = (e) => {
          if (e.target.closest('button, a, input, [data-scrollable="true"]')) return;
          isMouseDown = true;
          mouseStart = { x: e.clientX, y: e.clientY };
        };
        const onMouseMove = (e) => {
          if (!isMouseDown) return;
          const diffX = e.clientX - mouseStart.x;
          const diffY = e.clientY - mouseStart.y;
          targetRef.current.x += diffX * 1.2;
          targetRef.current.y += diffY * 1.2;
          mouseStart = { x: e.clientX, y: e.clientY };
        };
        const onMouseUp = () => {
          isMouseDown = false;
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
          window.removeEventListener('wheel', onWheel);
          window.removeEventListener('touchstart', onTouchStart);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('mousedown', onMouseDown);
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
      }, [view, selectedStory]);

      useEffect(() => {
        const onKeyDown = (e) => {
          if (e.key === 'Escape') {
            setSelectedStory(null);
            setIsFilterOpen(false);
            setIsSearchOpen(false);
            setIsAboutOpen(false);
          }
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            setIsSearchOpen(prev => !prev);
          }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
      }, []);

      // --- START SCREEN ANY-DIRECTION PAN & SCROLL DISMISSAL LISTENER ---
      useEffect(() => {
        if (!showIntro) return;

        let isDragging = false;
        let dragStart = { x: 0, y: 0 };

        const handleIntroWheel = (e) => {
          if (Math.abs(e.deltaX) > 1.5 || Math.abs(e.deltaY) > 1.5) {
            storyAudio.playTap();
            setShowIntro(false);
            targetRef.current.x -= e.deltaX;
            targetRef.current.y -= e.deltaY;
          }
        };

        const handlePointerDown = (e) => {
          if (e.target.closest('button, a')) return;
          isDragging = true;
          dragStart = { x: e.clientX, y: e.clientY };
        };

        const handlePointerMove = (e) => {
          if (!isDragging) return;
          const diffX = e.clientX - dragStart.x;
          const diffY = e.clientY - dragStart.y;
          const dist = Math.hypot(diffX, diffY);
          if (dist > 3) {
            storyAudio.playTap();
            setShowIntro(false);
            targetRef.current.x += diffX * 1.2;
            targetRef.current.y += diffY * 1.2;
            isDragging = false;
          }
        };

        const handlePointerUp = () => {
          isDragging = false;
        };

        let touchStart = { x: 0, y: 0 };
        const handleTouchStart = (e) => {
          if (e.touches.length === 1 && !e.target.closest('button, a')) {
            touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        };

        const handleTouchMove = (e) => {
          if (e.touches.length === 1) {
            const curX = e.touches[0].clientX;
            const curY = e.touches[0].clientY;
            const diffX = curX - touchStart.x;
            const diffY = curY - touchStart.y;
            const dist = Math.hypot(diffX, diffY);
            if (dist > 4) {
              storyAudio.playTap();
              setShowIntro(false);
              targetRef.current.x += diffX * 1.4;
              targetRef.current.y += diffY * 1.4;
            }
          }
        };

        const handleIntroKeyDown = (e) => {
          if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Space', 'Enter'].includes(e.code)) {
            storyAudio.playTap();
            setShowIntro(false);
          }
        };

        window.addEventListener('wheel', handleIntroWheel, { passive: true });
        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('keydown', handleIntroKeyDown);

        return () => {
          window.removeEventListener('wheel', handleIntroWheel);
          window.removeEventListener('mousedown', handlePointerDown);
          window.removeEventListener('mousemove', handlePointerMove);
          window.removeEventListener('mouseup', handlePointerUp);
          window.removeEventListener('touchstart', handleTouchStart);
          window.removeEventListener('touchmove', handleTouchMove);
          window.removeEventListener('keydown', handleIntroKeyDown);
        };
      }, [showIntro]);

      const openStory = (story) => {
        storyAudio.playTap();
        setSelectedStory(story);
      };

      const centerCamera = () => {
        targetRef.current = { x: -280, y: -80 };
      };

      return (
        <div className="relative w-full h-full overflow-hidden bg-[#FAFAFA] text-[#000000]">

          {/* ======================================================== */}
          {/* STARTING SCREEN (Minimal, Same Tone, Same CSS Layout)    */}
          {/* ======================================================== */}
          {showIntro && (
            <div
              className="fixed inset-0 z-50 bg-[#FAFAFA] text-[#000000] font-mono flex flex-col justify-between p-6 md:p-12 animate-page select-none cursor-grab active:cursor-grabbing"
            >
              
              {/* Top Bar */}
              <div className="flex items-center justify-between text-[13px] tracking-wide uppercase">
                <span className="font-medium tracking-wider">197 ILLUSTRATED STORIES</span>
                <button
                  onClick={() => { setShowIntro(false); storyAudio.playTap(); }}
                  className="hover:opacity-70 transition-opacity text-[13px] uppercase tracking-wider"
                >
                  [ SKIP → ]
                </button>
              </div>

              {/* Center Content: Minimal Poetic Paragraph */}
              <div className="max-w-2xl mx-auto text-center px-4 my-auto space-y-7 animate-fadeIn">
                <div className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
                  MEMORIAL · DIGITAL ARCHIVE
                </div>

                <div className="space-y-5 text-[13px] md:text-sm leading-relaxed text-neutral-900 font-mono">
                  <p>
                    Between the 1970s and 1980s, both Uruguay and Argentina endured civic-military dictatorships that left a deep mark on their societies.
                  </p>
                  <p className="italic text-neutral-700 border-y border-neutral-200 py-3 text-[12px] md:text-[13px]">
                    “To remember is to bring back to life; because only what is not forgotten stays alive.”
                  </p>
                  <p className="text-[12px] md:text-[13px] text-neutral-500">
                    197 illustrated stories is a memorial project that seeks to share the everyday lives and memories of each of the people forcibly disappeared.
                  </p>
                </div>

                <div className="pt-2 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-neutral-400 tracking-widest uppercase pt-2">
                    ↓ pan or scroll to enter
                  </span>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between text-[11px] md:text-xs tracking-wider uppercase text-neutral-400">
                <span>197 HISTORIAS ILUSTRADAS</span>
                <span>MEMORIAL DIGITAL ARCHIVE</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* HEADER / NAVIGATION (Exact match to Stitch reference)    */}
          {/* ======================================================== */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm px-6 md:px-8 pt-7 pb-4 border-b border-transparent">
            
            {/* Primary Top Bar */}
            <div className="flex items-center justify-between text-[13px] tracking-wide uppercase font-mono">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowIntro(true); }} className="font-normal hover:opacity-70 transition-opacity">
                197 ILLUSTRATED STORIES
              </a>

              <nav aria-label="View Switcher" className="flex items-center space-x-6 text-[13px]">
                <button
                  onClick={() => { setView('grid'); storyAudio.playTap(); }}
                  className={'transition-colors ' + (view === 'grid' ? 'font-medium text-black underline underline-offset-4 decoration-1 decoration-black' : 'text-neutral-900 hover:text-neutral-500')}
                >
                  [ GRID ]
                </button>
                <button
                  onClick={() => { setView('list'); storyAudio.playTap(); }}
                  className={'transition-colors ' + (view === 'list' ? 'font-medium text-black underline underline-offset-4 decoration-1 decoration-black' : 'text-neutral-900 hover:text-neutral-500')}
                >
                  [ LIST ]
                </button>
                <button
                  onClick={() => { setView('gallery'); storyAudio.playTap(); }}
                  className={'transition-colors ' + (view === 'gallery' ? 'font-medium text-black underline underline-offset-4 decoration-1 decoration-black' : 'text-neutral-900 hover:text-neutral-500')}
                >
                  [ GALLERY ]
                </button>
                <button
                  onClick={() => { setView('add-yours'); storyAudio.playTap(); }}
                  className={'transition-all px-2.5 py-0.5 rounded border text-[12px] ' + (view === 'add-yours' ? 'bg-black text-white border-black font-semibold shadow-sm' : 'border-black text-black bg-black/[0.06] hover:bg-black hover:text-white hover:border-black font-semibold')}
                >
                  [ ADD YOURS ]
                </button>
              </nav>

              <div>
                <button
                  onClick={() => { setIsAboutOpen(true); storyAudio.playTap(); }}
                  className="hover:opacity-70 transition-opacity text-[13px]"
                >
                  ABOUT THE PROJECT
                </button>
              </div>
            </div>

            {/* Secondary Meta Controls (Filters & Search) */}
            <div className="flex items-center justify-between text-[13px] tracking-wider pt-7 font-mono">
              <button
                onClick={() => { setIsFilterOpen(!isFilterOpen); storyAudio.playTap(); }}
                className="hover:opacity-60 transition-opacity focus:outline-none flex items-center gap-1 font-normal"
              >
                FILTERS {isFilterOpen ? '[-]' : '[+]'}
              </button>
              <button
                onClick={() => { setIsSearchOpen(true); storyAudio.playTap(); }}
                className="hover:opacity-60 transition-opacity focus:outline-none tracking-widest font-normal"
              >
                SEARCH
              </button>
            </div>

          </header>

          {/* ======================================================== */}
          {/* COLLAPSIBLE FILTERS MENU OVERLAY                        */}
          {/* ======================================================== */}
          {isFilterOpen && (
            <div data-scrollable="true" className="fixed top-28 left-6 md:left-8 z-40 bg-[#FAFAFA]/95 backdrop-blur-md border border-black/15 p-5 max-w-sm w-full shadow-lg font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/10">
                <span className="uppercase text-[11px] text-gray-500 font-bold tracking-wider">FILTER BY THEME</span>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-black">[✕]</button>
              </div>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setIsFilterOpen(false); }}
                    className={'w-full text-left py-1 px-1.5 transition-colors flex items-center justify-between ' + (selectedCategory === cat.id ? 'bg-black text-[#FAFAFA]' : 'hover:bg-black/5 text-black')}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 1: INFINITE 2D TOROIDAL GRID WITH SCROLL REVEAL     */}
          {/* ======================================================== */}
          {view === 'grid' && (
            <div className="relative w-full h-full overflow-hidden select-none">
              {STORIES_DATA.map((story, index) => {
                return (
                  <div
                    key={story.id}
                    ref={(el) => (cardsRef.current[index] = el)}
                    onClick={() => openStory(story)}
                    className="absolute top-0 left-0 group cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.03] z-10 hover:z-20 gpu-accel"
                    style={{
                      width: cardWidth + 'px',
                      display: 'none'
                    }}
                  >
                    <div className="font-mono text-[11px] text-black leading-tight mb-2 truncate group-hover:text-black/70 transition-colors pointer-events-none">
                      {story.number} . {story.displayTitle}
                    </div>

                    <div className="w-full aspect-square bg-[#eae8e2] overflow-hidden">
                      <img
                        ref={(el) => (imagesRef.current[index] = el)}
                        src={story.image}
                        alt={story.name}
                        draggable="false"
                        loading="lazy"
                        className="portrait-wipe w-full h-full object-cover select-none group-hover:scale-105"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 2: INTERACTIVE MEMORIAL LIST (Zero Jitter Smooth)    */}
          {/* ======================================================== */}
          {view === 'list' && (
            <InteractiveListView
              stories={filteredStories}
              onSelectStory={openStory}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW 3: CURATED GALLERY SHOWCASE                        */}
          {/* ======================================================== */}
          {view === 'gallery' && (
            <div data-scrollable="true" className="w-full h-full pt-36 pb-24 px-6 md:px-16 overflow-y-auto font-mono scroll-smooth">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => openStory(story)}
                      className="group cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-mono text-[11px] text-black mb-2 truncate">
                          {story.number} . {story.displayTitle}
                        </div>
                        <div className="aspect-square bg-[#eae8e2] overflow-hidden mb-2">
                          <img
                            src={story.image}
                            alt={story.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between pt-1">
                        <span>{story.city}</span>
                        <span>{story.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW 4: ADD YOURS (BLANK PAGE)                           */}
          {/* ======================================================== */}
          {view === 'add-yours' && (
            <div data-scrollable="true" className="w-full h-full pt-36 pb-24 px-6 md:px-16 overflow-y-auto font-mono">
              <div className="max-w-4xl mx-auto min-h-[60vh]">
                {/* Blank page section ready for future content */}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* EXACT MATCH ARTWORK DETAIL FULL-PAGE VIEW                */}
          {/* ======================================================== */}
          {selectedStory && (
            <ArtworkDetailPage
              story={selectedStory}
              onClose={() => setSelectedStory(null)}
            />
          )}

          {/* ======================================================== */}
          {/* SEARCH MODAL (CMD+K / CLICK)                             */}
          {/* ======================================================== */}
          {isSearchOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsSearchOpen(false)}
            >
              <div
                data-scrollable="true"
                className="bg-[#FAFAFA] border border-black max-w-xl w-full p-6 shadow-2xl font-mono text-xs"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-black mb-4">
                  <span className="uppercase tracking-wider font-bold">SEARCH ARCHIVE</span>
                  <button onClick={() => setIsSearchOpen(false)} className="hover:underline">[ESC]</button>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or number..."
                    className="w-full bg-white border border-black px-3 py-2 font-mono text-sm text-black outline-none focus:ring-1 focus:ring-black"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-black/10 border-t border-black/10">
                  {filteredStories.slice(0, 10).map(story => (
                    <div
                      key={story.id}
                      onClick={() => {
                        setSelectedStory(story);
                        setIsSearchOpen(false);
                      }}
                      className="py-2 px-1 hover:bg-black/5 transition-colors cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-medium">{story.number}. {story.name}</span>
                      <span className="text-gray-500 text-[11px]">{story.city}</span>
                    </div>
                  ))}
                  {filteredStories.length === 0 && (
                    <div className="py-6 text-center text-gray-500">
                      No matching records found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABOUT THE PROJECT MODAL                                  */}
          {/* ======================================================== */}
          {isAboutOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm animate-fadeIn"
              onClick={() => setIsAboutOpen(false)}
            >
              <div
                data-scrollable="true"
                className="bg-[#FAFAFA] border border-black max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative font-mono text-xs"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsAboutOpen(false)}
                  className="absolute top-4 right-4 uppercase hover:underline"
                >
                  [ CLOSE ✕ ]
                </button>

                <div className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">
                  197 HISTORIAS ILUSTRADAS
                </div>
                <h2 className="font-serif text-3xl font-bold mb-4 text-black">
                  About the Project
                </h2>

                <div className="font-serif text-base text-gray-800 leading-relaxed space-y-4">
                  <p>
                    Between the 1970s and 1980s, both Uruguay and Argentina endured civic-military dictatorships that left a deep mark on their societies.
                  </p>
                  <p className="italic font-serif text-black border-l-2 border-black pl-4 my-3">
                    “To remember is to bring back to life; because only what is not forgotten stays alive.”
                  </p>
                  <p>
                    197 illustrated stories is a project that seeks to share the everyday lives and memories of each of the people forcibly disappeared who were born in Uruguay, or under the responsibility of the Uruguayan State.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/15 text-[10px] text-gray-500 flex justify-between uppercase">
                  <span>DIGITAL MEMORIAL</span>
                  <span>197 STORIES</span>
                </div>
              </div>
            </div>
          )}

        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

fs.writeFileSync('./index.html', htmlContent, 'utf8');
console.log('Successfully generated smooth jump-free index.html');
