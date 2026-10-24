const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initDb() {
  console.log('🔄 Memulai inisialisasi database Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
    const seedPath = path.resolve(__dirname, '../../sql/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('📄 Mengeksekusi schema.sql...');
    await client.query(schemaSql);
    console.log('✅ schema.sql berhasil dieksekusi.');

    console.log('🌱 Mengeksekusi seed.sql...');
    await client.query(seedSql);
    console.log('✅ seed.sql berhasil dieksekusi.');

    // Verifikasi data
    const resProjects = await client.query('SELECT count(*) as count FROM projects');
    const resReports = await client.query('SELECT count(*) as count FROM reports');
    console.log(`🎉 Berhasil memuat ${resProjects.rows[0].count} proyek dan ${resReports.rows[0].count} laporan warga ke Neon DB.`);
  } catch (err) {
    console.error('❌ Gagal menginisialisasi database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
