const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'PajakPeta API Active',
    version: '1.0.0',
    documentation: 'Sistem Informasi Transparansi Anggaran & Pengawasan Proyek Warga'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server internal',
    error: err.message
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
