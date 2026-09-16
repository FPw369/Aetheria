import React, { useState } from 'react';
import { Flame, Check, RotateCcw, Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function AffirmationCounter({
  dayData,
  activeProfile,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const phrases = dayData.affirmationPhrases || [
    "My life is abundant, peaceful, and wonderful.",
    "I am deeply loved, safe, and growing every day.",
    "Together we bring out the highest light in one another."
  ];

  const [selectedPhrase, setSelectedPhrase] = useState(phrases[0]);
  const [customPhrase, setCustomPhrase] = useState('');
  const [count, setCount] = useState(isCompleted ? 3 : 0);
  const [lastTappedTime, setLastTappedTime] = useState(0);

  const activePhrase = customPhrase.trim().length > 0 ? customPhrase : selectedPhrase;

  const handleTap = () => {
    if (count >= 3) return;
    const next = count + 1;
    setCount(next);
    audio.playBell();
    setLastTappedTime(Date.now());

    if (next === 3 && !isCompleted) {
      onComplete();
    }
  };

  const handleReset = () => {
    setCount(0);
    audio.playClick();
  };

  return (
    <div className="space-y-5">
      {/* Phrase Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-purple-300 uppercase tracking-wider block">
          Select or Craft Your Resonance Affirmation
        </label>
        <div className="space-y-1.5">
          {phrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPhrase(phrase);
                setCustomPhrase('');
                audio.playClick();
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                selectedPhrase === phrase && !customPhrase
                  ? 'bg-purple-900/40 border-purple-400 text-purple-100 shadow-neon-purple'
                  : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              "{phrase}"
            </button>
          ))}
        </div>

        <div className="pt-1">
          <input
            type="text"
            placeholder="Or write your own custom affirmation..."
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Main Resonance Affirmation Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/60 to-slate-900/90 border border-purple-500/30 text-center relative overflow-hidden">
        <div className="absolute top-2 right-3 text-[10px] font-mono text-purple-400">
          FREQUENCY: RESONANCE
        </div>
        <Flame className="w-6 h-6 text-purple-400 mx-auto mb-2 animate-bounce" />
        <p className="text-sm font-semibold text-white italic px-2 mb-4 leading-relaxed">
          "{activePhrase}"
        </p>

        {/* 3 Rings Node Display */}
        <div className="flex items-center justify-center gap-4 my-3">
          {[1, 2, 3].map((num) => {
            const isFilled = count >= num;
            return (
              <div
                key={num}
                className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 ${
                  isFilled
                    ? 'bg-purple-600/30 border-purple-400 shadow-neon-purple text-purple-200 scale-105'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600 scale-95'
                }`}
              >
                {isFilled ? (
                  <Check className="w-5 h-5 text-purple-300" />
                ) : (
                  <span className="font-mono text-sm font-bold">{num}</span>
                )}
                <span className="text-[9px] font-mono uppercase tracking-widest mt-0.5">
                  {num === 1 ? '1st' : num === 2 ? '2nd' : '3rd'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Repeat Action Button */}
        <div className="mt-4 flex gap-2 justify-center">
          {count < 3 ? (
            <button
              onClick={handleTap}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-neon-purple active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Repeat Aloud & Tap ({count}/3)
            </button>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md">
                <Check className="w-4 h-4 text-emerald-400" /> 3 Resonances Completed!
              </div>
              <button
                onClick={handleReset}
                title="Reset repetitions"
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
