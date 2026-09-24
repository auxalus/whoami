import React from 'react';

export function MiniMap({ telemetry, onRecenter, lang }) {
  return (
    <div className="fixed bottom-6 right-6 z-10 bg-[#f5f4f0]/90 backdrop-blur-sm border border-[#121212]/20 p-2 rounded shadow-md hidden sm:block">
      <div className="font-mono text-[9px] uppercase tracking-wider text-[#787670] mb-1 flex justify-between">
        <span>RADAR</span>
        <button onClick={onRecenter} className="hover:underline text-[#121212]">
          {lang === 'es' ? 'Centrar' : 'Center'}
        </button>
      </div>
      <div className="w-28 h-20 bg-[#e7e4dc] relative border border-[#121212]/15 overflow-hidden">
        {/* Clustered representation of cards */}
        <div className="absolute inset-1.5 opacity-20 grid grid-cols-6 gap-1 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="bg-[#121212] rounded-[1px] h-2"></div>
          ))}
        </div>
        {/* Current Viewport box */}
        <div
          className="absolute border border-[#b91c1c] bg-[#b91c1c]/15 transition-all duration-75 pointer-events-none rounded-[1px]"
          style={{
            left: `${Math.max(0, Math.min(80, telemetry.normX * 72))}%`,
            top: `${Math.max(0, Math.min(75, telemetry.normY * 65))}%`,
            width: '28%',
            height: '35%'
          }}
        />
      </div>
    </div>
  );
}
