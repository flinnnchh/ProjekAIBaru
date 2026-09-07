# 📘 Panduan Lengkap Integrasi Google & Serah Terima Perusahaan (Handover Guide)

Dokumen ini menjelaskan secara menyeluruh tentang **arsitektur integrasi Google (Google Meet Bot & Google Drive API)**, **alur kerja pengunggahan dokumen notula rapat**, serta **panduan langkah demi langkah serah terima (*handover*) ke tim IT perusahaan**.

---

## 📑 Daftar Isi
1. [Arsitektur & Pemisahan Akun Google](#1-arsitektur--pemisahan-akun-google)
2. [Cara Kerja Upload ke Google Drive](#2-cara-kerja-upload-ke-google-drive)
3. [Penyebab Akun Drive Bisa Berbeda dengan Login Web](#3-penyebab-akun-drive-bisa-berbeda-dengan-login-web)
4. [Mengapa Saat Testing Terbatas pada Akun Tertentu?](#4-mengapa-saat-testing-terbatas-pada-akun-tertentu)
5. [Solusi Handover: Akses Tanpa Perlu Didaftarkan Manual](#5-solusi-handover-akses-tanpa-perlu-didaftarkan-manual)
6. [Langkah demi Langkah Setup Google Cloud Perusahaan (Checklist Handover)](#6-langkah-demi-langkah-setup-google-cloud-perusahaan-checklist-handover)
7. [FAQ & Troubleshooting](#7-faq--troubleshooting)

---

## 1. Arsitektur & Pemisahan Akun Google

Sistem ini memiliki **dua fungsi Google yang bekerja secara independen**:

| Komponen | Peran | Metode Autentikasi | Lokasi Penyimpanan Kredensial |
| :--- | :--- | :--- | :--- |
| **1. Bot Google Meet** | Masuk ke ruang rapat Google Meet sebagai peserta / notulis otomatis, mendengarkan percakapan, dan menangkap audio/caption. | Browser Session (Playwright State / Cookies) | File lokal server: `google_auth.json` |
| **2. Google Drive Backup** | Menyimpan berkas notula resmi (`.docx` / `.txt`) ke akun Google Drive milik pengguna yang sedang login di dashboard web. | Google OAuth 2.0 API (Drive API v3) | Database MongoDB pada dokumen user (`User.googleDrive`) |

> 💡 **Penting:** Bot Google Meet **tidak pernah** mengunggah file langsung ke Google Drive miliknya sendiri. Pengunggahan dilakukan oleh **Server Backend** ke akun Google Drive milik **masing-masing pengguna web** yang telah menautkan akunnya.

---

## 2. Cara Kerja Upload ke Google Drive

Bukan bot yang membuka browser Google Drive secara visual untuk mengklik tombol upload, melainkan **Backend Server langsung berkomunikasi dengan Google Drive API v3 secara aman di latar belakang**.

```
┌─────────────────────────┐
│     BOT GOOGLE MEET     │
│ (Sebagai Notulis Rapat) │
└────────────┬────────────┘
             │ 1. Kirim transkrip live kata per kata
             ▼
┌─────────────────────────┐       2. Tampilkan di UI       ┌────────────────────────┐
│     BACKEND SERVER      │ ─────────────────────────────> │  DASHBOARD WEB (USER)  │
│  (Express + MongoDB)    │                                │                        │
│                         │ <───────────────────────────── │ - Klik "Upload Drive"  │
└────────────┬────────────┘     3. Kirim permintaan upload  └────────────────────────┘
             │                     beserta data dokumen
             │
             │ 4. Panggil Google Drive API v3 menggunakan Refresh Token user
             ▼
┌─────────────────────────┐
│     GOOGLE DRIVE        │
│ - Buat folder otomatis: │
│   "AI Meeting           │
│    Transcripts"         │
│ - Upload MoM .docx/.txt │
└─────────────────────────┘
```

### Tahapan Teknis:
1. **Otorisasi Awal (One-Click OAuth 2.0):**
   - Pengguna menekan tombol **"Hubungkan Google Drive"** di Navbar atau dialog penutupan meeting.
   - Popup otorisasi Google terbuka (`accounts.google.com`).
   - Pengguna memberikan izin akses `drive.file` dan profil email.
   - Backend menerima kode otorisasi dan menukarkannya dengan `access_token` & `refresh_token`, lalu menyimpannya di database MongoDB (`User.googleDrive`).
2. **Saat Ekspor / Upload Berkas:**
   - Web mengompilasi transkrip menjadi berkas Word (`.docx`) atau teks (`.txt`).
   - Dokumen dikirim ke endpoint server `/api/drive/upload`.
   - Server mengecek apakah folder **`AI Meeting Transcripts`** sudah ada di Google Drive akun tersebut. Jika belum ada, folder akan dibuat secara otomatis.
   - Berkas diunggah langsung ke dalam folder tersebut dan server mengembalikan tautan pratinjau (`webViewLink`).

---

## 3. Penyebab Akun Drive Bisa Berbeda dengan Login Web

Seringkali muncul situasi: *“Saya login ke aplikasi web menggunakan email perusahaan, tetapi saat klik Google Drive, yang terhubung malah akun Google pribadi (@gmail.com)?”*

Hal ini wajar karena:
1. **Sistem Login Berbeda:**
   - Login ke aplikasi web menggunakan autentikasi akun internal (email & password yang tersimpan di MongoDB aplikasi).
   - Otorisasi Google Drive membaca **sesi akun Google yang sedang aktif di peramban (Chrome/Edge)** yang Anda gunakan. Jika Chrome Anda default-nya login ke akun Gmail pribadi, Google akan otomatis menawarkan akun tersebut.
2. **Fleksibilitas Pengguna:**
   - Sistem sengaja dibuat fleksibel agar setiap pengguna bisa memilih apakah notula rapat ingin diarsipkan ke Google Drive kantor atau Google Drive tim/pribadi.
3. **Cara Mengganti Akun:**
   - Di dashboard aplikasi, klik status Google Drive di Navbar ➔ Pilih **"Putuskan / Disconnect"**.
   - Pastikan di tab browser lain Anda sudah login ke akun Google perusahaan yang diinginkan.
   - Klik **"Hubungkan Google Drive"** kembali dan pilih akun yang tepat di jendela popup.

---

## 4. Mengapa Saat Testing Terbatas pada Akun Tertentu?

Dalam masa pengembangan (*development / testing*), Google Cloud Console memiliki status publikasi:
* **Publishing Status: `Testing`**
* Pada mode ini, Google memberlakukan kebijakan keamanan ketat: **Hanya akun-akun yang didaftarkan ke dalam daftar "Test Users" (maksimal 100 email) yang dapat memberikan izin koneksi.**
* Akun lain di luar daftar tersebut akan mendapati pesan error: `Error 403: access_denied (The developer hasn’t given you access to this app)`.

---

## 5. Solusi Handover: Akses Tanpa Perlu Didaftarkan Manual

Saat aplikasi diserahkan ke perusahaan, tim IT tidak perlu repot mendaftarkan email karyawan satu per satu. Ada dua pilihan konfigurasi di Google Cloud Console:

### Opsi A: Tipe "Internal" (Sangat Disarankan untuk Google Workspace Perusahaan)
Jika perusahaan memiliki domain email kantor sendiri (misalnya `@perusahaan.com` / `@pt-corporate.co.id`):
* Pada saat pembuatan **OAuth consent screen**, pilih User Type: **`Internal`**.
* **Keuntungan:**
  1. **Otomatis Tanpa Pendaftaran:** Semua karyawan yang memiliki email berakhiran `@perusahaan.com` dapat langsung menghubungkan Google Drive tanpa perlu didaftarkan satu per satu di GCP.
  2. **Tanpa Peringatan Google (*Zero Warning*):** Pengguna tidak akan melihat layar peringatan *"Google hasn't verified this app"*.
  3. **Keamanan Maksimal:** Akun Google luar di luar domain perusahaan secara otomatis dicegah mengakses API ini.

### Opsi B: Ubah Status Menjadi "In Production" (Jika Menggunakan Gmail Biasa / Multi-Domain)
Jika karyawan menggunakan campuran email Gmail pribadi atau domain yang berbeda-beda:
1. Buka Google Cloud Console ➔ **APIs & Services** ➔ **OAuth consent screen**.
2. Klik tombol **"Publish App"** (mengubah status dari *Testing* menjadi *In Production*).
3. **Keuntungan:** Siapa pun pengguna Google dapat menautkan akun tanpa pembatasan daftar Test Users.
4. **Mengenai Verifikasi Google:**
   - Aplikasi ini hanya menggunakan scope: `https://www.googleapis.com/auth/drive.file`.
   - Scope ini dikategorikan oleh Google sebagai **Non-Sensitive Scope** (hanya mengakses berkas yang dibuat oleh aplikasi ini, tidak membaca isi drive lain milik pengguna).
   - Karena itu, aplikasi ini tidak memerlukan proses verifikasi audit keamanan berbayar yang rumit.

---

## 6. Langkah demi Langkah Setup Google Cloud Perusahaan (Checklist Handover)

Berikut panduan yang dapat diberikan kepada tim IT / DevOps perusahaan saat serah terima:

### Langkah 1: Buat Project Baru di Google Cloud
1. Masuk ke [Google Cloud Console](https://console.cloud.google.com/) menggunakan akun Google Admin / IT Perusahaan.
2. Klik dropdown project di bagian atas ➔ **New Project**.
3. Berikan nama, misalnya: `AI-Meeting-Bot-Enterprise`, lalu klik **Create**.

### Langkah 2: Aktifkan Google Drive API
1. Buka menu navigasi ➔ **APIs & Services** ➔ **Library**.
2. Cari **"Google Drive API"**.
3. Klik **Enable**.

### Langkah 3: Konfigurasi OAuth Consent Screen
1. Buka menu **APIs & Services** ➔ **OAuth consent screen**.
2. Pilih **User Type**:
   - Pilih **Internal** (jika perusahaan menggunakan Google Workspace).
   - Atau pilih **External** lalu klik **Publish App** (jika menggunakan domain bebas).
3. Isi data aplikasi:
   - **App name:** `AI Meeting Transcripts System`
   - **User support email:** (Email tim IT / admin)
   - **Developer contact information:** (Email penanggung jawab IT)
4. Klik **Save and Continue**.
5. Pada bagian **Scopes**, klik **Add or Remove Scopes**:
   - Centang: `.../auth/drive.file` (Create, edit, and delete only the specific Google Drive files you use with this app).
   - Centang: `.../auth/userinfo.email`
   - Centang: `.../auth/userinfo.profile`
6. Klik **Save and Continue** hingga selesai.

### Langkah 4: Buat Kredensial OAuth Client ID
1. Buka menu **APIs & Services** ➔ **Credentials**.
2. Klik **+ Create Credentials** ➔ **OAuth client ID**.
3. Pilih **Application type:** `Web application`.
4. Berikan nama, misalnya: `Meeting Transcriber Web Client`.
5. Pada bagian **Authorized redirect URIs**, klik **+ Add URI** dan masukkan:
   ```
   http://<domain-atau-ip-server>:3001/api/drive/oauth/callback
   ```
   *(Contoh untuk produksi: `https://meeting.perusahaan.com/api/drive/oauth/callback`)*
6. Klik **Create**.
7. Salin **Client ID** dan **Client Secret** yang ditampilkan.

### Langkah 5: Pasang Kredensial di File `.env` Server
Buka file `.env` di direktori proyek server aplikasi, lalu perbarui variabel berikut dengan kredensial baru dari perusahaan:

```env
# ============================================================================
# GOOGLE DRIVE OAUTH 2.0 (KREDENSIAL RESMI PERUSAHAAN)
# ============================================================================
GOOGLE_CLIENT_ID=isi_dengan_client_id_dari_it_perusahaan.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=isi_dengan_client_secret_dari_it_perusahaan
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:3001/api/drive/oauth/callback
```
*(Ganti `http://localhost:3001` dengan domain/IP server jika sudah di-deploy ke server produksi).*

### Langkah 6: Login Akun Bot Google Meet (Opsional untuk Bot)
Jika bot meeting juga ingin menggunakan akun Google resmi perusahaan:
1. Jalankan script otorisasi bot:
   ```bash
   npx ts-node server/googleAuthHelper.ts
   ```
2. Jendela browser Chrome akan terbuka. Login menggunakan akun Google yang dialokasikan perusahaan untuk bot rapat.
3. Setelah login berhasil, sesi akan tersimpan otomatis di `google_auth.json`.
4. Bot siap join ke seluruh link Google Meet kantor tanpa terkendala perizinan tamu.

---

## 7. FAQ & Troubleshooting

#### Q: Apakah file notula rapat bisa diakses oleh orang lain di Google Drive?
**A:** Tidak. File tersimpan di Google Drive pribadi masing-masing pengguna yang menghubungkan akunnya. Hak akses berkas mengikuti pengaturan standar Google Drive pengguna tersebut.

#### Q: Bagaimana jika token akses kedaluwarsa?
**A:** Sistem telah dilengkapi mekanisme pembaruan otomatis (*automatic token refresh*). Begitu `access_token` habis masa berlakunya, backend akan otomatis menggunakan `refresh_token` yang tersimpan di MongoDB untuk meminta token baru ke Google tanpa meminta user login ulang.

#### Q: Apakah ada biaya untuk menggunakan Google Drive API?
**A:** Penggunaan Google Drive API untuk mengunggah dokumen notula rapat (`.docx` / `.txt`) termasuk dalam kuota gratis (*free tier*) Google Cloud yang sangat besar (jutaan request per hari), sehingga tidak menimbulkan biaya tambahan.
