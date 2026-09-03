import express, { Response } from 'express';
import { Schedule } from '../database';
import { authenticateJWT, AuthenticatedRequest } from '../auth/authMiddleware';

export const scheduleRouter = express.Router();

// Semua endpoint jadwal wajib diautentikasi
scheduleRouter.use(authenticateJWT);

/**
 * GET /api/schedules
 * Mengambil seluruh jadwal meeting milik user yang sedang login
 */
scheduleRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const schedules = await Schedule.find({ userId })
      .sort({ scheduledTime: 1 })
      .lean();

    res.json({
      success: true,
      schedules,
    });
  } catch (error: any) {
    console.error('[Schedule API Error - GET]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal meeting.',
      error: error.message,
    });
  }
});

/**
 * POST /api/schedules
 * Menambahkan jadwal meeting baru
 */
scheduleRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { title, platform, url, scheduledTime, autoRecord, language } = req.body;

    if (!title || !url || !scheduledTime) {
      res.status(400).json({
        success: false,
        message: 'Judul, URL, dan waktu jadwal wajib diisi.',
      });
      return;
    }

    const newSchedule = await Schedule.create({
      userId,
      title: title.trim(),
      platform: platform || '',
      url: url.trim(),
      scheduledTime: new Date(scheduledTime),
      autoRecord: !!autoRecord,
      language: language || 'id',
      status: 'UPCOMING',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Jadwal meeting berhasil ditambahkan.',
      schedule: newSchedule,
    });
  } catch (error: any) {
    console.error('[Schedule API Error - POST]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal meeting.',
      error: error.message,
    });
  }
});

/**
 * PUT /api/schedules/:id
 * Mengupdate status jadwal meeting
 */
scheduleRouter.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const updated = await Schedule.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan atau bukan milik Anda.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Jadwal berhasil diperbarui.',
      schedule: updated,
    });
  } catch (error: any) {
    console.error('[Schedule API Error - PUT]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui jadwal meeting.',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/schedules/:id
 * Menghapus jadwal meeting milik user
 */
scheduleRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const deleted = await Schedule.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan atau bukan milik Anda.',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Jadwal meeting berhasil dihapus.',
    });
  } catch (error: any) {
    console.error('[Schedule API Error - DELETE]:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal meeting.',
      error: error.message,
    });
  }
});
