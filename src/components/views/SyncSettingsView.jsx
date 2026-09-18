import React, { useState } from 'react';
import { 
  Settings, UserCheck, QrCode, Copy, Check, 
  RotateCcw, Sparkles, Heart, ShieldAlert, 
  Wifi, Share2, Database, Radio, RefreshCw, ExternalLink,
  ChevronDown, ChevronUp, Link as LinkIcon
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

  const [copiedSyncLink, setCopiedSyncLink] = useState(false);
  const [copiedRoomLink, setCopiedRoomLink] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  
  const [firebaseUrl, setFirebaseUrl] = useState(() => {
    try { return localStorage.getItem('aetheria_firebase_url') || ''; } catch { return ''; }
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

  // Generate a merge link that carries all current completions and reflections safely
  const handleCopyDirectSyncLink = (targetRole = 'partnerB') => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin + window.location.pathname;
    const payload = {
      completions: state.completions,
      entries: state.entries,
      profiles: state.profiles,
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = `${origin}?room=${roomCode}&user=${targetRole}&sync=${b64}`;

    navigator.clipboard.writeText(link).then(() => {
      audio.playClick();
      setCopiedSyncLink(true);
      setTimeout(() => setCopiedSyncLink(false), 3500);
    });
  };

  const handleCopyCleanRoomLink = (targetRole = 'partnerB') => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin + window.location.pathname;
    const link = `${origin}?room=${roomCode}&user=${targetRole}`;

    navigator.clipboard.writeText(link).then(() => {
      audio.playClick();
      setCopiedRoomLink(true);
      setTimeout(() => setCopiedRoomLink(false), 3000);
    });
  };

  const handleSaveFirebaseUrl = () => {
    const cleaned = firebaseUrl.trim().replace(/\/+$/, '');
    cloudSync.setDatabaseUrl(cleaned);
    audio.playSuccess();
    setFirebaseSaved(true);
    setTimeout(() => setFirebaseSaved(false), 3000);
  };

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

  const qrPayload = JSON.stringify({
    room: roomCode,
    profiles: state.profiles,
    completions: state.completions,
    entries: state.entries,
  });

  const isCloudConnected = cloudStatus === 'connected';
  const partnerName = state.activeUser === 'partnerA' ? state.profiles.partnerB.name : state.profiles.partnerA.name;
  const partnerRole = state.activeUser === 'partnerA' ? 'partnerB' : 'partnerA';

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold font-orbitron text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Duo Profiles & Cross-Device Sync
        </h2>
        <p className="text-xs text-slate-400">
          Sync progress live across both phones, customize names, or backup entries
        </p>
      </div>

      {/* 0. Live Sync Status & Couple Room Code */}
      <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Couple Cloud Frequency
            </h3>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
            isCloudConnected
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
              : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCloudConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span>{isCloudConnected ? 'Live Cloud Synced' : 'Connecting...'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Both your phones tune into this private couple room code. Any day completed, note saved, or heart tap updates instantly across both devices.
        </p>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Couple Room Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
              placeholder="RICO-LAIK"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleUpdateRoom}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Update Room
            </button>
          </div>
        </div>
      </div>

      {/* 1. Instant 1-Click Sync Link Card (Zero setup, 100% works immediately) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-cyan-500/40 space-y-3.5 shadow-neon-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              Instant 1-Click Sync Link
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
            No Setup Needed
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Tap the button below and text the link to <strong className="text-white">{partnerName}</strong>. When she taps the link on her phone, all your completions and reflections merge instantly into her app:
        </p>

        <div className="pt-1 space-y-2">
          <button
            onClick={() => handleCopyDirectSyncLink(partnerRole)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-neon-cyan active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {copiedSyncLink ? '✓ Link Copied! Text to ' + partnerName : 'Send My Latest Progress to ' + partnerName}
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Safe & persistent: Opening this link will merge your data and will <strong>never</strong> wipe out her saved progress.
          </p>
        </div>
      </div>

      {/* 2. 24/7 Live Real-Time Cloud Database Sync (Firebase) */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
              24/7 Real-Time Cloud Database
            </h3>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${
            isCloudConnected
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCloudConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`} />
            <span>{isCloudConnected ? 'Live Cloud Connected' : 'Not Connected'}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Want both phones to update <strong>automatically in real time</strong> without sending links back and forth? Connect a 100% free Google Firebase Realtime Database:
        </p>

        <div className="space-y-2">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Firebase Realtime Database URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={firebaseUrl}
              onChange={(e) => setFirebaseUrl(e.target.value)}
              placeholder="https://your-app-default-rtdb.firebaseio.com"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleSaveFirebaseUrl}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold active:scale-95 transition-all"
            >
              Connect
            </button>
          </div>

          {firebaseSaved && (
            <p className="text-xs text-emerald-400 font-mono animate-fadeIn">
              ✓ Database URL saved! Live connection active.
            </p>
          )}
        </div>

        {/* 60-Second Setup Guide Accordion */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
            className="w-full text-left flex items-center justify-between text-xs text-purple-300 hover:text-purple-200 font-medium py-1"
          >
            <span className="flex items-center gap-1.5">
              <span>📖</span> How to get your free database in 60 seconds (Free forever)
            </span>
            {showFirebaseGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFirebaseGuide && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0">1</span>
                <div>
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-medium">console.firebase.google.com</a> on your computer or phone and click <strong>"Add project"</strong> (name it <code>aetheria</code>, no credit card required).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0">2</span>
                <div>
                  In the left menu, click <strong>Build &gt; Realtime Database</strong> &gt; click <strong>"Create Database"</strong> (click Next &gt; Enable).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0">3</span>
                <div>
                  Click the <strong>Rules</strong> tab at the top and change <code>false</code> to <code>true</code>:
                  <pre className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-mono mt-1">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
                  </pre>
                  Click <strong>Publish</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0">4</span>
                <div>
                  Copy the database URL shown at the top (e.g. <code>https://aetheria-xxx-default-rtdb.firebaseio.com</code>) and paste it into the box above!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Profile Customizer */}
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

      {/* 4. Camera QR Pairing & Backup */}
      <div className="p-4 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4 shadow-glass">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
            <QrCode className="w-4 h-4" /> Camera QR Pairing & Backup Code
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            In the same room? Scan each other's phone screen with camera to instantly merge progress.
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
            Import Partner's Backup Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste code here..."
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
              ✓ Merged successfully!
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
              Have your partner scan this code with their phone camera to instantly load all progress.
            </p>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-lg">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="L"
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
          Want to start completely fresh? This clears completions and reflections.
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
