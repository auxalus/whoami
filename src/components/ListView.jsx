import React from 'react';

export function ListView({ stories, lang, onSelectStory }) {
  return (
    <div data-scrollable="true" className="w-full h-full pt-20 pb-16 px-4 md:px-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 pb-4 border-b border-[#121212]">
          <span className="font-mono text-xs uppercase tracking-widest text-[#787670] block mb-1">
            {lang === 'es' ? 'Registro General' : 'General Register'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl">
            {lang === 'es' ? 'Nómina Memorial Ilustrada' : 'Illustrated Memorial Registry'}
          </h2>
        </div>

        <div className="border-t border-[#121212] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#121212]/30 text-[#787670] uppercase">
                <th className="py-3 px-2 w-16">#</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Nombre' : 'Name'}</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Edad' : 'Age'}</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Oficio / Pasión' : 'Calling / Passion'}</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Lugar' : 'Location'}</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Año' : 'Year'}</th>
                <th className="py-3 px-4">{lang === 'es' ? 'Ilustrador' : 'Artist'}</th>
                <th className="py-3 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => (
                <tr
                  key={story.id}
                  onClick={() => onSelectStory(story)}
                  className="border-b border-[#121212]/10 hover:bg-white/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-2 font-bold text-[#b91c1c]">{story.code}</td>
                  <td className="py-4 px-4 font-semibold text-sm font-serif group-hover:text-[#b91c1c] transition-colors">
                    {story.name}
                  </td>
                  <td className="py-4 px-4 text-[#787670]">{story.age} {lang === 'es' ? 'años' : 'yrs'}</td>
                  <td className="py-4 px-4 font-serif italic text-sm text-[#4a4a46] max-w-xs truncate">
                    {story.tagline[lang]}
                  </td>
                  <td className="py-4 px-4">{story.city}</td>
                  <td className="py-4 px-4 font-bold">{story.year}</td>
                  <td className="py-4 px-4 text-[#787670]">{story.illustrator}</td>
                  <td className="py-4 px-2 text-right text-sm group-hover:translate-x-1 transition-transform">→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
