/**
 * Seed Script: Mengisi data awal ke MongoDB
 * 
 * Jalankan: npx tsx server/database/seed.ts
 * 
 * Script ini akan:
 * 1. Menambahkan email-email ke whitelist (yang boleh register)
 * 2. Membuat akun admin default
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './connection';
import { User } from './models/User';
import { WhitelistEmail } from './models/WhitelistEmail';

dotenv.config();

// ========================================
// ⚙️ KONFIGURASI: Edit daftar email di bawah ini
// ========================================

/**
 * Daftar email yang diizinkan untuk register di aplikasi.
 * Tambahkan email karyawan/tim Anda di sini.
 */
const WHITELIST_EMAILS = [
  { email: 'admin@perusahaan.com', note: 'Admin utama' },
  { email: 'botnotulenlui@gmail.com', note: 'Bot Account' },
  { email: 'admin1@perusahaan.com', note: 'Akun Testing Admin1' },
  { email: 'admin2@perusahaan.com', note: 'Akun Testing Admin2' },
  // Tambahkan email lainnya di bawah ini:
  // { email: 'user1@perusahaan.com', note: 'Tim Engineering' },
  // { email: 'user2@perusahaan.com', note: 'Tim Product' },
];

/**
 * Akun-akun default yang dibuat otomatis.
 * GANTI password setelah login pertama kali!
 */
const DEFAULT_USERS = [
  {
    email: 'admin@perusahaan.com',
    password: 'admin123',
    displayName: 'Administrator',
    role: 'admin' as const,
  },
  {
    email: 'admin1@perusahaan.com',
    password: 'admin123',
    displayName: 'User 1',
    role: 'user' as const,
  },
  {
    email: 'admin2@perusahaan.com',
    password: 'admin123',
    displayName: 'User 2',
    role: 'user' as const,
  },
];

// ========================================

async function seed() {
  console.log('\n🌱 === SEED SCRIPT: Mengisi Data Awal MongoDB ===\n');

  await connectDatabase();

  // 1. Seed Whitelist Emails
  console.log('📧 [Step 1] Menambahkan whitelist emails...');
  let whitelistAdded = 0;
  for (const item of WHITELIST_EMAILS) {
    const exists = await WhitelistEmail.findOne({ email: item.email.toLowerCase() });
    if (!exists) {
      await WhitelistEmail.create({
        email: item.email.toLowerCase(),
        addedBy: 'seed-script',
        note: item.note || '',
      });
      console.log(`   ✅ Ditambahkan: ${item.email}`);
      whitelistAdded++;
    } else {
      console.log(`   ⏭️  Sudah ada: ${item.email}`);
    }
  }
  console.log(`   Total ditambahkan: ${whitelistAdded} email\n`);

  // 2. Seed User Accounts
  console.log('👤 [Step 2] Membuat akun-akun default...');
  for (const userData of DEFAULT_USERS) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      await User.create({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        displayName: userData.displayName,
        role: userData.role,
      });
      console.log(`   ✅ Dibuat: ${userData.displayName} (${userData.email}) — role: ${userData.role}`);
    } else {
      console.log(`   ⏭️  Sudah ada: ${userData.displayName} (${userData.email})`);
    }
  }

  // 3. Tampilkan ringkasan
  const totalUsers = await User.countDocuments();
  const totalWhitelist = await WhitelistEmail.countDocuments();

  console.log('\n📊 === RINGKASAN DATABASE ===');
  console.log(`   Total Users      : ${totalUsers}`);
  console.log(`   Total Whitelist  : ${totalWhitelist}`);
  console.log(`   Database         : ${mongoose.connection.db?.databaseName || 'ai_meeting_bot'}`);
  console.log('=============================\n');

  await disconnectDatabase();
  console.log('✅ Seed selesai!\n');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
