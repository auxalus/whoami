import React from 'react';

export function AboutModal({ isOpen, onClose, lang }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#121212]/60 backdrop-blur-sm animate-fadeIn">
      <div data-scrollable="true" className="bg-[#f5f4f0] border border-[#121212] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-mono text-xs uppercase px-2.5 py-1 border border-[#121212] bg-[#121212] text-[#f5f4f0]"
        >
          {lang === 'es' ? 'CERRAR [✕]' : 'CLOSE [✕]'}
        </button>

        <span className="font-mono text-xs uppercase tracking-widest text-[#787670] block mb-2">
          {lang === 'es' ? 'Contexto & Filosofía' : 'Context & Philosophy'}
        </span>
        <h2 className="font-serif text-3xl font-bold mb-4">
          {lang === 'es' ? 'Sobre "197 Historias Ilustradas"' : 'About "197 Illustrated Stories"'}
        </h2>

        <div className="space-y-4 font-serif text-base text-[#333] leading-relaxed">
          <p>
            {lang === 'es'
              ? 'Entre las décadas de 1970 y 1980, Uruguay y la región atravesaron dictaduras cívico-militares que marcaron profundamente a sus sociedades. 197 personas fueron detenidas desaparecidas bajo la responsabilidad del Estado uruguayo.'
              : 'Between the 1970s and 1980s, Uruguay and the surrounding Southern Cone endured civic-military dictatorships that profoundly wounded their societies. 197 people were forcibly disappeared under the responsibility of the Uruguayan State.'}
          </p>
          <p>
            {lang === 'es'
              ? 'Este proyecto editorial y digital no busca definir a las personas únicamente por la tragedia de su ausencia, sino recuperar la plenitud de sus vidas: sus pasiones cotidianas, su amor por la música, la docencia, los talleres de imprenta, el fútbol barrial y el anhelo de un mundo más justo.'
              : 'This editorial and digital memorial does not define these individuals solely by the tragedy of their disappearance, but rather celebrates the fullness of their lives: their daily joys, their love for music, teaching, print workshops, neighborhood football, and their yearning for a fraternal world.'}
          </p>
          <p className="italic font-serif text-[#121212] border-l-2 border-[#121212] pl-4 my-4">
            {lang === 'es'
              ? '"Recordar es volver a pasar por el corazón; porque mientras sus historias sigan siendo narradas, su voz nunca será silenciada."'
              : '"To remember is to pass through the heart once more; for as long as their stories continue to be told, their voices will never be silenced."'}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-[#121212]/15 font-mono text-xs text-[#787670]">
          <div>DISEÑO & DESARROLLO CREATIVO</div>
          <div>TRIBUTO A LA MEMORIA, JUSTICIA Y VERDAD</div>
        </div>
      </div>
    </div>
  );
}
