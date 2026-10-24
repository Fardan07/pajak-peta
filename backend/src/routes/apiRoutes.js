const express = require('express');
const router = express.Router();

const {
  getAllProjects,
  getProjectById
} = require('../controllers/projectController');

const { addProjectReport } = require('../controllers/reportController');

// Project routes
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);

// Field check reports from CekLapangan
router.post('/projects/:id/reports', addProjectReport);

module.exports = router;
