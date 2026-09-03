import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Readable } from 'stream';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

import { createWavFromPcm } from './utils/audioUtils';

export type EventEmitterFn = (event: string, data: any) => void;

export class DeepgramService {
  private deepgram: any = null;
  private liveConnection: any = null;
  private keepAliveInterval: any = null;
  private isPaused: boolean = false;
  private audioChunks: Buffer[] = [];
  private isAudioSaving: boolean = false;

  constructor(private emitter: EventEmitterFn | SocketIOServer, apiKey?: string) {
    const key = apiKey || process.env.DEEPGRAM_API_KEY;
    if (key && key !== 'YOUR_DEEPGRAM_API_KEY') {
      try {
        this.deepgram = createClient(key);
        console.log('[DeepgramService] Deepgram SDK Client diinisialisasi.');
      } catch (err) {
        console.warn('[DeepgramService] Gagal inisialisasi SDK, fallback simulator:', err);
      }
    } else {
      console.log('[DeepgramService] DEEPGRAM_API_KEY tidak terdeteksi, sistem menggunakan Simulated Live Multilingual Stream.');
    }
  }

  private sendEvent(event: string, data: any) {
    if (typeof this.emitter === 'function') {
      this.emitter(event, data);
    } else if (this.emitter && typeof (this.emitter as any).emit === 'function') {
      (this.emitter as any).emit(event, data);
    }
  }

  public async startLiveStream(audioStream: Readable, meetingId: string = 'default', requestedLang?: string) {
    if (!this.deepgram) {
      console.log('[DeepgramService] Menggunakan mode fallback simulator.');
      return;
    }

    try {
      const selectedLanguage = (requestedLang || process.env.DEEPGRAM_LANGUAGE || 'id').toLowerCase().trim();
      const liveLang = (selectedLanguage === 'en' || selectedLanguage === 'english') ? 'en' : 'id';
      console.log(`[DeepgramService] Menghubungkan ke Live WebSocket Deepgram Nova-2 (Language: ${liveLang}, Endpointing: 300ms)...`);
      
      this.liveConnection = this.deepgram.listen.live({
        model: 'nova-2',
        language: liveLang, // 'id' (Indonesia + istilah umum) atau 'en' (English)
        smart_format: true,
        punctuate: true,
        diarize: true,
        interim_results: true,
        endpointing: 300, // Finalisasi kalimat otomatis saat ada jeda bicara 300ms (Sangat Mulus!)
        utterance_end_ms: 1000,
        vad_events: true,
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
      });

      this.liveConnection.on(LiveTranscriptionEvents.Open, () => {
        console.log(`[DeepgramService] ✅ Live WebSocket stream BERHASIL TERBUKA untuk Meeting: ${meetingId}`);

        // Keep connection alive secara berkala
        if (this.keepAliveInterval) clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = setInterval(() => {
          if (this.liveConnection && this.liveConnection.getReadyState() === 1) {
            try {
              this.liveConnection.keepAlive();
            } catch (e) {}
          }
        }, 5000);

        let chunksForwarded = 0;
        audioStream.on('data', (chunk: Buffer) => {
          // Simpan audio chunk untuk batch processing (selalu, termasuk saat pause)
          if (this.isAudioSaving) {
            this.audioChunks.push(Buffer.from(chunk));
          }

          // Jika sedang di-pause, jangan kirim audio ke Deepgram
          if (this.isPaused) return;

          chunksForwarded++;
          if (chunksForwarded === 1) {
            console.log('[DeepgramService] ✅ Chunk audio PERTAMA diterima dari bot dan dikirim ke Deepgram.');
          } else if (chunksForwarded % 50 === 0) {
            console.log(`[DeepgramService] Total chunk audio terkirim ke Deepgram: ${chunksForwarded}`);
          }
          if (this.liveConnection && this.liveConnection.getReadyState() === 1) {
            try {
              this.liveConnection.send(chunk);
            } catch (sendErr) {
              console.warn('[DeepgramService] Error sending audio chunk:', sendErr);
            }
          }
        });
      });

      this.liveConnection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        const alternative = data.channel?.alternatives?.[0];
        const transcript = alternative?.transcript;
        const isFinal = data.is_final;

        if (!transcript || transcript.trim() === '') return;

        // Jika sedang di-pause, abaikan transcript yang masuk
        if (this.isPaused) return;

        console.log(`[Deepgram STT] (${isFinal ? 'FINAL' : 'LIVE'}): ${transcript}`);

        const speakerNumber = alternative.words?.[0]?.speaker !== undefined ? alternative.words[0].speaker + 1 : 1;
        const speaker = `Speaker ${speakerNumber}`;

        // Deteksi bahasa sederhana untuk UI tag
        const isEnglish = /\b(the|is|and|to|in|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|have|from|or|one|had|by|word|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/i.test(transcript);
        const isIndo = /\b(dan|yang|di|ke|dari|ini|itu|untuk|dengan|pada|adalah|sebagai|kita|saya|anda|kamu|mereka|sudah|bisa|akan|tidak|juga|ada|dalam|karena|atau|saat|oleh|secara|hari|bagi|hanya|setelah|serta|tersebut|bila|jika|agar|supaya|kami|selamat|pagi|siang|malam)\b/i.test(transcript);

        let detectedLang: 'id' | 'en' | 'mixed' = 'id';
        if (isEnglish && isIndo) detectedLang = 'mixed';
        else if (isEnglish) detectedLang = 'en';

        // Emit to client
        this.sendEvent('transcript_data', {
          id: `dg-${Date.now()}-${Math.random()}`,
          meetingId,
          speaker,
          speakerId: alternative.words?.[0]?.speaker || 0,
          timestamp: new Date().toISOString().slice(11, 19),
          text: transcript,
          isFinal,
          language: detectedLang,
          confidence: alternative.confidence || 0.95,
          createdAt: Date.now(),
        });
      });

      this.liveConnection.on(LiveTranscriptionEvents.Error, (err: any) => {
        console.error('[DeepgramService] Live streaming error:', err?.message || JSON.stringify(err));
      });

      this.liveConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('[DeepgramService] Live WebSocket stream ditutup.');
        if (this.keepAliveInterval) {
          clearInterval(this.keepAliveInterval);
          this.keepAliveInterval = null;
        }
      });
    } catch (error) {
      console.error('[DeepgramService] Error saat memulai koneksi live:', error);
    }
  }

  public pauseStream() {
    this.isPaused = true;
    console.log('[DeepgramService] ⏸️ Stream di-PAUSE. Audio tidak dikirim ke Deepgram, transkrip ditahan.');
  }

  public resumeStream() {
    this.isPaused = false;
    console.log('[DeepgramService] ▶️ Stream di-RESUME. Audio kembali dikirim ke Deepgram.');
  }

  public stopLiveStream() {
    this.isPaused = false;
    this.isAudioSaving = false;
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
    if (this.liveConnection) {
      try {
        this.liveConnection.finish();
      } catch (err) {
        console.warn('[DeepgramService] Error closing stream:', err);
      }
      this.liveConnection = null;
    }
  }

  /**
   * Mulai menyimpan audio chunks ke buffer (dipanggil saat RECORD dimulai)
   */
  public startAudioSave() {
    this.audioChunks = [];
    this.isAudioSaving = true;
    console.log('[DeepgramService] 💾 Audio saving dimulai - chunks akan disimpan untuk batch processing.');
  }

  /**
   * Mode Background: Simpan audio secara murni lokal di memory tanpa membuka koneksi live WebSocket ke Deepgram
   */
  public startBackgroundRecording(audioStream: Readable) {
    this.audioChunks = [];
    this.isAudioSaving = true;
    this.isPaused = false;
    console.log('[DeepgramService] 💾 Mode Background Aktif: Audio disimpan murni di memory server (Live WebSocket ke Deepgram dinonaktifkan).');

    audioStream.on('data', (chunk: Buffer) => {
      if (this.isAudioSaving && !this.isPaused) {
        this.audioChunks.push(Buffer.from(chunk));
        if (this.audioChunks.length === 1) {
          console.log('[DeepgramService] 🎙️ Audio chunk pertama mulai disimpan di buffer server.');
        } else if (this.audioChunks.length % 100 === 0) {
          console.log(`[DeepgramService] 💾 Mode Background: ${this.audioChunks.length} audio chunks tersimpan di memory.`);
        }
      }
    });
  }

  /**
   * Proses batch transcription menggunakan Deepgram Pre-recorded API
   * Menghasilkan transkrip dengan akurasi lebih tinggi dari seluruh audio yang terekam
   */
  public async processBatchTranscription(requestedLang?: string): Promise<any[]> {
    if (!this.deepgram) {
      console.log('[DeepgramService] Deepgram client tidak tersedia untuk batch processing.');
      return [];
    }

    if (this.audioChunks.length === 0) {
      console.log('[DeepgramService] Tidak ada audio chunks untuk diproses.');
      return [];
    }

    try {
      const pcmBuffer = Buffer.concat(this.audioChunks);
      const audioSizeMB = (pcmBuffer.length / (1024 * 1024)).toFixed(2);
      console.log(`[DeepgramService] 🔄 Memulai batch processing... Raw PCM Audio size: ${audioSizeMB} MB (${this.audioChunks.length} chunks)`);

      const wavBuffer = createWavFromPcm(pcmBuffer, 16000, 1, 16);
      const selectedLanguage = (requestedLang || process.env.DEEPGRAM_LANGUAGE || 'id').toLowerCase().trim();
      const batchLang = (selectedLanguage === 'en' || selectedLanguage === 'english') ? 'en' : 'id';

      const { result } = await this.deepgram.listen.prerecorded.transcribeFile(
        wavBuffer,
        {
          model: 'nova-2',
          language: batchLang,
          smart_format: true,
          punctuate: true,
          diarize: true,
          paragraphs: true,
          utterances: true,
          utterance_split: 0.8,
        }
      );

      // Parse utterances menjadi array transkrip
      const transcripts: any[] = [];
      const utterances = result?.results?.utterances || [];

      // Deteksi bahasa sederhana
      const detectLang = (text: string): 'id' | 'en' | 'mixed' => {
        const isEnglish = /\b(the|is|and|to|in|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|have|from|or|one|had|by|but|not|what|all|were|we|when|your|can|said|there|an|each|which|she|do|how|their|if|will)\b/i.test(text);
        const isIndo = /\b(dan|yang|di|ke|dari|ini|itu|untuk|dengan|pada|adalah|sebagai|kita|saya|anda|mereka|sudah|bisa|akan|tidak|juga|ada|dalam|karena|atau|saat|oleh)\b/i.test(text);
        if (isEnglish && isIndo) return 'mixed';
        if (isEnglish) return 'en';
        return 'id';
      };

      if (utterances.length > 0) {
        for (let i = 0; i < utterances.length; i++) {
          const utt = utterances[i];
          const speakerNum = (utt.speaker !== undefined ? utt.speaker + 1 : 1);
          const startSec = Math.floor(utt.start || 0);
          const hrs = Math.floor(startSec / 3600);
          const mins = Math.floor((startSec % 3600) / 60);
          const secs = startSec % 60;
          const timestamp = `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

          transcripts.push({
            id: `batch-${Date.now()}-${i}`,
            meetingId: 'default',
            speaker: `Speaker ${speakerNum}`,
            speakerId: utt.speaker || 0,
            timestamp,
            text: utt.transcript || '',
            isFinal: true,
            language: detectLang(utt.transcript || ''),
            confidence: utt.confidence || 0.95,
            createdAt: Date.now(),
          });
        }
      } else {
        const alt = result?.results?.channels?.[0]?.alternatives?.[0];
        if (alt && alt.transcript && alt.transcript.trim()) {
          transcripts.push({
            id: `batch-${Date.now()}-0`,
            meetingId: 'default',
            speaker: 'Speaker 1',
            speakerId: 0,
            timestamp: '00:00',
            text: alt.transcript,
            isFinal: true,
            language: detectLang(alt.transcript),
            confidence: alt.confidence || 0.95,
            createdAt: Date.now(),
          });
        }
      }

      console.log(`[DeepgramService] ✅ Batch processing selesai! ${transcripts.length} utterances dihasilkan.`);
      
      // Bersihkan audio buffer
      this.audioChunks = [];
      
      return transcripts;
    } catch (error) {
      console.error('[DeepgramService] ❌ Error batch processing:', error);
      this.audioChunks = [];
      return [];
    }
  }
}
