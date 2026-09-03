import { Socket, Server as SocketIOServer } from 'socket.io';
import { IMeetingBotAdapter } from './adapters/IMeetingBotAdapter';
import { GoogleMeetAdapter } from './adapters/GoogleMeetAdapter';
import { ZoomAdapter } from './adapters/ZoomAdapter';
import { TeamsAdapter } from './adapters/TeamsAdapter';
import { DeepgramService } from './deepgramService';

export type BotState = 
  | 'IDLE'
  | 'JOINING'
  | 'IN_ROOM_STANDBY'
  | 'RECORDING'
  | 'PAUSED'
  | 'PROCESSING'
  | 'LEAVING'
  | 'ERROR';

export interface UserBotSession {
  userId: string;
  userEmail: string;
  displayName: string;
  socketId: string;
  meetingUrl: string;
  meetingTitle: string;
  platform: string;
  language: string;
  state: BotState;
  adapter: IMeetingBotAdapter | null;
  deepgram: DeepgramService;
  createdAt: Date;
  elapsedSeconds: number;
}

export class SessionManager {
  private sessions: Map<string, UserBotSession> = new Map(); // Key: userId
  private maxConcurrentSessions: number = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5', 10);

  constructor(private io: SocketIOServer) {}

  /**
   * Cek apakah kapasitas maksimum meeting paralel tercapai
   */
  public isAtCapacity(): boolean {
    return this.sessions.size >= this.maxConcurrentSessions;
  }

  public getActiveCount(): number {
    return this.sessions.size;
  }

  public getMaxCapacity(): number {
    return this.maxConcurrentSessions;
  }

  /**
   * Mengambil sesi aktif berdasarkan userId
   */
  public getSession(userId: string): UserBotSession | undefined {
    return this.sessions.get(userId);
  }

  /**
   * Mengambil sesi aktif berdasarkan socketId
   */
  public getSessionBySocketId(socketId: string): UserBotSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.socketId === socketId) {
        return session;
      }
    }
    return undefined;
  }

  /**
   * Membuat atau menginisialisasi sesi baru untuk user tertentu
   */
  public createSession(
    userId: string,
    userEmail: string,
    displayName: string,
    socketId: string,
    meetingUrl: string,
    platform: string,
    title: string,
    language: string = 'id'
  ): UserBotSession {
    // Jika sesi lama masih ada, bersihkan terlebih dahulu
    const existing = this.sessions.get(userId);
    if (existing && existing.adapter) {
      console.log(`[SessionManager] Membersihkan sesi lama user ${displayName} (${userId})...`);
      existing.adapter.leave().catch(() => {});
      existing.deepgram.stopLiveStream();
    }

    // Buat adapter sesuai platform
    let adapter: IMeetingBotAdapter;
    if (platform === 'zoom') {
      adapter = new ZoomAdapter();
    } else if (platform === 'teams') {
      adapter = new TeamsAdapter();
    } else {
      // Google Meet Adapter
      adapter = new GoogleMeetAdapter(this.io);
    }

    // Buat DeepgramService terisolasi khusus untuk user room ini
    const deepgram = new DeepgramService((event: string, data: any) => {
      this.io.to(`user:${userId}`).emit(event, data);
    });

    const session: UserBotSession = {
      userId,
      userEmail,
      displayName,
      socketId,
      meetingUrl,
      meetingTitle: title || 'Sesi Meeting Live',
      platform,
      language,
      state: 'JOINING',
      adapter,
      deepgram,
      createdAt: new Date(),
      elapsedSeconds: 0,
    };

    this.sessions.set(userId, session);
    console.log(`[SessionManager] ✅ Sesi baru dibuat untuk ${displayName} (${userEmail}) | Total sesi aktif: ${this.sessions.size}/${this.maxConcurrentSessions}`);

    return session;
  }

  /**
   * Mengupdate socketId jika user merefresh browser
   */
  public updateSocketId(userId: string, newSocketId: string): void {
    const session = this.sessions.get(userId);
    if (session) {
      session.socketId = newSocketId;
    }
  }

  /**
   * Mengupdate status bot untuk user tertentu
   */
  public updateState(userId: string, newState: BotState): void {
    const session = this.sessions.get(userId);
    if (session) {
      session.state = newState;
      this.io.to(`user:${userId}`).emit('bot_state_change', newState);
    }
  }

  /**
   * Menghapus sesi dan mematikan browser instance
   */
  public async removeSession(userId: string): Promise<void> {
    const session = this.sessions.get(userId);
    if (session) {
      console.log(`[SessionManager] Menutup sesi untuk ${session.displayName} (${userId})...`);
      try {
        if (session.adapter) {
          await session.adapter.leave();
        }
        session.deepgram.stopLiveStream();
      } catch (err) {
        console.warn(`[SessionManager] Error saat membersihkan adapter session:`, err);
      }
      this.sessions.delete(userId);
      this.io.to(`user:${userId}`).emit('bot_state_change', 'IDLE');
      console.log(`[SessionManager] 🗑️ Sesi ${session.displayName} dihapus. Sisa sesi aktif: ${this.sessions.size}`);
    }
  }

  /**
   * Ambil ringkasan seluruh sesi (untuk admin monitoring)
   */
  public getAllSessionsSummary(): Array<{
    userId: string;
    displayName: string;
    email: string;
    meetingTitle: string;
    meetingUrl: string;
    platform: string;
    state: BotState;
    createdAt: Date;
    elapsedSeconds: number;
  }> {
    const now = Date.now();
    return Array.from(this.sessions.values()).map((s) => {
      const createdTime = s.createdAt ? new Date(s.createdAt).getTime() : now;
      const elapsed = Math.max(0, Math.floor((now - createdTime) / 1000));
      return {
        userId: s.userId || '',
        displayName: s.displayName || 'User',
        email: s.userEmail || '',
        meetingTitle: s.meetingTitle || 'Meeting',
        meetingUrl: s.meetingUrl || '',
        platform: s.platform || 'gmeet',
        state: s.state || 'IDLE',
        createdAt: s.createdAt || new Date(),
        elapsedSeconds: elapsed,
      };
    });
  }
}
