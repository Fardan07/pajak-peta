const express = require('express');
const router = express.Router();

const {
  getAllProjects,
  getProjectById,
  requireAdminPin,
  bulkSyncProjects
} = require('../controllers/projectController');

const { addProjectReport } = require('../controllers/reportController');
const { calculateUserTax } = require('../controllers/calculatorController');

// Simple in-memory rate limiter for write endpoints (protects hosted server & DB)
const rateLimitMap = new Map();
function writeRateLimiter(maxRequests = 30, windowMs = 60 * 1000) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }
    rateLimitMap.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: 'Terlalu banyak permintaan dalam waktu singkat. Silakan coba beberapa saat lagi.'
      });
    }
    return next();
  };
}

// Project routes
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);

// Admin Bulk Sync with PIN Gate
router.post('/projects/bulk-sync', writeRateLimiter(15, 60000), requireAdminPin, bulkSyncProjects);

// Field check reports from CekLapangan
router.post('/projects/:id/reports', writeRateLimiter(30, 60000), addProjectReport);

// Personal tax calculator
router.post('/calculator/personal-tax', calculateUserTax);

module.exports = router;
