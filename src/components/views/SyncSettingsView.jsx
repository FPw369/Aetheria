import React, { useState } from 'react';
import { 
  Settings, UserCheck, QrCode, Copy, Check, 
  RotateCcw, Sparkles, Heart, ShieldAlert, 
  Wifi, Share2, Database, Radio, RefreshCw, ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useDuo } from '../../context/DuoContext';
import { cloudSync } from '../../services/cloudSync';

const EMOJI_OPTIONS = ['🪐', '✨', '🌸', '🚀', '🌿', '💎', '🌙', '⚡', '🕊️', '🧘', '🌊', '🔥'];

export function SyncSettingsView() {
  const { 
    state, 
    roomCode,
    cloudStatus,
    updateRoomCode,
    generateShareLink,
    updateProfile, 
    exportData, 
    importData, 
    resetProgress, 
    audio 
  } = useDuo();

  const [inputRoomCode, setInputRoomCode] = useState(roomCode);
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

  React.useEffect(() => {
    setInputRoomCode(roomCode);
  }, [roomCode]);

  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firebaseConfigText, setFirebaseConfigText] = useState(() => {
    try { return localStorage.getItem('aetheria_firebase_config') || ''; } catch { return ''; }
  });
  const [firebaseSaved, setFirebaseSaved] = useState(false);

  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUpdateRoom = () => {
    if (!inputRoomCode.trim()) return;
    updateRoomCode(inputRoomCode);
  };

  const handleCopyShareLink = () => {
    const link = generateShareLink('partnerB');
    navigator.clipboard.writeText(link).then(() => {
      audio.playClick();
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    });
  };

  const handleSaveProfiles = () => {
    updateProfile('partnerA', { name: partnerAName, avatar: partnerAAvatar });
    updateProfile('partnerB', { name: partnerBName, avatar: partnerBAvatar });
    audio.playBell();
    setSavedProfiles(true);
    setTimeout(() => setSavedProfiles(false), 2500);
  };

  const handleSaveFirebase = () => {
    try {
      if (!firebaseConfigText.trim()) {
        cloudSync.configureFirebase(null);
        setFirebaseSaved(true);
        setTimeout(() => setFirebaseSaved(false), 2500);
        return;
      }
      const parsed = JSON.parse(firebaseConfigText.trim());
      const ok = cloudSync.configureFirebase(parsed);
      if (ok) {
        audio.playSuccess();
        setFirebaseSaved(true);
        setTimeout(() => setFirebaseSaved(false), 2500);
      }
    } catch (e) {
      alert('Invalid JSON format for Firebase config.');
    }
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

  const qrPayload = JSON.stringify({
    room: roomCode,
    profiles: state.profiles,
    completions: state.completions,
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Duo Profiles & Real-Time Sync
        </h2>
        <p className="text-xs text-slate-400">
          Connect both phones live, customize names, or backup your journey
        </p>
      </div>

      {/* 1. Real-Time Cloud Room Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950/40 border border-cyan-500/40 space-y-4 shadow-neon-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Live Cloud Room Synchronization
            </h3>
          </div>

          {/* Connection Pill */}
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
            cloudStatus === 'connected'
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
              : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              cloudStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span>{cloudStatus === 'connected' ? 'Live Connected' : 'Connecting to Peer...'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Both phones connect live via Room Code <strong className="text-white font-mono">{roomCode}</strong>. Whenever either of you checks off a day or sends a reaction, the other phone updates in real time!
        </p>

        {/* Room Code Editor */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Shared Duo Room Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value)}
              placeholder="e.g. RICO-LAIK"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-cyan-300 tracking-wider focus:outline-none focus:border-cyan-400 uppercase"
            />
            <button
              onClick={handleUpdateRoom}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Set Room
            </button>
          </div>
        </div>

        {/* Magic Invite Link Button */}
        <div className="pt-1">
          <button
            onClick={handleCopyShareLink}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copiedShareLink ? 'Link Copied! Send via WhatsApp / iMessage' : 'Copy 1-Click Link for Girlfriend'}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-1.5">
            When she taps this link, her phone connects to <span className="text-cyan-300 font-mono">{roomCode}</span> and switches to <span className="text-rose-300">{state.profiles.partnerB.name}</span> automatically!
          </p>
        </div>

        {/* Persistent Cloud Database Accordion */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowFirebaseModal(!showFirebaseModal)}
            className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5 font-mono"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{showFirebaseModal ? 'Hide Cloud Database Settings' : 'Optional: Connect Free Firebase Database (24/7 Sync)'}</span>
          </button>

          {showFirebaseModal && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-purple-500/30 space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed">
                P2P sync connects both phones live whenever you are both using the app. If you also want <strong>background 24/7 cloud sync</strong> when both apps are closed, you can paste a free Google Firebase Realtime Database configuration below:
              </p>
              <textarea
                rows={4}
                value={firebaseConfigText}
                onChange={(e) => setFirebaseConfigText(e.target.value)}
                placeholder='Paste your Firebase config JSON here, e.g. {"apiKey": "...", "databaseURL": "https://...firebaseio.com"}'
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-purple-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveFirebase}
                  className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all"
                >
                  Save Firebase Config
                </button>
                {firebaseSaved && (
                  <span className="text-emerald-400 flex items-center gap-1 text-xs">
                    ✓ Saved!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Profile Customizer */}
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

      {/* 3. Offline Backup & QR Pairing */}
      <div className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-glass">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
            <QrCode className="w-4 h-4" /> Offline Backup & QR Pairing
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Want to backup all your journal entries or transfer without internet? Use QR or sync codes anytime.
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
            {copiedExport ? 'Copied to Clipboard!' : 'Copy Backup Code'}
          </button>
        </div>

        {/* Import Code Input */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <label className="text-[11px] font-mono text-slate-400 block">
            Import / Restore Backup Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste backup code here..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Restore
            </button>
          </div>

          {importSuccess && (
            <p className="text-xs text-emerald-400 font-mono">
              ✓ Restored successfully!
            </p>
          )}
          {importError && (
            <p className="text-xs text-rose-400 font-mono">
              ✕ Invalid code format.
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
              Scan with phone camera to load Room <span className="text-cyan-300 font-mono">{roomCode}</span>.
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
          Want to start fresh? This clears completions and reflections.
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
    </div>
  );
}
