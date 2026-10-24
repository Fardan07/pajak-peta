import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { projects } from '../data'
import type { Project } from '../data'
import { Pin } from './ui'
import boundariesData from '../boundaries.json'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const google: any

export const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ saturation: -55 }, { lightness: 8 }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#d5e1e3' }] },
  { featureType: 'landscape', stylers: [{ color: '#efebe2' }] },
]

let loader: Promise<void> | null = null
function loadGoogle(key: string): Promise<void> {
  const w = window as any
  if (w.google?.maps) return Promise.resolve()
  if (loader) return loader
  loader = new Promise((res, rej) => {
    w.__gmInit = () => res()
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&callback=__gmInit`
    s.async = true
    s.onerror = () => rej(new Error('load'))
    document.head.appendChild(s)
  })
  return loader
}

function OverlayPin({ map, lat, lng, children }: { map: any; lat: number; lng: number; children: React.ReactNode }) {
  const el = useMemo(() => {
    const d = document.createElement('div')
    d.style.cssText = 'position:absolute;width:0;height:0;'
    return d
  }, [])
  useEffect(() => {
    const pos = new google.maps.LatLng(lat, lng)
    class O extends google.maps.OverlayView {
      onAdd() { this.getPanes().overlayMouseTarget.appendChild(el) }
      draw() {
        const p = this.getProjection()?.fromLatLngToDivPixel(pos)
        if (p) { el.style.left = p.x + 'px'; el.style.top = p.y + 'px' }
      }
      onRemove() { el.remove() }
    }
    const o = new O()
    o.setMap(map)
    return () => o.setMap(null)
  }, [map, lat, lng, el])
  return createPortal(children, el)
}

interface Group { key: string; items: Project[]; lat: number; lng: number }

export default function GoogleMapLayer({
  apiKey,
  list,
  selectedId,
  onSelect,
  mapType,
  onError,
  showBoundaries = true,
}: {
  apiKey: string
  list: Project[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  mapType: 'roadmap' | 'hybrid'
  onError: (m: string) => void
  showBoundaries?: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [zoom, setZoom] = useState(12)
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const errRef = useRef(onError)
  errRef.current = onError

  useEffect(() => {
    let alive = true
    ;(window as any).gm_authFailure = () => errRef.current('API key ditolak Google. Periksa key dan pastikan Maps JavaScript API aktif.')
    loadGoogle(apiKey).then(() => {
      if (!alive || !host.current) return
      const m = new google.maps.Map(host.current, {
        center: { lat: -7.41, lng: 112.72 },
        zoom: 12,
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      })
      const b = new google.maps.LatLngBounds()
      projects.forEach((p) => b.extend({ lat: p.lat, lng: p.lng }))
      m.fitBounds(b, 48)
      m.addListener('zoom_changed', () => setZoom(m.getZoom()))
      m.addListener('click', () => selectRef.current(null))
      const ro = new ResizeObserver(() => google.maps.event.trigger(m, 'resize'))
      ro.observe(host.current)
      setMap(m)
    }).catch(() => errRef.current('Google Maps gagal dimuat. Periksa koneksi atau API key.'))
    return () => { alive = false }
  }, [apiKey])

  useEffect(() => { map?.setMapTypeId(mapType) }, [map, mapType])

  useEffect(() => {
    if (!map) return
    map.data.forEach((f: any) => map.data.remove(f))
    if (!showBoundaries) return

    map.data.addGeoJson(boundariesData)
    map.data.setStyle((feature: any) => {
      const isMain = feature.getProperty('isMain')
      return {
        strokeColor: isMain ? '#DC2626' : '#64748B',
        strokeWeight: isMain ? 3.5 : 2,
        strokeOpacity: 0.9,
        fillColor: isMain ? '#EF4444' : '#64748B',
        fillOpacity: isMain ? 0.05 : 0.02,
        clickable: true,
      }
    })

    const infoWindow = new google.maps.InfoWindow()
    const clickListener = map.data.addListener('click', (e: any) => {
      const isMain = e.feature.getProperty('isMain')
      const name = e.feature.getProperty('name')
      const content = `
        <div style="font-family: Poppins, sans-serif; padding: 6px; min-width: 220px;">
          <h4 style="margin: 0 0 4px; font-weight: 800; color: #14213d; font-size: 14px;">${name}</h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #5b6577;">${isMain ? 'Wilayah 24 Proyek PajakPeta' : 'Perbatasan Wilayah'}</p>
          <div style="background: ${isMain ? '#FEF2F2' : '#F8FAFC'}; border: 1px solid ${isMain ? '#FECACA' : '#E2E8F0'}; border-radius: 8px; padding: 8px;">
            <div style="font-size: 10px; font-weight: bold; color: ${isMain ? '#B91C1C' : '#64748B'};">TOTAL PROYEK:</div>
            <div style="font-size: 18px; font-weight: 900; color: ${isMain ? '#B91C1C' : '#334155'};">${isMain ? '24 Paket Proyek' : '0 Proyek'}</div>
          </div>
        </div>
      `
      infoWindow.setContent(content)
      infoWindow.setPosition(e.latLng)
      infoWindow.open(map)
    })

    return () => {
      google.maps.event.removeListener(clickListener)
      infoWindow.close()
    }
  }, [map, showBoundaries])

  useEffect(() => {
    const p = projects.find((x) => x.id === selectedId)
    if (!map || !p) return
    const t = setTimeout(() => map.panTo({ lat: p.lat, lng: p.lng }), 260)
    return () => clearTimeout(t)
  }, [map, selectedId])

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

  return (
    <>
      <div ref={host} className="absolute inset-0" />
      {map && groups.map((g) => (
        <OverlayPin key={g.key} map={map} lat={g.lat} lng={g.lng}>
          {g.items.length > 1 ? (
            <Pin cluster={g.items.length} label={`${g.items.length} proyek, perbesar peta`} onClick={() => { map.panTo({ lat: g.lat, lng: g.lng }); map.setZoom(Math.min(18, zoom + 2)) }} />
          ) : (
            <Pin status={g.items[0].status} cek={g.items[0].cek} selected={g.items[0].id === selectedId} label={g.items[0].name} onClick={() => onSelect(g.items[0].id)} />
          )}
        </OverlayPin>
      ))}
    </>
  )
}
