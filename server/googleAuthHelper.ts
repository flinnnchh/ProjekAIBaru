import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join(process.cwd(), 'google_auth.json');

async function loginGoogleAccount() {
  console.log('\n=============================================================');
  console.log('  🤖 AI MEETING BOT - GOOGLE ACCOUNT AUTHENTICATION HELPER');
  console.log('=============================================================');
  console.log('1. Jendela browser Chrome akan terbuka.');
  console.log('2. Silakan login dengan akun Google yang ingin digunakan oleh bot.');
  console.log('3. Selesaikan verifikasi 2FA jika diminta.');
  console.log('4. Setelah berhasil masuk ke akun Google, tutup jendela browser.');
  console.log('=============================================================\n');

  const browser = await chromium.launch({
    headless: false, // Buka browser visual agar user bisa login
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,800'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  await page.goto('https://accounts.google.com/', { waitUntil: 'domcontentloaded' });

  // Tunggu sampai user selesai login atau menutup browser
  await new Promise<void>((resolve) => {
    browser.on('disconnected', () => {
      resolve();
    });

    // Cek berkala apakah sudah di dashboard google
    const checkInterval = setInterval(async () => {
      try {
        const url = page.url();
        if (url.includes('myaccount.google.com') || url.includes('google.com/?')) {
          console.log('\n✅ Login berhasil terdeteksi!');
          console.log(`💾 Menyimpan sesi ke file: ${AUTH_FILE}`);
          await context.storageState({ path: AUTH_FILE });
          clearInterval(checkInterval);
          console.log('🎉 Selesai! Bot sekarang siap menggunakan akun Google ini.\n');
          await browser.close();
          resolve();
        }
      } catch {
        // Browser closed by user
        clearInterval(checkInterval);
        resolve();
      }
    }, 2000);
  });

  if (fs.existsSync(AUTH_FILE)) {
    console.log(`\n[SUCCESS] File sesi tersimpan di: ${AUTH_FILE}`);
  }
}

loginGoogleAccount().catch((err) => {
  console.error('Error saat proses autentikasi Google:', err);
});
