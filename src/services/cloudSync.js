import mqtt from 'mqtt';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

class CloudSyncService {
  constructor() {
    this.client = null;
    this.roomCode = 'RICO-LAIK';
    this.userRole = 'partnerA';
    this.deviceId = this.getOrCreateDeviceId();
    this.onStateReceived = null;
    this.onNudgeReceived = null;
    this.onStatusChange = null;
    this.status = 'disconnected';
    this.firebaseApp = null;
    this.firebaseDb = null;
    this.isPublishing = false;
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

  init({ roomCode, userRole, onStateReceived, onNudgeReceived, onStatusChange }) {
    this.roomCode = (roomCode || 'RICO-LAIK').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    this.userRole = userRole || 'partnerA';
    this.onStateReceived = onStateReceived;
    this.onNudgeReceived = onNudgeReceived;
    this.onStatusChange = onStatusChange;

    this.connectMqtt();
    this.initFirebaseIfConfigured();
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
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  /* ------------------- Free Public Cloud Realtime Relay (MQTT over WebSockets) ------------------- */
  connectMqtt() {
    this.cleanupMqtt();
    this.setStatus('connecting');

    const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
    const clientId = `aetheria_${this.deviceId}_${Math.random().toString(16).substring(2, 6)}`;
    const topic = `aetheria/room/${this.roomCode}`;

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      this.client.on('connect', () => {
        this.setStatus('connected');
        this.client.subscribe(topic, { qos: 1 }, (err) => {
          if (err) console.warn('MQTT subscribe error', err);
        });
      });

      this.client.on('message', (receivedTopic, message) => {
        try {
          const payload = JSON.parse(message.toString());
          this.handleIncomingData(payload);
        } catch (e) {
          console.warn('MQTT parse error', e);
        }
      });

      this.client.on('error', (err) => {
        console.warn('MQTT client error', err);
      });

      this.client.on('close', () => {
        this.setStatus('disconnected');
      });

      this.client.on('offline', () => {
        this.setStatus('disconnected');
      });

      this.client.on('reconnect', () => {
        this.setStatus('connecting');
      });
    } catch (e) {
      console.warn('Failed initializing MQTT client', e);
    }
  }

  cleanupMqtt() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {}
      this.client = null;
    }
  }

  /* ------------------- Firebase Realtime Sync (Optional) ------------------- */
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
    const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
    onValue(roomRef, (snapshot) => {
      if (this.isPublishing) return;
      const val = snapshot.val();
      if (val && val.state) {
        this.handleIncomingData({
          type: 'SYNC_STATE',
          state: val.state,
          deviceId: val.deviceId,
          sender: val.sender,
          timestamp: val.timestamp
        });
      }
    });
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

  /* ------------------- Broadcasting & Receiving ------------------- */
  broadcastState(state) {
    const payload = {
      type: 'SYNC_STATE',
      state: {
        completions: state.completions,
        entries: state.entries,
        profiles: state.profiles,
      },
      deviceId: this.deviceId,
      sender: this.userRole,
      timestamp: Date.now(),
    };

    // 1. Publish to MQTT cloud broker with retain: true so partner gets it even if opening later
    if (this.client && this.client.connected) {
      const topic = `aetheria/room/${this.roomCode}`;
      try {
        this.client.publish(topic, JSON.stringify(payload), { qos: 1, retain: true });
      } catch (e) {
        console.warn('MQTT publish error', e);
      }
    }

    // 2. Publish to Firebase if configured
    if (this.firebaseDb) {
      this.isPublishing = true;
      const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
      set(roomRef, payload)
        .catch(err => console.warn('Firebase set error', err))
        .finally(() => {
          setTimeout(() => { this.isPublishing = false; }, 300);
        });
    }
  }

  broadcastNudge(nudge) {
    const payload = {
      type: 'NUDGE',
      nudge,
      deviceId: this.deviceId,
      sender: this.userRole,
      timestamp: Date.now(),
    };

    if (this.client && this.client.connected) {
      const topic = `aetheria/room/${this.roomCode}`;
      try {
        // Nudges are not retained
        this.client.publish(topic, JSON.stringify(payload), { qos: 1, retain: false });
      } catch (e) {
        console.warn('MQTT nudge publish error', e);
      }
    }

    if (this.firebaseDb) {
      const roomNudgeRef = ref(this.firebaseDb, `rooms/${this.roomCode}/lastNudge`);
      set(roomNudgeRef, payload).catch(err => console.warn(err));
    }
  }

  handleIncomingData(data) {
    if (!data || typeof data !== 'object') return;
    // Discard messages originating from this exact device to prevent loop
    if (data.deviceId === this.deviceId) return;

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
    this.connectMqtt();
    if (this.firebaseDb) {
      this.subscribeFirebase();
    }
  }

  disconnect() {
    this.cleanupMqtt();
    if (this.firebaseDb) {
      const roomRef = ref(this.firebaseDb, `rooms/${this.roomCode}`);
      off(roomRef);
    }
    this.setStatus('disconnected');
  }
}

export const cloudSync = new CloudSyncService();
