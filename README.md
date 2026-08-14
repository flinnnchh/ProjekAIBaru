# 🎙️ AI Meeting Bot Controller (Google Meet, Zoom, MS Teams) & Live Transcriber

Aplikasi Web modern untuk mengontrol Bot Meeting otomatis dan transkripsi bilingual real-time menggunakan **Deepgram Nova-2** (Bahasa Indonesia, English, dan Campuran/Code-Switching), didesain dengan prinsip **8 Golden Rules of Interface Design**, dukungan koneksi VPN privat perusahaan, manajemen jadwal, riwayat, serta ekspor dokumen resmi (.DOCX Word & .TXT).

---

## 🚀 Fitur Utama

### 1. Panel Kontrol Live Sesi (8 Golden Rules of Interface Design)
- **Consistency**: Ikonografi dan skema warna standar industri media player (*Record: Merah, Pause: Kuning, Stop: Biru, Join: Hijau*).
- **Shortcuts**: Akses cepat keyboard hotkeys:
  - `Ctrl + J`: Join Room Meeting
  - `Ctrl + R`: Mulai Rekam (Record) & Live Transcriber
  - `Spacebar`: Pause / Resume Rekaman
  - `Ctrl + S`: Stop & Save Rekaman
  - `Ctrl + Shift + T`: Ekspor Cepat ke `.TXT`
  - `Ctrl + Shift + D`: Ekspor Cepat ke `.DOCX` (Word)
  - `?`: Panduan Pintasan Keyboard
- **Informative Feedback**: Indikator rekaman live berkedip (*Live Pulse*), timer waktu berjalan, visualizer bar audio real-time, dan status VPN perusahaan (*Connected/Encrypted*).
- **Dialogs to Yield Closure**: Modal sukses setelah Stop dengan ringkasan durasi, jumlah kata, daftar pembicara, dan tombol download instan `.DOCX` & `.TXT`.
- **Prevent Errors**: State machine presisi (tombol disabled sesuai tahapan koneksi bot untuk mencegah klik tak disengaja).
- **Permit Easy Reversal**: Fitur Pause/Resume mulus tanpa merusak urutan transkrip atau memecah file.
- **Keep Users in Control**: Kontrol penuh untuk mengeluarkan bot (*Leave Room*) atau menghentikan rekaman kapan saja secara manual.
- **Reduce Memory Load**: Seluruh metrik penting (URL Meet, platform, status VPN, audio input, durasi, transkrip) terpampang dalam 1 layar komando.

### 2. Live Transcriber Multilingual (Deepgram Nova-2)
- Mendukung transkripsi bahasa **Indonesia (`id`)**, **Inggris (`en`)**, dan **Campuran (*Code-Switching*)**.
- **Speaker Diarization**: Otomatis mendeteksi pergantian orang yang berbicara (`Speaker 1`, `Speaker 2`, dst.).
- **Smart Formatting & Punctuation**: Tanda baca otomatis dan format teks rapi.
- Mode **Streaming Token Sub-300ms**: Teks berjalan kata per kata saat peserta meeting berbicara.

### 3. Manajemen Jadwal & Riwayat
- **Jadwal Meeting**: Tambah jadwal bot dengan opsi *Auto-record*, platform selector (Google Meet, Zoom, Teams), dan tombol langsung *Buka Sesi Live*.
- **Riwayat Rekaman**: Arsip lengkap meeting masa lalu, viewer transkrip interaktif, dan tombol download ulang dokumen `.DOCX` / `.TXT`.

### 4. Ekspor Dokumen Resmi
- **Format .DOCX (Microsoft Word)**: Dilengkapi kop dokumen resmi, tabel metadata meeting (Topik, Platform, Tanggal, Durasi, Total Kata, Partisipan, Status VPN), serta format dialog percakapan rapi.
- **Format .TXT**: Plain text terstruktur dengan timestamp.

---

## 🛠️ Cara Menjalankan Aplikasi

### 1. Jalankan Frontend Web Dashboard
```bash
npm run dev
```
Buka browser di: `http://localhost:5173`

### 2. (Opsional) Jalankan Backend Orchestrator & Live Bot Engine
Salin `.env.example` ke `.env` dan masukkan API Key Deepgram Anda:
```bash
cp .env.example .env
npm run server
```

---

## 📂 Struktur Direktori Proyek

```
├── src/
│   ├── components/
│   │   ├── common/       # Button, Badge, Toasts
│   │   ├── history/      # HistoryList, TranscriptViewerModal
│   │   ├── layout/       # Navbar, VpnStatusBadge
│   │   ├── live/         # LiveControlPanel, LiveTranscriber, AudioVisualizer, ClosureDialog, HotkeyGuideModal
│   │   └── schedule/     # ScheduleList, ScheduleModal
│   ├── hooks/            # useHotkeys, useMeetingBot
│   ├── services/         # exportDocx, exportTxt, storageService, socketClient
│   ├── types/            # meeting, transcript
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── adapters/         # IMeetingBotAdapter, GoogleMeetAdapter, ZoomAdapter, TeamsAdapter
│   ├── deepgramService.ts# Live Deepgram Streaming STT Service
│   ├── vpnManager.ts     # Corporate VPN Monitoring
│   └── server.ts         # Express & Socket.io Server
```
