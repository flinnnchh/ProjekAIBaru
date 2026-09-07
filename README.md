# 🎙️ AI Meeting Bot Controller & Live Transcriber Enterprise
### (Google Meet, Zoom, Microsoft Teams)

Aplikasi Web Enterprise Full-Stack untuk mengontrol **Bot Meeting Otomatis** (berbasis Playwright Headless) dan **Live Transcriber Multilingual Real-Time** menggunakan **Deepgram Nova-2** (Bahasa Indonesia, English, dan Percakapan Campuran/Code-Switching).

Dilengkapi dengan **Sistem Autentikasi Multi-User (JWT & Role-Based Access)**, **Whitelist Email Keamanan**, **Panel Admin Terpusat**, **Integrasi Google Drive OAuth 2.0**, **Database MongoDB**, sistem sesi Google terintegrasi (**Google Login Session State**), pilihan mode transkripsi (**Live vs Post-Meeting Batch AI**), animasi loading AI interaktif, manajemen jadwal & riwayat, serta ekspor notulen rapat resmi berformat **.DOCX (Microsoft Word)** dan **.TXT**.

---

## 📑 Daftar Isi

- [✨ Fitur Unggulan](#-fitur-unggulan)
- [🏗️ Arsitektur & Cara Kerja Sistem](#️-arsitektur--cara-kerja-sistem)
- [🔐 Sistem Autentikasi & Keamanan (Multi-User & Role-Based)](#-sistem-autentikasi--keamanan-multi-user--role-based)
- [☁️ Integrasi Google Drive Cloud Backup](#️-integrasi-google-drive-cloud-backup)
- [🤖 Panduan Login Session Akun Google Bot (Playwright)](#-panduan-login-session-akun-google-bot-playwright)
- [🎯 Dual-Mode Transkripsi: Live vs Background Batch AI](#-dual-mode-transkripsi-live-vs-background-batch-ai)
- [📋 Prasyarat Sistem](#-prasyarat-sistem)
- [⚙️ Instalasi & Konfigurasi](#️-instalasi--konfigurasi)
- [🌱 Inisialisasi Database (Database Seeding)](#-inisialisasi-database-database-seeding)
- [🚀 Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [📖 Panduan Penggunaan Langkah demi Langkah](#-panduan-penggunaan-langkah-demi-langkah)
- [👑 Panduan Khusus Administrator (Admin Panel)](#-panduan-khusus-administrator-admin-panel)
- [⌨️ Pintasan Keyboard (Hotkeys)](#️-pintasan-keyboard-hotkeys)
- [🌐 Dokumentasi REST API Endpoints](#-dokumentasi-rest-api-endpoints)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [❓ Troubleshooting & FAQ](#-troubleshooting--faq)
- [📜 Lisensi & Kontribusi](#-lisensi--kontribusi)

---

## ✨ Fitur Unggulan

### 1. 👥 Autentikasi Multi-User & Role-Based Access Control (RBAC)
- **Perlindungan JWT (JSON Web Token)**: Autentikasi stateless dengan token tersimpan aman di peramban dan diverifikasi di setiap request API serta WebSocket.
- **Dua Peran Pengguna (Roles)**:
  - **`admin`**: Akses penuh ke dashboard kontrol, riwayat pribadi, plus hak akses ke **Admin Panel** untuk mengelola user, mengatur whitelist, dan memantau status sistem.
  - **`user`**: Akses ke kontrol bot rapat, transkrip, riwayat pertemuan mandiri, jadwal, dan Google Drive.
- **Sistem Whitelist Email Terproteksi**: Hanya alamat email yang telah didaftarkan ke daftar Whitelist oleh Admin yang diperbolehkan mendaftar (*Register*), mencegah akses tidak sah dari pihak luar organisasi.

### 2. 👑 Dashboard Manajemen Administrator (Admin Panel)
- **Manajemen Pengguna Terpusat**: Lihat seluruh daftar akun terdaftar, ubah hak akses (promosi/demosi antara `admin` dan `user`), serta hapus akun yang sudah tidak aktif.
- **Manajemen Whitelist Email Real-Time**: Tambah atau hapus email yang diizinkan untuk registrasi secara instan dengan catatan (*notes*).
- **Pemantauan Kapasitas Sesi & Server**: Pantau status koneksi server, penggunaan sesi aktif (`MAX_CONCURRENT_SESSIONS`), serta uptime orkestrator bot.

### 3. 🎯 Dual-Mode Transkripsi Cerdas (Mode Selector)
- **Mode 1: Live Transcribe (Real-Time)**:
  - Teks transkrip mengalir secara real-time (*streaming*) kata demi kata saat peserta rapat berbicara (<300ms latency).
  - Dilengkapi visualisasi bar audio (*Real-Time Audio Waveform*) dan indikator status *Live Pulse*.
- **Mode 2: Background Mode (Post-Meeting Batch AI)**:
  - Bot merekam secara senyap di latar belakang tanpa membebani antarmuka pengguna atau koneksi jaringan client.
  - Setelah rapat dihentikan (`STOP`), audio utuh dikirim ke Deepgram Pre-recorded API untuk akurasi maksimal dengan penandaan alinea dan tanda baca otomatis.
- **Animasi Loading Kertas & Pulpen AI**: Saat pemrosesan batch berlangsung, antarmuka menampilkan animasi pulpen menulis di atas kertas dengan tahapan progres bertahap (*analisis audio ➔ penyempurnaan tanda baca ➔ perapihan notulen*).

### 4. ☁️ Integrasi Google Drive Cloud Backup (OAuth 2.0)
- **Koneksi Satu Klik (One-Click OAuth 2.0)**: Sambungkan akun Google Drive pribadi atau institusi langsung dari Navbar aplikasi.
- **Ekspor & Unggah Otomatis**: Simpan notulen rapat berformat `.docx` langsung ke Google Drive hanya dengan menekan tombol **"Upload to Google Drive"**.
- **Penyimpanan Terstruktur**: Otomatis membuat folder khusus dokumen rapat di Google Drive pengguna.

### 5. 🔐 Google Account Login Session Bot (Playwright Persistent Storage)
- **Satu Kali Login, Siap Selamanya**: Autentikasi akun Google resmi sekali via browser visual, dan sesi (*cookies & storage state*) tersimpan aman di file lokal `google_auth.json`.
- **Bypass Restriksi Google Meet**: Mencegah bot tertolak sebagai *Guest / Unverified User* atau tertahan di layar penolakan akses rapat.
- **Identitas Akun Resmi**: Bot bergabung ke ruang meeting dengan foto profil dan nama akun Google resmi Anda.

### 6. 🎛️ Panel Kontrol Live Sesi (8 Golden Rules of Interface Design)
- **Consistency**: Skema warna standar media player (*Join: Hijau, Record: Merah, Pause: Kuning, Stop: Biru, Leave: Merah-Tua*).
- **Shortcuts**: Akses komando kilat menggunakan keyboard (`Ctrl+J`, `Ctrl+R`, `Spacebar`, `Ctrl+S`, `Ctrl+Shift+D`, `Ctrl+Shift+T`, `?`).
- **Informative Feedback**: Indikator *Live Pulse* berkedip, visualizer bar audio real-time, timer rekaman presisi, dan status koneksi bot/VPN.
- **Dialogs to Yield Closure**: Modal konfirmasi selesai rekaman lengkap dengan statistik total durasi, jumlah kata, daftar partisipan/speaker, serta tombol download instan.
- **Prevent Errors**: Tombol otomatis terkunci/disabled sesuai tahapan alur bot untuk mencegah kesalahan klik (*anti-accidental click*).
- **Permit Easy Reversal**: Fitur Pause dan Resume transkrip mulus tanpa merusak urutan transkrip atau memecah file rekaman.
- **Keep Users in Control**: Operator memiliki kontrol penuh untuk menjeda, menghentikan rekaman, atau mengeluarkan bot dari room kapan saja.
- **Reduce Memory Load**: Seluruh informasi kritis (URL, platform, status VPN, audio waveform, transkrip berjalan) terpampang jelas dalam satu tampilan komando terpadu.

### 7. 🧠 Live Transcriber Multilingual (Deepgram Nova-2)
- **Bilingual & Code-Switching**: Mendukung transkripsi akurat Bahasa Indonesia (`id`), Bahasa Inggris (`en`), serta percakapan campuran (Bahasa Indonesia campur istilah Inggris).
- **Speaker Diarization**: Otomatis mendeteksi dan membedakan siapa yang sedang berbicara (*Speaker 0, Speaker 1, Speaker 2*, dst.).
- **Ultra-Low Latency (<300ms)**: Teks transkrip mengalir secara real-time (*streaming token*) kata demi kata saat partisipan berbicara.
- **Smart Punctuation & Formatting**: Tanda baca otomatis dan format huruf kapital yang rapi.

### 8. 📄 Ekspor Notulen Rapat Resmi
- **Format .DOCX (Microsoft Word)**: Dilengkapi kop dokumen resmi, tabel metadata meeting (*Topik, Platform, Tanggal, Durasi, Total Kata, Daftar Pembicara, Status Enkripsi VPN*), dan format dialog transkrip berpenanda waktu rapi.
- **Format .TXT**: Plain text terstruktur dengan penanda waktu (*timestamp*) untuk integrasi cepat.

### 9. 🗄️ Database MongoDB Terpusat & Multi-Session
- **Database Mongoose Terintegrasi**: Data akun pengguna, whitelist, jadwal mendatang, dan arsip riwayat transkrip tersimpan aman dan terorganisir di MongoDB.
- **Multi-Session Manager**: Menjaga isolasi sesi meeting antar pengguna yang berbeda dan memastikan batas konkurensi server (`MAX_CONCURRENT_SESSIONS`) terjaga stabil.

---

## 🏗️ Arsitektur & Cara Kerja Sistem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Frontend Web Dashboard (React + Vite)                    │
│  - Auth & RBAC (Login / Register / JWT Token Guard)                         │
│  - Control Panel (Join / Record / Pause / Stop / Leave)                     │
│  - Transcribe Mode Selector (Live Streaming vs Background Batch AI)         │
│  - Live Audio Waveform & Real-Time Subtitle Stream                          │
│  - Google Drive Sync & Direct Cloud Uploader                                │
│  - Interactive Admin Panel (Users & Whitelist Management)                   │
│  - Schedule & History Manager with MongoDB Sync                             │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ WebSocket (Socket.io + JWT Auth) & REST APIs
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                   Backend Orchestrator (Node.js + Express)                  │
│                                                                             │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌───────────────┐  │
│  │ Express REST Routers    │  │ Multi-Session Manager │  │ MongoDB Atlas │  │
│  │ - /api/auth             │  │ - Session Isolation   │  │ / Local MDB   │  │
│  │ - /api/admin            │  │ - Max Capacity Limit  │  │ - Users & WList│ │
│  │ - /api/drive (OAuth2)   │  │ - User Socket Mapping │  │ - History     │  │
│  │ - /api/history/schedule │  │                       │  │ - Schedules   │  │
│  └─────────────────────────┘  └──────────┬────────────┘  └───────────────┘  │
│                                          │                                  │
│  ┌───────────────────────────────────────▼───────────────────────────────┐  │
│  │ Playwright Headless Browser Engine                                    │  │
│  │ - Memuat sesi 'google_auth.json' (Login Session Bot)                  │  │
│  │ - Masuk ke Google Meet / Zoom / MS Teams                              │  │
│  │ - Web Audio Master Mixer (Inject Script Audio Capture)                │  │
│  └───────────────────────────────────────┬───────────────────────────────┘  │
│                                          │ Raw Audio Stream (PCM 16kHz)     │
│  ┌───────────────────────────────────────▼───────────────────────────────┐  │
│  │ Deepgram Nova-2 Speech-to-Text Engine                                 │  │
│  │ - Live Streaming STT (WebSocket low-latency token streaming)          │  │
│  │ - Post-Meeting Batch Transcription (Pre-recorded API buffer)          │  │
│  │ - Speaker Diarization, Smart Formatting & Multilingual (ID / EN)      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Sistem Autentikasi & Keamanan (Multi-User & Role-Based)

### Cara Kerja Autentikasi & Whitelist:
1. **Pendaftaran Akun Baru (`/register`)**:
   - Pengguna memasukkan nama lengkap, alamat email, dan kata sandi.
   - Server memeriksa apakah email tersebut ada di tabel `WhitelistEmail`.
   - **Jika tidak terdaftar di whitelist**: Pendaftaran otomatis ditolak dengan pesan edukatif: *"Email Anda belum masuk ke whitelist perusahaan. Silakan hubungi Administrator"*.
   - **Jika terdaftar di whitelist**: Password dienkripsi dengan `bcryptjs` (salt 10 rounds), akun pengguna dibuat dengan role default `user`, dan token JWT langsung diterbitkan.
2. **Login Akun (`/login`)**:
   - Pengguna masuk menggunakan email dan password.
   - Server memvalidasi hash kata sandi dan menerbitkan token JWT dengan masa kedaluwarsa sesuai konfigurasi (`JWT_EXPIRES_IN=7d`).
   - Token disimpan di `localStorage` peramban client dan otomatis dikirimkan via Authorization Header (`Bearer <token>`) serta handshake WebSocket.
3. **Role-Based Protection**:
   - Pengguna dengan role `admin` memiliki tombol navigasi **"Admin Panel"** di Navbar.
   - Endpoint `/api/admin/*` dilindungi middleware ganda: `authMiddleware` (validasi JWT) dan `requireAdmin` (validasi peran).

---

## ☁️ Integrasi Google Drive Cloud Backup

Aplikasi mendukung sinkronisasi langsung ke Google Drive pengguna melalui OAuth 2.0 resmi Google APIs:

1. **Hubungkan Google Drive**:
   - Klik tombol **"Connect Google Drive"** pada Navbar atau di dalam dialog konfirmasi hasil rapat.
   - Pengguna akan diarahkan ke layar otorisasi Google untuk menyetujui izin pembuatan file dokumen.
   - Token akses (*refresh token / access token*) disimpan secara aman dalam sesi pengguna.
2. **Unggah Dokumen Sekali Klik**:
   - Setelah meeting selesai atau saat meninjau riwayat di tab History, klik tombol **"Upload to Google Drive"**.
   - Server backend akan mengonversi notulen rapat menjadi berkas `.docx` resmi dan mengunggahnya langsung ke Google Drive pengguna.
   - Pengguna akan mendapatkan tautan langsung (*view link*) ke berkas dokumen di Google Drive.

> 📖 **Panduan Lengkap Handover & Google Cloud:**  
> Untuk penjelasan detail arsitektur integrasi, cara mengatasi perbedaan akun browser, serta panduan serah terima (*handover*) dan setup Google Cloud untuk perusahaan (tanpa batas user/testing list), silakan baca [PANDUAN_INTEGRASI_GOOGLE.md](PANDUAN_INTEGRASI_GOOGLE.md).

---

## 🤖 Panduan Login Session Akun Google Bot (Playwright)

### Mengapa Bot Memerlukan Login Session?
Google Meet menerapkan proteksi keamanan ketat untuk pengguna tamu (*Guest*):
1. **Mencegah "You can't join this meeting"**: Beberapa meeting organisasi/Google Workspace melarang akun tanpa login bergabung.
2. **Tanpa Persetujuan Berbelit (Host Admit)**: Jika menggunakan akun Google terdaftar yang diundang ke rapat, bot dapat masuk secara langsung.
3. **Nama & Identitas Resmi**: Bot tampil dengan nama dan foto profil akun Google yang Anda tentukan, bukan nama tamu anonim.

### 📌 Langkah Melakukan Google Login Session:
1. Buka terminal di direktori proyek dan jalankan:
   ```bash
   npm run auth:google
   ```
   *(Atau alias: `npm run login-google`)*
2. Jendela browser Google Chrome visual akan terbuka menampilkan halaman login Google (`https://accounts.google.com`).
3. Masukkan **Email** dan **Password** akun Google yang ingin digunakan oleh bot.
4. Selesaikan verifikasi keamanan (2FA / OTP / Google Prompt) jika diminta di browser.
5. Begitu Anda berhasil masuk, skrip akan mendeteksi status login secara otomatis:
   ```text
   ✅ Login berhasil terdeteksi!
   💾 Menyimpan sesi ke file: google_auth.json
   🎉 Selesai! Bot sekarang siap menggunakan akun Google ini.
   ```
6. File sesi `google_auth.json` tersimpan secara lokal dan otomatis dibaca oleh Playwright setiap kali bot bergabung ke rapat.

---

## 🎯 Dual-Mode Transkripsi: Live vs Background Batch AI

Saat Anda menekan tombol **"1. JOIN ROOM"**, aplikasi akan menampilkan popup dialog **Mode Picker**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PILIH MODE TRANSKRIPSI RAPAT                         │
├───────────────────────────────────┬────────────────────────────────────┤
│ 🎙️ MODE LIVE TRANSCRIBE           │ ☁️ MODE BACKGROUND (BATCH AI)     │
│ - Teks mengalir real-time         │ - Bot merekam senyap di latar      │
│ - Audio waveform visualizer aktif │ - Hemat kuota & resource antarmuka │
│ - Latensi sangat rendah (<300ms)  │ - Pasca-rapat diproses batch       │
│ - Cocok untuk live review teks    │ - Akurasi & tanda baca maksimal    │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Pilih Mode Live**: Panel transkrip live akan muncul di bagian bawah dashboard saat rekaman berjalan. Kata demi kata mengalir secara real-time.
2. **Pilih Mode Background**: Dashboard tetap rapi dan bersih dengan indikator elegan *"Bot sedang merekam di latar belakang..."*. Saat Anda menekan tombol **"STOP & SAVE"**, backend akan memproses audio utuh secara batch dengan tampilan animasi kertas & pulpen AI hingga notulen final tersusun rapi.

---

## 📋 Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi `18.x` atau `20.x` atau lebih baru ([Download Node.js](https://nodejs.org/)).
- **NPM**: Versi `9.x` atau lebih baru.
- **MongoDB**: Database lokal (`mongodb://localhost:27017`) atau akun cloud [MongoDB Atlas](https://www.mongodb.com/atlas).
- **Deepgram API Key**: Dapatkan API Key gratis dengan saldo awal di [Console Deepgram](https://console.deepgram.com/).
- **Google Cloud Console Credentials (Opsional, untuk Google Drive OAuth)**: Client ID & Client Secret dari [Google Cloud Console](https://console.cloud.google.com/).
- **Browser Chromium (Playwright)**: Browser headless untuk menjalankan bot.

---

## ⚙️ Instalasi & Konfigurasi

### 1. Buka Direktori Proyek
```bash
cd (File Telah Di Download)
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
Salin atau edit file `.env` di folder utama proyek:
```bash
# Untuk Windows PowerShell:
copy .env.example .env
```

Pastikan variabel-variabel berikut terisi dengan benar di dalam `.env`:
```env
# ==========================================
# 🧠 Deepgram Speech-to-Text Configuration
# ==========================================
# Dapatkan API key gratis di: https://console.deepgram.com/
DEEPGRAM_API_KEY=masukkan_api_key_deepgram_anda_disini
DEEPGRAM_LANGUAGE=en

# ==========================================
# 🌐 Server Backend Port
# ==========================================
PORT=3001

# ==========================================
# 🤖 Akun Google untuk Bot Playwright
# ==========================================
GOOGLE_BOT_EMAIL=email_bot_anda@gmail.com
GOOGLE_BOT_PASSWORD=password_bot_anda
BOT_DISPLAY_NAME=AI Note-Taker Bot

# ==========================================
# 🗄️ Konfigurasi Database MongoDB
# ==========================================
# Gunakan MongoDB lokal atau connection string MongoDB Atlas:
MONGODB_URI=mongodb://localhost:27017/ai_meeting_bot

# ==========================================
# 🔐 JWT Authentication & Multi-User Limits
# ==========================================
JWT_SECRET=rahasia-kunci-jwt-super-aman-ganti-dengan-string-acak
JWT_EXPIRES_IN=7d
MAX_CONCURRENT_SESSIONS=5

# ==========================================
# ☁️ Google Drive OAuth 2.0 (Cloud Backup)
# ==========================================
# Dapatkan di Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client ID
GOOGLE_CLIENT_ID=masukkan_google_client_id_anda
GOOGLE_CLIENT_SECRET=masukkan_google_client_secret_anda
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/api/drive/oauth/callback

# ==========================================
# 🛡️ Corporate VPN Settings (Opsional)
# ==========================================
VPN_INTERFACE=wg0
VPN_GATEWAY=10.24.0.1
```

---

## 🌱 Inisialisasi Database (Database Seeding)

Sebelum menjalankan aplikasi untuk pertama kali, jalankan skrip *database seeding* untuk membuat whitelist email awal dan akun Administrator default:

```bash
npm run seed:db
```

Output terminal:
```text
🌱 === SEED SCRIPT: Mengisi Data Awal MongoDB ===

📧 [Step 1] Menambahkan whitelist emails...
   ✅ Ditambahkan: admin@perusahaan.com
   ✅ Ditambahkan: botnotulenlui@gmail.com
   ✅ Ditambahkan: admin1@perusahaan.com
   ✅ Ditambahkan: admin2@perusahaan.com

👤 [Step 2] Membuat akun-akun default...
   ✅ Akun dibuat: admin@perusahaan.com (Role: admin)
   ✅ Akun dibuat: admin1@perusahaan.com (Role: user)
   ✅ Akun dibuat: admin2@perusahaan.com (Role: user)

🎉 Selesai! Database siap digunakan.
```

> [!TIP]
> **Kredensial Default Setelah Seeding:**
> - **Akun Admin:** `admin@perusahaan.com` / Password: `admin123`
> - **Akun User:** `admin1@perusahaan.com` / Password: `admin123`
> *(Sangat disarankan untuk mengubah kata sandi setelah login pertama kali)*

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi terdiri dari dua komponen utama: **Backend Orchestrator** dan **Frontend Dashboard**.

### 🟢 Terminal 1: Jalankan Backend Orchestrator
```bash
npm run server
```
*Server REST API dan WebSocket akan aktif di `http://localhost:3001`.*

### 🔵 Terminal 2: Jalankan Frontend Dashboard
Buka jendela terminal baru, lalu jalankan:
```bash
npm run dev
```
*Frontend Vite React akan aktif di `http://localhost:5173`.*

Buka peramban Anda dan kunjungi:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📖 Panduan Penggunaan Langkah demi Langkah

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  0. LOGIN    │ ──> │  1. JOIN     │ ──> │  2. RECORD   │ ──> │  3. STOP     │ ──> │  4. EXPORT   │
│  JWT / Admin │     │  Pilih Mode  │     │  Live / Batch│     │  AI Process  │     │  DOCX / Drive│
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### Langkah 0: Masuk atau Mendaftar Akun
1. Buka web di `http://localhost:5173`. Jika belum login, Anda akan diarahkan ke halaman **Login**.
2. Masukkan email dan password (misal akun seed: `admin@perusahaan.com` / `admin123`).
3. Jika ingin mendaftar akun baru, pastikan email Anda sudah dimasukkan ke whitelist oleh Admin terlebih dahulu.

---

### Langkah 1: Persiapan Rapat & Input URL
1. Di Dashboard, pastikan status menunjukkan **"Server Online"** dan **"VPN Connected"**.
2. Masukkan **Topik / Judul Rapat** (contoh: *Sprint Review & Retrospective Q3*).
3. Pilih **Platform Rapat** (*Google Meet*, *Zoom*, atau *Microsoft Teams*).
4. Tempelkan (*paste*) **URL Meeting** (contoh: `https://meet.google.com/abc-defg-hij`).
5. Pilih **Bahasa Utama Transkripsi** (*Bahasa Indonesia*, *English*, atau *Campuran / Code-Switching*).

---

### Langkah 2: Masukkan Bot & Pilih Mode Transkripsi
1. Klik tombol hijau **"1. JOIN ROOM"** (atau tekan pintasan `Ctrl + J`).
2. Muncul dialog modal **Transcribe Mode Picker**:
   - Pilih **Live Transcribe** untuk melihat teks berjalan seketika.
   - Pilih **Background Mode** untuk merekam senyap dengan hasil batch AI akurasi tinggi pasca-rapat.
3. Klik **"Mulai & Join Meeting"**.
4. Bot Playwright akan bergabung ke room meeting di latar belakang (*headless*) menggunakan sesi `google_auth.json`.
5. Status bot akan berubah dari `IDLE` ➔ `JOINING` ➔ `IN_ROOM_STANDBY`.
6. *(Jika meeting membutuhkan persetujuan Host, klik "Admit" pada layar Host meeting Anda)*.

---

### Langkah 3: Mulai Perekaman Audio (Record)
1. Klik tombol merah **"2. RECORD"** (atau tekan `Ctrl + R`).
2. Bot mengaktifkan *Web Audio Mixer* dan mengirim audio ke engine Deepgram Nova-2.
3. Indikator merekam merah menyala (*Live Pulse*), timer durasi berjalan, dan grafik audio merespons suara peserta.

---

### Langkah 4: Jeda & Lanjutkan Rekaman (Pause / Resume)
- Klik tombol kuning **"PAUSE"** (atau tekan `Spacebar`) saat ada sesi istirahat atau topik *off-the-record*.
- Klik **"RESUME"** (atau tekan `Spacebar` kembali) untuk melanjutkan perekaman tanpa memutus koneksi bot.

---

### Langkah 5: Hentikan Rekaman & Batch AI Processing (Stop & Save)
1. Klik tombol biru **"STOP & SAVE"** (atau tekan `Ctrl + S`).
2. Jika menggunakan mode background / batch processing, antarmuka akan menampilkan **Animasi Loading Kertas & Pulpen AI**:
   - 🎧 Menganalisis gelombang audio & membedakan pembicara...
   - ✍️ Menyempurnakan tanda baca & merapikan struktur dialog...
   - ✨ Menyusun notulen rapat resmi...
3. Setelah selesai, **Dialog Penutupan Rapat (Closure Modal)** akan muncul otomatis, menyajikan:
   - Durasi total rapat, jumlah kata, dan jumlah pembicara yang terdeteksi.
   - Peninjau teks transkrip lengkap dengan *speaker diarization* dan penanda waktu (*timestamps*).

---

### Langkah 6: Ekspor Dokumen & Backup ke Cloud
Di dalam dialog penutupan atau tab **History**:
- 📄 **Download .DOCX (Word)**: Simpan berkas Microsoft Word resmi ber-kop dan bertabel metadata ke komputer lokal.
- 📝 **Download .TXT**: Simpan berkas teks polos dengan penanda waktu.
- ☁️ **Upload to Google Drive**: Unggah notulen rapat langsung ke folder Google Drive pribadi Anda dengan satu klik.

---

### Langkah 7: Keluarkan Bot (Leave Room)
- Klik tombol merah tua **"LEAVE ROOM"** untuk menutup browser bot Playwright dan melepaskan alokasi memori server.
- Status bot kembali ke `IDLE`.

---

## 👑 Panduan Khusus Administrator (Admin Panel)

Pengguna dengan peran **`admin`** memiliki akses eksklusif ke tombol **"Admin Panel"** di Navbar:

### 1. Mengelola Pengguna (User Management)
- Melihat seluruh daftar akun yang terdaftar dalam sistem (Nama, Email, Peran, Tanggal Registrasi).
- **Ubah Role**: Klik tombol *Promote to Admin* atau *Demote to User* untuk mengatur wewenang akun.
- **Hapus Akun**: Menghapus akun pengguna yang sudah tidak aktif dengan konfirmasi keamanan.

### 2. Mengelola Whitelist Email (Security Guard)
- Melihat daftar email yang diperbolehkan membuat akun di sistem.
- **Tambah Email**: Masukkan alamat email baru beserta catatan keterangan (misal: *Tim Product - Budi*), lalu klik **"Tambah ke Whitelist"**.
- **Hapus Email**: Menghapus email dari whitelist sehingga alamat tersebut tidak dapat lagi digunakan untuk mendaftar akun baru.

### 3. Pemantauan Metrik Server (System Overview)
- Memantau kapasitas sesi aktif saat ini dibanding batas kapasitas (`activeSessions / maxCapacity`).
- Melihat status kesehatan koneksi database MongoDB dan VPN perusahaan.

---

## ⌨️ Pintasan Keyboard (Hotkeys)

Navigasi cepat keyboard di halaman dashboard kontrol:

| Pintasan Keyboard | Aksi Komando | Keterangan |
| :--- | :--- | :--- |
| `Ctrl + J` | **Join Room** | Membuka pemilih mode dan memerintahkan bot masuk ke meeting |
| `Ctrl + R` | **Record / Start STT** | Memulai perekaman audio dan penangkapan transkrip |
| `Spacebar` | **Pause / Resume** | Menjeda atau melanjutkan proses transkripsi |
| `Ctrl + S` | **Stop & Save** | Menghentikan rekaman, memproses AI batch, dan membuka dialog hasil |
| `Ctrl + Shift + D` | **Quick Export .DOCX** | Unduh langsung transkrip dalam format Microsoft Word |
| `Ctrl + Shift + T` | **Quick Export .TXT** | Unduh langsung transkrip dalam format Plain Text |
| `?` / `Shift + /` | **Hotkey Guide** | Membuka jendela panduan pintasan keyboard interaktif |

---

## 🌐 Dokumentasi REST API Endpoints

### 1. Autentikasi (`/api/auth`)
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Mendaftarkan akun baru (wajib ada di whitelist) | Publik |
| `POST` | `/api/auth/login` | Masuk akun dan memperoleh token JWT | Publik |
| `GET` | `/api/auth/me` | Mengambil data profil akun yang sedang login | Wajib Login (JWT) |

### 2. Administrator (`/api/admin`)
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Mengambil seluruh daftar pengguna | Admin |
| `PATCH` | `/api/admin/users/:id/role` | Mengubah peran pengguna (`admin` / `user`) | Admin |
| `DELETE` | `/api/admin/users/:id` | Menghapus akun pengguna | Admin |
| `GET` | `/api/admin/whitelist` | Mengambil daftar email whitelist | Admin |
| `POST` | `/api/admin/whitelist` | Menambahkan email baru ke whitelist | Admin |
| `DELETE` | `/api/admin/whitelist/:id` | Menghapus email dari whitelist | Admin |
| `GET` | `/api/admin/system/sessions`| Mengambil daftar sesi bot yang sedang aktif | Admin |

### 3. Google Drive OAuth & Cloud Backup (`/api/drive`)
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/drive/auth-url` | Mendapatkan URL consent Google OAuth 2.0 | Wajib Login (JWT) |
| `GET` | `/api/drive/oauth/callback`| Callback penerima token otorisasi Google | Publik / Browser |
| `GET` | `/api/drive/status` | Mengecek status keterhubungan Google Drive | Wajib Login (JWT) |
| `POST` | `/api/drive/upload-docx` | Mengunggah dokumen notulen `.docx` ke Drive | Wajib Login (JWT) |
| `POST` | `/api/drive/disconnect` | Memutus koneksi Google Drive | Wajib Login (JWT) |

### 4. Riwayat Pertemuan (`/api/history`)
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/history` | Mengambil daftar riwayat meeting pengguna | Wajib Login (JWT) |
| `POST` | `/api/history` | Menyimpan hasil notulen rapat baru | Wajib Login (JWT) |
| `DELETE` | `/api/history/:id` | Menghapus arsip riwayat rapat | Wajib Login (JWT) |

### 5. Penjadwalan Rapat (`/api/schedules`)
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schedules` | Mengambil daftar jadwal rapat mendatang | Wajib Login (JWT) |
| `POST` | `/api/schedules` | Membuat jadwal rapat baru | Wajib Login (JWT) |
| `DELETE` | `/api/schedules/:id`| Menghapus jadwal rapat | Wajib Login (JWT) |

### 6. Sistem & Diagnostik
| Metode | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Status server, kapasitas sesi aktif, & uptime | Publik |
| `GET` | `/api/vpn-status` | Status koneksi antarmuka VPN perusahaan | Publik |

---

## 📂 Struktur Direktori Proyek

```
ProjekAIBaru/
├── .env                              # File konfigurasi environment lokal
├── .env.example                      # Template contoh variabel environment
├── google_auth.json                  # File sesi login Google Bot (Playwright state)
├── package.json                      # Dependensi proyek & daftar npm scripts
├── vite.config.ts                    # Konfigurasi bundler Vite
├── tailwind.config.js                # Konfigurasi styling TailwindCSS
│
├── server/                           # 🚀 BACKEND ORCHESTRATOR (Node.js + Express)
│   ├── server.ts                     # Server utama, middleware, dan WebSocket init
│   ├── SessionManager.ts             # Pengelola konkurensi & isolasi sesi multi-user
│   ├── deepgramService.ts            # Layanan Deepgram Nova-2 (Live STT & Batch API)
│   ├── googleAuthHelper.ts           # Skrip interaktif autentikasi Google akun bot
│   ├── vpnManager.ts                 # Pemantau status antarmuka VPN
│   │
│   ├── auth/                         # Modul Autentikasi Backend
│   │   ├── authMiddleware.ts         # Middleware verifikasi JWT & guard role admin
│   │   ├── authRoutes.ts             # Handler login, register, dan profil
│   │   └── socketAuth.ts             # Autentikasi JWT pada koneksi WebSocket
│   │
│   ├── database/                     # Modul Database MongoDB (Mongoose)
│   │   ├── connection.ts             # Handler koneksi MongoDB
│   │   ├── seed.ts                   # Skrip seeder admin default & whitelist
│   │   └── models/                   # Skema MongoDB
│   │       ├── User.ts               # Model akun pengguna & hash password
│   │       ├── WhitelistEmail.ts     # Model daftar email yang diizinkan mendaftar
│   │       ├── MeetingHistory.ts     # Model arsip transkrip & notulen rapat
│   │       └── Schedule.ts           # Model agenda rapat mendatang
│   │
│   ├── routes/                       # REST API Route Handlers
│   │   ├── adminRoutes.ts            # API manajemen user, whitelist, dan sesi
│   │   ├── driveRoutes.ts            # API Google Drive OAuth & upload berkas
│   │   ├── historyRoutes.ts          # API riwayat meeting
│   │   └── scheduleRoutes.ts         # API penjadwalan meeting
│   │
│   ├── services/                     # Layanan Eksternal Backend
│   │   └── GoogleDriveService.ts     # Service integrasi Google Drive API v3
│   │
│   ├── handlers/                     # WebSocket Handlers
│   │   └── socketHandler.ts          # Event router komando bot & audio streaming
│   │
│   └── adapters/                     # Adapter Peramban Bot Multi-Platform
│       ├── IMeetingBotAdapter.ts     # Interface standar adapter bot
│       ├── GoogleMeetAdapter.ts      # Bot Playwright Google Meet & Web Audio Hook
│       ├── ZoomAdapter.ts            # Bot Playwright Zoom Web Client
│       └── TeamsAdapter.ts           # Bot Playwright Microsoft Teams
│
└── src/                              # 🎨 FRONTEND WEB DASHBOARD (React + TypeScript)
    ├── App.tsx                       # Root component, routing view, & state global
    ├── main.tsx                      # Entry point React DOM
    ├── index.css                     # Design tokens, animasi pen-writing & AI sparkles
    │
    ├── components/
    │   ├── admin/                    # Panel Administrator
    │   │   └── AdminPanel.tsx        # Dashboard kelola user, whitelist, & server
    │   ├── auth/                     # Halaman Autentikasi
    │   │   ├── LoginPage.tsx         # Formulir login pengguna
    │   │   └── RegisterPage.tsx      # Formulir pendaftaran dengan cek whitelist
    │   ├── layout/                   # Komponen Layout
    │   │   ├── Navbar.tsx            # Header, profil user, Google Drive, & logout
    │   │   └── VpnStatusBadge.tsx    # Indikator status VPN
    │   ├── live/                     # Komponen Sesi Rapat
    │   │   ├── LiveControlPanel.tsx  # Tombol kontrol Join, Record, Pause, Stop, Leave
    │   │   ├── TranscribeModePicker.tsx # Modal pemilihan mode Live vs Background
    │   │   ├── TranscriptProcessingLoader.tsx # Animasi kertas & pulpen loading AI
    │   │   ├── LiveTranscriber.tsx   # Panel tampilan transkrip mengalir
    │   │   ├── AudioVisualizer.tsx   # Visualisasi bar gelombang audio real-time
    │   │   ├── ClosureDialog.tsx     # Modal rangkuman rapat & tombol unduh
    │   │   └── HotkeyGuideModal.tsx  # Panduan pintasan keyboard
    │   ├── schedule/                 # Jadwal Pertemuan
    │   │   ├── ScheduleList.tsx      # Daftar agenda rapat
    │   │   └── ScheduleModal.tsx     # Formulir penambahan agenda baru
    │   ├── history/                  # Arsip Riwayat Pertemuan
    │   │   ├── HistoryList.tsx       # Kartu riwayat & tombol aksi
    │   │   └── TranscriptViewerModal.tsx # Penampil detail dialog transkrip
    │   └── common/                   # Komponen UI Reusable
    │       ├── Button.tsx            # Tombol styling standar
    │       ├── Badge.tsx             # Badge penanda status
    │       ├── ConfirmDeleteModal.tsx # Dialog konfirmasi penghapusan data
    │       └── MaterialIcon.tsx      # Pembungkus ikon Google Material Symbols
    │
    ├── hooks/                        # Custom React Hooks
    │   ├── useMeetingBot.ts          # Orkestrator alur kerja bot & transkripsi
    │   └── useHotkeys.ts             # Listener pintasan keyboard global
    │
    ├── services/                     # Layanan Frontend
    │   ├── authService.ts            # Client API auth & penyimpanan token
    │   ├── adminService.ts           # Client API panel administrator
    │   ├── driveService.ts           # Client API integrasi Google Drive
    │   ├── socketClient.ts           # Koneksi client Socket.io terautentikasi
    │   ├── storageService.ts         # Sinkronisasi history & jadwal ke API/MongoDB
    │   ├── exportDocx.ts             # Pembangkit berkas resmi Microsoft Word
    │   └── exportTxt.ts              # Pembangkit berkas Plain Text
    │
    └── types/                        # Definisi Tipe TypeScript
        ├── auth.ts                   # Tipe User, Whitelist, AuthResponse
        ├── meeting.ts                # Tipe status Bot, MeetingData, TranscriptItem
        └── index.ts                  # Re-export tipe global
```

---

## ❓ Troubleshooting & FAQ

### 1. Muncul pesan: "Email Anda belum masuk ke whitelist perusahaan"
**Penyebab**: Sistem menerapkan keamanan ketat agar hanya pengguna terdaftar yang dapat membuat akun.  
**Solusi**:
- Minta Administrator untuk menambahkan alamat email Anda melalui **Admin Panel** ➔ tab **Whitelist Email**.
- Atau jalankan skrip seed database `npm run seed:db` jika Anda sedang dalam lingkungan pengembangan lokal.

---

### 2. Error: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`
**Penyebab**: Layanan database MongoDB belum aktif di komputer Anda.  
**Solusi**:
- Pastikan layanan MongoDB lokal sudah berjalan:
  ```powershell
  # Cek status atau jalankan service MongoDB di Windows:
  net start MongoDB
  ```
- Atau ubah `MONGODB_URI` di file `.env` ke connection string MongoDB Atlas gratis di cloud.

---

### 3. Muncul pesan error "You can't join this meeting" di Google Meet
**Penyebab**: Pengaturan *Host Controls* rapat di Google Meet disetel ke *Restricted* (Dibatasi) sehingga akun tamu ditolak.  
**Solusi**:
- Jalankan `npm run auth:google` untuk login dengan akun Google yang sudah diundang ke rapat tersebut.
- Di layar Host meeting, klik ikon **Gembok 🔒 (Host Controls)** di pojok kanan bawah ➔ Ubah **Meeting Access** menjadi *Open* (Terbuka).

---

### 4. Error Google Drive: `redirect_uri_mismatch` saat menghubungkan Drive
**Penyebab**: URL Callback di Google Cloud Console belum disetel atau berbeda dengan konfigurasi `.env`.  
**Solusi**:
- Buka [Google Cloud Console](https://console.cloud.google.com/) ➔ APIs & Services ➔ Credentials ➔ Edit OAuth 2.0 Client ID Anda.
- Tambahkan URI berikut pada bagian **Authorized redirect URIs**:
  ```text
  http://localhost:3001/api/drive/oauth/callback
  ```
- Pastikan nilai `GOOGLE_DRIVE_REDIRECT_URI` di file `.env` identik.

---

### 5. Error: `EADDRINUSE: address already in use :::3001`
**Penyebab**: Server backend sudah berjalan di jendela terminal lain atau proses Node.js tertinggal di port 3001.  
**Solusi**:
- Di Windows PowerShell, matikan proses yang menggunakan port 3001:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
  ```

---

### 6. Teks transkrip tidak muncul saat status RECORDING
**Penyebab**: API Key Deepgram belum diisi di `.env`, atau tidak ada audio/suara yang masuk (*muted*).  
**Solusi**:
- Pastikan `DEEPGRAM_API_KEY` di file `.env` sudah diisi dengan API Key yang valid dari [Deepgram Console](https://console.deepgram.com/).
- Periksa grafik **Audio Waveform** di panel kontrol; pastikan gelombang bergerak merespons suara rapat.
- Jika menggunakan **Mode Background**, teks memang sengaja tidak muncul secara live dan baru akan diproses secara utuh saat Anda menekan tombol **"STOP & SAVE"**.

---

## 📜 Lisensi & Kontribusi

Proyek ini dikembangkan untuk kebutuhan notulensi rapat otomatis enterprise, transkripsi multilingual presisi tinggi, dan kolaborasi tim terpusat. Dikembangkan dengan prinsip skalabilitas, keamanan role-based, efisiensi resource, dan pengalaman pengguna (*User Experience*) modern.
