import React, { useState, useMemo, useEffect } from 'react';
import { STORIES_DATA } from './data/stories';
import { useInertiaPan } from './hooks/useInertiaPan';
import { Header } from './components/Header';
import { GridView } from './components/GridView';
import { ListView } from './components/ListView';
import { GalleryView } from './components/GalleryView';
import { DetailModal } from './components/DetailModal';
import { FilterDrawer } from './components/FilterDrawer';
import { SearchModal } from './components/SearchModal';
import { AboutModal } from './components/AboutModal';
import { PhysicsHUD } from './components/PhysicsHUD';
import { MiniMap } from './components/MiniMap';
import { AddYoursView } from './components/AddYoursView';

// Subtle Web Audio chime synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }
  playPencilTap() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
  playArchivalChime() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    [528, 660, 792].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.02, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + i * 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.85 + i * 0.04);
    });
  }
}
const soundEngine = new SoundEngine();

export default function App() {
  const [lang, setLang] = useState('es'); // 'es' | 'en'
  const [view, setView] = useState('grid'); // 'grid' | 'list' | 'gallery' | 'add-yours'
  const [selectedStory, setSelectedStory] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

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

  // Tunable Inertia Physics
  const [damping, setDamping] = useState(0.08);
  const [deltaMultiplier, setDeltaMultiplier] = useState(1.0);
  const [rubberBand, setRubberBand] = useState(true);
  const [invertPan, setInvertPan] = useState(false);

  const canvasWidth = 3600;
  const canvasHeight = 2400;

  // Inertia Hook
  const {
    containerRef: canvasRef,
    telemetry,
    recenter
  } = useInertiaPan({
    canvasWidth,
    canvasHeight,
    damping,
    deltaMultiplier,
    rubberBand,
    enabled: view === 'grid'
  });

  // Filtered stories dataset
  const filteredStories = useMemo(() => {
    return allStories.filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterCity !== 'all' && item.city !== filterCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = (item.code || String(item.number)).includes(q);
        const matchBio = (item.bio?.es || item.bio || '').toLowerCase().includes(q) || (item.bio?.en || item.bio || '').toLowerCase().includes(q);
        const matchTag = (item.tagline?.es || '').toLowerCase().includes(q) || (item.tagline?.en || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchBio && !matchTag) return false;
      }
      return true;
    });
  }, [allStories, filterCategory, filterCity, searchQuery]);

  // Audio trigger
  const toggleAudio = () => {
    soundEngine.init();
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playArchivalChime();
  };

  const handleSelectStory = (story) => {
    soundEngine.playPencilTap();
    setSelectedStory(story);
  };

  const handleNavigateModal = (direction) => {
    if (!selectedStory) return;
    const idx = STORIES_DATA.findIndex(s => s.id === selectedStory.id);
    const newIdx = (idx + direction + STORIES_DATA.length) % STORIES_DATA.length;
    setSelectedStory(STORIES_DATA[newIdx]);
    soundEngine.playPencilTap();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedStory(null);
        setIsSearchOpen(false);
        setIsAboutOpen(false);
        setIsFilterOpen(false);
        setIsHudOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === '1') setView('grid');
      if (e.key === '2') setView('list');
      if (e.key === '3') setView('gallery');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f5f4f0] text-[#121212]">
      {/* 1. Sticky Header */}
      <Header
        lang={lang}
        setLang={setLang}
        view={view}
        setView={setView}
        filteredCount={filteredStories.length}
        totalCount={STORIES_DATA.length}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filterCategory={filterCategory}
        filterCity={filterCity}
        setIsSearchOpen={setIsSearchOpen}
        setIsAboutOpen={setIsAboutOpen}
        isHudOpen={isHudOpen}
        setIsHudOpen={setIsHudOpen}
        audioEnabled={audioEnabled}
        toggleAudio={toggleAudio}
      />

      {/* 2. Filter Drawer */}
      <FilterDrawer
        lang={lang}
        isOpen={isFilterOpen}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterCity={filterCity}
        setFilterCity={setFilterCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onReset={() => {
          setFilterCategory('all');
          setFilterCity('all');
          setSearchQuery('');
        }}
      />

      {/* 3. Main Views */}
      {view === 'grid' && (
        <>
          <GridView
            stories={filteredStories}
            lang={lang}
            onSelectStory={handleSelectStory}
            canvasRef={canvasRef}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
          {/* Visual canvas pan status indicator */}
          <div className="fixed bottom-6 left-6 z-10 pointer-events-none font-mono text-[11px] text-[#121212]/40 tracking-wider">
            <div>CANVAS 2D // LERP SMOOTH PAN</div>
            <div>X: {telemetry.x}px | Y: {telemetry.y}px | V: ({telemetry.velocityX}, {telemetry.velocityY})</div>
            <div className="text-[10px] text-[#787670] mt-0.5">
              {lang === 'es' ? 'Deslice con 2 dedos en el trackpad' : 'Swipe with 2 fingers on trackpad'}
            </div>
          </div>
          <MiniMap telemetry={telemetry} onRecenter={recenter} lang={lang} />
        </>
      )}

      {view === 'list' && (
        <ListView
          stories={filteredStories}
          lang={lang}
          onSelectStory={handleSelectStory}
        />
      )}

      {view === 'gallery' && (
        <GalleryView
          stories={filteredStories}
          lang={lang}
          onSelectStory={handleSelectStory}
        />
      )}

      {view === 'add-yours' && (
        <div data-scrollable="true" className="w-full h-full pt-28 pb-20 px-4 md:px-12 overflow-y-auto font-mono scroll-smooth">
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

      {/* 4. Modals */}
      <DetailModal
        story={selectedStory}
        allStories={STORIES_DATA}
        lang={lang}
        onClose={() => setSelectedStory(null)}
        onNavigate={handleNavigateModal}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredStories={filteredStories}
        onSelectStory={handleSelectStory}
        lang={lang}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        lang={lang}
      />

      <PhysicsHUD
        isOpen={isHudOpen}
        onClose={() => setIsHudOpen(false)}
        damping={damping}
        setDamping={setDamping}
        deltaMultiplier={deltaMultiplier}
        setDeltaMultiplier={setDeltaMultiplier}
        rubberBand={rubberBand}
        setRubberBand={setRubberBand}
        invertPan={invertPan}
        setInvertPan={setInvertPan}
        telemetry={{
          x: telemetry.x,
          y: telemetry.y,
          vx: telemetry.velocityX,
          vy: telemetry.velocityY,
          normX: telemetry.progressX,
          normY: telemetry.progressY
        }}
        onRecenter={recenter}
      />
    </div>
  );
}
