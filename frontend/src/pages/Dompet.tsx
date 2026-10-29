import { useState, useMemo } from 'react'
import {
  Car,
  ChevronDown,
  Coffee,
  Coins,
  Home,
  ImageDown,
  Lock,
  PieChart,
  Share2,
  Sparkles,
} from 'lucide-react'
import { Button, DataTag, Segmented, Slider, cx, useCountUp, useToast } from '../components/ui'
import { num, projects as defaultProjects, rupiah, rupiahShort } from '../data'
import type { Project } from '../data'

export type Vehicle = 'none' | 'motor_1' | 'motor_2' | 'mobil'
export type House = 'kos' | 'pribadi_sederhana' | 'pribadi_menengah'

// Tarif sesuai PRD FR-03 / DATA_AND_LOGIC.md
export const RATES = {
  kopi: 3000, // pajak restoran 10% dari 1 porsi Rp 30.000
  weeks: 52,
  vehicle: { none: 0, motor_1: 250000, motor_2: 500000, mobil: 1800000 } as Record<Vehicle, number>,
  house: { kos: 0, pribadi_sederhana: 150000, pribadi_menengah: 450000 } as Record<House, number>,
}
const VEHICLE_LABEL: Record<Vehicle, string> = {
  none: 'Tidak ada',
  motor_1: '1 motor',
  motor_2: '2 motor',
  mobil: '1 mobil',
}
const HOUSE_LABEL: Record<House, string> = {
  kos: 'Kos / kontrak',
  pribadi_sederhana: 'Rumah sederhana',
  pribadi_menengah: 'Rumah menengah / ruko',
}

export function calcTax(cups: number, vehicle: Vehicle, house: House) {
  const ngopi = cups * RATES.weeks * RATES.kopi
  const kendaraan = RATES.vehicle[vehicle]
  const pbb = RATES.house[house]
  return { ngopi, kendaraan, pbb, total: ngopi + kendaraan + pbb }
}

export function DotMatrix() {
  return (
    <div className="grid grid-cols-10 gap-1.5" role="img" aria-label="1 dari 100 titik terisi">
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className={cx(
            'aspect-square rounded-full transition-all',
            i === 23 ? 'scale-125 bg-brand ring-4 ring-brand/20 shadow-xs' : 'bg-[#E3DED3]'
          )}
        />
      ))}
    </div>
  )
}

function Field({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-bold">
          <span className="text-sub">{icon}</span>
          {label}
        </label>
        {value && <span className="rounded-md bg-canvas px-2 py-0.5 text-sm font-bold ring-1 ring-line">{value}</span>}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

interface DompetProps {
  onShare: (total: number) => void
  projects?: Project[]
}

export default function Dompet({ onShare, projects = defaultProjects }: DompetProps) {
  const toast = useToast()
  const [cups, setCups] = useState(5)
  const [vehicle, setVehicle] = useState<Vehicle>('motor_1')
  const [house, setHouse] = useState<House>('kos')
  const [open, setOpen] = useState(false)
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.id ?? 'p1')

  const t = calcTax(cups, vehicle, house)
  const shown = useCountUp(t.total)

  // Percentages for breakdown chart
  const breakdown = useMemo(() => {
    if (t.total === 0) return { ngopiPct: 0, kendaraanPct: 0, pbbPct: 0 }
    const ngopiPct = Math.round((t.ngopi / t.total) * 100)
    const kendaraanPct = Math.round((t.kendaraan / t.total) * 100)
    const pbbPct = Math.max(0, 100 - ngopiPct - kendaraanPct)
    return { ngopiPct, kendaraanPct, pbbPct }
  }, [t])

  const proj = projects.find((p) => p.id === selectedProjId) ?? projects[0]
  const localTax = (proj.cost * proj.apbd) / 100
  const pct = localTax > 0 ? (t.total / localTax) * 100 : 0
  const wargaNeeded = t.total > 0 ? Math.ceil(localTax / t.total) : 0

  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto bg-canvas">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-bold text-brand mb-2">
          <Coins size={14} />
          <span>Kalkulator Kas Publik Transparan</span>
        </div>
        <h1 className="mt-1 max-w-2xl text-[28px] font-extrabold leading-tight text-ink md:text-[40px]">
          Seberapa besar pajakmu bekerja untuk daerah?
        </h1>
        <p className="mt-3 max-w-xl text-base text-sub">
          Geser tiga pengaturan di bawah. Dihitung langsung di browsermu tanpa registrasi, tanpa menyimpan data pribadi.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
          {/* Section Input Slider & Controls */}
          <section className="space-y-7 rounded-2xl border border-line bg-surface p-5 shadow-card md:p-8" aria-label="Pengaturan">
            <Field icon={<Coffee size={16} />} label="Ngopi / makan di luar per minggu" value={`${cups} kali`}>
              <Slider value={cups} min={0} max={14} onChange={setCups} label="Ngopi per minggu" />
              <div className="flex justify-between text-xs text-sub">
                <span>0 kali</span>
                <span>7 kali</span>
                <span>14 kali</span>
              </div>
            </Field>

            <Field icon={<Car size={16} />} label="Kendaraan pribadi">
              <Segmented<Vehicle>
                label="Kendaraan pribadi"
                value={vehicle}
                onChange={setVehicle}
                options={[
                  { value: 'none', label: 'Tidak ada' },
                  { value: 'motor_1', label: '1 Motor' },
                  { value: 'motor_2', label: '2 Motor' },
                  { value: 'mobil', label: 'Mobil' },
                ]}
              />
            </Field>

            <Field icon={<Home size={16} />} label="Status hunian">
              <Segmented<House>
                label="Status hunian"
                value={house}
                onChange={setHouse}
                options={[
                  { value: 'kos', label: 'Kos' },
                  { value: 'pribadi_sederhana', label: 'Sederhana' },
                  { value: 'pribadi_menengah', label: 'Menengah' },
                ]}
              />
            </Field>

            <p className="flex items-center gap-2 border-t border-line pt-5 text-xs text-sub">
              <Lock size={14} aria-hidden />
              <span>Hitungan 100% lokal di perangkatmu dan privasi terjamin.</span>
            </p>
          </section>

          {/* Section Hasil Estimasi & Komparasi */}
          <section className="rounded-2xl border border-line bg-surface p-5 shadow-card md:p-8" aria-live="polite">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-sub">Estimasi Kontribusi Pajak Daerah</p>
              <DataTag />
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
              <span className="text-[44px] font-extrabold leading-none tracking-tight text-ink sm:text-[64px]">
                {rupiah(shown)}
              </span>
              <span className="text-lg font-medium text-sub">/ tahun</span>
            </div>

            {/* Visual Breakdown Stacked Bar & Pill Tags */}
            <div className="mt-6 rounded-xl border border-line bg-canvas/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <PieChart size={14} className="text-brand" /> Komposisi Pajakmu
                </span>
                <span className="text-xs font-semibold text-sub">100% dialokasikan</span>
              </div>

              {/* Stacked Bar */}
              <div className="flex h-3.5 w-full overflow-hidden rounded-full ring-1 ring-line/60 bg-line/30 gap-0.5">
                <div
                  className="bg-[#D99A00] transition-all duration-300"
                  style={{ width: `${breakdown.ngopiPct}%` }}
                  title={`Pajak Restoran/Kopi: ${breakdown.ngopiPct}%`}
                />
                <div
                  className="bg-[#0F5C5C] transition-all duration-300"
                  style={{ width: `${breakdown.kendaraanPct}%` }}
                  title={`Pajak Kendaraan (PKB): ${breakdown.kendaraanPct}%`}
                />
                <div
                  className="bg-[#4A6FA5] transition-all duration-300"
                  style={{ width: `${breakdown.pbbPct}%` }}
                  title={`PBB Hunian: ${breakdown.pbbPct}%`}
                />
              </div>

              {/* Breakdown Legend Pills */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-surface border border-line p-2">
                  <div className="flex items-center gap-1 text-[#7A5600] font-bold">
                    <span className="size-2 rounded-full bg-[#D99A00]" /> Kopi/Resto
                  </div>
                  <div className="mt-0.5 font-bold text-ink">{rupiah(t.ngopi)}</div>
                  <div className="text-[11px] text-sub">{breakdown.ngopiPct}%</div>
                </div>

                <div className="rounded-lg bg-surface border border-line p-2">
                  <div className="flex items-center gap-1 text-[#14633F] font-bold">
                    <span className="size-2 rounded-full bg-[#0F5C5C]" /> PKB Kendaraan
                  </div>
                  <div className="mt-0.5 font-bold text-ink">{rupiah(t.kendaraan)}</div>
                  <div className="text-[11px] text-sub">{breakdown.kendaraanPct}%</div>
                </div>

                <div className="rounded-lg bg-surface border border-line p-2">
                  <div className="flex items-center gap-1 text-[#2A4365] font-bold">
                    <span className="size-2 rounded-full bg-[#4A6FA5]" /> PBB Hunian
                  </div>
                  <div className="mt-0.5 font-bold text-ink">{rupiah(t.pbb)}</div>
                  <div className="text-[11px] text-sub">{breakdown.pbbPct}%</div>
                </div>
              </div>
            </div>

            {/* Bagian Komparasi dengan Proyek (Dropdown Interaktif) */}
            <div className="mt-6 rounded-xl border border-line bg-canvas/80 p-5">
              <label htmlFor="compare-project-select" className="text-xs font-bold uppercase tracking-wider text-sub block mb-2">
                Bandingkan kontribusiku dengan proyek:
              </label>

              <div className="relative mb-4">
                <select
                  id="compare-project-select"
                  value={selectedProjId}
                  onChange={(e) => setSelectedProjId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-9 text-sm font-bold text-ink shadow-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.loc.split(',')[0]} • {rupiahShort(p.cost)})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sub" />
              </div>

              <div className="flex gap-5">
                <div className="w-24 shrink-0 sm:w-28 self-center">
                  <DotMatrix />
                </div>
                <div className="min-w-0 self-center">
                  <p className="text-sm font-bold leading-snug text-ink sm:text-base">
                    Kontribusimu setara <span className="text-brand font-extrabold">{num(pct, 3)}%</span> dari dana pajak lokal proyek ini
                  </p>
                  <p className="mt-1.5 text-xs text-sub leading-relaxed">
                    Kamu = 1 titik. Dibutuhkan sekitar <strong>{num(wargaNeeded)} warga</strong> dengan gaya hidup sepertimu untuk
                    menutup porsi Kantong 1 ({rupiahShort(localTax)}) pada proyek <em>{proj.name}</em>.
                  </p>
                </div>
              </div>
            </div>

            {/* Tabel Detail Penghitungan */}
            <div className="mt-6 border-t border-line">
              <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="flex min-h-12 w-full items-center justify-between text-left text-sm font-bold text-ink"
              >
                Bagaimana rincian tarif ini dihitung?
                <ChevronDown size={18} className={cx('text-sub transition-transform duration-200', open && 'rotate-180')} />
              </button>
              <div
                className={cx(
                  'grid transition-[grid-template-rows] duration-200 ease-out',
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <div className="overflow-x-auto pb-1">
                    <table className="w-full min-w-[420px] text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-sub">
                          <th className="py-2 font-bold">Komponen</th>
                          <th className="py-2 font-bold">Tarif &amp; Asumsi</th>
                          <th className="py-2 text-right font-bold">Per Tahun</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {[
                          ['Pajak Restoran / Makanan (PB1 10%)', `${rupiah(RATES.kopi)} × ${cups} kali × 52 minggu`, t.ngopi],
                          ['Pajak Kendaraan Bermotor (PKB)', `${VEHICLE_LABEL[vehicle]} · rata-rata daerah per tahun`, t.kendaraan],
                          ['PBB Pedesaan & Perkotaan', `${HOUSE_LABEL[house]} · tarif rata-rata per tahun`, t.pbb],
                        ].map(([a, b, c]) => (
                          <tr key={a as string} className={cx((c as number) === 0 && 'text-sub')}>
                            <td className="py-2.5 pr-3 font-medium">{a}</td>
                            <td className="py-2.5 pr-3 text-sub text-xs">{b}</td>
                            <td className="py-2.5 text-right font-semibold">{rupiah(c as number)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="py-2.5 font-extrabold text-ink" colSpan={2}>
                            Total Estimasi Kontribusi
                          </td>
                          <td className="py-2.5 text-right font-extrabold text-brand text-base">{rupiah(t.total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-sub">
                    Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu karena pajak daerah dikelola
                    melalui Kas Umum Daerah Kabupaten Sidoarjo.
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" icon={<Share2 size={18} />} className="flex-1 shadow-md shadow-brand/20 hover:shadow-lg transition-all" onClick={() => onShare(t.total)}>
                Bagikan Kartu Dampak
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={<ImageDown size={18} />}
                className="flex-1 shadow-xs hover:shadow transition-all"
                onClick={() => toast('Buka tab Kartu Dampak untuk memilih ukuran & format unduhan.')}
              >
                Unduh Gambar Kartu
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
