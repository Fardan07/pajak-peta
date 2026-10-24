import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ImageDown } from 'lucide-react'
import { BrandMark, Button, Segmented, useToast } from '../components/ui'
import { APP_DOMAIN, APP_NAME, TAGLINE, projects, rupiah } from '../data'

function Qr({ color, size }: { color: string; size: number }) {
  const n = 21
  const cells: [number, number][] = []
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (finder(x, y)) continue
    if (Math.sin(x * 91.7 + y * 37.3) * 1000 % 1 > 0.5 || (Math.sin(x * 12.1 + y * 71.9) * 1000) % 1 < -0.5) cells.push([x, y])
  }
  const F = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}><rect width="7" height="7" fill={color} /><rect x="1" y="1" width="5" height="5" fill="none" /><rect x="2" y="2" width="3" height="3" fill={color} /></g>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} aria-label="Kode QR contoh" shapeRendering="crispEdges">
      {cells.map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" fill={color} />)}
      <F x={0} y={0} /><F x={14} y={0} /><F x={0} y={14} />
      {[[0, 0], [14, 0], [0, 14]].map(([x, y]) => <rect key={`${x}${y}`} x={x + 1} y={y + 1} width="5" height="5" fill="none" stroke={color === '#fff' ? '#0B3F3F' : '#FAF8F4'} strokeWidth="1" />)}
    </svg>
  )
}

export function ImpactCard({ dark, square, total }: { dark: boolean; square: boolean; total: number }) {
  const p = projects[0]
  const meters = total / (p.cost / (p.km * 1000))
  const big = meters >= 1 ? `${meters.toLocaleString('id-ID', { maximumFractionDigits: 1 })} m` : `${Math.round(meters * 100)} cm`
  const bg = dark ? '#0B3F3F' : '#FAF8F4'
  const fg = dark ? '#FAF8F4' : '#14213D'
  const sub = dark ? 'rgba(250,248,244,.7)' : '#5B6577'
  const pad = square ? 72 : 88
  return (
    <div style={{ width: 1080, height: square ? 1080 : 1350, background: bg, color: fg, padding: pad, fontFamily: 'var(--font-sans)' }} className="relative flex flex-col justify-between overflow-hidden">
      <svg className="absolute -right-40 -top-40" width="760" height="760" viewBox="0 0 760 760" fill="none" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx="380" cy="380" rx={60 + i * 42} ry={44 + i * 36} transform={`rotate(${i * 7} 380 380)`} stroke={dark ? '#fff' : '#0F5C5C'} strokeOpacity={dark ? 0.1 : 0.12} strokeWidth="2" />
        ))}
      </svg>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4"><BrandMark size={56} dark={dark} /><span style={{ fontSize: 36, fontWeight: 700 }}>{APP_NAME}</span></div>
        <span style={{ fontSize: 22, fontWeight: 500, color: sub, border: `1.5px solid ${dark ? 'rgba(255,255,255,.25)' : '#E7E2D9'}`, borderRadius: 999, padding: '6px 18px' }}>Data contoh</span>
      </div>

      <div className="relative">
        <p style={{ fontSize: square ? 48 : 56, fontWeight: 500, color: sub, lineHeight: 1.15 }}>Pajakku tahun ini setara ...</p>
        <p style={{ fontSize: square ? 240 : 300, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 24, color: dark ? '#fff' : '#0F5C5C' }}>{big}</p>
        <p style={{ fontSize: square ? 40 : 44, fontWeight: 500, marginTop: 20, lineHeight: 1.25 }}>jalan baru yang kubantu bangun, dari {rupiah(total)} per tahun.</p>
      </div>

      <div className="relative">
        <p style={{ fontSize: 22, fontWeight: 500, color: sub, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Proyek</p>
        <p style={{ fontSize: 38, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>{p.name}</p>
        <div className="mt-6 flex items-center gap-6">
          <div style={{ height: 14, flex: 1, borderRadius: 999, background: dark ? 'rgba(255,255,255,.18)' : '#E7E2D9' }}>
            <div style={{ width: `${p.progress}%`, height: '100%', borderRadius: 999, background: dark ? '#7ED3A8' : '#1F8A5B' }} />
          </div>
          <span style={{ fontSize: 34, fontWeight: 700 }}>{p.progress}%</span>
        </div>
        <div className="mt-10 flex items-end justify-between" style={{ borderTop: `1.5px solid ${dark ? 'rgba(255,255,255,.2)' : '#E7E2D9'}`, paddingTop: 32 }}>
          <div>
            <p style={{ fontSize: 28, fontWeight: 500, color: sub, maxWidth: 640 }}>{TAGLINE}</p>
            <p style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>{APP_DOMAIN}/gedangan-2</p>
          </div>
          <div style={{ background: dark ? '#FAF8F4' : '#fff', padding: 12, borderRadius: 12, border: dark ? 'none' : '1.5px solid #E7E2D9' }}><Qr color="#14213D" size={128} /></div>
        </div>
      </div>
    </div>
  )
}

function Scaled({ children, w, h }: { children: React.ReactNode; w: number; h: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [s, setS] = useState(0.3)
  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => setS(el.clientWidth / w))
    ro.observe(el)
    setS(el.clientWidth / w)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={ref} className="w-full overflow-hidden rounded-xl border border-line shadow-card" style={{ height: h * s }}>
      <div style={{ width: w, height: h, transform: `scale(${s})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

export default function Kartu({ total, onBack }: { total: number; onBack: () => void }) {
  const [fmt, setFmt] = useState<'4:5' | '1:1'>('4:5')
  const toast = useToast()
  const sq = fmt === '1:1'
  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <button onClick={onBack} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-bold text-brand hover:underline"><ArrowLeft size={16} />Kembali ke Dompet Warga</button>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-[28px] font-bold leading-tight md:text-[40px]">Kartu Dampak</h1>
            <p className="mt-2 text-base text-sub">Siap dibagikan ke Instagram, WhatsApp, atau X. {sq ? '1080 × 1080' : '1080 × 1350'} piksel.</p>
          </div>
          <div className="w-full md:w-64"><Segmented<'4:5' | '1:1'> label="Format kartu" value={fmt} onChange={setFmt} options={[{ value: '4:5', label: '1080×1350' }, { value: '1:1', label: '1080×1080' }]} /></div>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {([false, true] as const).map((dark) => (
            <figure key={String(dark)} className="space-y-4">
              <Scaled w={1080} h={sq ? 1080 : 1350}><ImpactCard dark={dark} square={sq} total={total} /></Scaled>
              <figcaption className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{dark ? 'Teal gelap' : 'Terang'}</span>
                <Button size="lg" variant={dark ? 'secondary' : 'primary'} icon={<ImageDown size={18} />} onClick={() => toast(`Kartu ${dark ? 'teal gelap' : 'terang'} (${sq ? '1080×1080' : '1080×1350'}) siap diunduh`)}>Unduh PNG</Button>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
