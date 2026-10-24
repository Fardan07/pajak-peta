# AI Coding Agent — Step-by-Step Implementation Plan & Guardrails

Kamu adalah AI Coding Agent yang bertugas membangun aplikasi **PajakPeta** secara utuh berdasarkan spesifikasi di `PRD.md`, `ARCHITECTURE.md`, `DATA_AND_LOGIC.md`, dan `DESIGN_SYSTEM.md`.

Ikuti aturan dan urutan langkah pengerjaan di bawah ini dengan disiplin tinggi agar aplikasi berjalan $100\%$ bebas _error_.

---

## 1. Aturan Ketat (Guardrails)

1. **Zero-Config Execution:** Jangan membuat aplikasi gagal berjalan jika variabel `.env` atau koneksi database eksternal kosong. Gunakan penyimpanan _in-memory_ berbasis `backend/src/data/mockProjects.js` sebagai sumber data aktif sehingga perintah `npm run dev` di folder `backend` dan `frontend` langsung menyajikan seluruh fitur secara interaktif.
2. **Kesesuaian Port & CORS:**
   - Backend wajib berjalan di `http://localhost:5000` dengan `cors()` diaktifkan.
   - Frontend wajib memanggil `http://localhost:5000/api` melalui `frontend/src/services/api.js`.
3. **Pencegahan Error Leaflet di React:**
   - Wajib mengimpor `'leaflet/dist/leaflet.css'` di dalam `frontend/src/main.jsx`.
   - Pastikan container peta (`MapContainer`) memiliki kelas tinggi eksplisit (`h-full w-full`).
   - Gunakan `L.divIcon` berbasis string HTML untuk semua pin proyek di peta; jangan gunakan gambar marker bawaan Leaflet.
4. **Bahasa & Format Angka:**
   - Seluruh teks UI wajib menggunakan Bahasa Indonesia yang komunikatif bagi masyarakat awam.
   - Semua nilai uang wajib diformat menggunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.

---

## 2. Urutan Eksekusi (Step-by-Step Checklist)

### Tahap 1: Implementasi Backend (`backend/`)

1. **Periksa `backend/package.json`:**
   - Pastikan dependensi `express`, `cors`, dan `dotenv` sudah terpasang, serta terdapat script `"dev": "nodemon src/app.js"` dan `"start": "node src/app.js"`.
2. **Buat `backend/src/utils/taxCalculator.js`:**
   - Implementasikan fungsi `enrichProjectWithCalculations(project)` sesuai rumus di `DATA_AND_LOGIC.md` (menghitung `local_tax_amount`, `central_aid_amount`, `progress_deviation`, `urgency_score`, `cost_per_citizen`, `cost_per_daily_user`, `equivalents`, dan `verification_summary`).
   - Implementasikan fungsi `calculatePersonalTax({ coffee_per_week, vehicle_type, house_type }, selectedProject)` untuk fitur _Dompet Warga_.
3. **Buat `backend/src/data/mockProjects.js`:**
   - Masukkan keenam proyek realistis beserta data statistik dan laporan warga awal persis seperti spesifikasi di `DATA_AND_LOGIC.md`.
4. **Buat Controllers di `backend/src/controllers/`:**
   - `projectController.js`: Handler untuk `getAllProjects` (lengkap dengan filter `category`, `status`, `search`, dan kalkulasi `summary`), `getProjectById`, dan `exportProjectsCsv`.
   - `reportController.js`: Handler untuk `addProjectReport` yang memvalidasi input, menyimpan laporan warga baru ke proyek terkait, dan mengembalikan proyek yang sudah dihitung ulang status `needs_audit`-nya.
   - `calculatorController.js`: Handler untuk `calculateUserTax` pada fitur _Dompet Warga_.
5. **Buat Rute & Server Utama (`backend/src/routes/apiRoutes.js` & `backend/src/app.js`):**
   - Hubungkan seluruh endpoint ke `/api` dan tambahkan endpoint kesehatan `GET /` yang mengembalikan `{ status: "PajakPeta API Active" }`.

---

### Tahap 2: Implementasi Frontend (`frontend/`)

1. **Periksa Konfigurasi Tailwind & CSS (`frontend/src/index.css` & `frontend/src/main.jsx`):**
   - Pastikan Tailwind CSS aktif dan `import 'leaflet/dist/leaflet.css';` sudah ditambahkan di `main.jsx`.
2. **Buat Helper & API Service:**
   - Buat `frontend/src/utils/formatters.js` untuk fungsi `formatRupiah(number)`, `formatCompactRupiah(number)`, dan `formatNumber(number)`.
   - Buat `frontend/src/services/api.js` yang mengekspor fungsi `fetchProjects(params)`, `fetchProjectById(id)`, `submitFieldReport(projectId, payload)`, `calculatePersonalTax(payload)`, dan konstanta `CSV_EXPORT_URL = 'http://localhost:5000/api/export/csv'`.
3. **Buat Komponen Navigasi & Ringkasan (`frontend/src/components/Common/`):**
   - `Navbar.jsx`: Menampilkan identitas **PajakPeta**, input pencarian, _dropdown_ atau _pill_ filter kategori & status warna pin, tombol pembuka modal **Dompet Warga**, dan tombol **Unduh CSV**.
   - `SummaryBar.jsx`: Kartu melayang di kiri bawah peta yang menampilkan 4 metrik ringkasan daerah serta legenda singkat warna pin (Hijau = Tepat Waktu, Kuning = Waspada, Merah = Terlambat, `⚠️` = Perlu Audit Warga).
4. **Buat Komponen Peta Interaktif (`frontend/src/components/Map/ProjectMap.jsx`):**
   - Render `MapContainer`, `TileLayer`, dan daftar `Marker` menggunakan `L.divIcon` kustom berwarna Hijau/Kuning/Merah yang menampilkan persentase progres aktual dan penanda `⚠️` jika `needs_audit === true`.
   - Ketika pin diklik, panggil fungsi `onSelectProject(project)` untuk membuka panel detail di sisi kanan.
5. **Buat Komponen Panel Detail 3 Pilar & Verifikasi Warga (`frontend/src/components/Panel/`):**
   - `ProjectDetailPanel.jsx`: Implementasikan _Side Drawer_ dengan 3 tab (_Realisasi Fisik_, _Uang & Patungan Pajak_, _Statistik & Urgensi_) sesuai `DESIGN_SYSTEM.md`.
   - `FieldCheckSection.jsx`: Implementasikan bagian verifikasi _Cek Lapangan_ di mana pengguna dapat memilih _Sesuai_ / _Tidak Sesuai_, mengisi catatan, menggunakan tombol _isi contoh foto cepat_, dan mengirimkannya ke backend secara _real-time_.
6. **Buat Modal Kalkulator Pajak Pribadi (`frontend/src/components/Calculator/DompetWargaModal.jsx`):**
   - Buat 3 kontrol interaktif (slider ngopi per minggu, pemilih jenis kendaraan, pemilih status rumah) serta pemilih proyek pembanding.
   - Tampilkan rincian pajak tahunan, persentase kontribusi terhadap proyek, dan pratinjau **"Kartu Dampak Warga"** lengkap dengan tombol _"Salin Teks Dampak"_ (_copy to clipboard_).
7. **Rakit Seluruh Komponen di `frontend/src/App.jsx`:**
   - Kelola state daftar proyek, proyek yang sedang dipilih, filter aktif, status buka/tutup modal _Dompet Warga_, serta fungsi _refresh_ otomatis setelah warga mengirim laporan _Cek Lapangan_.

---

## 3. Checklist Verifikasi Akhir (Wajib Diuji oleh Agent)

Sebelum menyatakan tugas selesai, pastikan:

- [ ] Server backend berjalan di port `5000` dan endpoint `GET http://localhost:5000/api/projects` mengembalikan 6 proyek lengkap dengan objek `calculated`.
- [ ] Frontend berjalan tanpa _error_ di konsol browser dan menampilkan peta dengan 6 pin berwarna (Hijau, Kuning, Merah).
- [ ] Mengklik pin membuka `ProjectDetailPanel` dengan 3 tab yang semuanya berfungsi penuh.
- [ ] Mengganti profil konversi pajak (_Pengendara Motor_, _Pemilik Rumah_, _Anak Kuliner_) langsung mengubah angka patungan warga.
- [ ] Mengirim laporan "Tidak Sesuai" pada proyek di `FieldCheckSection` langsung menambah jumlah laporan dan memicu badge `⚠️ Perlu Dicek` jika jumlah laporan tidak sesuai mencapai $\ge 2$.
- [ ] Modal **Dompet Warga** dapat menghitung pajak tahunan secara dinamis saat slider digeser.
- [ ] Tombol **Unduh CSV** berhasil mengunduh file `pajakpeta_open_government_data.csv`.
