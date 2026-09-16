import React, { useState } from 'react';
import { 
  BookHeart, Sparkles, Heart, Search, Filter, 
  Download, Calendar, Award, Share2 
} from 'lucide-react';
import { useDuo } from '../../context/DuoContext';
import { CHALLENGE_DAYS } from '../../data/challengeData';

export function MemoryVaultView({ onOpenDayDetail }) {
  const { state, activeProfile, otherProfile } = useDuo();
  const [partnerFilter, setPartnerFilter] = useState('all'); // 'all' | 'partnerA' | 'partnerB'
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all days with reflections
  const daysWithEntries = CHALLENGE_DAYS.filter(dayData => {
    const dayEntry = state.entries[dayData.day];
    if (!dayEntry) return false;
    const hasA = dayEntry.partnerA && Object.keys(dayEntry.partnerA).length > 0;
    const hasB = dayEntry.partnerB && Object.keys(dayEntry.partnerB).length > 0;
    return hasA || hasB;
  });

  const filteredDays = daysWithEntries.filter(dayData => {
    const dayEntry = state.entries[dayData.day] || {};
    if (partnerFilter === 'partnerA' && !dayEntry.partnerA) return false;
    if (partnerFilter === 'partnerB' && !dayEntry.partnerB) return false;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const titleMatch = dayData.title.toLowerCase().includes(q);
      const promptMatch = dayData.fullPrompt.toLowerCase().includes(q);
      const entryTextMatch = JSON.stringify(dayEntry).toLowerCase().includes(q);
      return titleMatch || promptMatch || entryTextMatch;
    }

    return true;
  });

  const renderEntryContent = (entry, profile) => {
    if (!entry) return null;

    return (
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <span>{profile.avatar}</span>
          <span className="text-white">{profile.name}</span>
          {entry.updatedAt && (
            <span className="text-[10px] text-slate-500 font-mono ml-auto">
              {new Date(entry.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Multi-items (e.g. 3 Gratitudes, 2 Strengths) */}
        {Array.isArray(entry.items) && (
          <ul className="space-y-1 pl-1">
            {entry.items.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                <span className="text-cyan-400 font-mono text-[10px] mt-0.5">#{idx + 1}</span>
                <span className="italic">{item || '—'}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action note or general reflection */}
        {entry.note && (
          <p className="text-xs text-slate-200 italic whitespace-pre-wrap leading-relaxed">
            "{entry.note}"
          </p>
        )}

        {/* Focus timer reflection */}
        {entry.reflection && (
          <p className="text-xs text-slate-200 italic whitespace-pre-wrap leading-relaxed">
            "{entry.reflection}"
          </p>
        )}

        {/* Thought Reframe */}
        {entry.thoughtReframe && (
          <div className="space-y-1 text-xs">
            <p className="text-rose-400 text-[11px] line-through opacity-80">
              Shadow: {entry.thoughtReframe.negative}
            </p>
            <p className="text-cyan-300 font-medium">
              Reframe: {entry.thoughtReframe.positive}
            </p>
          </div>
        )}

        {/* Dance Track */}
        {entry.song && (
          <p className="text-xs text-pink-300">
            🎵 Jam: <strong className="text-white">{entry.song}</strong>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
            <BookHeart className="w-5 h-5 text-rose-400" />
            Duo Memory Vault
          </h2>
          <p className="text-xs text-slate-400">
            Shared archive of mutual reflections & mindful entries
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
          {daysWithEntries.length} Saved Days
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries, gratitude, or lessons..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPartnerFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              partnerFilter === 'all'
                ? 'bg-purple-600 text-white font-semibold shadow-neon-purple'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Both Reflections
          </button>
          <button
            onClick={() => setPartnerFilter('partnerA')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              partnerFilter === 'partnerA'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>{state.profiles.partnerA.avatar}</span>
            <span>{state.profiles.partnerA.name}</span>
          </button>
          <button
            onClick={() => setPartnerFilter('partnerB')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              partnerFilter === 'partnerB'
                ? 'bg-rose-500 text-white font-bold shadow-neon-pink'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>{state.profiles.partnerB.avatar}</span>
            <span>{state.profiles.partnerB.name}</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      {filteredDays.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3 my-6">
          <Sparkles className="w-8 h-8 text-cyan-400/50 mx-auto animate-pulse" />
          <h3 className="text-sm font-semibold text-white font-orbitron">
            Memory Vault Awaiting Entries
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            As you and your partner complete days and log your gratitudes, strengths, and thoughts, they will appear here as your shared couple scrapbook!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDays.map(dayData => {
            const dayEntry = state.entries[dayData.day] || {};
            const entryA = dayEntry.partnerA;
            const entryB = dayEntry.partnerB;

            return (
              <div
                key={dayData.day}
                className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                      DAY {dayData.day}
                    </span>
                    <h3 className="text-xs font-bold text-white">
                      {dayData.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onOpenDayDetail(dayData)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300"
                  >
                    Open Practice →
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  "{dayData.shortPrompt}"
                </p>

                {/* Grid for Partner A and Partner B reflections */}
                <div className="space-y-2">
                  {(partnerFilter === 'all' || partnerFilter === 'partnerA') && entryA && (
                    renderEntryContent(entryA, state.profiles.partnerA)
                  )}

                  {(partnerFilter === 'all' || partnerFilter === 'partnerB') && entryB && (
                    renderEntryContent(entryB, state.profiles.partnerB)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
