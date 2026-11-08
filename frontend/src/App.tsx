import { useState, useEffect } from 'react'
import { Database, Map as MapIcon, Scale, Sparkles, UploadCloud, Wallet } from 'lucide-react'
import AdminSyncModal from './components/AdminSyncModal'
import CekLapangan from './components/CekLapangan'
import MapPage from './components/MapPage'
import type { Filter } from './components/MapControls'
import { BrandMark, DataTag, ToastProvider, cx, useToast } from './components/ui'
import { APP_NAME, API_BASE, STORAGE_KEY, TAGLINE, projects as initialProjects } from './data'
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

function loadSavedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length >= initialProjects.length) {
        return parsed
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return initialProjects
}

function saveProjectsToStorage(list: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Ignore quota or storage errors
  }
}

function Shell() {
  const toast = useToast()
  const [page, setPage] = useState<Page>('beranda')
  const [selectedId, setSelectedId] = useState<string | null>('p1')
  const [focusTrigger, setFocusTrigger] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [cekOpen, setCekOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [compareAId, setCompareAId] = useState<string>('p1')
  const [cardTotal, setCardTotal] = useState<number>(() => calcTax(5, 'motor_1', 'kos').total)
  const [cardProject, setCardProject] = useState<Project>(() => initialProjects[0])
  const [, bump] = useState(0)

  const handleOpenCompare = (id: string) => {
    setCompareAId(id)
    setPage('bandingkan')
  }

  const handleResetDemoData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('pajakpeta_projects_v2')
    } catch {
      // Ignore storage errors
    }
    setProjectList(initialProjects)
    setSelectedId('p1')
    toast('Data demo berhasil direset ke 24 proyek awal!')
  }

  // Live state initialized with saved/static projects as zero-latency fallback
  const [projectList, setProjectList] = useState<Project[]>(loadSavedProjects)

  // Fetch projects from backend API on mount only if API_BASE is configured
  useEffect(() => {
    if (!API_BASE) return
    fetch(`${API_BASE}/api/projects`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const arr: Project[] = Array.isArray(data) ? data : data.data
        if (arr && arr.length) {
          setProjectList(arr)
          saveProjectsToStorage(arr)
        }
      })
      .catch(() => {
        // Fallback silently to local/static data when backend is offline
      })
  }, [])

  const selected = projectList.find((p) => p.id === selectedId) ?? null
  const active = page === 'kartu' ? 'dompet' : page

  const addReport = async (r: Report) => {
    if (!selected) return

    // 1. Optimistic UI update + localStorage persistence
    setProjectList((prev) => {
      const updated = prev.map((p) => {
        if (p.id === selected.id) {
          return {
            ...p,
            cek: r.verdict === 'tidak' ? true : p.cek,
            reports: [r, ...p.reports],
          }
        }
        return p
      })
      saveProjectsToStorage(updated)
      return updated
    })
    bump((n) => n + 1)
    toast('Laporan terkirim. Terima kasih!')

    // 2. Persist to backend database if API_BASE is configured
    if (!API_BASE) return
    try {
      const res = await fetch(`${API_BASE}/api/projects/${selected.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: r.verdict,
          text: r.text,
          photo: r.photo,
        }),
      })
      if (!res.ok) throw new Error(`Server error (${res.status})`)
    } catch {
      // Saved in localStorage fallback
    }
  }

  return (
    <div className="flex h-dvh flex-col bg-arch-grid text-ink">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 md:h-16 md:px-6">
        <button
          onClick={() => setPage('beranda')}
          className="flex items-center gap-2.5 rounded-lg text-left"
          aria-label={`${APP_NAME}, kembali ke beranda`}
        >
          <BrandMark size={32} />
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

      <main key={page} className="animate-page-enter flex min-h-0 flex-1 flex-col overflow-hidden">
        {page === 'beranda' && (
        <Beranda
          projects={projectList}
          onExploreMap={() => setPage('peta')}
          onOpenDompet={() => setPage('dompet')}
          onOpenData={() => setPage('data')}
          onSelectProject={(id) => {
            setSelectedId(id)
            setFocusTrigger((n) => n + 1)
            setPage('peta')
          }}
        />
      )}

      {page === 'peta' && (
        <MapPage
          projects={projectList}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          focusTrigger={focusTrigger}
          onCek={() => setCekOpen(true)}
          onCompare={handleOpenCompare}
          filter={filter}
          setFilter={setFilter}
          q={q}
          setQ={setQ}
        />
      )}

      {page === 'dompet' && (
        <Dompet
          onShare={(t, proj) => {
            setCardTotal(t)
            if (proj) setCardProject(proj)
            setPage('kartu')
          }}
          projects={projectList}
        />
      )}
      {page === 'kartu' && (
        <Kartu
          total={cardTotal}
          project={cardProject}
          onBack={() => setPage('dompet')}
        />
      )}
      {page === 'bandingkan' && (
        <Bandingkan
          projects={projectList}
          initialAId={compareAId}
          onSelectProject={(id) => {
            setSelectedId(id)
            setFocusTrigger((n) => n + 1)
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
      </main>

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
        onSyncSuccess={(updated) => {
          setProjectList(updated)
          saveProjectsToStorage(updated)
        }}
        onResetDemo={handleResetDemoData}
        onViewInMap={(targetId) => {
          setFilter('all')
          setQ('')
          setSelectedId(targetId)
          setFocusTrigger((n) => n + 1)
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
