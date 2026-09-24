import React from 'react';

export function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  filteredStories,
  onSelectStory,
  lang
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-[#121212]/60 backdrop-blur-sm animate-fadeIn">
      <div data-scrollable="true" className="bg-[#f5f4f0] border border-[#121212] max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#121212] mb-4">
          <span className="font-mono text-xs uppercase font-bold tracking-widest text-[#787670]">
            {lang === 'es' ? 'Búsqueda en el Archivo' : 'Search Archive'}
          </span>
          <button onClick={onClose} className="font-mono text-xs hover:underline">
            [ESC]
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Escriba un nombre, número, oficio o palabra clave...' : 'Type name, number, calling or keyword...'}
            className="w-full bg-white border border-[#121212] px-4 py-3 font-serif text-lg text-[#121212] placeholder-[#787670] outline-none focus:ring-1 focus:ring-[#121212]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3.5 font-mono text-xs text-[#787670] hover:text-[#121212]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Instant Results */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filteredStories.slice(0, 8).map(story => (
            <div
              key={story.id}
              onClick={() => {
                onSelectStory(story);
                onClose();
              }}
              className="p-3 border border-[#121212]/15 bg-white hover:border-[#121212] transition-colors cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs font-bold text-[#b91c1c]">{story.code}</span>
                <div>
                  <div className="font-serif font-bold text-base">{story.name}</div>
                  <div className="font-mono text-[11px] text-[#787670]">{story.tagline[lang]}</div>
                </div>
              </div>
              <span className="font-mono text-xs text-[#787670]">{story.year}</span>
            </div>
          ))}
          {filteredStories.length === 0 && (
            <div className="py-8 text-center font-mono text-xs text-[#787670]">
              {lang === 'es' ? 'No se encontraron resultados para su búsqueda.' : 'No matching stories found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
