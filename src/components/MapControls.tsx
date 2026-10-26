import { useState, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, Check, Filter as FilterIcon, AlertTriangle, Layers } from 'lucide-react'
import { STATUS_META, counts } from '../data'
import type { Status } from '../data'
import { cx } from './ui'

export type Filter = 'all' | Status | 'cek'

const chips: { key: Filter; label: string; color?: string; n: number }[] = [
  { key: 'all', label: 'Semua', n: counts.all },
  { key: 'tepat', label: 'Tepat waktu', color: STATUS_META.tepat.color, n: counts.tepat },
  { key: 'dekat', label: 'Waspada', color: STATUS_META.dekat.color, n: counts.dekat },
  { key: 'telat', label: 'Terlambat', color: STATUS_META.telat.color, n: counts.telat },
  { key: 'cek', label: 'Perlu Dicek', color: STATUS_META.telat.color, n: counts.cek },
]

export function SearchBox({ q, setQ, className = '' }: { q: string; setQ: (s: string) => void; className?: string }) {
  return (
    <div className={cx('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sub" aria-hidden />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Cari proyek atau jalan"
        placeholder="Cari proyek atau jalan..."
        className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-9 text-sm placeholder:text-[#7C8493] hover:border-[#D3CCBF] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
      {q && (
        <button onClick={() => setQ('')} aria-label="Hapus pencarian" className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-sub hover:bg-canvas">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export function FilterDropdown({
  filter,
  setFilter,
  counts: dynamicCounts,
  className = '',
}: {
  filter: Filter
  setFilter: (f: Filter) => void
  counts?: { all: number; tepat: number; dekat: number; telat: number; cek: number }
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentCounts = dynamicCounts ?? counts
  const items: {
    key: Filter
    label: string
    shortLabel: string
    desc: string
    color?: string
    isAlert?: boolean
    n: number
  }[] = [
    {
      key: 'all',
      label: 'Semua Kategori',
      shortLabel: 'Semua Kategori',
      desc: 'Seluruh paket proyek fisik daerah',
      n: currentCounts.all,
    },
    {
      key: 'tepat',
      label: 'Tepat Waktu',
      shortLabel: 'Tepat Waktu',
      desc: 'Progres sesuai atau melampaui jadwal',
      color: STATUS_META.tepat.color,
      n: currentCounts.tepat,
    },
    {
      key: 'dekat',
      label: 'Waspada',
      shortLabel: 'Waspada',
      desc: 'Deviasi waktu mulai mendekati batas',
      color: STATUS_META.dekat.color,
      n: currentCounts.dekat,
    },
    {
      key: 'telat',
      label: 'Terlambat',
      shortLabel: 'Terlambat',
      desc: 'Realisasi fisik tertinggal dari target',
      color: STATUS_META.telat.color,
      n: currentCounts.telat,
    },
    {
      key: 'cek',
      label: 'Perlu Dicek Warga',
      shortLabel: 'Perlu Dicek',
      desc: 'Ada laporan sanggahan ketidaksesuaian',
      color: STATUS_META.telat.color,
      isAlert: true,
      n: currentCounts.cek,
    },
  ]

  const active = items.find((i) => i.key === filter) ?? items[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className={cx('relative select-none', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cx(
          'flex h-10 w-full sm:w-auto items-center justify-between gap-2.5 rounded-xl border px-3.5 text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer',
          open
            ? 'border-brand bg-white ring-2 ring-brand/20 text-brand'
            : filter !== 'all'
            ? 'border-brand/40 bg-brand/5 text-brand hover:border-brand hover:bg-brand/10'
            : 'border-line bg-surface text-ink hover:border-[#D3CCBF] hover:bg-canvas'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {filter === 'all' ? (
            <FilterIcon size={14} className="text-sub shrink-0" />
          ) : active.isAlert ? (
            <AlertTriangle size={14} className="text-bad shrink-0" />
          ) : (
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: active.color }}
            />
          )}

          <span className="truncate text-xs sm:text-sm font-bold">
            {active.shortLabel}
          </span>

          <span
            className={cx(
              'inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[11px] font-extrabold',
              filter !== 'all' ? 'bg-brand text-white' : 'bg-canvas text-sub'
            )}
          >
            {active.n}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={cx(
            'text-sub shrink-0 transition-transform duration-200 ml-1',
            open && 'rotate-180 text-brand'
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1.5 w-72 sm:w-80 rounded-2xl border border-line bg-surface/98 p-1.5 shadow-xl backdrop-blur-md animate-fade-in"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-line/60">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sub">
              Pilih Kategori Proyek
            </span>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setFilter('all')
                  setOpen(false)
                }}
                className="text-[11px] font-bold text-brand hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="mt-1 space-y-1">
            {items.map((item) => {
              const isSelected = filter === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setFilter(item.key)
                    setOpen(false)
                  }}
                  className={cx(
                    'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-brand/10 text-brand font-bold'
                      : 'hover:bg-canvas text-ink'
                  )}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="pt-0.5 shrink-0">
                      {item.key === 'all' ? (
                        <Layers
                          size={15}
                          className={isSelected ? 'text-brand' : 'text-sub'}
                        />
                      ) : item.isAlert ? (
                        <AlertTriangle size={15} className="text-bad" />
                      ) : (
                        <span
                          className="block size-2.5 rounded-full mt-1"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold truncate">
                        {item.label}
                      </div>
                      <p className="text-[11px] text-sub leading-tight mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cx(
                        'rounded-full px-2 py-0.5 text-xs font-extrabold',
                        isSelected ? 'bg-brand text-white' : 'bg-canvas text-sub'
                      )}
                    >
                      {item.n}
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-brand shrink-0" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export function FilterChips({
  filter,
  setFilter,
  counts: dynamicCounts,
  className = '',
}: {
  filter: Filter
  setFilter: (f: Filter) => void
  counts?: { all: number; tepat: number; dekat: number; telat: number; cek: number }
  className?: string
}) {
  const currentCounts = dynamicCounts ?? counts
  const items: { key: Filter; label: string; color?: string; n: number }[] = [
    { key: 'all', label: 'Semua', n: currentCounts.all },
    { key: 'tepat', label: 'Tepat waktu', color: STATUS_META.tepat.color, n: currentCounts.tepat },
    { key: 'dekat', label: 'Waspada', color: STATUS_META.dekat.color, n: currentCounts.dekat },
    { key: 'telat', label: 'Terlambat', color: STATUS_META.telat.color, n: currentCounts.telat },
    { key: 'cek', label: 'Perlu Dicek', color: STATUS_META.telat.color, n: currentCounts.cek },
  ]

  return (
    <div role="radiogroup" aria-label="Filter status" className={cx('flex items-center gap-1.5', className)}>
      {items.map((c) => {
        const on = filter === c.key
        const dashed = c.key === 'cek'
        return (
          <button
            key={c.key}
            role="radio"
            aria-checked={on}
            onClick={() => setFilter(c.key)}
            className={cx(
              'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs md:text-sm font-medium transition-colors duration-150',
              dashed && 'border-dashed',
              on ? 'border-brand bg-brand text-white shadow-sm' : 'border-line bg-surface text-ink hover:border-[#D3CCBF] hover:bg-canvas',
              dashed && !on && 'border-bad text-bad',
            )}
          >
            {c.color && !dashed && <span className="size-2 rounded-full" style={{ background: c.color, boxShadow: on ? '0 0 0 1.5px #fff' : undefined }} />}
            {c.label}
            <span className={cx('text-xs font-semibold', on ? 'text-white/80' : 'text-sub')}>{c.n}</span>
          </button>
        )
      })}
    </div>
  )
}
