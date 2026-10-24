const db = require('../config/db');
const mockProjects = require('../data/mockProjects');
const { calculatePersonalTax } = require('../utils/taxConverter');

/**
 * POST /api/calculator/personal-tax
 */
async function calculateUserTax(req, res) {
  try {
    const { coffee_per_week = 0, vehicle_type = 'none', house_type = 'kos', selected_project_id = 1 } = req.body;

    let project = null;
    try {
      const pRes = await db.query('SELECT * FROM projects WHERE id = $1', [Number(selected_project_id) || 1]);
      if (pRes.rows.length > 0) {
        project = pRes.rows[0];
      }
    } catch (dbErr) {
      console.warn('DB lookup failed in calculator, using mockProjects:', dbErr.message);
    }

    if (!project) {
      project = mockProjects.find(p => p.id === (Number(selected_project_id) || 1)) || mockProjects[0];
    }

    const result = calculatePersonalTax(
      {
        coffee_per_week: Number(coffee_per_week) || 0,
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
    console.error('Error in calculateUserTax:', err);
    res.status(500).json({ success: false, message: 'Gagal menghitung kalkulasi pajak', error: err.message });
  }
}

module.exports = {
  calculateUserTax
};
