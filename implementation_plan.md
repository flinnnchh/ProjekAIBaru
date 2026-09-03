# Toggle Live Transcribe + Post-Meeting Batch Processing + Animasi Loading AI

Mengubah UX flow agar lebih clean: Landing page hanya menampilkan **Panel Kontrol Bot** tanpa Live Transcriber. Saat user klik **JOIN**, muncul **Popup Modal** untuk memilih mode transkripsi. Setelah meeting selesai, audio diproses batch oleh AI untuk hasil akurasi maksimum, dengan animasi loading kertas & pulpen yang premium.

---

## Ringkasan Perubahan UX Flow

```
SEBELUMNYA:
  Landing Page → [Panel Kontrol] + [Live Transcriber] → klik JOIN → Bot join → RECORD → teks live muncul

SEKARANG:
  Landing Page → [Panel Kontrol SAJA] → klik JOIN → 💬 POPUP MODAL pilih mode → Bot join
    ├─ Mode "Live Transcribe" → Panel Live Transcriber muncul → teks real-time
    └─ Mode "Background"     → Placeholder elegan "Bot merekam di background..."
  → Klik STOP → Animasi Loading Kertas & Pulpen → Transkrip final muncul seutuhnya
```

---

## Proposed Changes

### Komponen Baru

#### [NEW] [TranscribeModePicker.tsx](file:///c:/10123121/ProjekAIBaru/src/components/live/TranscribeModePicker.tsx)
Popup modal yang muncul saat user klik **JOIN**. Berisi 2 pilihan kartu:

- **Kartu 1: "Live Transcribe (Real-Time)"**
  - Ikon: `subtitles` (Material Icon)  
  - Deskripsi: "Teks transkrip muncul real-time saat meeting berlangsung. Cocok untuk koneksi stabil."
  - Warna aksen: Cyan (`#3DD6E8`)

- **Kartu 2: "Background Mode (Post-Meeting)"**  
  - Ikon: `cloud_sync` (Material Icon)
  - Deskripsi: "Bot merekam di background. Transkrip akurasi tinggi tersedia setelah meeting selesai. Hemat bandwidth."
  - Warna aksen: Gold (`#F5B400`)

- Tombol **"Mulai & Join Meeting"** di bawah setelah user memilih salah satu
- Desain glassmorphism sesuai design system yang sudah ada (`.glass-card-strong`)

#### [NEW] [TranscriptProcessingLoader.tsx](file:///c:/10123121/ProjekAIBaru/src/components/live/TranscriptProcessingLoader.tsx)
Komponen animasi loading AI premium yang tampil saat batch processing:
- Animasi utama: **Ikon kertas (SVG) dengan pulpen bergerak mencatat** (CSS keyframe animation)
- Progress step dinamis yang berganti teks secara bertahap:
  - Step 1: "🎧 Menganalisis gelombang audio & mengenali pembicara..."
  - Step 2: "✍️ Menyempurnakan tanda baca & merapikan transkrip..."  
  - Step 3: "✨ Menyusun notulen rapat & daftar tugas..."
- Efek glow/sparkle bernuansa AI di sekeliling animasi
- Transisi smooth ke halaman hasil saat selesai

---

### Modifikasi File yang Ada

#### [MODIFY] [App.tsx](file:///c:/10123121/ProjekAIBaru/src/App.tsx)
**Perubahan yang dilakukan:**
- **HAPUS** render `<LiveTranscriber>` yang langsung muncul di landing page (line ~164-173)
- **TAMBAHKAN** state `transcribeMode: 'live' | 'background' | null` (null = belum memilih)
- **TAMBAHKAN** state `showModePicker: boolean` untuk mengontrol popup modal
- **TAMBAHKAN** state `isProcessingBatch: boolean` untuk mengontrol animasi loading
- **UBAH** logika: `<LiveTranscriber>` hanya dirender jika `transcribeMode === 'live'` DAN bot sudah dalam sesi (bukan IDLE)
- **TAMBAHKAN** render `<TranscribeModePicker>` (popup modal) yang muncul saat `showModePicker === true`
- **TAMBAHKAN** render `<TranscriptProcessingLoader>` yang muncul saat `isProcessingBatch === true`
- **TAMBAHKAN** placeholder "Bot sedang merekam di background..." jika `transcribeMode === 'background'` dan bot sedang recording

#### [MODIFY] [LiveControlPanel.tsx](file:///c:/10123121/ProjekAIBaru/src/components/live/LiveControlPanel.tsx)
**Perubahan yang dilakukan:**
- **UBAH** handler tombol JOIN: alih-alih langsung memanggil `onJoin()`, sekarang memanggil prop baru `onJoinClick()` yang akan membuka popup modal `TranscribeModePicker` terlebih dahulu
- Sisa komponen **TIDAK BERUBAH** (tetap sama)

#### [MODIFY] [useMeetingBot.ts](file:///c:/10123121/ProjekAIBaru/src/hooks/useMeetingBot.ts)
**Perubahan yang dilakukan:**
- **TAMBAHKAN** state `transcribeMode` dan `isProcessingBatch`
- **MODIFIKASI** `handleStop`:
  - Set `isProcessingBatch = true`
  - Emit `bot_stop` ke server
  - JANGAN langsung simpan history & buka ClosureDialog
  - Tunggu event `batch_result` dari server
- **TAMBAHKAN** handler `handleBatchResult`: dipanggil saat menerima `batch_result` dari socket
  - Replace `transcripts` dengan hasil batch
  - Set `isProcessingBatch = false`
  - Simpan ke history & buka ClosureDialog
- **TAMBAHKAN** listener untuk event socket `batch_processing_progress` dan `batch_result` di `initSocket`
- **EXPORT** state baru: `transcribeMode`, `setTranscribeMode`, `isProcessingBatch`, `batchProgress`

#### [MODIFY] [socketClient.ts](file:///c:/10123121/ProjekAIBaru/src/services/socketClient.ts)
**Perubahan yang dilakukan:**
- **TAMBAHKAN** parameter callback baru di `initSocket()`:
  - `onBatchProgress: (step: number, message: string) => void`
  - `onBatchResult: (transcripts: TranscriptItem[]) => void`
- **TAMBAHKAN** listener `socket.on('batch_processing_progress', ...)` dan `socket.on('batch_result', ...)`

---

### Backend

#### [MODIFY] [server.ts](file:///c:/10123121/ProjekAIBaru/server/server.ts)
**Perubahan yang dilakukan:**
- **MODIFIKASI** handler `bot_record`: tambahkan logic untuk mulai menyimpan audio chunks ke file secara paralel via `deepgramService.startAudioSave()`
- **MODIFIKASI** handler `bot_stop`:
  - Setelah menghentikan live stream, panggil `deepgramService.processBatchTranscription(lang)`
  - Emit `batch_processing_progress` ke frontend selama proses
  - Emit `batch_result` dengan transkrip final ke frontend saat selesai
  - Jika batch gagal, emit `batch_result` dengan data kosong (frontend fallback ke hasil live)

#### [MODIFY] [deepgramService.ts](file:///c:/10123121/ProjekAIBaru/server/deepgramService.ts)
**Perubahan yang dilakukan:**
- **TAMBAHKAN** property `private audioChunks: Buffer[]` untuk menyimpan audio chunks di memory
- **TAMBAHKAN** method `startAudioSave()`: mulai mengumpulkan audio chunks ke `this.audioChunks`
- **TAMBAHKAN** method `async processBatchTranscription(lang: string)`: 
  - Gabungkan semua audio chunks menjadi 1 Buffer
  - Kirim ke Deepgram Pre-recorded API (`this.deepgram.listen.prerecorded()`) dengan opsi:
    - `model: 'nova-2'`, `smart_format: true`, `punctuate: true`, `diarize: true`, `paragraphs: true`
  - Parse response menjadi array `TranscriptItem[]`
  - Return hasil transkrip
  - Bersihkan `audioChunks` setelah selesai
- **MODIFIKASI** method `startLiveStream()`: tambahkan panggilan `this.audioChunks.push(chunk)` di dalam listener `audioStream.on('data')` untuk menyimpan audio secara paralel

---

### Styling

#### [MODIFY] [index.css](file:///c:/10123121/ProjekAIBaru/src/index.css)
**Perubahan yang dilakukan:**
- **TAMBAHKAN** `@keyframes pen-writing` — animasi pulpen bergerak meliuk di atas kertas
- **TAMBAHKAN** `@keyframes ai-sparkle` — efek partikel/sparkle bernuansa AI
- **TAMBAHKAN** `.processing-card` — container card untuk animasi loading
- **TAMBAHKAN** `.mode-card` — styling untuk kartu pilihan mode di popup modal
- **TAMBAHKAN** `.mode-card.selected` — state terpilih dengan glow border

---

## Open Questions

> [!IMPORTANT]
> **Fallback saat Deepgram Pre-recorded API gagal:**
> Jika batch processing gagal (misal API error, timeout), sistem akan otomatis fallback ke hasil live transcribe yang sudah terkumpul (jika mode Live) atau menampilkan pesan error (jika mode Background). **Apakah ini sudah sesuai?**

> [!IMPORTANT]
> **Default pilihan mode di popup:**
> Apakah salah satu mode perlu di-highlight sebagai "Direkomendasikan"? Misalnya menambahkan badge "⭐ Recommended" pada mode Background karena akurasi lebih tinggi?

---

## Verification Plan

### Manual Verification
1. **Landing Page Bersih:** Buka web → pastikan hanya muncul Panel Kontrol, TIDAK ada Live Transcriber di bawahnya
2. **Popup Modal Muncul:** Isi URL → klik JOIN → pastikan popup pilihan mode muncul dengan 2 kartu pilihan
3. **Mode Live:** Pilih "Live Transcribe" → klik "Mulai & Join" → pastikan Live Transcriber panel muncul dan teks real-time mengalir
4. **Mode Background:** Pilih "Background Mode" → klik "Mulai & Join" → pastikan muncul placeholder "Bot merekam di background" (bukan Live Transcriber)
5. **Animasi Loading:** Klik STOP → pastikan animasi kertas & pulpen muncul → progress step berganti → transkrip final muncul seutuhnya
6. **Fallback:** Simulasikan batch error → pastikan fallback ke hasil live atau pesan error yang informatif
