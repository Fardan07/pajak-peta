import { useState } from 'react'
import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { Button, ErrorState, Pin, ProgressBar, Segmented, Skeleton, Slider, StatTile, StatusChip, Toast } from '../components/ui'
import { ReportFeed } from '../components/CekLapangan'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card md:p-6">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-sub">{title}</h2>
      {children}
    </section>
  )
}

export default function Komponen() {
  const [v, setV] = useState<'a' | 'b' | 'c'>('b')
  const [s, setS] = useState(6)
  return (
    <div className="scroll-quiet min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-12">
        <h1 className="text-[28px] font-bold md:text-[40px]">Pustaka komponen</h1>
        <p className="mt-2 text-base text-sub">Status, tombol, input, dan keadaan kosong, memuat, serta galat.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Block title="Chip status">
            <div className="flex flex-wrap gap-2"><StatusChip status="tepat" /><StatusChip status="dekat" /><StatusChip status="telat" /><StatusChip cek /></div>
          </Block>
          <Block title="Pin: 4 status, terpilih, kelompok">
            <div className="flex flex-wrap items-center gap-8 py-3">
              {(['tepat', 'dekat', 'telat'] as const).map((k) => <div key={k} className="relative size-8"><Pin status={k} label={k} /></div>)}
              <div className="relative size-8"><Pin cek label="Perlu Dicek" /></div>
              <div className="relative size-10"><Pin status="tepat" selected label="Terpilih" /></div>
              <div className="relative size-10"><Pin cluster={4} label="Kelompok" /></div>
            </div>
          </Block>
          <Block title="Tombol: bawaan, hover, nonaktif, memuat">
            <div className="space-y-3">
              {(['primary', 'secondary', 'ghost'] as const).map((k) => (
                <div key={k} className="flex flex-wrap gap-3">
                  <Button variant={k}>Bawaan</Button>
                  <Button variant={k} hover>Hover</Button>
                  <Button variant={k} disabled>Nonaktif</Button>
                  <Button variant={k} loading>Memuat</Button>
                </div>
              ))}
              <Button variant="secondary" icon={<Download size={16} />}>Dengan ikon</Button>
            </div>
          </Block>
          <Block title="Input, slider, segmented">
            <div className="space-y-4">
              <input aria-label="Contoh input" placeholder="Cari proyek atau jalan..." className="h-10 w-full rounded-lg border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25" />
              <input aria-label="Input galat" defaultValue="Jl. ???" aria-invalid className="h-10 w-full rounded-lg border border-bad px-3 text-sm focus:outline-none focus:ring-2 focus:ring-bad/25" />
              <Slider label="Contoh slider" value={s} min={0} max={14} onChange={setS} />
              <Segmented label="Contoh" value={v} onChange={setV} options={[{ value: 'a', label: 'Satu' }, { value: 'b', label: 'Dua' }, { value: 'c', label: 'Tiga' }]} />
            </div>
          </Block>
          <Block title="Progress & stat tile">
            <ProgressBar value={68} elapsed={62} status="tepat" />
            <div className="mt-4 grid max-w-sm grid-cols-2 gap-2"><StatTile value="37" label="kecelakaan / tahun" data={[22, 25, 24, 29, 31, 33, 36, 37]} /><StatTile value="212" label="titik lubang" data={[90, 120, 118, 150, 171, 190, 205, 212]} /></div>
          </Block>
          <Block title="Toast">
            <div className="space-y-3"><Toast msg="Laporan terkirim" /><Toast kind="error" msg="Gagal mengirim. Periksa koneksi." /></div>
          </Block>
          <Block title="Memuat (skeleton)"><div className="space-y-3"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-16 w-full" /><Skeleton className="h-3 w-2/3" /></div></Block>
          <Block title="Kosong & galat">
            <div className="space-y-4"><ReportFeed reports={[]} /><ErrorState title="Data proyek gagal dimuat" body="Sambungan terputus. Coba lagi sebentar." onRetry={() => {}} /></div>
          </Block>
        </div>
      </div>
    </div>
  )
}
