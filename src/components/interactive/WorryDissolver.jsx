import React, { useState } from 'react';
import { Trash2, Sparkles, Wind, RefreshCw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../../hooks/useAudio';

export function WorryDissolver({
  dissolverMode = "worry", // 'worry' | 'complaint'
  activeProfile,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const [text, setText] = useState('');
  const [status, setStatus] = useState('input'); // 'input' | 'folding' | 'dissolving' | 'dissolved'

  const isComplaint = dissolverMode === 'complaint';

  const handleDissolve = () => {
    if (!text.trim()) return;

    audio.playClick();
    setStatus('folding');

    // Stage 1: Folding effect
    setTimeout(() => {
      setStatus('dissolving');
      audio.playBell();

      // Particle disintegration effect
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#38bdf8', '#fb7185', '#ffffff']
        });
      } catch (e) {
        console.warn(e);
      }

      // Stage 2: Vanished
      setTimeout(() => {
        setStatus('dissolved');
        audio.playSuccess();
        if (!isCompleted) {
          onComplete();
        }
      }, 900);
    }, 800);
  };

  const handleReset = () => {
    setText('');
    setStatus('input');
    audio.playClick();
  };

  return (
    <div className="space-y-4">
      {status === 'input' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            {isComplaint
              ? "Identify a petty irritation or lingering annoyance. Confide it here to release its grip."
              : "Write down what has been weighing on your chest. Once externalized, it loses its power."}
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/40 border border-slate-700/80 shadow-inner relative">
            <label className="text-[11px] font-mono text-purple-300 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span>{isComplaint ? 'Petty Complaint / Irritation' : 'Current Worry / Weight'}</span>
              <span className="text-[10px] text-slate-500">Will be dissolved forever</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isComplaint
                  ? "I was annoyed about... but I choose peace now."
                  : "I'm worried that... and it has been making me feel tight in my chest."
              }
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-400 leading-relaxed"
            />
          </div>

          <button
            onClick={handleDissolve}
            disabled={!text.trim()}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !text.trim()
                ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white shadow-neon-pink active:scale-95'
            }`}
          >
            <Wind className="w-4 h-4" />
            Fold, Shred & Dissolve into Stardust
          </button>
        </div>
      )}

      {status === 'folding' && (
        <div className="p-8 rounded-2xl bg-slate-900/90 border border-purple-500/50 text-center flex flex-col items-center justify-center min-h-[220px] transform scale-75 rotate-6 transition-all duration-700 ease-in-out">
          <div className="w-16 h-16 rounded-xl bg-purple-800/40 border-2 border-purple-400 flex items-center justify-center mb-3 animate-pulse">
            <Trash2 className="w-8 h-8 text-purple-300" />
          </div>
          <p className="text-sm font-mono text-purple-200">Folding paper into origami...</p>
          <span className="text-xs text-slate-500 mt-1">Compressing energy...</span>
        </div>
      )}

      {status === 'dissolving' && (
        <div className="p-8 rounded-2xl bg-slate-950 border border-cyan-500/50 text-center flex flex-col items-center justify-center min-h-[220px] transform scale-50 opacity-50 transition-all duration-700">
          <Sparkles className="w-12 h-12 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-mono text-cyan-300">Disintegrating into quantum dust...</p>
        </div>
      )}

      {status === 'dissolved' && (
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 border border-purple-400/40 text-center flex flex-col items-center justify-center animate-fadeIn space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-lg">
            <Check className="w-6 h-6 text-emerald-300" />
          </div>

          <h4 className="text-base font-bold text-white font-orbitron">
            Dissolved & Set Free
          </h4>

          <p className="text-xs text-slate-300 italic max-w-xs leading-relaxed">
            "You have entrusted this burden to the cosmic void. It is no longer stored in your mind or body. Breathe in the light that takes its place."
          </p>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleReset}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Release Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
