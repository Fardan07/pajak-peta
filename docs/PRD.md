# Product Requirements Document (PRD) — PajakPeta

**Nama Produk:** PajakPeta *(Tagline: "Telusuri Pajakmu, Pantau Wujudnya")*  
**Konteks Kompetisi:** WIA MIA 2026  
**Tema Utama:** *Designing Digital Futures – Powering Public Transparency*  
**Subtema:** *Open Government Data*  

---

## 1. Problem Statement

Saat ini, portal keterbukaan data pemerintah daerah di Indonesia masih menghadapi lima kendala utama yang menghambat transparansi publik:

1. **Penyajian Terlalu Birokratis & Sulit Dipahami Awam:** Data anggaran (APBD), realisasi proyek, dan statistik daerah umumnya dipublikasikan dalam bentuk dokumen PDF ratusan halaman atau tabel akuntansi negara dengan istilah teknis (seperti *Belanja Modal*, *DAK Fisik*, *Pagu*). Masyarakat awam kesulitan memahami arti angka ratusan juta hingga miliaran rupiah tersebut.
2. **Keterputusan Emosional Warga dengan Uang Pajak:** Warga rutin membayar pajak daerah (Pajak Kendaraan/STNK, PBB Rumah, Pajak Restoran $10\%$), namun tidak pernah melihat hubungan nyata antara uang yang mereka bayar dengan proyek fisik di lingkungan sekitar mereka.
3. **Data Terpecah di Berbagai Instansi (Siloed Data):** Data anggaran berada di Bappeda/Dinas Keuangan, data realisasi proyek fisik berada di Dinas PU/LPSE, dan data kondisi masalah wilayah berada di BPS. Belum ada satu platform fungsional yang mengintegrasikan ketiganya dalam satu tampilan lokasi.
4. **Komunikasi Satu Arah & Klaim Sepihak:** Portal pemerintah saat ini bersifat satu arah. Ketika instansi mengklaim progres proyek sudah mencapai $80\%$, warga sekitar tidak memiliki ruang terintegrasi untuk memverifikasi apakah kondisi fisik di lapangan benar-benar sesuai.
5. **Tidak Transparannya Alasan Prioritas Proyek:** Warga sering mempertanyakan mengapa suatu ruas jalan atau fasilitas diperbaiki terlebih dahulu dibanding wilayah lain yang tampak lebih rusak, karena tidak adanya data statistik urgensi yang disandingkan langsung dengan anggaran proyek.

---

## 2. Goals

Tujuan utama dibangunnya **PajakPeta** adalah mengubah portal data pemerintah dari sekadar "papan pengumuman satu arah" menjadi **"ekosistem pengawasan warga dua arah"** dengan target capaian berikut:

1. **Menerjemahkan Anggaran ke Bahasa Sehari-hari (Analogi Kas RT/RW):** Menyederhanakan struktur anggaran menjadi dua kantong utama (**Kantong 1: Pajak Warga Lokal / PAD** dan **Kantong 2: Dana Bantuan Pusat**) serta mengonversinya menjadi satuan "Patungan Warga" (setara jumlah STNK motor, PBB rumah, atau gelas kopi).
2. **Mengintegrasikan 3 Pilar Data Wajib dalam Satu Layar Peta:** Menyatukan data **Anggaran**, **Realisasi Proyek**, dan **Statistik Daerah** ke dalam satu titik koordinat peta interaktif (*Single-Screen Experience*).
3. **Membangun Akuntabilitas Dua Arah (*Crowd-Validation*):** Memberikan ruang bagi warga untuk memverifikasi kesesuaian klaim progres pemerintah dengan kondisi nyata di lapangan.
4. **Memberikan Bukti Rasional Berbasis Data (*Data-Driven Urgency*):** Menampilkan perhitungan **Skor Urgensi** ($0 - 100$) dan **Kewajaran Harga Satuan** secara transparan pada setiap proyek.
5. **Mendorong Keterbukaan Data Standar (*True Open Data*):** Menyediakan akses unduh dataset terintegrasi (CSV/JSON) yang siap diolah kembali oleh publik, jurnalis, maupun peneliti.

---

## 3. Target Users

Sistem dirancang untuk melayani tiga kelompok pengguna utama:

| Kategori Pengguna | Karakteristik & Latar Belakang | Kebutuhan Utama di PajakPeta |
| :--- | :--- | :--- |
| **1. Masyarakat Awam (*Public User*)** | Warga lokal, mahasiswa, pekerja, atau pelaku UMKM yang tidak memahami istilah akuntansi birokrasi pemerintah. | Mengetahui proyek apa yang sedang dibangun di sekitar mereka, berapa uang pajak yang dipakai dalam bahasa sederhana, dan melapor jika proyek mangkrak tanpa perlu *login*. |
| **2. Pengawas Publik & Akademisi (*Power User*)** | Jurnalis data, peneliti kampus, LSM/komunitas antikorupsi, dan mahasiswa. | Memfilter proyek bermasalah, melihat kesenjangan skor urgensi serta kewajaran harga satuan, dan mengunduh *dataset* mentah (CSV) untuk analisis lanjutan. |
| **3. Instansi Pemerintah (*Data Provider / Admin*)** | Staf Bappeda, Dinas PU, Kominfo, atau BPS Daerah yang memiliki data sumber. | Menyinkronkan data anggaran, titik lokasi proyek, dan statistik wilayah, serta memantau titik proyek mana yang mendapat laporan ketidaksesuaian dari warga. |

---

## 4. User Stories

Berikut adalah daftar *User Stories* berdasarkan peran pengguna:

### A. Masyarakat Awam (*Public User*)
- **US-01 (Pemantauan Lokasi & Status):** *Sebagai warga lokal*, saya ingin melihat peta proyek di kecamatan saya dengan indikator warna (Hijau, Kuning, Merah), *sehingga* saya langsung tahu proyek mana yang berjalan lancar dan mana yang terlambat dalam sekali lihat.
- **US-02 (Analogi Patungan Pajak):** *Sebagai masyarakat awam*, saya ingin melihat nilai anggaran proyek diterjemahkan ke dalam patungan pajak motor (STNK), pajak rumah (PBB), atau pajak jajan kopi, *sehingga* saya bisa membayangkan skala biaya proyek tersebut dalam kehidupan sehari-hari.
- **US-03 (Kalkulator Dompet Warga):** *Sebagai pembayar pajak*, saya ingin menggeser *slider* kebiasaan harian saya (ngopi, kendaraan, tempat tinggal) tanpa perlu *login*, *sehingga* saya tahu estimasi rupiah pajak daerah yang saya sumbangkan setiap tahun dan dapat membagikan "Kartu Dampak Warga" ke media sosial.
- **US-04 (Alasan Statistik Pembangunan):** *Sebagai warga*, saya ingin melihat data statistik wilayah (jumlah titik lubang jalan, angka kecelakaan, kepadatan harian) dan Skor Urgensi di setiap proyek, *sehingga* saya percaya bahwa proyek tersebut dibangun berdasarkan kebutuhan nyata, bukan pilih kasih.
- **US-05 (Verifikasi Cek Lapangan):** *Sebagai warga yang melewati lokasi proyek*, saya ingin menekan tombol "Sesuai" atau "Tidak Sesuai" beserta catatan dan foto lapangan, *sehingga* klaim persentase progres dari pemerintah dapat diuji kebenarannya oleh publik.

### B. Jurnalis / Peneliti (*Power User*)
- **US-06 (Deteksi Kewajaran Harga & Audit):** *Sebagai jurnalis/peneliti*, saya ingin memfilter proyek yang berstatus "Merah (Terlambat)" atau memiliki lencana "Perlu Dicek Warga" serta melihat perbandingan harga satuan ($\text{Rp/m}^2$), *sehingga* saya dapat menemukan indikasi kejanggalan proyek dengan cepat.
- **US-07 (Ekspor Open Data):** *Sebagai peneliti data*, saya ingin mengunduh seluruh *dataset* proyek yang sudah menggabungkan anggaran, realisasi, dan statistik dalam format CSV, *sehingga* saya bisa melakukan olah data lanjutan secara independen.

---

## 5. Functional Requirements

### FR-01: Peta Interaktif Satu Layar (*Single-Screen Map*)
- Sistem wajib merender peta interaktif menggunakan Leaflet.js yang mencakup seluruh layar.
- Setiap proyek ditampilkan sebagai *custom pin marker* yang memuat persentase progres aktual (`80%`) dan kode warna otomatis:
  - **Hijau (`hijau`):** Progres aktual $\ge$ progres rencana (Tepat Waktu).
  - **Kuning (`kuning`):** Deviasi progres antara $-1\%$ hingga $-14\%$ (Waspada / Mendekati Tenggat).
  - **Merah (`merah`):** Deviasi progres $\le -15\%$ (Terlambat / Rawan Mangkrak).
- Pin wajib menampilkan ikon peringatan `⚠️` jika proyek memiliki status `needs_audit === true`.

### FR-02: Panel Detail Proyek 3 Pilar (*Side Drawer*)
Ketika pin proyek diklik, sistem membuka panel samping yang terbagi menjadi 3 tab informasi:
1. **Tab 1 — Realisasi Proyek:** Menampilkan nama proyek, kecamatan, kategori, nama kontraktor, tanggal target selesai, *progress bar* (Aktual vs Rencana), selisih deviasi progres, dan foto proyek.
2. **Tab 2 — Anggaran & Patungan Pajak:**
   - Menampilkan total anggaran proyek dan visualisasi proporsi **Kantong 1: Pajak Warga Lokal (PAD)** vs **Kantong 2: Dana Bantuan Pusat**.
   - Menyediakan 3 tombol pemilih profil konversi (*Pengendara Motor*, *Pemilik Rumah*, *Anak Kuliner/Nongkrong*) yang menghitung otomatis:
     $$\text{Dana Pajak} = \text{Total Anggaran} \times \left(\frac{\text{Persentase Pajak Lokal}}{100}\right)$$
     $$\text{Setara Motor} = \text{round}\left(\frac{\text{Dana Pajak}}{250000}\right), \quad \text{Setara PBB} = \text{round}\left(\frac{\text{Dana Pajak}}{150000}\right), \quad \text{Setara Kopi} = \text{round}\left(\frac{\text{Dana Pajak}}{3000}\right)$$
   - Menampilkan beban per warga kecamatan ($\text{Dana Pajak} \div \text{Populasi Kecamatan}$), biaya per pengguna harian ($\text{Total Anggaran} \div \text{Pengguna Harian}$), serta indikator **Cek Kewajaran Harga Satuan**.
   - Menampilkan *disclaimer* jujur: *"Ilustrasi kesetaraan nilai pajak, bukan alokasi langsung per individu."*
3. **Tab 3 — Statistik Daerah & Skor Urgensi:**
   - Menampilkan metrik kondisi wilayah (titik kerusakan, jumlah insiden/kecelakaan, kepadatan pengguna).
   - Menghitung dan menampilkan **Skor Urgensi ($0 - 100$)** dengan rumus:
     $$\text{Skor Urgensi} = (0.4 \times \text{Skor Kerusakan}) + (0.35 \times \text{Skor Insiden}) + (0.25 \times \text{Skor Kepadatan})$$

### FR-03: Kalkulator "Dompet Warga"
- Menyediakan modal interaktif tanpa *login* dengan 3 parameter input:
  1. Slider frekuensi ngopi/makan di restoran per minggu ($0 - 14$ kali).
  2. Pilihan kendaraan (`none`: $\text{Rp } 0$, `motor_1`: $\text{Rp } 250.000$, `motor_2`: $\text{Rp } 500.000$, `mobil`: $\text{Rp } 1.800.000$).
  3. Pilihan status hunian (`kos`: $\text{Rp } 0$, `pribadi_sederhana`: $\text{Rp } 150.000$, `pribadi_menengah`: $\text{Rp } 450.000$).
- Menghitung total estimasi kontribusi pajak daerah per tahun:
  $$\text{Total Pajak Tahunan} = (\text{Ngopi Mingguan} \times 52 \times 3000) + \text{Pajak Kendaraan} + \text{Pajak Hunian}$$
- Menghasilkan pratinjau **"Kartu Dampak Warga"** dan tombol salin/bagikan teks dampak.

### FR-04: Sistem Verifikasi Warga ("Cek Lapangan")
- Menyediakan form di dalam panel detail proyek untuk mengirim laporan warga (`reporter_name`, `is_accurate` [boolean], `user_note`, `evidence_photo_url`).
- Mengagregasi jumlah suara **Sesuai (`accurate_count`)** dan **Tidak Sesuai (`inaccurate_count`)** secara *real-time*.
- Jika `inaccurate_count >= 2`, sistem secara otomatis mengubah atribut `needs_audit` menjadi `true` dan memunculkan *badge* peringatan **"⚠️ Perlu Dicek: Laporan Warga Berbeda dengan Klaim Progres"**.

### FR-05: Pencarian, Filter, Ringkasan Daerah, & Ekspor CSV
- Menyediakan filter *real-time* berdasarkan Kategori Proyek, Status Warna Pin, dan kata kunci pencarian.
- Menampilkan *Summary Bar* agregat (Total Proyek, Total Anggaran, Rata-rata Progres Fisik, dan Jumlah Proyek Perlu Audit).
- Menyediakan endpoint dan tombol unduh langsung file `pajakpeta_open_data.csv`.

---

## 6. Non-Functional Requirements

1. **NFR-01 — Usability & Bahasa Ramah Awam (Zero-Jargon):** Seluruh antarmuka wajib menggunakan Bahasa Indonesia sehari-hari yang mudah dicerna masyarakat umum dan menghindari akronim birokrasi tanpa penjelasan.
2. **NFR-02 — Performance & Responsiveness:** Peta interaktif dan perpindahan antar-tab di dalam panel detail wajib berjalan instan ($< 200\text{ ms}$ untuk interaksi UI lokal) serta responsif di layar *desktop* maupun *mobile*.
3. **NFR-03 — Privacy by Design (Tanpa Login untuk Publik):** Fitur eksplorasi peta dan kalkulator "Dompet Warga" wajib dapat diakses $100\%$ tanpa registrasi akun dan tidak menyimpan data finansial pribadi pengguna ke dalam *server*.
4. **NFR-04 — Zero-Config Reliability (Kesiapan Demo Lomba):** Sistem *backend* wajib memiliki mekanisme *in-memory data seed* otomatis (`mockProjects.js`) sehingga aplikasi dapat langsung dijalankan secara utuh (`npm run dev`) tanpa ketergantungan wajib pada koneksi *database* eksternal saat penjurian.
5. **NFR-05 — Etika Transparansi & Netralitas Data:** Penanda anomali pada sistem (seperti *"Perlu Dicek"* atau *"Di atas median proyek sejenis"*) harus disajikan menggunakan bahasa informatif berbasis data, bukan tuduhan hukum sepihak.

---

## 7. Scope

Untuk memastikan pengerjaan proyek selesai tepat waktu dengan kualitas maksimal saat penjurian lomba, ruang lingkup dibagi menjadi **In-Scope (Wajib Dibangun di Kode MVP)** dan **Out-of-Scope (Disajikan sebagai Roadmap Presentasi)**:

### A. In-Scope (Wajib Selesai pada Aplikasi Web / MVP)
- Peta interaktif satu layar (Leaflet) dengan *custom pin marker* berwarna (Hijau/Kuning/Merah) + penanda audit.
- Panel Detail Proyek 3 Pilar (Realisasi Fisik, Konversi Anggaran 2 Kantong & Patungan Pajak, Statistik Wilayah & Skor Urgensi).
- Indikator Cek Kewajaran Harga Satuan pada rincian anggaran proyek.
- Modal Kalkulator "Dompet Warga" versi *slider* + kartu dampak siap bagikan.
- Fitur "Cek Lapangan" (*Crowd-validation* Sesuai/Tidak Sesuai beserta form unggah laporan warga secara *real-time*).
- Filter kategori/status, bar pencarian, ringkasan statistik daerah, dan fitur unduh data terbuka (`.csv`).

### B. Out-of-Scope (Tidak Dikoding Penuh — Masuk Slide Roadmap Masa Depan)
- Integrasi langsung (*live production scraping*) ke server SIRUP/LPSE pemerintah daerah.
- Bot notifikasi otomatis via WhatsApp dan Telegram.
- *Chatbot* AI Asisten Tanya Anggaran berbasis LLM/RAG.
- *Mini-game* simulasi partisipatif *"Kalau Aku Jadi Kepala Daerah"* dan diagram aliran dana kompleks (*Sankey Diagram*).
- Sistem autentikasi berjenjang (Login/RBAC) untuk admin instansi pemerintah.