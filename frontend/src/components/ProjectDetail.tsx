import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Coffee,
  Download,
  Flame,
  HardHat,
  Home,
  Layers,
  MapPin,
  MapPinCheck,
  MessageSquare,
  Motorbike,
  Scale,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react"
import {
  DISCLAIMER,
  calcUrgencyScore,
  evaluateCostPerKm,
  getCostPerKmBenchmark,
  CATEGORY_META,
  getProjectCategory,
  num,
  projects as defaultProjects,
  rupiahShort,
} from "../data"
import type { Project } from "../data"
import {
  Button,
  DataTag,
  ProgressBar,
  Skeleton,
  StatTile,
  StatusChip,
  cx,
  useToast,
} from "./ui"
import { ReportFeed } from "./CekLapangan"

type Profil = "motor" | "rumah" | "kopi"
const PROFIL: Record<Profil, {
  icon: typeof Motorbike
  rate: number
  unit: string
  label: string
  lead: string
  tail: string
  sub: string
}> = {
  motor: {
    icon: Motorbike,
    rate: 512000,
    unit: "pengendara",
    label: "Motor",
    lead: "Setara patungan pajak STNK motor dari",
    tail: "pengendara motor",
    sub: "Asumsi rata-rata PKB Rp 512.000 / tahun",
  },
  rumah: {
    icon: Home,
    rate: 640000,
    unit: "rumah",
    label: "PBB Rumah",
    lead: "Setara patungan PBB tahunan dari",
    tail: "pemilik rumah warga",
    sub: "Asumsi rata-rata PBB Rp 640.000 / tahun",
  },
  kopi: {
    icon: Coffee,
    rate: 2800,
    unit: "pesanan",
    label: "Kopi / Resto",
    lead: "Setara pajak makan & ngopi (PB1 10%) dari",
    tail: "gelas kopi / makanan",
    sub: "Pajak restoran 10% (± Rp 2.800 / pesanan)",
  },
}

function getProjectImage(p: Project): string {
  const name = p.name.toLowerCase()
  if (name.includes("jembatan")) {
    return "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80"
  }
  if (
    name.includes("drainase") ||
    name.includes("saluran") ||
    name.includes("embung")
  ) {
    return "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80"
  }
  if (name.includes("penerangan") || name.includes("lampu")) {
    return "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80"
  }
  if (
    name.includes("pasar") ||
    name.includes("gedung") ||
    name.includes("alun-alun")
  ) {
    return "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80"
  }
  // Default road & highway infrastructure
  return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80"
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex size-6 items-center justify-center rounded-full bg-canvas border border-line text-xs font-bold text-ink shadow-xs">
        {n}
      </span>
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
        {title}
      </h3>
    </div>
  )
}

function Meta({
  icon,
  label,
  children,
  wide,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="flex items-center gap-1.5 text-xs text-sub">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div
      className="space-y-4 p-4"
      aria-busy="true"
      aria-label="Memuat detail proyek"
    >
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  )
}

export default function ProjectDetail({
  p,
  onCek,
  onClose,
  onCompare,
  showFooter = true,
}: {
  p: Project
  onCek: () => void
  onClose: () => void
  onCompare?: (projectId: string) => void
  showFooter?: boolean
}) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [showAlurDana, setShowAlurDana] = useState(false)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [p.id])

  const apbdAmt = (p.cost * p.apbd) / 100
  const apbnAmt = p.cost - apbdAmt
  const faster = p.progress - p.elapsed
  const [profil, setProfil] = useState<Profil>("motor")
  const prof = PROFIL[profil]
  const ProfIcon = prof.icon

  const urgency = calcUrgencyScore(p)
  const category = p.category ?? getProjectCategory(p.name)
  const catMeta = CATEGORY_META[category]
  const benchmark = getCostPerKmBenchmark(defaultProjects)
  const costEval = evaluateCostPerKm(p, benchmark.median)

  const accurateCount = p.reports.filter((r) => r.verdict === "sesuai").length
  const inaccurateCount = p.reports.filter((r) => r.verdict === "tidak").length
  const totalVotes = accurateCount + inaccurateCount
  const accuratePct = totalVotes
    ? Math.round((accurateCount / totalVotes) * 100)
    : 50

  const download = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { ...p, reports: undefined, catatan: "Data contoh PajakPeta" },
          null,
          2,
        ),
      ],
      {
        type: "application/json",
      },
    )
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${p.id}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast("Data proyek diunduh")
  }

  const projectImg = getProjectImage(p)

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto pb-4">
        {/* Banner Foto Proyek di Atas Header */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#14213D] to-[#0F5C5C]">
          <img
            src={projectImg}
            alt={p.name}
            className="size-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15 pointer-events-none" />

          {/* Floating Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup panel"
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/70 transition-colors shadow-sm"
          >
            <X size={16} />
          </button>

          {/* Location & Status Overlay */}
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md border border-white/15">
                <span>{catMeta.icon}</span>
                <span>{catMeta.label}</span>
              </span>
              <StatusChip status={p.status} />
              {p.cek && <StatusChip cek />}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
              <MapPin size={12} />
              <span>{p.loc.split(",")[0]}</span>
            </span>
          </div>
        </div>

        {/* Header Information Card */}
        <div className="mx-4 mt-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                {p.contractor}
              </span>
              <h2 className="mt-1 text-lg font-bold leading-snug text-ink">
                {p.name}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-sub">
                <MapPin size={13} className="shrink-0 text-sub" aria-hidden />
                <span>{p.loc}</span>
              </p>
            </div>
            <DataTag className="shrink-0" />
          </div>

          {/* Quick Urgency Badge & Compare Button */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F9F8] border border-brand/20 px-2.5 py-0.5 text-xs font-bold text-brand">
              <Flame
                size={13}
                className={urgency >= 70 ? "text-[#1F8A5B]" : "text-[#D99A00]"}
              />
              <span>Skor Urgensi: {urgency}/100</span>
            </div>

            {onCompare && (
              <button
                onClick={() => onCompare(p.id)}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline hover:text-brand-d transition-colors"
                title="Bandingkan justifikasi urgensi dan efisiensi dengan proyek lain"
              >
                <Scale size={13} />
                <span>Bandingkan Proyek ➔</span>
              </button>
            )}
          </div>

          {p.cek && (
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-dashed border-bad/50 bg-[#FDEEEB] p-3 text-xs leading-relaxed text-[#8F251D]">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-bad" />
              <span>
                <strong>Perlu Dicek Warga:</strong> Ada laporan warga bahwa
                kondisi fisik di lapangan tidak sesuai klaim progres dinas.
              </span>
            </div>
          )}
        </div>

        {loading && <DetailSkeleton />}
        {!loading && (
          <div className="mt-3 space-y-3.5">
            {/* Card A: Realisasi Fisik */}
            <section className="mx-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <SectionLabel n="A" title="Realisasi Fisik" />

              {/* Kotak Perbandingan Progres Fisik vs Waktu Berjalan */}
              <div className="rounded-xl border border-line bg-canvas/70 p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sub">
                    Status Pengerjaan
                  </span>
                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                      faster >= 0
                        ? "bg-[#E6F3EC] text-[#14633F]"
                        : "bg-[#FBE9E7] text-[#A22920]",
                    )}
                  >
                    {faster >= 0
                      ? `+${faster}% Di Depan Jadwal`
                      : `${faster}% Di Belakang Jadwal`}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 divide-x divide-line/60">
                  <div>
                    <div className="text-xs text-sub">Realisasi Fisik</div>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-ink">
                        {p.progress}%
                      </span>
                      <span className="text-xs text-sub">selesai</span>
                    </div>
                  </div>
                  <div className="pl-3">
                    <div className="text-xs text-sub">Waktu Berjalan</div>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-sub">
                        {p.elapsed}%
                      </span>
                      <span className="text-xs text-sub">
                        ({p.sisa} hari sisa)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5">
                  <ProgressBar
                    value={p.progress}
                    elapsed={p.elapsed}
                    status={p.status}
                  />
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-line bg-surface p-3.5 text-sm shadow-xs">
                <Meta
                  wide
                  icon={<HardHat size={14} className="text-brand" />}
                  label="Kontraktor"
                >
                  {p.contractor}
                </Meta>
                <Meta
                  icon={<CalendarDays size={14} className="text-brand" />}
                  label="Mulai"
                >
                  {p.start}
                </Meta>
                <Meta
                  icon={<CalendarDays size={14} className="text-brand" />}
                  label="Target selesai"
                >
                  {p.end}
                </Meta>
              </dl>
            </section>

            {/* Card B: Transparansi Anggaran */}
            <section className="mx-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <SectionLabel n="B" title="Transparansi Anggaran" />
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-sub block">
                    Nilai Kontrak Total
                  </span>
                  <div className="text-[28px] font-extrabold tracking-tight leading-tight text-ink">
                    {rupiahShort(p.cost)}
                  </div>
                </div>
                <span className="text-xs font-semibold text-sub bg-canvas border border-line px-2.5 py-1 rounded-lg">
                  PAD {p.apbd}% • Pusat {100 - p.apbd}%
                </span>
              </div>

              {/* 2-Pocket Bar */}
              <div
                className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full ring-1 ring-line/50"
                role="img"
                aria-label={`Pajak warga lokal ${p.apbd}%, bantuan pusat ${100 - p.apbd}%`}
              >
                <div
                  className="bg-brand transition-all duration-300"
                  style={{ width: `${p.apbd}%` }}
                />
                <div className="flex-1 bg-[#CBD5E1] transition-all duration-300" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-brand/20 bg-brand/5 p-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-brand">
                    <span className="size-2 rounded-full bg-brand" /> Kantong 1:
                    Pajak Warga
                  </span>
                  <div className="mt-1 text-sm font-bold text-ink">
                    {rupiahShort(apbdAmt)}
                  </div>
                  <div className="text-[11px] text-sub">
                    PAD Daerah ({p.apbd}%)
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-canvas/60 p-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-sub">
                    <span className="size-2 rounded-full bg-[#CBD5E1]" />{" "}
                    Kantong 2: Bantuan Pusat
                  </span>
                  <div className="mt-1 text-sm font-bold text-ink">
                    {rupiahShort(apbnAmt)}
                  </div>
                  <div className="text-[11px] text-sub">
                    APBN / Transfer ({100 - p.apbd}%)
                  </div>
                </div>
              </div>

              {/* Interactive Multi-Analogi Card */}
              <div className="mt-5 rounded-xl border border-brand/20 bg-[#F4F9F8] p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Konversi Patungan Warga
                  </span>
                  <span className="text-[11px] text-sub">Pilih opsi</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface rounded-lg border border-line">
                  {(Object.keys(PROFIL) as Profil[]).map((key) => {
                    const item = PROFIL[key]
                    const Icon = item.icon
                    const isSelected = profil === key
                    return (
                      <button
                        key={key}
                        onClick={() => setProfil(key)}
                        className={cx(
                          "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-bold transition-all",
                          isSelected
                            ? "bg-brand text-white shadow-xs"
                            : "text-sub hover:text-ink hover:bg-canvas",
                        )}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3.5 flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-xs ring-1 ring-brand/20">
                    <ProfIcon size={22} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-ink">
                      {prof.lead}{" "}
                      <strong className="font-extrabold text-brand text-base">
                        {num(Math.round(apbdAmt / prof.rate))} {prof.tail}
                      </strong>
                    </p>
                    <p className="mt-1 text-xs text-sub">{prof.sub}</p>
                  </div>
                </div>
                <p className="mt-3 border-t border-brand/15 pt-2 text-[11px] leading-tight text-sub">
                  Dihitung dari Kantong 1 ({rupiahShort(apbdAmt)}) ÷ Rp{" "}
                  {num(prof.rate)}. {DISCLAIMER}
                </p>
              </div>

              {/* Fitur Inovasi: Jejak Aliran Dana & Cek Kewajaran Harga */}
              <div className="mt-5 rounded-xl border border-line bg-canvas/70 p-4 shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowAlurDana(!showAlurDana)}
                  className="flex w-full items-center justify-between text-left"
                  aria-expanded={showAlurDana}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-surface text-brand border border-line shadow-xs">
                      <Layers size={15} />
                    </span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink block">
                        Telusuri Aliran Dana &amp; Harga Satuan
                      </span>
                      <span className="text-[11px] text-sub">
                        Jejak rupiah dari kas daerah ke lapangan
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={cx(
                      "text-sub transition-transform duration-200",
                      showAlurDana && "rotate-180",
                    )}
                  />
                </button>

                {showAlurDana && (
                  <div className="mt-4 pt-4 border-t border-line space-y-4">
                    {/* 1. Visual Alur Dana Bertahap */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sub block mb-2.5">
                        1. Diagram Alur Dana (Hulu ➔ Hilir)
                      </span>

                      <div className="space-y-2 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-line/80">
                        {/* Step 1 */}
                        <div className="relative flex items-start gap-3 pl-1">
                          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">
                            1
                          </span>
                          <div className="min-w-0 flex-1 rounded-lg border border-line bg-surface p-2.5 text-xs shadow-xs">
                            <div className="font-bold text-ink">
                              Kas Pajak Warga &amp; Transfer Pusat
                            </div>
                            <div className="mt-0.5 text-sub text-[11px]">
                              APBD (PAD {p.apbd}% • {rupiahShort(apbdAmt)}) +
                              Bantuan Pusat ({100 - p.apbd}% •{" "}
                              {rupiahShort(apbnAmt)})
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-start gap-3 pl-1">
                          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">
                            2
                          </span>
                          <div className="min-w-0 flex-1 rounded-lg border border-line bg-surface p-2.5 text-xs shadow-xs">
                            <div className="font-bold text-ink">
                              Dinas PU Bina Marga &amp; SDA Sidoarjo
                            </div>
                            <div className="mt-0.5 text-sub text-[11px]">
                              Verifikasi RAB, Kuasa Pengguna Anggaran (KPA),
                              &amp; Pengawas Teknis
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-start gap-3 pl-1">
                          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">
                            3
                          </span>
                          <div className="min-w-0 flex-1 rounded-lg border border-line bg-surface p-2.5 text-xs shadow-xs">
                            <div className="font-bold text-ink">
                              {p.contractor}
                            </div>
                            <div className="mt-0.5 text-sub text-[11px]">
                              Penyedia jasa pemenang lelang resmi tender LPSE
                              Kab. Sidoarjo
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative flex items-start gap-3 pl-1">
                          <span className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1F8A5B] text-[10px] font-extrabold text-white">
                            4
                          </span>
                          <div className="min-w-0 flex-1 rounded-lg border border-brand/30 bg-[#EAF2F1] p-2.5 text-xs shadow-xs">
                            <div className="font-bold text-brand">
                              Output Fisik: Sepanjang {p.km} km
                            </div>
                            <div className="mt-0.5 text-[#14633F] text-[11px]">
                              Realisasi fisik saat ini {p.progress}%, target
                              selesai {p.end}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Indeks Kewajaran Harga Satuan per KM */}
                    <div className="pt-2 border-t border-line/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sub block mb-2">
                        2. Cek Kewajaran Harga Satuan per KM
                      </span>

                      <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2.5 shadow-xs">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-sub">
                              Biaya per Kilometer:
                            </span>
                            <div className="text-xl font-extrabold text-ink">
                              {rupiahShort(costEval.costPerKm)} / km
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-sub">
                              Median Sidoarjo:
                            </span>
                            <div className="text-xs font-bold text-sub">
                              {rupiahShort(benchmark.median)} / km
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={cx(
                            "flex items-start gap-2 rounded-lg p-2.5 text-xs leading-snug font-medium",
                            costEval.isHigh
                              ? "border border-[#E2B93B]/40 bg-[#FBF1D6] text-[#7A5600]"
                              : "border border-[#34D399]/40 bg-[#E6F3EC] text-[#14633F]",
                          )}
                        >
                          {costEval.isHigh ? (
                            <AlertTriangle
                              size={15}
                              className="mt-0.5 shrink-0 text-[#D99A00]"
                            />
                          ) : (
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-[#1F8A5B]"
                            />
                          )}
                          <span>{costEval.label}</span>
                        </div>

                        {/* Dual Bar Comparison */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-sub">
                            <span>Panjang {p.km} km</span>
                            <span>
                              {Math.round(costEval.ratio * 100)}% dari median
                            </span>
                          </div>
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-line/60">
                            <div
                              className={cx(
                                "h-full transition-all duration-300",
                                costEval.isHigh
                                  ? "bg-[#D99A00]"
                                  : "bg-[#1F8A5B]",
                              )}
                              style={{
                                width: `${Math.min(100, Math.round(costEval.ratio * 50))}%`,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-sub leading-tight">
                            Nilai wajar dihitung dari median proyek jalan di
                            Kab. Sidoarjo. Variasi biaya dipengaruhi ketebalan
                            cor beton vs aspal serta kondisi drainase tepi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Card C: Statistik Daerah */}
            <section className="mx-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <SectionLabel
                n="C"
                title={
                  category === "bangunan"
                    ? "Statistik Fasilitas & Pengunjung"
                    : category === "drainase"
                      ? "Statistik Genangan & Pengendali Banjir"
                      : category === "jembatan"
                        ? "Statistik Teknis Jembatan"
                        : category === "pju"
                          ? "Statistik Penerangan & Keamanan"
                          : category === "trotoar"
                            ? "Statistik Pedestrian & Pejalan Kaki"
                            : "Statistik Daerah"
                }
              />
              <p className="-mt-2 mb-4 text-xs text-sub">
                {category === "bangunan"
                  ? "Kebutuhan revitalisasi ruang publik & fasilitas harian warga Sidoarjo"
                  : category === "drainase"
                    ? "Frekuensi banjir genangan & dampaknya terhadap pemukiman warga"
                    : category === "jembatan"
                      ? "Beban kendaraan harian & kondisi struktur jembatan penghubung"
                      : category === "pju"
                        ? "Tingkat kegelapan ruas jalan & kerawanan keselamatan di malam hari"
                        : category === "trotoar"
                          ? "Aksesibilitas fasilitas pejalan kaki & penataan ruang pejalan"
                          : "Kenapa proyek ini diprioritaskan untuk dibangun?"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {p.stats.map((s) => (
                  <StatTile key={s.label} {...s} />
                ))}
              </div>

              {/* Urgency Highlight Tile in Card C */}
              <div className="mt-4 rounded-xl border border-line bg-canvas/70 p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface border border-line text-brand shadow-xs">
                    <Flame
                      size={18}
                      className={
                        urgency >= 70 ? "text-[#1F8A5B]" : "text-[#D99A00]"
                      }
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-ink">
                      Indeks Urgensi Lapangan: {urgency}/100
                    </div>
                    <div className="text-[11px] text-sub truncate">
                      {category === "bangunan"
                        ? "Dihitung dari kepadatan pengunjung, kerusakan fasilitas, & laporan keluhan"
                        : category === "drainase"
                          ? "Dihitung dari frekuensi genangan, tinggi air banjir, & warga terdampak"
                          : category === "jembatan"
                            ? "Dihitung dari volume kendaraan, titik retak struktur, & usia jembatan"
                            : category === "pju"
                              ? "Dihitung dari titik lampu mati, kerawanan malam, & volume pengguna jalan"
                              : category === "trotoar"
                                ? "Dihitung dari pejalan kaki, titik trotoar rusak, & hambatan akses"
                                : "Dihitung dari riwayat kecelakaan, titik lubang, & traffic"}
                    </div>
                  </div>
                </div>
                {onCompare && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onCompare(p.id)}
                    icon={<Scale size={14} />}
                    className="text-xs font-bold shrink-0"
                  >
                    Bandingkan
                  </Button>
                )}
              </div>

              <p className="mt-3 text-[11px] text-sub">
                Sumber: Agregasi data statistik daerah Sidoarjo (Data contoh).
              </p>
            </section>

            {/* Card D: Pantauan Warga Sekitar (Laporan & Foto Warga) */}
            <section className="mx-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel n="D" title="Pantauan Warga Sekitar" />
                <span className="text-xs font-semibold text-sub">
                  {p.reports.length} laporan masuk
                </span>
              </div>

              {/* Crowd-validation vote summary bar */}
              <div className="mb-4 rounded-xl border border-line bg-canvas/70 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-bold text-[#14633F]">
                    <ThumbsUp size={13} /> {accurateCount} Warga Menyatakan
                    Sesuai
                  </span>
                  <span className="flex items-center gap-1 font-bold text-bad">
                    <ThumbsDown size={13} /> {inaccurateCount} Tidak Sesuai
                  </span>
                </div>

                <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                  <div
                    className="h-full bg-[#1F8A5B] transition-all duration-300"
                    style={{ width: `${accuratePct}%` }}
                    title={`${accuratePct}% menyatakan sesuai`}
                  />
                  <div
                    className="h-full bg-[#C8372D] transition-all duration-300"
                    style={{ width: `${100 - accuratePct}%` }}
                    title={`${100 - accuratePct}% menyatakan tidak sesuai`}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-sub">
                  <span>{accuratePct}% kesesuaian warga</span>
                  <span>Total {totalVotes} respon</span>
                </div>
              </div>

              {/* Report Feed */}
              <div className="max-h-64 overflow-y-auto scroll-quiet rounded-xl border border-line/70 p-3">
                <ReportFeed reports={p.reports} />
              </div>

              {/* Quick action button */}
              <Button
                variant="secondary"
                size="md"
                className="mt-4 w-full justify-center shadow-xs hover:border-brand transition-colors text-xs font-bold"
                icon={<Camera size={15} />}
                onClick={onCek}
              >
                Tambah Laporan Lapangan
              </Button>
            </section>
          </div>
        )}
      </div>

      {showFooter && (
        <footer className="flex shrink-0 gap-3 border-t border-line bg-surface p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <Button
            size="lg"
            className="flex-1 shadow-md shadow-brand/20 hover:shadow-lg transition-all"
            icon={<MapPinCheck size={18} />}
            onClick={onCek}
            disabled={loading}
          >
            Cek Lapangan
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="shadow-xs hover:shadow transition-all"
            icon={<Download size={18} />}
            onClick={download}
            disabled={loading}
          >
            Unduh data<span className="hidden sm:inline">&nbsp;proyek</span>
          </Button>
        </footer>
      )}
    </div>
  )
}
