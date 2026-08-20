import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { Readable } from 'stream';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

export class DeepgramService {
  private deepgram: any = null;
  private liveConnection: any = null;
  private keepAliveInterval: any = null;
  private isPaused: boolean = false;

  constructor(private io: SocketIOServer, apiKey?: string) {
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

        // Broadcast to web client
        this.io.emit('transcript_data', {
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
}
