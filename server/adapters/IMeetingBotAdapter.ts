import { Readable } from 'stream';

export interface ParticipantInfo {
  id: string;
  name: string;
  isMuted: boolean;
  isHost: boolean;
}

export interface IMeetingBotAdapter {
  readonly platformName: string;

  /**
   * Bergabung ke ruang rapat menggunakan browser headless
   */
  join(meetingUrl: string, botName?: string): Promise<boolean>;

  /**
   * Mulai menangkap stream audio mikrofon/meeting
   */
  startAudioCapture(): Promise<Readable>;

  /**
   * Menghentikan audio capture
   */
  stopAudioCapture(): Promise<void>;

  /**
   * Mute / Unmute mikrofon bot di dalam meeting
   */
  setMute(mute: boolean): Promise<void>;

  /**
   * Membaca daftar peserta yang sedang aktif di room
   */
  getParticipants(): Promise<ParticipantInfo[]>;

  /**
   * Keluar dari ruang rapat dan membersihkan instance browser
   */
  leave(): Promise<void>;
}
