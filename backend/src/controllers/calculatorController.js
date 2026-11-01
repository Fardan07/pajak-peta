const db = require('../config/db');
const mockProjects = require('../data/mockProjects');
const { calculatePersonalTax } = require('../utils/taxConverter');

/**
 * POST /api/calculator/personal-tax
 */
async function calculateUserTax(req, res) {
  try {
    const {
      coffee_per_week = 0,
      vehicle_type = 'none',
      house_type = 'kos',
      selected_project_id = 'p1'
    } = req.body || {};

    const targetId = String(selected_project_id || 'p1').trim();

    let project = null;
    try {
      const pRes = await db.query('SELECT * FROM projects WHERE id = $1', [targetId]);
      if (pRes.rows.length > 0) {
        project = pRes.rows[0];
      }
    } catch (dbErr) {
      console.warn('DB lookup failed in calculator, using mockProjects:', dbErr.message);
    }

    if (!project) {
      project =
        mockProjects.find(p => String(p.id) === targetId) || mockProjects[0];
    }

    const result = calculatePersonalTax(
      {
        coffee_per_week: Math.max(0, Math.min(100, Number(coffee_per_week) || 0)),
        vehicle_type,
        house_type,
        selected_project_id: project.id
      },
      project
    );

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error in calculateUserTax:', err.message);
    res.status(500).json({
      success: false,
      message: 'Gagal menghitung kalkulasi pajak'
    });
  }
}

module.exports = {
  calculateUserTax
};
