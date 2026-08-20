# 🎙️ AI Meeting Bot Controller & Live Transcriber
### (Google Meet, Zoom, Microsoft Teams)

Aplikasi Web Full-Stack modern untuk mengontrol **Bot Meeting Otomatis** (berbasis Playwright Headless) dan **Live Transcriber Multilingual Real-Time** menggunakan **Deepgram Nova-2** (Bahasa Indonesia, English, dan Campuran/Code-Switching). 

Dibangun dengan standar **8 Golden Rules of Interface Design**, sistem autentikasi sesi akun Google terintegrasi (**Google Login Session State**), manajemen jadwal & arsip riwayat, serta ekspor dokumen notulen resmi format **.DOCX (Microsoft Word)** dan **.TXT**.

---

## 📑 Daftar Isi

- [✨ Fitur Unggulan](#-fitur-unggulan)
- [🏗️ Arsitektur & Cara Kerja Sistem](#️-arsitektur--cara-kerja-sistem)
- [🔐 Panduan Lengkap Login Session Google](#-panduan-lengkap-login-session-google)
- [📋 Prasyarat Sistem](#-prasyarat-sistem)
- [⚙️ Instalasi & Konfigurasi](#️-instalasi--konfigurasi)
- [🚀 Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [📖 Panduan Penggunaan Langkah demi Langkah](#-panduan-penggunaan-langkah-demi-langkah)
- [⌨️ Pintasan Keyboard (Hotkeys)](#️-pintasan-keyboard-hotkeys)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [❓ Troubleshooting & FAQ](#-troubleshooting--faq)

---

## ✨ Fitur Unggulan

### 1. 🔐 Google Account Login Session (Persistent Storage)
- **Satu Kali Login, Siap Selamanya**: Autentikasi akun Google resmi sekali melalui browser visual, dan sesi (*cookies & storage state*) tersimpan aman di file lokal `google_auth.json`.
- **Bypass Restriksi Google Meet**: Mencegah bot terblokir sebagai "Guest / Unverified User" atau tertahan di layar penolakan akses rapat.
- **Identitas Akun Resmi**: Bot bergabung ke ruang meeting dengan foto profil dan nama akun Google resmi Anda.

### 2. 🎛️ Panel Kontrol Live Sesi (8 Golden Rules of Interface Design)
- **Consistency**: Skema warna standar media player (*Join: Hijau, Record: Merah, Pause: Kuning, Stop: Biru, Leave: Merah-Tua*).
- **Shortcuts**: Akses komando kilat menggunakan keyboard (`Ctrl+J`, `Ctrl+R`, `Spacebar`, `Ctrl+S`, `Ctrl+Shift+D`, `Ctrl+Shift+T`, `?`).
- **Informative Feedback**: Indikator *Live Pulse* berkedip, visualizer bar audio real-time, timer rekaman presisi, dan status koneksi bot/VPN.
- **Dialogs to Yield Closure**: Modal konfirmasi selesai rekaman lengkap dengan statistik total durasi, jumlah kata, daftar partisipan/speaker, serta tombol download instan.
- **Prevent Errors**: Tombol otomatis terkunci/disabled sesuai tahapan alur bot untuk mencegah kesalahan klik (*anti-accidental click*).
- **Permit Easy Reversal**: Fitur Pause dan Resume transkrip mulus tanpa merusak urutan transkrip atau memecah file rekaman.
- **Keep Users in Control**: Operator memiliki kontrol penuh untuk menjeda, menghentikan rekaman, atau mengeluarkan bot dari room kapan saja.
- **Reduce Memory Load**: Seluruh informasi kritis (URL, platform, status VPN, audio waveform, transkrip berjalan) terpampang jelas dalam satu tampilan komando terpadu.

### 3. 🧠 Live Transcriber Multilingual (Deepgram Nova-2)
- **Bilingual & Code-Switching**: Mendukung transkripsi akurat Bahasa Indonesia (`id`), Bahasa Inggris (`en`), serta percakapan campuran (Bahasa Indonesia campur istilah Inggris).
- **Speaker Diarization**: Otomatis mendeteksi dan membedakan siapa yang sedang berbicara (*Speaker 0, Speaker 1, Speaker 2*, dst.).
- **Ultra-Low Latency (<300ms)**: Teks transkrip mengalir secara real-time (*streaming token*) kata demi kata saat partisipan berbicara.
- **Smart Punctuation & Formatting**: Tanda baca otomatis dan format huruf kapital yang rapi.

### 4. 📄 Ekspor Notulen Rapat Resmi
- **Format .DOCX (Microsoft Word)**: Dilengkapi kop dokumen resmi, tabel metadata meeting (*Topik, Platform, Tanggal, Durasi, Total Kata, Daftar Pembicara, Status Enkripsi VPN*), dan format dialog transkrip berpenanda waktu rapi.
- **Format .TXT**: Plain text terstruktur dengan penanda waktu (*timestamp*) untuk integrasi cepat.

### 5. 📅 Manajemen Jadwal & Arsip Riwayat
- **Jadwal Meeting**: Penjadwalan rapat mendatang dengan opsi *Auto-record* dan integrasi satu klik menuju ruang live.
- **Riwayat Rekaman**: Penyimpanan lokal aman untuk semua arsip transkrip masa lalu yang bisa dibuka kembali (*Viewer Interaktif*) dan diunduh ulang kapan saja.

---

## 🏗️ Arsitektur & Cara Kerja Sistem

```
┌─────────────────────────────────────────────────────────┐
│              Frontend Web Dashboard (React + Vite)       │
│  - Control Panel (Join/Record/Pause/Stop/Leave)         │
│  - Live Audio Waveform & Live Subtitle Stream           │
│  - Schedule & History Manager                           │
└────────────────────────────┬────────────────────────────┘
                             │ WebSocket (Socket.io)
┌────────────────────────────▼────────────────────────────┐
│         Backend Orchestrator (Node.js + Express)        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Playwright Headless Browser Engine                │  │
│  │ - Memuat sesi 'google_auth.json' (Login Session)  │  │
│  │ - Masuk ke Google Meet / Zoom / MS Teams          │  │
│  │ - Web Audio Master Mixer (Inject Script)          │  │
│  └─────────────────────────┬─────────────────────────┘  │
│                            │ Raw Audio Stream (PCM 16kHz)
│  ┌─────────────────────────▼─────────────────────────┐  │
│  │ Deepgram Nova-2 Live Streaming STT Service        │  │
│  │ - Transkripsi Multilingual (ID / EN)              │  │
│  │ - Speaker Diarization & Timestamp                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Panduan Lengkap Login Session Google

### Mengapa Memerlukan Login Session?
Google Meet menerapkan proteksi keamanan ketat untuk pengguna tamu (*Guest*):
1. **Mencegah "You can't join this meeting"**: Beberapa meeting organisasi/Google Workspace melarang akun tanpa login bergabung.
2. **Tanpa Persetujuan Berbelit (Host Admit)**: Jika menggunakan akun Google terdaftar yang diundang ke rapat, bot dapat masuk secara langsung.
3. **Nama & Identitas Resmi**: Bot tampil dengan nama dan foto akun Google yang Anda tentukan, bukan nama anonim.

---

### 📌 Langkah Melakukan Google Login Session

Aplikasi menyediakan skrip pembantu otomatis (**Google Auth Helper**) berbasis Playwright:

#### 1. Jalankan Skrip Login
Buka terminal di direktori proyek dan jalankan perintah berikut:
```bash
npm run auth:google
```
*(Atau alias: `npm run login-google`)*

#### 2. Jendela Browser Chrome Visual Akan Terbuka
- Jendela browser Google Chrome akan terbuka secara otomatis menampilkan halaman login Google (`https://accounts.google.com`).

#### 3. Masukkan Akun Google & Selesaikan Verifikasi
- Masukkan **Email** dan **Password** akun Google yang ingin digunakan oleh bot.
- Jika akun Anda memiliki keamanan **2-Factor Authentication (2FA)** atau verifikasi SMS/Google Prompt, selesaikan verifikasi tersebut di browser.

#### 4. Selesai Otomatis & Sesi Tersimpan
- Begitu Anda berhasil masuk ke halaman akun Google, skrip akan mendeteksi status login secara otomatis:
  ```text
  ✅ Login berhasil terdeteksi!
  💾 Menyimpan sesi ke file: google_auth.json
  🎉 Selesai! Bot sekarang siap menggunakan akun Google ini.
  ```
- File sesi `google_auth.json` akan otomatis dibuat di folder utama proyek.

#### 5. Siap Digunakan
- Saat Anda menekan tombol **"1. JOIN ROOM"** di Dashboard, bot Playwright akan otomatis membaca file `google_auth.json` dan langsung bergabung ke Google Meet menggunakan akun yang sudah Anda loginkan.

---

### 💡 Tips & Pengelolaan Login Session

> [!TIP]
> **Kapan Perlu Login Ulang?**
> Sesi Google Auth biasanya bertahan berminggu-minggu hingga berbulan-bulan. Jika di masa mendatang bot gagal masuk karena sesi kedaluwarsa, cukup jalankan kembali `npm run auth:google`.

> [!NOTE]
> **Mode Guest (Tanpa Login)**
> Jika file `google_auth.json` tidak ada atau dihapus, bot akan otomatis beralih ke **Mode Guest (Tamu)** dan menggunakan nama yang diisi di input nama.

> [!IMPORTANT]
> **Keamanan File `google_auth.json`**
> File `google_auth.json` berisi token sesi dan cookies akun Google Anda. Jangan pernah membagikan atau mengunggah (*commit*) file ini ke repository publik GitHub/GitLab! File ini sudah otomatis dimasukkan ke `.gitignore`.

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.x` atau `20.x` atau lebih baru ([Download Node.js](https://nodejs.org/)).
- **NPM**: Versi `9.x` atau lebih baru (biasanya otomatis terpasang bersama Node.js).
- **Deepgram API Key**: Dapatkan API Key gratis dengan saldo awal $200 di [Console Deepgram](https://console.deepgram.com/).
- **Browser Chromium (Playwright)**: Browser headless untuk menjalankan bot.

---

## ⚙️ Instalasi & Konfigurasi

### 1. Clone atau Buka Folder Proyek
```bash
cd c:\10123121\ProjekAIBaru
```

### 2. Instal Seluruh Dependensi Proyek
```bash
npm install
```

### 3. Instal Browser Playwright Chromium
```bash
npx playwright install chromium
```

### 4. Konfigurasi File Environment (`.env`)
Salin file template `.env.example` menjadi `.env`:
```bash
# Untuk Windows Command Prompt / PowerShell:
copy .env.example .env
```
Buka file `.env` dan sesuaikan nilainya:
```env
# API Key Deepgram Nova-2 (Dapatkan di https://console.deepgram.com/)
DEEPGRAM_API_KEY=masukkan_api_key_deepgram_anda_disini

# Port Server Backend Orchestrator
PORT=3001

# Nama Tampilan Default Bot di Room Meeting
BOT_DISPLAY_NAME=AI Note-Taker Bot

# Pengaturan Akun Google (Opsional / Info)
GOOGLE_BOT_EMAIL=email_bot_anda@gmail.com
```

### 5. Setup Login Session Akun Google
Jalankan skrip autentikasi Google agar bot dapat masuk rapat dengan lancar:
```bash
npm run auth:google
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi terdiri dari dua komponen utama: **Backend Orchestrator** dan **Frontend Dashboard**. Jalankan keduanya di terminal terpisah.

### 🟢 Terminal 1: Jalankan Backend Orchestrator
```bash
npm run server
```
*Backend akan berjalan di port `http://localhost:3001`.*

### 🔵 Terminal 2: Jalankan Frontend Dashboard
Buka jendela terminal baru di folder proyek, lalu jalankan:
```bash
npm run dev
```
*Frontend akan aktif di `http://localhost:5173`.*

Buka browser Anda dan akses:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📖 Panduan Penggunaan Langkah demi Langkah

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. JOIN     │ ──> │  2. RECORD   │ ──> │  3. TRANSCRIBE│ ──> │  4. STOP     │ ──> │  5. EXPORT   │
│  Bot Masuk   │     │  Mulai Audio │     │  Live Stream │     │  Simpan Sesi │     │  DOCX / TXT  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Langkah 1: Persiapan & Input Data Meeting
1. Di Dashboard Web, pastikan status server di pojok kanan atas menunjukkan **"Server Online"** dan **"VPN Connected"**.
2. Masukkan **Topik / Judul Rapat** (contoh: *Sprint Planning Q3 - Engineering*).
3. Pilih **Platform Rapat** (*Google Meet*, *Zoom*, atau *Microsoft Teams*).
4. Tempelkan (*paste*) **URL Meeting** (contoh: `https://meet.google.com/abc-defg-hij`).
5. Pilih **Bahasa Utama Transkripsi** (*Bahasa Indonesia*, *English*, atau *Campuran / Code-Switching*).

---

### Langkah 2: Masukkan Bot ke Rapat (Join Room)
1. Klik tombol hijau **"1. JOIN ROOM"** (atau tekan pintasan `Ctrl + J`).
2. Server backend akan membuka bot browser di latar belakang (*headless*) menggunakan sesi login `google_auth.json`.
3. Indikator status akan berubah dari `IDLE` ➔ `JOINING` ➔ `IN_ROOM_STANDBY`.
4. Jika meeting memerlukan persetujuan Host (*Admit*), silakan klik **"Admit / Izinkan"** pada layar Host meeting Anda.

---

### Langkah 3: Mulai Merekam & Transkrip Real-Time (Record)
1. Setelah bot berstatus `IN_ROOM_STANDBY`, klik tombol merah **"2. RECORD"** (atau tekan `Ctrl + R`).
2. Bot akan mengaktifkan *Web Audio Mixer Hook* dan menyalurkan stream audio ke engine Deepgram Nova-2.
3. Indikator rekaman akan berkedip merah (*Live Pulse*), timer durasi berjalan, dan grafik gelombang audio (*Audio Visualizer*) akan bergerak dinamis merespons suara peserta.
4. Teks transkrip percakapan akan muncul secara langsung di kolom **Live Transcriber** lengkap dengan nama pembicara (*Diarization*) dan penanda waktu.

---

### Langkah 4: Menjeda & Melanjutkan Rekaman (Pause / Resume)
- Jika ada sesi istirahat atau topik rahasia yang tidak ingin ditranskrip, klik tombol kuning **"PAUSE"** (atau tekan `Spacebar`).
- Klik **"RESUME"** (atau `Spacebar` kembali) untuk melanjutkan transkripsi tanpa memutus koneksi bot.

---

### Langkah 5: Menghentikan Rekaman & Menyimpan (Stop & Save)
1. Setelah meeting selesai, klik tombol biru **"STOP & SAVE"** (atau tekan `Ctrl + S`).
2. Dialog penutupan (*Closure Modal*) akan terbuka secara otomatis, menyajikan:
   - Total durasi rekaman
   - Jumlah total kata yang berhasil ditranskrip
   - Jumlah pembicara terdeteksi
   - Cuplikan hasil transkrip lengkap
3. Pilih format dokumen yang diinginkan:
   - 📄 **Download .DOCX (Word)**: Menghasilkan berkas Word resmi lengkap dengan kop judul, tabel metadata, dan dialog notulen.
   - 📝 **Download .TXT**: Menghasilkan berkas teks polos berpenanda waktu.

---

### Langkah 6: Mengeluarkan Bot (Leave Room)
- Klik tombol merah tua **"LEAVE ROOM"** untuk menutup browser bot dan membebaskan memori server.
- Status bot akan kembali ke `IDLE` dan siap digunakan untuk rapat berikutnya.

---

## ⌨️ Pintasan Keyboard (Hotkeys)

Tingkatkan kecepatan navigasi Anda menggunakan pintasan keyboard berikut (berlaku di halaman Dashboard):

| Pintasan Keyboard | Aksi Komando | Keterangan |
| :--- | :--- | :--- |
| `Ctrl + J` | **Join Room** | Memerintahkan bot untuk masuk ke ruang meeting |
| `Ctrl + R` | **Record / Start STT** | Memulai perekaman audio dan live transcription |
| `Spacebar` | **Pause / Resume** | Menjeda atau melanjutkan proses transkripsi |
| `Ctrl + S` | **Stop & Save** | Menghentikan rekaman dan membuka dialog unduhan |
| `Ctrl + Shift + D` | **Quick Export .DOCX** | Unduh langsung transkrip dalam format Microsoft Word |
| `Ctrl + Shift + T` | **Quick Export .TXT** | Unduh langsung transkrip dalam format Plain Text |
| `?` / `Shift + /` | **Hotkey Guide** | Membuka panduan pintasan keyboard interaktif |

---

## 📂 Struktur Direktori Proyek

```
ProjekAIBaru/
├── .env                       # File konfigurasi environment lokal
├── .env.example               # Template contoh variabel environment
├── google_auth.json           # File sesi login Google (Dibuat otomatis oleh auth helper)
├── package.json               # Dependensi proyek & daftar npm scripts
├── vite.config.ts             # Konfigurasi bundler Vite
├── tailwind.config.js         # Konfigurasi styling TailwindCSS
│
├── server/                    # 🚀 BACKEND ORCHESTRATOR (Node.js + Express + Socket.io)
│   ├── server.ts              # Server utama REST API & WebSocket event handler
│   ├── googleAuthHelper.ts    # Skrip autentikasi interaktif akun Google (Playwright)
│   ├── deepgramService.ts     # Layanan integrasi live streaming STT Deepgram Nova-2
│   ├── vpnManager.ts          # Layanan pemantau status VPN perusahaan
│   └── adapters/              # Adapter bot meeting multi-platform
│       ├── IMeetingBotAdapter.ts # Interface standar bot adapter
│       ├── GoogleMeetAdapter.ts  # Bot Playwright untuk Google Meet & Web Audio Hook
│       ├── ZoomAdapter.ts        # Bot adapter untuk Zoom Web Client
│       └── TeamsAdapter.ts       # Bot adapter untuk Microsoft Teams
│
└── src/                       # 🎨 FRONTEND WEB DASHBOARD (React + TypeScript)
    ├── App.tsx                # Komponen root aplikasi & state management utama
    ├── main.tsx               # Entry point React DOM
    ├── index.css              # Custom styling & animasi CSS
    ├── components/
    │   ├── layout/            # Navbar, Header, VpnStatusBadge
    │   ├── live/              # LiveControlPanel, LiveTranscriber, AudioVisualizer,
    │   │                      # ClosureDialog, HotkeyGuideModal
    │   ├── schedule/          # ScheduleList, ScheduleModal
    │   ├── history/           # HistoryList, TranscriptViewerModal
    │   └── common/            # Button, Badge, Toast, Modal
    ├── hooks/                 # Custom React Hooks (useHotkeys, useMeetingBot)
    ├── services/              # Layanan ekspor (exportDocx, exportTxt), storageService
    └── types/                 # Definisi tipe TypeScript (meeting, transcript)
```

---

## ❓ Troubleshooting & FAQ

### 1. Muncul pesan error "You can't join this meeting" di Google Meet
**Penyebab**: Pengaturan *Host Controls* rapat di Google Meet disetel ke *Restricted* (Dibatasi) sehingga akun luar tidak diizinkan masuk secara otomatis.  
**Solusi**:
- Jalankan `npm run auth:google` untuk login dengan akun Google yang sudah diundang ke rapat tersebut.
- Di layar Host meeting, klik ikon **Gembok 🔒 (Host Controls)** di pojok kanan bawah ➔ Ubah **Meeting Access** dari *Restricted* menjadi *Open* (Terbuka).
- Atau klik **"Add people" (Tambahkan orang)** pada rapat dan undang email bot Anda.

---

### 2. Error: `EADDRINUSE: address already in use :::3001`
**Penyebab**: Server backend sudah berjalan di terminal lain atau ada proses Node.js yang tertinggal di port 3001.  
**Solusi**:
- Periksa terminal Anda yang lain, kemungkinan `npm run server` sudah aktif.
- Di Windows PowerShell, Anda dapat mematikan proses di port 3001 dengan perintah:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
  ```

---

### 3. Teks transkrip tidak muncul saat status RECORDING
**Penyebab**: API Key Deepgram belum diisi di `.env`, atau tidak ada peserta rapat yang berbicara / suara meeting dalam kondisi hening (*muted*).  
**Solusi**:
- Pastikan `DEEPGRAM_API_KEY` di file `.env` sudah diisi dengan API Key yang valid dari [Deepgram Console](https://console.deepgram.com/).
- Periksa grafik **Audio Waveform** di panel live; pastikan gelombang bergerak saat ada peserta yang berbicara di meeting.

---

### 4. Sesi akun Google kedaluwarsa atau ingin ganti akun
**Solusi**:
- Hapus file `google_auth.json` lama jika ada, lalu jalankan kembali skrip autentikasi:
  ```bash
  npm run auth:google
  ```
- Login dengan akun Google baru yang diinginkan.

---

## 📜 Lisensi & Kontribusi

Proyek ini dikembangkan untuk kebutuhan notulensi rapat otomatis dan transkripsi cerdas berbasis AI. Dikembangkan dengan prinsip keterbukaan, efisiensi tinggi, dan pengalaman pengguna (*User Experience*) terbaik.
