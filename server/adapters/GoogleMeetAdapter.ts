import { IMeetingBotAdapter, ParticipantInfo } from './IMeetingBotAdapter';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { Readable, PassThrough } from 'stream';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';

export class GoogleMeetAdapter implements IMeetingBotAdapter {
  readonly platformName = 'Google Meet';
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private audioStream: PassThrough | null = null;
  private isCapturingAudio: boolean = false;
  private pollInterval: any = null;
  private participantInterval: any = null;
  private lastCapturedText: string = '';
  private discoveredParticipants = new Set<string>();
  private participantPollTicks = 0;
  private botDisplayName: string = process.env.BOT_DISPLAY_NAME || 'AI Note-Taker Bot';
  public currentPresenter: string | null = null;

  constructor(private io?: SocketIOServer) {}



  async join(meetingUrl: string, botName: string = process.env.BOT_DISPLAY_NAME || 'AI Note-Taker Bot'): Promise<boolean> {
    try {
      console.log(`[GoogleMeetAdapter] Memulai bot headless di background untuk join: ${meetingUrl}`);

      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--headless=new',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-size=1280,720',
          '--autoplay-policy=no-user-gesture-required'
        ]
      });

      const authPath = path.join(process.cwd(), 'google_auth.json');
      const hasSavedAuth = fs.existsSync(authPath);

      if (hasSavedAuth) {
        console.log(`[GoogleMeetAdapter] Menggunakan sesi akun Google dari google_auth.json`);
        this.context = await this.browser.newContext({
          storageState: authPath,
          permissions: ['microphone', 'camera'],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 720 }
        });
      } else {
        console.log(`[GoogleMeetAdapter] Mode Guest.`);
        this.context = await this.browser.newContext({
          permissions: ['microphone', 'camera'],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 720 }
        });
      }

      this.page = await this.context.newPage();

      // Polyfill __name untuk mencegah error esbuild/tsx saat injeksi script ke browser
      await this.page.addInitScript(`
        window.__name = window.__name || function(target, value) { return target; };
        globalThis.__name = globalThis.__name || function(target, value) { return target; };
      `);

      // PENTING: tanpa listener ini, semua console.log/console.error yang
      // dipanggil di dalam page.evaluate() (mis. hook Web Audio) TIDAK PERNAH
      // muncul di terminal Node.js -- karena browser-nya headless, jadi
      // selama ini kalau ada error di dalam page.evaluate() kamu tidak
      // pernah melihatnya sama sekali.
      this.page.on('console', (msg) => {
        const text = msg.text();
        // Hanya tampilkan log relevan dari Web Audio Hook & Bot Engine
        if (text.startsWith('[GMeet') || text.startsWith('[Google Meet') || text.includes('Audio')) {
          console.log(`[Browser Engine] ${text}`);
        }
      });
      this.page.on('pageerror', (err) => {
        // Abaikan error internal obfuscated minified scripts milik Google Meet (_.wVg, _.jO, dll)
        if (!err.message || err.message.startsWith('_.') || err.message.includes('minified')) return;
        console.error('[Browser Page Error]', err.message);
      });

      // Expose bridge audio chunks ke Deepgram
      let chunkCount = 0;
      let sawFirstChunkEver = false;
      await this.page.exposeFunction('sendAudioChunkToNode', (base64Chunk: string, hasSound: boolean) => {
        if (!sawFirstChunkEver) {
          sawFirstChunkEver = true;
          console.log('[GoogleMeetAdapter] ✅ Chunk audio PERTAMA diterima dari browser tab (Web Audio hook berhasil jalan).');
        }
        if (!this.audioStream || !this.isCapturingAudio) {
          // Chunk datang dari browser tapi belum ada yang menampung -> berarti
          // startAudioCapture() sudah selesai atau belum diaktifkan.
          return;
        }
        try {
          const buffer = Buffer.from(base64Chunk, 'base64');
          this.audioStream.write(buffer);
          chunkCount++;
          if (chunkCount === 1 || chunkCount % 20 === 0) {
            console.log(`[GoogleMeetAdapter] Audio streaming ke Deepgram (#chunk ${chunkCount}, hasSound=${hasSound})`);
          }
          if (hasSound && this.io) {
            this.io.emit('audio_activity', true);
          }
        } catch (err) {
          console.error('[GoogleMeetAdapter] Error audio stream buffer:', err);
        }
      });

      console.log(`[GoogleMeetAdapter] Membuka URL: ${meetingUrl}`);
      await this.page.goto(meetingUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await this.page.waitForTimeout(3000);

      // 1. Matikan mic & camera & tutup popup dialog jika ada
      try {
        const dismissSelectors = [
          'button:has-text("Got it")',
          'button:has-text("Mengerti")',
          'button:has-text("Dismiss")',
          'button:has-text("Tutup")',
          'button:has-text("Continue without microphone")',
          'button:has-text("Lanjutkan tanpa mikrofon")',
          'button[aria-label*="Close" i]',
          'button[aria-label*="Tutup" i]'
        ];
        for (const sel of dismissSelectors) {
          const dismissBtn = await this.page.$(sel);
          if (dismissBtn && (await dismissBtn.isVisible().catch(() => false))) {
            await dismissBtn.click().catch(() => {});
          }
        }

        const micButtons = await this.page.$$('[aria-label*="Turn off microphone"], [aria-label*="Matikan mikrofon"], [data-is-muted="false"][aria-label*="microphone"]');
        for (const btn of micButtons) {
          await btn.click().catch(() => {});
        }
        const camButtons = await this.page.$$('[aria-label*="Turn off camera"], [aria-label*="Matikan kamera"], [aria-label*="camera"]');
        for (const btn of camButtons) {
          await btn.click().catch(() => {});
        }
      } catch {}

      // 2. Isi nama jika ada (mode Guest)
      try {
        const nameInput = await this.page.$('input[type="text"]');
        if (nameInput && (await nameInput.isVisible().catch(() => false))) {
          await nameInput.fill(botName).catch(() => {});
          await this.page.waitForTimeout(500);
        }
      } catch {}

      // 3. Klik tombol Join (Mencoba beberapa selector & DOM text scan)
      try {
        const joinSelectors = [
          'button:has-text("Join now")',
          'button:has-text("Gabung sekarang")',
          'button:has-text("Ask to join")',
          'button:has-text("Minta bergabung")',
          'button:has-text("Join here too")',
          'button:has-text("Gabung di sini juga")',
          'button:has-text("Switch here")',
          'button:has-text("Beralih ke sini")',
          'button:has-text("Join")',
          'button:has-text("Gabung")',
          'button[jsname="Qx7uuf"]',
          'button[jsname="V67aGc"]',
          '[data-mdc-dialog-action="join"]',
          'div[role="button"]:has-text("Join now")',
          'div[role="button"]:has-text("Gabung sekarang")',
          'div[role="button"]:has-text("Ask to join")',
          'div[role="button"]:has-text("Minta bergabung")',
          'div[role="button"]:has-text("Join")',
          'div[role="button"]:has-text("Gabung")'
        ];

        let joined = false;
        for (let attempt = 0; attempt < 6; attempt++) {
          for (const sel of joinSelectors) {
            const btn = await this.page.$(sel);
            if (btn) {
              const isVisible = await btn.isVisible().catch(() => false);
              if (isVisible) {
                await btn.click().catch(() => {});
                console.log(`[GoogleMeetAdapter] ✅ Tombol join berhasil ditekan: "${sel}"`);
                if (sel.includes('Ask') || sel.includes('Minta')) {
                  console.log(`[GoogleMeetAdapter] ℹ️ Bot sedang menunggu persetujuan (Admit) dari Host Google Meet.`);
                }
                joined = true;
                break;
              }
            }
          }
          if (joined) break;
          await this.page.waitForTimeout(1000);
        }

        // Fallback DOM scan jika selector spesifik belum kena
        if (!joined) {
          const clickedText = await this.page.evaluate(`(() => {
            const btns = Array.from(document.querySelectorAll('button, div[role="button"], span[role="button"]'));
            for (const b of btns) {
              const text = (b.textContent || '').trim().toLowerCase();
              const aria = (b.getAttribute('aria-label') || '').toLowerCase();
              if (
                text.includes('join now') ||
                text.includes('gabung sekarang') ||
                text.includes('ask to join') ||
                text.includes('minta bergabung') ||
                text.includes('join here too') ||
                text.includes('gabung di sini juga') ||
                text === 'join' ||
                text === 'gabung' ||
                aria.includes('join') ||
                aria.includes('gabung')
              ) {
                b.click();
                return (b.textContent || b.getAttribute('aria-label') || 'Join Button').trim();
              }
            }
            return null;
          })()`);

          if (clickedText) {
            console.log(`[GoogleMeetAdapter] ✅ Tombol join berhasil ditekan via DOM scan: "${clickedText}"`);
            joined = true;
          }
        }

        // Cek apakah ada halaman penolakan akses dari Google Meet ("You can't join this meeting")
        const deniedMessage = await this.page.evaluate(`(() => {
          const bodyText = document.body.innerText || '';
          if (bodyText.includes("You can't join this meeting") || bodyText.includes("tidak dapat bergabung")) {
            return "Pengaturan Google Meet membatasi akses akun ini (Meeting Access: Restricted).";
          }
          if (bodyText.includes("meeting has ended") || bodyText.includes("rapat ini telah berakhir")) {
            return "Room Google Meet sudah ditutup / berakhir.";
          }
          return null;
        })()`);

        if (deniedMessage) {
          console.error(`\n[GoogleMeetAdapter] ❌ GAGAL MASUK: ${deniedMessage}`);
          console.error(`======================================================================`);
          console.error(`💡 CARA MENGATASI (Host Controls Google Meet):`);
          console.error(`1. Di layar Host Google Meet Anda, klik ikon Gembok 🔒 (Host Controls) di pojok kanan bawah.`);
          console.error(`2. Pada bagian 'Meeting access' / 'Jenis akses rapat': Ubah dari 'Restricted' (Dibatasi) menjadi 'Open' (Terbuka).`);
          console.error(`3. Atau klik 'Add people' / 'Tambahkan orang' dan masukkan email bot: ${process.env.GOOGLE_BOT_EMAIL || 'botnotulenlui@gmail.com'}`);
          console.error(`======================================================================\n`);
          await this.page.screenshot({ path: path.join(process.cwd(), 'debug_meet_lobby.png') }).catch(() => {});
          return false;
        }

        if (!joined) {
          const debugButtons = await this.page.evaluate(`(() => {
            return Array.from(document.querySelectorAll('button, div[role="button"]'))
              .map(b => (b.textContent || b.getAttribute('aria-label') || '').trim())
              .filter(t => t.length > 0 && t.length < 60);
          })()`).catch(() => []);
          console.warn('[GoogleMeetAdapter] ⚠️ Tombol Join belum ditemukan. Tombol di layar:', debugButtons);
          await this.page.screenshot({ path: path.join(process.cwd(), 'debug_meet_lobby.png') }).catch(() => {});
          return false;
        }

        this.botDisplayName = botName || process.env.BOT_DISPLAY_NAME || 'AI Note-Taker Bot';
        console.log('[GoogleMeetAdapter] ✅ Bot BERHASIL standby di Google Meet!');
        console.log('[GoogleMeetAdapter] 🔴 👉 Silakan klik tombol merah "2. RECORD" di Web Panel untuk mulai merekam & transkrip.');
        
        // Start continuous participant scanner to detect all room participants immediately
        this.startParticipantScanner();

        return true;
      } catch (err) {
        console.warn('[GoogleMeetAdapter] Join button check error:', err);
        return false;
      }

    } catch (error) {
      console.error(`[GoogleMeetAdapter] Gagal bergabung:`, error);
      return false;
    }
  }

  async startAudioCapture(): Promise<Readable> {
    this.audioStream = new PassThrough();
    this.isCapturingAudio = true;
    console.log(`[GoogleMeetAdapter] Mengaktifkan penangkap transkripsi real-time & audio...`);

    // PENTING: Jangan pernah jalankan DOM caption-scraper BERSAMAAN dengan
    // pipeline audio -> Deepgram. Keduanya sama-sama emit 'transcript_data',
    // dan caption-scraper Meet menangkap ULANG seluruh blok caption yang terus
    // bertambah setiap 500ms, sehingga banjir ribuan kata duplikat per menit.
    // Gunakan caption-scraper HANYA sebagai fallback saat Deepgram tidak ada.
    const hasDeepgramKey = !!process.env.DEEPGRAM_API_KEY &&
      process.env.DEEPGRAM_API_KEY !== 'YOUR_DEEPGRAM_API_KEY';

    if (this.page) {
      // 1. Klik tombol Turn on Captions (CC) di Google Meet
      try {
        await this.page.keyboard.press('c');
        const ccBtn = await this.page.$('button[aria-label*="caption" i], button[aria-label*="teks" i], button[jsname="r8qRAd"], [data-tooltip*="caption" i]');
        if (ccBtn) {
          await ccBtn.click().catch(() => {});
          console.log('[GoogleMeetAdapter] Tombol CC Google Meet ditekan.');
        }
      } catch (e) {}

      // 2. Setup AudioContext & MediaStream Capture di dalam tab Google Meet
      await this.page.evaluate(`(() => {
        try {
          if (typeof window.__name === 'undefined') {
            window.__name = function(t) { return t; };
          }
          const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtxClass) {
            console.error('[GMeet Audio Hook] AudioContext tidak tersedia di halaman ini.');
            return;
          }

          if (window.__gmeetAudioInited) {
            console.log('[GMeet Audio Hook] Master Audio Mixer sudah aktif sebelumnya.');
            return;
          }
          window.__gmeetAudioInited = true;

          const audioCtx = new AudioCtxClass();
          window.__gmeetAudioCtx = audioCtx;
          audioCtx.resume().catch(() => {});

          const targetSampleRate = 16000;

          // MASTER MIXER: Menggabungkan semua suara peserta & tab share ke 1 jalur bersih
          const masterMixer = audioCtx.createGain();
          masterMixer.gain.value = 1.5; // Optimal gain boost agar audio jelas

          // PROCESSOR TUNGGAL: Mencegah collision/tabrakan audio antar elemen media
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          const muteGain = audioCtx.createGain();
          muteGain.gain.value = 0; // Mencegah audio playback feedback di headless browser

          masterMixer.connect(processor);
          processor.connect(muteGain);
          muteGain.connect(audioCtx.destination);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const ratio = e.inputBuffer.sampleRate / targetSampleRate;
            const newLength = Math.round(inputData.length / ratio);
            const result = new Int16Array(newLength);
            
            // Linear interpolation downsampling untuk kualitas audio murni & mulus
            for (let i = 0; i < newLength; i++) {
              const srcIdx = i * ratio;
              const idx1 = Math.floor(srcIdx);
              const idx2 = Math.min(idx1 + 1, inputData.length - 1);
              const frac = srcIdx - idx1;
              const val = inputData[idx1] * (1 - frac) + inputData[idx2] * frac;
              const s = Math.max(-1, Math.min(1, val));
              result[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            let hasSound = false;
            for (let i = 0; i < result.length; i++) {
              if (Math.abs(result[i]) > 70) {
                hasSound = true;
                break;
              }
            }

            let binary = '';
            const bytes = new Uint8Array(result.buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const b64 = btoa(binary);

            if (window.sendAudioChunkToNode) {
              window.sendAudioChunkToNode(b64, hasSound);
            }
          };

          const hookAllMedia = () => {
            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }
            const mediaElements = Array.from(document.querySelectorAll('audio, video'));
            mediaElements.forEach((el) => {
              el.volume = 1.0;
              el.muted = false;

              if (el.__audioHooked && el.__lastSrcObject === el.srcObject) return;

              try {
                let source = null;
                if (el.srcObject && el.srcObject instanceof MediaStream) {
                  source = audioCtx.createMediaStreamSource(el.srcObject);
                  console.log('[GMeet Audio Hook] ✅ Terhubung via MediaStream (' + el.tagName + ') ke Master Mixer');
                } else if (!el.__audioHooked) {
                  source = audioCtx.createMediaElementSource(el);
                  console.log('[GMeet Audio Hook] ✅ Terhubung via MediaElement (' + el.tagName + ') ke Master Mixer');
                }

                if (source) {
                  el.__audioHooked = true;
                  el.__lastSrcObject = el.srcObject;
                  source.connect(masterMixer);
                }
              } catch (e) {
                el.__audioHooked = true;
                el.__lastSrcObject = el.srcObject;
              }
            });
          };

          hookAllMedia();
          setInterval(hookAllMedia, 1000);
          console.log('[GMeet Audio Hook] 🚀 Master Audio Mixer aktif & mendengarkan seluruh suara meeting.');
        } catch (err) {
          console.error('[Google Meet Engine] Audio init error:', err && err.message ? err.message : err);
        }
      })()`);

      // 3. Node.js Active DOM Subtitle Polling (Scrapes Google Meet Subtitles directly from page)
      //
      // CATATAN PENTING: blok ini HANYA berjalan sebagai fallback ketika tidak ada
      // DEEPGRAM_API_KEY. Jika berjalan bersamaan dengan pipeline audio->Deepgram,
      // kedua sumber sama-sama emit 'transcript_data' tanpa koordinasi -> hasil
      // transkrip campur aduk & speaker tidak jelas siapa yang bicara.
      //
      // Blok ini juga sudah diperbaiki agar TIDAK mengirim ulang seluruh blok
      // caption yang terus bertambah setiap poll (itulah penyebab lama "60.000 kata
      // dalam semenit"): sekarang setiap container caption dilacak teksnya
      // masing-masing (bukan satu string global), dan hanya BAGIAN BARU (suffix)
      // yang dikirim, dengan jeda stabilisasi supaya tidak mengirim potongan
      // kalimat yang belum selesai diucapkan.
      if (!hasDeepgramKey) {
        const lastTextByContainer = new Map<number, string>();
        const pendingStable = new Map<number, { text: string; ticks: number }>();
        const STABLE_TICKS_REQUIRED = 2; // ~1s tanpa perubahan = anggap final

        this.pollInterval = setInterval(async () => {
          if (!this.page || !this.isCapturingAudio) return;

          try {
            const rawCaptions = await this.page.evaluate(`(() => {
              const results = [];
              const captionContainers = Array.from(
                document.querySelectorAll('.a4bMb, div[jsname="ysn7bc"], .T4LgNb, div[jscontroller="D1tHje"], .iOno7')
              );

              captionContainers.forEach((container, index) => {
                const fullText = container.textContent ? container.textContent.trim() : '';
                if (fullText.length <= 2) return;

                let speaker = 'Speaker';
                const parent = container.closest('[class*="T4LgNb"], [class*="nMxPwe"], [class*="VbkSUe"]');
                const speakerNode = parent ? parent.querySelector('[class*="zs75Ib"], [class*="MsqM1e"], [class*="KcIKyf"], .notranslate') : null;
                if (speakerNode && speakerNode.textContent) {
                  speaker = speakerNode.textContent.trim();
                }

                let cleanText = fullText;
                if (cleanText.startsWith(speaker)) {
                  cleanText = cleanText.substring(speaker.length).replace(/^[\\s:-]+/, '').trim();
                }

                if (cleanText.length > 1) {
                  results.push({ index: index, speaker: speaker, text: cleanText });
                }
              });

              return results;
            })()`) as Array<{ index: number; speaker: string; text: string }> | null;

            if (!rawCaptions || rawCaptions.length === 0) return;

            for (const item of rawCaptions) {
              const previous = lastTextByContainer.get(item.index) || '';
              if (item.text === previous) {
                // Belum berubah sejak poll terakhir -> hitung sebagai "stabil".
                const pending = pendingStable.get(item.index);
                if (pending && pending.text === item.text) {
                  pending.ticks++;
                } else {
                  pendingStable.set(item.index, { text: item.text, ticks: 1 });
                }
                continue;
              }

              // Teks berubah (masih diucapkan) -> reset stabilisasi, jangan kirim dulu.
              pendingStable.set(item.index, { text: item.text, ticks: 1 });
              lastTextByContainer.set(item.index, item.text);
            }

            // Kirim hanya baris yang sudah stabil (tidak berubah selama beberapa poll)
            // dan belum pernah dikirim sebelumnya.
            for (const [index, pending] of pendingStable.entries()) {
              if (pending.ticks < STABLE_TICKS_REQUIRED) continue;
              const item = rawCaptions.find((r) => r.index === index);
              if (!item) continue;

              const alreadySent = (this as any)[`__sent_${index}`];
              if (alreadySent === pending.text) continue;
              (this as any)[`__sent_${index}`] = pending.text;

              const speakerName = item.speaker || 'Speaker 1';
              if (speakerName && speakerName !== 'Speaker' && !speakerName.toLowerCase().startsWith('speaker ')) {
                this.discoveredParticipants.add(speakerName);
              }

              console.log(`[Google Meet Live Subtitle] ${speakerName}: "${pending.text}"`);

              const isEnglish = /[a-zA-Z]{4,}/.test(pending.text) && /\b(the|is|and|to|in|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|have|from|or|one|had|by|word|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|write|go|see|number|no|way|could|people|my|than|first|water|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/i.test(pending.text);
              const isIndo = /\b(dan|yang|di|ke|dari|ini|itu|untuk|dengan|pada|adalah|sebagai|kita|saya|anda|kamu|mereka|sudah|bisa|akan|tidak|juga|ada|dalam|karena|atau|saat|oleh|secara|hari|bagi|hanya|setelah|serta|tersebut|bila|jika|agar|supaya|kami|selamat|pagi|siang|malam)\b/i.test(pending.text);

              let detectedLang: 'id' | 'en' | 'mixed' = 'id';
              if (isEnglish && isIndo) detectedLang = 'mixed';
              else if (isEnglish) detectedLang = 'en';

              const now = new Date();
              const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

              if (this.io) {
                this.io.emit('transcript_data', {
                  id: `meet-${Date.now()}-${index}-${Math.random()}`,
                  meetingId: 'live-meet',
                  speaker: speakerName,
                  speakerId: index,
                  timestamp,
                  text: pending.text,
                  isFinal: true,
                  language: detectedLang,
                  confidence: 0.98,
                  createdAt: Date.now(),
                });
              }
            }

            // Periodically scan participants from DOM every ~2 seconds (4 ticks @ 500ms)
            this.participantPollTicks++;
            if (this.participantPollTicks % 4 === 0 && this.page) {
              const domNames = await this.page.evaluate(() => {
                const names: string[] = [];
                const tileEls = document.querySelectorAll(
                  '[data-self-name], span[jsname="W297wb"], span[class*="zWGUib"], div[class*="cS7aqe"], div[data-participant-id], div[data-requested-participant-id]'
                );
                tileEls.forEach((el) => {
                  const text = el.textContent?.trim();
                  if (text && text.length > 1 && text.length < 50 && !text.includes('\n') && text !== 'You' && text !== 'Anda') {
                    names.push(text);
                  }
                  const selfName = el.getAttribute('data-self-name');
                  if (selfName && selfName.trim() && selfName !== 'You' && selfName !== 'Anda') {
                    names.push(selfName.trim());
                  }
                });

                const listItems = document.querySelectorAll('div[role="listitem"] span[class*="zWGUib"], div[role="listitem"] span');
                listItems.forEach((el) => {
                  const text = el.textContent?.trim();
                  if (text && text.length > 1 && text.length < 50 && !text.includes('\n') && text !== 'You' && text !== 'Anda') {
                    names.push(text);
                  }
                });

                return Array.from(new Set(names));
              }).catch(() => [] as string[]);

              if (domNames && Array.isArray(domNames)) {
                domNames.forEach((name) => {
                  if (name && typeof name === 'string' && name.trim().length > 1) {
                    this.discoveredParticipants.add(name.trim());
                  }
                });
              }

              if (this.io && this.discoveredParticipants.size > 0) {
                this.io.emit('participants_update', {
                  count: this.discoveredParticipants.size,
                  participants: Array.from(this.discoveredParticipants),
                });
              }
            }
          } catch (pollErr) {}
        }, 500);
      }
    }

    return this.audioStream;
  }

  /**
   * Filter out bot names, icon ligatures (e.g. computer_arrow_up, volume_up),
   * strip system suffixes e.g. (You, presenting...), and deduplicate presentations.
   */
  private cleanAndFilterParticipants(rawNames: string[]): string[] {
    const botNameLower = (this.botDisplayName || 'botnotulen').toLowerCase().trim();

    const isIconOrSystemWord = (str: string) => {
      const lower = str.toLowerCase().trim();
      // Material Icon ligatures typically contain underscores e.g. volume_up, computer_arrow_up, keep_off
      if (lower.includes('_') && /^[a-z0-9_]+$/.test(lower)) return true;
      
      const blacklist = [
        'computer_arrow_up', 'volume_up', 'keep_off', 'mic_off', 'more_vert',
        'push_pin', 'call_end', 'videocam_off', 'videocam', 'mic', 'screen_share',
        'closed_caption', 'fullscreen', 'tune', 'info', 'chat', 'people', 'peserta',
        'contributors', 'contributor', 'meeting host', 'your presentation', 'presentation',
        'mempresentasikan', 'in call', 'in the call', 'add people', 'tambahkan orang',
        'pin', 'mute', 'unmute', 'speaker', 'speaker 1', 'speaker 2', 'speaker 3', 'you', 'anda',
        'arrow_up', 'arrow_down', 'check', 'close', 'edit', 'delete'
      ];
      if (blacklist.includes(lower)) return true;
      if (/^\d+$/.test(lower)) return true; // pure numbers
      return false;
    };

    const isBot = (name: string) => {
      const lower = name.toLowerCase().trim();
      if (!lower) return true;
      if (
        lower.includes(botNameLower) ||
        lower.startsWith('botnotul') ||
        lower.includes('botnotulen') ||
        lower.includes('ai note-taker') ||
        lower.includes('notetaker') ||
        lower === 'bot' ||
        lower === 'ai bot' ||
        lower.includes('botnotulenlui')
      ) {
        return true;
      }
      return false;
    };

    const cleanedList: string[] = [];
    for (const n of rawNames) {
      let s = (n || '').trim();
      // Remove annotations e.g. (You), (Your presentation), (Meeting host), etc.
      s = s.replace(/\s*\((?:You|Anda|Your presentation|Presenting|Mempresentasikan|Presentation|Host|Meeting host|Penyelenggara|annot[^\)]*)\)/gi, '').trim();
      s = s.replace(/(?:Your presentation|Meeting host|Mempresentasikan)/gi, '').trim();
      s = s.replace(/[\r\n\t]+/g, ' ').trim();
      if (s.length > 1 && !isIconOrSystemWord(s) && !isBot(s)) {
        cleanedList.push(s);
      }
    }

    // Resolusi nama terpotong dari kandidat nama terpanjang
    const fullCandidates = Array.from(new Set(cleanedList)).sort((a, b) => b.length - a.length);

    const resolveCanonical = (name: string): string => {
      const cleanCand = name.replace(/\.{2,}$/, '').trim().toLowerCase();
      if (!cleanCand) return name;
      const match = fullCandidates.find((full) => {
        const lowerFull = full.toLowerCase();
        return lowerFull !== cleanCand && (lowerFull.startsWith(cleanCand) || lowerFull.includes(cleanCand));
      });
      return match || name.replace(/\.{2,}$/, '').trim();
    };

    const result: string[] = [];
    for (const item of cleanedList) {
      const canonical = resolveCanonical(item);
      if (canonical && !result.some((existing) => existing.toLowerCase() === canonical.toLowerCase())) {
        result.push(canonical);
      }
    }

    return result;
  }

  /**
   * Starts a background scanner that continuously inspects Google Meet DOM
   * to detect all active participants in the room, regardless of whether they speak.
   */
  public startParticipantScanner(): void {
    if (this.participantInterval) return;

    this.participantInterval = setInterval(async () => {
      if (!this.page) return;

      try {
        const scanData = await this.page.evaluate(() => {
          const names: string[] = [];
          let presenter: string | null = null;

          // Helper to check if node is an icon
          const isIconNode = (el: Element) => {
            const cls = (el.className || '').toString().toLowerCase();
            if (cls.includes('google-symbols') || cls.includes('material-icons')) return true;
            if (el.getAttribute('aria-hidden') === 'true') return true;
            return false;
          };

          // 0. Deteksi Presenter / Share Screen Tile
          const allTextEls = document.querySelectorAll('span.zWGUib, span[jsname="W297wb"], div.cS7aqe, div[data-self-name], div[role="listitem"]');
          allTextEls.forEach((el) => {
            const txt = (el.textContent || '').trim();
            const presMatch = txt.match(/^(.*?)\s*\((?:Presentation|Mempresentasikan|Your presentation|Presentasi Anda)\)/i) ||
                             txt.match(/^(.*?)\s+(?:is presenting|sedang mempresentasikan)/i);
            if (presMatch && presMatch[1]?.trim() && !presenter) {
              presenter = presMatch[1].trim();
            }
          });

          // 1. Top bar presentation / active speaker / self badge
          const topLabels = document.querySelectorAll('div[data-self-name]');
          topLabels.forEach((el) => {
            const selfName = el.getAttribute('data-self-name');
            if (selfName && selfName.trim() && !isIconNode(el)) names.push(selfName.trim());
          });

          // 2. Video Tiles and Tile Name Badges (only specific text container spans)
          const tileEls = document.querySelectorAll(
            'div[data-self-name], span[jsname="W297wb"], span.zWGUib, div.cS7aqe, span.notranslate'
          );
          tileEls.forEach((el) => {
            if (isIconNode(el)) return;
            const selfName = el.getAttribute('data-self-name');
            if (selfName && selfName.trim()) {
              names.push(selfName.trim());
            } else {
              const text = el.textContent?.trim();
              if (text && text.length > 1 && text.length < 50 && !text.includes('\n')) {
                names.push(text);
              }
            }
          });

          // 3. Side Panel (People / Contributors list)
          const listItems = document.querySelectorAll('div[role="listitem"] span.zWGUib, div[role="listitem"] span[jsname="W297wb"], div[role="listitem"] span.notranslate');
          listItems.forEach((el) => {
            if (isIconNode(el)) return;
            const text = el.textContent?.trim();
            if (text && text.length > 1 && text.length < 50 && !text.includes('\n')) {
              names.push(text);
            }
          });

          return { names: Array.from(new Set(names)), presenter };
        }).catch(() => ({ names: [] as string[], presenter: null as string | null }));

        if (scanData.names && Array.isArray(scanData.names)) {
          scanData.names.forEach((n) => {
            if (n && typeof n === 'string') {
              this.discoveredParticipants.add(n);
            }
          });
        }

        if (scanData.presenter) {
          const cleanedPres = this.cleanAndFilterParticipants([scanData.presenter])[0];
          if (cleanedPres) {
            this.currentPresenter = cleanedPres;
          }
        }

        let filtered = this.cleanAndFilterParticipants(Array.from(this.discoveredParticipants));

        // Jika ada presenter terdeteksi (sedang share screen), tempatkan di posisi utama
        if (this.currentPresenter) {
          const pIdx = filtered.findIndex((p) => p.toLowerCase() === this.currentPresenter?.toLowerCase());
          if (pIdx > 0) {
            const [pres] = filtered.splice(pIdx, 1);
            filtered.unshift(pres);
          } else if (pIdx === -1) {
            filtered.unshift(this.currentPresenter);
          }
        }

        if (this.io && filtered.length > 0) {
          this.io.emit('participants_update', {
            count: filtered.length,
            participants: filtered,
            presenter: this.currentPresenter,
          });
        }
      } catch (err) {}
    }, 2000);
  }

  async stopAudioCapture(): Promise<void> {
    this.isCapturingAudio = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.audioStream) {
      this.audioStream.end();
      this.audioStream = null;
    }
  }

  async setMute(mute: boolean): Promise<void> {
    if (!this.page) return;
    try {
      const micButton = await this.page.$('[aria-label*="microphone"], [aria-label*="mikrofon"]');
      if (micButton) await micButton.click();
    } catch (err) {}
  }

  async getParticipants(): Promise<ParticipantInfo[]> {
    if (this.page) {
      try {
        // Try opening the People panel once if it's available and not open
        try {
          const peopleBtn = await this.page.$('button[aria-label*="people" i], button[aria-label*="orang" i], button[aria-label*="peserta" i], button[aria-label*="Show everyone" i], button[data-panel-id="1"]');
          if (peopleBtn) {
            await peopleBtn.click().catch(() => {});
            await this.page.waitForTimeout(300);
          }
        } catch (e) {}

        const domNames = await this.page.evaluate(() => {
          const names: string[] = [];
          const isIconNode = (el: Element) => {
            const cls = (el.className || '').toString().toLowerCase();
            if (cls.includes('google-symbols') || cls.includes('material-icons')) return true;
            if (el.getAttribute('aria-hidden') === 'true') return true;
            return false;
          };

          const els = document.querySelectorAll(
            'div[data-self-name], span[jsname="W297wb"], span.zWGUib, div.cS7aqe, div[role="listitem"] span.zWGUib, div[role="listitem"] span.notranslate'
          );
          els.forEach((el) => {
            if (isIconNode(el)) return;
            const selfName = el.getAttribute('data-self-name');
            if (selfName && selfName.trim()) {
              names.push(selfName.trim());
            } else {
              const text = el.textContent?.trim();
              if (text && text.length > 1 && text.length < 50 && !text.includes('\n')) {
                names.push(text);
              }
            }
          });
          return Array.from(new Set(names));
        }).catch(() => [] as string[]);

        if (domNames && Array.isArray(domNames)) {
          domNames.forEach((n) => {
            if (n) this.discoveredParticipants.add(n);
          });
        }
      } catch (err) {}
    }

    const filtered = this.cleanAndFilterParticipants(Array.from(this.discoveredParticipants));

    if (this.currentPresenter) {
      const pIdx = filtered.findIndex((p) => p.toLowerCase() === this.currentPresenter?.toLowerCase());
      if (pIdx > 0) {
        const [pres] = filtered.splice(pIdx, 1);
        filtered.unshift(pres);
      } else if (pIdx === -1) {
        filtered.unshift(this.currentPresenter);
      }
    }

    if (filtered.length > 0) {
      return filtered.map((name, idx) => ({
        id: String(idx + 1),
        name,
        isMuted: false,
        isHost: idx === 0,
      }));
    }

    return [{ id: '1', name: 'Meeting Participant', isMuted: false, isHost: true }];
  }

  async leave(): Promise<void> {
    console.log(`[GoogleMeetAdapter] Mengirim sinyal keluar ke Google Meet dan mematikan instance...`);
    try {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
      if (this.participantInterval) {
        clearInterval(this.participantInterval);
        this.participantInterval = null;
      }

      if (this.page) {
        try {
          await this.page.evaluate(`(() => {
            const leaveButtons = Array.from(document.querySelectorAll('button[aria-label*="Leave" i], button[aria-label*="Keluar" i], button[data-tooltip*="Leave" i], button[jsname="CQylAd"], [aria-label*="call_end" i]'));
            for (const btn of leaveButtons) {
              btn.click();
            }
            window.location.href = 'about:blank';
          })()`).catch(() => {});

          await this.page.waitForTimeout(300);
          await this.page.close().catch(() => {});
        } catch {}
      }

      if (this.context) {
        await this.context.close().catch(() => {});
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
      }
    } catch (err) {
      console.warn('[GoogleMeetAdapter] Cleanup error:', err);
    } finally {
      this.page = null;
      this.context = null;
      this.browser = null;
      this.isCapturingAudio = false;
      if (this.audioStream) {
        this.audioStream.end();
        this.audioStream = null;
      }
      console.log(`[GoogleMeetAdapter] ✅ Bot telah resmi keluar dari room.`);
    }
  }
}

