import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAudio } from '../hooks/useAudio';

const STORAGE_KEY = 'aetheria_duo_mindfulness_v2';
const OLD_STORAGE_KEY = 'aetheria_duo_mindfulness_v1';

const DEFAULT_STATE = {
  profiles: {
    partnerA: {
      id: 'partnerA',
      name: 'Rico',
      nickname: 'Cosmic Explorer',
      avatar: '🪐',
      color: 'cyan', // cyan, purple, rose, emerald, amber
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
  const [state, setState] = useState(() => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const oldRaw = localStorage.getItem(OLD_STORAGE_KEY);
        if (oldRaw) {
          raw = oldRaw;
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw);
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
      }
    } catch (e) {
      console.warn('Failed reading state from localStorage', e);
    }
    return DEFAULT_STATE;
  });

  const [lastReceivedNudge, setLastReceivedNudge] = useState(null);
  const audio = useAudio();

  // Save to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [state]);

  const activeProfile = state.profiles[state.activeUser];
  const partnerUser = state.activeUser === 'partnerA' ? 'partnerB' : 'partnerA';
  const otherProfile = state.profiles[partnerUser];

  // Switch between Me and Girlfriend / Partner profiles
  const switchActiveUser = useCallback((userKey) => {
    audio.playClick();
    setState(prev => ({
      ...prev,
      activeUser: userKey
    }));
  }, [audio]);

  // Update profile details
  const updateProfile = useCallback((userKey, data) => {
    setState(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [userKey]: {
          ...prev.profiles[userKey],
          ...data
        }
      }
    }));
  }, []);

  // Save entry for a specific day
  const saveDayEntry = useCallback((day, userKey, data) => {
    setState(prev => {
      const prevDayEntries = prev.entries[day] || {};
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [day]: {
            ...prevDayEntries,
            [userKey]: data
          }
        }
      };
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
        // Play audio & trigger confetti
        if (isOtherDone) {
          // Duo complete! Special fanfare
          audio.playSuccess();
          try {
            confetti({
              particleCount: 80,
              spread: 100,
              origin: { y: 0.65 },
              colors: ['#00f2fe', '#f43f5e', '#a855f7', '#ffd700']
            });
          } catch (e) {
            console.warn(e);
          }
        } else {
          audio.playBell();
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: userKey === 'partnerA' ? ['#38bdf8', '#00f2fe', '#818cf8'] : ['#fb7185', '#f43f5e', '#f472b6']
            });
          } catch (e) {
            console.warn(e);
          }
        }
      } else {
        audio.playClick();
      }

      return {
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
    });
  }, [audio]);

  // Send a love nudge / micro-reaction
  const sendNudge = useCallback((type, message) => {
    audio.playNudge();
    const newNudge = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      from: state.activeUser,
      to: partnerUser,
      type, // 'heart', 'sparkle', 'zen', 'highfive'
      text: message || (type === 'heart' ? 'Sent you love and warm energy!' : 'Cheering you on for today!'),
      time: new Date().toISOString(),
    };

    setLastReceivedNudge(newNudge);

    setState(prev => ({
      ...prev,
      nudges: [newNudge, ...(prev.nudges || []).slice(0, 19)]
    }));

    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fb7185', '#38bdf8']
      });
    } catch (e) {
      console.warn(e);
    }
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

    // Calculate current streak
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

  // Export data as JSON / shareable payload
  const exportData = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  // Import data
  const importData = useCallback((incomingJson) => {
    try {
      const parsed = typeof incomingJson === 'string' ? JSON.parse(incomingJson) : incomingJson;
      if (!parsed || typeof parsed !== 'object') return false;

      setState(prev => ({
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
      }));
      audio.playSuccess();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, [audio]);

  // Reset progress
  const resetProgress = useCallback(() => {
    setState(prev => ({
      ...prev,
      completions: {},
      entries: {},
      nudges: [],
      currentDay: 1
    }));
    audio.playClick();
  }, [audio]);

  const value = {
    state,
    activeProfile,
    otherProfile,
    partnerUser,
    metrics,
    audio,
    lastReceivedNudge,
    dismissNudge,
    switchActiveUser,
    updateProfile,
    toggleDayCompletion,
    saveDayEntry,
    sendNudge,
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
