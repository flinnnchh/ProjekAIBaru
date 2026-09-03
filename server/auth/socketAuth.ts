import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from './authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-meeting-bot-secret-key-ganti-ini-dengan-string-random';

/**
 * Middleware Socket.IO untuk mengautentikasi token JWT saat handshake koneksi
 */
export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    console.warn(`[Socket Auth] ⚠️ Koneksi ditolak: Token tidak ditemukan (${socket.id})`);
    return next(new Error('Koneksi tidak terautentikasi. Token tidak ditemukan.'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    socket.data.user = decoded;
    socket.data.userId = decoded.userId;
    console.log(`[Socket Auth] ✅ Autentikasi berhasil untuk user: ${decoded.displayName} (${decoded.email})`);
    next();
  } catch (err: any) {
    console.warn(`[Socket Auth] ⚠️ Koneksi ditolak: Token tidak valid (${err.message})`);
    next(new Error('Sesi tidak valid atau telah kedaluwarsa.'));
  }
}
