import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, X } from 'lucide-react'
import { STATUS_META } from '../data'
import type { Status } from '../data'

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

/* ---------- Brand ---------- */
export function BrandMark({ size = 42, dark = false, className = '' }: { size?: number; dark?: boolean; className?: string }) {
  return (
    <img
      src="/logo-icon.png"
      alt="Logo Pajak Peta"
      width={size}
      height={size}
      className={cx('object-contain shrink-0 border-2 border-green-100 rounded', dark ? 'bg-white p-0.5' : '', className)}
      style={{ width: size, height: size }}
    />
  )
}

export function DataTag({ className = '' }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center rounded-full border border-line bg-canvas px-2 py-0.5 text-xs font-medium text-sub', className)}>
      Data contoh
    </span>
  )
}

/* ---------- Status ---------- */
export function StatusChip({ status, cek = false, size = 'md' }: { status?: Status; cek?: boolean; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  if (cek) {
    return (
      <span className={cx('inline-flex items-center gap-1 rounded-full border border-dashed border-bad bg-transparent font-bold text-bad', pad)}>
        <AlertTriangle size={12} aria-hidden /> Perlu Dicek
      </span>
    )
  }
  const m = STATUS_META[status!]
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full font-bold', pad)} style={{ background: m.bg, color: m.fg }}>
      <span className="size-2 rounded-full" style={{ background: m.color }} aria-hidden />
      {m.label}
    </span>
  )
}

/* ---------- Pin ---------- */
export function Pin({ status, cek = false, selected = false, cluster, onClick, label }: {
  status?: Status; cek?: boolean; selected?: boolean; cluster?: number; onClick?: () => void; label: string
}) {
  const color = cluster ? '#14213D' : cek ? '#C8372D' : STATUS_META[status!].color
  const size = cluster ? 40 : selected ? 36 : 28
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-offset-4"
      style={{ width: size, height: size, zIndex: selected ? 20 : 10 }}
    >
      {selected && <span className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: color }} />}
      <span
        className="relative flex size-full items-center justify-center rounded-full border-[3px] border-white text-xs font-bold text-white shadow-pin transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:scale-110"
        style={{ background: color, boxShadow: selected ? `0 0 0 3px ${color}55, var(--shadow-pin)` : undefined }}
      >
        {cluster ? cluster : cek ? <span className="size-full rounded-full border border-dashed border-white/90 flex items-center justify-center">!</span> : <span className="size-2 rounded-full bg-white/95" />}
      </span>
    </button>
  )
}

/* ---------- Buttons ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  hover?: boolean
}
export function Button({ variant = 'primary', size = 'md', loading, icon, hover, className, children, disabled, ...rest }: BtnProps) {
  const v = {
    primary: cx('bg-brand text-white hover:bg-brand-d disabled:bg-[#B7C9C8] disabled:text-white', hover && 'bg-brand-d'),
    secondary: cx('border border-line bg-surface text-ink hover:bg-canvas hover:border-[#D3CCBF] disabled:text-[#9AA2B0]', hover && 'bg-canvas border-[#D3CCBF]'),
    ghost: cx('text-brand hover:bg-[#EAF2F1] disabled:text-[#9AA2B0]', hover && 'bg-[#EAF2F1]'),
  }[variant]
  return (
    <button
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors duration-150 active:scale-[0.99]',
        size === 'lg' ? 'h-11' : 'h-10',
        v,
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, elapsed, status = 'tepat' }: { value: number; elapsed?: number; status?: Status }) {
  const n = 25
  const color = STATUS_META[status].color
  return (
    <div className="relative pt-7">
      {elapsed !== undefined && (
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${elapsed}%` }}>
          <div className="whitespace-nowrap text-xs font-medium text-sub">Waktu {elapsed}%</div>
          <div className="mx-auto mt-0.5 h-3 w-px bg-ink" />
        </div>
      )}
      <div className="flex gap-0.5" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Realisasi fisik">
        {Array.from({ length: n }, (_, i) => {
          const fill = Math.max(0, Math.min(1, (value - (i * 100) / n) / (100 / n)))
          return (
            <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-[2px] bg-[#EDE9E0]">
              <div className="h-full" style={{ width: `${fill * 100}%`, background: color }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SolidBar({ value, status = 'tepat', dark = false }: { value: number; status?: Status; dark?: boolean }) {
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full', dark ? 'bg-white/20' : 'bg-[#EDE9E0]')}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: STATUS_META[status].color }} />
    </div>
  )
}

/* ---------- Segmented ---------- */
export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-lg border border-line bg-canvas p-1">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-bold transition-all duration-150',
              on ? 'bg-surface text-brand shadow-[0_1px_2px_rgba(20,33,61,.12)] ring-1 ring-brand' : 'text-sub hover:text-ink',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Slider ---------- */
export function Slider({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <input
      type="range"
      aria-label={label}
      className="slider"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{ ['--fill' as string]: `${fill}%` }}
    />
  )
}

/* ---------- Sparkline & stat ---------- */
export function Sparkline({ data, color = '#0F5C5C', w = 96, h = 28 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((d, i) => [(i / (data.length - 1)) * (w - 4) + 2, h - 3 - ((d - min) / (max - min || 1)) * (h - 6)])
  const line = pts.map((p) => p.join(',')).join(' ')
  const last = pts[pts.length - 1]
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" height={h} aria-hidden>
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}

export function StatTile({ value, label, data }: { value: string; label: string; data: number[] }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3 transition-shadow hover:shadow-card">
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="mt-1.5 min-h-8 text-xs leading-4 text-sub">{label}</div>
      <div className="mt-2"><Sparkline data={data} /></div>
    </div>
  )
}

/* ---------- Skeleton / empty / error ---------- */
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={cx('animate-shimmer rounded-md bg-[#EDE9E0]', className)} />
)

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-bad/30 bg-[#FBE9E7] p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-bad" aria-hidden />
        <div>
          <p className="text-sm font-bold text-[#8F251D]">{title}</p>
          <p className="mt-0.5 text-sm text-[#8F251D]">{body}</p>
          {onRetry && <button onClick={onRetry} className="mt-2 text-sm font-bold text-[#8F251D] underline underline-offset-2">Coba lagi</button>}
        </div>
      </div>
    </div>
  )
}

/* ---------- Accordion ---------- */
export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-line">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-sm font-bold">
        {title}
        <ChevronDown size={18} className={cx('shrink-0 text-sub transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </button>
      <div className={cx('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden"><div className="pb-4">{children}</div></div>
      </div>
    </div>
  )
}

/* ---------- Toast ---------- */
type ToastKind = 'ok' | 'error'
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => { })
export const useToast = () => useContext(ToastCtx)

export function Toast({ msg, kind = 'ok', onClose }: { msg: string; kind?: ToastKind; onClose?: () => void }) {
  return (
    <div role="status" className="flex items-center gap-3 rounded-xl bg-ink py-3 pl-4 pr-3 text-sm font-medium text-white shadow-card animate-fade-in">
      {kind === 'ok' ? <CheckCircle2 size={18} className="shrink-0 text-[#7ED3A8]" aria-hidden /> : <AlertTriangle size={18} className="shrink-0 text-[#FF9C93]" aria-hidden />}
      <span>{msg}</span>
      {onClose && <button aria-label="Tutup" onClick={onClose} className="flex size-8 items-center justify-center rounded-md hover:bg-white/10"><X size={16} /></button>}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ msg: string; kind: ToastKind; id: number } | null>(null)
  const timer = useRef<number>(0)
  const push = useCallback((msg: string, kind: ToastKind = 'ok') => {
    setT({ msg, kind, id: Date.now() })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setT(null), 3200)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      {t && (
        <div key={t.id} className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 md:bottom-8">
          <div className="pointer-events-auto"><Toast msg={t.msg} kind={t.kind} onClose={() => setT(null)} /></div>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

/* ---------- Hooks ---------- */
export function useCountUp(target: number, ms = 600) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = from.current
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      const cur = start + (target - start) * e
      setV(cur)
      from.current = cur
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}
