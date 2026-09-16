import React, { useState } from 'react';
import { 
  Sparkles, Grid, List, Check, Flame, 
  Calendar, Award, Heart, ChevronDown 
} from 'lucide-react';
import { useDuo } from '../../context/DuoContext';
import { CHALLENGE_DAYS, WEEKS_METADATA } from '../../data/challengeData';
import { DayCard } from '../DayCard';

export function JourneyView({ onOpenDayDetail }) {
  const { state, activeProfile, otherProfile, metrics } = useDuo();
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = all, 1, 2, 3, 4
  const [layoutMode, setLayoutMode] = useState('detailed'); // 'detailed' | 'matrix'

  const filteredDays = selectedWeek === 0
    ? CHALLENGE_DAYS
    : CHALLENGE_DAYS.filter(d => d.week === selectedWeek);

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold font-orbitron text-white">
            30-Day Journey Matrix
          </h2>
          <p className="text-xs text-slate-400">
            {metrics.duoCount} of 30 Duo Days Synchronized
          </p>
        </div>

        {/* Layout Mode Toggle */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setLayoutMode('detailed')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layoutMode === 'detailed' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode('matrix')}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layoutMode === 'matrix' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="30-day tile matrix"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedWeek(0)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all ${
            selectedWeek === 0
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-neon-cyan'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
          }`}
        >
          All 30 Days
        </button>

        {WEEKS_METADATA.map((w) => (
          <button
            key={w.week}
            onClick={() => setSelectedWeek(w.week)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
              selectedWeek === w.week
                ? 'bg-purple-600 text-white font-bold shadow-neon-purple'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            W{w.week}: {w.title}
          </button>
        ))}
      </div>

      {/* Visual Status Legend */}
      <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-neon-cyan" />
          <span>{state.profiles.partnerA.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-400 shadow-neon-pink" />
          <span>{state.profiles.partnerB.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-rose-400 ring-2 ring-amber-400/40" />
          <span className="text-amber-300 font-bold">Duo Sync ✨</span>
        </div>
      </div>

      {/* Layout Mode 1: 30-Day Matrix Tiles */}
      {layoutMode === 'matrix' ? (
        <div className="grid grid-cols-5 gap-2.5">
          {filteredDays.map((dayData) => {
            const num = dayData.day;
            const c = state.completions[num] || {};
            const doneA = !!c.partnerA;
            const doneB = !!c.partnerB;
            const duoDone = doneA && doneB;

            return (
              <button
                key={num}
                onClick={() => onOpenDayDetail(dayData)}
                className={`aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all duration-300 border relative overflow-hidden group ${
                  duoDone
                    ? 'bg-gradient-to-br from-cyan-950/80 via-purple-950/60 to-rose-950/80 border-cyan-400/60 shadow-neon-cyan scale-100 hover:scale-105'
                    : doneA || doneB
                      ? 'bg-slate-900 border-slate-700 hover:border-cyan-400/50'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Day number badge */}
                <span className={`text-[11px] font-mono font-bold ${
                  duoDone ? 'text-amber-300' : 'text-slate-300'
                }`}>
                  D{num}
                </span>

                {/* Micro center icon or spark */}
                <div className="my-auto">
                  {duoDone ? (
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                  ) : (
                    <span className="text-xs text-slate-500 group-hover:text-slate-300">
                      {dayData.day < 10 ? `0${dayData.day}` : dayData.day}
                    </span>
                  )}
                </div>

                {/* Bottom mini dual-indicator dots */}
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${doneA ? 'bg-cyan-400' : 'bg-slate-800'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${doneB ? 'bg-rose-400' : 'bg-slate-800'}`} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Layout Mode 2: Detailed Cards Grouped by Week */
        <div className="space-y-6">
          {WEEKS_METADATA
            .filter(w => selectedWeek === 0 || w.week === selectedWeek)
            .map(weekMeta => {
              const weekDays = CHALLENGE_DAYS.filter(d => d.week === weekMeta.week);
              const weekDuoDone = weekDays.filter(d => {
                const c = state.completions[d.day];
                return c?.partnerA && c?.partnerB;
              }).length;

              return (
                <div key={weekMeta.week} className="space-y-3">
                  {/* Week Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                          WEEK {weekMeta.week}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {weekMeta.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">
                        "{weekMeta.quote}"
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex-shrink-0">
                      {weekDuoDone}/{weekDays.length} Duo
                    </span>
                  </div>

                  {/* Day Cards for this Week */}
                  <div className="space-y-2.5">
                    {weekDays.map(dayData => (
                      <DayCard
                        key={dayData.day}
                        dayData={dayData}
                        onOpenDetail={onOpenDayDetail}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
