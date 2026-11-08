import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Compass,
  HeartHandshake,
  Layers,
  MapPin,
  Map as MapIcon,
  MessageSquareWarning,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { APP_NAME, TAGLINE, rupiahShort } from '../data'
import type { Project } from '../data'
import { Button, StatusChip, cx } from '../components/ui'
import { useCountUp, useScrollReveal } from '../hooks/useAnimations'

interface BerandaProps {
  projects: Project[]
  onExploreMap: () => void
  onOpenDompet: () => void
  onOpenData: () => void
  onSelectProject: (id: string) => void
}

export default function Beranda({
  projects,
  onExploreMap,
  onOpenDompet,
  onOpenData,
  onSelectProject,
}: BerandaProps) {
  // Live dynamic calculations from projects
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalCost = projects.reduce((acc, p) => acc + p.cost, 0)
    const avgProgress = totalProjects
      ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects)
      : 0
    const totalReports = projects.reduce((acc, p) => acc + (p.reports?.length ?? 0), 0)
    const needsCheckCount = projects.filter((p) => p.cek || p.status === 'telat').length

    return { totalProjects, totalCost, avgProgress, totalReports, needsCheckCount }
  }, [projects])

  // Smooth count-up values for the 4 Hero metric cards (delays: 200, 275, 350, 425)
  const countProjects = Math.round(useCountUp(stats.totalProjects, 900, 200, true))
  const totalCostBillionTarget = stats.totalCost / 1_000_000_000
  const countCostBillion = useCountUp(totalCostBillionTarget, 900, 275, true)
  const countAvgProgress = Math.round(useCountUp(stats.avgProgress, 900, 350, true))
  const countReports = Math.round(useCountUp(stats.totalReports, 900, 425, true))

  const formattedAnimatedCost = useMemo(() => {
    if (stats.totalCost >= 1_000_000_000) {
      return `Rp ${countCostBillion.toFixed(1).replace('.', ',')} miliar`
    }
    return rupiahShort(stats.totalCost)
  }, [stats.totalCost, countCostBillion])

  // Highlights: top 3 projects needing citizen attention
  const spotlightProjects = useMemo(() => {
    const filtered = projects.filter((p) => p.status === 'telat' || p.cek)
    return filtered.slice(0, 3)
  }, [projects])

  // Scroll-reveal observers for lower sections
  const pillarsReveal = useScrollReveal<HTMLElement>()
  const spotlightReveal = useScrollReveal<HTMLElement>()

  return (
    <div className="relative scroll-quiet min-h-0 flex-1 overflow-y-auto overflow-x-hidden text-ink">
      {/* ---------- HERO SECTION ---------- */}
      <section className="relative overflow-hidden border-b border-line px-4 pb-10 pt-6 sm:px-6 md:pb-14 md:pt-10 lg:px-8">
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            {/* Main Headline (Delay 0ms) */}
            <h1
              className="animate-hero-enter max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.12]"
              style={{ animationDelay: '0ms' }}
            >
              Telusuri Uang Pajakmu,{' '}
              <span className="text-brand">Pantau Wujud Nyatanya</span> di Sekitarmu.
            </h1>

            {/* Subheadline (Delay 75ms) */}
            <p
              className="animate-hero-enter mt-3.5 max-w-2xl text-base leading-relaxed text-sub sm:text-lg"
              style={{ animationDelay: '75ms' }}
            >
              Mengubah angka anggaran APBD yang rumit menjadi peta interaktif yang jujur.
              Lihat ke mana pajak STNK, PBB, dan jajanmu bermuara, bandingkan klaim progres dinas dengan
              fakta lapangan, dan awasi bersama.
            </p>

            {/* CTAs (Delay 150ms) */}
            <div
              className="animate-hero-enter mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: '150ms' }}
            >
              <Button
                size="lg"
                icon={<MapIcon size={18} />}
                onClick={onExploreMap}
                className="h-12 px-6 shadow-md shadow-brand/20 hover:shadow-lg transition-all text-base"
              >
                Jelajahi Peta Proyek
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={<Wallet size={18} />}
                onClick={onOpenDompet}
                className="h-12 px-6 shadow-xs hover:shadow transition-all text-base"
              >
                Hitung Kontribusi Pajakku
              </Button>
            </div>
          </div>

          {/* Floating Live Summary Cards (Staggered 200ms, 275ms, 350ms, 425ms) */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div
              className="animate-hero-enter group rounded-2xl border border-line bg-surface/92 p-4 sm:p-5 shadow-card backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex items-center justify-between text-sub">
                <span className="text-xs font-semibold uppercase tracking-wider">Pantauan Proyek</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-brand">
                  <Compass size={18} />
                </span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {countProjects} <span className="text-sm font-semibold text-sub">titik</span>
              </div>
              <p className="mt-1 text-xs text-sub">Tersebar di wilayah Sidoarjo</p>
            </div>

            <div
              className="animate-hero-enter group rounded-2xl border border-line bg-surface/92 p-4 sm:p-5 shadow-card backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30"
              style={{ animationDelay: '275ms' }}
            >
              <div className="flex items-center justify-between text-sub">
                <span className="text-xs font-semibold uppercase tracking-wider">Anggaran Terdata</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-brand">
                  <Layers size={18} />
                </span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {formattedAnimatedCost}
              </div>
              <p className="mt-1 text-xs text-sub">Kombinasi PAD dan APBN</p>
            </div>

            <div
              className="animate-hero-enter group rounded-2xl border border-line bg-surface/92 p-4 sm:p-5 shadow-card backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30"
              style={{ animationDelay: '350ms' }}
            >
              <div className="flex items-center justify-between text-sub">
                <span className="text-xs font-semibold uppercase tracking-wider">Rata-rata Fisik</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-[#1F8A5B]">
                  <TrendingUp size={18} />
                </span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {countAvgProgress}%
              </div>
              <p className="mt-1 text-xs text-sub">Realisasi pengerjaan saat ini</p>
            </div>

            <div
              className="animate-hero-enter group rounded-2xl border border-line bg-surface/92 p-4 sm:p-5 shadow-card backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30"
              style={{ animationDelay: '425ms' }}
            >
              <div className="flex items-center justify-between text-sub">
                <span className="text-xs font-semibold uppercase tracking-wider">Cek Lapangan Warga</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-[#D99A00]">
                  <Users size={18} />
                </span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                {countReports} <span className="text-sm font-semibold text-sub">laporan</span>
              </div>
              <p className="mt-1 text-xs text-sub">{stats.needsCheckCount} proyek dalam radar waspada</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 3 PILAR TRANSPARANSI (Scroll-Reveal) ---------- */}
      <section
        ref={pillarsReveal.ref}
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8"
      >
        <div
          className={cx(
            'text-center transition-all duration-700 ease-out',
            pillarsReveal.visible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-[0.985]',
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Prinsip Keterbukaan</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Bagaimana PajakPeta Bekerja?
          </h2>
          <p className="mt-2 text-sm text-sub max-w-xl mx-auto">
            Tiga pilar integrasi data yang mengubah pengawasan publik dari klaim birokrasi sepihak menjadi akuntabilitas warga dua arah.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div
            style={{ transitionDelay: pillarsReveal.visible ? '90ms' : '0ms' }}
            className={cx(
              'flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-700 ease-out hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md',
              pillarsReveal.visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-[0.985]',
            )}
          >
            <div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#E6F3EC] text-[#14633F]">
                <BarChart3 size={24} />
              </div>
              <span className="mt-5 inline-block text-[11px] font-bold uppercase tracking-wider text-brand">Pilar 01</span>
              <h3 className="mt-1 text-lg font-bold text-ink">Peta Realisasi Real-Time</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                Pantau proyek dengan indikator status otomatis. Warna hijau untuk tepat waktu, kuning untuk waspada, dan merah untuk rawan mangkrak berdasarkan deviasi waktu vs progres fisik nyata.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-sub">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-[#1F8A5B]" /> Hijau
                <span className="size-2 rounded-full bg-[#D99A00]" /> Kuning
                <span className="size-2 rounded-full bg-[#C8372D]" /> Merah
              </span>
              <span className="font-semibold text-brand">Peta Interaktif</span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{ transitionDelay: pillarsReveal.visible ? '180ms' : '0ms' }}
            className={cx(
              'flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-700 ease-out hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md',
              pillarsReveal.visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-[0.985]',
            )}
          >
            <div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#EAF2F1] text-brand">
                <HeartHandshake size={24} />
              </div>
              <span className="mt-5 inline-block text-[11px] font-bold uppercase tracking-wider text-brand">Pilar 02</span>
              <h3 className="mt-1 text-lg font-bold text-ink">Analogi Patungan Warga</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                Kami menyederhanakan miliaran rupiah APBD menjadi <strong>2 Kantong</strong> (PAD &amp; Bantuan Pusat) serta mengonversinya menjadi setara jumlah STNK motor, PBB rumah, atau gelas kopi warga.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-sub">
              <span>Analogi Kas RT/RW</span>
              <span className="font-semibold text-brand">Zero Jargon</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{ transitionDelay: pillarsReveal.visible ? '270ms' : '0ms' }}
            className={cx(
              'flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all duration-700 ease-out hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md',
              pillarsReveal.visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-[0.985]',
            )}
          >
            <div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FBF1D6] text-[#7A5600]">
                <MessageSquareWarning size={24} />
              </div>
              <span className="mt-5 inline-block text-[11px] font-bold uppercase tracking-wider text-brand">Pilar 03</span>
              <h3 className="mt-1 text-lg font-bold text-ink">Bukti Statistik &amp; Cek Lapangan</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                Warga sekitar dapat memverifikasi klaim progres dinas dengan menekan tombol <em>Sesuai</em> atau <em>Tidak Sesuai</em> serta mengunggah bukti foto agar proyek yang janggal segera diaudit.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-sub">
              <span>Crowd-Validation</span>
              <span className="font-semibold text-brand">Akuntabilitas Dua Arah</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SPOTLIGHT PROYEK RAWAN / PERLU CEK (Scroll-Reveal + Animated Progress Bars) ---------- */}
      <section
        ref={spotlightReveal.ref}
        className="border-y border-line bg-surface/90 backdrop-blur-xs px-4 py-16 sm:px-6 md:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div
            className={cx(
              'flex flex-col justify-between gap-4 sm:flex-row sm:items-end transition-all duration-700 ease-out',
              spotlightReveal.visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-6 scale-[0.985]',
            )}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-[#FDEEEB] px-2.5 py-1 text-xs font-bold text-bad">
                <AlertTriangle size={14} />
                <span>Radar Pengawasan</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
                Sorotan Proyek yang Perlu Perhatian Warga
              </h2>
              <p className="mt-1 text-sm text-sub max-w-xl">
                Proyek berikut mengalami deviasi signifikan atau telah dilaporkan tidak sesuai oleh warga setempat. Klik untuk memeriksa detailnya di peta.
              </p>
            </div>

            <Button
              variant="secondary"
              icon={<ArrowRight size={16} />}
              onClick={onExploreMap}
              className="shrink-0 self-start sm:self-auto"
            >
              Buka Seluruh Peta
            </Button>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {spotlightProjects.map((p, idx) => {
              const diff = p.progress - p.elapsed
              const staggerMs = (idx + 1) * 90
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectProject(p.id)}
                  style={{ transitionDelay: spotlightReveal.visible ? `${staggerMs}ms` : '0ms' }}
                  className={cx(
                    'group flex flex-col justify-between rounded-2xl border border-line bg-canvas/60 p-5 shadow-xs transition-all duration-700 ease-out hover:-translate-y-0.5 hover:border-brand/30 hover:bg-surface hover:shadow-md active:scale-[0.98] cursor-pointer',
                    spotlightReveal.visible
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-6 scale-[0.985]',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusChip status={p.status} cek={p.cek} size="sm" />
                      <span className="text-xs font-semibold text-sub">Sisa {p.sisa} hari</span>
                    </div>

                    <h3 className="mt-3 text-base font-bold leading-snug text-ink group-hover:text-brand transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-sub">
                      <MapPin size={13} className="shrink-0" />
                      <span>{p.loc}</span>
                    </p>

                    <div className="mt-4 rounded-xl border border-line bg-surface p-3">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-sub">Realisasi Fisik</span>
                        <span className="font-extrabold text-ink text-sm">{p.progress}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line/60">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: spotlightReveal.visible ? `${p.progress}%` : '0%',
                            transitionDelay: spotlightReveal.visible ? `${staggerMs + 180}ms` : '0ms',
                            background: p.status === 'telat' ? '#C8372D' : '#D99A00',
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-sub">
                        <span>Waktu berjalan: {p.elapsed}%</span>
                        <span className={diff < 0 ? 'text-bad font-semibold' : 'text-sub'}>
                          {diff < 0 ? `${diff} poin tertinggal` : 'Sesuai jadwal'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-line/60 text-xs">
                    <span className="font-bold text-ink">{rupiahShort(p.cost)}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-brand group-hover:translate-x-0.5 transition-transform">
                      Pantau di Peta <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------- FOOTER RINGKAS ---------- */}
      <footer className="border-t border-line bg-surface px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-lg font-bold tracking-tight text-ink">{APP_NAME}</span>
              <span className="text-xs text-sub mt-0.5">{TAGLINE}</span>
              <p className="mt-2 text-xs text-sub max-w-sm text-center sm:text-left">
                Platform transparansi anggaran daerah &amp; verifikasi proyek fisik Kabupaten Sidoarjo.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <button onClick={onExploreMap} className="text-sub hover:text-brand transition-colors">
                Peta Proyek
              </button>
              <span className="text-line">•</span>
              <button onClick={onOpenDompet} className="text-sub hover:text-brand transition-colors">
                Dompet Warga
              </button>
              <span className="text-line">•</span>
              <button onClick={onOpenData} className="text-sub hover:text-brand transition-colors">
                Data Terbuka
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-line/60 pt-6 flex flex-col items-center justify-between gap-3 text-xs text-sub sm:flex-row">
            <p>© 2026 PajakPeta. Lisensi data CC BY 4.0 (Open Government Data).</p>
            <p>Dirancang untuk transparansi publik Kabupaten Sidoarjo.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
