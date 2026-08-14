export type MeetingPlatform = 'gmeet' | 'zoom' | 'teams';

export type BotState = 
  | 'IDLE'           // Disconnected, siap join
  | 'JOINING'        // Sedang memproses koneksi browser headless
  | 'IN_ROOM_STANDBY'// Sudah di dalam room, belum merekam
  | 'RECORDING'      // Sedang merekam & transkripsi live aktif
  | 'PAUSED'         // Rekaman dijeda sementara
  | 'LEAVING'        // Keluar dari room
  | 'ERROR';         // Terjadi error koneksi

export interface MeetingSession {
  id: string;
  title: string;
  url: string;
  platform: MeetingPlatform;
  botState: BotState;
  startTime?: string;
  recordStartTime?: string;
  elapsedSeconds: number;
  audioActive: boolean;
  vpnConnected: boolean;
  vpnIp?: string;
  activeSpeakers: number;
  totalWords: number;
}

export interface ScheduledMeeting {
  id: string;
  title: string;
  platform: MeetingPlatform;
  url: string;
  scheduledTime: string;
  autoRecord: boolean;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface MeetingHistory {
  id: string;
  title: string;
  platform: MeetingPlatform;
  url: string;
  date: string;
  durationSeconds: number;
  totalWords: number;
  speakersCount: number;
  languages: ('id' | 'en' | 'mixed')[];
  transcriptSnippet: string;
  audioFileUrl?: string;
  transcripts: Array<{
    id: string;
    speaker: string;
    timestamp: string;
    text: string;
    language: 'id' | 'en' | 'mixed';
  }>;
}
