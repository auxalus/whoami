import React from 'react';

export function PhysicsHUD({
  isOpen,
  onClose,
  damping,
  setDamping,
  deltaMultiplier,
  setDeltaMultiplier,
  rubberBand,
  setRubberBand,
  invertPan,
  setInvertPan,
  telemetry,
  onRecenter
}) {
  if (!isOpen) return null;

  return (
    <div data-scrollable="true" className="fixed bottom-6 left-6 z-50 bg-[#121212] text-[#f5f4f0] p-5 rounded border border-[#f5f4f0]/20 shadow-2xl max-w-sm w-full font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold tracking-wider">PHYSICS & MOTION TUNER</span>
        </div>
        <button onClick={onClose} className="hover:text-red-400">[✕]</button>
      </div>

      {/* Damping slider */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span>LERP DAMPING:</span>
          <span className="text-emerald-400 font-bold">{damping}</span>
        </div>
        <input
          type="range"
          min="0.03"
          max="0.20"
          step="0.01"
          value={damping}
          onChange={(e) => setDamping(parseFloat(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-white/50">
          <span>0.03 (Floaty glide)</span>
          <span>0.20 (Snappy)</span>
        </div>
      </div>

      {/* Delta Multiplier / Sensitivity */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] mb-1">
          <span>SENSITIVITY (DELTA MULT):</span>
          <span className="text-emerald-400 font-bold">{deltaMultiplier}x</span>
        </div>
        <input
          type="range"
          min="0.4"
          max="2.5"
          step="0.1"
          value={deltaMultiplier}
          onChange={(e) => setDeltaMultiplier(parseFloat(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-white/50">
          <span>0.4x (Heavy)</span>
          <span>2.5x (Agile)</span>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2 pt-2 border-t border-white/10 mb-3 text-[11px]">
        <label className="flex items-center justify-between cursor-pointer">
          <span>RUBBER-BAND RESISTANCE:</span>
          <input
            type="checkbox"
            checked={rubberBand}
            onChange={(e) => setRubberBand(e.target.checked)}
            className="accent-emerald-400"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span>INVERT 2D PAN:</span>
          <input
            type="checkbox"
            checked={invertPan}
            onChange={(e) => setInvertPan(e.target.checked)}
            className="accent-emerald-400"
          />
        </label>
      </div>

      {/* Real-time telemetry */}
      <div className="p-2 bg-white/5 rounded text-[10px] space-y-1 text-white/70">
        <div className="flex justify-between">
          <span>CURRENT POS:</span>
          <span className="font-mono text-white">({telemetry.x}, {telemetry.y}) px</span>
        </div>
        <div className="flex justify-between">
          <span>INSTANT VELOCITY:</span>
          <span className="font-mono text-emerald-400">({telemetry.vx}, {telemetry.vy}) px/f</span>
        </div>
        <div className="flex justify-between">
          <span>PROGRESSION:</span>
          <span className="font-mono text-white">{Math.round(telemetry.normX * 100)}% X · {Math.round(telemetry.normY * 100)}% Y</span>
        </div>
      </div>

      <button
        onClick={onRecenter}
        className="mt-3 w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-center transition-colors"
      >
        RECENTER CANVAS (0, 0)
      </button>
    </div>
  );
}
