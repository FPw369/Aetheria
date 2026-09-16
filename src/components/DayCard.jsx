import React from 'react';
import { 
  Check, Sparkles, Flame, Heart, Coffee, Footprints, 
  Award, Cpu, WifiOff, Mountain, Music, HeartHandshake, 
  Target, Gift, Sun, Wind, Palette, Apple, CheckCheck, 
  CircleDot, Trash2, BookOpen, Compass, Trees, Eye, Key, Star, Trophy 
} from 'lucide-react';
import { useDuo } from '../context/DuoContext';

const ICON_MAP = {
  Sparkles, Heart, Coffee, Footprints, Award, Flame, Cpu, 
  WifiOff, Mountain, Music, HeartHandshake, Target, Gift, 
  Sun, Wind, Palette, Apple, CheckCheck, CircleDot, Trash2, 
  BookOpen, Compass, Trees, Eye, Key, Star, Trophy,
};

export function DayCard({ dayData, onOpenDetail }) {
  const { state, activeProfile, otherProfile, toggleDayCompletion } = useDuo();

  const dayNumber = dayData.day;
  const dayCompletion = state.completions[dayNumber] || {};
  const isACompleted = !!dayCompletion.partnerA;
  const isBCompleted = !!dayCompletion.partnerB;
  const isDuoCompleted = isACompleted && isBCompleted;

  const isCurrentActiveDone = state.activeUser === 'partnerA' ? isACompleted : isBCompleted;
  const IconComponent = ICON_MAP[dayData.icon] || Sparkles;

  const handleQuickToggle = (e) => {
    e.stopPropagation();
    toggleDayCompletion(dayNumber, state.activeUser);
  };

  return (
    <div
      onClick={() => onOpenDetail(dayData)}
      className={`group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border ${
        isDuoCompleted
          ? 'bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-cyan-950/40 border-cyan-400/40 shadow-neon-cyan'
          : isCurrentActiveDone
            ? 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50'
            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
      }`}
    >
      {/* Top Banner: Day Number, Tag & Duo Synergy icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
            DAY {dayNumber < 10 ? `0${dayNumber}` : dayNumber}
          </span>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/60">
            W{dayData.week}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isDuoCompleted && (
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5 fill-amber-300" /> Duo Sync
            </span>
          )}

          {/* Quick Checkbox for Active User */}
          <button
            onClick={handleQuickToggle}
            title={`Check off for ${activeProfile.name}`}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
              isCurrentActiveDone
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-sm'
                : 'border-slate-600 hover:border-cyan-400 bg-slate-800/60 text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Title & Prompt */}
      <div className="flex items-start gap-3 my-2">
        <div className={`p-2 rounded-xl border flex-shrink-0 transition-colors ${
          isDuoCompleted
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
            : isCurrentActiveDone
              ? 'bg-slate-800 border-slate-700 text-cyan-400'
              : 'bg-slate-800/50 border-slate-800 text-slate-500 group-hover:text-slate-400'
        }`}>
          <IconComponent className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate leading-tight group-hover:text-cyan-200 transition-colors">
            {dayData.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {dayData.shortPrompt}
          </p>
        </div>
      </div>

      {/* Partner Progress Mini Indicator */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-3">
          {/* Partner A */}
          <div className="flex items-center gap-1">
            <span className="text-xs">{state.profiles.partnerA.avatar}</span>
            <span className="text-slate-400 text-[10px]">{state.profiles.partnerA.name}</span>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              isACompleted ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-600'
            }`}>
              {isACompleted ? '✓' : '•'}
            </div>
          </div>

          {/* Partner B */}
          <div className="flex items-center gap-1">
            <span className="text-xs">{state.profiles.partnerB.avatar}</span>
            <span className="text-slate-400 text-[10px]">{state.profiles.partnerB.name}</span>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              isBCompleted ? 'bg-rose-500 text-white font-bold' : 'bg-slate-800 text-slate-600'
            }`}>
              {isBCompleted ? '✓' : '•'}
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400/80 group-hover:text-cyan-300 flex items-center gap-0.5">
          Explore →
        </span>
      </div>
    </div>
  );
}
