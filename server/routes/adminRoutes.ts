import express, { Response } from 'express';
import { WhitelistEmail, User, Schedule, MeetingHistory } from '../database';
import { authenticateJWT, AuthenticatedRequest } from '../auth/authMiddleware';

export const createAdminRouter = (sessionManager: any) => {
  const router = express.Router();
  router.use(authenticateJWT);

  // Middleware cek admin role
  const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any) => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Akses khusus Administrator.' });
      return;
    }
    next();
  };

  router.use(requireAdmin);

  /**
   * GET /api/admin/sessions
   * Monitoring semua bot session yang sedang berjalan paralel di server
   */
  router.get('/sessions', (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      activeCount: sessionManager.getActiveCount(),
      maxCapacity: sessionManager.getMaxCapacity(),
      sessions: sessionManager.getAllSessionsSummary(),
    });
  });

  /**
   * GET /api/admin/whitelist
   * Daftar email yang ada di whitelist
   */
  router.get('/whitelist', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const list = await WhitelistEmail.find().sort({ addedAt: -1 }).lean();
      res.json({ success: true, whitelist: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Gagal mengambil whitelist.' });
    }
  });

  /**
   * POST /api/admin/whitelist
   * Menambahkan email baru ke whitelist
   */
  router.post('/whitelist', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, note } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'Email wajib diisi.' });
        return;
      }

      const cleanEmail = email.toLowerCase().trim();
      const existing = await WhitelistEmail.findOne({ email: cleanEmail });
      if (existing) {
        res.status(409).json({ success: false, message: 'Email sudah ada di whitelist.' });
        return;
      }

      const created = await WhitelistEmail.create({
        email: cleanEmail,
        note: note || '',
        addedBy: req.user?.email || 'admin',
        addedAt: new Date(),
      });

      res.status(201).json({ success: true, message: 'Email berhasil ditambahkan ke whitelist.', item: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Gagal menambahkan ke whitelist.' });
    }
  });

  /**
   * DELETE /api/admin/whitelist/:id
   * Hapus Sekaligus (Cascade Delete):
   * Menghapus email dari whitelist sekaligus menghapus akun user, sesi bot aktif, riwayat, dan jadwal meeting terkait.
   */
  router.delete('/whitelist/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const target = await WhitelistEmail.findById(id);

      if (!target) {
        res.status(404).json({ success: false, message: 'Email tidak ditemukan di whitelist.' });
        return;
      }

      // Cegah admin menghapus akunnya sendiri yang sedang aktif digunakan
      if (req.user?.email && target.email.toLowerCase() === req.user.email.toLowerCase()) {
        res.status(400).json({
          success: false,
          message: 'Anda tidak dapat menghapus akun Administrator Anda sendiri saat sedang login.',
        });
        return;
      }

      const cleanEmail = target.email.toLowerCase();

      // 1. Cari akun User terkait
      const user = await User.findOne({ email: cleanEmail });

      if (user) {
        const userIdStr = user._id.toString();

        // 2. Bersihkan & matikan sesi bot aktif jika user sedang meeting
        await sessionManager.removeSession(userIdStr);

        // 3. Hapus jadwal meeting milik user
        await Schedule.deleteMany({ userId: user._id });

        // 4. Hapus riwayat meeting & transkrip milik user
        await MeetingHistory.deleteMany({ userId: user._id });

        // 5. Hapus akun User dari database
        await User.findByIdAndDelete(user._id);

        console.log(`[Admin] 🗑️ Cascade Delete: Akun ${cleanEmail} (ID: ${userIdStr}) dan semua datanya dihapus.`);
      }

      // 6. Hapus dari daftar Whitelist
      await WhitelistEmail.findByIdAndDelete(id);

      res.json({
        success: true,
        message: user
          ? `Akun ${cleanEmail} dan seluruh data sesi, riwayat, serta izin whitelist berhasil dihapus total.`
          : `Email ${cleanEmail} berhasil dihapus dari whitelist.`,
      });
    } catch (err: any) {
      console.error('[Admin] Error deleting whitelist and user:', err);
      res.status(500).json({ success: false, message: 'Gagal menghapus akun dan whitelist.' });
    }
  });

  return router;
};

