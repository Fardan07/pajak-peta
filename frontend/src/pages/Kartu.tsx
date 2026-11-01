import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ImageDown } from 'lucide-react'
import { BrandMark, Button, Segmented, useToast } from '../components/ui'
import { APP_DOMAIN, APP_NAME, TAGLINE, projects, rupiah } from '../data'
import type { Project } from '../data'

function getQrCells(): [number, number][] {
  const n = 21
  const cells: [number, number][] = []
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (finder(x, y)) continue
      if ((Math.sin(x * 91.7 + y * 37.3) * 1000) % 1 > 0.5 || (Math.sin(x * 12.1 + y * 71.9) * 1000) % 1 < -0.5) {
        cells.push([x, y])
      }
    }
  }
  return cells
}

function Qr({ color, size }: { color: string; size: number }) {
  const n = 21
  const cells = getQrCells()
  const F = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill={color} />
      <rect x="1" y="1" width="5" height="5" fill="none" />
      <rect x="2" y="2" width="3" height="3" fill={color} />
    </g>
  )
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} aria-label="Kode QR contoh" shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
      <F x={0} y={0} />
      <F x={14} y={0} />
      <F x={0} y={14} />
      {[
        [0, 0],
        [14, 0],
        [0, 14],
      ].map(([x, y]) => (
        <rect
          key={`${x}${y}`}
          x={x + 1}
          y={y + 1}
          width="5"
          height="5"
          fill="none"
          stroke={color === '#fff' ? '#0B3F3F' : '#FAF8F4'}
          strokeWidth="1"
        />
      ))}
    </svg>
  )
}

function getProjectSlug(p: Project): string {
  if (p.id === 'p1') return 'gedangan-2'
  return p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 22)
}

export function ImpactCard({
  dark,
  square,
  total,
  project,
}: {
  dark: boolean
  square: boolean
  total: number
  project?: Project
}) {
  const p = project ?? projects[0]
  const kmSafe = Math.max(0.1, p.km || 1)
  const meters = total / (p.cost / (kmSafe * 1000))
  const big =
    meters >= 1
      ? `${meters.toLocaleString('id-ID', { maximumFractionDigits: 1 })} m`
      : `${Math.max(1, Math.round(meters * 100))} cm`
  const bg = dark ? '#0B3F3F' : '#FAF8F4'
  const fg = dark ? '#FAF8F4' : '#14213D'
  const sub = dark ? 'rgba(250,248,244,.7)' : '#5B6577'
  const pad = square ? 72 : 88
  const slug = getProjectSlug(p)

  return (
    <div
      style={{
        width: 1080,
        height: square ? 1080 : 1350,
        background: bg,
        color: fg,
        padding: pad,
        fontFamily: 'var(--font-sans)',
      }}
      className="relative flex flex-col justify-between overflow-hidden"
    >
      <svg className="absolute -right-40 -top-40" width="760" height="760" viewBox="0 0 760 760" fill="none" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx="380"
            cy="380"
            rx={60 + i * 42}
            ry={44 + i * 36}
            transform={`rotate(${i * 7} 380 380)`}
            stroke={dark ? '#fff' : '#0F5C5C'}
            strokeOpacity={dark ? 0.1 : 0.12}
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandMark size={56} dark={dark} />
          <span style={{ fontSize: 36, fontWeight: 700 }}>{APP_NAME}</span>
        </div>
        <span
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: sub,
            border: `1.5px solid ${dark ? 'rgba(255,255,255,.25)' : '#E7E2D9'}`,
            borderRadius: 999,
            padding: '6px 18px',
          }}
        >
          Data contoh
        </span>
      </div>

      <div className="relative">
        <p style={{ fontSize: square ? 48 : 56, fontWeight: 500, color: sub, lineHeight: 1.15 }}>
          Pajakku tahun ini setara ...
        </p>
        <p
          style={{
            fontSize: square ? 240 : 300,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            marginTop: 24,
            color: dark ? '#fff' : '#0F5C5C',
          }}
        >
          {big}
        </p>
        <p style={{ fontSize: square ? 40 : 44, fontWeight: 500, marginTop: 20, lineHeight: 1.25 }}>
          kontribusi fisik pada proyek ini, dari {rupiah(total)} per tahun.
        </p>
      </div>

      <div className="relative">
        <p style={{ fontSize: 22, fontWeight: 500, color: sub, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Proyek ({p.loc.split(',')[0]})
        </p>
        <p style={{ fontSize: 38, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>{p.name}</p>
        <div className="mt-6 flex items-center gap-6">
          <div style={{ height: 14, flex: 1, borderRadius: 999, background: dark ? 'rgba(255,255,255,.18)' : '#E7E2D9' }}>
            <div
              style={{
                width: `${p.progress}%`,
                height: '100%',
                borderRadius: 999,
                background: dark ? '#7ED3A8' : '#1F8A5B',
              }}
            />
          </div>
          <span style={{ fontSize: 34, fontWeight: 700 }}>{p.progress}%</span>
        </div>
        <div
          className="mt-10 flex items-end justify-between"
          style={{ borderTop: `1.5px solid ${dark ? 'rgba(255,255,255,.2)' : '#E7E2D9'}`, paddingTop: 32 }}
        >
          <div>
            <p style={{ fontSize: 28, fontWeight: 500, color: sub, maxWidth: 640 }}>{TAGLINE}</p>
            <p style={{ fontSize: 36, fontWeight: 700, marginTop: 10 }}>
              {APP_DOMAIN}/{slug}
            </p>
          </div>
          <div
            style={{
              background: dark ? '#FAF8F4' : '#fff',
              padding: 12,
              borderRadius: 12,
              border: dark ? 'none' : '1.5px solid #E7E2D9',
            }}
          >
            <Qr color="#14213D" size={128} />
          </div>
        </div>
      </div>
    </div>
  )
}

function downloadImpactCardPng({
  dark,
  square,
  total,
  project,
}: {
  dark: boolean
  square: boolean
  total: number
  project?: Project
}) {
  const p = project ?? projects[0]
  const W = 1080
  const H = square ? 1080 : 1350
  const pad = square ? 72 : 88

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const bg = dark ? '#0B3F3F' : '#FAF8F4'
  const fg = dark ? '#FAF8F4' : '#14213D'
  const sub = dark ? 'rgba(250,248,244,0.72)' : '#5B6577'
  const accent = dark ? '#FFFFFF' : '#0F5C5C'
  const slug = getProjectSlug(p)

  // 1. Background
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 2. Decorative ellipses top-right
  ctx.save()
  ctx.translate(W - 220, 220)
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,92,92,0.12)'
  ctx.lineWidth = 2
  for (let i = 0; i < 9; i++) {
    ctx.save()
    ctx.rotate((i * 7 * Math.PI) / 180)
    ctx.beginPath()
    ctx.ellipse(0, 0, 60 + i * 42, 44 + i * 36, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  // 3. Brand Logo & Header
  ctx.fillStyle = dark ? '#FAF8F4' : '#0F5C5C'
  ctx.beginPath()
  ctx.roundRect(pad, pad, 56, 56, 14)
  ctx.fill()

  ctx.fillStyle = fg
  ctx.font = 'bold 36px Poppins, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(APP_NAME, pad + 72, pad + 28)

  // 4. Center Hero Impact
  const centerY = square ? 430 : 540
  const kmSafe = Math.max(0.1, p.km || 1)
  const meters = total / (p.cost / (kmSafe * 1000))
  const big =
    meters >= 1
      ? `${meters.toLocaleString('id-ID', { maximumFractionDigits: 1 })} m`
      : `${Math.max(1, Math.round(meters * 100))} cm`

  ctx.fillStyle = sub
  ctx.font = `500 ${square ? 48 : 56}px Poppins, sans-serif`
  ctx.fillText('Pajakku tahun ini setara ...', pad, centerY - 170)

  ctx.fillStyle = accent
  ctx.font = `bold ${square ? 210 : 250}px Poppins, sans-serif`
  ctx.fillText(big, pad, centerY)

  ctx.fillStyle = fg
  ctx.font = `500 ${square ? 38 : 42}px Poppins, sans-serif`
  ctx.fillText(`kontribusi fisik pada proyek ini, dari ${rupiah(total)} / tahun.`, pad, centerY + 135)

  // 5. Bottom Project Section
  const bottomBase = H - pad
  const footerTop = bottomBase - 160

  ctx.fillStyle = sub
  ctx.font = '600 22px Poppins, sans-serif'
  ctx.fillText(`PROYEK (${p.loc.split(',')[0].toUpperCase()})`, pad, footerTop - 165)

  ctx.fillStyle = fg
  ctx.font = 'bold 36px Poppins, sans-serif'
  const truncatedName = p.name.length > 42 ? p.name.slice(0, 40) + '…' : p.name
  ctx.fillText(truncatedName, pad, footerTop - 115)

  // Progress bar
  const barWidth = W - pad * 2 - 120
  const barY = footerTop - 60
  ctx.fillStyle = dark ? 'rgba(255,255,255,0.18)' : '#E7E2D9'
  ctx.beginPath()
  ctx.roundRect(pad, barY, barWidth, 14, 7)
  ctx.fill()

  ctx.fillStyle = dark ? '#7ED3A8' : '#1F8A5B'
  ctx.beginPath()
  ctx.roundRect(pad, barY, Math.max(14, (barWidth * p.progress) / 100), 14, 7)
  ctx.fill()

  ctx.fillStyle = fg
  ctx.font = 'bold 34px Poppins, sans-serif'
  ctx.fillText(`${p.progress}%`, pad + barWidth + 24, barY + 7)

  // Divider line
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.2)' : '#E7E2D9'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(pad, footerTop)
  ctx.lineTo(W - pad, footerTop)
  ctx.stroke()

  // Tagline & Domain
  ctx.fillStyle = sub
  ctx.font = '500 28px Poppins, sans-serif'
  ctx.fillText(TAGLINE, pad, footerTop + 55)

  ctx.fillStyle = fg
  ctx.font = 'bold 36px Poppins, sans-serif'
  ctx.fillText(`${APP_DOMAIN}/${slug}`, pad, footerTop + 110)

  // QR Box
  const qrBoxSize = 152
  const qrX = W - pad - qrBoxSize
  const qrY = bottomBase - qrBoxSize
  ctx.fillStyle = dark ? '#FAF8F4' : '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 12)
  ctx.fill()

  const cellPx = 6
  const qrStartX = qrX + 13
  const qrStartY = qrY + 13
  ctx.fillStyle = '#14213D'
  const cells = getQrCells()
  cells.forEach(([cx, cy]) => {
    ctx.fillRect(qrStartX + cx * cellPx, qrStartY + cy * cellPx, cellPx, cellPx)
  })
  // Finder patterns
  ;[
    [0, 0],
    [14, 0],
    [0, 14],
  ].forEach(([fx, fy]) => {
    ctx.fillStyle = '#14213D'
    ctx.fillRect(qrStartX + fx * cellPx, qrStartY + fy * cellPx, 7 * cellPx, 7 * cellPx)
    ctx.fillStyle = dark ? '#FAF8F4' : '#FFFFFF'
    ctx.fillRect(qrStartX + (fx + 1) * cellPx, qrStartY + (fy + 1) * cellPx, 5 * cellPx, 5 * cellPx)
    ctx.fillStyle = '#14213D'
    ctx.fillRect(qrStartX + (fx + 2) * cellPx, qrStartY + (fy + 2) * cellPx, 3 * cellPx, 3 * cellPx)
  })

  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `kartu-dampak-pajakpeta-${p.id}-${dark ? 'dark' : 'light'}-${square ? '1080x1080' : '1080x1350'}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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

export default function Kartu({
  total,
  project,
  onBack,
}: {
  total: number
  project?: Project
  onBack: () => void
}) {
  const [fmt, setFmt] = useState<'4:5' | '1:1'>('4:5')
  const toast = useToast()
  const sq = fmt === '1:1'
  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <button
          onClick={onBack}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-bold text-brand hover:underline"
        >
          <ArrowLeft size={16} />
          Kembali ke Dompet Warga
        </button>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-[28px] font-bold leading-tight md:text-[40px]">Kartu Dampak</h1>
            <p className="mt-2 text-base text-sub">
              Siap dibagikan ke Instagram, WhatsApp, atau X. {sq ? '1080 × 1080' : '1080 × 1350'} piksel.
            </p>
          </div>
          <div className="w-full md:w-64">
            <Segmented<'4:5' | '1:1'>
              label="Format kartu"
              value={fmt}
              onChange={setFmt}
              options={[
                { value: '4:5', label: '1080×1350' },
                { value: '1:1', label: '1080×1080' },
              ]}
            />
          </div>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {([false, true] as const).map((dark) => (
            <figure key={String(dark)} className="space-y-4">
              <Scaled w={1080} h={sq ? 1080 : 1350}>
                <ImpactCard dark={dark} square={sq} total={total} project={project} />
              </Scaled>
              <figcaption className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold">{dark ? 'Teal gelap' : 'Terang'}</span>
                <Button
                  size="lg"
                  variant={dark ? 'secondary' : 'primary'}
                  icon={<ImageDown size={18} />}
                  onClick={() => {
                    downloadImpactCardPng({ dark, square: sq, total, project })
                    toast(`Kartu ${dark ? 'teal gelap' : 'terang'} (${sq ? '1080×1080' : '1080×1350'}) berhasil diunduh`)
                  }}
                >
                  Unduh PNG
                </Button>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
