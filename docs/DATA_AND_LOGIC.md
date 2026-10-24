# Business Logic, Calculation Engine & Seed Dataset — PajakPeta

Dokumen ini memuat seluruh rumus matematika, konstanta tarif pajak, fungsi pengolah data di `backend/src/utils/taxCalculator.js`, serta spesifikasi 6 data proyek awal di `backend/src/data/mockProjects.js`.

---

## 1. Konstanta Tarif & Asumsi Dasar

Gunakan konstanta berikut di dalam `backend/src/utils/taxCalculator.js` agar hasil konversi konsisten di seluruh sistem:

- **Tarif Rata-rata Patungan Pajak Warga:**
  - `AVG_MOTOR_TAX = 250000` ($\text{Rp } 250.000$ / tahun untuk PKB/STNK 1 motor bebek/matik).
  - `AVG_HOUSE_PBB = 150000` ($\text{Rp } 150.000$ / tahun untuk PBB rumah tinggal sederhana).
  - `AVG_COFFEE_TAX = 3000` ($\text{Rp } 3.000$ pajak restoran $10\%$ dari 1 porsi kopi/makan seharga $\text{Rp } 30.000$).

- **Tarif Kalkulator "Dompet Warga":**
  - Frekuensi Ngopi/Kuliner: $\text{Jumlah per minggu} \times 52 \text{ minggu} \times \text{Rp } 3.000$
  - Pilihan Kendaraan (`vehicle_type`):
    - `none`: $\text{Rp } 0$
    - `motor_1`: $\text{Rp } 250.000$ (1 Motor)
    - `motor_2`: $\text{Rp } 500.000$ (2 Motor)
    - `mobil`: $\text{Rp } 1.800.000$ (1 Mobil Pribadi)
  - Pilihan Tempat Tinggal (`house_type`):
    - `kos`: $\text{Rp } 0$ (Kos / Kontrak)
    - `pribadi_sederhana`: $\text{Rp } 150.000$ (Rumah Tapak Sederhana)
    - `pribadi_menengah`: $\text{Rp } 450.000$ (Rumah Menengah / Ruko)

---

## 2. Rumus Matematika Pengolahan Data (`taxCalculator.js`)

Setiap objek proyek wajib diolah menggunakan rumus berikut:

1. **Nominal Kantong 1 (Dana Pajak Warga Lokal):**
   $$\text{local\_tax\_amount} = \text{round}\left(\text{total\_budget} \times \frac{\text{local\_tax\_percentage}}{100}\right)$$

2. **Nominal Kantong 2 (Dana Bantuan Pusat):**
   $$\text{central\_aid\_amount} = \text{total\_budget} - \text{local\_tax\_amount}$$

3. **Deviasi Progres Fisik:**
   $$\text{progress\_deviation} = \text{progress\_actual} - \text{progress\_planned}$$

4. **Penentuan Status Warna Pin Otomatis (Jika perlu kalkulasi dinamis):**
   - Jika $\text{progress\_deviation} \ge 0$, maka status = `'hijau'` (Tepat Waktu / Lebih Cepat).
   - Jika $-14 \le \text{progress\_deviation} \le -1$, maka status = `'kuning'` (Waspada / Mendekati Tenggat).
   - Jika $\text{progress\_deviation} \le -15$, maka status = `'merah'` (Terlambat / Rawan Mangkrak).

5. **Konversi "Patungan Warga" (`equivalents`):**
   - `motor_tax_count` $= \text{round}(\text{local\_tax\_amount} \div 250000)$
   - `house_pbb_count` $= \text{round}(\text{local\_tax\_amount} \div 150000)$
   - `coffee_cup_count` $= \text{round}(\text{local\_tax\_amount} \div 3000)$

6. **Beban Pajak per Warga Kecamatan & Biaya per Pengguna Harian:**
   - `cost_per_citizen` $= \text{round}(\text{local\_tax\_amount} \div \text{statistics.population\_in\_district})$
   - `cost_per_daily_user` $= \text{round}(\text{total\_budget} \div \text{statistics.daily\_users})$

7. **Skor Urgensi Wilayah ($0 - 100$):**
   $$\text{urgency\_score} = \text{round}\left((0.40 \times \text{damage\_score}) + (0.35 \times \text{incident\_score}) + (0.25 \times \text{density\_score})\right)$$

8. **Ringkasan Verifikasi Lapangan (`verification_summary`):**
   - `accurate_count`: Jumlah item di `project.reports` dengan `is_accurate === true`.
   - `inaccurate_count`: Jumlah item di `project.reports` dengan `is_accurate === false`.
   - `needs_audit`: Bernilai `true` apabila `inaccurate_count >= 2`.

---

## 3. Spesifikasi 6 Proyek Seed (`backend/src/data/mockProjects.js`)

Masukkan 6 data proyek realistis berikut (berlokasi di berbagai kecamatan di Kota Surabaya agar tampilan peta proporsional dan mudah dijelajahi):

### Proyek 1: Jalan Raya (Status Hijau — Lancar & Sesuai)
- **ID:** `1`
- **Judul:** `"Perbaikan Jalan & Lampu Penerangan Jl. Sudirman"`
- **Kecamatan:** `"Kecamatan Wonokromo"`
- **Kategori:** `"Infrastruktur Jalan"`
- **Koordinat:** `latitude: -7.2945`, `longitude: 112.7368`
- **Anggaran:** `total_budget: 200000000` ($\text{Rp } 200\text{ Juta}$), `local_tax_percentage: 75`, `central_aid_percentage: 25`
- **Progres:** `progress_actual: 80`, `progress_planned: 75`, `status: "hijau"`
- **Target Selesai:** `"2026-11-30"` | **Kontraktor:** `"PT Karya Marga Nusantara"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 420.000 / m2 aspal"`, `median_unit_cost_comparison: "Wajar (Setara median proyek jalan kota Rp 415.000 / m2)"`, `is_overpriced: false`
- **Statistik:** Populasi `50000`, Pengguna harian `5000`, Titik kerusakan `45`, Insiden `12`, Label insiden `"12 kasus kecelakaan motor malam hari selama tahun lalu akibat jalan berlubang dan lampu jalan padam"`, Skor: `damage_score: 88`, `incident_score: 82`, `density_score: 90`.
- **Laporan Warga Awal:** 2 laporan `is_accurate: true` (Warga mengonfirmasi pengaspalan sudah mulus dan tiang lampu mulai dipasang).

### Proyek 2: Drainase & Banjir (Status Merah & `needs_audit: true` — Terlambat & Dilaporkan Warga)
- **ID:** `2`
- **Judul:** `"Normalisasi Saluran Drainase & Box Culvert Jl. Mayjen Sungkono"`
- **Kecamatan:** `"Kecamatan Dukuh Pakis"`
- **Kategori:** `"Drainase & Banjir"`
- **Koordinat:** `latitude: -7.2892`, `longitude: 112.7145`
- **Anggaran:** `total_budget: 750000000` ($\text{Rp } 750\text{ Juta}$), `local_tax_percentage: 80`, `central_aid_percentage: 20`
- **Progres:** `progress_actual: 45`, `progress_planned: 75`, `status: "merah"`
- **Target Selesai:** `"2026-11-15"` | **Kontraktor:** `"CV Tirta Beton Perkasa"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 3.100.000 / meter beton"`, `median_unit_cost_comparison: "Di Atas Median (Rata-rata proyek drainase sejenis Rp 2.450.000 / meter)"`, `is_overpriced: true`
- **Statistik:** Populasi `60000`, Pengguna harian `8500`, Titik kerusakan `32`, Insiden `28`, Label insiden `"28 kali genangan banjir setinggi 50 cm saat musim hujan yang merendam pemukiman dan jalur utama"`, Skor: `damage_score: 92`, `incident_score: 90`, `density_score: 85`.
- **Laporan Warga Awal:** 2 laporan `is_accurate: false` (Warga melaporkan galian dibiarkan terbuka tanpa pekerja selama 2 minggu terakhir dan membuat macet parah) serta 1 laporan `is_accurate: true`. Karena `inaccurate_count === 2`, proyek ini langsung menampilkan badge **⚠️ Perlu Dicek Warga**.

### Proyek 3: Fasilitas Kesehatan (Status Hijau — Tepat Waktu)
- **ID:** `3`
- **Judul:** `"Renovasi Ruang IGD & Pengadaan Alat Medis Puskesmas Gubeng"`
- **Kecamatan:** `"Kecamatan Gubeng"`
- **Kategori:** `"Kesehatan"`
- **Koordinat:** `latitude: -7.2738`, `longitude: 112.7552`
- **Anggaran:** `total_budget: 500000000` ($\text{Rp } 500\text{ Juta}$), `local_tax_percentage: 70`, `central_aid_percentage: 30`
- **Progres:** `progress_actual: 90`, `progress_planned: 85`, `status: "hijau"`
- **Target Selesai:** `"2026-11-10"` | **Kontraktor:** `"PT Medika Bangun Sejahtera"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 3.800.000 / m2 bangunan medis"`, `median_unit_cost_comparison: "Wajar (Di bawah batas standar gedung layanan kesehatan Rp 4.000.000 / m2)"`, `is_overpriced: false`
- **Statistik:** Populasi `70000`, Pengguna harian `450`, Titik kerusakan `18`, Insiden `340`, Label insiden `"340 pasien darurat per bulan terpaksa dirujuk ke RS lain karena ruang tindakan IGD lama terlalu sempit"`, Skor: `damage_score: 78`, `incident_score: 88`, `density_score: 84`.
- **Laporan Warga Awal:** 1 laporan `is_accurate: true`.

### Proyek 4: Pendidikan (Status Kuning — Waspada / Sedikit Terlambat)
- **ID:** `4`
- **Judul:** `"Rehabilitasi Atap & Laboratorium Komputer SMPN 12 Rungkut"`
- **Kecamatan:** `"Kecamatan Rungkut"`
- **Kategori:** `"Pendidikan"`
- **Koordinat:** `latitude: -7.3195`, `longitude: 112.7764`
- **Anggaran:** `total_budget: 600000000` ($\text{Rp } 600\text{ Juta}$), `local_tax_percentage: 60`, `central_aid_percentage: 40`
- **Progres:** `progress_actual: 62`, `progress_planned: 70`, `status: "kuning"`
- **Target Selesai:** `"2026-12-05"` | **Kontraktor:** `"CV Cipta Edukasi Mandiri"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 2.950.000 / m2 ruang kelas"`, `median_unit_cost_comparison: "Wajar (Sesuai median rehabilitasi sekolah negeri Rp 2.900.000 / m2)"`, `is_overpriced: false`
- **Statistik:** Populasi `80000`, Pengguna harian `950`, Titik kerusakan `14`, Insiden `6`, Label insiden `"6 ruang kelas mengalami kebocoran atap parah yang membahayakan 950 siswa saat jam belajar"`, Skor: `damage_score: 85`, `incident_score: 75`, `density_score: 80`.
- **Laporan Warga Awal:** 1 laporan `is_accurate: true`, 1 laporan `is_accurate: false` (Wali murid mencatat pemasangan rangka baja ringan agak lambat).

### Proyek 5: Infrastruktur Jembatan (Status Kuning — Waspada)
- **ID:** `5`
- **Judul:** `"Perkuatan Struktur & Trotoar Ramah Difabel Jembatan Kalimas"`
- **Kecamatan:** `"Kecamatan Genteng"`
- **Kategori:** `"Infrastruktur Jalan"`
- **Koordinat:** `latitude: -7.2585`, `longitude: 112.7432`
- **Anggaran:** `total_budget: 1200000000` ($\text{Rp } 1,2\text{ Miliar}$), `local_tax_percentage: 65`, `central_aid_percentage: 35`
- **Progres:** `progress_actual: 58`, `progress_planned: 65`, `status: "kuning"`
- **Target Selesai:** `"2026-12-20"` | **Kontraktor:** `"PT Konstruksi Baja Utama"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 5.400.000 / meter bentang"`, `median_unit_cost_comparison: "Wajar (Setara median rehabilitasi jembatan kota Rp 5.350.000 / meter)"`, `is_overpriced: false`
- **Statistik:** Populasi `55000`, Pengguna harian `12000`, Titik kerusakan `22`, Insiden `9`, Label insiden `"9 insiden pejalan kaki terperosok karena trotoar jembatan retak dan belum memiliki guiding block disabilitas"`, Skor: `damage_score: 80`, `incident_score: 76`, `density_score: 95`.
- **Laporan Warga Awal:** 1 laporan `is_accurate: true`.

### Proyek 6: Drainase & Pompa Air (Status Hijau — Lancar)
- **ID:** `6`
- **Judul:** `"Pembangunan Rumah Pompa & Pintu Air Kawasan Sukolilo"`
- **Kecamatan:** `"Kecamatan Sukolilo"`
- **Kategori:** `"Drainase & Banjir"`
- **Koordinat:** `latitude: -7.2898`, `longitude: 112.7850`
- **Anggaran:** `total_budget: 600000000` ($\text{Rp } 600\text{ Juta}$), `local_tax_percentage: 75`, `central_aid_percentage: 25`
- **Progres:** `progress_actual: 92`, `progress_planned: 88`, `status: "hijau"`
- **Target Selesai:** `"2026-11-05"` | **Kontraktor:** `"PT Hydro Teknika Nusantara"`
- **Kewajaran Harga:** `unit_cost_label: "Rp 4.100.000 / unit kapasitas pompa"`, `median_unit_cost_comparison: "Wajar (Setara median pengadaan pompa banjir daerah)"`, `is_overpriced: false`
- **Statistik:** Populasi `65000`, Pengguna harian `6200`, Titik kerusakan `19`, Insiden `15`, Label insiden `"15 titik genangan tahunan di sekitar akses kampus dan pemukiman padat saat curah hujan ekstrem"`, Skor: `damage_score: 84`, `incident_score: 80`, `density_score: 82`.
- **Laporan Warga Awal:** 2 laporan `is_accurate: true`.