import { useState, useEffect } from 'react'
import { Database, Map as MapIcon, Scale, Sparkles, UploadCloud, Wallet } from 'lucide-react'
import AdminSyncModal from './components/AdminSyncModal'
import CekLapangan from './components/CekLapangan'
import MapPage from './components/MapPage'
import type { Filter } from './components/MapControls'
import { BrandMark, DataTag, ToastProvider, cx, useToast } from './components/ui'
import { APP_NAME, TAGLINE, projects as initialProjects } from './data'
import type { Project, Report } from './data'
import Bandingkan from './pages/Bandingkan'
import Beranda from './pages/Beranda'
import DataTerbuka from './pages/DataTerbuka'
import Dompet, { calcTax } from './pages/Dompet'
import Kartu from './pages/Kartu'
import Komponen from './pages/Komponen'

type Page = 'beranda' | 'peta' | 'dompet' | 'kartu' | 'data' | 'bandingkan' | 'komponen'

const nav: { key: Page; label: string; short: string; icon: typeof Sparkles }[] = [
  { key: 'beranda', label: 'Beranda', short: 'Beranda', icon: Sparkles },
  { key: 'peta', label: 'Peta Proyek', short: 'Peta', icon: MapIcon },
  { key: 'dompet', label: 'Dompet Warga', short: 'Dompet', icon: Wallet },
  { key: 'bandingkan', label: 'Bandingkan Proyek', short: 'Bandingkan', icon: Scale },
  { key: 'data', label: 'Data Terbuka', short: 'Data', icon: Database },
]

function Shell() {
  const toast = useToast()
  const [page, setPage] = useState<Page>('beranda')
  const [selectedId, setSelectedId] = useState<string | null>('p1')
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [cekOpen, setCekOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [compareAId, setCompareAId] = useState<string>('p1')
  const [, bump] = useState(0)

  const handleOpenCompare = (id: string) => {
    setCompareAId(id)
    setPage('bandingkan')
  }

  // Live state initialized with static projects as zero-latency fallback
  const [projectList, setProjectList] = useState<Project[]>(initialProjects)

  // Fetch projects from backend Neon PostgreSQL on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((data) => {
        const arr: Project[] = Array.isArray(data) ? data : data.data
        if (arr && arr.length) {
          setProjectList(arr)
        }
      })
      .catch((err) => {
        console.warn('Backend API tidak tersambung, menggunakan data statis:', err)
      })
  }, [])

  const selected = projectList.find((p) => p.id === selectedId) ?? null
  const active = page === 'kartu' ? 'dompet' : page
  const total = calcTax(5, 'motor_1', 'kos').total

  const addReport = async (r: Report) => {
    if (!selected) return

    // 1. Optimistic UI update
    setProjectList((prev) =>
      prev.map((p) => {
        if (p.id === selected.id) {
          return {
            ...p,
            cek: r.verdict === 'tidak' ? true : p.cek,
            reports: [r, ...p.reports],
          }
        }
        return p
      })
    )
    bump((n) => n + 1)
    toast('Laporan terkirim. Terima kasih!')

    // 2. Persist to Neon PostgreSQL Database
    try {
      await fetch(`http://localhost:5000/api/projects/${selected.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: r.verdict,
          text: r.text,
          photo: r.photo,
        }),
      })
    } catch (err) {
      console.warn('Gagal menyimpan laporan ke backend Neon:', err)
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 md:h-16 md:px-6">
        <button
          onClick={() => setPage('beranda')}
          className="flex items-center gap-2.5 rounded-lg text-left"
          aria-label={`${APP_NAME}, kembali ke beranda`}
        >
          <BrandMark size={42} />
          <span className="flex flex-col items-start leading-none">
            <span className="text-xl font-bold tracking-tight text-ink">{APP_NAME}</span>
            <span className="mt-1 hidden text-xs font-medium text-sub sm:block">{TAGLINE}</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminModalOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-2.5 sm:px-3 text-xs font-bold text-brand hover:bg-brand/20 transition-all shadow-xs"
            title="Portal Sinkronisasi Data Dinas (Admin PU)"
          >
            <UploadCloud size={14} className="text-brand shrink-0" />
            <span className="hidden sm:inline">Portal Dinas</span>
            <span className="sm:hidden">Dinas</span>
          </button>
          <DataTag className="md:hidden" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {nav.map((n) => (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                aria-current={active === n.key ? 'page' : undefined}
                className={cx(
                  'relative flex h-10 items-center gap-1.5 rounded-lg px-3.5 text-sm font-bold transition-colors',
                  active === n.key ? 'text-brand' : 'text-sub hover:bg-canvas hover:text-ink'
                )}
              >
                {n.label}
                {active === n.key && (
                  <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {page === 'beranda' && (
        <Beranda
          projects={projectList}
          onExploreMap={() => setPage('peta')}
          onOpenDompet={() => setPage('dompet')}
          onOpenData={() => setPage('data')}
          onSelectProject={(id) => {
            setSelectedId(id)
            setPage('peta')
          }}
        />
      )}

      {page === 'peta' && (
        <MapPage
          projects={projectList}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onCek={() => setCekOpen(true)}
          onCompare={handleOpenCompare}
          filter={filter}
          setFilter={setFilter}
          q={q}
          setQ={setQ}
        />
      )}

      {page === 'dompet' && <Dompet onShare={() => setPage('kartu')} projects={projectList} />}
      {page === 'kartu' && <Kartu total={total} onBack={() => setPage('dompet')} />}
      {page === 'bandingkan' && (
        <Bandingkan
          projects={projectList}
          initialAId={compareAId}
          onSelectProject={(id) => {
            setSelectedId(id)
            setPage('peta')
          }}
        />
      )}
      {page === 'data' && (
        <DataTerbuka
          projects={projectList}
          onOpenAdminSync={() => setAdminModalOpen(true)}
        />
      )}
      {page === 'komponen' && <Komponen />}

      {/* Mobile Bottom Navigation */}
      <nav className="grid h-16 shrink-0 grid-cols-5 border-t border-line bg-surface md:hidden" aria-label="Tab utama">
        {nav.map((n) => {
          const Icon = n.icon
          const on = active === n.key
          return (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              aria-current={on ? 'page' : undefined}
              className={cx(
                'flex min-h-11 flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors',
                on ? 'text-brand' : 'text-sub'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] truncate max-w-[64px]">{n.short}</span>
            </button>
          )
        })}
      </nav>

      {cekOpen && selected && <CekLapangan p={selected} onClose={() => setCekOpen(false)} onSubmit={addReport} />}

      <AdminSyncModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        existingProjects={projectList}
        onSyncSuccess={(updated, firstSyncedId) => {
          setProjectList(updated)
        }}
        onViewInMap={(targetId) => {
          setSelectedId(targetId)
          setPage('peta')
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  )
}
