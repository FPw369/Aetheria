import React, { useState } from 'react';
import { Sun, Check, Sparkles, RotateCcw } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function SmileCounter({
  activeProfile,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const [smilesCount, setSmilesCount] = useState(isCompleted ? 5 : 0);

  const handleSmileTap = (index) => {
    const nextCount = index + 1;
    setSmilesCount(nextCount);
    audio.playBell();

    if (nextCount >= 5 && !isCompleted) {
      audio.playSuccess();
      onComplete();
    }
  };

  const handleReset = () => {
    setSmilesCount(0);
    audio.playClick();
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400">
        Share warm, authentic eye contact and a gentle smile with 5 different people today. Tap each sun beacon as you bestow your kindness.
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 text-center">
        <div className="flex items-center justify-center gap-2.5 my-3">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isFilled = smilesCount > idx;
            return (
              <button
                key={idx}
                onClick={() => handleSmileTap(idx)}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border ${
                  isFilled
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-lg scale-105'
                    : 'bg-slate-900/80 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <Sun className={`w-5 h-5 ${isFilled ? 'animate-spin-slow text-amber-300 fill-amber-300/30' : ''}`} />
                <span className="text-[9px] font-mono mt-0.5 font-bold">#{idx + 1}</span>
              </button>
            );
          })}
        </div>

        <p className="font-mono text-xs text-amber-300 mt-2">
          {smilesCount}/5 Warm Smiles Shared
        </p>

        {smilesCount >= 5 ? (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>5 Sparks of warmth transmitted into the world!</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 mt-1">
            Tap a beacon to log your smile
          </p>
        )}

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset counter
          </button>
        </div>
      </div>
    </div>
  );
}
