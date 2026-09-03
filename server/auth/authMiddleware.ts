import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-meeting-bot-secret-key-ganti-ini-dengan-string-random';

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  displayName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

/**
 * Middleware untuk memvalidasi JWT token pada protected REST API endpoints
 */
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Sesi login telah kedaluwarsa atau token tidak valid. Silakan login kembali.',
    });
  }
}

/**
 * Helper untuk generate JWT token
 */
export function generateToken(payload: AuthUserPayload): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}
