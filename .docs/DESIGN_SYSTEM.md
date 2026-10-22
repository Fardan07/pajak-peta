# UI/UX Component & Visual Design Specification — PajakPeta

Dokumen ini mengatur tata letak antarmuka pengguna, spesifikasi setiap komponen React, aturan warna status, serta pencegahan *bug* visual pada `frontend`.

---

## 1. Prinsip Tata Letak: *Single-Screen Map Experience*

Aplikasi dirancang sebagai *dashboard* geospasial interaktif satu layar penuh (`h-screen w-screen overflow-hidden relative bg-slate-900`) tanpa perpindahan halaman yang membingungkan pengguna:

1. **Lapisan Peta Utama (`z-0`):**
   - Merender komponen `ProjectMap.jsx` memenuhi $100\%$ tinggi dan lebar layar.
   - Menggunakan titik tengah awal (*center coordinate*) Kota Surabaya: `[-7.2850, 112.7480]` dengan level `zoom={13}`.

2. **Bilah Navigasi & Filter Melayang (`z-[1000]`, Top Floating Bar):**
   - Berada di bagian atas layar (`Navbar.jsx`) dengan efek kaca semi-transparan (`bg-slate-900/95 backdrop-blur-md text-white shadow-xl border-b border-slate-700/80`).
   - Memuat identitas brand **PajakPeta** (*"Telusuri Pajakmu, Pantau Wujudnya"*), kolom pencarian cepat, filter kategori, filter warna status pin, tombol **"Dompet Warga"**, dan tombol **"Unduh Data CSV"**.

3. **Kartu Ringkasan Daerah (`z-[1000]`, Bottom-Left Floating Card):**
   - Berada di pojok kiri bawah (`SummaryBar.jsx`), menampilkan 4 metrik agregat secara *real-time*:
     - **Total Proyek Dipantau**
     - **Total Dana Pajak Warga Lokal**
     - **Rata-rata Realisasi Fisik**
     - **Proyek Perlu Dicek Warga** (ditandai warna merah jika $> 0$)

4. **Panel Samping 3 Pilar (`z-[1050]`, Right Side Drawer):**
   - Muncul dari sisi kanan layar (`ProjectDetailPanel.jsx`) ketika salah satu pin proyek di peta diklik.
   - Memiliki lebar `w-full sm:w-[460px] md:w-[500px]` dengan tinggi penuh dan *scroll* vertikal yang halus.

5. **Modal Kalkulator "Dompet Warga" (`z-[1100]`, Centered Modal Overlay):**
   - Muncul di tengah layar (`DompetWargaModal.jsx`) dengan *backdrop blur* gelap ketika pengguna menekan tombol **"Dompet Warga"** di Navbar atau dari dalam Panel Detail Proyek.

---

## 2. Panduan Teknis Custom Pin Marker Leaflet (`ProjectMap.jsx`)

Untuk menghindari *bug* gambar ikon Leaflet yang pecah di Vite, **wajib menggunakan `L.divIcon`** berbasis HTML dan kelas Tailwind:

- **Desain Pin:**
  - Bentuk kapsul atau lingkaran tegas yang menampilkan angka **Persentase Progres Aktual** (misal: `80%`) di bagian tengah.
  - Skema warna berdasarkan `project.status`:
    - `hijau`: Latar `bg-emerald-600`, pinggiran `ring-4 ring-emerald-200`, teks putih.
    - `kuning`: Latar `bg-amber-500`, pinggiran `ring-4 ring-amber-200`, teks putih.
    - `merah`: Latar `bg-rose-600`, pinggiran `ring-4 ring-rose-200`, teks putih.
  - **Indikator Audit Warga:** Apabila `project.calculated.verification_summary.needs_audit === true`, tampilkan lencana bulat kecil di pojok kanan atas pin dengan simbol `⚠️` dan animasi berdenyut (`animate-bounce` atau `animate-ping`).

---

## 3. Rincian Isi Komponen `ProjectDetailPanel.jsx` (3 Tab Utama + Cek Lapangan)

Bagian atas panel selalu menampilkan:
- Foto kondisi proyek (`image_url`), lencana Kategori, Kecamatan, serta lencana Status Warna (`Tepat Waktu`, `Waspada`, atau `Terlambat / Rawan Mangkrak`).
- Jika `needs_audit === true`, tampilkan kotak peringatan merah mencolok di atas tab:
  > **"⚠️ PERLU DICEK: Terdapat laporan warga di lapangan yang menyatakan kondisi fisik berbeda dengan klaim progres di sistem."**

Di bawah header proyek, sediakan **3 Tab Navigasi** yang rapi:

### Tab 1: Realisasi Fisik ("Proyek Ini Beneran Dikerjakan?")
- **Progress Bar Ganda:**
  - Bar 1: **Progres Aktual di Lapangan** (`progress_actual%`) dengan warna sesuai status.
  - Bar 2: **Target Rencana Saat Ini** (`progress_planned%`) dengan warna abu-abu kebiruan.
  - Teks Selisih Deviasi: Menampilkan apakah proyek lebih cepat $+5\%$ atau terlambat $-30\%$ dari jadwal.
- **Informasi Pelaksana:** Nama Kontraktor Pelaksana (`contractor_name`) dan Tanggal Target Selesai (`target_completion`).

### Tab 2: Uang & Pajak ("Apakah Pakai Uang Pajakku?")
- **Analogi Kas RT/RW Banner:** Kotak edukasi singkat yang menjelaskan bahwa anggaran proyek berasal dari dua kantong utama.
- **Visualisasi Bar 2 Kantong Dana:**
  - **Kantong 1 — Uang Pajak Warga Lokal (`local_tax_percentage%`):** Warna Oranye/Amber (`bg-amber-500`), menampilkan nominal Rupiah (`local_tax_amount`).
  - **Kantong 2 — Dana Bantuan Pusat (`central_aid_percentage%`):** Warna Biru (`bg-sky-500`), menampilkan nominal Rupiah (`central_aid_amount`).
- **Fitur Unggulan "Terjemahan Patungan Warga":**
  - Sediakan 3 tombol pemilih profil interaktif:
    1. 🛵 **Pengendara Motor** $\rightarrow$ Menampilkan: *"Uang pajak di proyek ini setara dengan patungan pajak STNK motor dari **X warga** di kecamatan ini!"*
    2. 🏠 **Pemilik Rumah** $\rightarrow$ Menampilkan: *"Setara dengan patungan Pajak Bumi & Bangunan (PBB) tahunan dari **Y rumah warga**!"*
    3. ☕ **Anak Nongkrong / Kuliner** $\rightarrow$ Menampilkan: *"Setara dengan pajak restoran ($10\%$) dari **Z gelas es kopi susu** seharga Rp 30.000!"*
  - Tampilkan kotak rumus transparan di bawahnya agar warga tahu asal-usul pembagian angkanya, disertai *disclaimer*: *"Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu."*
- **Metrik Efisiensi & Kewajaran Harga Satuan:**
  - Beban rata-rata per penduduk kecamatan (`cost_per_citizen`) & biaya per pengguna harian (`cost_per_daily_user`).
  - Kotak **Cek Kewajaran Harga Satuan**: Menampilkan `unit_cost_label` dan `median_unit_cost_comparison` dengan warna hijau jika wajar (`is_overpriced === false`) atau kuning/merah jika di atas median (`is_overpriced === true`).

### Tab 3: Statistik Daerah ("Kenapa Proyek Ini Dibuat Duluan?")
- **Lingkaran / Kartu Skor Urgensi ($0 - 100$):** Menampilkan angka `urgency_score` beserta rincian 3 komponen pembentuknya:
  - Skor Tingkat Kerusakan (`damage_score` — bobot $40\%$)
  - Skor Riwayat Insiden/Kecelakaan (`incident_score` — bobot $35\%$)
  - Skor Kepadatan Pengguna (`density_score` — bobot $25\%$)
- **Data Fakta Lapangan:** Menampilkan `damage_points` (titik kerusakan), `daily_users` (pengguna harian), `population_in_district` (jumlah warga kecamatan), dan narasi lengkap `incident_label`.

### Bagian Bawah Panel: Komponen `FieldCheckSection.jsx` ("Cek Lapangan — Warga Ikut Jadi Mandor")
- Menampilkan jumlah suara saat ini: 👍 **X Warga menyatakan Sesuai** vs 👎 **Y Warga menyatakan Tidak Sesuai**.
- Tombol/Form tambah laporan baru:
  - Pilihan tombol: **👍 Kondisi Sesuai Klaim** atau **👎 Tidak Sesuai / Mangkrak**.
  - Input Nama (opsional), Catatan Kondisi Lapangan (wajib), dan URL Foto Bukti (opsional, sediakan tombol *"Gunakan Contoh Foto Lapangan"* agar juri bisa menguji unggah foto dalam 1 klik saat demo).
  - Daftar riwayat laporan warga lengkap dengan waktu dan foto buktinya.