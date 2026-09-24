import React from 'react';

export function GalleryView({ stories, lang, onSelectStory }) {
  return (
    <div data-scrollable="true" className="w-full h-full pt-20 pb-16 px-4 md:px-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-[#787670] block mb-1">
            {lang === 'es' ? 'Exposición Editorial' : 'Curated Exhibition'}
          </span>
          <h2 className="font-serif text-4xl mb-3">
            {lang === 'es' ? 'El Rostro Humano de la Memoria' : 'The Human Face of Memory'}
          </h2>
          <p className="font-serif italic text-base text-[#4a4a46]">
            {lang === 'es'
              ? 'Una selección de retratos que celebran el arte, el compromiso y la ternura de quienes siguen presentes en nuestra memoria viva.'
              : 'A selection of portraits honoring the art, commitment, and tender warmth of those who remain ever present in our living memory.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="bg-white border border-[#121212]/15 p-5 card-shadow hover:card-shadow-hover hover:border-[#121212] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between mb-3 font-mono text-xs">
                  <span className="font-bold text-[#b91c1c]">{story.code}.</span>
                  <span className="text-[#787670]">{story.city}, {story.year}</span>
                </div>

                <div className="relative overflow-hidden aspect-[4/5] bg-[#e8e5dc] mb-4 border border-[#121212]/10">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-serif text-2xl font-semibold mb-1 group-hover:text-[#b91c1c] transition-colors">
                  {story.name}
                </h3>
                <p className="font-mono text-xs text-[#787670] mb-3">
                  {story.age} {lang === 'es' ? 'años' : 'years'} · {story.categoryLabel[lang]}
                </p>
                <p className="font-serif text-sm italic text-[#333] leading-relaxed mb-4">
                  "{story.tagline[lang]}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#e5e2d9] flex items-center justify-between font-mono text-[11px] text-[#787670]">
                <span>{lang === 'es' ? 'Arte:' : 'Art:'} {story.illustrator}</span>
                <span className="group-hover:translate-x-1 transition-transform text-[#121212] font-bold">
                  {lang === 'es' ? 'Leer historia →' : 'Read story →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
