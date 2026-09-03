import { io, Socket } from 'socket.io-client';
import { TranscriptItem } from '../types/transcript';
import { BotState } from '../types/meeting';
import { authService } from './authService';

let socket: Socket | null = null;
let isConnected = false;

export const initSocket = (
  onTranscriptUpdate: (item: TranscriptItem) => void,
  onStateUpdate: (state: BotState) => void,
  onSpeakerAudio: (active: boolean) => void,
  onBatchProgress?: (step: number, message: string) => void,
  onBatchResult?: (data: { success: boolean; transcripts: TranscriptItem[]; participants?: string[]; presenter?: string }) => void,
  onServerError?: (message: string) => void,
  onParticipantsUpdate?: (data: { count: number; participants: string[]; presenter?: string }) => void
) => {

  try {
    const token = authService.getToken();

    // Jika belum ada token (belum login), jangan coba connect
    if (!token) {
      console.log('[Socket] Belum ada sesi login (Token JWT kosong). Menunggu login...');
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return null;
    }

    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001'
      : window.location.origin;

    if (socket) {
      socket.disconnect();
      socket = null;
    }

    console.log(`[Socket] Menghubungkan ke backend server di: ${serverUrl} dengan JWT Auth...`);

    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 5000,
      auth: (cb) => {
        cb({ token: authService.getToken() || '' });
      },
    });

    socket.on('connect', () => {
      isConnected = true;
      console.log('[Socket] ✅ Terhubung dengan sukses ke Backend Bot Orchestrator (Multi-User Isolated)!');
    });

    socket.on('transcript_data', (item: TranscriptItem) => {
      console.log('[Socket] Transkrip diterima (Ruang Anda):', item);
      onTranscriptUpdate(item);
      onSpeakerAudio(true);
      setTimeout(() => onSpeakerAudio(false), 800);
    });

    socket.on('participants_update', (data: { count: number; participants: string[]; presenter?: string }) => {
      console.log('[Socket] Partisipan terupdate:', data);
      onParticipantsUpdate?.(data);
    });

    socket.on('bot_state_change', (newState: BotState) => {
      console.log(`[Socket] Bot state update: ${newState}`);
      onStateUpdate(newState);
    });

    socket.on('audio_activity', (active: boolean) => {
      onSpeakerAudio(active);
    });

    // Batch processing events
    socket.on('batch_processing_progress', (data: { step: number; message: string }) => {
      console.log(`[Socket] Batch progress step ${data.step}: ${data.message}`);
      onBatchProgress?.(data.step, data.message);
    });

    socket.on('batch_result', (data: { success: boolean; transcripts: TranscriptItem[]; participants?: string[]; presenter?: string }) => {
      console.log(`[Socket] Batch result diterima: success=${data.success}, items=${data.transcripts.length}, presenter=${data.presenter}`);
      onBatchResult?.(data);
    });


    socket.on('server_error', (data: { message: string }) => {
      console.error(`[Socket] Server error:`, data.message);
      onServerError?.(data.message);
      alert(`⚠️ ${data.message}`);
    });

    socket.on('disconnect', () => {
      isConnected = false;
      console.log('[Socket] Terputus dari backend server.');
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  } catch (err) {
    console.warn('[Socket] Error inisialisasi socket:', err);
  }

  return socket;
};

export const getSocket = () => socket;
export const isSocketConnected = () => isConnected;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};
