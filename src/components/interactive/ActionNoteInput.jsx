import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Heart, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../../hooks/useAudio';

export function ActionNoteInput({
  dayData,
  activeUserKey,
  partnerUserKey,
  activeProfile,
  otherProfile,
  savedEntry,
  onSave,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const [note, setNote] = useState(() => savedEntry?.[activeUserKey]?.note || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showPartnerNote, setShowPartnerNote] = useState(false);

  useEffect(() => {
    const existing = savedEntry?.[activeUserKey]?.note;
    if (existing !== undefined) {
      setNote(existing);
    }
  }, [savedEntry, activeUserKey]);

  const partnerNote = savedEntry?.[partnerUserKey]?.note;
  const isDay30 = dayData.day === 30;

  const handleSave = () => {
    onSave({ note, updatedAt: new Date().toISOString() });
    setIsSaved(true);

    if (isDay30) {
      audio.playSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#00f2fe', '#f43f5e', '#ffd700', '#a855f7']
        });
      } catch (e) {
        console.warn(e);
      }
    }

    if (!isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {isDay30 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/40 text-center space-y-2">
          <Trophy className="w-8 h-8 text-amber-300 mx-auto animate-bounce" />
          <h4 className="text-sm font-bold font-orbitron text-amber-200">
            Final Milestone: Day 30 Ascension
          </h4>
          <p className="text-xs text-slate-300">
            You two have journeyed through 30 days of elevated presence, vulnerability, and love. Seal this milestone with your lasting habit commitment.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
          <span className="font-medium text-slate-300">
            {isDay30 ? 'Your Everlasting Habit Pledge' : 'Your Reflection / Action Log'}
          </span>
          <span className="text-cyan-300 font-mono text-[11px]">
            {activeProfile.name}
          </span>
        </div>
        <textarea
          rows={4}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setIsSaved(false);
          }}
          placeholder={dayData.placeholder || 'Type your reflection or notes...'}
          className="w-full p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 leading-relaxed shadow-inner"
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isCompleted ? 'Update Reflection' : isDay30 ? 'Seal 30-Day Journey!' : 'Save Reflection & Mark Complete'}
        </button>
        {isSaved && (
          <p className="text-center text-xs text-emerald-400">
            ✓ Reflection securely anchored.
          </p>
        )}
      </div>

      {/* Partner's Reflection Showcase */}
      {partnerNote && partnerNote.trim().length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowPartnerNote(!showPartnerNote)}
            className="w-full text-left flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-900/40 border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <span>{otherProfile.avatar}</span>
              <span>View {otherProfile.name}'s Reflection</span>
            </span>
            <span className="text-[11px] font-mono">{showPartnerNote ? 'Hide' : 'Read ✨'}</span>
          </button>

          {showPartnerNote && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs space-y-1">
              <p className="text-[10px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{otherProfile.avatar}</span> {otherProfile.name} wrote:
              </p>
              <p className="text-slate-100 italic leading-relaxed whitespace-pre-wrap pl-1">
                "{partnerNote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
