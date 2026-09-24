import React from 'react';
import { CATEGORIES, CITIES } from '../data/stories';

export function FilterDrawer({
  lang,
  isOpen,
  filterCategory,
  setFilterCategory,
  filterCity,
  setFilterCity,
  searchQuery,
  setSearchQuery,
  onReset
}) {
  if (!isOpen) return null;

  return (
    <div data-scrollable="true" className="fixed top-16 left-0 right-0 z-30 bg-[#f5f4f0]/95 backdrop-blur-md border-b border-[#121212]/15 px-6 py-4 shadow-lg transition-all animate-fadeIn">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Category filters */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[#787670] uppercase font-bold mr-1">
            {lang === 'es' ? 'Área:' : 'Field:'}
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded border transition-colors ${
                filterCategory === cat.id
                  ? 'border-[#121212] bg-[#121212] text-[#f5f4f0]'
                  : 'border-[#121212]/20 text-[#555] hover:border-[#121212]'
              }`}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>

        {/* City filters */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[#787670] uppercase font-bold mr-1">
            {lang === 'es' ? 'Ciudad:' : 'Place:'}
          </span>
          {CITIES.map(city => (
            <button
              key={city.id}
              onClick={() => setFilterCity(city.id)}
              className={`px-3 py-1 rounded border transition-colors ${
                filterCity === city.id
                  ? 'border-[#121212] bg-[#121212] text-[#f5f4f0]'
                  : 'border-[#121212]/20 text-[#555] hover:border-[#121212]'
              }`}
            >
              {city.label[lang]}
            </button>
          ))}

          {(filterCategory !== 'all' || filterCity !== 'all' || searchQuery) && (
            <button
              onClick={onReset}
              className="ml-2 underline text-[#b91c1c] hover:text-[#991b1b]"
            >
              {lang === 'es' ? 'Restablecer' : 'Clear all'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
