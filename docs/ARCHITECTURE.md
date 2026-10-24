# System Architecture & REST API Contract — PajakPeta

Dokumen ini adalah acuan teknis utama untuk struktur direktori, alur data antara `frontend` dan `backend`, serta spesifikasi kontrak REST API pada aplikasi **PajakPeta**.

---

## 1. Gambaran Arsitektur Sistem

Aplikasi **PajakPeta** menggunakan arsitektur *Client-Server* terpisah dalam satu *monorepo* (`pajak-peta/`):

1. **Backend (`backend/`):**
   - Dibangun menggunakan **Node.js** dan **Express.js** yang berjalan pada `PORT=5000`.
   - Menggunakan arsitektur *Zero-Config Stateful In-Memory Store* (`mockProjects.js`) yang siap dihubungkan ke **Neon Serverless PostgreSQL** kapan saja, namun dapat langsung dijalankan secara penuh (`npm run dev`) tanpa konfigurasi database eksternal saat demonstrasi lomba.
   - Bertugas menyimpan data proyek, menjalankan mesin kalkulasi pajak & skor urgensi secara otomatis (`taxCalculator.js`), memproses laporan verifikasi warga (*Cek Lapangan*), menghitung simulasi *Dompet Warga*, serta menghasilkan unduhan data terbuka berformat `.csv`.

2. **Frontend (`frontend/`):**
   - Dibangun menggunakan **React (Vite)** dan **Tailwind CSS** yang berjalan pada `PORT=5173`.
   - Merender peta interaktif satu layar (*Single-Screen Experience*) menggunakan **Leaflet** & **React-Leaflet**, ikon dari **Lucide-React**, dan berkomunikasi dengan backend melalui **Axios**.

---

## 2. Struktur Direktori Lengkap

Pastikan seluruh file dibuat mengikuti struktur direktori berikut:

    pajak-peta/
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── DATA_AND_LOGIC.md
    ├── DESIGN_SYSTEM.md
    ├── AGENT_TASKS.md
    │
    ├── backend/
    │   ├── src/
    │   │   ├── data/
    │   │   │   └── mockProjects.js        # Dataset awal 6 proyek realistis + laporan warga
    │   │   ├── utils/
    │   │   │   └── taxCalculator.js       # Mesin rumus konversi pajak, skor urgensi, & audit
    │   │   ├── controllers/
    │   │   │   ├── projectController.js   # Handler GET projects, detail, & export CSV
    │   │   │   ├── reportController.js    # Handler POST laporan Cek Lapangan warga
    │   │   │   └── calculatorController.js# Handler POST kalkulator Dompet Warga
    │   │   ├── routes/
    │   │   │   └── apiRoutes.js           # Definisi rute /api/*
    │   │   └── app.js                     # Konfigurasi Express, CORS, JSON parser, & Server
    │   ├── .env.example
    │   ├── .gitignore
    │   └── package.json
    │
    └── frontend/
        ├── src/
        │   ├── components/
        │   │   ├── Common/
        │   │   │   ├── Navbar.jsx             # Top bar: Logo, Pencarian, Filter, Tombol Aksi
        │   │   │   └── SummaryBar.jsx         # Floating card ringkasan metrik daerah
        │   │   ├── Map/
        │   │   │   └── ProjectMap.jsx         # Peta Leaflet fullscreen & custom HTML pin
        │   │   ├── Panel/
        │   │   │   ├── ProjectDetailPanel.jsx # Side drawer 3 tab (Realisasi, Anggaran, Statistik)
        │   │   │   └── FieldCheckSection.jsx  # Komponen vote Sesuai/Tidak Sesuai + form warga
        │   │   └── Calculator/
        │   │       └── DompetWargaModal.jsx   # Modal slider kalkulator pajak tahunan warga
        │   ├── services/
        │   │   └── api.js                     # Konfigurasi Axios & fungsi pemanggil endpoint
        │   ├── utils/
        │   │   └── formatters.js              # Fungsi formatRupiah, formatNumber, & tanggal
        │   ├── App.jsx                        # State utama & pengatur tata letak satu layar
        │   ├── main.jsx                       # Entry point React & import CSS Leaflet
        │   └── index.css                      # Konfigurasi Tailwind CSS & custom scrollbar
        ├── index.html
        ├── tailwind.config.js
        ├── postcss.config.js
        └── package.json

---

## 3. Spesifikasi Kontrak REST API

Seluruh endpoint backend menggunakan awalan URL: `http://localhost:5000/api`

### 3.1. Ambil Daftar Proyek & Ringkasan Daerah
- **Method & Endpoint:** `GET /api/projects`
- **Query Parameters (Opsional):**
  - `category`: Filter berdasarkan kategori (contoh: `Infrastruktur Jalan`, `Kesehatan`, `Pendidikan`, `Drainase & Banjir`, atau `all`).
  - `status`: Filter berdasarkan warna status pin (`hijau`, `kuning`, `merah`, atau `all`).
  - `search`: Pencarian teks bebas berdasarkan judul proyek atau nama kecamatan (tidak peka huruf besar/kecil).
- **Perilaku Backend:**
  1. Memfilter daftar proyek sesuai parameter query.
  2. Menjalankan fungsi `enrichProjectWithCalculations(project)` dari `taxCalculator.js` untuk setiap proyek.
  3. Menghitung metrik agregat `summary` dari daftar proyek yang terfilter.
- **Format Response (`200 OK`):**

    {
      "success": true,
      "summary": {
        "total_projects": 6,
        "total_budget_all": 3850000000,
        "total_local_tax_all": 2745000000,
        "average_progress": 71,
        "projects_needing_audit": 1
      },
      "data": [
        {
          "id": 1,
          "title": "Perbaikan Jalan & Lampu Penerangan Jl. Sudirman",
          "district": "Kecamatan Wonokromo",
          "category": "Infrastruktur Jalan",
          "total_budget": 200000000,
          "local_tax_percentage": 75,
          "central_aid_percentage": 25,
          "progress_actual": 80,
          "progress_planned": 75,
          "status": "hijau",
          "target_completion": "2026-11-30",
          "contractor_name": "PT Karya Marga Nusantara",
          "latitude": -7.2945,
          "longitude": 112.7368,
          "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
          "unit_cost_label": "Rp 420.000 / m2 aspal",
          "median_unit_cost_comparison": "Wajar (Setara median proyek sejenis Rp 415.000 / m2)",
          "is_overpriced": false,
          "statistics": {
            "population_in_district": 50000,
            "daily_users": 5000,
            "damage_points": 45,
            "incident_count": 12,
            "incident_label": "12 kasus kecelakaan malam hari pada tahun lalu akibat jalan berlubang & lampu mati",
            "damage_score": 88,
            "incident_score": 82,
            "density_score": 90
          },
          "reports": [],
          "calculated": {
            "local_tax_amount": 150000000,
            "central_aid_amount": 50000000,
            "progress_deviation": 5,
            "urgency_score": 86,
            "cost_per_citizen": 3000,
            "cost_per_daily_user": 40000,
            "equivalents": {
              "motor_tax_count": 600,
              "house_pbb_count": 1000,
              "coffee_cup_count": 50000
            },
            "verification_summary": {
              "accurate_count": 2,
              "inaccurate_count": 0,
              "needs_audit": false
            }
          }
        }
      ]
    }

---

### 3.2. Ambil Detail Satu Proyek
- **Method & Endpoint:** `GET /api/projects/:id`
- **Format Response (`200 OK`):**

    {
      "success": true,
      "data": { /* Objek proyek lengkap beserta properti calculated dan array reports terbaru */ }
    }

- **Format Response (`404 Not Found`):**

    {
      "success": false,
      "message": "Proyek tidak ditemukan"
    }

---

### 3.3. Kirim Laporan Verifikasi Warga ("Cek Lapangan")
- **Method & Endpoint:** `POST /api/projects/:id/reports`
- **Request Body:**

    {
      "reporter_name": "Siti Aminah",
      "is_accurate": false,
      "user_note": "Tertulis progres 80% tapi di lokasi baru separuh jalan yang diaspal dan tidak ada pekerja.",
      "evidence_photo_url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80"
    }

- **Validasi & Perilaku Backend:**
  1. Jika `reporter_name` kosong, gunakan nilai default `"Warga Anonim"`.
  2. `user_note` wajib diisi dan `is_accurate` wajib berupa boolean (`true` atau `false`).
  3. Tambahkan laporan baru ke bagian awal array `reports` milik proyek terkait (`unshift`).
  4. Hitung ulang objek `calculated` proyek tersebut (apabila jumlah `is_accurate === false` mencapai $\ge 2$, maka `calculated.verification_summary.needs_audit` otomatis bernilai `true`).
- **Format Response (`201 Created`):**

    {
      "success": true,
      "message": "Laporan verifikasi lapangan berhasil ditambahkan",
      "data": { /* Objek proyek terbaru yang sudah diperbarui kalkulasinya */ }
    }

---

### 3.4. Simulasi Kalkulator "Dompet Warga"
- **Method & Endpoint:** `POST /api/calculator/personal-tax`
- **Request Body:**

    {
      "coffee_per_week": 4,
      "vehicle_type": "motor_1",
      "house_type": "pribadi_sederhana",
      "selected_project_id": 1
    }

- **Format Response (`200 OK`):**

    {
      "success": true,
      "data": {
        "breakdown": {
          "coffee_tax_annual": 624000,
          "vehicle_tax_annual": 250000,
          "house_tax_annual": 150000
        },
        "total_annual_tax": 1024000,
        "project_comparison": {
          "project_id": 1,
          "project_title": "Perbaikan Jalan & Lampu Penerangan Jl. Sudirman",
          "project_local_tax_amount": 150000000,
          "contribution_percentage": 0.6827,
          " citizens_needed_like_you": 147,
          "shareable_text": "Kontribusi pajak daerahku sekitar Rp 1.024.000/tahun! Bersama 146 warga lain dengan kebiasaan serupa, patungan pajak kita setara dengan seluruh dana pajak lokal di proyek Perbaikan Jalan & Lampu Penerangan Jl. Sudirman."
        },
        "disclaimer": "Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu karena pajak daerah dikelola melalui Kas Umum Daerah."
      }
    }

---

### 3.5. Unduh Dataset Open Government Data (CSV)
- **Method & Endpoint:** `GET /api/export/csv`
- **Headers Response:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="pajakpeta_open_government_data.csv"`
- **Kolom CSV yang Wajib Disertakan:**
  `ID,Nama Proyek,Kecamatan,Kategori,Total Anggaran (Rp),Persentase Pajak Lokal (%),Nominal Pajak Lokal (Rp),Persentase Bantuan Pusat (%),Progres Aktual (%),Progres Rencana (%),Status,Target Selesai,Kontraktor,Skor Urgensi,Setara STNK Motor,Setara PBB Rumah,Setara Gelas Kopi,Jumlah Verifikasi Sesuai,Jumlah Verifikasi Tidak Sesuai,Status Audit Warga`