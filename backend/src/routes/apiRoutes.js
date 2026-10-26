const express = require('express');
const router = express.Router();

const {
  getAllProjects,
  getProjectById,
  requireAdminPin,
  bulkSyncProjects
} = require('../controllers/projectController');

const { addProjectReport } = require('../controllers/reportController');

// Project routes
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);

// Admin Bulk Sync with One-Click PIN Gate
router.post('/projects/bulk-sync', requireAdminPin, bulkSyncProjects);

// Field check reports from CekLapangan
router.post('/projects/:id/reports', addProjectReport);

module.exports = router;

