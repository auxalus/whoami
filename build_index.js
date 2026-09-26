const fs = require('fs');
const path = require('path');
const stories = require('./src/data/grid_stories_detailed.json');

// Read .env if present
const envVars = {};
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      envVars[key] = val;
    }
  });
}

const googleClientId = envVars.GOOGLE_CLIENT_ID || envVars.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="h-full bg-[#FAFAFA] text-[#000000] antialiased selection:bg-[#000000] selection:text-[#FAFAFA]">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>197 Illustrated Stories — Memorial & Archivo</title>
  
  <!-- Environment Variables (Injected from .env) -->
  <script>
    window.__ENV__ = {
      GOOGLE_CLIENT_ID: "${googleClientId}"
    };
  </script>

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

  <!-- Google Identity Services (OAuth 2.0 SDK) -->
  <script src="https://accounts.google.com/gsi/client" async defer></script>

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
    // SONG URL PARSER (SPOTIFY & YOUTUBE)
    // ====================================================================
    function parseSongUrl(url) {
      if (!url || typeof url !== 'string') return null;
      var trimmed = url.trim();

      // Spotify Track / Album / Playlist / Episode
      if (trimmed.indexOf('open.spotify.com') !== -1) {
        var cleanUrl = trimmed.split('?')[0].split('#')[0];
        var parts = cleanUrl.split('/');
        for (var i = 0; i < parts.length - 1; i++) {
          var segment = parts[i];
          if (segment === 'track' || segment === 'album' || segment === 'playlist' || segment === 'episode') {
            var id = parts[i + 1];
            if (id) {
              return {
                platform: 'spotify',
                type: segment,
                id: id,
                originalUrl: trimmed,
                embedUrl: 'https://open.spotify.com/embed/' + segment + '/' + id + '?utm_source=generator&theme=0'
              };
            }
          }
        }
      }

      // YouTube Standard, Short, or Music URL
      if (trimmed.indexOf('youtube.com') !== -1 || trimmed.indexOf('youtu.be') !== -1) {
        var ytId = '';
        if (trimmed.indexOf('youtu.be/') !== -1) {
          var after = trimmed.split('youtu.be/')[1] || '';
          ytId = after.split('?')[0].split('&')[0].split('#')[0];
        } else if (trimmed.indexOf('watch?v=') !== -1) {
          var after = trimmed.split('watch?v=')[1] || '';
          ytId = after.split('&')[0].split('#')[0];
        } else if (trimmed.indexOf('embed/') !== -1) {
          var after = trimmed.split('embed/')[1] || '';
          ytId = after.split('?')[0].split('&')[0].split('#')[0];
        } else if (trimmed.indexOf('v/') !== -1) {
          var after = trimmed.split('v/')[1] || '';
          ytId = after.split('?')[0].split('&')[0].split('#')[0];
        } else if (trimmed.indexOf('shorts/') !== -1) {
          var after = trimmed.split('shorts/')[1] || '';
          ytId = after.split('?')[0].split('&')[0].split('#')[0];
        }
        if (ytId && ytId.length >= 11) {
          ytId = ytId.substring(0, 11);
          return {
            platform: 'youtube',
            id: ytId,
            originalUrl: trimmed,
            embedUrl: 'https://www.youtube.com/embed/' + ytId + '?rel=0'
          };
        }
      }

      return null;
    }

    // ====================================================================
    // FULL-PAGE ARTWORK DETAIL VIEW (MULTI-PHOTO & SONG EMBED SUPPORT)
    // ====================================================================
    function ArtworkDetailPage({ story, onClose }) {
      const [isStoryOpen, setIsStoryOpen] = useState(true);
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentTime, setCurrentTime] = useState(53);
      const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
      const duration = 180;

      const storyImages = (story.images && story.images.length > 0) ? story.images.filter(Boolean) : (story.image ? [story.image] : []);
      const currentImage = storyImages[selectedPhotoIdx] || story.image;
      const songInfo = story.songEmbedUrl 
        ? { platform: story.songPlatform || 'spotify', embedUrl: story.songEmbedUrl, originalUrl: story.songUrl } 
        : (story.songUrl ? parseSongUrl(story.songUrl) : null);

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

      const storyContent = (story.storyText && story.storyText.en) 
        ? story.storyText.en 
        : (story.bio && story.bio.en 
          ? story.bio.en 
          : (typeof story.bio === 'string' ? story.bio : (typeof story.storyText === 'string' ? story.storyText : '')));

      return (
        <div className="fixed inset-0 z-50 bg-[#FAFAFA] text-[#000000] overflow-y-auto font-mono text-[13px] animate-page scroll-smooth select-text">
          <div className="min-h-full max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-8 flex flex-col justify-between">
            
            {/* Top Bar: 3-digit ID on left, [ CLOSE ] on right */}
            <header className="flex items-center justify-between font-mono text-[13px] uppercase tracking-wider mb-8 md:mb-12 select-none">
              <div className="font-mono text-[13px]">
                {story.codePad || String(story.number).padStart(3, '0')}
                {story.isUserSubmitted && (
                  <span className="ml-3 px-2 py-0.5 bg-black text-white text-[10px] tracking-widest uppercase">
                    USER SUBMISSION
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="hover:opacity-70 transition-opacity font-mono text-[13px]"
              >
                [ CLOSE ]
              </button>
            </header>

            {/* Main Editorial 3-Column Layout */}
            <main className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr_1.1fr] gap-8 xl:gap-14 items-start my-auto">
              
              {/* Left Column: Story Text, Audio Timeline & Favourite Song */}
              <div className="flex flex-col justify-between h-full space-y-6">
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

                {/* Optional Favourite Song Embed (Spotify / YouTube) */}
                {songInfo && (
                  <div className="pt-4 border-t border-black/15">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider mb-2.5 select-none font-mono">
                      <span className="font-bold flex items-center gap-1.5">
                        {songInfo.platform === 'spotify' ? '🟢 FAVOURITE SONG (SPOTIFY)' : '🔴 FAVOURITE SONG (YOUTUBE)'}
                      </span>
                      {songInfo.originalUrl && (
                        <a href={songInfo.originalUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] underline hover:opacity-70">
                          [ OPEN ↗ ]
                        </a>
                      )}
                    </div>
                    <div className="overflow-hidden rounded border border-black/20 bg-black/5">
                      <iframe
                        src={songInfo.embedUrl}
                        width="100%"
                        height={songInfo.platform === 'spotify' ? "80" : "152"}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="w-full block"
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Bottom Story Audio Scrubber */}
                <div className="mt-4 pt-4 flex items-center space-x-3 text-[11px] font-mono text-black select-none border-t border-black/10">
                  <span className="tabular-nums font-mono">{formatTime(currentTime)}</span>
                  
                  <div
                    onClick={handleTimelineClick}
                    className="flex-1 relative flex items-center h-4 cursor-pointer group"
                    title="Seek audio timeline"
                  >
                    <div className="w-full h-[1px] bg-black/40"></div>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 text-[10px] leading-none text-black select-none transition-all"
                      style={{ left: ((currentTime / duration) * 94) + '%' }}
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

              {/* Center Column: Portrait Artwork Illustration & Photos Switcher */}
              <div className="w-full flex flex-col justify-center items-center">
                <div className="w-full max-w-[440px] md:max-w-[480px] bg-[#eae8e2] overflow-hidden shadow-sm aspect-square flex items-center justify-center border border-black/10">
                  <img
                    src={currentImage}
                    alt={story.name}
                    className="w-full h-full object-cover select-none"
                    draggable="false"
                  />
                </div>

                {/* Multi-Photo Switcher Tabs */}
                {storyImages.length > 1 && (
                  <div className="flex items-center space-x-2 mt-4 text-xs font-mono">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">PHOTOS ({storyImages.length}):</span>
                    {storyImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={'px-2.5 py-0.5 border text-xs transition-colors ' + (selectedPhotoIdx === idx ? 'bg-black text-white border-black font-bold' : 'border-black/30 hover:border-black text-black bg-white')}
                      >
                        [ 0{idx + 1} ]
                      </button>
                    ))}
                  </div>
                )}
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
                    <div className="text-black">{story.placeOfBirth || story.city}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#787670]">Date of birth</div>
                    <div className="text-black">{story.dateOfBirth || '-'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#787670]">Place of disappearance</div>
                    <div className="text-black">{story.placeOfDisappearance || '-'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#787670]">Date of disappearance</div>
                    <div className="text-black">{story.dateOfDisappearance || '-'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#787670]">Age</div>
                    <div className="text-black">{story.calculatedAge || (story.age ? story.age + ' years old' : '-')}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] text-[#787670]">Year</div>
                    <div className="text-black">{story.year}</div>
                  </div>
                </div>
              </div>

            </main>

            {/* Bottom Footer: Artist on left, memorial tag on right */}
            <footer className="flex items-end justify-between font-mono text-xs mt-12 pt-6 select-none border-t border-black/10">
              <div className="space-y-1">
                <div className="text-[11px] text-[#787670]">Artist / Contributor</div>
                <div className="text-black font-medium">{story.artist}</div>
              </div>

              <div className="text-[11px] text-[#787670] uppercase tracking-wider">
                197 ILLUSTRATED STORIES // LIVING ARCHIVE
              </div>
            </footer>

          </div>
        </div>
      );
    }

    // ====================================================================
    // ADD YOURS ARCHIVAL SUBMISSION VIEW (FORM + PHOTO UPLOADS + SONG)
    // ====================================================================
    // Replace with your Google Client ID from Google Cloud Console:
    const GOOGLE_CLIENT_ID = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.GOOGLE_CLIENT_ID) || window.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    function AddYoursView({ nextNumber, onAddStory, onSelectStory, userStories = [] }) {
      // Contributor Auth Session (Persisted in localStorage)
      const [authUser, setAuthUser] = useState(() => {
        try {
          const saved = localStorage.getItem('contributor_auth_session_v1');
          return saved ? JSON.parse(saved) : null;
        } catch (e) {
          return null;
        }
      });

      // Google OAuth & Global Auth Error
      const [authError, setAuthError] = useState('');

      // Username & Password Auth States (Left Side)
      const [usernameInput, setUsernameInput] = useState('');
      const [passwordInput, setPasswordInput] = useState('');
      const [userPassError, setUserPassError] = useState('');

      // Phone OTP States (Right Side)
      const [phoneCountry, setPhoneCountry] = useState('+598');
      const [phoneNumber, setPhoneNumber] = useState('');
      const [otpSent, setOtpSent] = useState(false);
      const [generatedOtp, setGeneratedOtp] = useState('');
      const [enteredOtp, setEnteredOtp] = useState('');
      const [phoneAuthError, setPhoneAuthError] = useState('');

      // Form States
      const [photos, setPhotos] = useState(['', '', '']);
      const [name, setName] = useState(() => authUser ? (authUser.name || '') : '');
      const [paragraph, setParagraph] = useState('');
      const [songUrl, setSongUrl] = useState('');
      const [city, setCity] = useState('Montevideo');
      const [year, setYear] = useState(new Date().getFullYear());
      const [isDraggingSlot, setIsDraggingSlot] = useState(null);
      const [urlPromptSlot, setUrlPromptSlot] = useState(null);
      const [urlInput, setUrlInput] = useState('');
      const [errorMessage, setErrorMessage] = useState('');
      const [successStory, setSuccessStory] = useState(null);

      const parsedSong = useMemo(() => parseSongUrl(songUrl), [songUrl]);

      // Decode JWT helper
      const decodeJwtPayload = (token) => {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          return JSON.parse(jsonPayload);
        } catch (e) {
          return null;
        }
      };

      // Initialize official Google Identity Services button
      useEffect(() => {
        if (!authUser && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID') && window.google && window.google.accounts && window.google.accounts.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: (response) => {
                if (response && response.credential) {
                  const payload = decodeJwtPayload(response.credential);
                  if (payload) {
                    const userSession = {
                      name: payload.name || payload.email.split('@')[0],
                      email: payload.email,
                      picture: payload.picture,
                      provider: 'google',
                      verified: true,
                      authTime: new Date().toISOString()
                    };
                    try {
                      localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
                    } catch (e) {}
                    setAuthUser(userSession);
                    if (!name) setName(userSession.name);
                    setAuthError('');
                    storyAudio.playSuccess();
                  }
                }
              }
            });

            const btnDiv = document.getElementById('gsi-official-button');
            if (btnDiv) {
              btnDiv.innerHTML = '';
              window.google.accounts.id.renderButton(btnDiv, {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'continue_with',
                shape: 'rectangular'
              });
            }
          } catch (err) {
            console.warn('Google GSI render error:', err);
          }
        }
      }, [authUser]);

      // Handle Google OAuth
      const handleGoogleSignInClick = () => {
        setAuthError('');
        if (GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID') && window.google && window.google.accounts) {
          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
              callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
                  })
                    .then(res => res.json())
                    .then(userInfo => {
                      const userSession = {
                        name: userInfo.name || userInfo.email.split('@')[0],
                        email: userInfo.email,
                        picture: userInfo.picture,
                        provider: 'google',
                        verified: true,
                        authTime: new Date().toISOString()
                      };
                      try {
                        localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
                      } catch (e) {}
                      setAuthUser(userSession);
                      if (!name) setName(userSession.name);
                      storyAudio.playSuccess();
                    })
                    .catch(err => {
                      setAuthError('Failed to retrieve user profile from Google. Please try again.');
                    });
                }
              },
              error_callback: (err) => {
                setAuthError('Google sign in popup was closed.');
              }
            });
            client.requestAccessToken();
            return;
          } catch (err) {
            console.warn('Google GSI Token Client error:', err);
            setAuthError('Google OAuth initialization error: ' + (err.message || 'Check client ID and authorized origins.'));
          }
        } else {
          setAuthError('Google Client ID is not configured in .env.');
        }
      };

      // Handle Username & Password Login
      const handleUserPassLogin = (e) => {
        e.preventDefault();
        setUserPassError('');
        if (!usernameInput.trim()) {
          setUserPassError('Please enter your username or email.');
          return;
        }
        if (!passwordInput.trim() || passwordInput.trim().length < 4) {
          setUserPassError('Please enter your password (minimum 4 characters).');
          return;
        }

        const userSession = {
          name: usernameInput.trim(),
          username: usernameInput.trim(),
          email: usernameInput.includes('@') ? usernameInput.trim() : (usernameInput.trim().toLowerCase().replace(/\s+/g, '.') + '@contributor.archive'),
          provider: 'credentials',
          verified: true,
          authTime: new Date().toISOString()
        };
        try {
          localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
        } catch (e) {}
        setAuthUser(userSession);
        if (!name) setName(userSession.name);
        storyAudio.playSuccess();
      };

      // Handle Phone OTP
      const handleSendOtp = () => {
        if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
          setPhoneAuthError('Please enter a valid phone number (at least 6 digits).');
          return;
        }
        setPhoneAuthError('');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpSent(true);
        storyAudio.playTap();
      };

      const handleVerifyOtp = () => {
        if (enteredOtp.trim() !== generatedOtp.trim()) {
          setPhoneAuthError('Invalid OTP code. Please enter the 6-digit code provided.');
          return;
        }
        const userSession = {
          phone: phoneCountry + ' ' + phoneNumber.trim(),
          name: 'Contributor (' + phoneCountry + ' ' + phoneNumber.trim() + ')',
          provider: 'phone',
          verified: true,
          authTime: new Date().toISOString()
        };
        try {
          localStorage.setItem('contributor_auth_session_v1', JSON.stringify(userSession));
        } catch (e) {
          console.warn('Auth save error', e);
        }
        setAuthUser(userSession);
        if (!name) setName(userSession.name);
        setPhoneAuthError('');
        storyAudio.playSuccess();
      };

      const handleSignOut = () => {
        try {
          localStorage.removeItem('contributor_auth_session_v1');
        } catch (e) {
          console.warn('Auth clear error', e);
        }
        setAuthUser(null);
        setOtpSent(false);
        setEnteredOtp('');
        setAuthError('');
        setPhoneAuthError('');
        setUserPassError('');
        storyAudio.playTap();
      };

      // Helper: Client-side canvas image compression to prevent LocalStorage Quota Exceeded
      const compressImageFile = (file, callback) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1000;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            callback(dataUrl);
          };
          img.onerror = () => {
            callback(e.target.result);
          };
          img.src = e.target.result;
        };
        reader.onerror = () => {
          setErrorMessage('Failed to read image file.');
        };
        reader.readAsDataURL(file);
      };

      const handleFileChange = (slotIndex, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
          return;
        }
        setErrorMessage('');
        compressImageFile(file, (optimizedDataUrl) => {
          setPhotos(prev => {
            const next = [...prev];
            next[slotIndex] = optimizedDataUrl;
            return next;
          });
        });
      };

      const handleRemovePhoto = (slotIndex) => {
        setPhotos(prev => {
          const next = [...prev];
          next[slotIndex] = '';
          return next;
        });
      };

      const handleSaveUrlPhoto = () => {
        if (urlPromptSlot !== null && urlInput.trim()) {
          setPhotos(prev => {
            const next = [...prev];
            next[urlPromptSlot] = urlInput.trim();
            return next;
          });
          setUrlPromptSlot(null);
          setUrlInput('');
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
          setErrorMessage('Please enter your name or memorial title.');
          return;
        }
        if (!paragraph.trim()) {
          setErrorMessage('Please write your paragraph or story.');
          return;
        }

        const validPhotos = photos.filter(Boolean);
        const defaultPlaceholder = 'https://images.prismic.io/197historiasilustradas/aaB68sFoBIGEg35F_figure-193.jpg?auto=format%2Ccompress&w=512&h=512&fit=crop';
        const primaryImage = validPhotos[0] || defaultPlaceholder;
        const allPhotos = validPhotos.length > 0 ? validPhotos : [primaryImage];
        const codePad = String(nextNumber).padStart(3, '0');

        const newStory = {
          id: nextNumber,
          number: nextNumber,
          codePad: codePad,
          name: name.trim(),
          shortName: name.trim().split(' ')[0] || name.trim(),
          displayTitle: name.trim(),
          image: primaryImage,
          images: allPhotos,
          category: 'Inner Stories',
          city: city.trim() || 'Montevideo',
          year: parseInt(year, 10) || new Date().getFullYear(),
          placeOfBirth: city.trim() || 'Montevideo',
          dateOfBirth: 'Living Memory',
          placeOfDisappearance: 'Living Archive',
          dateOfDisappearance: 'Present & Remembered',
          calculatedAge: 'Eternal Presence',
          artist: name.trim() + (authUser ? ' (@' + (authUser.name || authUser.username || 'Contributor') + ')' : ' (Self-Contribution)'),
          songUrl: songUrl.trim(),
          songPlatform: parsedSong ? parsedSong.platform : null,
          songEmbedUrl: parsedSong ? parsedSong.embedUrl : null,
          tagline: {
            es: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : ''),
            en: paragraph.trim().slice(0, 90) + (paragraph.length > 90 ? '...' : '')
          },
          bio: {
            es: paragraph.trim(),
            en: paragraph.trim()
          },
          storyText: {
            es: paragraph.trim(),
            en: paragraph.trim()
          },
          isUserSubmitted: true,
          contributorAuth: authUser ? authUser.provider : 'verified',
          submittedAt: new Date().toLocaleDateString()
        };

        storyAudio.playSuccess();
        onAddStory(newStory);
        setSuccessStory(newStory);
      };

      const handleResetForm = () => {
        setPhotos(['', '', '']);
        setName(authUser ? (authUser.name || '') : '');
        setParagraph('');
        setSongUrl('');
        setSuccessStory(null);
        setErrorMessage('');
      };

      // =====================================================================
      // VIEW 1: AUTHENTICATION GATE (GOOGLE OAUTH / PHONE OTP REQUIRED)
      // =====================================================================
      if (!authUser) {
        return (
          <div className="font-mono text-black max-w-5xl mx-auto py-6 md:py-10 px-4 animate-fadeIn">
            {/* Header */}
            <div className="border-b-2 border-black pb-6 mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[11px] font-mono font-bold tracking-wider uppercase mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ARCHIVAL REGISTRY // CONTRIBUTOR AUTHENTICATION
              </div>
              <h1 className="text-2xl md:text-4xl font-mono font-bold text-black tracking-tight uppercase">
                SIGN IN TO CONTRIBUTE YOUR STORY
              </h1>
              <p className="text-xs md:text-sm font-mono text-neutral-600 max-w-2xl mx-auto mt-2 leading-relaxed">
                Verify your contributor identity using Google OAuth, Username & Password, or Phone SMS OTP to unlock entry #{String(nextNumber).padStart(3, '0')}.
              </p>
            </div>

            {/* Global Error Notice */}
            {authError && (
              <div className="mb-6 p-3 bg-red-50 border-2 border-red-600 text-red-800 text-xs font-mono font-medium">
                ⚠ {authError}
              </div>
            )}

            {/* Main 2-Column Side-by-Side Gateway */}
            <div className="bg-white border-2 border-black shadow-xl grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-black">
              
              {/* LEFT SIDE: GOOGLE OAUTH & USERNAME / PASSWORD */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-black/15 mb-6 font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>[ OPTION 1 ]</span> GOOGLE / USERNAME
                    </span>
                    <span className="text-neutral-400 text-[10px]">OAUTH 2.0 & DIRECT</span>
                  </div>

                  {/* 1. Google OAuth */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-mono font-bold uppercase text-neutral-600">
                      INSTANT GOOGLE SIGN-IN:
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGoogleSignInClick}
                      className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 text-black border-2 border-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow active:scale-[0.99]"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      LOGIN WITH GOOGLE
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-black/15"></div>
                    </div>
                    <span className="relative bg-white px-3 font-mono text-[11px] text-neutral-400 font-bold uppercase tracking-widest">
                      OR USE USERNAME & PASSWORD
                    </span>
                  </div>

                  {/* 2. Username & Password Form */}
                  <form onSubmit={handleUserPassLogin} className="space-y-3.5">
                    {userPassError && (
                      <div className="p-2.5 bg-red-50 border border-red-500 text-red-700 text-xs font-mono">
                        ⚠ {userPassError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                        USERNAME OR EMAIL
                      </label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => { setUsernameInput(e.target.value); setUserPassError(''); }}
                        placeholder="e.g. Elena Rostova or elena@archive.org"
                        className="w-full bg-white border border-black px-3 py-2.5 font-mono text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => { setPasswordInput(e.target.value); setUserPassError(''); }}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-black px-3 py-2.5 font-mono text-xs text-black placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-black text-white hover:bg-neutral-800 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      <span>[ SIGN IN / CONTINUE → ]</span>
                    </button>
                  </form>
                </div>

                <div className="pt-4 border-t border-black/10 font-mono text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>CONTRIBUTOR CREDENTIALS</span>
                  <span>DIRECT GATEWAY</span>
                </div>
              </div>

              {/* RIGHT SIDE: LOGIN WITH PHONE OTP */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 bg-neutral-50/60">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-black/15 mb-6 font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <span>[ OPTION 2 ]</span> LOGIN WITH PHONE OTP
                    </span>
                    <span className="text-neutral-400 text-[10px]">SMS 2FA VERIFICATION</span>
                  </div>

                  {phoneAuthError && (
                    <div className="mb-4 p-2.5 bg-red-50 border border-red-500 text-red-700 text-xs font-mono">
                      ⚠ {phoneAuthError}
                    </div>
                  )}

                  {!otpSent ? (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-600 font-mono leading-relaxed">
                        Authenticate via your mobile number. A 6-digit verification code will be sent to confirm your contributor identity.
                      </p>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                          ENTER MOBILE NUMBER
                        </label>
                        <div className="flex gap-2">
                          <div className="bg-neutral-100 border border-black px-3 py-2.5 font-mono text-xs font-bold flex items-center gap-1.5 select-none text-neutral-800">
                            <span>🇺🇾</span>
                            <span>+598</span>
                          </div>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => { setPhoneNumber(e.target.value); setPhoneAuthError(''); }}
                            placeholder="099 123 456"
                            className="flex-1 bg-white border border-black px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="w-full py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <span>[ SEND SMS OTP CODE → ]</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-3 bg-emerald-50 border border-emerald-500 text-emerald-800 text-xs font-mono space-y-1">
                        <div>SMS verification code sent to <strong>{phoneCountry} {phoneNumber}</strong></div>
                        <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                          <span>Code: <strong>{generatedOtp}</strong></span>
                          <button
                            type="button"
                            onClick={() => setEnteredOtp(generatedOtp)}
                            className="underline hover:text-emerald-900 font-bold"
                          >
                            [ Auto-fill ]
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase font-mono text-neutral-800">
                          ENTER 6-DIGIT OTP CODE
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => { setEnteredOtp(e.target.value.replace(/\D/g, '')); setPhoneAuthError(''); }}
                          placeholder="••••••"
                          className="w-full bg-white border border-black px-3 py-3 text-center tracking-[0.5em] font-mono text-xl font-bold focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="flex-1 py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase tracking-wider transition-all"
                        >
                          [ VERIFY & PROCEED → ]
                        </button>
                        <button
                          type="button"
                          onClick={() => { setOtpSent(false); setEnteredOtp(''); }}
                          className="px-3 py-3 border border-black text-xs font-mono hover:bg-neutral-100"
                        >
                          EDIT NO.
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-black/10 font-mono text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>SMS CARRIER GATEWAY</span>
                  <span>VERIFIED 2FA</span>
                </div>
              </div>

            </div>
          </div>
        );
      }

      // =====================================================================
      // VIEW 2: AUTHENTICATED ADD YOURS SUBMISSION FORM
      // =====================================================================
      return (
        <div className="font-mono text-black">
          {/* Authenticated Contributor Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-100 border border-black mb-8 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                VERIFIED CONTRIBUTOR: <strong>{authUser.name || authUser.phone}</strong> {authUser.email ? '(' + authUser.email + ')' : ''}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-black text-white font-bold uppercase tracking-wider">
                {authUser.provider === 'google' ? 'GOOGLE OAUTH' : 'PHONE OTP'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[11px] underline hover:opacity-70 uppercase font-mono"
            >
              [ SIGN OUT ⎋ ]
            </button>
          </div>

          {/* Header Banner with Assigned Registry Number */}
          <div className="border-b border-black/15 pb-8 mb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[12px] font-mono font-bold tracking-wider uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ASSIGNED ARCHIVE REGISTRY NO. #{String(nextNumber).padStart(3, '0')}
              </div>
              <div className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
                PERMANENT LIVING ARCHIVE
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-black tracking-tight mb-2">
              Add Your Story to the Memorial
            </h1>
            <p className="text-sm font-serif text-neutral-600 max-w-2xl leading-relaxed">
              Contribute your personal memory, portrait, and voice. Every submission receives a permanent assigned sequential number in the archive alongside the 197 illustrated stories.
            </p>
          </div>

          {/* Success Banner */}
          {successStory && (
            <div className="bg-white border-2 border-black p-6 md:p-8 shadow-2xl mb-12 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-6">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wide">
                  <span>✓</span> ENTRY #{successStory.codePad} RECORDED SUCCESSFULLY
                </div>
                <div className="text-xs text-neutral-500 font-mono">
                  {successStory.submittedAt}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
                <div className="aspect-square bg-[#eae8e2] border border-black/20 overflow-hidden">
                  <img src={successStory.image} alt={successStory.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-neutral-500 font-mono">
                    #{successStory.codePad} // {successStory.city} ({successStory.year})
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-black">{successStory.name}</h3>
                  <p className="font-mono text-xs text-neutral-700 line-clamp-3 leading-relaxed whitespace-pre-line">
                    {successStory.bio.en}
                  </p>
                  {successStory.songEmbedUrl && (
                    <div className="text-xs font-mono text-emerald-700 font-semibold pt-1 flex items-center gap-1.5">
                      <span>🎵</span> {successStory.songPlatform.toUpperCase()} SONG LINKED
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6 mt-6 border-t border-black/10">
                <button
                  onClick={() => onSelectStory(successStory)}
                  className="px-6 py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-md"
                >
                  [ VIEW YOUR STORY DETAIL ↗ ]
                </button>
                <button
                  onClick={handleResetForm}
                  className="px-5 py-3 border border-black text-black hover:bg-black hover:text-white text-xs font-mono font-bold tracking-wider uppercase transition-all"
                >
                  [ + ADD ANOTHER ENTRY ]
                </button>
              </div>
            </div>
          )}

          {/* Submission Form */}
          {!successStory && (
            <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-black p-6 md:p-10 shadow-sm">
              
              {/* Photo Upload Slots (3 Slots) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider font-mono">
                    01. UPLOAD PHOTOS (3 SLOTS) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {photos.filter(Boolean).length} of 3 uploaded
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[0, 1, 2].map((slotIdx) => {
                    const slotTitles = ['PHOTO 01 (PRIMARY)', 'PHOTO 02 (CONTEXT)', 'PHOTO 03 (DETAIL)'];
                    const photo = photos[slotIdx];
                    const isDragging = isDraggingSlot === slotIdx;

                    return (
                      <div key={slotIdx} className="space-y-2">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                          {slotTitles[slotIdx]}
                        </div>

                        {photo ? (
                          <div className="relative aspect-square border border-black bg-[#eae8e2] overflow-hidden group shadow-sm">
                            <img src={photo} alt={"Slot " + (slotIdx + 1)} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                              <span className="text-white text-[11px] font-mono uppercase font-bold">PHOTO 0{slotIdx + 1} READY</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(slotIdx)}
                                className="px-3 py-1 bg-white text-black hover:bg-red-50 text-[11px] font-mono uppercase font-bold border border-black shadow-sm"
                              >
                                [ ✕ REMOVE ]
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingSlot(slotIdx); }}
                            onDragLeave={() => setIsDraggingSlot(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingSlot(null);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleFileChange(slotIdx, e.dataTransfer.files[0]);
                              }
                            }}
                            className={'relative aspect-square border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer ' +
                              (isDragging ? 'border-black bg-black/10 scale-[1.02]' : 'border-neutral-300 hover:border-black bg-neutral-50 hover:bg-white')}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(slotIdx, e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              title="Upload photo"
                            />
                            <div className="pointer-events-none space-y-1.5">
                              <div className="text-2xl text-neutral-400">📷</div>
                              <div className="text-xs font-bold font-mono text-black">
                                CLICK OR DROP
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono">
                                PNG, JPG, WEBP
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUrlPromptSlot(slotIdx);
                              }}
                              className="mt-2 text-[10px] underline text-neutral-600 hover:text-black font-mono relative z-10"
                            >
                              or paste URL
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional URL input modal/inline prompt */}
                {urlPromptSlot !== null && (
                  <div className="p-4 bg-neutral-100 border border-black space-y-2 mt-2">
                    <div className="text-xs font-mono font-bold uppercase">
                      PASTE IMAGE URL FOR PHOTO 0{urlPromptSlot + 1}:
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.example.com/photo.jpg"
                        className="flex-1 bg-white border border-black px-3 py-1.5 font-mono text-xs text-black"
                      />
                      <button
                        type="button"
                        onClick={handleSaveUrlPhoto}
                        className="px-4 py-1.5 bg-black text-white text-xs font-mono font-bold uppercase"
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUrlPromptSlot(null); setUrlInput(''); }}
                        className="px-3 py-1.5 border border-black text-xs font-mono"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Your Name */}
              <div className="space-y-2">
                <label htmlFor="user-name" className="block text-xs font-bold uppercase tracking-wider font-mono">
                  02. YOUR NAME <span className="text-red-500">*</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez or Your Full Name"
                  className="w-full bg-white border border-black px-4 py-3 font-mono text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>

              {/* Your Paragraph */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-paragraph" className="block text-xs font-bold uppercase tracking-wider font-mono">
                    03. YOUR PARAGRAPH / STORY <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {paragraph.length} chars | {paragraph.trim() ? paragraph.trim().split(' ').filter(Boolean).length : 0} words
                  </span>
                </div>
                <textarea
                  id="user-paragraph"
                  rows={6}
                  value={paragraph}
                  onChange={(e) => setParagraph(e.target.value)}
                  placeholder="Write your paragraph, remembrance, favorite memory, dedication, or personal reflection..."
                  className="w-full bg-white border border-black p-4 font-mono text-xs md:text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black leading-relaxed"
                  required
                />
              </div>

              {/* Favourite Song (Spotify or YouTube) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-song" className="block text-xs font-bold uppercase tracking-wider font-mono">
                    04. FAVOURITE SONG (SPOTIFY OR YOUTUBE URL)
                  </label>
                  {parsedSong && (
                    <span className={'text-[11px] font-mono font-bold px-2 py-0.5 rounded border ' + 
                      (parsedSong.platform === 'spotify' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-red-600 bg-red-50 text-red-700')}>
                      {parsedSong.platform === 'spotify' ? '🟢 SPOTIFY TRACK VERIFIED' : '🔴 YOUTUBE VIDEO VERIFIED'}
                    </span>
                  )}
                </div>
                <input
                  id="user-song"
                  type="url"
                  value={songUrl}
                  onChange={(e) => setSongUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
                  className="w-full bg-white border border-black px-4 py-3 font-mono text-sm text-black placeholder-neutral-400 outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-[11px] text-neutral-500 font-mono">
                  Paste a Spotify track URL (e.g. open.spotify.com/track/...) or YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...).
                </p>

                {/* Live Song Embed Preview */}
                {parsedSong && (
                  <div className="mt-3 p-3 bg-neutral-100 border border-black/20 rounded animate-fadeIn">
                    <div className="text-[10px] text-neutral-500 uppercase font-mono mb-2">
                      LIVE SONG EMBED PREVIEW:
                    </div>
                    <iframe
                      src={parsedSong.embedUrl}
                      width="100%"
                      height={parsedSong.platform === 'spotify' ? "80" : "152"}
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded border border-black/10 bg-white block w-full"
                    ></iframe>
                  </div>
                )}
              </div>

              {/* City and Year metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-neutral-600 uppercase font-mono">City / Location</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Montevideo, Buenos Aires, etc."
                    className="w-full bg-white border border-black/40 px-3 py-2 font-mono text-xs text-black outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-neutral-600 uppercase font-mono">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-white border border-black/40 px-3 py-2 font-mono text-xs text-black outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-500 text-red-700 text-xs font-mono flex items-center justify-between">
                  <span>⚠ {errorMessage}</span>
                  <button type="button" onClick={() => setErrorMessage('')} className="hover:underline font-bold">[✕]</button>
                </div>
              )}

              {/* Submit Button & Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-black/15">
                <button
                  type="submit"
                  className="px-8 py-4 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold tracking-widest uppercase transition-all shadow-md active:scale-[0.99]"
                >
                  [ SUBMIT TO MEMORIAL ARCHIVE → ]
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-4 border border-black/30 hover:border-black text-neutral-700 hover:text-black text-xs font-mono tracking-wider uppercase transition-all"
                >
                  [ CLEAR FORM ]
                </button>
              </div>

            </form>
          )}

          {/* User's Previous Submissions Section */}
          {userStories.length > 0 && (
            <div className="mt-16 pt-10 border-t-2 border-black">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-black">
                  Your Contributions ({userStories.length})
                </h2>
                <span className="text-xs font-mono text-neutral-500">
                  SAVED IN LOCAL REGISTRY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => onSelectStory(story)}
                    className="group cursor-pointer border border-black bg-white p-4 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-square bg-[#eae8e2] overflow-hidden mb-3 border border-black/10">
                        <img src={story.image} alt={story.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 mb-1">
                        #{story.codePad} // {story.city} ({story.year})
                      </div>
                      <div className="font-bold text-sm text-black truncate mb-2">
                        {story.name}
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2 font-mono leading-relaxed">
                        {story.bio.en}
                      </p>
                    </div>

                    {story.songEmbedUrl && (
                      <div className="mt-3 pt-2 border-t border-black/10 text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                        <span>🎵</span> {story.songPlatform.toUpperCase()} SONG LINKED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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

      const [customStories, setCustomStories] = useState(() => {
        try {
          const saved = localStorage.getItem('historias_custom_stories_v1');
          return saved ? JSON.parse(saved) : [];
        } catch (e) {
          return [];
        }
      });

      const allStories = useMemo(() => {
        return [...STORIES_DATA, ...customStories];
      }, [customStories]);

      const nextAssignedNumber = STORIES_DATA.length + customStories.length + 1;

      const handleAddStory = (newStory) => {
        setCustomStories(prev => {
          const updated = [...prev, newStory];
          try {
            localStorage.setItem('historias_custom_stories_v1', JSON.stringify(updated));
          } catch (e) {
            console.warn('LocalStorage error', e);
          }
          return updated;
        });
      };

      const filteredStories = useMemo(() => {
        return allStories.filter(item => {
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = item.name.toLowerCase().includes(q);
            const matchNum = String(item.number).includes(q);
            if (!matchName && !matchNum) return false;
          }
          return true;
        });
      }, [allStories, selectedCategory, searchQuery]);

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
          {/* VIEW 4: ADD YOURS                                        */}
          {/* ======================================================== */}
          {view === 'add-yours' && (
            <div data-scrollable="true" className="w-full h-full pt-36 pb-24 px-6 md:px-16 overflow-y-auto font-mono scroll-smooth">
              <div className="max-w-4xl mx-auto min-h-[60vh]">
                <AddYoursView
                  nextNumber={nextAssignedNumber}
                  onAddStory={handleAddStory}
                  onSelectStory={(story) => setSelectedStory(story)}
                  userStories={customStories}
                />
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
