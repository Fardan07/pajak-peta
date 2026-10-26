import { useState, useMemo } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Filter,
  Layers,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UploadCloud,
  X,
} from 'lucide-react'
import { Accordion, Button, DataTag, StatusChip, cx, useToast } from '../components/ui'
import { num, projects as defaultProjects, rupiahShort } from '../data'
import type { Project } from '../data'

function save(name: string, mime: string, body: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: mime }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

const dictionary: [string, string, string][] = [
  ['id', 'teks', 'Pengenal unik proyek dalam database daerah.'],
  ['nama', 'teks', 'Nama proyek sesuai dokumen pengadaan resmi LPSE.'],
  ['kecamatan', 'teks', 'Kecamatan lokasi utama proyek fisik.'],
  ['status', 'kategori', 'tepat (tepat waktu), dekat (waspada), telat (terlambat), atau perlu_dicek.'],
  ['realisasi_persen', 'angka (0–100)', 'Persentase realisasi fisik terbaru dari dinas terkait.'],
  ['anggaran_rp', 'bilangan bulat', 'Nilai kontrak proyek dalam rupiah.'],
  ['persen_apbd', 'angka (0–100)', 'Porsi pendanaan dari APBD (PAD); sisanya bantuan pusat.'],
  ['kontraktor', 'teks', 'Nama penyedia jasa/kontraktor pelaksana tender.'],
  ['target_selesai', 'tanggal', 'Target tenggat waktu penyelesaian fisik.'],
]

interface DataTerbukaProps {
  projects?: Project[]
  onOpenAdminSync?: () => void
}

export default function DataTerbuka({
  projects = defaultProjects,
  onOpenAdminSync,
}: DataTerbukaProps) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')

  // Calculate 3 summary statistics cards
  const stats = useMemo(() => {
    const total = projects.length
    const totalCost = projects.reduce((acc, p) => acc + p.cost, 0)
    const avgApbd = total ? Math.round(projects.reduce((acc, p) => acc + p.apbd, 0) / total) : 0
    const onTimeCount = projects.filter((p) => p.status === 'tepat').length
    const onTimePct = total ? Math.round((onTimeCount / total) * 100) : 0
    return { totalCost, avgApbd, onTimePct, total, onTimeCount }
  }, [projects])

  // Extract unique districts
  const districts = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => {
      const dist = p.loc.split(',')[0].replace('Kec. ', '').trim()
      if (dist) set.add(dist)
    })
    return Array.from(set).sort()
  }, [projects])

  // Filtered rows for all 24 projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const dist = p.loc.split(',')[0].replace('Kec. ', '').trim()
      const matchDistrict = selectedDistrict === 'all' || dist === selectedDistrict
      const query = q.toLowerCase()
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(query) ||
        p.contractor.toLowerCase().includes(query) ||
        p.loc.toLowerCase().includes(query)
      return matchDistrict && matchSearch
    })
  }, [projects, selectedDistrict, q])

  const csv = () => {
    const exportData = filteredProjects.map((p) => ({
      id: p.id,
      nama: p.name,
      kecamatan: p.loc.split(',')[0].replace('Kec. ', '').trim(),
      status: p.cek ? 'perlu_dicek' : p.status,
      realisasi_persen: p.progress,
      anggaran_rp: p.cost,
      persen_apbd: p.apbd,
      kontraktor: p.contractor,
      target_selesai: p.end,
    }))
    if (!exportData.length) return
    const keys = Object.keys(exportData[0])
    const body = [
      keys.join(','),
      ...exportData.map((r) => keys.map((k) => JSON.stringify((r as Record<string, unknown>)[k])).join(',')),
    ].join('\n')
    save('pajakpeta_open_data_sidoarjo.csv', 'text/csv', body)
    toast('pajakpeta_open_data_sidoarjo.csv berhasil diunduh')
  }

  const json = () => {
    const exportData = filteredProjects.map((p) => ({
      id: p.id,
      nama: p.name,
      kecamatan: p.loc.split(',')[0].replace('Kec. ', '').trim(),
      status: p.cek ? 'perlu_dicek' : p.status,
      realisasi_persen: p.progress,
      anggaran_rp: p.cost,
      persen_apbd: p.apbd,
      kontraktor: p.contractor,
      target_selesai: p.end,
    }))
    save('pajakpeta_open_data_sidoarjo.json', 'application/json', JSON.stringify(exportData, null, 2))
    toast('pajakpeta_open_data_sidoarjo.json berhasil diunduh')
  }

  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-[#EAF2F1] px-3 py-1 text-xs font-bold text-brand">
              <BadgeCheck size={14} aria-hidden />
              <span>Open Government Data • Lisensi CC BY 4.0</span>
            </span>
            <h1 className="mt-3 text-[32px] font-extrabold leading-tight text-ink md:text-[42px]">
              Dataset Terbuka PajakPeta
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub sm:text-base">
              Setiap rupiah APBD dan titik proyek fisik terbuka untuk kamu unduh, verifikasi, dan manfaatkan bagi riset,
              liputan data jurnalisme, maupun audit independen publik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenAdminSync && (
              <Button
                size="lg"
                variant="secondary"
                icon={<UploadCloud size={18} className="text-brand" />}
                onClick={onOpenAdminSync}
                className="border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand font-bold shadow-xs hover:shadow transition-all"
              >
                Sinkronisasi Data Dinas
              </Button>
            )}
            <Button size="lg" icon={<FileSpreadsheet size={18} />} onClick={csv} className="shadow-xs hover:shadow transition-all">
              Unduh CSV
            </Button>
            <Button size="lg" variant="secondary" icon={<FileJson size={18} />} onClick={json} className="shadow-xs hover:shadow transition-all">
              Unduh JSON
            </Button>
          </div>
        </div>

        {/* 3 Kartu Ringkasan Statistik Dataset */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between text-sub">
              <span className="text-xs font-bold uppercase tracking-wider">Total Nilai Kontrak</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-brand">
                <Database size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{rupiahShort(stats.totalCost)}</div>
            <p className="mt-1 text-xs text-sub">Dari 24 paket proyek fisik Kabupaten Sidoarjo</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between text-sub">
              <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Porsi APBD</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-[#1F8A5B]">
                <Layers size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{stats.avgApbd}%</div>
            <p className="mt-1 text-xs text-sub">Berasal dari Pendapatan Asli Daerah (PAD kas lokal)</p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between text-sub">
              <span className="text-xs font-bold uppercase tracking-wider">Kinerja Tepat Waktu</span>
              <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-[#D99A00]">
                <Clock size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{stats.onTimePct}%</div>
            <p className="mt-1 text-xs text-sub">
              {stats.onTimeCount} dari {stats.total} proyek on-schedule tanpa keterlambatan
            </p>
          </div>
        </div>

        {/* Section Pratinjau Tabel Dataset Lengkap (24 Baris) */}
        <section className="mt-10" aria-label="Pratinjau dataset">
          {/* Controls: Search & District Filter */}
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sub" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama proyek / kontraktor..."
                  className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-8 text-sm text-ink placeholder:text-sub focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-xs"
                />
                {q && (
                  <button
                    onClick={() => setQ('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sub hover:text-ink p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* District Filter Dropdown */}
              <div className="relative w-full sm:w-56">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-line bg-surface pl-3 pr-8 text-sm font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 shadow-xs cursor-pointer"
                >
                  <option value="all">Semua Kecamatan ({projects.length})</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      Kec. {d}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub" />
              </div>
            </div>

            {/* Row Counter Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-sub">
                Menampilkan <strong>{filteredProjects.length}</strong> dari {projects.length} baris
              </span>
              <DataTag />
            </div>
          </div>

          {/* Table Container */}
          <div className="scroll-quiet max-h-[560px] overflow-auto rounded-2xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {['ID', 'Nama Proyek', 'Kecamatan', 'Status', 'Realisasi', 'Anggaran', 'Porsi PAD', 'Kontraktor', 'Target Selesai'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`sticky top-0 z-10 border-b border-line bg-canvas px-4 py-3 text-xs font-bold uppercase tracking-wider text-sub ${
                          [4, 5, 6].includes(i) ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-sub">
                      Tidak ada proyek yang cocok dengan kata kunci atau filter kecamatan yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const distName = p.loc.split(',')[0].replace('Kec. ', '').trim()
                    return (
                      <tr key={p.id} className="group transition-colors hover:bg-canvas/60">
                        <td className="border-b border-line px-4 py-3 text-xs font-semibold text-sub">{p.id}</td>
                        <td className="border-b border-line px-4 py-3 font-semibold text-ink max-w-xs">{p.name}</td>
                        <td className="border-b border-line px-4 py-3 text-sub">{distName}</td>
                        <td className="border-b border-line px-4 py-3">
                          <StatusChip status={p.status} cek={p.cek} size="sm" />
                        </td>
                        <td className="border-b border-line px-4 py-3 text-right font-bold text-ink">{p.progress}%</td>
                        <td className="border-b border-line px-4 py-3 text-right font-semibold text-ink">
                          Rp {num(p.cost)}
                        </td>
                        <td className="border-b border-line px-4 py-3 text-right text-sub">{p.apbd}%</td>
                        <td className="border-b border-line px-4 py-3 text-xs text-sub">{p.contractor}</td>
                        <td className="border-b border-line px-4 py-3 text-xs text-sub whitespace-nowrap">{p.end}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section Kamus Data */}
        <section className="mt-10 max-w-3xl" aria-label="Kamus data">
          <h2 className="mb-2 text-xl font-bold text-ink">Kamus Metadata Dataset</h2>
          <p className="mb-4 text-xs text-sub">
            Penjelasan standar teknis dan tipe data untuk 9 atribut yang terdapat dalam file ekspor CSV & JSON.
          </p>
          <Accordion title="9 atribut kolom • nama, tipe, dan deskripsi" defaultOpen>
            <div className="divide-y divide-line">
              {dictionary.map(([col, tip, des]) => (
                <div key={col} className="grid grid-cols-[140px_130px_1fr] items-baseline gap-3 py-2 text-xs">
                  <code className="font-mono font-bold text-brand">{col}</code>
                  <span className="text-sub font-medium">{tip}</span>
                  <span className="text-ink">{des}</span>
                </div>
              ))}
            </div>
          </Accordion>
        </section>
      </div>
    </div>
  )
}
