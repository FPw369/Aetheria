import Peer from 'peerjs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

class CloudSyncService {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.roomCode = 'RICO-LAIK';
    this.userRole = 'partnerA'; // 'partnerA' or 'partnerB'
    this.onStateReceived = null;
    this.onNudgeReceived = null;
    this.onStatusChange = null;
    this.status = 'disconnected'; // 'connected' | 'connecting' | 'disconnected'
    this.firebaseApp = null;
    this.firebaseDb = null;
    this.firebaseUnsubscribe = null;
    this.isBroadcasting = false;
  }

  // Initialize service
  init({ roomCode, userRole, onStateReceived, onNudgeReceived, onStatusChange }) {
    this.roomCode = (roomCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    this.userRole = userRole || 'partnerA';
    this.onStateReceived = onStateReceived;
    this.onNudgeReceived = onNudgeReceived;
    this.onStatusChange = onStatusChange;

    this.initPeer();
    this.initFirebaseIfConfigured();
  }

  updateRole(userRole) {
    if (this.userRole !== userRole) {
      this.userRole = userRole;
      this.reconnect();
    }
  }

  updateRoom(roomCode) {
    const cleaned = (roomCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    if (this.roomCode !== cleaned) {
      this.roomCode = cleaned;
      this.reconnect();
    }
  }

  setStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  /* ------------------- WebRTC / PeerJS P2P ------------------- */
  initPeer() {
    this.cleanupPeer();

    const myPeerId = `aetheria-${this.roomCode.toLowerCase()}-${this.userRole}`;
    const targetPeerId = `aetheria-${this.roomCode.toLowerCase()}-${this.userRole === 'partnerA' ? 'partnerB' : 'partnerA'}`;

    this.setStatus('connecting');

    try {
      this.peer = new Peer(myPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        // Now try connecting to partner
        this.connectToPartner(targetPeerId);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // If ID already taken (e.g. reload), append random suffix
          const fallbackId = `${myPeerId}-${Math.floor(Math.random() * 1000)}`;
          this.peer = new Peer(fallbackId);
        } else {
          console.warn('PeerJS Notice:', err.type);
        }
      });
    } catch (e) {
      console.warn('PeerJS init failed:', e);
    }
  }

  connectToPartner(targetPeerId) {
    if (!this.peer || this.peer.destroyed) return;

    try {
      const conn = this.peer.connect(targetPeerId, {
        reliable: true
      });

      conn.on('open', () => {
        this.setupConnection(conn);
      });

      conn.on('error', (e) => {
        console.warn('Peer connection error', e);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  setupConnection(conn) {
    this.conn = conn;
    this.setStatus('connected');

    conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    conn.on('close', () => {
      this.conn = null;
      this.setStatus('disconnected');
      // Retry connecting after 5 seconds
      setTimeout(() => {
        const targetPeerId = `aetheria-${this.roomCode.toLowerCase()}-${this.userRole === 'partnerA' ? 'partnerB' : 'partnerA'}`;
        this.connectToPartner(targetPeerId);
      }, 5000);
    });
  }

  cleanupPeer() {
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
  }

  /* ------------------- Firebase Realtime Sync ------------------- */
  initFirebaseIfConfigured() {
    try {
      const rawConfig = localStorage.getItem('aetheria_firebase_config');
      if (!rawConfig) return;

      const config = JSON.parse(rawConfig);
      if (!config || !config.apiKey || !config.databaseURL) return;

      if (!getApps().length) {
        this.firebaseApp = initializeApp(config);
      } else {
        this.firebaseApp = getApp();
      }

      this.firebaseDb = getDatabase(this.firebaseApp);
      this.subscribeFirebase();
    } catch (e) {
      console.warn('Firebase init error:', e);
    }
  }

  subscribeFirebase() {
    if (!this.firebaseDb) return;
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }

    const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
    onValue(roomRef, (snapshot) => {
      if (this.isBroadcasting) return;
      const val = snapshot.val();
      if (val && val.state) {
        this.handleIncomingData({
          type: 'SYNC_STATE',
          state: val.state,
          sender: val.sender,
          timestamp: val.timestamp
        });
      }
    });

    this.setStatus('connected');
  }

  configureFirebase(config) {
    try {
      if (config) {
        localStorage.setItem('aetheria_firebase_config', JSON.stringify(config));
        this.initFirebaseIfConfigured();
        return true;
      } else {
        localStorage.removeItem('aetheria_firebase_config');
        if (this.firebaseDb) {
          const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
          off(roomRef);
        }
        this.firebaseApp = null;
        this.firebaseDb = null;
        return true;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  /* ------------------- Broadcasting & Handlers ------------------- */
  broadcastState(state) {
    const payload = {
      type: 'SYNC_STATE',
      state: {
        completions: state.completions,
        entries: state.entries,
        profiles: state.profiles,
      },
      sender: this.userRole,
      timestamp: Date.now(),
    };

    // 1. Send via WebRTC P2P if connected
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.warn('P2P send failed', e);
      }
    }

    // 2. Send to Firebase if configured
    if (this.firebaseDb) {
      this.isBroadcasting = true;
      const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
      set(roomRef, payload)
        .catch(err => console.warn('Firebase set error', err))
        .finally(() => {
          setTimeout(() => { this.isBroadcasting = false; }, 300);
        });
    }
  }

  broadcastNudge(nudge) {
    const payload = {
      type: 'NUDGE',
      nudge,
      sender: this.userRole,
      timestamp: Date.now(),
    };

    if (this.conn && this.conn.open) {
      try {
        this.conn.send(payload);
      } catch (e) {
        console.warn('P2P nudge failed', e);
      }
    }

    if (this.firebaseDb) {
      const roomNudgeRef = ref(this.firebaseDb, `rooms/${this.roomCode}/lastNudge`);
      set(roomNudgeRef, payload).catch(err => console.warn(err));
    }
  }

  handleIncomingData(data) {
    if (!data || typeof data !== 'object') return;
    if (data.sender === this.userRole) return; // ignore own broadcast

    if (data.type === 'SYNC_STATE' && data.state) {
      if (this.onStateReceived) {
        this.onStateReceived(data.state);
      }
    } else if (data.type === 'NUDGE' && data.nudge) {
      if (this.onNudgeReceived) {
        this.onNudgeReceived(data.nudge);
      }
    }
  }

  reconnect() {
    this.cleanupPeer();
    this.initPeer();
    if (this.firebaseDb) {
      this.subscribeFirebase();
    }
  }

  disconnect() {
    this.cleanupPeer();
    if (this.firebaseDb) {
      const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
      off(roomRef);
    }
    this.setStatus('disconnected');
  }
}

export const cloudSync = new CloudSyncService();
