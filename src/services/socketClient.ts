import { io, Socket } from 'socket.io-client';
import { TranscriptItem } from '../types/transcript';
import { BotState } from '../types/meeting';

let socket: Socket | null = null;
let isConnected = false;

export const initSocket = (
  onTranscriptUpdate: (item: TranscriptItem) => void,
  onStateUpdate: (state: BotState) => void,
  onSpeakerAudio: (active: boolean) => void
) => {
  try {
    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001'
      : window.location.origin;

    console.log(`[Socket] Menghubungkan ke backend server di: ${serverUrl}`);

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000
    });

    socket.on('connect', () => {
      isConnected = true;
      console.log('[Socket] Terhubung dengan sukses ke Backend Bot Orchestrator!');
    });

    socket.on('transcript_data', (item: TranscriptItem) => {
      console.log('[Socket] Transkrip asli diterima dari Deepgram:', item);
      onTranscriptUpdate(item);
      onSpeakerAudio(true);
      setTimeout(() => onSpeakerAudio(false), 800);
    });

    socket.on('bot_state_change', (newState: BotState) => {
      console.log(`[Socket] Bot state update: ${newState}`);
      onStateUpdate(newState);
    });

    socket.on('audio_activity', (active: boolean) => {
      onSpeakerAudio(active);
    });

    socket.on('disconnect', () => {
      isConnected = false;
      console.log('[Socket] Terputus dari backend server.');
    });
  } catch (err) {
    console.warn('[Socket] Error inisialisasi socket:', err);
  }

  return socket;
};

export const getSocket = () => socket;
export const isSocketConnected = () => isConnected;
