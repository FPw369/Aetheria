// src/services/cloudSync.js
// Ultra-resilient, zero-config real-time synchronization for Rico & Laik
// Uses native browser fetch and EventSource (SSE) over standard HTTPS (port 443)
// 100% free, zero signup required, zero Node polyfills, works on all mobile networks.

class CloudSyncService {
  constructor() {
    this.roomCode = 'RICO-LAIK';
    this.userRole = 'partnerA';
    this.deviceId = this.getOrCreateDeviceId();
    this.customFirebaseUrl = this.getStoredFirebaseUrl();
    this.eventSource = null;
    this.pollInterval = null;
    this.visibilityHandler = null;
    this.onStateReceived = null;
    this.onNudgeReceived = null;
    this.onStatusChange = null;
    this.status = 'connecting'; // 'connected' | 'connecting' | 'disconnected'
    this.isBroadcasting = false;
    this.lastProcessedTimestamp = 0;
  }

  getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem('aetheria_device_id');
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('aetheria_device_id', id);
      }
      return id;
    } catch {
      return 'dev_' + Math.random().toString(36).substring(2, 11);
    }
  }

  getStoredFirebaseUrl() {
    try {
      const stored = localStorage.getItem('aetheria_firebase_url');
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch (e) {}
    return '';
  }

  setFirebaseUrl(rawUrl) {
    const cleaned = (rawUrl || '').trim().replace(/\/+$/, '');
    this.customFirebaseUrl = cleaned;
    try {
      if (cleaned) {
        localStorage.setItem('aetheria_firebase_url', cleaned);
      } else {
        localStorage.removeItem('aetheria_firebase_url');
      }
    } catch (e) {}

    this.reconnect();
  }

  init({ roomCode, userRole, onStateReceived, onNudgeReceived, onStatusChange }) {
    this.roomCode = (roomCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    this.userRole = userRole || 'partnerA';
    this.onStateReceived = onStateReceived;
    this.onNudgeReceived = onNudgeReceived;
    this.onStatusChange = onStatusChange;

    // Listen for tab focus / unlock on mobile
    if (typeof document !== 'undefined') {
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler);
      }
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          this.fetchLatestState();
        }
      };
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }

    this.reconnect();
  }

  updateRole(userRole) {
    this.userRole = userRole;
  }

  updateRoom(roomCode) {
    const cleaned = (roomCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    if (this.roomCode !== cleaned) {
      this.roomCode = cleaned;
      this.reconnect();
    }
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      if (this.onStatusChange) {
        this.onStatusChange(newStatus);
      }
    }
  }

  getNtfyTopic() {
    return `aetheria_duo_${this.roomCode}`;
  }

  reconnect() {
    this.cleanup();
    this.setStatus('connecting');

    // 1. Initial State Retrieval from ntfy.sh cache and optional Firebase
    this.fetchLatestState();

    // 2. Real-Time Stream via native browser EventSource (SSE)
    try {
      const streamUrl = `https://ntfy.sh/${this.getNtfyTopic()}/sse`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.setStatus('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'message' && parsed.message) {
            const innerPayload = JSON.parse(parsed.message);
            this.handleIncomingPayload(innerPayload);
          }
        } catch (e) {
          // Ignore non-json or system ping
        }
      };

      this.eventSource.onerror = (err) => {
        // SSE automatically reconnects in background
        if (this.status === 'connected') {
          this.setStatus('connecting');
        }
      };
    } catch (e) {
      console.warn('Failed creating SSE stream:', e);
    }

    // 3. Robust polling backup every 12 seconds
    this.pollInterval = setInterval(() => {
      if (typeof document === 'undefined' || document.visibilityState === 'visible') {
        this.fetchLatestState();
      }
    }, 12000);
  }

  async fetchLatestState() {
    if (this.isBroadcasting) return;

    // A. Fetch from ntfy.sh poll endpoint
    try {
      const ntfyPollUrl = `https://ntfy.sh/${this.getNtfyTopic()}/json?poll=1`;
      const res = await fetch(ntfyPollUrl);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const item = JSON.parse(line);
            if (item.event === 'message' && item.message) {
              const payload = JSON.parse(item.message);
              this.handleIncomingPayload(payload);
            }
          } catch (err) {
            // line parse error
          }
        }
        this.setStatus('connected');
      }
    } catch (e) {
      console.warn('ntfy poll error', e);
    }

    // B. Fetch from Custom Firebase if configured
    if (this.customFirebaseUrl) {
      try {
        const fbUrl = `${this.customFirebaseUrl}/rooms/${this.roomCode}/state.json`;
        const fbRes = await fetch(fbUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData && typeof fbData === 'object') {
            this.handleIncomingPayload({
              type: 'SYNC_STATE',
              state: fbData,
              deviceId: 'firebase_remote',
              timestamp: Date.now()
            });
            this.setStatus('connected');
          }
        }
      } catch (e) {
        console.warn('Firebase fetch error', e);
      }
    }
  }

  async broadcastState(state) {
    this.isBroadcasting = true;

    const payload = {
      type: 'SYNC_STATE',
      state: {
        completions: state.completions || {},
        entries: state.entries || {},
        profiles: state.profiles || {},
      },
      deviceId: this.deviceId,
      sender: this.userRole,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(payload);

    // 1. Broadcast to ntfy.sh zero-config relay
    try {
      const ntfyUrl = `https://ntfy.sh/${this.getNtfyTopic()}`;
      await fetch(ntfyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': `Aetheria Sync [${this.userRole}]`,
          'Tags': 'sparkles'
        },
        body: serialized
      });
      this.setStatus('connected');
    } catch (e) {
      console.warn('Broadcast to ntfy error:', e);
    }

    // 2. Broadcast to custom Firebase if configured
    if (this.customFirebaseUrl) {
      try {
        const fbUrl = `${this.customFirebaseUrl}/rooms/${this.roomCode}/state.json`;
        await fetch(fbUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.state)
        });
      } catch (e) {
        console.warn('Broadcast to Firebase error:', e);
      }
    }

    setTimeout(() => {
      this.isBroadcasting = false;
    }, 400);
  }

  async broadcastNudge(nudge) {
    const payload = {
      type: 'NUDGE',
      nudge,
      deviceId: this.deviceId,
      sender: this.userRole,
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(payload);

    try {
      const ntfyUrl = `https://ntfy.sh/${this.getNtfyTopic()}`;
      await fetch(ntfyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': nudge.type === 'heart' ? '💖 Heart Sent' : '✨ Sparkle Sent',
          'Priority': 'urgent',
          'Tags': nudge.type === 'heart' ? 'sparkling_heart' : 'star2'
        },
        body: serialized
      });
    } catch (e) {
      console.warn('Broadcast nudge error:', e);
    }

    if (this.customFirebaseUrl) {
      try {
        const fbUrl = `${this.customFirebaseUrl}/rooms/${this.roomCode}/lastNudge.json`;
        await fetch(fbUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Firebase nudge error:', e);
      }
    }
  }

  handleIncomingPayload(payload) {
    if (!payload || typeof payload !== 'object') return;
    // Discard echoes from this exact device
    if (payload.deviceId === this.deviceId) return;

    if (payload.type === 'SYNC_STATE' && payload.state) {
      if (this.onStateReceived) {
        this.onStateReceived(payload.state, payload.sender);
      }
    } else if (payload.type === 'NUDGE' && payload.nudge) {
      // Prevent duplicate nudge triggers if polling re-reads the same timestamp
      if (payload.timestamp && payload.timestamp <= this.lastProcessedTimestamp) {
        return;
      }
      this.lastProcessedTimestamp = payload.timestamp || Date.now();

      if (this.onNudgeReceived) {
        this.onNudgeReceived(payload.nudge);
      }
    }
  }

  cleanup() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  disconnect() {
    this.cleanup();
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    this.setStatus('disconnected');
  }
}

export const cloudSync = new CloudSyncService();
