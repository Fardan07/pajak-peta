// syncEngine.js — Smart Auto-Enrichment & Geocoding Engine for Admin Bulk Sync

const KECAMATAN_SIDOARJO = {
  gedangan: { lat: -7.3820, lng: 112.7245 },
  waru: { lat: -7.3525, lng: 112.7285 },
  sidoarjo: { lat: -7.4478, lng: 112.7176 },
  porong: { lat: -7.5420, lng: 112.6985 },
  krian: { lat: -7.4140, lng: 112.5805 },
  taman: { lat: -7.3480, lng: 112.6890 },
  buduran: { lat: -7.4180, lng: 112.7300 },
  candi: { lat: -7.4710, lng: 112.7150 },
  tanggulangin: { lat: -7.4980, lng: 112.7150 },
  wonoayu: { lat: -7.4260, lng: 112.6320 },
  tulangan: { lat: -7.4780, lng: 112.6450 },
  sedati: { lat: -7.3880, lng: 112.7680 },
  sukodono: { lat: -7.4020, lng: 112.6780 },
  balongbendo: { lat: -7.4080, lng: 112.5150 },
  prambon: { lat: -7.4725, lng: 112.5685 },
  krembung: { lat: -7.5250, lng: 112.6120 },
  jabon: { lat: -7.5620, lng: 112.7480 },
  tarik: { lat: -7.4580, lng: 112.5120 },
};

/**
 * Mendeteksi kecamatan dan mengembalikan koordinat dengan sedikit offset acak (+/- 0.004 derajat)
 */
function geocodeKecamatan(loc = '', name = '') {
  const text = `${loc} ${name}`.toLowerCase();
  let matched = null;

  for (const [kec, coord] of Object.entries(KECAMATAN_SIDOARJO)) {
    if (text.includes(kec)) {
      matched = coord;
      break;
    }
  }

  // Fallback ke pusat Sidoarjo jika tidak ada kecocokan
  const baseCoord = matched || KECAMATAN_SIDOARJO.sidoarjo;

  // Offset acak ±0.004 derajat (~400 meter) agar pin tidak bertumpuk
  const jitterLat = (Math.random() - 0.5) * 0.008;
  const jitterLng = (Math.random() - 0.5) * 0.008;

  return {
    lat: Number((baseCoord.lat + jitterLat).toFixed(5)),
    lng: Number((baseCoord.lng + jitterLng).toFixed(5)),
    isAutoGeocoded: true,
  };
}

/**
 * Deteksi kategori proyek berdasarkan kata kunci nama
 */
function detectCategory(name = '') {
  const n = name.toLowerCase();

  // 1. Jembatan & Flyover
  if (n.includes('jembatan') || n.includes('flyover') || n.includes('underpass') || n.includes('overpass')) {
    return 'jembatan';
  }

  // 2. Drainase & Sungai
  if (n.includes('drainase') || n.includes('saluran') || n.includes('embung') || n.includes('sungai') || n.includes('waduk') || n.includes('boezem') || n.includes('gorong')) {
    return 'drainase';
  }

  // 3. Penerangan Jalan Umum
  if (n.includes('penerangan') || n.includes('pju') || n.includes('lampu') || n.includes('listrik')) {
    return 'pju';
  }

  // 4. Trotoar & Pedestrian
  if (n.includes('trotoar') || n.includes('pedestrian') || n.includes('pejalan')) {
    return 'trotoar';
  }

  // 5. Bangunan & Fasilitas Publik (hindari pencocokan 'pembangunan')
  if (
    n.includes('pasar') ||
    n.includes('alun-alun') ||
    n.includes('gedung') ||
    n.includes('kantor') ||
    n.includes('sekolah') ||
    n.includes('puskesmas') ||
    n.includes('rsud') ||
    n.includes('stadion') ||
    n.includes('balai') ||
    /\bbangunan\b/i.test(n)
  ) {
    return 'bangunan';
  }

  return 'jalan';
}

/**
 * Menghitung status berdasarkan deviasi progress vs waktu berjalan
 * Selisih progress - elapsed >= -5  ➔ tepat
 * Selisih antara -6 s.d. -20       ➔ dekat
 * Selisih < -20                    ➔ telat
 */
function computeStatus(progress, elapsed) {
  const diff = progress - elapsed;
  if (diff >= -5) return 'tepat';
  if (diff >= -20) return 'dekat';
  return 'telat';
}

/**
 * Menghasilkan 3 metrik statistik default beserta sparkline sesuai kategori
 */
function generateDefaultStats(name, category, i = 1) {
  const spark = (startVal, endVal) => {
    const step = (endVal - startVal) / 7;
    return Array.from({ length: 8 }, (_, idx) => Math.round(startVal + step * idx + (Math.random() * 4 - 2)));
  };

  switch (category) {
    case 'bangunan':
      return [
        { value: '4.800', label: 'pengunjung / hari', data: spark(35, 48) },
        { value: '38', label: 'kerusakan fasilitas', data: spark(15, 38) },
        { value: '86', label: 'keluhan warga / bulan', data: spark(40, 86) },
      ];
    case 'drainase':
      return [
        { value: '14', label: 'kejadian genangan / tahun', data: spark(6, 14) },
        { value: '45 cm', label: 'rata-rata tinggi genangan', data: spark(20, 45) },
        { value: '1.850', label: 'warga terdampak banjir', data: spark(10, 18.5) },
      ];
    case 'jembatan':
      return [
        { value: '24.500', label: 'kendaraan melintas / hari', data: spark(18, 24.5) },
        { value: '28', label: 'titik retak & deformasi', data: spark(12, 28) },
        { value: '35 tahun', label: 'usia struktur jembatan', data: spark(30, 35) },
      ];
    case 'pju':
      return [
        { value: '54', label: 'titik lampu mati / gelap', data: spark(18, 54) },
        { value: '16', label: 'kerawanan malam / tahun', data: spark(6, 16) },
        { value: '9.200', label: 'pengendara malam / hari', data: spark(7, 9.2) },
      ];
    case 'trotoar':
      return [
        { value: '3.800', label: 'pejalan kaki / hari', data: spark(25, 38) },
        { value: '74', label: 'titik trotoar rusak', data: spark(30, 74) },
        { value: '28', label: 'hambatan akses (PKL/parkir)', data: spark(10, 28) },
      ];
    case 'jalan':
    default:
      return [
        { value: '32', label: 'kecelakaan / tahun', data: spark(18, 32) },
        { value: '185', label: 'titik lubang', data: spark(80, 185) },
        { value: '16.500', label: 'kendaraan / hari', data: spark(12, 16.5) },
      ];
  }
}

/**
 * Normalisasi dan perkaya satu baris proyek input (dari CSV / JSON)
 */
function enrichProjectInput(row, existingProjects = [], assignedIds = new Set()) {
  const cleanName = (row.name || row.nama || '').trim();
  const cleanLoc = (row.loc || row.kecamatan || row.lokasi || 'Kec. Sidoarjo, Sidoarjo').trim();

  // 1. Cek apakah ada proyek eksisting berdasarkan ID atau Nama persis
  let targetId = row.id ? String(row.id).trim().toLowerCase() : null;
  let existing = null;

  if (targetId) {
    existing = existingProjects.find((p) => p.id.toLowerCase() === targetId);
  }
  if (!existing && cleanName) {
    existing = existingProjects.find(
      (p) => p.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
  }

  const isUpdate = !!existing;

  // 2. Tentukan ID
  if (existing) {
    targetId = existing.id;
  } else {
    // Generate sequential id: p25, p26, etc.
    let maxNum = 0;
    existingProjects.forEach((p) => {
      const match = p.id.match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    assignedIds.forEach((id) => {
      const match = id.match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });

    let nextNum = maxNum + 1;
    while (assignedIds.has(`p${nextNum}`)) {
      nextNum++;
    }
    targetId = `p${nextNum}`;
  }
  assignedIds.add(targetId);

  // 3. Progres, Elapsed, Sisa
  const progress = Number(row.progress ?? row.realisasi_persen ?? row.realisasi ?? (existing?.progress || 50));
  let elapsed = Number(row.elapsed ?? row.waktu_berjalan ?? (existing?.elapsed || 50));
  if (isNaN(elapsed) || elapsed === 0) {
    elapsed = Math.min(100, Math.max(10, Math.round(progress + (Math.random() * 8 - 4))));
  }
  let sisa = Number(row.sisa ?? (existing?.sisa || Math.max(5, Math.round((100 - progress) * 1.5))));
  if (isNaN(sisa)) sisa = 30;

  // 4. Status
  let status = row.status || (isUpdate ? computeStatus(progress, elapsed) : computeStatus(progress, elapsed));
  if (!['tepat', 'dekat', 'telat'].includes(status)) {
    status = computeStatus(progress, elapsed);
  }

  // 5. Geocoding
  let lat = Number(row.lat || row.latitude || 0);
  let lng = Number(row.lng || row.longitude || 0);
  let isAutoGeocoded = false;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    if (existing && existing.lat && existing.lng) {
      lat = Number(existing.lat);
      lng = Number(existing.lng);
    } else {
      const geocoded = geocodeKecamatan(cleanLoc, cleanName);
      lat = geocoded.lat;
      lng = geocoded.lng;
      isAutoGeocoded = true;
    }
  }

  // 6. Anggaran & Biaya
  const cost = Number(row.cost || row.anggaran_rp || row.anggaran || row.nilai || (existing?.cost || 5000000000));
  const apbd = Number(row.apbd || row.persen_apbd || (existing?.apbd || 60));
  const contractor = (row.contractor || row.kontraktor || (existing?.contractor || 'PT Pelaksana Sidoarjo')).trim();
  const km = Number(row.km || row.panjang_km || (existing?.km || 1.5));

  // 7. Kategori
  const category = row.category || (existing?.category || detectCategory(cleanName));

  // 8. Stats
  let stats = row.stats;
  if (!Array.isArray(stats) || stats.length === 0) {
    if (existing && Array.isArray(existing.stats) && existing.stats.length > 0) {
      stats = existing.stats;
    } else {
      stats = generateDefaultStats(cleanName, category);
    }
  }

  return {
    id: targetId,
    name: cleanName || existing?.name || `Proyek ${targetId}`,
    loc: cleanLoc,
    category,
    status,
    cek: Boolean(row.cek ?? existing?.cek ?? false),
    progress,
    elapsed,
    sisa,
    cost,
    apbd,
    contractor,
    start: row.start || row.mulai || existing?.start || '15 Agu 2026',
    end: row.end || row.target_selesai || existing?.end || '15 Des 2026',
    x: Number(row.x || existing?.x || 50),
    y: Number(row.y || existing?.y || 50),
    lat,
    lng,
    km,
    stats,
    isUpdate,
    isAutoGeocoded,
    prevProgress: existing ? existing.progress : null,
  };
}

module.exports = {
  KECAMATAN_SIDOARJO,
  geocodeKecamatan,
  detectCategory,
  computeStatus,
  generateDefaultStats,
  enrichProjectInput,
};
