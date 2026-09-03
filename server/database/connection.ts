import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_meeting_bot';

/**
 * Menghubungkan ke MongoDB menggunakan Mongoose.
 * Auto-reconnect jika koneksi putus.
 */
export async function connectDatabase(): Promise<void> {
  try {
    console.log(`[MongoDB] Menghubungkan ke database: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}...`);

    await mongoose.connect(MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('[MongoDB] ✅ Berhasil terhubung ke database!');
    console.log(`[MongoDB] Database: ${mongoose.connection.db?.databaseName || 'ai_meeting_bot'}`);
  } catch (error) {
    console.error('[MongoDB] ❌ Gagal terhubung ke database:', error);
    console.error('[MongoDB] Pastikan MongoDB server berjalan di komputer Anda.');
    console.error('[MongoDB] Jalankan: net start MongoDB (Windows) atau sudo systemctl start mongod (Linux)');
    process.exit(1);
  }

  // Event listeners untuk monitoring koneksi
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] ❌ Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] ⚠️ Disconnected dari database. Mencoba reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] 🔄 Berhasil reconnect ke database!');
  });
}

/**
 * Menutup koneksi MongoDB dengan aman (dipanggil saat server shutdown)
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Koneksi database ditutup dengan aman.');
  } catch (error) {
    console.error('[MongoDB] Error saat menutup koneksi:', error);
  }
}

/**
 * Cek status koneksi MongoDB
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
