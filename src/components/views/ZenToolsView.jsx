import React, { useState } from 'react';
import { 
  CircleDot, Trash2, Clock, Sparkles, Heart, 
  Flame, Wind, RefreshCw, Send, Zap 
} from 'lucide-react';
import { useDuo } from '../../context/DuoContext';
import { BreathingPacer } from '../interactive/BreathingPacer';
import { WorryDissolver } from '../interactive/WorryDissolver';
import { ZenTimer } from '../interactive/ZenTimer';

export function ZenToolsView() {
  const { state, activeProfile, otherProfile, sendNudge, audio } = useDuo();
  const [activeTool, setActiveTool] = useState('breathing'); // 'breathing' | 'worry' | 'timer' | 'beacon'
  const [customPulseText, setCustomPulseText] = useState('');
  const [pulseSent, setPulseSent] = useState(false);

  // Gratitude prompt inspiration cards
  const GRATITUDE_SPARKS = [
    "What is something your partner did recently that made your heart smile?",
    "Think of a song that always lifts your vibration.",
    "Name a comfort food or warm drink you felt so grateful for this week.",
    "What is a place in nature where you feel totally tranquil?",
    "A challenge in your life that turned out to be a blessing in disguise.",
    "A quality about your partner's mind or humor that you adore."
  ];

  const [currentSparkIdx, setCurrentSparkIdx] = useState(0);

  const handleNextSpark = () => {
    audio.playClick();
    setCurrentSparkIdx((prev) => (prev + 1) % GRATITUDE_SPARKS.length);
  };

  const handleSendCustomPulse = (type = 'heart') => {
    if (!customPulseText.trim()) return;
    sendNudge(type, customPulseText.trim());
    setCustomPulseText('');
    setPulseSent(true);
    setTimeout(() => setPulseSent(false), 3000);
  };

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
          <CircleDot className="w-5 h-5 text-cyan-400" />
          Zen Matrix Toolkit
        </h2>
        <p className="text-xs text-slate-400">
          On-demand mindfulness modules for calm, focus, and duo connection
        </p>
      </div>

      {/* Tool Selector Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            audio.playClick();
            setActiveTool('breathing');
          }}
          className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all text-center ${
            activeTool === 'breathing'
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-neon-cyan'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <CircleDot className="w-4 h-4" />
          <span className="text-[10px] font-mono font-medium">Breathing</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTool('worry');
          }}
          className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all text-center ${
            activeTool === 'worry'
              ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-neon-purple'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[10px] font-mono font-medium">Dissolver</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTool('timer');
          }}
          className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all text-center ${
            activeTool === 'timer'
              ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-sm'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] font-mono font-medium">Zen Timer</span>
        </button>

        <button
          onClick={() => {
            audio.playClick();
            setActiveTool('beacon');
          }}
          className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all text-center ${
            activeTool === 'beacon'
              ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-neon-pink'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-[10px] font-mono font-medium">Love Pulse</span>
        </button>
      </div>

      {/* Active Tool Content */}
      <div className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-glass">
        {activeTool === 'breathing' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-orbitron text-cyan-300">
              Bio-Rhythm Respiration
            </h3>
            <BreathingPacer
              onComplete={() => {}}
              isCompleted={false}
              activeProfile={activeProfile}
            />
          </div>
        )}

        {activeTool === 'worry' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-orbitron text-purple-300">
              Quantum Worry Shredder
            </h3>
            <WorryDissolver
              dissolverMode="worry"
              activeProfile={activeProfile}
              onComplete={() => {}}
              isCompleted={false}
            />
          </div>
        )}

        {activeTool === 'timer' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-orbitron text-blue-300">
              15-Minute Contemplation Timer
            </h3>
            <ZenTimer
              defaultMinutes={15}
              title="Zen Focus Session"
              guidance="Sink into peaceful presence."
              placeholder="Notes from this session..."
              activeUserKey={state.activeUser}
              activeProfile={activeProfile}
              savedEntry={{}}
              onSave={() => {}}
              onComplete={() => {}}
              isCompleted={false}
            />
          </div>
        )}

        {activeTool === 'beacon' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold font-orbitron text-rose-300">
                Transceiver: Send Pulse to {otherProfile.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send an instant loving vibration, cheer-up whisper, or gentle reminder.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={customPulseText}
                onChange={(e) => setCustomPulseText(e.target.value)}
                placeholder={`Type a sweet note for ${otherProfile.name}...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-rose-400"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleSendCustomPulse('heart')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-neon-pink active:scale-95 transition-all"
                >
                  <Heart className="w-3.5 h-3.5" /> Send Love Pulse
                </button>
                <button
                  onClick={() => handleSendCustomPulse('sparkle')}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-neon-cyan active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Send Sparkle
                </button>
              </div>

              {pulseSent && (
                <p className="text-center text-xs text-emerald-400 font-mono animate-fadeIn pt-1">
                  ✓ Pulse beamed successfully!
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Instant Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Thinking of your beautiful smile! ✨",
                  "Proud of everything you do 💖",
                  "Remember to breathe and relax 🌿",
                  "Can't wait to see you today! 💫"
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sendNudge('sparkle', preset);
                      setPulseSent(true);
                      setTimeout(() => setPulseSent(false), 3000);
                    }}
                    className="text-[11px] py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 active:scale-95 transition-all"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gratitude Spark Oracle */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Couple Contemplation Spark
          </span>
          <button
            onClick={handleNextSpark}
            className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Next Spark
          </button>
        </div>

        <p className="text-xs text-slate-200 italic font-medium leading-relaxed my-2">
          "{GRATITUDE_SPARKS[currentSparkIdx]}"
        </p>

        <p className="text-[10px] text-slate-500">
          Ask each other this question during dinner, a drive, or before sleep!
        </p>
      </div>
    </div>
  );
}
