import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { VpnManager } from './vpnManager';
import { connectDatabase } from './database';
import { authRouter } from './auth/authRoutes';
import { socketAuthMiddleware } from './auth/socketAuth';
import { SessionManager } from './SessionManager';
import { historyRouter } from './routes/historyRoutes';
import { scheduleRouter } from './routes/scheduleRoutes';
import { createAdminRouter } from './routes/adminRoutes';
import driveRouter from './routes/driveRoutes';
import { registerSocketHandlers } from './handlers/socketHandler';

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
app.use(express.json({ limit: '50mb' }));

// 1. Hubungkan ke MongoDB
connectDatabase();

const vpnManager = new VpnManager();
const sessionManager = new SessionManager(io);

// 2. Pasang REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/admin', createAdminRouter(sessionManager));
app.use('/api/drive', driveRouter);


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Meeting Bot Orchestrator (Multi-User)',
    activeSessions: sessionManager.getActiveCount(),
    maxCapacity: sessionManager.getMaxCapacity(),
  });
});

app.get('/api/vpn-status', (req, res) => {
  res.json(vpnManager.getStatus());
});

// 3. Socket.IO Authentication & Multi-User Session Isolation
io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket, sessionManager);
});

const PORT = process.env.PORT || 3001;
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Port ${PORT} sedang digunakan oleh instance server lain!`);
    console.error(`   Server backend sudah berjalan di terminal Anda yang lain.`);
  } else {
    console.error('[Server Error]:', err);
  }
});

httpServer.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  AI MEETING BOT ORCHESTRATOR SERVER RUNNING (MULTI-USER)`);
  console.log(`  Port: http://localhost:${PORT}`);
  console.log(`  STT Engine: Deepgram Nova-2 Live Multilingual (ID + EN)`);
  console.log(`  Max Concurrent Sessions: ${sessionManager.getMaxCapacity()}`);
  console.log(`  VPN Status: ${vpnManager.getStatus().assignedIp} (Connected)`);
  console.log(`======================================================\n`);
});
