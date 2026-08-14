export type DetectedLanguage = 'id' | 'en' | 'mixed';

export interface TranscriptItem {
  id: string;
  meetingId: string;
  speaker: string;
  speakerId: number;
  timestamp: string; // "00:04:12"
  text: string;
  isFinal: boolean;
  language: DetectedLanguage;
  confidence: number;
  createdAt: number;
}

export interface DeepgramLiveConfig {
  apiKey?: string;
  model: 'nova-2' | 'nova-3';
  language: 'id' | 'en' | 'multi';
  detectLanguage: boolean;
  smartFormat: boolean;
  punctuate: boolean;
  diarize: boolean;
}
