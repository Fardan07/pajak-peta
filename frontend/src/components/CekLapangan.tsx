import { useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, ImageIcon, ImagePlus, Inbox, Info, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import type { Project, Report } from '../data'
import { Button, ErrorState, cx } from './ui'

const MAX = 140

export function ReportFeed({ reports }: { reports: Report[] }) {
  if (!reports.length) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line px-4 py-8 text-center">
        <Inbox size={28} className="text-sub" aria-hidden />
        <p className="mt-2 text-sm font-bold">Belum ada laporan</p>
        <p className="mt-0.5 text-sm text-sub">Jadilah warga pertama yang mengecek proyek ini.</p>
      </div>
    )
  }
  return (
    <ul className="divide-y divide-line">
      {reports.map((r) => (
        <li key={r.id} className="flex gap-3 py-3 first:pt-0">
          {r.photo ? (
            <img src={r.photo} alt="Foto laporan warga" className="size-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,#F1EDE4,#F1EDE4_6px,#EAE5DA_6px,#EAE5DA_12px)] text-sub"><ImageIcon size={20} aria-hidden /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5">{r.text}</p>
            <p className="mt-1 flex items-center gap-2 text-xs text-sub">
              <span className={cx('inline-flex items-center gap-1 font-bold', r.verdict === 'sesuai' ? 'text-[#14633F]' : 'text-bad')}>
                {r.verdict === 'sesuai' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                {r.verdict === 'sesuai' ? 'Sesuai' : 'Tidak sesuai'}
              </span>
              · {r.ago}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function CekLapangan({ p, onClose, onSubmit }: { p: Project; onClose: () => void; onSubmit: (r: Report) => void }) {
  const [verdict, setVerdict] = useState<'sesuai' | 'tidak' | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const cam = useRef<HTMLInputElement>(null)
  const gal = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const setFile = (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(f))
    setError('')
  }

  const submit = () => {
    if (verdict === 'tidak' && !photo) {
      setError('Laporan "Tidak Sesuai" memerlukan foto agar bisa diverifikasi warga lain.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      onSubmit({ id: 'new' + Date.now(), verdict: verdict!, text: note.trim() || (verdict === 'sesuai' ? 'Kondisi sesuai laporan.' : 'Kondisi tidak sesuai laporan.'), ago: 'Baru saja', photo: photo ?? undefined })
      setLoading(false)
      setDone(true)
    }, 900)
  }

  const reports = done ? p.reports : p.reports

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-ink/45 animate-fade-in sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="cek-title" className="scroll-quiet max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-card animate-sheet-up sm:max-w-[600px] sm:rounded-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:px-8 sm:pt-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Cek Lapangan</p>
            <h2 id="cek-title" className="mt-1 text-xl font-bold leading-snug">
              {done ? 'Terima kasih, laporanmu tercatat' : 'Apakah kondisi di lapangan sesuai dengan laporan?'}
            </h2>
            <p className="mt-1 text-sm text-sub">{p.name}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Tutup" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-lg text-sub hover:bg-canvas hover:text-ink"><X size={20} /></button>
        </div>

        <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8">
          {done ? (
            <div className="flex flex-col items-center rounded-xl bg-[#E6F3EC] px-6 py-8 text-center animate-fade-in">
              <CheckCircle2 size={44} className="text-ok" aria-hidden />
              <p className="mt-3 text-base font-bold text-[#14633F]">Laporan terkirim</p>
              <p className="mt-1 max-w-sm text-sm text-[#14633F]">Laporanmu muncul di daftar bawah dan membantu warga lain menilai proyek ini.</p>
              <Button className="mt-5" onClick={onClose}>Selesai</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Kondisi lapangan">
                {([['sesuai', 'Sesuai', ThumbsUp, '#1F8A5B', '#E6F3EC'], ['tidak', 'Tidak Sesuai', ThumbsDown, '#C8372D', '#FBE9E7']] as const).map(([k, label, Icon, c, bg]) => {
                  const on = verdict === k
                  return (
                    <button
                      key={k}
                      role="radio"
                      aria-checked={on}
                      onClick={() => { setVerdict(k); setError('') }}
                      className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-base font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card"
                      style={{ borderColor: on ? c : '#E7E2D9', background: on ? bg : '#fff', color: on ? c : '#14213D' }}
                    >
                      <Icon size={30} aria-hidden />
                      {label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-6">
                <p className="mb-2 text-sm font-bold">Foto lapangan <span className="font-medium text-sub">{verdict === 'tidak' ? '(wajib)' : '(opsional)'}</span></p>
                {photo ? (
                  <div className="relative overflow-hidden rounded-xl border border-line">
                    <img src={photo} alt="Pratinjau foto lapangan" className="h-48 w-full object-cover" />
                    <button onClick={() => { URL.revokeObjectURL(photo); setPhoto(null) }} className="absolute right-2 top-2 flex min-h-11 items-center gap-1.5 rounded-lg bg-ink/85 px-3 text-sm font-bold text-white hover:bg-ink">
                      <X size={16} /> Hapus foto
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]) }}
                    className={cx('flex flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors', drag ? 'border-brand bg-[#EAF2F1]' : 'border-line bg-canvas')}
                  >
                    <ImagePlus size={28} className="text-sub" aria-hidden />
                    <p className="mt-2 text-sm text-sub">Seret foto ke sini, atau</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button variant="secondary" size="lg" icon={<Camera size={18} />} onClick={() => cam.current?.click()}>Ambil foto</Button>
                      <Button variant="ghost" size="lg" onClick={() => gal.current?.click()}>Pilih dari galeri</Button>
                    </div>
                  </div>
                )}
                <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => setFile(e.target.files?.[0])} />
                <input ref={gal} type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0])} />
              </div>

              <div className="mt-6">
                <label htmlFor="note" className="mb-2 block text-sm font-bold">Catatan singkat <span className="font-medium text-sub">(opsional)</span></label>
                <textarea
                  id="note"
                  rows={3}
                  maxLength={MAX}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: aspal sudah rata, marka belum dicat"
                  className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-sm placeholder:text-[#8A92A1] hover:border-[#D3CCBF] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                />
                <p className={cx('mt-1 text-right text-xs', note.length > MAX - 15 ? 'font-bold text-bad' : 'text-sub')}>{note.length}/{MAX}</p>
              </div>

              {error && <div className="mt-4"><ErrorState title="Belum bisa dikirim" body={error} /></div>}

              <p className="mt-4 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5 text-sm text-sub">
                <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
                Jika beberapa warga melaporkan tidak sesuai, proyek akan diberi label Perlu Dicek.
              </p>

              <Button size="lg" className="mt-5 w-full" disabled={!verdict} loading={loading} onClick={submit}>
                {loading ? 'Mengirim…' : 'Kirim laporan'}
              </Button>
            </>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <h3 className="mb-3 text-sm font-bold">Laporan warga terbaru</h3>
            <ReportFeed reports={reports} />
          </div>
        </div>
      </div>
    </div>
  )
}
