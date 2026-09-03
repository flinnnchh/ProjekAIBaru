import express, { Response } from 'express';
import { MeetingHistory } from '../database';
import { authenticateJWT, AuthenticatedRequest } from '../auth/authMiddleware';

export const historyRouter = express.Router();

// Semua endpoint history wajib diautentikasi
historyRouter.use(authenticateJWT);

/**
 * GET /api/history
 * Mengambil daftar riwayat meeting milik user yang sedang login
 */
historyRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const history = await MeetingHistory.find({ userId })
      .sort({ date: -1 })
      .lean();

    res.json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error('[History API Error - GET]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data riwayat meeting.',
      error: error.message,
    });
  }
});

/**
 * POST /api/history
 * Menyimpan riwayat meeting baru untuk user yang sedang login
 */
historyRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const {
      title,
      platform,
      url,
      date,
      durationSeconds,
      totalWords,
      speakersCount,
      participants,
      languages,
      transcriptSnippet,
      transcripts,
    } = req.body;

    const newHistory = await MeetingHistory.create({
      userId,
      title: title || 'Sesi Meeting Live',
      platform: platform || '',
      url: url || '',
      date: date ? new Date(date) : new Date(),
      durationSeconds: durationSeconds || 0,
      totalWords: totalWords || 0,
      speakersCount: speakersCount || (participants?.length || 1),
      participants: participants || [],
      languages: languages || ['id', 'en'],
      transcriptSnippet: transcriptSnippet || '',
      transcripts: transcripts || [],
    });


    res.status(201).json({
      success: true,
      message: 'Riwayat meeting berhasil disimpan ke database.',
      historyItem: newHistory,
    });
  } catch (error: any) {
    console.error('[History API Error - POST]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan riwayat meeting.',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/history/:id
 * Menghapus 1 item riwayat meeting (hanya bisa menghapus milik sendiri)
 */
historyRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const deleted = await MeetingHistory.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Item riwayat tidak ditemukan atau bukan milik Anda.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Item riwayat berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[History API Error - DELETE]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus riwayat meeting.',
      error: error.message,
    });
  }
});
