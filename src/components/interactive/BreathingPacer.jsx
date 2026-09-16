import React, { useState, useEffect, useRef } from 'react';
import { CircleDot, Play, Pause, RotateCcw, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function BreathingPacer({
  onComplete,
  isCompleted,
  activeProfile,
}) {
  const audio = useAudio();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('ready'); // 'inhale' | 'hold' | 'exhale' | 'rest' | 'ready'
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
  const PHASE_DURATIONS = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 2,
  };

  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionSeconds(s => s + 1);
        setSecondsInPhase(prevSec => {
          const currentDuration = PHASE_DURATIONS[phase] || 4;
          if (prevSec + 1 >= currentDuration) {
            // Transition phase
            switch (phase) {
              case 'inhale':
                setPhase('hold');
                break;
              case 'hold':
                setPhase('exhale');
                if (soundEnabled) audio.playBreathTone(false);
                break;
              case 'exhale':
                setPhase('rest');
                break;
              case 'rest':
              default:
                setPhase('inhale');
                setCompletedCycles(c => {
                  const next = c + 1;
                  // If completed 5 cycles or more, offer completion
                  if (next >= 5 && !isCompleted) {
                    onComplete();
                  }
                  return next;
                });
                if (soundEnabled) audio.playBreathTone(true);
                break;
            }
            return 0;
          }
          return prevSec + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, soundEnabled, isCompleted, onComplete, audio]);

  const handleToggle = () => {
    audio.playClick();
    if (!isActive) {
      setPhase('inhale');
      setSecondsInPhase(0);
      setIsActive(true);
      if (soundEnabled) audio.playBreathTone(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    audio.playClick();
    setIsActive(false);
    setPhase('ready');
    setSecondsInPhase(0);
    setCompletedCycles(0);
    setSessionSeconds(0);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Inhale Deeply (Nose)';
      case 'hold':
        return 'Hold in Serenity';
      case 'exhale':
        return 'Exhale Slowly (Mouth)';
      case 'rest':
        return 'Rest in Stillness';
      default:
        return 'Ready to Breathe';
    }
  };

  const getScaleClass = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125 transition-transform duration-[4000ms] ease-out';
      case 'hold':
        return 'scale-125 transition-transform duration-500';
      case 'exhale':
        return 'scale-90 transition-transform duration-[4000ms] ease-in';
      case 'rest':
        return 'scale-90 transition-transform duration-500';
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Pulsing Breath Halo */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-cyan-950/40 to-slate-950 border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background ambient stars */}
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

        <div className="relative w-48 h-48 flex items-center justify-center my-3">
          {/* Outer glow aura */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-cyan-400/40 bg-cyan-500/10 ${getScaleClass()}`}
            style={{
              boxShadow: isActive ? '0 0 35px rgba(56, 189, 248, 0.4), inset 0 0 25px rgba(56, 189, 248, 0.2)' : 'none'
            }}
          />

          {/* Middle Ring */}
          <div
            className={`absolute w-36 h-36 rounded-full border border-purple-400/50 ${getScaleClass()}`}
          />

          {/* Core Circle */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
            <span className="text-xs font-mono text-cyan-300 font-bold tracking-wider mb-1">
              {getPhaseText()}
            </span>
            <span className="text-3xl font-mono font-extrabold text-white">
              {isActive ? ((PHASE_DURATIONS[phase] || 4) - secondsInPhase) : '4-4-4'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
              {completedCycles} Cycles
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-4 z-10">
          <button
            onClick={handleToggle}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan hover:opacity-95'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause Pacer' : 'Begin Bio-Rhythm'}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              soundEnabled ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title="Breath Sound Cues"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {completedCycles >= 5 && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Deep respiration completed! Nervous system harmonized.</span>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <strong className="text-cyan-300">Guided Cadence:</strong> Inhale for 4 seconds, gently suspend breath in stillness for 4 seconds, exhale smoothly through parted lips for 4 seconds. Repeat for 5 minutes together.
      </div>
    </div>
  );
}
