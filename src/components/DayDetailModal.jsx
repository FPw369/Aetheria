import React from 'react';
import { 
  X, Check, Sparkles, Heart, Bell, Calendar, 
  ChevronRight, Award, Flame, Sun, CircleDot,
  Music, Trash2, BookOpen, Coffee, Footprints
} from 'lucide-react';
import { useDuo } from '../context/DuoContext';
import { MultiItemInput } from './interactive/MultiItemInput';
import { AffirmationCounter } from './interactive/AffirmationCounter';
import { ThoughtReframer } from './interactive/ThoughtReframer';
import { ZenTimer } from './interactive/ZenTimer';
import { BreathingPacer } from './interactive/BreathingPacer';
import { WorryDissolver } from './interactive/WorryDissolver';
import { DanceGroove } from './interactive/DanceGroove';
import { SmileCounter } from './interactive/SmileCounter';
import { ActionNoteInput } from './interactive/ActionNoteInput';

export function DayDetailModal({ dayData, onClose }) {
  const { 
    state, 
    activeProfile, 
    otherProfile, 
    partnerUser, 
    toggleDayCompletion, 
    saveDayEntry, 
    sendNudge 
  } = useDuo();

  if (!dayData) return null;

  const dayNumber = dayData.day;
  const dayCompletion = state.completions[dayNumber] || {};
  const isACompleted = !!dayCompletion.partnerA;
  const isBCompleted = !!dayCompletion.partnerB;
  const isDuoCompleted = isACompleted && isBCompleted;

  const isCurrentActiveUserCompleted = state.activeUser === 'partnerA' ? isACompleted : isBCompleted;
  const isPartnerCompleted = state.activeUser === 'partnerA' ? isBCompleted : isACompleted;

  const savedDayEntry = state.entries[dayNumber] || {};

  const handleToggleCurrent = () => {
    toggleDayCompletion(dayNumber, state.activeUser);
  };

  const handleSaveData = (data) => {
    saveDayEntry(dayNumber, state.activeUser, data);
  };

  const handleNudgePartner = () => {
    sendNudge('sparkle', `Sending you a boost for Day ${dayNumber}: "${dayData.title}"! ✨`);
  };

  const renderInteractiveWidget = () => {
    const commonProps = {
      dayData,
      activeUserKey: state.activeUser,
      partnerUserKey: partnerUser,
      activeProfile,
      otherProfile,
      savedEntry: savedDayEntry,
      onSave: handleSaveData,
      onComplete: handleToggleCurrent,
      isCompleted: isCurrentActiveUserCompleted,
    };

    switch (dayData.type) {
      case 'multi_input':
        return <MultiItemInput {...commonProps} />;
      case 'affirmation_counter':
        return <AffirmationCounter {...commonProps} />;
      case 'thought_reframer':
        return <ThoughtReframer {...commonProps} />;
      case 'zen_timer':
        return (
          <ZenTimer
            {...commonProps}
            defaultMinutes={dayData.timerMinutes || 15}
            title={dayData.title}
            guidance={dayData.guidance}
            placeholder={dayData.placeholder}
          />
        );
      case 'breathing_pacer':
        return <BreathingPacer {...commonProps} />;
      case 'worry_dissolver':
        return (
          <WorryDissolver
            {...commonProps}
            dissolverMode={dayData.dissolverMode || 'worry'}
          />
        );
      case 'dance_groove':
        return <DanceGroove {...commonProps} />;
      case 'smile_counter':
        return <SmileCounter {...commonProps} />;
      case 'action_note':
      case 'sensory_focus':
      case 'reflection':
      case 'detox_badge':
      case 'celebration':
      default:
        return <ActionNoteInput {...commonProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Header */}
        <div className="relative px-5 pt-5 pb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DAY {dayNumber < 10 ? `0${dayNumber}` : dayNumber} • WEEK {dayData.week}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {dayData.tag}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-bold font-orbitron text-white mt-2.5 leading-snug">
            {dayData.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {dayData.fullPrompt}
          </p>

          {/* Duo Progress Status Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Active User Chip */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-base">{activeProfile.avatar}</span>
                <span className="text-slate-300 font-medium">{activeProfile.name}:</span>
                <span className={`font-mono text-[11px] font-bold ${isCurrentActiveUserCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isCurrentActiveUserCompleted ? 'Completed ✓' : 'Incomplete'}
                </span>
              </div>

              {/* Partner User Chip */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-base">{otherProfile.avatar}</span>
                <span className="text-slate-300 font-medium">{otherProfile.name}:</span>
                <span className={`font-mono text-[11px] font-bold ${isPartnerCompleted ? 'text-rose-400' : 'text-slate-500'}`}>
                  {isPartnerCompleted ? 'Completed ✓' : 'Incomplete'}
                </span>
              </div>
            </div>

            {/* Quick Nudge Trigger if partner not completed */}
            {!isPartnerCompleted && (
              <button
                onClick={handleNudgePartner}
                className="text-[11px] py-1 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center gap-1 transition-all active:scale-95"
                title="Send loving reminder"
              >
                <Heart className="w-3 h-3 fill-rose-400/40" /> Nudge
              </button>
            )}
          </div>

          {/* Duo Synchrony Banner */}
          {isDuoCompleted && (
            <div className="mt-2.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-purple-950/60 to-rose-950/70 border border-cyan-400/30 text-center flex items-center justify-center gap-2 text-xs font-semibold text-cyan-200 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>Duo Synergy Achieved for Day {dayNumber}! ✨</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Guidance Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-200 font-semibold block mb-0.5">Mindful Guidance:</strong>
              {dayData.guidance}
            </div>
          </div>

          {/* Interactive Widget Area */}
          <div className="pt-1">
            {renderInteractiveWidget()}
          </div>
        </div>

        {/* Footer Quick Status Checkbox */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleToggleCurrent}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
              isCurrentActiveUserCompleted
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
              isCurrentActiveUserCompleted ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-500'
            }`}>
              {isCurrentActiveUserCompleted && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>{isCurrentActiveUserCompleted ? 'Mark Incomplete' : `Mark Done for ${activeProfile.name}`}</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-3 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
