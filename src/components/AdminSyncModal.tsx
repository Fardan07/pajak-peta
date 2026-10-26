import { useState, useRef, useMemo } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Key,
  Layers,
  Lock,
  MapPin,
  RefreshCw,
  Sparkles,
  Trash2,
  Unlock,
  UploadCloud,
  X,
} from 'lucide-react'
import { Button, StatusChip, cx, useToast } from './ui'
import { rupiahShort } from '../data'
import type { Project } from '../data'

export interface AdminSyncModalProps {
  isOpen: boolean
  onClose: () => void
  existingProjects: Project[]
  onSyncSuccess: (updatedProjects: Project[], firstSyncedId: string) => void
  onViewInMap: (id: string) => void
}

interface StagedItem {
  id?: string
  nama: string
  kecamatan: string
  kategori?: string
  realisasi: number
  waktu_berjalan?: number
  anggaran: number
  persen_apbd?: number
  kontraktor: string
  target_selesai: string
  lat?: number
  lng?: number
  isUpdate: boolean
  matchedProject?: Project
}

const DEMO_SIMULATION_ROWS: StagedItem[] = [
  {
    id: 'p1',
    nama: 'Perbaikan Jalan Raya Gedangan Segmen 2',
    kecamatan: 'Kec. Gedangan, Sidoarjo',
    kategori: 'jalan',
    realisasi: 88,
    waktu_berjalan: 75,
    anggaran: 4800000000,
    persen_apbd: 60,
    kontraktor: 'PT Karya Bumi Nusantara',
    target_selesai: '1 Des 2026',
    isUpdate: true,
  },
  {
    id: 'p6',
    nama: 'Rehabilitasi Jembatan Pagerwojo',
    kecamatan: 'Kec. Buduran, Sidoarjo',
    kategori: 'jembatan',
    realisasi: 62,
    waktu_berjalan: 60,
    anggaran: 18900000000,
    persen_apbd: 30,
    kontraktor: 'CV Delta Prasetya',
    target_selesai: '10 Nov 2026',
    isUpdate: true,
  },
  {
    nama: 'Pembangunan Flyover Aloha Waru Tahap 2',
    kecamatan: 'Kec. Waru, Sidoarjo',
    kategori: 'jembatan',
    realisasi: 35,
    waktu_berjalan: 30,
    anggaran: 18500000000,
    persen_apbd: 45,
    kontraktor: 'PT Adhi Karya Nusantara',
    target_selesai: '20 Des 2026',
    isUpdate: false,
  },
  {
    nama: 'Normalisasi Saluran Drainase Kali Sidokare',
    kecamatan: 'Kec. Sidoarjo, Sidoarjo',
    kategori: 'drainase',
    realisasi: 55,
    waktu_berjalan: 48,
    anggaran: 4200000000,
    persen_apbd: 85,
    kontraktor: 'PT Wijaya Drainase Utama',
    target_selesai: '15 Jan 2027',
    isUpdate: false,
  },
]

export default function AdminSyncModal({
  isOpen,
  onClose,
  existingProjects,
  onSyncSuccess,
  onViewInMap,
}: AdminSyncModalProps) {
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [pinError, setPinError] = useState('')
  const [stagedList, setStagedList] = useState<StagedItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    insertedCount: number
    updatedCount: number
    syncedIds: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleVerifyPin = (pinToVerify = pin) => {
    if (pinToVerify.trim() === '2026') {
      setIsAuthorized(true)
      setPinError('')
      toast('Akses Terverifikasi: Mode Administrator Dinas Aktif')
    } else {
      setPinError('PIN salah! Silakan gunakan PIN Demo Juri: 2026')
    }
  }

  const handleInstantDemoLogin = () => {
    setPin('2026')
    handleVerifyPin('2026')
  }

  const handleLockAgain = () => {
    setIsAuthorized(false)
    setPin('')
    setStagedList([])
    setSyncResult(null)
  }

  const findExisting = (id?: string, name?: string): Project | undefined => {
    if (id) {
      const match = existingProjects.find((p) => p.id.toLowerCase() === id.toLowerCase())
      if (match) return match
    }
    if (name) {
      return existingProjects.find(
        (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
      )
    }
    return undefined
  }

  const processIncomingRows = (rows: any[]) => {
    const processed: StagedItem[] = rows.map((r) => {
      const rawName = (r.nama || r.name || '').trim()
      const rawId = (r.id || '').trim()
      const existing = findExisting(rawId, rawName)

      return {
        id: existing ? existing.id : rawId || undefined,
        nama: rawName || existing?.name || 'Proyek Tanpa Nama',
        kecamatan: (r.kecamatan || r.loc || r.lokasi || existing?.loc || 'Kec. Sidoarjo, Sidoarjo').trim(),
        kategori: r.kategori || r.category || existing?.category,
        realisasi: Number(r.realisasi_persen ?? r.realisasi ?? r.progress ?? existing?.progress ?? 50),
        waktu_berjalan: Number(r.waktu_berjalan ?? r.elapsed ?? existing?.elapsed ?? 50),
        anggaran: Number(r.anggaran_rp ?? r.anggaran ?? r.cost ?? r.nilai ?? existing?.cost ?? 5000000000),
        persen_apbd: Number(r.persen_apbd ?? r.apbd ?? existing?.apbd ?? 60),
        kontraktor: (r.kontraktor || r.contractor || existing?.contractor || 'PT Kontraktor Sidoarjo').trim(),
        target_selesai: (r.target_selesai || r.end || existing?.end || '15 Des 2026').trim(),
        lat: r.lat ? Number(r.lat) : existing?.lat,
        lng: r.lng ? Number(r.lng) : existing?.lng,
        isUpdate: !!existing,
        matchedProject: existing,
      }
    })

    setStagedList(processed)
    setSyncResult(null)
    toast(`${processed.length} data proyek dimuat ke staging preview`)
  }

  const handleLoadSimulation = () => {
    processIncomingRows(DEMO_SIMULATION_ROWS)
  }

  const handleDownloadSampleCsv = () => {
    const headers = [
      'id',
      'nama',
      'kecamatan',
      'kategori',
      'realisasi_persen',
      'anggaran_rp',
      'persen_apbd',
      'kontraktor',
      'target_selesai',
    ]

    const sampleRows = [
      'p1,"Perbaikan Jalan Raya Gedangan Segmen 2","Kec. Gedangan, Sidoarjo",jalan,88,4800000000,60,"PT Karya Bumi Nusantara","1 Des 2026"',
      'p6,"Rehabilitasi Jembatan Pagerwojo","Kec. Buduran, Sidoarjo",jembatan,62,18900000000,30,"CV Delta Prasetya","10 Nov 2026"',
      ',"Pembangunan Flyover Aloha Waru Tahap 2","Kec. Waru, Sidoarjo",jembatan,35,18500000000,45,"PT Adhi Karya Nusantara","20 Des 2026"',
      ',"Normalisasi Saluran Drainase Kali Sidokare","Kec. Sidoarjo, Sidoarjo",drainase,55,4200000000,85,"PT Wijaya Drainase Utama","15 Jan 2027"',
    ]

    const csvContent = [headers.join(','), ...sampleRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'laporan_terbaru_dinas_pu_sidoarjo.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast('Template CSV laporan dinas berhasil diunduh')
  }

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
    if (lines.length < 2) throw new Error('File CSV kosong atau tidak memiliki baris data.')

    // Deteksi separator: koma atau titik-koma
    const firstLine = lines[0]
    const separator = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ','

    const rawHeaders = lines[0].split(separator).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase())

    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      // Sederhana split yang menghormati tanda kutip ganda
      const values: string[] = []
      let insideQuote = false
      let curVal = ''

      for (let c = 0; c < line.length; c++) {
        const char = line[c]
        if (char === '"') {
          insideQuote = !insideQuote
        } else if (char === separator && !insideQuote) {
          values.push(curVal.trim().replace(/^"|"$/g, ''))
          curVal = ''
        } else {
          curVal += char
        }
      }
      values.push(curVal.trim().replace(/^"|"$/g, ''))

      const rowObj: Record<string, string> = {}
      rawHeaders.forEach((h, idx) => {
        rowObj[h] = values[idx] || ''
      })
      rows.push(rowObj)
    }

    return rows
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content)
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          processIncomingRows(arr)
        } else {
          const parsed = parseCsvText(content)
          processIncomingRows(parsed)
        }
      } catch (err: any) {
        console.error('File parsing error:', err)
        toast(`Gagal membaca file: ${err.message || 'Format tidak valid'}`)
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.readAsText(file)
  }

  const handleProgressChange = (idx: number, newProgress: number) => {
    const val = Math.max(0, Math.min(100, isNaN(newProgress) ? 0 : newProgress))
    setStagedList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, realisasi: val } : item))
    )
  }

  const handleRemoveStagedItem = (idx: number) => {
    setStagedList((prev) => prev.filter((_, i) => i !== idx))
  }

  const handlePublish = async () => {
    if (stagedList.length === 0) return

    setIsSubmitting(true)
    try {
      const payloadProjects = stagedList.map((item) => ({
        id: item.id,
        name: item.nama,
        loc: item.kecamatan,
        category: item.kategori,
        progress: item.realisasi,
        elapsed: item.waktu_berjalan,
        cost: item.anggaran,
        apbd: item.persen_apbd,
        contractor: item.kontraktor,
        end: item.target_selesai,
        lat: item.lat,
        lng: item.lng,
      }))

      const res = await fetch('http://localhost:5000/api/projects/bulk-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': '2026',
        },
        body: JSON.stringify({ projects: payloadProjects }),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Server error (${res.status})`)
      }

      const data = await res.json()
      const updatedProjects: Project[] = data.projects || []
      const syncedIds: string[] = data.syncedIds || []
      const firstTargetId = syncedIds[0] || 'p1'

      setSyncResult({
        insertedCount: data.insertedCount ?? 0,
        updatedCount: data.updatedCount ?? 0,
        syncedIds,
      })

      onSyncSuccess(updatedProjects, firstTargetId)
      toast(data.message || 'Sinkronisasi berhasil dipublikasikan!')
    } catch (err: any) {
      console.error('Bulk sync publish error:', err)
      toast(`Gagal sinkronisasi: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewInMapAction = () => {
    // Prioritaskan proyek baru pertama yang baru saja disinkronkan, atau proyek pertama yang di-update
    let targetId = ''
    if (syncResult?.syncedIds) {
      const newIds = syncResult.syncedIds.filter(
        (id) => !existingProjects.some((e) => e.id.toLowerCase() === id.toLowerCase())
      )
      if (newIds.length > 0) {
        targetId = newIds[0]
      } else if (syncResult.syncedIds.length > 0) {
        targetId = syncResult.syncedIds[0]
      }
    }
    onViewInMap(targetId || 'p1')
    onClose()
  }

  const updateCount = stagedList.filter((s) => s.isUpdate).length
  const newCount = stagedList.length - updateCount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-line bg-surface shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-canvas/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <UploadCloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-ink">
                  Portal Sinkronisasi Data Dinas
                </h2>
                <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[11px] font-bold text-brand">
                  Dinas PU & Bina Marga Sidoarjo
                </span>
              </div>
              <p className="text-xs text-sub">
                Pembaruan massal realisasi proyek lama & input proyek baru via file laporan resmi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-sub hover:bg-line/40 hover:text-ink transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto p-6 space-y-6">
          {/* STAGE A: Gerbang Akses (Mode Demo Juri) */}
          {!isAuthorized ? (
            <div className="mx-auto max-w-lg py-8 space-y-6 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink">Gerbang Otorisasi Administrator</h3>
                <p className="mt-1.5 text-xs text-sub leading-relaxed">
                  Fitur ini dirancang khusus untuk verifikator & administrator Dinas Pekerjaan Umum untuk
                  memperbarui status data proyek fisik Sidoarjo secara aman.
                </p>
              </div>

              {/* Instant Demo Button for Jury */}
              <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 text-left space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles size={18} className="text-brand shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-ink">Mode Pengujian Juri Kompetisi</h4>
                    <p className="text-xs text-sub">
                      Klik tombol instan di bawah ini untuk melewati gerbang otorisasi tanpa perlu mengetik manual.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleInstantDemoLogin}
                  className="w-full justify-center shadow-md font-bold bg-brand hover:bg-brand/90 text-white"
                  icon={<Unlock size={16} />}
                >
                  ⚡ Masuk Instan (Mode Demo Juri — PIN: 2026)
                </Button>
              </div>

              {/* Manual PIN Form */}
              <div className="space-y-3 pt-2 border-t border-line/60">
                <label className="block text-xs font-semibold text-sub text-left">
                  Atau masukkan PIN Otorisasi Manual:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="password"
                      maxLength={8}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value)
                        setPinError('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                      placeholder="Masukkan PIN (Default: 2026)"
                      className="h-10 w-full rounded-xl border border-line bg-surface px-3.5 text-sm font-medium tracking-widest text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                    <Key size={16} className="absolute right-3.5 top-3 text-sub" />
                  </div>
                  <Button onClick={() => handleVerifyPin()} variant="secondary">
                    Verifikasi
                  </Button>
                </div>
                {pinError && (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-fade-in text-left">
                    <AlertCircle size={14} />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* STAGE B: Portal Sinkronisasi Data Dinas */
            <div className="space-y-6">
              {/* Status Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800">
                      Otorisasi Aktif: Dinas PU Kabupaten Sidoarjo
                    </span>
                    <p className="text-[11px] text-emerald-700/80">
                      Mode Demo Juri Terhubung ke Backend Neon PostgreSQL
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLockAgain}
                  className="text-xs font-semibold text-sub hover:text-red-600 underline"
                >
                  Kunci Portal Kembali
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* 1-Click Simulation Button */}
                <button
                  type="button"
                  onClick={handleLoadSimulation}
                  className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-4 text-left transition-all hover:bg-brand/10 hover:shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-ink">Muat Data Simulasi (1-Klik)</h4>
                      <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand">
                        Rekomendasi
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-sub">
                      Langsung muat 4 baris data nyata (2 proyek baru: Flyover Aloha & Kali Sidokare + 2 update progres p1 & p6).
                    </p>
                  </div>
                </button>

                {/* Download Sample CSV */}
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-left transition-all hover:bg-canvas hover:shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-brand border border-line">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-ink">Unduh Contoh CSV Dinas</h4>
                    <p className="mt-1 text-xs text-sub">
                      Dapatkan template file CSV resmi siap edit dengan format kolom baku dinas PU.
                    </p>
                  </div>
                </button>
              </div>

              {/* Drag and Drop File Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-canvas/50 p-6 text-center cursor-pointer transition-colors hover:border-brand hover:bg-brand/5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex size-12 items-center justify-center rounded-2xl bg-surface shadow-xs text-brand group-hover:scale-105 transition-transform">
                  <FileSpreadsheet size={24} />
                </div>
                <h4 className="mt-2 text-sm font-bold text-ink">
                  Unggah Berkas Laporan Dinas (CSV / JSON)
                </h4>
                <p className="mt-1 text-xs text-sub">
                  Tarik dan lepas file laporan ke sini, atau klik untuk memilih file dari komputer
                </p>
                <span className="mt-2 inline-block rounded-full bg-surface border border-line px-2.5 py-0.5 text-[10px] font-semibold text-sub">
                  Mendukung header format Bahasa Indonesia maupun standar sistem
                </span>
              </div>

              {/* Staging Diff Preview Section */}
              {stagedList.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-ink">Pratinjau Staging Perubahan</h4>
                      <span className="rounded-full bg-canvas border border-line px-2 py-0.5 text-xs font-bold text-ink">
                        {stagedList.length} Item
                      </span>
                      {newCount > 0 && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          +{newCount} Proyek Baru
                        </span>
                      )}
                      {updateCount > 0 && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {updateCount} Pembaruan
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStagedList([])}
                      className="text-xs text-sub hover:text-red-600 transition-colors"
                    >
                      Bersihkan Staging
                    </button>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-line bg-canvas/80 font-bold text-sub">
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Nama Proyek</th>
                          <th className="py-2.5 px-3">Kecamatan</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Realisasi (%)</th>
                          <th className="py-2.5 px-3">Anggaran</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/60 font-medium">
                        {stagedList.map((item, idx) => {
                          const prevProgress = item.matchedProject?.progress
                          return (
                            <tr key={idx} className="hover:bg-canvas/50 transition-colors">
                              {/* Status Tag */}
                              <td className="py-3 px-3">
                                {item.isUpdate ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                    <RefreshCw size={11} /> UPDATE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                    <Sparkles size={11} /> + BARU
                                  </span>
                                )}
                              </td>

                              {/* Nama Proyek */}
                              <td className="py-3 px-3 max-w-[200px]">
                                <div className="font-bold text-ink truncate" title={item.nama}>
                                  {item.nama}
                                </div>
                                <div className="text-[11px] text-sub truncate">
                                  {item.kontraktor}
                                </div>
                              </td>

                              {/* Kecamatan */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-ink">
                                  <MapPin size={12} className="text-sub" />
                                  {item.kecamatan.split(',')[0]}
                                </span>
                                {!item.isUpdate && (
                                  <span className="block text-[10px] text-brand font-semibold">
                                    📍 Auto-Geocoded
                                  </span>
                                )}
                              </td>

                              {/* Kategori */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="rounded bg-canvas px-2 py-0.5 text-[11px] font-semibold text-sub uppercase">
                                  {item.kategori || 'jalan'}
                                </span>
                              </td>

                              {/* Realisasi Progress (Inline Editable) */}
                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.realisasi}
                                    onChange={(e) => handleProgressChange(idx, parseInt(e.target.value, 10))}
                                    className="h-8 w-16 rounded-lg border border-line px-2 text-center text-xs font-bold text-ink focus:border-brand focus:outline-none"
                                  />
                                  <span className="font-bold text-ink">%</span>
                                </div>
                                {item.isUpdate && prevProgress !== undefined && (
                                  <div className="mt-0.5 text-[10px] text-sub">
                                    Sebelumnya: {prevProgress}%{' '}
                                    <span className="font-bold text-emerald-600">
                                      ({item.realisasi >= prevProgress ? '+' : ''}
                                      {item.realisasi - prevProgress}%)
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Anggaran */}
                              <td className="py-3 px-3 whitespace-nowrap font-bold text-ink">
                                {rupiahShort(item.anggaran)}
                              </td>

                              {/* Aksi Hapus */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStagedItem(idx)}
                                  className="text-sub hover:text-red-600 transition-colors"
                                  title="Hapus baris ini dari staging"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success Result Banner */}
              {syncResult && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-emerald-950">
                        Publikasi Berhasil Diterapkan ke Peta!
                      </h4>
                      <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                        Data telah tersimpan di Neon PostgreSQL & mock storage in-memory.{' '}
                        <b>{syncResult.insertedCount} proyek baru</b> berhasil ditambahkan ke peta dan{' '}
                        <b>{syncResult.updatedCount} proyek</b> telah diperbarui realisasinya.
                      </p>
                    </div>
                  </div>

                  {/* Immediate Map View Action CTA */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button
                      onClick={handleViewInMapAction}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                      icon={<ArrowRight size={16} />}
                    >
                      🗺️ Lihat Proyek Baru di Peta (Auto Pan & Zoom)
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                      Selesai
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {isAuthorized && stagedList.length > 0 && !syncResult && (
          <div className="flex items-center justify-between border-t border-line px-6 py-4 bg-canvas/60">
            <div className="text-xs text-sub">
              Siap mempublikasikan <b>{stagedList.length} proyek</b> ke seluruh peta publik.
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="secondary" onClick={onClose}>
                Batal
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSubmitting}
                className="bg-brand text-white font-bold shadow-md hover:bg-brand/90"
                icon={isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <UploadCloud size={16} />}
              >
                {isSubmitting ? 'Menerapkan...' : 'Terapkan & Publikasikan ke Peta Sekarang'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
