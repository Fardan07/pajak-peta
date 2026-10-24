import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { projects } from '../data'
import type { Project } from '../data'
import { Pin, cx } from './ui'
import boundariesData from '../boundaries.json'

const cartoKey = import.meta.env.VITE_CARTO_API_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('carto_key') : '') || ''

const TILES: Record<string, { url: string; attr: string }> = {
  roadmap: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri &mdash; Peta Jalan Sidoarjo',
  },
  osm: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri &mdash; Topografi Daerah',
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri &mdash; Citra Satelit',
  },
}

interface Group { key: string; items: Project[]; lat: number; lng: number }

export default function LeafletLayer({
  list,
  selectedId,
  onSelect,
  mapType,
  projects: allProjects = projects,
  showBoundaries = true,
}: {
  list: Project[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  mapType: 'roadmap' | 'osm' | 'hybrid'
  projects?: Project[]
  showBoundaries?: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tileRef = useRef<L.TileLayer | null>(null)
  const boundaryRef = useRef<L.GeoJSON | null>(null)
  const [, tick] = useState(0)
  const [zoom, setZoom] = useState(12)
  const [regionPopup, setRegionPopup] = useState<{
    name: string
    isMain: boolean
    sub: string
    lat: number
    lng: number
  } | null>(null)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect

  useEffect(() => {
    const m = L.map(host.current!, {
      zoomControl: false,
      attributionControl: true,
      zoomSnap: 0.5,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [-7.75, 112.35], // Batas barat daya Sidoarjo
        [-7.10, 112.95], // Batas timur laut Sidoarjo/Surabaya
      ],
      maxBoundsViscosity: 0.8,
    })
    L.control.zoom({ position: 'topright' }).addTo(m)
    m.fitBounds(L.latLngBounds(projects.map((p) => [p.lat, p.lng] as [number, number])), { padding: [48, 48] })
    const bump = () => { setZoom(m.getZoom()); tick((n) => n + 1) }
    m.on('move zoom', bump)
    m.on('click', () => {
      selectRef.current(null)
      setRegionPopup(null)
    })
    const ro = new ResizeObserver(() => { m.invalidateSize(); bump() })
    ro.observe(host.current!)
    mapRef.current = m
    bump()
    return () => { ro.disconnect(); m.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    tileRef.current?.remove()
    tileRef.current = L.tileLayer(TILES[mapType].url, {
      attribution: TILES[mapType].attr,
      maxZoom: 19,
      maxNativeZoom: 18,
      keepBuffer: 8,
      updateWhenIdle: false,
    }).addTo(m)
  }, [mapType])

  // Administrative Boundaries (Red line for Sidoarjo + surrounding cities)
  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    boundaryRef.current?.remove()

    if (!showBoundaries) return

    // GeoJSON boundaries: clean lines only ("cukup cuma garis daerah aja")
    const boundaryLayer = L.geoJSON(boundariesData as any, {
      style: (feature) => {
        const isMain = feature?.properties?.isMain
        if (isMain) {
          return {
            color: '#DC2626', // Garis Merah Batas Kabupaten Sidoarjo
            weight: 3.5,
            opacity: 0.95,
            fillColor: '#EF4444',
            fillOpacity: 0.05,
          }
        }
        return {
          color: '#64748B', // Garis Batas Kota/Kabupaten Sekitar
          weight: 2,
          opacity: 0.8,
          dashArray: '5, 5',
          fillColor: '#94A3B8',
          fillOpacity: 0.02,
        }
      },
      onEachFeature: (feature, layer) => {
        const isMain = feature?.properties?.isMain
        const name = feature?.properties?.name || 'Daerah'
        const sub = isMain ? 'Wilayah Kerja Proyek PajakPeta' : 'Daerah Perbatasan Sekitar'

        layer.on({
          click: (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e)
            const target = e.originalEvent?.target as HTMLElement | undefined
            if (target?.blur) target.blur()
            setRegionPopup({
              name,
              isMain: !!isMain,
              sub,
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            })
          },
          mouseover: (e) => {
            const l = e.target
            l.setStyle({
              weight: isMain ? 4.5 : 3,
              opacity: 1,
              fillOpacity: isMain ? 0.08 : 0.04,
            })
          },
          mouseout: () => {
            boundaryLayer.resetStyle(layer)
          },
        })

        // Ensure path SVG has no focus outline or tabIndex
        setTimeout(() => {
          const path = (layer as any)._path as SVGPathElement | undefined
          if (path) {
            path.style.outline = 'none'
            path.style.boxShadow = 'none'
            path.removeAttribute('tabindex')
          }
        }, 0)
      },
    }).addTo(m)
    boundaryRef.current = boundaryLayer

    return () => {
      boundaryLayer.remove()
    }
  }, [showBoundaries, allProjects])

  useEffect(() => {
    const p = allProjects.find((x) => x.id === selectedId)
    const m = mapRef.current
    if (!m || !p) return
    const t = setTimeout(() => { m.invalidateSize(); m.panTo([p.lat, p.lng]) }, 260)
    return () => clearTimeout(t)
  }, [selectedId, allProjects])

  const groups = useMemo<Group[]>(() => {
    const thr = (44 * 360) / (256 * Math.pow(2, zoom))
    const used = new Set<string>()
    const out: Group[] = []
    for (const p of list) {
      if (used.has(p.id)) continue
      const near = p.id === selectedId ? [p] : list.filter((o) => !used.has(o.id) && o.id !== selectedId && Math.hypot(o.lat - p.lat, o.lng - p.lng) < thr)
      near.forEach((o) => used.add(o.id))
      out.push({ key: near.map((o) => o.id).join('-'), items: near, lat: near.reduce((s, o) => s + o.lat, 0) / near.length, lng: near.reduce((s, o) => s + o.lng, 0) / near.length })
    }
    return out
  }, [list, selectedId, zoom])

  const m = mapRef.current
  return (
    <div className="relative isolate z-0 size-full overflow-hidden" style={{ zIndex: 0 }}>
      {/* Map canvas host trapped at z-0 so Leaflet's internal panes cannot escape */}
      <div
        ref={host}
        style={{ zIndex: 0 }}
        className="absolute inset-0 z-0 bg-[#EFEBE2] [&_.leaflet-control-zoom]:!border-line [&_.leaflet-control-zoom]:!shadow-card [&_.leaflet-top.leaflet-right]:hidden md:[&_.leaflet-top.leaflet-right]:block"
      />

      {/* Pins layer: z-10 (strictly on top of map tiles) */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ zIndex: 10 }}>
        {m && groups.map((g) => {
          const pt = m.latLngToContainerPoint([g.lat, g.lng])
          return (
            <div key={g.key} className="pointer-events-auto absolute" style={{ left: pt.x, top: pt.y, zIndex: 10 }}>
              {g.items.length > 1 ? (
                <Pin cluster={g.items.length} label={`${g.items.length} proyek, perbesar peta`} onClick={() => m.setView([g.lat, g.lng], Math.min(18, m.getZoom() + 2))} />
              ) : (
                <Pin status={g.items[0].status} cek={g.items[0].cek} selected={g.items[0].id === selectedId} label={g.items[0].name} onClick={() => onSelect(g.items[0].id)} />
              )}
            </div>
          )
        })}
      </div>

      {/* Region Popup layer: z-50 (Guaranteed ABOVE pins at z-10, impossible to bleed through) */}
      {regionPopup && m && (() => {
        const pt = m.latLngToContainerPoint([regionPopup.lat, regionPopup.lng])
        const tepat = allProjects.filter((p) => p.status === 'tepat').length
        const dekat = allProjects.filter((p) => p.status === 'dekat').length
        const telat = allProjects.filter((p) => p.status === 'telat').length
        const total = regionPopup.isMain ? allProjects.length : 0

        return (
          <div
            className="pointer-events-auto absolute z-50 -translate-x-1/2 -translate-y-full animate-fade-in"
            style={{ left: pt.x, top: pt.y - 14, zIndex: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-72 rounded-2xl border border-line bg-white p-4 shadow-2xl select-none"
              style={{ backgroundColor: '#ffffff' }}
            >
              <button
                type="button"
                onClick={() => setRegionPopup(null)}
                aria-label="Tutup informasi daerah"
                className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-lg text-sub hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-2 pr-6 pb-2.5 mb-2.5 border-b border-line">
                <span className={cx('size-2.5 rounded-full shrink-0', regionPopup.isMain ? 'bg-red-600 ring-2 ring-red-200' : 'bg-slate-400 ring-2 ring-slate-200')} />
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-ink leading-tight truncate">{regionPopup.name}</h3>
                  <p className="text-[10px] font-semibold text-sub mt-0.5">{regionPopup.sub}</p>
                </div>
              </div>

              <div className={cx('rounded-xl p-3 border', regionPopup.isMain ? 'bg-red-50/80 border-red-200' : 'bg-slate-50 border-slate-200')}>
                <div className={cx('text-[10px] font-extrabold uppercase tracking-wider', regionPopup.isMain ? 'text-red-700' : 'text-slate-500')}>
                  Total Proyek
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className={cx('text-2xl font-black', regionPopup.isMain ? 'text-red-700' : 'text-slate-700')}>
                    {total}
                  </span>
                  <span className={cx('text-xs font-bold', regionPopup.isMain ? 'text-red-600' : 'text-slate-500')}>
                    Paket Proyek
                  </span>
                </div>
                <p className="text-[11px] text-sub mt-1.5 leading-snug">
                  {regionPopup.isMain
                    ? 'Seluruh 24 proyek APBD Kabupaten Sidoarjo terpantau aktif di wilayah ini.'
                    : 'Wilayah tetangga di luar yurisdiksi anggaran APBD Kab. Sidoarjo.'}
                </p>
              </div>

              {regionPopup.isMain && (
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
                  <div className="rounded-lg bg-[#E6F3EC] py-1 border border-[#1F8A5B]/30 text-[#14633F]">
                    <div className="font-extrabold leading-none">{tepat}</div>
                    <div className="text-[9px] font-medium opacity-80 mt-0.5">Tepat</div>
                  </div>
                  <div className="rounded-lg bg-[#FBF1D6] py-1 border border-[#D99A00]/30 text-[#7A5600]">
                    <div className="font-extrabold leading-none">{dekat}</div>
                    <div className="text-[9px] font-medium opacity-80 mt-0.5">Waspada</div>
                  </div>
                  <div className="rounded-lg bg-[#FBE9E7] py-1 border border-[#C8372D]/30 text-[#A22920]">
                    <div className="font-extrabold leading-none">{telat}</div>
                    <div className="text-[9px] font-medium opacity-80 mt-0.5">Telat</div>
                  </div>
                </div>
              )}

              {/* Triangle pointer */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-b border-r border-line bg-white"
                style={{ backgroundColor: '#ffffff' }}
              />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
