import React, { useState, useEffect } from 'react';
import { Cpu, ArrowRight, Sparkles, Check, RefreshCw } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function ThoughtReframer({
  activeUserKey,
  activeProfile,
  savedEntry,
  onSave,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const existing = savedEntry?.[activeUserKey]?.thoughtReframe || {};

  const [negativeThought, setNegativeThought] = useState(existing.negative || '');
  const [positiveReframe, setPositiveReframe] = useState(existing.positive || '');
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [transmuted, setTransmuted] = useState(!!existing.transmuted || isCompleted);

  useEffect(() => {
    if (existing.negative) setNegativeThought(existing.negative);
    if (existing.positive) setPositiveReframe(existing.positive);
  }, [existing]);

  const handleTransmute = () => {
    if (!negativeThought.trim() || !positiveReframe.trim()) return;

    audio.playClick();
    setIsTransmuting(true);

    setTimeout(() => {
      audio.playSuccess();
      setIsTransmuting(false);
      setTransmuted(true);

      onSave({
        thoughtReframe: {
          negative: negativeThought,
          positive: positiveReframe,
          transmuted: true,
          timestamp: new Date().toISOString(),
        }
      });

      if (!isCompleted) {
        onComplete();
      }
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-400">
        Transform cognitive friction into calm clarity. First type the intrusive or critical thought, then write its wise reframe.
      </div>

      <div className="space-y-3">
        {/* Negative Thought Input */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/20">
          <label className="text-[11px] font-mono uppercase tracking-wider text-rose-400 block mb-1.5 flex items-center justify-between">
            <span>1. The Caught Shadow Thought</span>
            <span className="text-[10px] text-slate-500">Unfiltered</span>
          </label>
          <textarea
            rows={2}
            value={negativeThought}
            onChange={(e) => setNegativeThought(e.target.value)}
            placeholder="e.g., 'I messed up and I'm falling behind today...'"
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex justify-center -my-1">
          <div className={`p-2 rounded-full border transition-all ${
            isTransmuting ? 'bg-cyan-500/30 border-cyan-400 animate-spin text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}>
            <ArrowRight className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>

        {/* Positive Reframe Input */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 shadow-inner">
          <label className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 block mb-1.5 flex items-center justify-between">
            <span>2. The Mindful / Loving Reframe</span>
            <span className="text-[10px] text-cyan-500">Wisdom Lens</span>
          </label>
          <textarea
            rows={2}
            value={positiveReframe}
            onChange={(e) => setPositiveReframe(e.target.value)}
            placeholder="e.g., 'I am doing my best in this moment, and one bump doesn't define my journey.'"
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Transmute Button */}
      <button
        onClick={handleTransmute}
        disabled={!negativeThought.trim() || !positiveReframe.trim() || isTransmuting}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          isTransmuting
            ? 'bg-cyan-600 text-white animate-pulse'
            : (!negativeThought.trim() || !positiveReframe.trim())
              ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-neon-cyan active:scale-98'
        }`}
      >
        <Cpu className={`w-4 h-4 ${isTransmuting ? 'animate-spin' : ''}`} />
        {isTransmuting ? 'Transmuting Neural Pattern...' : transmuted ? 'Update & Anchor Reframe' : 'Alchemize & Complete Day'}
      </button>

      {transmuted && !isTransmuting && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>New cognitive anchor established in {activeProfile.name}'s mindfulness matrix.</span>
        </div>
      )}
    </div>
  );
}
