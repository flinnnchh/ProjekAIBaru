import { IMeetingBotAdapter, ParticipantInfo } from './IMeetingBotAdapter';
import { Readable, PassThrough } from 'stream';

export class ZoomAdapter implements IMeetingBotAdapter {
  readonly platformName = 'Zoom Web';
  private audioStream: PassThrough | null = null;

  async join(meetingUrl: string, botName: string = 'AI Note-Taker Bot'): Promise<boolean> {
    console.log(`[ZoomAdapter] Menghubungkan ke Zoom Web Client via URL: ${meetingUrl} dengan nama: ${botName}`);
    // Modul Zoom Web SDK / Playwright web client joining
    return true;
  }

  async startAudioCapture(): Promise<Readable> {
    this.audioStream = new PassThrough();
    console.log(`[ZoomAdapter] Audio stream capture aktif.`);
    return this.audioStream;
  }

  async stopAudioCapture(): Promise<void> {
    if (this.audioStream) {
      this.audioStream.end();
      this.audioStream = null;
    }
  }

  async setMute(mute: boolean): Promise<void> {
    console.log(`[ZoomAdapter] Set mute: ${mute}`);
  }

  async getParticipants(): Promise<ParticipantInfo[]> {
    return [{ id: '1', name: 'Zoom Host', isMuted: false, isHost: true }];
  }

  async leave(): Promise<void> {
    console.log(`[ZoomAdapter] Meninggalkan ruang Zoom Meeting.`);
  }
}
