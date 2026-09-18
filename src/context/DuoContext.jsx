import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAudio } from '../hooks/useAudio';
import { cloudSync } from '../services/cloudSync';

const STORAGE_KEY = 'aetheria_duo_mindfulness_v2';
const OLD_STORAGE_KEY = 'aetheria_duo_mindfulness_v1';
const ROOM_STORAGE_KEY = 'aetheria_room_code';

const DEFAULT_STATE = {
  profiles: {
    partnerA: {
      id: 'partnerA',
      name: 'Rico',
      nickname: 'Cosmic Explorer',
      avatar: '🪐',
      color: 'cyan',
      accentColor: '#38bdf8',
    },
    partnerB: {
      id: 'partnerB',
      name: 'Laik',
      nickname: 'Starlight Muse',
      avatar: '✨',
      color: 'rose',
      accentColor: '#fb7185',
    }
  },
  activeUser: 'partnerA',
  currentDay: 1,
  completions: {}, // { [day]: { partnerA: true, partnerB: false, atA: '...', atB: '...' } }
  entries: {},     // { [day]: { partnerA: data, partnerB: data } }
  nudges: [],      // [{ id, from, type, text, time }]
  startDate: new Date().toISOString().split('T')[0],
};

const DuoContext = createContext(null);

export function DuoProvider({ children }) {
  // Read Room Code from URL query param (?room=...) or localStorage or default 'RICO-LAIK'
  const [roomCode, setRoomCodeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom && urlRoom.trim()) {
        const cleaned = urlRoom.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
        try { localStorage.setItem(ROOM_STORAGE_KEY, cleaned); } catch (e) {}
        return cleaned;
      }
      try {
        const stored = localStorage.getItem(ROOM_STORAGE_KEY);
        if (stored && stored.trim()) return stored.trim();
      } catch (e) {}
    }
    return 'RICO-LAIK';
  });

  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connected' | 'connecting' | 'disconnected'
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const [state, setState] = useState(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldRaw) {
          raw = oldRaw;
        }
      }

      let parsed = raw ? JSON.parse(raw) : { ...DEFAULT_STATE };

      // Check if state or user is in URL query (?room=...&user=...)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        let urlCleanNeeded = false;

        const urlUser = params.get('user');
        if (urlUser === 'partnerA' || urlUser === 'partnerB') {
          parsed.activeUser = urlUser;
          urlCleanNeeded = true;
        }

        const urlSync = params.get('sync');
        if (urlSync) {
          try {
            const decoded = JSON.parse(decodeURIComponent(escape(atob(urlSync))));
            if (decoded && typeof decoded === 'object') {
              // MERGE decoded state into existing storage instead of overwriting!
              parsed.completions = { ...(parsed.completions || {}), ...(decoded.completions || {}) };
              parsed.entries = { ...(parsed.entries || {}), ...(decoded.entries || {}) };
              if (decoded.profiles) {
                parsed.profiles = {
                  partnerA: { ...(parsed.profiles?.partnerA || {}), ...(decoded.profiles.partnerA || {}) },
                  partnerB: { ...(parsed.profiles?.partnerB || {}), ...(decoded.profiles.partnerB || {}) },
                };
              }
            }
          } catch (err) {
            console.warn('URL sync parse failed', err);
          }
          urlCleanNeeded = true;
        }

        // Clean the URL query so on refresh it never re-processes or overwrites with old sync!
        if (urlCleanNeeded) {
          try {
            const roomParam = params.get('room') ? `?room=${params.get('room')}` : '';
            const cleanUrl = window.location.pathname + roomParam;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e) {}
        }
      }

      const profileA = parsed.profiles?.partnerA || {};
      const profileB = parsed.profiles?.partnerB || {};
      if (!profileA.name || profileA.name === 'Alex') profileA.name = 'Rico';
      if (!profileB.name || profileB.name === 'Maya') profileB.name = 'Laik';

      return {
        ...DEFAULT_STATE,
        ...parsed,
        profiles: {
          partnerA: {
            ...DEFAULT_STATE.profiles.partnerA,
            ...profileA,
            name: profileA.name || 'Rico',
          },
          partnerB: {
            ...DEFAULT_STATE.profiles.partnerB,
            ...profileB,
            name: profileB.name || 'Laik',
          }
        }
      };
    } catch (e) {
      console.warn('Failed reading state from localStorage', e);
    }
    return DEFAULT_STATE;
  });

  const [lastReceivedNudge, setLastReceivedNudge] = useState(null);
  const audio = useAudio();
  const stateRef = useRef(state);
  stateRef.current = state;

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  // Set up Cloud Realtime Sync
  useEffect(() => {
    cloudSync.init({
      roomCode,
      userRole: stateRef.current.activeUser,
      onStatusChange: (newStatus) => {
        setCloudStatus(newStatus);
        if (newStatus === 'connected') {
          // Immediately broadcast current state on connection so partner receives it
          cloudSync.broadcastState(stateRef.current);
        }
      },
      onStateReceived: (remoteState) => {
        if (!remoteState || typeof remoteState !== 'object') return;
        setLastSyncTime(new Date());

        setState(prev => {
          // Merge completions
          const mergedCompletions = { ...(prev.completions || {}) };
          if (remoteState.completions) {
            Object.keys(remoteState.completions).forEach(day => {
              const localDay = mergedCompletions[day] || {};
              const remoteDay = remoteState.completions[day] || {};
              mergedCompletions[day] = {
                ...localDay,
                partnerA: localDay.partnerA || remoteDay.partnerA || false,
                partnerB: localDay.partnerB || remoteDay.partnerB || false,
                atA: localDay.atA || remoteDay.atA || null,
                atB: localDay.atB || remoteDay.atB || null,
              };
            });
          }

          // Merge entries
          const mergedEntries = { ...(prev.entries || {}) };
          if (remoteState.entries) {
            Object.keys(remoteState.entries).forEach(day => {
              const localDayEntries = mergedEntries[day] || {};
              const remoteDayEntries = remoteState.entries[day] || {};
              mergedEntries[day] = {
                ...localDayEntries,
                partnerA: remoteDayEntries.partnerA || localDayEntries.partnerA,
                partnerB: remoteDayEntries.partnerB || localDayEntries.partnerB,
              };
            });
          }

          // Merge profiles
          const mergedProfiles = {
            partnerA: {
              ...prev.profiles.partnerA,
              ...(remoteState.profiles?.partnerA || {})
            },
            partnerB: {
              ...prev.profiles.partnerB,
              ...(remoteState.profiles?.partnerB || {})
            }
          };

          return {
            ...prev,
            completions: mergedCompletions,
            entries: mergedEntries,
            profiles: mergedProfiles
          };
        });

        audio.playBell();
      },
      onNudgeReceived: (nudge) => {
        audio.playNudge();
        setLastReceivedNudge(nudge);
        setState(prev => ({
          ...prev,
          nudges: [nudge, ...(prev.nudges || []).slice(0, 19)]
        }));

        try {
          confetti({
            particleCount: 45,
            spread: 70,
            origin: { y: 0.75 },
            colors: ['#f43f5e', '#fb7185', '#38bdf8', '#ffd700']
          });
        } catch (e) {}
      }
    });

    return () => {
      cloudSync.disconnect();
    };
  }, [roomCode, audio]);

  const activeProfile = state.profiles[state.activeUser];
  const partnerUser = state.activeUser === 'partnerA' ? 'partnerB' : 'partnerA';
  const otherProfile = state.profiles[partnerUser];

  const updateRoomCode = useCallback((newCode) => {
    const cleaned = (newCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    try {
      localStorage.setItem(ROOM_STORAGE_KEY, cleaned);
    } catch (e) {}
    setRoomCodeState(cleaned);
    cloudSync.updateRoom(cleaned);
    audio.playClick();
  }, [audio]);

  // Switch between Me and Girlfriend / Partner profiles
  const switchActiveUser = useCallback((userKey) => {
    audio.playClick();
    setState(prev => {
      const next = { ...prev, activeUser: userKey };
      cloudSync.updateRole(userKey);
      return next;
    });
  }, [audio]);

  // Update profile details
  const updateProfile = useCallback((userKey, data) => {
    setState(prev => {
      const next = {
        ...prev,
        profiles: {
          ...prev.profiles,
          [userKey]: {
            ...prev.profiles[userKey],
            ...data
          }
        }
      };
      cloudSync.broadcastState(next);
      return next;
    });
  }, []);

  // Save entry for a specific day
  const saveDayEntry = useCallback((day, userKey, data) => {
    setState(prev => {
      const prevDayEntries = prev.entries[day] || {};
      const next = {
        ...prev,
        entries: {
          ...prev.entries,
          [day]: {
            ...prevDayEntries,
            [userKey]: data
          }
        }
      };
      cloudSync.broadcastState(next);
      return next;
    });
  }, []);

  // Toggle completion for a specific day and user
  const toggleDayCompletion = useCallback((day, userKey) => {
    setState(prev => {
      const dayCompletions = prev.completions[day] || {};
      const isCurrentlyDone = !!dayCompletions[userKey];
      const nextDone = !isCurrentlyDone;

      const otherUser = userKey === 'partnerA' ? 'partnerB' : 'partnerA';
      const isOtherDone = !!dayCompletions[otherUser];

      if (nextDone) {
        if (isOtherDone) {
          audio.playSuccess();
          try {
            confetti({
              particleCount: 80,
              spread: 100,
              origin: { y: 0.65 },
              colors: ['#00f2fe', '#f43f5e', '#a855f7', '#ffd700']
            });
          } catch (e) {}
        } else {
          audio.playBell();
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: userKey === 'partnerA' ? ['#38bdf8', '#00f2fe', '#818cf8'] : ['#fb7185', '#f43f5e', '#f472b6']
            });
          } catch (e) {}
        }
      } else {
        audio.playClick();
      }

      const next = {
        ...prev,
        completions: {
          ...prev.completions,
          [day]: {
            ...dayCompletions,
            [userKey]: nextDone,
            [userKey === 'partnerA' ? 'atA' : 'atB']: nextDone ? new Date().toISOString() : null
          }
        }
      };

      cloudSync.broadcastState(next);
      return next;
    });
  }, [audio]);

  // Send a love nudge / micro-reaction
  const sendNudge = useCallback((type, message) => {
    audio.playNudge();
    const newNudge = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      from: state.activeUser,
      to: partnerUser,
      type,
      text: message || (type === 'heart' ? 'Sent you love and warm energy!' : 'Cheering you on for today!'),
      time: new Date().toISOString(),
    };

    setLastReceivedNudge(newNudge);

    setState(prev => ({
      ...prev,
      nudges: [newNudge, ...(prev.nudges || []).slice(0, 19)]
    }));

    cloudSync.broadcastNudge(newNudge);

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fb7185', '#38bdf8']
      });
    } catch (e) {}
  }, [state.activeUser, partnerUser, audio]);

  // Clear nudge toast
  const dismissNudge = useCallback(() => {
    setLastReceivedNudge(null);
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    let countA = 0;
    let countB = 0;
    let duoCount = 0;

    for (let day = 1; day <= 30; day++) {
      const c = state.completions[day];
      if (c?.partnerA) countA++;
      if (c?.partnerB) countB++;
      if (c?.partnerA && c?.partnerB) duoCount++;
    }

    const synergyPercent = Math.round((duoCount / 30) * 100);

    let streak = 0;
    for (let day = 1; day <= 30; day++) {
      const c = state.completions[day];
      if (c?.partnerA || c?.partnerB) {
        streak++;
      } else {
        break;
      }
    }

    return {
      countA,
      countB,
      duoCount,
      synergyPercent,
      streak,
    };
  }, [state.completions]);

  // Clean, permanent share link without bulky sync snapshot
  const generateShareLink = useCallback((targetRole = 'partnerB') => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?room=${roomCode}&user=${targetRole}`;
  }, [roomCode]);

  // Export data as JSON / shareable payload
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  // Import data
  const importData = useCallback((incomingJson) => {
    try {
      const parsed = typeof incomingJson === 'string' ? JSON.parse(incomingJson) : incomingJson;
      if (!parsed || typeof parsed !== 'object') return false;

      setState(prev => {
        const next = {
          ...prev,
          ...parsed,
          profiles: {
            ...prev.profiles,
            ...(parsed.profiles || {})
          },
          completions: {
            ...prev.completions,
            ...(parsed.completions || {})
          },
          entries: {
            ...prev.entries,
            ...(parsed.entries || {})
          }
        };
        cloudSync.broadcastState(next);
        return next;
      });
      audio.playSuccess();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, [audio]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setState(prev => {
      const next = {
        ...prev,
        completions: {},
        entries: {},
        nudges: [],
        currentDay: 1
      };
      cloudSync.broadcastState(next);
      return next;
    });
    audio.playClick();
  }, [audio]);

  const value = {
    state,
    roomCode,
    cloudStatus,
    lastSyncTime,
    activeProfile,
    otherProfile,
    partnerUser,
    metrics,
    audio,
    lastReceivedNudge,
    dismissNudge,
    updateRoomCode,
    switchActiveUser,
    updateProfile,
    toggleDayCompletion,
    saveDayEntry,
    sendNudge,
    generateShareLink,
    exportData,
    importData,
    resetProgress,
  };

  return (
    <DuoContext.Provider value={value}>
      {children}
    </DuoContext.Provider>
  );
}

export function useDuo() {
  const context = useContext(DuoContext);
  if (!context) {
    throw new Error('useDuo must be used within a DuoProvider');
  }
  return context;
}
