import { Socket, Server as SocketIOServer } from 'socket.io';
import { SessionManager } from '../SessionManager';

interface BotJoinPayload {
  url: string;
  platform: string;
  title: string;
}

interface BotRecordPayload {
  language?: string;
  mode?: 'live' | 'background';
}

interface BotStopPayload {
  language?: string;
}

/**
 * Registers all Socket.io event listeners for an authenticated client socket.
 * Handles meeting lifecycle (join, record, pause, resume, stop batch processing, leave).
 */
export function registerSocketHandlers(
  io: SocketIOServer,
  socket: Socket,
  sessionManager: SessionManager
): void {
  const user = socket.data.user;
  const userId = socket.data.userId;

  if (!userId || !user) {
    socket.disconnect();
    return;
  }

  // Assign socket to isolated user room: 'user:<userId>'
  const userRoom = `user:${userId}`;
  socket.join(userRoom);
  console.log(`[Socket.io] 👤 User terhubung: ${user.displayName} (${user.email}) -> Room: ${userRoom}`);

  // Update socket ID in existing session (e.g. browser refresh / reconnection)
  sessionManager.updateSocketId(userId, socket.id);
  const existingSession = sessionManager.getSession(userId);
  if (existingSession) {
    socket.emit('bot_state_change', existingSession.state);
  }

  // ==========================================
  // EVENT: bot_join
  // ==========================================
  socket.on('bot_join', async (data: BotJoinPayload) => {
    console.log(`[Socket.io] [User: ${user.displayName}] Permintaan bot_join diterima:`, data);

    // Check server capacity limits
    if (sessionManager.isAtCapacity() && !sessionManager.getSession(userId)) {
      console.warn(
        `[Socket.io] ⚠️ Server penuh! Kapasitas maksimum: ${sessionManager.getActiveCount()}/${sessionManager.getMaxCapacity()}`
      );
      socket.emit('bot_state_change', 'ERROR');
      socket.emit('server_error', {
        message: 'Kapasitas server penuh (Maksimal 5 meeting bersamaan). Silakan coba beberapa saat lagi.',
      });
      return;
    }

    try {
      const session = sessionManager.createSession(
        userId,
        user.email,
        user.displayName,
        socket.id,
        data.url,
        data.platform,
        data.title
      );

      socket.emit('bot_state_change', 'JOINING');

      if (!session.adapter) {
        throw new Error('Adapter gagal diinisialisasi.');
      }

      const success = await session.adapter.join(data.url);

      if (success) {
        session.state = 'IN_ROOM_STANDBY';
        socket.emit('bot_state_change', 'IN_ROOM_STANDBY');
        console.log(`[Socket.io] [User: ${user.displayName}] Status bot -> IN_ROOM_STANDBY`);
      } else {
        session.state = 'ERROR';
        socket.emit('bot_state_change', 'ERROR');
      }
    } catch (err) {
      console.error(`[Socket.io] [User: ${user.displayName}] Error saat bot join:`, err);
      sessionManager.updateState(userId, 'ERROR');
    }
  });

  // ==========================================
  // EVENT: bot_record
  // ==========================================
  socket.on('bot_record', async (data?: BotRecordPayload) => {
    const session = sessionManager.getSession(userId);
    if (!session || !session.adapter) {
      console.warn(`[Socket.io] [User: ${user.displayName}] Sesi bot tidak ditemukan untuk record.`);
      return;
    }

    const lang = data?.language || session.language || process.env.DEEPGRAM_LANGUAGE || 'id';
    const mode = data?.mode || 'live';
    console.log(`[Socket.io] [User: ${user.displayName}] Memulai rekaman (Mode: ${mode.toUpperCase()}, Lang: ${lang})...`);

    try {
      const audioStream = await session.adapter.startAudioCapture();
      if (mode === 'background') {
        session.deepgram.startBackgroundRecording(audioStream);
      } else {
        session.deepgram.startAudioSave();
        session.deepgram.startLiveStream(audioStream, `meet-${userId}`, lang);
      }
      session.state = 'RECORDING';
      socket.emit('bot_state_change', 'RECORDING');
    } catch (err) {
      console.error(`[Socket.io] [User: ${user.displayName}] Error start audio capture:`, err);
    }
  });

  // ==========================================
  // EVENT: bot_pause
  // ==========================================
  socket.on('bot_pause', () => {
    const session = sessionManager.getSession(userId);
    if (session) {
      console.log(`[Socket.io] [User: ${user.displayName}] ⏸️ Pause stream`);
      session.deepgram.pauseStream();
      session.state = 'PAUSED';
      socket.emit('bot_state_change', 'PAUSED');
    }
  });

  // ==========================================
  // EVENT: bot_resume
  // ==========================================
  socket.on('bot_resume', () => {
    const session = sessionManager.getSession(userId);
    if (session) {
      console.log(`[Socket.io] [User: ${user.displayName}] ▶️ Resume stream`);
      session.deepgram.resumeStream();
      session.state = 'RECORDING';
      socket.emit('bot_state_change', 'RECORDING');
    }
  });

  // ==========================================
  // EVENT: bot_stop (Batch Processing)
  // ==========================================
  socket.on('bot_stop', async (data?: BotStopPayload) => {
    const session = sessionManager.getSession(userId);
    if (!session || !session.adapter) {
      console.warn(`[Socket.io] [User: ${user.displayName}] Sesi bot tidak ditemukan untuk stop.`);
      return;
    }

    console.log(`[Socket.io] [User: ${user.displayName}] Menghentikan rekaman & memproses batch...`);
    try {
      await session.adapter.stopAudioCapture();
      session.deepgram.stopLiveStream();
      session.state = 'PROCESSING';
      socket.emit('bot_state_change', 'PROCESSING');

      const lang = data?.language || session.language || process.env.DEEPGRAM_LANGUAGE || 'id';
      socket.emit('batch_processing_progress', {
        step: 1,
        message: 'Menganalisis gelombang audio & mengenali pembicara...',
      });

      setTimeout(() => {
        socket.emit('batch_processing_progress', {
          step: 2,
          message: 'Menyempurnakan tanda baca & merapikan transkrip...',
        });
      }, 2000);

      const batchTranscripts = await session.deepgram.processBatchTranscription(lang);

      socket.emit('batch_processing_progress', {
        step: 3,
        message: 'Menyusun notulen rapat & daftar tugas...',
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const participantsInfo = await session.adapter.getParticipants();
      const finalParticipantNames = participantsInfo.map((p) => p.name);

      const currentPresenter = (session.adapter as any).currentPresenter || null;

      if (batchTranscripts.length > 0) {
        socket.emit('batch_result', {
          success: true,
          transcripts: batchTranscripts,
          participants: finalParticipantNames,
          presenter: currentPresenter,
        });
        console.log(`[Socket.io] [User: ${user.displayName}] ✅ Batch result dikirim: ${batchTranscripts.length} entries | ${finalParticipantNames.length} peserta:`, finalParticipantNames, currentPresenter ? `(Presenter: ${currentPresenter})` : '');
      } else {
        socket.emit('batch_result', {
          success: false,
          transcripts: [],
          participants: finalParticipantNames,
          presenter: currentPresenter,
        });
      }

      session.state = 'IN_ROOM_STANDBY';
      socket.emit('bot_state_change', 'IN_ROOM_STANDBY');
    } catch (err) {
      console.error(`[Socket.io] [User: ${user.displayName}] Error saat batch processing:`, err);
      socket.emit('batch_result', { success: false, transcripts: [] });
      session.state = 'IN_ROOM_STANDBY';
      socket.emit('bot_state_change', 'IN_ROOM_STANDBY');
    }
  });


  // ==========================================
  // EVENT: bot_leave
  // ==========================================
  socket.on('bot_leave', async () => {
    console.log(`[Socket.io] [User: ${user.displayName}] Mengeluarkan bot dari meeting room...`);
    await sessionManager.removeSession(userId);
    socket.emit('bot_state_change', 'IDLE');
  });

  // ==========================================
  // EVENT: disconnect
  // ==========================================
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${user.displayName} (${socket.id})`);
  });
}
