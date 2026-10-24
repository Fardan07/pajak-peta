import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Info, Layers } from 'lucide-react'
import { STATUS_META, projects } from '../data'
import { FilterChips, FilterDropdown, SearchBox } from './MapControls'
import type { Filter } from './MapControls'
import type { Project } from '../data'
import GoogleMapLayer from './GoogleMapLayer'
import LeafletLayer from './LeafletLayer'
import ProjectDetail from './ProjectDetail'
import { Button, DataTag, Segmented, StatusChip, cx } from './ui'

const SNAP = ['peek', 'half', 'full'] as const

export default function MapPage({
  selectedId,
  setSelectedId,
  onCek,
  onCompare,
  filter,
  setFilter,
  q,
  setQ,
  projects: allProjects = projects,
}: {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  onCek: () => void
  onCompare?: (id: string) => void
  filter: Filter
  setFilter: (f: Filter) => void
  q: string
  setQ: (s: string) => void
  projects?: Project[]
}) {
  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || localStorage.getItem('gmaps_key') || '')
  const [draft, setDraft] = useState('')
  const [mapType, setMapType] = useState<'roadmap' | 'osm' | 'hybrid'>('roadmap')
  const [panel, setPanel] = useState(false)
  const [legendOpen, setLegendOpen] = useState(true)
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [mapErr, setMapErr] = useState('')
  const live = !!apiKey && !mapErr
  const saveKey = (k: string) => { if (k) localStorage.setItem('gmaps_key', k); else localStorage.removeItem('gmaps_key'); setMapErr(''); setApiKey(k); setDraft(''); setPanel(false) }
  const selected = allProjects.find((p) => p.id === selectedId) ?? null

  const list = useMemo(() => allProjects.filter((p) => {
    const f = filter === 'all' || (filter === 'cek' ? p.cek : p.status === filter)
    const s = !q || (p.name + p.loc).toLowerCase().includes(q.toLowerCase())
    return f && s
  }), [filter, q, allProjects])

  const projectCounts = useMemo(() => ({
    all: allProjects.length,
    tepat: allProjects.filter((p) => p.status === 'tepat').length,
    dekat: allProjects.filter((p) => p.status === 'dekat').length,
    telat: allProjects.filter((p) => p.status === 'telat').length,
    cek: allProjects.filter((p) => p.cek).length,
  }), [allProjects])

  /* mobile sheet */
  const [snap, setSnap] = useState(0)
  const [dragH, setDragH] = useState<number | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const startRef = useRef<{ y: number; h: number } | null>(null)
  const heights = () => {
    const H = wrap.current?.clientHeight ?? 700
    return [168, Math.round(H * 0.55), H - 64]
  }
  useEffect(() => { setSnap(0) }, [selectedId])
  const curH = dragH ?? heights()[snap]
  const onDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    startRef.current = { y: e.clientY, h: heights()[snap] }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!startRef.current) return
    const hs = heights()
    setDragH(Math.max(hs[0], Math.min(hs[2], startRef.current.h + (startRef.current.y - e.clientY))))
  }
  const onUp = () => {
    if (!startRef.current) return
    const hs = heights(), h = dragH ?? startRef.current.h
    const moved = Math.abs(h - startRef.current.h) < 6
    if (moved) setSnap((snap + 1) % 3)
    else setSnap(hs.reduce((b, v, i) => (Math.abs(v - h) < Math.abs(hs[b] - h) ? i : b), 0))
    startRef.current = null
    setDragH(null)
  }

  return (
    <div ref={wrap} className="relative flex min-h-0 flex-1 overflow-hidden">
      <div className="relative min-w-0 flex-1 overflow-hidden bg-[#EFEBE2] transition-[flex-basis] duration-200">
        {live ? (
          <GoogleMapLayer apiKey={apiKey} list={list} selectedId={selectedId} onSelect={setSelectedId} mapType={mapType === 'hybrid' ? 'hybrid' : 'roadmap'} onError={setMapErr} showBoundaries={showBoundaries} />
        ) : (
          <LeafletLayer list={list} selectedId={selectedId} onSelect={setSelectedId} mapType={mapType} projects={allProjects} showBoundaries={showBoundaries} />
        )}

        {/* Floating Control Bar (Glassmorphism) */}
        <div
          className="pointer-events-auto absolute left-3 top-3 z-30 flex max-w-[calc(100vw-24px)] flex-col gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-card backdrop-blur-md md:left-4 md:top-4"
          style={{ zIndex: 30 }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchBox q={q} setQ={setQ} className="w-full sm:w-60 md:w-64 shrink-0" />
            <FilterDropdown filter={filter} setFilter={setFilter} counts={projectCounts} />
          </div>
        </div>

        <div
          className={cx('absolute right-3 z-30 flex flex-col-reverse items-end md:right-4', selected ? 'bottom-[252px] md:bottom-7' : 'bottom-[80px] md:bottom-7')}
          style={{ zIndex: 30 }}
        >
          <button onClick={() => setPanel(!panel)} aria-expanded={panel} className="flex h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-bold shadow-card hover:bg-canvas">
            <Layers size={18} aria-hidden /><span className="hidden sm:inline">Pengaturan peta</span>
          </button>
          {panel && (
            <div className="mb-2 w-[min(320px,calc(100vw-24px))] space-y-3 rounded-xl border border-line bg-surface p-4 shadow-card animate-fade-in">
              <Segmented<'roadmap' | 'osm' | 'hybrid'>
                label="Tipe peta"
                value={mapType}
                onChange={setMapType}
                options={[
                  { value: 'roadmap', label: 'Jalan' },
                  { value: 'osm', label: 'Topo' },
                  { value: 'hybrid', label: 'Satelit' },
                ]}
              />
              <p className="text-xs font-medium text-sub">
                Mesin peta:{' '}
                <b className="text-ink">
                  {live
                    ? 'Google Maps'
                    : mapType === 'osm'
                    ? 'Esri Topo (Tanpa Key)'
                    : mapType === 'hybrid'
                    ? 'Esri Satelit'
                    : 'Esri Street Map (Bebas Watermark)'}
                </b>
              </p>

              {/* Toggle Batas Wilayah */}
              <div className="flex items-center justify-between border-t border-line/60 pt-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-ink">Batas Wilayah Daerah</span>
                  <p className="text-[11px] text-sub">Garis merah batas Sidoarjo & sekitar</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showBoundaries}
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className={cx(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                    showBoundaries ? 'bg-brand' : 'bg-line'
                  )}
                >
                  <span
                    className={cx(
                      'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                      showBoundaries ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              <div className="border-t border-line/60 pt-3">
                <label htmlFor="gkey" className="block text-sm font-bold">Google Maps API key</label>
                <input id="gkey" value={draft} onChange={(e) => setDraft(e.target.value.trim())} placeholder={live ? 'Tempel key baru untuk mengganti' : 'AIza...'} className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25" />
                {mapErr && <p role="alert" className="mt-1 text-sm text-bad">{mapErr}</p>}
                <p className="mt-1 text-xs leading-4 text-sub">Isi untuk beralih ke Google Maps. Atau set VITE_GOOGLE_MAPS_API_KEY di file .env agar aktif otomatis.</p>
                <div className="mt-2.5 flex gap-2">
                  <Button className="flex-1" disabled={!draft} onClick={() => saveKey(draft)}>Terapkan</Button>
                  {apiKey && <Button variant="secondary" onClick={() => saveKey('')}>Hapus</Button>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* legend */}
        <div className="absolute bottom-4 left-4 z-30 hidden md:block" style={{ zIndex: 30 }}>
          {legendOpen ? (
            <div className="rounded-xl border border-line bg-surface/95 p-3.5 shadow-card backdrop-blur-md transition-all">
              <div className="mb-2 flex items-center justify-between gap-4 border-b border-line/60 pb-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-sub">Legenda</p>
                <button
                  type="button"
                  onClick={() => setLegendOpen(false)}
                  title="Sembunyikan legenda"
                  aria-label="Sembunyikan legenda"
                  className="rounded p-0.5 text-sub hover:bg-canvas hover:text-ink transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <ul className="space-y-1.5 text-xs">
                {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full ring-2 ring-white"
                      style={{ background: STATUS_META[k].color, boxShadow: '0 0 0 1px #E7E2D9' }}
                    />
                    <span className="font-medium text-ink">{STATUS_META[k].label}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  <span
                    className="flex size-3.5 items-center justify-center rounded-full text-white ring-2 ring-white"
                    style={{ background: '#C8372D', boxShadow: '0 0 0 1px #E7E2D9' }}
                  >
                    <AlertTriangle size={9} className="stroke-[2.5]" aria-hidden />
                  </span>
                  <span className="font-medium text-ink">Perlu Dicek</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="flex size-3.5 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-white ring-2 ring-white"
                    style={{ boxShadow: '0 0 0 1px #E7E2D9' }}
                  >
                    3
                  </span>
                  <span className="font-medium text-ink">Kelompok proyek</span>
                </li>
                <li className="flex items-center gap-2 pt-1.5 border-t border-line/60">
                  <span className="h-1.5 w-4 rounded-full bg-[#DC2626] ring-1 ring-red-200" />
                  <span className="font-semibold text-ink">Batas Kab. Sidoarjo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-0 w-4 border-t-2 border-dashed border-[#64748B]" />
                  <span className="font-medium text-sub">Batas Kota/Kab Sekitar</span>
                </li>
              </ul>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface/95 px-3 py-1.5 text-xs font-bold shadow-card hover:bg-canvas backdrop-blur-md transition-colors"
              title="Tampilkan legenda"
              aria-label="Tampilkan legenda"
            >
              <Info size={14} className="text-brand" />
              <span>Legenda</span>
              <ChevronUp size={14} className="text-sub" />
            </button>
          )}
        </div>
      </div>

      {/* desktop panel */}
      {selected && (
        <aside className="hidden h-full w-[420px] shrink-0 border-l border-line bg-surface shadow-card animate-slide-in md:block">
          <ProjectDetail
            key={selected.id}
            p={selected}
            onCek={onCek}
            onClose={() => setSelectedId(null)}
            onCompare={onCompare}
          />
        </aside>
      )}

      {/* mobile sheet */}
      {selected && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-line bg-surface shadow-[0_-8px_24px_rgba(20,33,61,.12)] animate-sheet-up md:hidden"
          style={{ height: curH, transition: dragH === null ? 'height 240ms ease-out' : 'none' }}
        >
          <div
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            className="flex h-8 shrink-0 touch-none flex-col items-center justify-center"
            role="button" tabIndex={0} aria-label={`Ubah tinggi panel (${SNAP[snap]})`}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSnap((snap + 1) % 3)}
          >
            <span className="h-1 w-10 rounded-full bg-[#CFC8BA]" />
          </div>
          {snap === 0 ? (
            <div className="min-h-0 flex-1 px-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2"><StatusChip status={selected.status} size="sm" />{selected.cek && <StatusChip cek size="sm" />}</div>
                  <h2 className="text-base font-bold leading-snug">{selected.name}</h2>
                  <p className="mt-1 text-sm text-sub">{selected.progress}% selesai · sisa {selected.sisa} hari</p>
                </div>
                <button onClick={() => setSnap(1)} aria-label="Buka detail" className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line"><ChevronUp size={20} /></button>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1">
              <ProjectDetail
                key={selected.id}
                p={selected}
                onCek={onCek}
                onClose={() => setSelectedId(null)}
                onCompare={onCompare}
                showFooter
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
