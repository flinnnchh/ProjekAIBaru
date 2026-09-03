import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, WhitelistEmail } from '../database';
import { authenticateJWT, generateToken, AuthenticatedRequest } from './authMiddleware';

export const authRouter = express.Router();

/**
 * POST /api/auth/register
 * Mendaftar akun baru — Memvalidasi bahwa email terdaftar di Whitelist Database
 */
authRouter.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    // 1. Validasi input dasar
    if (!email || !password || !displayName) {
      res.status(400).json({
        success: false,
        message: 'Email, password, dan nama tampilan wajib diisi.',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password minimal terdiri dari 6 karakter.',
      });
      return;
    }

    // 2. CEK APAKAH EMAIL ADA DI WHITELIST PERUSAHAAN
    const isWhitelisted = await WhitelistEmail.findOne({ email: cleanEmail });
    if (!isWhitelisted) {
      res.status(403).json({
        success: false,
        message: 'Email tidak terdaftar dalam whitelist perusahaan. Silakan hubungi Administrator untuk menambahkan email Anda.',
      });
      return;
    }

    // 3. Cek apakah email sudah terdaftar sebelumnya
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email ini sudah terdaftar. Silakan langsung login.',
      });
      return;
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Buat user baru di MongoDB
    const newUser = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      displayName: displayName.trim(),
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    // 6. Buat JWT token
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      displayName: newUser.displayName,
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Selamat datang di AI Meeting Bot!',
      token,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error - Register]:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memproses registrasi.',
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Masuk menggunakan email & password
 */
authRouter.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Cari user di database
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah. Pastikan akun sudah terdaftar.',
      });
      return;
    }

    // 2. Cocokkan password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah. Silakan periksa kembali.',
      });
      return;
    }

    // 3. Update waktu login terakhir
    user.lastLogin = new Date();
    await user.save();

    // 4. Generate JWT Token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error - Login]:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memproses login.',
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Mendapatkan profil user yang sedang aktif
 */
authRouter.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error: any) {
    console.error('[Auth Error - Me]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.',
      error: error.message,
    });
  }
});
