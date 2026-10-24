import { useState, useMemo } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Flame,
  HardHat,
  HelpCircle,
  Layers,
  MapPin,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react'
import { Button, DataTag, ProgressBar, StatusChip, cx } from '../components/ui'
import {
  calcUrgencyScore,
  evaluateCostPerKm,
  getCostPerKmBenchmark,
  num,
  projects as defaultProjects,
  rupiahShort,
} from '../data'
import type { Project } from '../data'

interface BandingkanProps {
  projects?: Project[]
  initialAId?: string
  initialBId?: string
  onSelectProject?: (id: string) => void
}

export default function Bandingkan({
  projects = defaultProjects,
  initialAId,
  initialBId,
  onSelectProject,
}: BandingkanProps) {
  const [idA, setIdA] = useState<string>(() => initialAId || projects[0]?.id || 'p1')
  const [idB, setIdB] = useState<string>(() => {
    if (initialBId && initialBId !== initialAId) return initialBId
    // Default to a different contrasting project (e.g. p6 Katamso which is delayed/high urgency)
    const alt = projects.find((p) => p.id !== (initialAId || projects[0]?.id))
    return alt?.id || 'p6'
  })

  const pA = useMemo(() => projects.find((p) => p.id === idA) ?? projects[0], [projects, idA])
  const pB = useMemo(
    () => projects.find((p) => p.id === idB) ?? projects[1] ?? projects[0],
    [projects, idB]
  )

  const benchmark = useMemo(() => getCostPerKmBenchmark(projects), [projects])

  const urgA = useMemo(() => calcUrgencyScore(pA), [pA])
  const urgB = useMemo(() => calcUrgencyScore(pB), [pB])

  const costStatA = useMemo(() => evaluateCostPerKm(pA, benchmark.median), [pA, benchmark.median])
  const costStatB = useMemo(() => evaluateCostPerKm(pB, benchmark.median), [pB, benchmark.median])

  // Swap projects handler
  const handleSwap = () => {
    setIdA(idB)
    setIdB(idA)
  }

  // Determine urgency winner
  const urgencyDiff = Math.abs(urgA - urgB)
  const moreUrgent = urgA >= urgB ? 'A' : 'B'

  // Extract raw damage metrics
  const lubangA = pA.stats?.[1]?.value ?? '0'
  const lubangB = pB.stats?.[1]?.value ?? '0'
  const kecA = pA.stats?.[0]?.value ?? '0'
  const kecB = pB.stats?.[0]?.value ?? '0'
  const trafA = pA.stats?.[2]?.value ?? '0'
  const trafB = pB.stats?.[2]?.value ?? '0'

  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-bold text-brand mb-2">
              <Scale size={14} />
              <span>Data-Driven Decision • Transparansi Prioritas Pembangunan</span>
            </div>
            <h1 className="mt-1 text-[28px] font-extrabold leading-tight text-ink md:text-[40px]">
              Kenapa Jalan Ini Dibangun Duluan?
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sub sm:text-base">
              Bandingkan dua proyek secara berdampingan untuk melihat justifikasi teknis, urgensi keselamatan warga,
              efisiensi anggaran per kilometer, serta deviasi pengerjaannya di lapangan.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DataTag />
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="mt-8 rounded-2xl border border-line bg-surface p-4 shadow-card md:p-6">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            {/* Proyek A Dropdown */}
            <div>
              <label htmlFor="select-proyek-a" className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand">
                <span>Proyek A (Sisi Kiri)</span>
                <span className="text-[11px] text-sub font-normal">Kecamatan: {pA.loc.split(',')[0]}</span>
              </label>
              <div className="relative">
                <select
                  id="select-proyek-a"
                  value={idA}
                  onChange={(e) => setIdA(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-line bg-canvas py-2.5 pl-3.5 pr-9 text-sm font-bold text-ink shadow-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({rupiahShort(p.cost)})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:pt-5">
              <button
                onClick={handleSwap}
                aria-label="Tukar proyek A dan B"
                className="flex size-10 items-center justify-center rounded-full border border-line bg-surface text-sub hover:bg-canvas hover:text-brand hover:border-brand/40 shadow-xs transition-all active:scale-95"
                title="Tukar posisi Proyek A dan Proyek B"
              >
                <ArrowLeftRight size={18} />
              </button>
            </div>

            {/* Proyek B Dropdown */}
            <div>
              <label htmlFor="select-proyek-b" className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#A22920]">
                <span>Proyek B (Sisi Kanan)</span>
                <span className="text-[11px] text-sub font-normal">Kecamatan: {pB.loc.split(',')[0]}</span>
              </label>
              <div className="relative">
                <select
                  id="select-proyek-b"
                  value={idB}
                  onChange={(e) => setIdB(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-line bg-canvas py-2.5 pl-3.5 pr-9 text-sm font-bold text-ink shadow-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({rupiahShort(p.cost)})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub" />
              </div>
            </div>
          </div>
        </div>

        {/* Insight Callout: Kesimpulan Algoritma Urgensi */}
        <div className="mt-6 rounded-2xl border border-brand/25 bg-[#F0F7F6] p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
              <Flame size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-ink">
                Analisis Prioritas:{' '}
                <strong className="text-brand">
                  Proyek {moreUrgent} ({moreUrgent === 'A' ? pA.name : pB.name})
                </strong>{' '}
                memiliki Skor Urgensi lebih tinggi ({moreUrgent === 'A' ? urgA : urgB} vs{' '}
                {moreUrgent === 'A' ? urgB : urgA}/100)
              </h2>
              <p className="mt-1 text-xs text-sub leading-relaxed">
                {urgencyDiff <= 5
                  ? 'Kedua proyek memiliki tingkat urgensi yang hampir berimbang dari sisi riwayat kecelakaan jalan dan titik kerusakan.'
                  : `Proyek ${moreUrgent} mendapatkan skor lebih tinggi karena memiliki dampak kerusakan yang lebih masif (${moreUrgent === 'A' ? lubangA : lubangB} titik lubang) dan volume kendaraan harian yang lebih padat.`}
              </p>
            </div>
          </div>
        </div>

        {/* Comparative Grid Table */}
        <div className="mt-8 space-y-6">
          {/* Section 1: Skor Urgensi Prioritas Pembangunan */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex size-6 items-center justify-center rounded-full bg-canvas border border-line text-xs font-bold text-ink">
                1
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Skor Urgensi Prioritas Pembangunan
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              {/* Kolom A */}
              <div className="space-y-4 md:pr-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand uppercase">Proyek A</span>
                  <StatusChip status={pA.status} cek={pA.cek} size="sm" />
                </div>
                <h3 className="text-base font-bold text-ink leading-snug">{pA.name}</h3>

                <div className="flex items-baseline gap-3 rounded-xl bg-canvas p-4 border border-line">
                  <div className="text-4xl font-extrabold text-brand">{urgA}</div>
                  <div>
                    <div className="text-xs font-bold text-ink">Skor Urgensi (0–100)</div>
                    <div className="text-[11px] text-sub">
                      {urgA >= 70 ? 'Prioritas Sangat Tinggi' : urgA >= 50 ? 'Prioritas Menengah' : 'Prioritas Reguler'}
                    </div>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className={cx(
                      'h-full transition-all duration-300',
                      urgA >= 70 ? 'bg-[#1F8A5B]' : urgA >= 50 ? 'bg-[#D99A00]' : 'bg-sub'
                    )}
                    style={{ width: `${urgA}%` }}
                  />
                </div>
              </div>

              {/* Kolom B */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A22920] uppercase">Proyek B</span>
                  <StatusChip status={pB.status} cek={pB.cek} size="sm" />
                </div>
                <h3 className="text-base font-bold text-ink leading-snug">{pB.name}</h3>

                <div className="flex items-baseline gap-3 rounded-xl bg-canvas p-4 border border-line">
                  <div className="text-4xl font-extrabold text-[#A22920]">{urgB}</div>
                  <div>
                    <div className="text-xs font-bold text-ink">Skor Urgensi (0–100)</div>
                    <div className="text-[11px] text-sub">
                      {urgB >= 70 ? 'Prioritas Sangat Tinggi' : urgB >= 50 ? 'Prioritas Menengah' : 'Prioritas Reguler'}
                    </div>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className={cx(
                      'h-full transition-all duration-300',
                      urgB >= 70 ? 'bg-[#1F8A5B]' : urgB >= 50 ? 'bg-[#D99A00]' : 'bg-sub'
                    )}
                    style={{ width: `${urgB}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Anggaran & Indeks Biaya per Kilometer */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-canvas border border-line text-xs font-bold text-ink">
                  2
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                  Efisiensi Anggaran &amp; Biaya Satuan per KM
                </h2>
              </div>
              <span className="text-xs font-semibold text-sub">
                Median Sidoarjo: {rupiahShort(benchmark.median)}/km
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              {/* Kolom A */}
              <div className="space-y-4 md:pr-6">
                <div>
                  <span className="text-xs text-sub">Total Nilai Kontrak</span>
                  <div className="text-2xl font-extrabold text-ink">{rupiahShort(pA.cost)}</div>
                  <div className="text-xs text-sub mt-0.5">
                    PAD {pA.apbd}% ({rupiahShort((pA.cost * pA.apbd) / 100)}) • Pusat {100 - pA.apbd}%
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sub uppercase">Biaya Satuan</span>
                    <span
                      className={cx(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                        costStatA.isHigh ? 'bg-[#FBF1D6] text-[#7A5600]' : 'bg-[#E6F3EC] text-[#14633F]'
                      )}
                    >
                      {costStatA.isHigh ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {costStatA.isHigh ? 'Di Atas Rata-rata' : 'Biaya Wajar'}
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-ink">
                    {rupiahShort(costStatA.costPerKm)} <span className="text-xs font-normal text-sub">/ km</span>
                  </div>
                  <p className="mt-1 text-xs text-sub">
                    Panjang fisik {pA.km} km ({costStatA.isHigh ? `+${costStatA.diffPct}% vs acuan` : 'sesuai acuan daerah'})
                  </p>
                </div>
              </div>

              {/* Kolom B */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
                <div>
                  <span className="text-xs text-sub">Total Nilai Kontrak</span>
                  <div className="text-2xl font-extrabold text-ink">{rupiahShort(pB.cost)}</div>
                  <div className="text-xs text-sub mt-0.5">
                    PAD {pB.apbd}% ({rupiahShort((pB.cost * pB.apbd) / 100)}) • Pusat {100 - pB.apbd}%
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sub uppercase">Biaya Satuan</span>
                    <span
                      className={cx(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
                        costStatB.isHigh ? 'bg-[#FBF1D6] text-[#7A5600]' : 'bg-[#E6F3EC] text-[#14633F]'
                      )}
                    >
                      {costStatB.isHigh ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {costStatB.isHigh ? 'Di Atas Rata-rata' : 'Biaya Wajar'}
                    </span>
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-ink">
                    {rupiahShort(costStatB.costPerKm)} <span className="text-xs font-normal text-sub">/ km</span>
                  </div>
                  <p className="mt-1 text-xs text-sub">
                    Panjang fisik {pB.km} km ({costStatB.isHigh ? `+${costStatB.diffPct}% vs acuan` : 'sesuai acuan daerah'})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Statistik Kerusakan & Kondisi Riil */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex size-6 items-center justify-center rounded-full bg-canvas border border-line text-xs font-bold text-ink">
                3
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Kondisi Riil: Kerusakan, Kecelakaan, &amp; Volume Lalu Lintas
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              {/* Kolom A */}
              <div className="space-y-3.5 md:pr-6">
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Titik Kerusakan / Lubang</span>
                  <span className="text-base font-extrabold text-ink">{lubangA} titik</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Kecelakaan Lalu Lintas</span>
                  <span className="text-base font-extrabold text-bad">{kecA} kasus/tahun</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Kepadatan Lalu Lintas</span>
                  <span className="text-base font-extrabold text-ink">{trafA} kendaraan/hari</span>
                </div>
              </div>

              {/* Kolom B */}
              <div className="space-y-3.5 pt-6 md:pt-0 md:pl-6">
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Titik Kerusakan / Lubang</span>
                  <span className="text-base font-extrabold text-ink">{lubangB} titik</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Kecelakaan Lalu Lintas</span>
                  <span className="text-base font-extrabold text-bad">{kecB} kasus/tahun</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-canvas p-3 border border-line">
                  <span className="text-xs font-semibold text-sub">Kepadatan Lalu Lintas</span>
                  <span className="text-base font-extrabold text-ink">{trafB} kendaraan/hari</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Progres Pengerjaan vs Waktu Berjalan */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="flex size-6 items-center justify-center rounded-full bg-canvas border border-line text-xs font-bold text-ink">
                4
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Realisasi Fisik &amp; Kinerja Kontraktor
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line">
              {/* Kolom A */}
              <div className="space-y-4 md:pr-6">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sub font-semibold">Kontraktor Pelaksana</span>
                    <span className="font-bold text-brand">{pA.contractor}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-ink">{pA.progress}%</span>
                      <span className="text-xs text-sub ml-1.5">progres</span>
                    </div>
                    <div className="text-xs text-sub">Waktu: {pA.elapsed}% ({pA.sisa} hari sisa)</div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={pA.progress} elapsed={pA.elapsed} status={pA.status} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-sub">Target Tenggat: {pA.end}</span>
                  {onSelectProject && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onSelectProject(pA.id)}
                      icon={<ArrowRight size={14} />}
                      className="text-xs"
                    >
                      Buka di Peta
                    </Button>
                  )}
                </div>
              </div>

              {/* Kolom B */}
              <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sub font-semibold">Kontraktor Pelaksana</span>
                    <span className="font-bold text-[#A22920]">{pB.contractor}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-ink">{pB.progress}%</span>
                      <span className="text-xs text-sub ml-1.5">progres</span>
                    </div>
                    <div className="text-xs text-sub">Waktu: {pB.elapsed}% ({pB.sisa} hari sisa)</div>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={pB.progress} elapsed={pB.elapsed} status={pB.status} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-sub">Target Tenggat: {pB.end}</span>
                  {onSelectProject && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => onSelectProject(pB.id)}
                      icon={<ArrowRight size={14} />}
                      className="text-xs"
                    >
                      Buka di Peta
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
