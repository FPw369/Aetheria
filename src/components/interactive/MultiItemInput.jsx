import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Plus, Trash2 } from 'lucide-react';

export function MultiItemInput({
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
  const count = dayData.itemCount || 3;
  const defaultLabels = dayData.labels || Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
  const defaultPlaceholders = dayData.placeholders || Array.from({ length: count }, () => 'Type your reflection...');

  const [items, setItems] = useState(() => {
    const existing = savedEntry?.[activeUserKey]?.items;
    if (Array.isArray(existing) && existing.length === count) {
      return existing;
    }
    return Array.from({ length: count }, () => '');
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showPartnerItems, setShowPartnerItems] = useState(false);

  useEffect(() => {
    const existing = savedEntry?.[activeUserKey]?.items;
    if (Array.isArray(existing) && existing.length === count) {
      setItems(existing);
    }
  }, [savedEntry, activeUserKey, count]);

  const partnerItems = savedEntry?.[partnerUserKey]?.items;

  const handleChange = (index, value) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
    setIsSaved(false);
  };

  const handleSaveAndCheck = () => {
    onSave({ items, updatedAt: new Date().toISOString() });
    setIsSaved(true);
    if (!isCompleted) {
      onComplete();
    }
  };

  const filledCount = items.filter(i => i.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          {filledCount} of {count} Reflections Illuminated
        </span>
        <span className="text-slate-400">
          Viewing for: <span className="font-bold text-white">{activeProfile.name}</span>
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
              <span className="font-medium text-slate-300">{defaultLabels[idx] || `Item ${idx + 1}`}</span>
              {item.trim().length > 0 && (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <Check className="w-3 h-3" /> Captured
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={item}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder={defaultPlaceholders[idx] || 'Enter your thought...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save & Complete Action */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={handleSaveAndCheck}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-neon-cyan flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {isCompleted ? 'Update Reflection & Keep Complete' : 'Illuminate & Complete Practice'}
        </button>
        {isSaved && (
          <p className="text-center text-xs text-emerald-400 animate-fadeIn">
            ✓ Reflection securely anchored in your memory matrix.
          </p>
        )}
      </div>

      {/* Partner Shared Reflection Peeker */}
      {partnerItems && partnerItems.some(i => i && i.trim().length > 0) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowPartnerItems(!showPartnerItems)}
            className="w-full text-left flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-900/40 border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <span>{otherProfile.avatar}</span>
              <span>Peek {otherProfile.name}'s Reflections</span>
            </span>
            <span className="text-[11px] font-mono">{showPartnerItems ? 'Hide' : 'Reveal ✨'}</span>
          </button>

          {showPartnerItems && (
            <div className="mt-2 space-y-2 p-3 rounded-xl bg-slate-950/70 border border-rose-500/30 text-xs">
              <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{otherProfile.avatar}</span> {otherProfile.name}'s Words:
              </p>
              {partnerItems.map((pItem, pIdx) => (
                <div key={pIdx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 text-slate-200">
                  <span className="text-slate-400 font-mono text-[10px] block mb-0.5">#{pIdx + 1}</span>
                  <p className="italic text-slate-100">{pItem || '—'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
