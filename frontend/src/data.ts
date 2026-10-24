export const APP_NAME = 'PajakPeta'
export const TAGLINE = 'Telusuri Pajakmu, Pantau Wujudnya'
export const APP_DOMAIN = 'pajakpeta.id'

export type Status = 'tepat' | 'dekat' | 'telat'

export interface Report {
  id: string
  verdict: 'sesuai' | 'tidak'
  text: string
  ago: string
  photo?: string
}

export type ProjectCategory = 'jalan' | 'bangunan' | 'drainase' | 'jembatan' | 'pju' | 'trotoar'

export const CATEGORY_META: Record<ProjectCategory, { label: string; icon: string }> = {
  jalan: { label: 'Jalan Raya', icon: '🛣️' },
  bangunan: { label: 'Renovasi Bangunan & Fasilitas', icon: '🏛️' },
  drainase: { label: 'Drainase & Pengendali Banjir', icon: '🌊' },
  jembatan: { label: 'Jembatan & Struktur', icon: '🌉' },
  pju: { label: 'Penerangan Jalan (PJU)', icon: '💡' },
  trotoar: { label: 'Trotoar & Pedestrian', icon: '🚶' },
}

export function getProjectCategory(name: string): ProjectCategory {
  const n = name.toLowerCase()
  if (n.includes('pasar') || n.includes('alun-alun') || n.includes('gedung') || n.includes('bangunan')) return 'bangunan'
  if (n.includes('drainase') || n.includes('saluran') || n.includes('embung') || n.includes('sungai')) return 'drainase'
  if (n.includes('jembatan')) return 'jembatan'
  if (n.includes('penerangan') || n.includes('pju') || n.includes('lampu')) return 'pju'
  if (n.includes('trotoar') || n.includes('pedestrian')) return 'trotoar'
  return 'jalan'
}

export interface Project {
  id: string
  name: string
  loc: string
  category: ProjectCategory
  status: Status
  cek: boolean
  progress: number
  elapsed: number
  sisa: number
  cost: number
  apbd: number
  contractor: string
  start: string
  end: string
  x: number
  y: number
  lat: number
  lng: number
  reports: Report[]
  stats: { value: string; label: string; data: number[] }[]
  km: number
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const fmtDate = (d: Date) => `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
export const num = (n: number, max = 0) => n.toLocaleString('id-ID', { maximumFractionDigits: max })
export const rupiah = (n: number) => 'Rp ' + num(Math.round(n))
export const rupiahShort = (n: number) =>
  n >= 1e9 ? `Rp ${num(n / 1e9, 2)} miliar` : `Rp ${num(n / 1e6)} juta`

const TODAY = new Date(2026, 9, 21)
const day = 86400000

export const STATUS_META: Record<Status, { label: string; color: string; bg: string; fg: string }> = {
  tepat: { label: 'Tepat waktu', color: '#1F8A5B', bg: '#E6F3EC', fg: '#14633F' },
  dekat: { label: 'Waspada', color: '#D99A00', bg: '#FBF1D6', fg: '#7A5600' },
  telat: { label: 'Terlambat', color: '#C8372D', bg: '#FBE9E7', fg: '#A22920' },
}

const KONTRAKTOR = [
  'PT Karya Bumi Nusantara',
  'CV Andalan Mitra Konstruksi',
  'PT Wira Cipta Perkasa',
  'PT Surya Marga Utama',
  'CV Delta Prasetya',
  'PT Bangun Tirta Persada',
]

// name, loc, status, cek, progress, elapsed, sisa, costM, apbd%, kontraktor, x, y, km, lat, lng
type Row = [string, string, Status, boolean, number, number, number, number, number, number, number, number, number, number, number]
const rows: Row[] = [
  ['Perbaikan Jalan Raya Gedangan Segmen 2', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 68, 62, 41, 4.8, 60, 0, 47, 50, 2.4, -7.3820, 112.7245],
  ['Perbaikan Jalan Raya Gedangan Segmen 1', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 100, 100, 0, 3.9, 60, 0, 43, 54, 1.9, -7.3715, 112.7265],
  ['Normalisasi Drainase Jl. Raya Gedangan', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 54, 50, 62, 1.6, 100, 4, 51, 55, 1.2, -7.3895, 112.7228],
  ['Penggantian Jembatan Kali Buntung', 'Kec. Waru, Sidoarjo', 'dekat', false, 71, 86, 18, 7.2, 40, 2, 28, 38, 0.1, -7.3525, 112.7285],
  ['Rehabilitasi Jl. Waru–Aloha', 'Kec. Waru, Sidoarjo', 'tepat', false, 83, 78, 30, 5.1, 55, 3, 32, 34, 3.1, -7.3625, 112.7270],
  ['Pelebaran Jl. Brigjen Katamso', 'Kec. Waru, Sidoarjo', 'telat', true, 41, 82, 12, 9.4, 30, 1, 24, 43, 2.8, -7.3565, 112.7440],
  ['Pembangunan Trotoar Jl. Ahmad Yani', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 59, 55, 73, 2.3, 100, 4, 62, 62, 1.5, -7.4435, 112.7160],
  ['Revitalisasi Alun-alun Sidoarjo', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 37, 35, 120, 12.5, 70, 5, 67, 66, 0.4, -7.4478, 112.7176],
  ['Normalisasi Saluran Bulang', 'Kec. Prambon, Sidoarjo', 'tepat', false, 64, 60, 49, 3.4, 100, 5, 59, 71, 2.0, -7.4725, 112.5685],
  ['Pembangunan Jl. Lingkar Timur', 'Kec. Sidoarjo, Sidoarjo', 'dekat', false, 77, 88, 21, 15.8, 25, 2, 73, 58, 4.6, -7.4385, 112.7420],
  ['Peningkatan Jl. Buduran–Sedati', 'Kec. Buduran, Sidoarjo', 'tepat', false, 48, 46, 88, 6.7, 50, 3, 78, 42, 3.8, -7.3980, 112.7550],
  ['Rekonstruksi Jembatan Kali Porong', 'Kec. Porong, Sidoarjo', 'telat', false, 52, 93, 9, 21.6, 20, 1, 84, 77, 0.3, -7.5420, 112.6985],
  ['Peningkatan Jl. Krian–Balongbendo', 'Kec. Krian, Sidoarjo', 'tepat', false, 73, 70, 36, 8.2, 65, 0, 20, 70, 5.2, -7.4080, 112.5520],
  ['Drainase Perumahan Krian Kota', 'Kec. Krian, Sidoarjo', 'tepat', false, 90, 85, 14, 1.2, 100, 4, 16, 66, 0.9, -7.4125, 112.5830],
  ['Rehabilitasi Pasar Krian', 'Kec. Krian, Sidoarjo', 'tepat', false, 66, 64, 52, 6.9, 80, 5, 12, 75, 0.2, -7.4140, 112.5805],
  ['Penerangan Jalan Umum Jl. Raya Taman', 'Kec. Taman, Sidoarjo', 'tepat', false, 80, 76, 25, 2.1, 100, 3, 36, 26, 4.0, -7.3480, 112.6890],
  ['Pengaspalan Jl. Tropodo–Trosobo', 'Kec. Taman, Sidoarjo', 'tepat', false, 58, 56, 64, 5.5, 45, 0, 41, 31, 3.3, -7.3685, 112.6420],
  ['Perbaikan Jl. Raya Sepanjang', 'Kec. Taman, Sidoarjo', 'dekat', true, 69, 87, 17, 4.4, 60, 2, 38, 46, 2.2, -7.3465, 112.6985],
  ['Pembangunan Embung Wonoayu', 'Kec. Wonoayu, Sidoarjo', 'tepat', false, 44, 42, 95, 3.7, 40, 5, 24, 59, 0.5, -7.4260, 112.6320],
  ['Peningkatan Jl. Candi–Tulangan', 'Kec. Candi, Sidoarjo', 'tepat', false, 62, 58, 58, 4.1, 55, 3, 56, 81, 3.0, -7.4710, 112.6860],
  ['Rehabilitasi Jl. Gelam', 'Kec. Candi, Sidoarjo', 'dekat', false, 74, 90, 16, 3.2, 50, 4, 52, 66, 1.8, -7.4650, 112.7220],
  ['Penerangan Jl. Pahlawan', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 91, 88, 11, 1.4, 100, 3, 69, 31, 2.6, -7.4525, 112.7080],
  ['Perbaikan Jl. Raya Tanggulangin', 'Kec. Tanggulangin, Sidoarjo', 'telat', false, 57, 91, 10, 6.3, 35, 1, 70, 86, 3.6, -7.4980, 112.7150],
  ['Peningkatan Jl. Tlasih–Tulangan', 'Kec. Tulangan, Sidoarjo', 'tepat', false, 51, 49, 77, 5.8, 50, 0, 87, 26, 4.2, -7.4780, 112.6450],
]

const reportsOf: Record<string, Report[]> = {
  p1: [
    { id: 'r1', verdict: 'sesuai', text: 'Aspal sudah rata sampai depan SD, marka jalan belum dicat.', ago: '2 jam lalu' },
    { id: 'r2', verdict: 'sesuai', text: 'Pengerjaan malam hari, rambu pengaman lengkap dan rapi.', ago: '1 hari lalu' },
    { id: 'r3', verdict: 'tidak', text: 'Masih ada lubang di dekat pertigaan Gedangan, belum tersentuh.', ago: '3 hari lalu' },
  ],
  p6: [
    { id: 'r4', verdict: 'tidak', text: 'Pekerja tidak terlihat sejak dua minggu terakhir.', ago: '5 jam lalu' },
    { id: 'r5', verdict: 'tidak', text: 'Material menumpuk di bahu jalan, belum ada pengerjaan.', ago: '1 hari lalu' },
    { id: 'r6', verdict: 'tidak', text: 'Pelebaran baru separuh, sisanya masih tanah.', ago: '2 hari lalu' },
  ],
  p18: [
    { id: 'r7', verdict: 'tidak', text: 'Laporan menyebut selesai 69%, di lapangan terlihat jauh lebih sedikit.', ago: '8 jam lalu' },
    { id: 'r8', verdict: 'sesuai', text: 'Ruas dekat terminal sudah diaspal ulang.', ago: '4 hari lalu' },
  ],
}

const seeded = (i: number, k: number) => {
  const r = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return r - Math.floor(r)
}

export interface StatItem {
  value: string
  label: string
  data: number[]
}

export function generateProjectStats(id: string, name: string, category: ProjectCategory, i: number): StatItem[] {
  const base = 20 + Math.round(seeded(i, 1) * 30)
  const spark = (up: boolean, k2: number, multiplier = 1) =>
    Array.from({ length: 8 }, (_, j) => Math.round((base + (up ? j * 3 : -j * 2) + Math.round(seeded(i + j, k2) * 14)) * multiplier))

  switch (category) {
    case 'bangunan':
      if (id === 'p8' || name.toLowerCase().includes('alun-alun')) {
        return [
          { value: '5.800', label: 'pengunjung / hari', data: [38, 41, 44, 47, 50, 52, 55, 58] },
          { value: '48', label: 'kerusakan fasilitas', data: [18, 22, 26, 31, 35, 40, 44, 48] },
          { value: '92', label: 'keluhan warga / bulan', data: [45, 52, 60, 68, 74, 81, 88, 92] },
        ]
      }
      return [
        { value: '6.400', label: 'pengunjung pasar / hari', data: [50, 52, 55, 58, 60, 61, 63, 64] },
        { value: '74', label: 'kios bocor & rusak', data: [32, 38, 44, 52, 58, 64, 70, 74] },
        { value: '490', label: 'pedagang aktif UMKM', data: [45, 46, 46, 47, 48, 48, 49, 49] },
      ]

    case 'drainase':
      if (id === 'p19' || name.toLowerCase().includes('embung')) {
        return [
          { value: '45.000 m³', label: 'kapasitas retensi banjir', data: [10, 15, 20, 26, 32, 38, 41, 45] },
          { value: '5 desa', label: 'wilayah rawan limpasan', data: [5, 5, 5, 5, 5, 5, 5, 5] },
          { value: '120 ha', label: 'luas sawah terproteksi', data: [30, 45, 60, 75, 90, 105, 115, 120] },
        ]
      }
      return [
        { value: String(12 + (i % 7)), label: 'kejadian genangan / tahun', data: spark(true, 2, 0.4) },
        { value: `${35 + (i % 20)} cm`, label: 'rata-rata tinggi genangan', data: spark(true, 4, 0.6) },
        { value: num(1400 + Math.round(seeded(i, 6) * 1200)), label: 'warga terdampak banjir', data: spark(true, 7, 100) },
      ]

    case 'jembatan':
      return [
        { value: num(24000 + Math.round(seeded(i, 2) * 8000)), label: 'kendaraan melintas / hari', data: spark(true, 3, 0.8) },
        { value: String(28 + (i % 18)), label: 'titik retak & deformasi', data: spark(true, 5, 0.5) },
        { value: `${34 + (i % 10)} tahun`, label: 'usia struktur jembatan', data: spark(true, 1, 0.6) },
      ]

    case 'pju':
      return [
        { value: String(45 + (i % 25)), label: 'titik lampu mati / gelap', data: spark(true, 4, 0.8) },
        { value: String(14 + (i % 10)), label: 'kerawanan malam / tahun', data: spark(true, 2, 0.3) },
        { value: num(8000 + Math.round(seeded(i, 6) * 4000)), label: 'pengendara malam / hari', data: spark(true, 7, 0.6) },
      ]

    case 'trotoar':
      return [
        { value: '4.200', label: 'pejalan kaki / hari', data: [28, 30, 32, 35, 37, 39, 41, 42] },
        { value: '86', label: 'titik trotoar rusak', data: [34, 42, 50, 58, 66, 73, 80, 86] },
        { value: '34', label: 'okupasi hambatan jalan', data: [12, 15, 18, 22, 25, 28, 31, 34] },
      ]

    case 'jalan':
    default:
      const g = i === 0
      return [
        { value: g ? '37' : String(14 + Math.round(seeded(i, 2) * 40)), label: 'kecelakaan / tahun', data: g ? [22, 25, 24, 29, 31, 33, 36, 37] : spark(true, 3) },
        { value: g ? '212' : String(60 + Math.round(seeded(i, 4) * 220)), label: 'titik lubang', data: g ? [90, 120, 118, 150, 171, 190, 205, 212] : spark(true, 5) },
        { value: g ? '18.400' : num(6000 + Math.round(seeded(i, 6) * 20000)), label: 'kendaraan / hari', data: g ? [14, 15, 15, 16, 17, 17, 18, 18.4] : spark(true, 7) },
      ]
  }
}

export const projects: Project[] = rows.map((r, i) => {
  const [name, loc, status, cek, progress, elapsed, sisa, costM, apbd, k, x, y, km, lat, lng] = r
  const end = new Date(TODAY.getTime() + sisa * day)
  const dur = Math.max(60, Math.round(sisa / Math.max(0.05, 1 - elapsed / 100)))
  const start = new Date(end.getTime() - dur * day)
  const id = `p${i + 1}`
  const category = getProjectCategory(name)

  return {
    id, name, loc, category, status, cek, progress, elapsed, sisa,
    cost: costM * 1e9,
    apbd,
    contractor: KONTRAKTOR[k],
    start: fmtDate(start),
    end: fmtDate(end),
    x, y, km,
    lat,
    lng,
    reports: reportsOf[id] ?? [],
    stats: generateProjectStats(id, name, category, i),
  }
})

export const counts = {
  all: projects.length,
  tepat: projects.filter((p) => p.status === 'tepat').length,
  dekat: projects.filter((p) => p.status === 'dekat').length,
  telat: projects.filter((p) => p.status === 'telat').length,
  cek: projects.filter((p) => p.cek).length,
}

export const STNK_MOTOR = 250000 // PKB/STNK 1 motor per tahun
export const PBB_RUMAH = 150000 // PBB rumah sederhana per tahun
export const PAJAK_KOPI = 3000 // pajak restoran 10% dari kopi Rp 30.000
export const DISCLAIMER = 'Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu.'

/* ---------- Fitur Inovasi Data-Driven (Tahap 3) ---------- */

export function parseStatNumber(val: string): number {
  if (!val) return 0
  const clean = val.replace(/\./g, '').replace(/,/g, '.')
  const parsed = parseFloat(clean)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Menghitung Skor Urgensi Pembangunan (0–100) adaptif sesuai kategori proyek:
 * - Jalan: Tingkat kerusakan lubang (40%), kecelakaan (35%), volume lalu lintas (25%)
 * - Bangunan/Fasilitas: Kerusakan fisik fasilitas (40%), kepadatan pengunjung (35%), keluhan warga (25%)
 * - Drainase: Tinggi genangan (40%), kejadian genangan/tahun (35%), warga terdampak (25%)
 * - Jembatan: Retak & deformasi (40%), volume kendaraan harian (35%), usia struktur (25%)
 * - PJU: Titik lampu mati (40%), kerawanan malam (35%), pengendara malam (25%)
 */
export function calcUrgencyScore(p: Project): number {
  if (!p.stats || p.stats.length === 0) return 60
  const v0 = parseStatNumber(p.stats[0]?.value)
  const v1 = parseStatNumber(p.stats[1]?.value)
  const v2 = parseStatNumber(p.stats[2]?.value)

  let s0 = 20, s1 = 20, s2 = 20
  const cat = p.category ?? getProjectCategory(p.name)

  switch (cat) {
    case 'bangunan':
      s0 = Math.min(100, (v0 / 7000) * 100) // kepadatan pengunjung
      s1 = Math.min(100, (v1 / 80) * 100)   // kerusakan fasilitas / kios rusak
      s2 = Math.min(100, (v2 / 100) * 100)  // keluhan / kapasitas
      break
    case 'drainase':
      s0 = Math.min(100, (v0 / 20) * 100)   // kejadian genangan
      s1 = Math.min(100, (v1 / 60) * 100)   // tinggi genangan (cm)
      s2 = Math.min(100, (v2 / 2500) * 100) // warga terdampak
      break
    case 'jembatan':
      s0 = Math.min(100, (v0 / 32000) * 100) // volume kendaraan
      s1 = Math.min(100, (v1 / 45) * 100)    // retak / deformasi
      s2 = Math.min(100, (v2 / 45) * 100)    // usia jembatan
      break
    case 'pju':
      s0 = Math.min(100, (v0 / 75) * 100)    // titik lampu mati
      s1 = Math.min(100, (v1 / 25) * 100)    // insiden malam
      s2 = Math.min(100, (v2 / 12000) * 100) // pengendara malam
      break
    case 'trotoar':
      s0 = Math.min(100, (v0 / 5000) * 100) // pejalan kaki
      s1 = Math.min(100, (v1 / 90) * 100)   // trotoar rusak
      s2 = Math.min(100, (v2 / 40) * 100)   // hambatan akses
      break
    case 'jalan':
    default:
      s0 = Math.min(100, (v0 / 55) * 100)   // kecelakaan
      s1 = Math.min(100, (v1 / 280) * 100)  // titik lubang
      s2 = Math.min(100, (v2 / 26000) * 100)// volume traffic
      break
  }

  // Bobot: 40% tingkat keparahan/kerusakan, 35% risiko/insiden, 25% skala dampak publik
  const raw = s1 * 0.4 + s0 * 0.35 + s2 * 0.25
  return Math.min(99, Math.max(30, Math.round(raw)))
}

export function getCostPerKmBenchmark(projectsList: Project[]) {
  const valid = projectsList
    .filter((p) => p.km > 0 && p.cost > 0)
    .map((p) => p.cost / p.km)

  if (!valid.length) return { median: 2.1e9, avg: 2.2e9 }
  const sorted = [...valid].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length
  return { median, avg }
}

export function evaluateCostPerKm(p: Project, benchmarkMedian: number) {
  const costPerKm = p.km > 0 ? p.cost / p.km : 0
  const ratio = benchmarkMedian > 0 ? costPerKm / benchmarkMedian : 1
  const isHigh = ratio > 1.35
  const diffPct = Math.round(Math.abs(ratio - 1) * 100)
  return {
    costPerKm,
    ratio,
    isHigh,
    status: isHigh ? ('tinggi' as const) : ('wajar' as const),
    label: isHigh
      ? 'Biaya per km di atas rata-rata proyek sejenis — lihat spesifikasi'
      : 'Biaya per km wajar (sesuai rata-rata daerah)',
    diffPct,
  }
}

