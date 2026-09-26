import React from 'react';
import { CATEGORIES, CITIES } from '../data/stories';

export function Header({
  lang,
  setLang,
  view,
  setView,
  filteredCount,
  totalCount,
  isFilterOpen,
  setIsFilterOpen,
  filterCategory,
  filterCity,
  setIsSearchOpen,
  setIsAboutOpen,
  isHudOpen,
  setIsHudOpen,
  audioEnabled,
  toggleAudio
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-[#121212]/10 bg-[#f5f4f0]/85 backdrop-blur-md px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Left: Project title counter & Collapsible Filters toggle */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#b91c1c] animate-pulse"></span>
          <span className="font-mono text-xs md:text-sm font-bold tracking-widest uppercase">
            {lang === 'es' ? '197 Historias Ilustradas' : '197 Illustrated Stories'}
          </span>
          <span className="text-[11px] font-mono text-[#787670] hidden sm:inline-block">
            [{filteredCount}/{totalCount}]
          </span>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`font-mono text-xs uppercase px-2.5 py-1 border transition-all flex items-center space-x-1.5 ${
            isFilterOpen || filterCategory !== 'all' || filterCity !== 'all'
              ? 'border-[#121212] bg-[#121212] text-[#f5f4f0]'
              : 'border-[#121212]/30 text-[#121212] hover:border-[#121212]'
          }`}
          title="Toggle Filters"
        >
          <span>{lang === 'es' ? 'Filtros' : 'Filters'}</span>
          <span>{isFilterOpen ? '[-]' : '[+]'}</span>
          {(filterCategory !== 'all' || filterCity !== 'all') && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]"></span>
          )}
        </button>
      </div>

      {/* Center: Segmented view toggles [ GRID ] [ LIST ] [ GALLERY ] */}
      <div className="flex items-center bg-[#e5e2d9]/60 p-1 rounded border border-[#121212]/15">
        <button
          onClick={() => setView('grid')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-sm ${
            view === 'grid'
              ? 'bg-[#121212] text-[#f5f4f0] shadow-sm font-bold'
              : 'text-[#555] hover:text-[#121212]'
          }`}
          title="2D Free Pan Staggered Grid (Key: 1)"
        >
          {lang === 'es' ? 'Grilla' : 'Grid'}
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-sm ${
            view === 'list'
              ? 'bg-[#121212] text-[#f5f4f0] shadow-sm font-bold'
              : 'text-[#555] hover:text-[#121212]'
          }`}
          title="Archive Table Registry (Key: 2)"
        >
          {lang === 'es' ? 'Listado' : 'List'}
        </button>
        <button
          onClick={() => setView('gallery')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-sm ${
            view === 'gallery'
              ? 'bg-[#121212] text-[#f5f4f0] shadow-sm font-bold'
              : 'text-[#555] hover:text-[#121212]'
          }`}
          title="Curated Showcase Exhibition (Key: 3)"
        >
          {lang === 'es' ? 'Galería' : 'Gallery'}
        </button>
        <button
          onClick={() => setView('add-yours')}
          className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-sm border ${
            view === 'add-yours'
              ? 'bg-[#121212] text-[#f5f4f0] border-[#121212] shadow-sm font-bold'
              : 'border-[#121212]/30 text-[#121212] bg-[#121212]/5 hover:bg-[#121212] hover:text-[#f5f4f0] font-semibold'
          }`}
          title="Add Yours"
        >
          {lang === 'es' ? 'Añadir' : 'Add Yours'}
        </button>
      </div>

      {/* Right: Search, About, Language toggle & HUD */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 text-xs font-mono border border-transparent hover:border-[#121212]/20 px-2 py-1 rounded transition-colors"
          title="Search stories (⌘K)"
        >
          <svg className="w-3.5 h-3.5 text-[#121212]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{lang === 'es' ? 'Buscar' : 'Search'}</span>
          <span className="text-[10px] text-[#787670] border border-[#787670]/40 px-1 rounded">⌘K</span>
        </button>

        {/* About trigger */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="text-xs font-mono uppercase tracking-wider hover:underline text-[#121212]"
        >
          {lang === 'es' ? 'Sobre el Proyecto' : 'About'}
        </button>

        {/* Language Switcher */}
        <div className="font-mono text-xs flex items-center border border-[#121212]/30 rounded overflow-hidden">
          <button
            onClick={() => setLang('es')}
            className={`px-2 py-0.5 transition-colors ${lang === 'es' ? 'bg-[#121212] text-[#f5f4f0]' : 'hover:bg-[#e4e1d7]'}`}
          >
            ES
          </button>
          <span className="text-[#121212]/30">/</span>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 transition-colors ${lang === 'en' ? 'bg-[#121212] text-[#f5f4f0]' : 'hover:bg-[#e4e1d7]'}`}
          >
            EN
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-1.5 rounded border transition-colors ${
            audioEnabled ? 'border-[#121212] bg-[#121212] text-[#f5f4f0]' : 'border-transparent text-[#787670] hover:text-[#121212]'
          }`}
          title={audioEnabled ? 'Mute Memorial Audio' : 'Enable Memorial Audio'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {audioEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            )}
          </svg>
        </button>

        {/* Physics HUD Toggle */}
        <button
          onClick={() => setIsHudOpen(!isHudOpen)}
          className={`p-1.5 rounded border transition-colors ${
            isHudOpen ? 'border-[#121212] bg-[#121212] text-[#f5f4f0]' : 'border-[#121212]/30 text-[#121212] hover:border-[#121212]'
          }`}
          title="Tuning & Physics Telemetry"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
