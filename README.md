# 🗺️ PajakPeta — Telusuri Pajakmu, Pantau Wujudnya

**PajakPeta** adalah platform *civic-tech* berbasis peta interaktif (*Open Government Data*) yang mengintegrasikan data anggaran daerah (APBD/APBN), realisasi fisik proyek, dan statistik wilayah Kabupaten Sidoarjo ke dalam bahasa sehari-hari melalui konsep analogi *"Patungan Pajak Warga"*. Aplikasi ini mengubah transparansi anggaran dari sekadar papan informasi satu arah menjadi ekosistem pengawasan publik dua arah, di mana masyarakat dapat memantau progres pembangunan, menghitung kontribusi pajak pribadinya, hingga memverifikasi kondisi proyek secara langsung di lapangan.

---

## 🛠️ Tech Stack yang Digunakan

Proyek ini dibangun menggunakan arsitektur *monorepo* (*Client-Server*) dengan rincian teknologi berikut:

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React (Ikonografi), Google Fonts (*Poppins*).
- **Peta & Spasial (GIS):** Leaflet.js 1.9, Esri World Tiles, Google Maps JavaScript API (*Dual-Engine Fallback*), serta GeoJSON Batas Administratif 18 Kecamatan Kabupaten Sidoarjo.
- **Backend:** Node.js, Express.js 5, CORS, Dotenv.
- **Database & Penyimpanan:** Neon Serverless PostgreSQL (`pg` dengan koneksi SSL) + *Zero-Config In-Memory Fallback* (`mockProjects.js` agar aplikasi tetap berjalan $100\%$ meskipun tanpa koneksi database eksternal).
- **Development & Testing Tools:** `concurrently` (menjalankan *frontend* dan *backend* paralel), Node `assert` (`test-backend.js`).

---

## 🚀 Cara Menjalankan Project (Clone $\rightarrow$ Install $\rightarrow$ Run)

Ikuti langkah-langkah berikut untuk menjalankan keseluruhan sistem di komputer lokal:

### 1. Clone Repository
```bash
git clone https://github.com/Fardan07/pajak-peta.git
cd pajak-peta
```

### 2. Install Dependencies
Instal seluruh paket di level *root*, *backend*, dan *frontend*:
```bash
# Install runner di root folder
npm install

# Install dependencies Backend
cd backend && npm install

# Install dependencies Frontend
cd ../frontend && npm install
cd ..
```

### 3. Konfigurasi Environment (Opsional — Zero-Config Ready)
Aplikasi ini dilengkapi fitur **Zero-Config In-Memory Fallback**, sehingga dapat langsung dijalankan tanpa konfigurasi `.env`. Jika ingin menghubungkan ke database cloud **Neon PostgreSQL**, buat file `backend/.env` berdasarkan `backend/.env.example`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
```
*(Untuk melakukan seeding 24 data proyek awal ke database Neon, jalankan `cd backend && node src/config/initDb.js`).*

### 4. Jalankan Project (Run)
Gunakan satu perintah di bawah ini dari folder utama (*root*) untuk menyalakan *backend* dan *frontend* secara bersamaan:
```bash
npm run dev
```
Atau jalankan secara terpisah di dua terminal:
```bash
# Terminal 1 — Menjalankan Server Backend (Port 5000)
npm run dev:backend

# Terminal 2 — Menjalankan Aplikasi Frontend (Port 5173)
npm run dev:frontend
```

- **Akses Website (Frontend):** `http://localhost:5173`
- **Akses REST API (Backend):** `http://localhost:5000`

---

## 📈 Progress Saat Ini (First Draft Submission — Status: $\sim 95\%$ Selesai)

Saat ini seluruh modul utama (*Frontend*, *Backend REST API*, dan *Database Integration*) telah selesai diimplementasikan dan lulus uji fungsional:

### ✅ 1. Halaman Beranda / Landing Page (`Beranda.tsx`)
- Menampilkan *Hero Section* interaktif beserta 4 kartu metrik agregat daerah otomatis (Total Proyek Aktif, Akumulasi Nilai Kontrak, Rata-rata Progres Fisik, dan Total Laporan Warga).
- Menampilkan **Sorotan Proyek Prioritas (*Spotlight*)** untuk proyek yang terlambat atau berstatus *Perlu Dicek*, serta penjelasan 3 Pilar Transparansi PajakPeta.

### ✅ 2. Halaman Peta Interaktif Satu Layar (`MapPage.tsx`, `LeafletLayer.tsx`, `GoogleMapLayer.tsx`)
- Visualisasi 24 titik proyek pembangunan di Kabupaten Sidoarjo lengkap dengan batas wilayah administratif 18 kecamatan (*GeoJSON Boundaries*).
- *Custom Pin Marker* dinamis dengan indikator warna status (**Hijau**: Tepat Waktu, **Kuning**: Waspada, **Merah**: Terlambat) dan lencana peringatan berdenyut (`⚠️ Perlu Dicek`) jika terdapat laporan ketidaksesuaian dari warga.
- Fitur pencarian instan, filter status proyek, *marker clustering*, dan *mobile bottom-sheet* yang responsif.

### ✅ 3. Panel Detail Proyek 3 Pilar + Fitur Inovasi (`ProjectDetail.tsx`)
- **Pilar A (Realisasi Fisik):** *Dual progress bar* yang membandingkan persentase fisik di lapangan terhadap persentase waktu berjalan beserta indikator deviasi jadwal.
- **Pilar B (Transparansi Anggaran & Patungan Warga):** Visualisasi proporsi dana **APBD (Pajak Lokal)** vs **APBN (Pusat)** dan konversi interaktif ke 3 profil warga (setara jumlah STNK Motor, PBB Rumah, atau pajak kopi/restoran).
- **Jejak Aliran Dana & Kewajaran Harga Satuan:** Diagram alur anggaran dari hulu ke hilir serta perhitungan biaya per kilometer ($\text{Rp/km}$) dibandingkan dengan median proyek sejenis.
- **Pilar C (Statistik Daerah & Skor Urgensi):** Menampilkan data alasan pembangunan (angka kecelakaan, titik lubang jalan, kepadatan kendaraan) lengkap dengan grafik tren mikro (*sparkline*) dan **Skor Urgensi ($0 - 100$)**.
- **Pilar D (Pantauan Warga Sekitar):** Menampilkan rasio suara warga (*Sesuai* vs *Tidak Sesuai*) beserta daftar laporan foto lapangan.

### ✅ 4. Halaman Kalkulator "Dompet Warga" & Generator "Kartu Dampak" (`Dompet.tsx`, `Kartu.tsx`)
- Simulasi kontribusi pajak daerah tahunan tanpa *login* menggunakan *slider* kebiasaan ngopi mingguan, jenis kendaraan, dan tipe hunian.
- Dilengkapi visualisasi *100-Dot Matrix* dan generator **Kartu Dampak Warga** siap unduh (rasio $1:1$ dan $4:5$, tema Terang/Gelap, lengkap dengan *QR Code*).

### ✅ 5. Fitur Bandingkan Proyek Head-to-Head (`Bandingkan.tsx`)
- Komparasi berdampingan (*side-by-side*) antara dua proyek untuk membandingkan Skor Urgensi, efisiensi biaya per kilometer, progres fisik, serta sentimen laporan warga.

### ✅ 6. Halaman Portal Data Terbuka (`DataTerbuka.tsx`)
- Menyediakan pratinjau tabel 24 proyek Kabupaten Sidoarjo, pencarian & filter kecamatan, dokumentasi **Kamus Data (*Data Dictionary*)**, serta tombol unduh dataset terbuka dalam format `.csv` dan `.json` (Lisensi CC BY 4.0).

### ✅ 7. Modal Verifikasi "Cek Lapangan" & Backend API (`CekLapangan.tsx` & `backend/`)
- Form partisipasi warga untuk mengirim laporan **Sesuai** / **Tidak Sesuai** beserta unggahan foto bukti dan catatan lapangan.
- Terhubung ke endpoint `GET /api/projects`, `GET /api/projects/:id`, dan `POST /api/projects/:id/reports` dengan dukungan penyimpanan permanen di **Neon PostgreSQL** serta pengujian otomatis di `backend/test-backend.js`.
