import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Sparkles, Volume2 } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function ZenTimer({
  defaultMinutes = 15,
  title = "Mindful Focus Timer",
  guidance = "Unplug from the digital chatter and sink into deep presence.",
  placeholder = "Write your reflection or observations...",
  activeUserKey,
  activeProfile,
  savedEntry,
  onSave,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const totalSeconds = defaultMinutes * 60;

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [reflection, setReflection] = useState(() => savedEntry?.[activeUserKey]?.reflection || '');
  const [isSaved, setIsSaved] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setHasFinished(true);
            audio.playSuccess();
            return 0;
          }
          // Ambient gentle chime at minute intervals
          if (prev % 300 === 0) {
            audio.playBell();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, audio]);

  const toggleTimer = () => {
    audio.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    audio.playClick();
    setIsRunning(false);
    setTimeLeft(totalSeconds);
    setHasFinished(false);
  };

  const handleSaveReflection = () => {
    onSave({ reflection, updatedAt: new Date().toISOString() });
    setIsSaved(true);
    if (!isCompleted) {
      onComplete();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / totalSeconds);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Ring Glow */}
        <div className="relative w-36 h-36 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              className="stroke-slate-800/80"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold tracking-wider text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              {isRunning ? 'In Progress' : hasFinished ? 'Complete' : `${defaultMinutes} Min Session`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={toggleTimer}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan hover:opacity-95'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : hasFinished ? 'Restart Session' : 'Begin Timer'}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {hasFinished && (
          <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" /> Mindful period complete. Savor this state!
          </div>
        )}
      </div>

      {/* Reflection Note Field */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-cyan-300 uppercase tracking-wider block">
          Reflections & Observations ({activeProfile.name})
        </label>
        <textarea
          rows={3}
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            setIsSaved(false);
          }}
          placeholder={placeholder}
          className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSaveReflection}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            {isCompleted ? 'Save Updates' : 'Save & Mark Day Complete'}
          </button>
          {isSaved && (
            <span className="text-[11px] text-emerald-400 text-center">
              ✓ Logged to your journey matrix.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
