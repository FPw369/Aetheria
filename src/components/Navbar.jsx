import React, { useState } from 'react';
import { Sparkles, Heart, Volume2, VolumeX, Flame, Zap, Smile } from 'lucide-react';
import { useDuo } from '../context/DuoContext';

export function Navbar() {
  const { 
    state, 
    roomCode,
    cloudStatus,
    activeProfile, 
    otherProfile, 
    switchActiveUser, 
    metrics, 
    audio, 
    sendNudge 
  } = useDuo();

  const [showNudgeMenu, setShowNudgeMenu] = useState(false);

  const handleSendNudge = (type, text) => {
    sendNudge(type, text);
    setShowNudgeMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#060813]/85 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-neon-cyan border border-cyan-300/30">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-purple-300 leading-none">
                AETHERIA
              </h1>
              {/* Cloud Sync Status Beacon */}
              <div 
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-tight border ${
                  cloudStatus === 'connected'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                    : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                }`}
                title={`Room Code: ${roomCode}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  cloudStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`} />
                <span>{cloudStatus === 'connected' ? 'Live Sync' : roomCode}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 tracking-tight">
              30-Day Duo Matrix
            </span>
          </div>
        </div>

        {/* Right Side: Duo Switcher & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Couple Switcher Pill */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-full border border-slate-700/80 shadow-inner">
            <button
              onClick={() => switchActiveUser('partnerA')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                state.activeUser === 'partnerA'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{state.profiles.partnerA.avatar}</span>
              <span className="text-[11px] hidden xs:inline">{state.profiles.partnerA.name}</span>
            </button>

            <button
              onClick={() => switchActiveUser('partnerB')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                state.activeUser === 'partnerB'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{state.profiles.partnerB.avatar}</span>
              <span className="text-[11px] hidden xs:inline">{state.profiles.partnerB.name}</span>
            </button>
          </div>

          {/* Quick Love Nudge Button */}
          <div className="relative">
            <button
              onClick={() => setShowNudgeMenu(!showNudgeMenu)}
              title="Send loving reaction"
              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
            >
              <Heart className="w-4 h-4 fill-rose-500/30 text-rose-400" />
            </button>

            {/* Quick Nudge Dropdown Menu */}
            {showNudgeMenu && (
              <div className="absolute right-0 mt-2 w-52 p-2 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl z-50 animate-fadeIn space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-rose-400 tracking-wider">
                  Nudge {otherProfile.name} ✨
                </div>
                <button
                  onClick={() => handleSendNudge('heart', `Sending you infinite love and warmth today! 💖`)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-500/20 text-slate-200 flex items-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Send Love Pulse
                </button>
                <button
                  onClick={() => handleSendNudge('sparkle', `You inspire me so much! Keep glowing! ✨`)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-cyan-500/20 text-slate-200 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Radiant Sparkle
                </button>
                <button
                  onClick={() => handleSendNudge('zen', `Take a gentle deep breath right now. 🌿`)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-500/20 text-slate-200 flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Calm Energy
                </button>
              </div>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={audio.toggleMute}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={audio.isMuted ? 'Unmute Zen Sounds' : 'Mute Sounds'}
          >
            {audio.isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
