import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Square, Check, Sparkles, Flame } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';

export function DanceGroove({
  activeProfile,
  savedEntry,
  activeUserKey,
  onSave,
  onComplete,
  isCompleted,
}) {
  const audio = useAudio();
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [songName, setSongName] = useState(() => savedEntry?.[activeUserKey]?.song || '');
  const [reflection, setReflection] = useState(() => savedEntry?.[activeUserKey]?.reflection || '');
  const [danceVibe, setDanceVibe] = useState('Groovy');
  const [isSaved, setIsSaved] = useState(false);

  const audioCtxRef = useRef(null);
  const beatIntervalRef = useRef(null);

  // Play a chill upbeat electronic rhythm loop using Web Audio API
  const toggleBeat = () => {
    if (isPlayingBeat) {
      clearInterval(beatIntervalRef.current);
      setIsPlayingBeat(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      setIsPlayingBeat(true);
      let step = 0;

      beatIntervalRef.current = setInterval(() => {
        const time = ctx.currentTime;

        // Kick drum on beats 0 & 2
        if (step % 2 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.25);
          gain.gain.setValueAtTime(0.3, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(time);
          osc.stop(time + 0.25);
        }

        // Hi-hat sound on every step
        const hihat = ctx.createOscillator();
        const hGain = ctx.createGain();
        hihat.type = 'square';
        hihat.frequency.setValueAtTime(step % 4 === 1 ? 800 : 1200, time);
        hGain.gain.setValueAtTime(0.04, time);
        hGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
        hihat.connect(hGain);
        hGain.connect(ctx.destination);
        hihat.start(time);
        hihat.stop(time + 0.05);

        // Synth melodic pulse on beat 2
        if (step % 4 === 2) {
          const synth = ctx.createOscillator();
          const sGain = ctx.createGain();
          synth.type = 'triangle';
          synth.frequency.setValueAtTime(440, time);
          sGain.gain.setValueAtTime(0.08, time);
          sGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
          synth.connect(sGain);
          sGain.connect(ctx.destination);
          synth.start(time);
          synth.stop(time + 0.3);
        }

        step = (step + 1) % 8;
      }, 250); // 120 BPM
    } catch (e) {
      console.warn(e);
      setIsPlayingBeat(false);
    }
  };

  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    };
  }, []);

  const handleSave = () => {
    onSave({ song: songName, reflection, vibe: danceVibe, updatedAt: new Date().toISOString() });
    setIsSaved(true);
    if (!isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Interactive Cyber Lo-Fi Beat Player */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/70 via-pink-950/60 to-slate-900 border border-pink-500/30 text-center relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-pink-400 animate-spin" /> Cyber-Groove Synth (120 BPM)
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Audio Synth</span>
        </div>

        <button
          onClick={toggleBeat}
          className={`py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-all ${
            isPlayingBeat
              ? 'bg-pink-500 text-white shadow-neon-pink animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/40'
          }`}
        >
          {isPlayingBeat ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isPlayingBeat ? 'Pause Beat Loop' : 'Play Synth Dance Beat'}
        </button>

        {isPlayingBeat && (
          <div className="flex justify-center items-center gap-1 mt-3">
            {[40, 75, 55, 90, 60, 80, 45, 85].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-pink-400 rounded-full animate-pulse"
                style={{ height: `${h * 0.25}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Song / Movement Details */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-mono text-pink-300 uppercase tracking-wider block mb-1">
            Uplifting Track or Jam Chosen
          </label>
          <input
            type="text"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            placeholder="e.g. Earth, Wind & Fire - September, or Dua Lipa..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-pink-400"
          />
        </div>

        <div>
          <label className="text-xs font-mono text-pink-300 uppercase tracking-wider block mb-1">
            How Did Your Energy Shift? ({activeProfile.name})
          </label>
          <textarea
            rows={2}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Felt my shoulders release tension, laughed dancing in the kitchen..."
            className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-pink-400"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-neon-pink active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {isCompleted ? 'Update Dance Log' : 'Save & Complete Dance Practice'}
        </button>

        {isSaved && (
          <p className="text-center text-xs text-emerald-400">
            ✓ Joy and kinetic rhythm captured!
          </p>
        )}
      </div>
    </div>
  );
}
