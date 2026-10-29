const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const mockProjects = require('../data/mockProjects');
const { enrichProjectInput } = require('../utils/syncEngine');

/**
 * Middleware: Verifikasi PIN Admin Dinas (Mode Demo Juri)
 */
function requireAdminPin(req, res, next) {
  const pin = req.headers['x-admin-pin'] || req.headers['x-pin'];
  if (pin !== '2026') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'PIN Otorisasi Dinas tidak valid. Silakan gunakan PIN Demo Juri: 2026.'
    });
  }
  return next();
}

/**
 * Fetch all projects with their reports from PostgreSQL (or fallback to mockProjects)
 */
async function getProjectsFromSource() {
  try {
    const projectsRes = await db.query(
      `SELECT id, name, loc, category, status, cek, progress, elapsed, sisa, cost, apbd, contractor,
              start, "end", x, y, lat, lng, km, stats
       FROM projects
       ORDER BY CAST(SUBSTRING(id FROM 2) AS INTEGER) ASC`
    );

    const reportsRes = await db.query(
      `SELECT id, project_id, verdict, text, ago, photo, created_at
       FROM reports
       ORDER BY created_at DESC`
    );

    const reportsByProject = {};
    reportsRes.rows.forEach(r => {
      if (!reportsByProject[r.project_id]) {
        reportsByProject[r.project_id] = [];
      }
      reportsByProject[r.project_id].push({
        id: r.id,
        verdict: r.verdict,
        text: r.text,
        ago: r.ago || 'Baru saja',
        photo: r.photo || undefined
      });
    });

    return projectsRes.rows.map(p => ({
      id: p.id,
      name: p.name,
      loc: p.loc,
      category: p.category || 'jalan',
      status: p.status,
      cek: Boolean(p.cek),
      progress: Number(p.progress),
      elapsed: Number(p.elapsed),
      sisa: Number(p.sisa),
      cost: Number(p.cost),
      apbd: Number(p.apbd),
      contractor: p.contractor,
      start: p.start,
      end: p.end,
      x: Number(p.x),
      y: Number(p.y),
      lat: Number(p.lat),
      lng: Number(p.lng),
      km: Number(p.km),
      stats: typeof p.stats === 'string' ? JSON.parse(p.stats) : (p.stats || []),
      reports: reportsByProject[p.id] || []
    }));
  } catch (err) {
    console.warn('⚠️ Database query failed, falling back to mockProjects in-memory:', err.message);
    return mockProjects;
  }
}

/**
 * GET /api/projects
 */
async function getAllProjects(req, res) {
  try {
    const projects = await getProjectsFromSource();
    // Return array directly matching frontend/src/data.ts projects format
    res.json(projects);
  } catch (err) {
    console.error('Error in getAllProjects:', err);
    res.status(500).json({ error: 'Gagal mengambil data proyek', message: err.message });
  }
}

/**
 * GET /api/projects/:id
 */
async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const projects = await getProjectsFromSource();
    const project = projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error in getProjectById:', err);
    res.status(500).json({ error: 'Gagal mengambil detail proyek', message: err.message });
  }
}

/**
 * POST /api/projects/bulk-sync
 * Sinkronisasi Massal Data Dinas (CSV / JSON Bulk Auto-Sync)
 */
async function bulkSyncProjects(req, res) {
  try {
    const { projects } = req.body;
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Data proyek tidak valid atau kosong',
        message: 'Mohon kirim array objek proyek di properti "projects"'
      });
    }

    const existingProjects = await getProjectsFromSource();
    const assignedIds = new Set(existingProjects.map(p => p.id.toLowerCase()));

    let insertedCount = 0;
    let updatedCount = 0;
    const syncedIds = [];
    const enrichedList = [];

    for (const row of projects) {
      const enriched = enrichProjectInput(row, existingProjects, assignedIds);
      if (enriched.isUpdate) {
        updatedCount++;
      } else {
        insertedCount++;
      }
      syncedIds.push(enriched.id);
      enrichedList.push(enriched);

      // 1. Coba simpan ke PostgreSQL Neon
      try {
        await db.query(
          `INSERT INTO projects (
             id, name, loc, category, status, cek, progress, elapsed, sisa, cost, apbd,
             contractor, start, "end", x, y, lat, lng, km, stats
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             loc = EXCLUDED.loc,
             category = EXCLUDED.category,
             status = EXCLUDED.status,
             cek = EXCLUDED.cek,
             progress = EXCLUDED.progress,
             elapsed = EXCLUDED.elapsed,
             sisa = EXCLUDED.sisa,
             cost = EXCLUDED.cost,
             apbd = EXCLUDED.apbd,
             contractor = EXCLUDED.contractor,
             start = EXCLUDED.start,
             "end" = EXCLUDED."end",
             x = EXCLUDED.x,
             y = EXCLUDED.y,
             lat = EXCLUDED.lat,
             lng = EXCLUDED.lng,
             km = EXCLUDED.km,
             stats = EXCLUDED.stats`,
          [
            enriched.id,
            enriched.name,
            enriched.loc,
            enriched.category,
            enriched.status,
            enriched.cek,
            enriched.progress,
            enriched.elapsed,
            enriched.sisa,
            enriched.cost,
            enriched.apbd,
            enriched.contractor,
            enriched.start,
            enriched.end,
            enriched.x,
            enriched.y,
            enriched.lat,
            enriched.lng,
            enriched.km,
            JSON.stringify(enriched.stats)
          ]
        );
      } catch (dbErr) {
        console.warn(`[BulkSync] DB Upsert warn for ${enriched.id}:`, dbErr.message);
      }

      // 2. Simpan juga ke in-memory mockProjects sebagai fallback zero-config
      const mockIdx = mockProjects.findIndex(p => p.id.toLowerCase() === enriched.id.toLowerCase());
      const itemToSave = {
        id: enriched.id,
        name: enriched.name,
        loc: enriched.loc,
        category: enriched.category,
        status: enriched.status,
        cek: enriched.cek,
        progress: enriched.progress,
        elapsed: enriched.elapsed,
        sisa: enriched.sisa,
        cost: enriched.cost,
        apbd: enriched.apbd,
        contractor: enriched.contractor,
        start: enriched.start,
        end: enriched.end,
        x: enriched.x,
        y: enriched.y,
        km: enriched.km,
        lat: enriched.lat,
        lng: enriched.lng,
        stats: enriched.stats,
        reports: (mockIdx >= 0 ? mockProjects[mockIdx].reports : []) || []
      };

      if (mockIdx >= 0) {
        mockProjects[mockIdx] = itemToSave;
      } else {
        mockProjects.push(itemToSave);
      }
    }

    // 3. Persist mockProjects ke file disk mockProjects.js agar tidak hilang saat restart
    try {
      const mockFilePath = path.resolve(__dirname, '../data/mockProjects.js');
      const fileContent = `// mockProjects.js — Updated by Bulk Auto-Sync\n\nmodule.exports = ${JSON.stringify(mockProjects, null, 2)};\n`;
      fs.writeFileSync(mockFilePath, fileContent, 'utf-8');
    } catch (fsErr) {
      console.warn('[BulkSync] File write warn:', fsErr.message);
    }

    // 4. Ambil data terbaru untuk dikembalikan ke client
    const freshProjects = await getProjectsFromSource();

    res.json({
      success: true,
      message: `Sinkronisasi berhasil! ${insertedCount} proyek baru ditambahkan, ${updatedCount} proyek diperbarui.`,
      insertedCount,
      updatedCount,
      syncedIds,
      projects: freshProjects
    });
  } catch (err) {
    console.error('Error in bulkSyncProjects:', err);
    res.status(500).json({
      success: false,
      error: 'Gagal melakukan sinkronisasi proyek',
      message: err.message
    });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectsFromSource,
  requireAdminPin,
  bulkSyncProjects
};
