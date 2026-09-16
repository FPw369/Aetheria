import React, { useState } from 'react';
import { 
  Settings, UserCheck, QrCode, Copy, Check, 
  Download, Upload, RotateCcw, Sparkles, Heart, ShieldAlert 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useDuo } from '../../context/DuoContext';

const EMOJI_OPTIONS = ['🪐', '✨', '🌸', '🚀', '🌿', '💎', '🌙', '⚡', '🕊️', '🧘', '🌊', '🔥'];

export function SyncSettingsView() {
  const { 
    state, 
    updateProfile, 
    exportData, 
    importData, 
    resetProgress, 
    audio 
  } = useDuo();

  const [partnerAName, setPartnerAName] = useState(state.profiles.partnerA.name);
  const [partnerBName, setPartnerBName] = useState(state.profiles.partnerB.name);
  const [partnerAAvatar, setPartnerAAvatar] = useState(state.profiles.partnerA.avatar);
  const [partnerBAvatar, setPartnerBAvatar] = useState(state.profiles.partnerB.avatar);
  const [savedProfiles, setSavedProfiles] = useState(false);

  React.useEffect(() => {
    setPartnerAName(state.profiles.partnerA.name);
    setPartnerBName(state.profiles.partnerB.name);
    setPartnerAAvatar(state.profiles.partnerA.avatar);
    setPartnerBAvatar(state.profiles.partnerB.avatar);
  }, [state.profiles]);

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfiles = () => {
    updateProfile('partnerA', { name: partnerAName, avatar: partnerAAvatar });
    updateProfile('partnerB', { name: partnerBName, avatar: partnerBAvatar });
    audio.playBell();
    setSavedProfiles(true);
    setTimeout(() => setSavedProfiles(false), 2500);
  };

  const handleCopyExport = () => {
    const dataStr = exportData();
    navigator.clipboard.writeText(dataStr).then(() => {
      audio.playClick();
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2500);
    });
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importData(importJsonText.trim());
    if (success) {
      setImportSuccess(true);
      setImportError(false);
      setImportJsonText('');
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError(true);
      setTimeout(() => setImportError(false), 3000);
    }
  };

  const handleConfirmReset = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  // Compact payload for QR code
  const qrPayload = JSON.stringify({
    profiles: state.profiles,
    completions: state.completions,
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Duo Profiles & Synchronization
        </h2>
        <p className="text-xs text-slate-400">
          Personalize names, transfer progress between phones, or backup your journey
        </p>
      </div>

      {/* Profile Customizer */}
      <div className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-glass">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5">
          <UserCheck className="w-4 h-4" /> Partner Profiles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Partner A */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 font-mono">Partner 1 (You)</span>
              <span className="text-xl">{partnerAAvatar}</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                value={partnerAName}
                onChange={(e) => setPartnerAName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Avatar Icon</label>
              <div className="flex flex-wrap gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setPartnerAAvatar(emoji)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      partnerAAvatar === emoji ? 'bg-cyan-500/30 border border-cyan-400 scale-110' : 'bg-slate-800/60 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partner B */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300 font-mono">Partner 2 (Girlfriend)</span>
              <span className="text-xl">{partnerBAvatar}</span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                value={partnerBName}
                onChange={(e) => setPartnerBName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Avatar Icon</label>
              <div className="flex flex-wrap gap-1">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setPartnerBAvatar(emoji)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      partnerBAvatar === emoji ? 'bg-rose-500/30 border border-rose-400 scale-110' : 'bg-slate-800/60 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveProfiles}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {savedProfiles ? 'Profiles Saved!' : 'Save Profile Changes'}
        </button>
      </div>

      {/* Sync Between Phones & Sharing */}
      <div className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-glass">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
            <QrCode className="w-4 h-4" /> Two-Phone Synchronization
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Using different phones? You can display a pairing QR code or copy-paste your sync code to share progress effortlessly!
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            Show Pairing QR
          </button>

          <button
            onClick={handleCopyExport}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Copy className="w-4 h-4 text-purple-400" />
            {copiedExport ? 'Copied to Clipboard!' : 'Copy Sync Code'}
          </button>
        </div>

        {/* Import Code Input */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-mono text-slate-400 block">
            Import / Restore Partner's Sync Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste sync code here..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Sync
            </button>
          </div>

          {importSuccess && (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ Synchronized successfully!
            </p>
          )}
          {importError && (
            <p className="text-xs text-rose-400 font-mono">
              ✕ Invalid code format. Please check and try again.
            </p>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 max-w-xs w-full text-center space-y-4">
            <h4 className="text-sm font-bold font-orbitron text-white">
              Instant Duo Sync QR
            </h4>
            <p className="text-xs text-slate-400">
              Have your partner scan this code with their phone camera to load your journey status.
            </p>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-lg">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="M"
              />
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone: Reset Progress */}
      <div className="p-4 rounded-3xl bg-slate-950/50 border border-red-900/30 space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" /> Journey Reset
        </h4>
        <p className="text-xs text-slate-400">
          Want to start the 30-day challenge completely fresh? This clears completions and reflections.
        </p>

        {showResetConfirm ? (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 space-y-2">
            <p className="text-xs text-red-200 font-bold">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmReset}
                className="py-1.5 px-3 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-red-400 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Challenge Progress
          </button>
        )}
      </div>

      {/* PDF Challenge Attribution / About */}
      <div className="text-center text-slate-500 text-[11px] font-mono space-y-1 pt-2">
        <p>Mindfulness & Reflection Challenge • 30-Day Guided Practice</p>
        <p className="italic text-slate-400">"Small daily habits create gentle, lifelong transformations."</p>
      </div>
    </div>
  );
}
