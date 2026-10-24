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

export interface Project {
  id: string
  name: string
  loc: string
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

// name, loc, status, cek, progress, elapsed, sisa, costM, apbd%, kontraktor, x, y, km
type Row = [string, string, Status, boolean, number, number, number, number, number, number, number, number, number]
const rows: Row[] = [
  ['Perbaikan Jalan Raya Gedangan Segmen 2', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 68, 62, 41, 4.8, 60, 0, 47, 50, 2.4],
  ['Perbaikan Jalan Raya Gedangan Segmen 1', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 100, 100, 0, 3.9, 60, 0, 43, 54, 1.9],
  ['Normalisasi Drainase Jl. Raya Gedangan', 'Kec. Gedangan, Sidoarjo', 'tepat', false, 54, 50, 62, 1.6, 100, 4, 51, 55, 1.2],
  ['Penggantian Jembatan Kali Buntung', 'Kec. Waru, Sidoarjo', 'dekat', false, 71, 86, 18, 7.2, 40, 2, 28, 38, 0.1],
  ['Rehabilitasi Jl. Waru–Aloha', 'Kec. Waru, Sidoarjo', 'tepat', false, 83, 78, 30, 5.1, 55, 3, 32, 34, 3.1],
  ['Pelebaran Jl. Brigjen Katamso', 'Kec. Waru, Sidoarjo', 'telat', true, 41, 82, 12, 9.4, 30, 1, 24, 43, 2.8],
  ['Pembangunan Trotoar Jl. Ahmad Yani', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 59, 55, 73, 2.3, 100, 4, 62, 62, 1.5],
  ['Revitalisasi Alun-alun Sidoarjo', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 37, 35, 120, 12.5, 70, 5, 67, 66, 0.4],
  ['Normalisasi Saluran Bulang', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 64, 60, 49, 3.4, 100, 5, 59, 71, 2.0],
  ['Pembangunan Jl. Lingkar Timur', 'Kec. Sidoarjo, Sidoarjo', 'dekat', false, 77, 88, 21, 15.8, 25, 2, 73, 58, 4.6],
  ['Peningkatan Jl. Buduran–Sedati', 'Kec. Buduran, Sidoarjo', 'tepat', false, 48, 46, 88, 6.7, 50, 3, 78, 42, 3.8],
  ['Rekonstruksi Jembatan Kali Porong', 'Kec. Porong, Sidoarjo', 'telat', false, 52, 93, 9, 21.6, 20, 1, 84, 77, 0.3],
  ['Peningkatan Jl. Krian–Balongbendo', 'Kec. Krian, Sidoarjo', 'tepat', false, 73, 70, 36, 8.2, 65, 0, 20, 70, 5.2],
  ['Drainase Perumahan Krian Kota', 'Kec. Krian, Sidoarjo', 'tepat', false, 90, 85, 14, 1.2, 100, 4, 16, 66, 0.9],
  ['Rehabilitasi Pasar Krian', 'Kec. Krian, Sidoarjo', 'tepat', false, 66, 64, 52, 6.9, 80, 5, 12, 75, 0.2],
  ['Penerangan Jalan Umum Jl. Raya Taman', 'Kec. Taman, Sidoarjo', 'tepat', false, 80, 76, 25, 2.1, 100, 3, 36, 26, 4.0],
  ['Pengaspalan Jl. Tropodo–Trosobo', 'Kec. Taman, Sidoarjo', 'tepat', false, 58, 56, 64, 5.5, 45, 0, 41, 31, 3.3],
  ['Perbaikan Jl. Raya Sepanjang', 'Kec. Taman, Sidoarjo', 'dekat', true, 69, 87, 17, 4.4, 60, 2, 38, 46, 2.2],
  ['Pembangunan Embung Wonoayu', 'Kec. Wonoayu, Sidoarjo', 'tepat', false, 44, 42, 95, 3.7, 40, 5, 24, 59, 0.5],
  ['Peningkatan Jl. Candi–Tulangan', 'Kec. Candi, Sidoarjo', 'tepat', false, 62, 58, 58, 4.1, 55, 3, 56, 81, 3.0],
  ['Rehabilitasi Jl. Gelam', 'Kec. Candi, Sidoarjo', 'dekat', false, 74, 90, 16, 3.2, 50, 4, 52, 66, 1.8],
  ['Penerangan Jl. Pahlawan', 'Kec. Sidoarjo, Sidoarjo', 'tepat', false, 91, 88, 11, 1.4, 100, 3, 69, 31, 2.6],
  ['Perbaikan Jl. Raya Tanggulangin', 'Kec. Tanggulangin, Sidoarjo', 'telat', false, 57, 91, 10, 6.3, 35, 1, 70, 86, 3.6],
  ['Peningkatan Jl. Tlasih–Tulangan', 'Kec. Tulangan, Sidoarjo', 'tepat', false, 51, 49, 77, 5.8, 50, 0, 87, 26, 4.2],
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

export const projects: Project[] = rows.map((r, i) => {
  const [name, loc, status, cek, progress, elapsed, sisa, costM, apbd, k, x, y, km] = r
  const end = new Date(TODAY.getTime() + sisa * day)
  const dur = Math.max(60, Math.round(sisa / Math.max(0.05, 1 - elapsed / 100)))
  const start = new Date(end.getTime() - dur * day)
  const id = `p${i + 1}`
  const base = 20 + Math.round(seeded(i, 1) * 30)
  const spark = (up: boolean, k2: number) =>
    Array.from({ length: 8 }, (_, j) => base + (up ? j * 3 : -j * 2) + Math.round(seeded(i + j, k2) * 14))
  const g = i === 0
  return {
    id, name, loc, status, cek, progress, elapsed, sisa,
    cost: costM * 1e9,
    apbd,
    contractor: KONTRAKTOR[k],
    start: fmtDate(start),
    end: fmtDate(end),
    x, y, km,
    lat: -7.3 - y * 0.0017,
    lng: 112.62 + x * 0.0022,
    reports: reportsOf[id] ?? [],
    stats: [
      { value: g ? '37' : String(14 + Math.round(seeded(i, 2) * 40)), label: 'kecelakaan / tahun', data: g ? [22, 25, 24, 29, 31, 33, 36, 37] : spark(true, 3) },
      { value: g ? '212' : String(60 + Math.round(seeded(i, 4) * 220)), label: 'titik lubang', data: g ? [90, 120, 118, 150, 171, 190, 205, 212] : spark(true, 5) },
      { value: g ? '18.400' : num(6000 + Math.round(seeded(i, 6) * 20000)), label: 'kendaraan / hari', data: g ? [14, 15, 15, 16, 17, 17, 18, 18.4] : spark(true, 7) },
    ],
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
 * Menghitung Skor Urgensi Pembangunan (0–100) berdasarkan:
 * - 40% Titik lubang / kerusakan fisik jalan
 * - 35% Tingkat fatalitas & jumlah kecelakaan / tahun
 * - 25% Volume kepadatan lalu lintas harian
 */
export function calcUrgencyScore(p: Project): number {
  const kecelakaan = p.stats?.[0] ? parseStatNumber(p.stats[0].value) : 20
  const lubang = p.stats?.[1] ? parseStatNumber(p.stats[1].value) : 100
  const traffic = p.stats?.[2] ? parseStatNumber(p.stats[2].value) : 10000

  // Normalisasi berdasarkan batas sebaran data daerah Sidoarjo
  const sKec = Math.min(100, (kecelakaan / 55) * 100)
  const sLub = Math.min(100, (lubang / 280) * 100)
  const sTraf = Math.min(100, (traffic / 26000) * 100)

  const raw = sLub * 0.4 + sKec * 0.35 + sTraf * 0.25
  return Math.min(99, Math.max(25, Math.round(raw)))
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

