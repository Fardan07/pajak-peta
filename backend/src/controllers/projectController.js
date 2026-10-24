const db = require('../config/db');
const mockProjects = require('../data/mockProjects');

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

module.exports = {
  getAllProjects,
  getProjectById,
  getProjectsFromSource
};
