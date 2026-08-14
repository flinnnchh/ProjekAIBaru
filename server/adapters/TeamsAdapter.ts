import { IMeetingBotAdapter, ParticipantInfo } from './IMeetingBotAdapter';
import { Readable, PassThrough } from 'stream';

export class TeamsAdapter implements IMeetingBotAdapter {
  readonly platformName = 'Microsoft Teams';
  private audioStream: PassThrough | null = null;

  async join(meetingUrl: string, botName: string = 'AI Note-Taker Bot'): Promise<boolean> {
    console.log(`[TeamsAdapter] Menghubungkan ke MS Teams Web Client via: ${meetingUrl}`);
    return true;
  }

  async startAudioCapture(): Promise<Readable> {
    this.audioStream = new PassThrough();
    return this.audioStream;
  }

  async stopAudioCapture(): Promise<void> {
    if (this.audioStream) {
      this.audioStream.end();
      this.audioStream = null;
    }
  }

  async setMute(mute: boolean): Promise<void> {
    console.log(`[TeamsAdapter] Set mute: ${mute}`);
  }

  async getParticipants(): Promise<ParticipantInfo[]> {
    return [{ id: '1', name: 'Teams Organizer', isMuted: false, isHost: true }];
  }

  async leave(): Promise<void> {
    console.log(`[TeamsAdapter] Keluar dari meeting Microsoft Teams.`);
  }
}
