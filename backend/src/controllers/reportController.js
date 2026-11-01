const db = require('../config/db');
const mockProjects = require('../data/mockProjects');

/**
 * POST /api/projects/:id/reports
 * Accepts: { verdict: 'sesuai' | 'tidak', text: string, photo?: string }
 */
async function addProjectReport(req, res) {
  try {
    const id = String(req.params.id || '').trim();
    const { verdict, text, photo } = req.body || {};

    if (!id || id.length > 50) {
      return res.status(400).json({ error: 'ID proyek tidak valid' });
    }

    if (!verdict || !['sesuai', 'tidak'].includes(verdict)) {
      return res.status(400).json({ error: 'Verdict harus berupa "sesuai" atau "tidak"' });
    }

    const reportId = 'r' + Date.now();
    const rawText = text && String(text).trim() !== ''
      ? String(text).trim().slice(0, 500)
      : (verdict === 'sesuai' ? 'Kondisi sesuai laporan.' : 'Kondisi tidak sesuai laporan.');

    let photoUrl = null;
    if (photo && typeof photo === 'string') {
      const trimmedPhoto = photo.trim();
      if (
        trimmedPhoto.length <= 1500000 &&
        (trimmedPhoto.startsWith('data:image/') ||
          trimmedPhoto.startsWith('http://') ||
          trimmedPhoto.startsWith('https://') ||
          trimmedPhoto.startsWith('blob:'))
      ) {
        photoUrl = trimmedPhoto;
      }
    }

    const ago = 'Baru saja';

    const insertedReport = {
      id: reportId,
      project_id: id,
      verdict,
      text: rawText,
      ago,
      photo: photoUrl
    };

    // 1. Insert report into DB
    try {
      await db.query(
        `INSERT INTO reports (id, project_id, verdict, text, ago, photo, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [reportId, id, verdict, rawText, ago, photoUrl]
      );

      // 2. If verdict is 'tidak', automatically update project cek = true
      if (verdict === 'tidak') {
        await db.query(`UPDATE projects SET cek = true WHERE id = $1`, [id]);
      }
    } catch (dbErr) {
      console.warn('⚠️ DB insert report failed, updating in-memory:', dbErr.message);
    }

    // 3. Keep in-memory mockProjects in sync
    const mockP = mockProjects.find(p => p.id === id);
    if (mockP) {
      if (verdict === 'tidak') {
        mockP.cek = true;
      }
      mockP.reports.unshift(insertedReport);
    }

    res.status(201).json({
      success: true,
      message: 'Laporan lapangan berhasil disimpan',
      report: insertedReport,
      cekUpdated: verdict === 'tidak'
    });
  } catch (err) {
    console.error('Error in addProjectReport:', err.message);
    res.status(500).json({ error: 'Gagal menyimpan laporan' });
  }
}

module.exports = {
  addProjectReport
};
