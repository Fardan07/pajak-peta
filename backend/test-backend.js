const assert = require('assert');
const { enrichProjectWithCalculations, calculatePersonalTax } = require('./src/utils/taxConverter');
const db = require('./src/config/db');

async function runTests() {
  console.log('🧪 Menjalankan pengujian logika backend & database...');

  // 1. Uji enrichProjectWithCalculations
  const sampleProject = {
    id: 1,
    title: 'Test Proyek',
    district: 'Wonokromo',
    category: 'Infrastruktur Jalan',
    total_budget: 200000000,
    local_tax_percentage: 75,
    central_aid_percentage: 25,
    progress_actual: 80,
    progress_planned: 75,
    target_completion: '2026-11-30',
    contractor_name: 'PT Test',
    latitude: -7.2,
    longitude: 112.7,
    image_url: 'http://test.com',
    unit_cost_label: 'Rp 400.000',
    median_unit_cost_comparison: 'Wajar',
    is_overpriced: false,
    statistics: {
      population_in_district: 50000,
      daily_users: 5000,
      damage_points: 45,
      incident_count: 12,
      incident_label: '12 kecelakaan',
      damage_score: 88,
      incident_score: 82,
      density_score: 90
    },
    reports: [
      { is_accurate: false },
      { is_accurate: false }
    ]
  };

  const enriched = enrichProjectWithCalculations(sampleProject);
  assert.strictEqual(enriched.calculated.local_tax_amount, 150000000, 'Local tax amount harus 150.000.000');
  assert.strictEqual(enriched.calculated.central_aid_amount, 50000000, 'Central aid harus 50.000.000');
  assert.strictEqual(enriched.calculated.progress_deviation, 5, 'Deviasi harus +5');
  assert.strictEqual(enriched.status, 'hijau', 'Status harus hijau');
  assert.strictEqual(enriched.calculated.equivalents.motor_tax_count, 600, 'Setara motor harus 600');
  assert.strictEqual(enriched.calculated.equivalents.house_pbb_count, 1000, 'Setara PBB harus 1000');
  assert.strictEqual(enriched.calculated.equivalents.coffee_cup_count, 50000, 'Setara kopi harus 50.000');
  assert.strictEqual(enriched.calculated.cost_per_citizen, 3000, 'Beban per warga harus 3.000');
  assert.strictEqual(enriched.calculated.cost_per_daily_user, 40000, 'Biaya per pengguna harus 40.000');
  assert.strictEqual(enriched.calculated.urgency_score, 86, 'Skor urgensi harus 86');
  assert.strictEqual(enriched.calculated.verification_summary.needs_audit, true, 'needs_audit harus true karena 2 laporan tidak akurat');
  console.log('✅ Uji 1 (enrichProjectWithCalculations): Lulus!');

  // 2. Uji calculatePersonalTax
  const personalTax = calculatePersonalTax(
    { coffee_per_week: 4, vehicle_type: 'motor_1', house_type: 'pribadi_sederhana' },
    sampleProject
  );
  assert.strictEqual(personalTax.breakdown.coffee_tax_annual, 624000, 'Pajak kopi tahunan harus 624.000');
  assert.strictEqual(personalTax.breakdown.vehicle_tax_annual, 250000, 'Pajak motor harus 250.000');
  assert.strictEqual(personalTax.breakdown.house_tax_annual, 150000, 'PBB harus 150.000');
  assert.strictEqual(personalTax.total_annual_tax, 1024000, 'Total pajak tahunan harus 1.024.000');
  console.log('✅ Uji 2 (calculatePersonalTax): Lulus!');

  // 3. Uji Query Database Neon
  const res = await db.query('SELECT count(*) as count FROM projects');
  assert.ok(Number(res.rows[0].count) >= 6, 'Database Neon harus memiliki minimal 6 proyek');
  console.log(`✅ Uji 3 (Neon PostgreSQL Query): Lulus (${res.rows[0].count} proyek terverifikasi di Neon DB)!`);

  // 4. Uji syncEngine (enrichProjectInput, geocodeKecamatan, detectCategory)
  const { enrichProjectInput, geocodeKecamatan, detectCategory, computeStatus } = require('./src/utils/syncEngine');
  
  const testSubdistrict = geocodeKecamatan('Kec. Waru, Sidoarjo', 'Flyover Aloha');
  assert.ok(testSubdistrict.lat < -7.34 && testSubdistrict.lat > -7.37, 'Lat Waru harus di sekitar -7.35');
  assert.ok(testSubdistrict.lng > 112.71 && testSubdistrict.lng < 112.74, 'Lng Waru harus di sekitar 112.72');

  const catDrainase = detectCategory('Normalisasi Saluran Drainase Kali Sidokare');
  assert.strictEqual(catDrainase, 'drainase', 'Kategori harus terdeteksi sebagai drainase');

  const catJembatan = detectCategory('Pembangunan Flyover Aloha Waru');
  assert.strictEqual(catJembatan, 'jembatan', 'Kategori harus terdeteksi sebagai jembatan');

  const statusTe = computeStatus(85, 60);
  assert.strictEqual(statusTe, 'tepat', 'Status selisih +25 harus tepat');

  const statusTelat = computeStatus(30, 60);
  assert.strictEqual(statusTelat, 'telat', 'Status selisih -30 harus telat');

  const mockExisting = [
    { id: 'p1', name: 'Perbaikan Jalan Raya Gedangan', progress: 68, elapsed: 62, cost: 4800000000, category: 'jalan', lat: -7.382, lng: 112.7245 }
  ];
  const assigned = new Set(['p1']);

  // Enrich update
  const updatedRow = enrichProjectInput({ id: 'p1', progress: 88, elapsed: 70 }, mockExisting, assigned);
  assert.strictEqual(updatedRow.isUpdate, true, 'Harus terdeteksi sebagai update');
  assert.strictEqual(updatedRow.id, 'p1', 'ID harus tetap p1');
  assert.strictEqual(updatedRow.progress, 88, 'Progress harus 88');
  assert.strictEqual(updatedRow.prevProgress, 68, 'prevProgress harus 68');

  // Enrich new project
  const newRow = enrichProjectInput({
    name: 'Pembangunan Flyover Aloha Tahap 2',
    loc: 'Kec. Waru, Sidoarjo',
    progress: 45,
    anggaran_rp: 12500000000
  }, mockExisting, assigned);
  assert.strictEqual(newRow.isUpdate, false, 'Harus terdeteksi sebagai proyek baru');
  assert.strictEqual(newRow.id, 'p2', 'ID proyek baru berikutnya harus p2');
  assert.strictEqual(newRow.category, 'jembatan', 'Kategori otomatis jembatan');
  assert.strictEqual(newRow.cost, 12500000000, 'Anggaran harus 12.5 Milyar');
  assert.ok(newRow.stats.length === 3, 'Harus memiliki 3 metrik statistik');
  console.log('✅ Uji 4 (syncEngine Geocoding & Auto-Enrichment): Lulus!');

  await db.pool.end();
  console.log('🎉 SEMUA PENGUJIAN BACKEND BERHASIL!');
}

runTests().catch(err => {
  console.error('❌ Pengujian gagal:', err);
  process.exit(1);
});

