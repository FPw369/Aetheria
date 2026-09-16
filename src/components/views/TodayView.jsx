import React from 'react';
import { 
  Sparkles, Check, ChevronRight, Heart, Flame, 
  Award, Shield, Calendar, ArrowRight, Zap 
} from 'lucide-react';
import { useDuo } from '../../context/DuoContext';
import { CHALLENGE_DAYS, WEEKS_METADATA } from '../../data/challengeData';

export function TodayView({ onOpenDayDetail, onNavigateTab }) {
  const { 
    state, 
    activeProfile, 
    otherProfile, 
    metrics, 
    toggleDayCompletion, 
    lastReceivedNudge, 
    dismissNudge 
  } = useDuo();

  // Find current active challenge day: earliest day not completed by both, or default to Day 1
  const activeDayNumber = (() => {
    for (let day = 1; day <= 30; day++) {
      const c = state.completions[day];
      if (!c?.partnerA || !c?.partnerB) {
        return day;
      }
    }
    return 30;
  })();

  const currentDayData = CHALLENGE_DAYS[activeDayNumber - 1] || CHALLENGE_DAYS[0];
  const currentWeekMeta = WEEKS_METADATA.find(w => w.week === currentDayData.week) || WEEKS_METADATA[0];

  const dayCompletion = state.completions[activeDayNumber] || {};
  const isACompleted = !!dayCompletion.partnerA;
  const isBCompleted = !!dayCompletion.partnerB;
  const isDuoCompleted = isACompleted && isBCompleted;
  const isCurrentActiveDone = state.activeUser === 'partnerA' ? isACompleted : isBCompleted;

  const nextDayData = activeDayNumber < 30 ? CHALLENGE_DAYS[activeDayNumber] : null;

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Nudge Notification Banner */}
      {lastReceivedNudge && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 border border-rose-500/40 shadow-neon-pink flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {lastReceivedNudge.from === 'partnerA' ? state.profiles.partnerA.avatar : state.profiles.partnerB.avatar}
            </span>
            <div>
              <p className="text-xs font-semibold text-rose-200">
                {lastReceivedNudge.from === 'partnerA' ? state.profiles.partnerA.name : state.profiles.partnerB.name} sent a pulse:
              </p>
              <p className="text-xs text-white italic">"{lastReceivedNudge.text}"</p>
            </div>
          </div>
          <button
            onClick={dismissNudge}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Duo Synergy Status Dashboard */}
      <div className="p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-glass">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
              Couple Synchrony Matrix
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {metrics.streak} Day Streak
          </span>
        </div>

        {/* Synergy Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Duo Completion</span>
            <span className="font-mono text-cyan-300 font-bold">{metrics.synergyPercent}% Sync ({metrics.duoCount}/30)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 rounded-full transition-all duration-700 shadow-neon-cyan"
              style={{ width: `${Math.max(metrics.synergyPercent, 4)}%` }}
            />
          </div>
        </div>

        {/* Partner Avatars and Check-ins */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
          {/* Partner A */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            state.activeUser === 'partnerA'
              ? 'bg-cyan-950/40 border-cyan-500/40 shadow-neon-cyan'
              : 'bg-slate-900/40 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{state.profiles.partnerA.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{state.profiles.partnerA.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{metrics.countA}/30 Completed</p>
              </div>
            </div>
            <div className="text-[11px] flex items-center gap-1 font-mono">
              <span className="text-slate-500">Today:</span>
              <span className={isACompleted ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isACompleted ? 'Done ✓' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Partner B */}
          <div className={`p-2.5 rounded-xl border transition-all ${
            state.activeUser === 'partnerB'
              ? 'bg-rose-950/40 border-rose-500/40 shadow-neon-pink'
              : 'bg-slate-900/40 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{state.profiles.partnerB.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{state.profiles.partnerB.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{metrics.countB}/30 Completed</p>
              </div>
            </div>
            <div className="text-[11px] flex items-center gap-1 font-mono">
              <span className="text-slate-500">Today:</span>
              <span className={isBCompleted ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                {isBCompleted ? 'Done ✓' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Week Theme & Quote Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 font-semibold">
            {currentWeekMeta.part} • Week {currentWeekMeta.week}: {currentWeekMeta.title}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{currentWeekMeta.daysRange}</span>
        </div>
        <p className="text-xs italic text-slate-300 border-l-2 border-purple-500 pl-2.5 py-0.5">
          "{currentWeekMeta.quote}"
        </p>
      </div>

      {/* Today's Hero Challenge Card */}
      <div className="relative rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-400/30 shadow-glass overflow-hidden group">
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-300 animate-spin-slow" />
              DAY {activeDayNumber < 10 ? `0${activeDayNumber}` : activeDayNumber} FOCUS
            </span>

            {isDuoCompleted ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 flex items-center gap-1">
                <Award className="w-3 h-3" /> Both Complete
              </span>
            ) : isCurrentActiveDone ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-1">
                <Check className="w-3 h-3" /> You're Done
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-mono">
                Needs attention
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold font-orbitron text-white mt-3 leading-snug">
            {currentDayData.title}
          </h2>

          <p className="text-sm text-slate-200 mt-2 leading-relaxed font-normal">
            {currentDayData.fullPrompt}
          </p>

          <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <span className="text-cyan-400 font-semibold">Guidance: </span>
            {currentDayData.guidance}
          </div>

          {/* Action Button: Launch Experience Modal */}
          <div className="mt-4 pt-2 flex items-center gap-3">
            <button
              onClick={() => onOpenDayDetail(currentDayData)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isCurrentActiveDone ? 'Open & Review Practice' : 'Open Interactive Experience'}
            </button>

            <button
              onClick={() => toggleDayCompletion(activeDayNumber, state.activeUser)}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                isCurrentActiveDone
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Quick Toggle Complete"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Up Next Preview */}
      {nextDayData && (
        <div 
          onClick={() => onOpenDayDetail(nextDayData)}
          className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                UP NEXT • DAY {nextDayData.day}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-400">
                {nextDayData.tag}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-200 transition-colors">
              {nextDayData.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {nextDayData.shortPrompt}
            </p>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 group-hover:text-cyan-300 group-hover:bg-slate-800 transition-colors flex-shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Quick Access to Full Journey Map */}
      <div className="text-center pt-2">
        <button
          onClick={() => onNavigateTab('journey')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1.5 transition-colors"
        >
          View Complete 30-Day Matrix Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
