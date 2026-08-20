import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleMeetAdapter } from './adapters/GoogleMeetAdapter';
import { ZoomAdapter } from './adapters/ZoomAdapter';
import { TeamsAdapter } from './adapters/TeamsAdapter';
import { IMeetingBotAdapter } from './adapters/IMeetingBotAdapter';
import { DeepgramService } from './deepgramService';
import { VpnManager } from './vpnManager';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const vpnManager = new VpnManager();
const deepgramService = new DeepgramService(io);
let activeBotAdapter: IMeetingBotAdapter | null = null;

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Meeting Bot Orchestrator',
  });
});

app.get('/api/vpn-status', (req, res) => {
  res.json(vpnManager.getStatus());
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('bot_join', async (data: { url: string; platform: string; title: string }) => {
    console.log(`[Socket.io] Permintaan bot join diterima:`, data);

    try {
      if (data.platform === 'gmeet') {
        activeBotAdapter = new GoogleMeetAdapter(io);
      } else if (data.platform === 'zoom') {
        activeBotAdapter = new ZoomAdapter();
      } else {
        activeBotAdapter = new TeamsAdapter();
      }

      socket.emit('bot_state_change', 'JOINING');
      const success = await activeBotAdapter.join(data.url);

      if (success) {
        socket.emit('bot_state_change', 'IN_ROOM_STANDBY');
        console.log(`[Socket.io] Status bot diperbarui -> IN_ROOM_STANDBY (Menunggu tombol 'RECORD' di Web Panel)`);
      } else {
        socket.emit('bot_state_change', 'ERROR');
      }
    } catch (err) {
      console.error('[Socket.io] Error during bot join:', err);
      socket.emit('bot_state_change', 'ERROR');
    }
  });

  socket.on('bot_record', async (data?: { language?: string }) => {
    const lang = data?.language || process.env.DEEPGRAM_LANGUAGE || 'id';
    console.log(`[Socket.io] Memulai rekaman & STT (Language: ${lang})...`);
    if (activeBotAdapter) {
      try {
        const audioStream = await activeBotAdapter.startAudioCapture();
        deepgramService.startLiveStream(audioStream, 'default', lang);
        socket.emit('bot_state_change', 'RECORDING');
      } catch (err) {
        console.error('[Socket.io] Error starting audio capture:', err);
      }
    }
  });

  socket.on('bot_pause', () => {
    console.log(`[Socket.io] ⏸️ Menerima sinyal PAUSE dari frontend...`);
    deepgramService.pauseStream();
    socket.emit('bot_state_change', 'PAUSED');
  });

  socket.on('bot_resume', () => {
    console.log(`[Socket.io] ▶️ Menerima sinyal RESUME dari frontend...`);
    deepgramService.resumeStream();
    socket.emit('bot_state_change', 'RECORDING');
  });

  socket.on('bot_stop', async () => {
    console.log(`[Socket.io] Menghentikan rekaman...`);
    if (activeBotAdapter) {
      await activeBotAdapter.stopAudioCapture();
      deepgramService.stopLiveStream();
      socket.emit('bot_state_change', 'IN_ROOM_STANDBY');
    }
  });

  socket.on('bot_leave', async () => {
    console.log(`[Socket.io] Mengeluarkan bot dari room...`);
    if (activeBotAdapter) {
      await activeBotAdapter.leave();
      activeBotAdapter = null;
      socket.emit('bot_state_change', 'IDLE');
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} sedang digunakan oleh instance server lain!`);
    console.error(`   Server backend sudah berjalan di terminal Anda yang lain.`);
    console.error(`   Anda tidak perlu menjalankan 'npm start' / 'npm run server' dua kali.\n`);
  } else {
    console.error('[Server Error]:', err);
  }
});

httpServer.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  AI MEETING BOT ORCHESTRATOR SERVER RUNNING`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  STT Engine: Deepgram Nova-2 Live Multilingual (ID + EN)`);
  console.log(`  VPN Status: ${vpnManager.getStatus().assignedIp} (Connected)`);
  console.log(`======================================================\n`);
});
