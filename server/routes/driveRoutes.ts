import { Router, Request, Response } from 'express';
import { googleDriveService } from '../services/GoogleDriveService';
import { authenticateJWT, AuthenticatedRequest } from '../auth/authMiddleware';
import { User } from '../database/models/User';

const router = Router();

/**
 * GET /api/drive/auth-url
 * Get OAuth 2.0 URL to start Google Drive connection
 */
router.get('/auth-url', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
      return;
    }


    const authUrl = googleDriveService.generateAuthUrl(userId);
    res.json({ success: true, authUrl });
  } catch (err: any) {
    console.error('[DriveRoutes] Error generate auth url:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal membuat Google Auth URL' });
  }
});

/**
 * GET /api/drive/oauth/callback
 * Google OAuth 2.0 callback endpoint
 */
router.get('/oauth/callback', async (req: Request, res: Response): Promise<void> => {
  const { code, state, error } = req.query;

  if (error || !code) {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Google Drive Gagal Terhubung</title></head>
      <body style="font-family:sans-serif; background:#0B1220; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
        <div style="text-align:center; padding:30px; background:#141E33; border-radius:16px; border:1px solid #FF8E9D; max-width:400px;">
          <h2 style="color:#FF8E9D;">Koneksi Dibatalkan / Gagal</h2>
          <p style="color:#8A94A3; font-size:14px;">Izin Google Drive tidak diberikan.</p>
          <button onclick="window.close()" style="background:#233863; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; margin-top:15px;">Tutup Jendela</button>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_DRIVE_FAILED', message: '${error || 'Akses ditolak'}' }, '*');
          }
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
    return;
  }

  try {
    const userId = String(state);
    const result = await googleDriveService.handleOAuthCallback(String(code), userId);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Drive Berhasil Terhubung</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #0B1220; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { text-align: center; padding: 36px 28px; background: #141E33; border-radius: 20px; border: 1px solid #3DD6E8; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .badge { background: #1A2845; color: #3DD6E8; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: bold; display: inline-block; margin-bottom: 12px; border: 1px solid #3DD6E8/30; }
          h2 { color: #fff; margin: 0 0 8px 0; font-size: 20px; }
          p { color: #8A94A3; font-size: 14px; margin: 0 0 20px 0; }
          .email { color: #F5B400; font-weight: bold; }
          button { background: linear-gradient(135deg, #233863, #3DD6E8); color: #fff; border: none; padding: 10px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Google Drive Terhubung 🎉</div>
          <h2>Berhasil Tersambung!</h2>
          <p>Akun <span class="email">${result.email || ''}</span> siap menerima berkas transkrip otomatis.</p>
          <button onclick="window.close()">Tutup Jendela</button>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_DRIVE_CONNECTED', email: '${result.email || ''}' }, '*');
          }
          setTimeout(() => {
            window.close();
          }, 2000);
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[DriveRoutes] Error handling OAuth callback:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family:sans-serif; background:#0B1220; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
        <div style="text-align:center; padding:30px; background:#141E33; border-radius:16px; border:1px solid #FF8E9D; max-width:400px;">
          <h2 style="color:#FF8E9D;">Gagal Menghubungkan Drive</h2>
          <p style="color:#8A94A3; font-size:13px;">${err.message || 'Terjadi kesalahan sistem.'}</p>
          <button onclick="window.close()" style="background:#233863; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">Tutup</button>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * GET /api/drive/status
 * Get current Google Drive connection status
 */
router.get('/status', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    const user = await User.findById(userId);

    if (!user || !user.googleDrive?.connected) {
      res.json({ success: true, connected: false });
      return;
    }

    res.json({
      success: true,
      connected: true,
      email: user.googleDrive.connectedEmail,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Gagal mengecek status Google Drive' });
  }
});

/**
 * POST /api/drive/disconnect
 * Disconnect user's Google Drive
 */
router.post('/disconnect', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
      return;
    }

    await googleDriveService.disconnectUserDrive(userId);
    res.json({ success: true, message: 'Google Drive berhasil diputus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Gagal memutuskan Google Drive' });
  }
});

/**
 * POST /api/drive/upload
 * Upload base64 buffer or raw text to Google Drive
 */
router.post('/upload', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId || (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
      return;
    }


    const { fileName, mimeType, base64Data, textContent } = req.body;

    if (!fileName) {
      res.status(400).json({ success: false, message: 'Nama berkas (fileName) wajib disertakan' });
      return;
    }

    let buffer: Buffer;
    let actualMimeType = mimeType || 'text/plain';

    if (base64Data) {
      buffer = Buffer.from(base64Data, 'base64');
    } else if (textContent) {
      buffer = Buffer.from(textContent, 'utf-8');
      actualMimeType = 'text/plain;charset=utf-8';
    } else {
      res.status(400).json({ success: false, message: 'Konten berkas (base64Data atau textContent) wajib disertakan' });
      return;
    }

    const uploadResult = await googleDriveService.uploadMeetingFile(userId, {
      fileName,
      mimeType: actualMimeType,
      buffer,
    });

    res.json({
      success: true,
      message: 'Berkas berhasil diunggah ke Google Drive!',
      ...uploadResult,
    });
  } catch (err: any) {
    console.error('[DriveRoutes] Upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal mengunggah berkas ke Google Drive',
    });
  }
});

export default router;
