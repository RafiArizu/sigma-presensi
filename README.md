# SIGMA

Sistem Identifikasi dan Pengelolaan Magang serta Absensi. SIGMA adalah aplikasi web presensi peserta PKL dan magang PT. Vaiotech Lintas Nusantara dengan bukti foto, pemeriksaan lokasi, pengelolaan penempatan, pengajuan izin/sakit, koreksi, rekap, serta tata kelola data foto.

Status proyek: **Draft / MVP**. Aplikasi dikembangkan satu orang untuk satu organisasi pada tahap awal.

## Tech Stack

- Backend: Node.js 24, Express, TypeScript.
- Frontend: React, TypeScript, Vite.
- Styling: CSS Modules dan CSS global.
- Database: PostgreSQL 14+ lokal, driver `pg` Promise API.
- Authentication: sesi server berbasis cookie; session store PostgreSQL belum diaktifkan pada implementasi saat ini.
- Attendance evidence: foto privat dan lokasi tervalidasi server; tidak ada pencocokan wajah atau template biometrik.
- Maps: Leaflet dengan OpenStreetMap tiles untuk tampilan dan pengaturan lokasi/radius presensi.
- Browser location: Browser Geolocation API untuk mengambil koordinat perangkat dengan persetujuan pengguna.
- Distance validation: Backend Haversine distance check untuk memvalidasi jarak perangkat terhadap lokasi terdaftar.
- Testing: Vitest untuk unit/integration; E2E ditambahkan saat flow MVP stabil.
- Tooling: npm, Git, migrasi SQL berversi.

## Arsitektur MVC dan Struktur Project

Root project wajib mengikuti konsep MVC. `views/` adalah aplikasi React/Vite; Model dan Controller berjalan pada server Express.

- `models/`: tipe domain dan query/repository `pg`; tidak mengimpor View atau Controller.
- `controllers/`: menerima HTTP request tervalidasi, memanggil service/model, mengembalikan DTO.
- `views/`: root React + Vite dengan `src/pages`, `src/components`, `src/api`, `src/styles`.
- `routes/`: pemetaan endpoint API.
- `middlewares/`: autentikasi, otorisasi role, CSRF, validasi, rate limit, dan error handling.
- `services/`: aturan bisnis, transaksi lintas model, idempotency, dan kebijakan presensi.
- `adapters/`: adapter face engine, session, storage, atau integrasi yang belum dipilih.
- `config/`: validasi environment, pool PostgreSQL, dan konfigurasi server.
- `database/migrations/`: SQL berversi untuk PostgreSQL.
- `database/seeds/`: data awal lokal, tanpa kredensial produksi.
- `tests/`: unit, integration, dan E2E.
- `docs/`: PRD, BRD, spesifikasi API, runbook, dan keputusan arsitektur.
- `app.ts` dan `server.ts`: bootstrap Express dan listener Node.js.

Alur dependensi: View mengirim HTTP ke route; middleware memeriksa akses; Controller memanggil service; service menggunakan Model/adapter; Model mengakses PostgreSQL. Browser tidak pernah mengakses PostgreSQL langsung.

## Palet Warna & Desain Antarmuka MVP

Arah visual awal memakai gaya editorial hangat dan responsif, bukan dashboard generik:

- **Canvas** (`#F5F1E8`): latar utama halaman.
- **Ink** (`#17251F`): teks utama dan heading.
- **Forest** (`#173D35`): navigasi, border, dan aksi utama.
- **Terracotta** (`#BD5B37`): aksen status, label, dan perhatian.
- **Paper** (`#FFFDF8`): kartu dan panel.
- **Muted** (`#58635D`): teks sekunder dan metadata.
- **Border** (`#C9C0AE`): garis pemisah dan kontrol form.

UI wajib tetap dapat digunakan pada browser HP dan desktop. State loading, kosong, sukses, gagal, permission kamera/lokasi, sesi habis, dan retry timeout harus terlihat jelas.

## Prasyarat

- Node.js 24.x dan npm.
- PostgreSQL 14+ atau PostgreSQL local.
- Git.
- Browser modern dengan dukungan kamera dan geolocation untuk pengujian presensi.
- Pemrosesan foto dan lokasi berjalan melalui validasi server; integrasi kamera tidak menyimpan template biometrik.
- Docker tidak termasuk stack final. Bagian Docker hanya disediakan sebagai opsi lokal jika nanti konfigurasi container disetujui.

## Setup Native

```powershell
npm install
npm install --prefix views
Copy-Item .env.example .env
```

Buat database dan tabel awal pada PostgreSQL local. Jalankan isi migrasi dari:

```text
database/migrations/001_baseline.sql
```

Atur `.env` untuk PostgreSQL lokal. Jangan commit `.env`:

```env
NODE_ENV=development
PORT=4000
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=sigma_presensi
PGUSER=postgres
PGPASSWORD=
FRONTEND_ORIGIN=http://localhost:5173
```

Jalankan dua proses development pada terminal terpisah:

```powershell
npm run dev:server
npm run dev:client
```

Atau jalankan keduanya melalui script orkestrasi:

```powershell
npm run dev
```

Buka `http://localhost:5173`. Health API tersedia di `http://127.0.0.1:4000/api/health`.

Vite meneruskan request `/api` ke Express hanya saat development. Konfigurasi proxy ini bukan konfigurasi production.

## Setup Database

- PostgreSQL berjalan sebagai service lokal terpisah dari Laragon.
- Backend memakai connection pool `pg` dan parameterized query.
- Browser tidak menyimpan atau membaca kredensial PostgreSQL.
- Migrasi dijalankan secara eksplisit dan berversi.
- Jangan mengubah struktur production secara manual tanpa migrasi dan backup.

```powershell
# Jalankan dengan client PostgreSQL local sesuai instalasi lokal
psql -h 127.0.0.1 -U postgres -d sigma_presensi -f database/migrations/001_baseline.sql
```

Migration berversi saat ini mencakup fondasi user/session, ERD presensi v0.3, attendance photos, dan cleanup legacy. Entitas operasional lain tetap ditambahkan bertahap mengikuti implementasi MVP.

## Development dan Production

Development:

- Browser: `http://localhost:5173`.
- Express: `http://127.0.0.1:4000`.
- Vite proxy: `/api` ke Express.
- PostgreSQL: Laragon atau PostgreSQL lokal.

Production belum ditetapkan. Rekomendasi sementara adalah satu origin HTTPS dengan reverse proxy yang menyajikan `views/dist/` dan meneruskan `/api` ke Express. Reverse proxy, process manager, hosting, domain, session store, dan secret manager harus diputuskan sebelum deployment.

Konfigurasi development tidak otomatis menjadi konfigurasi production. Production wajib memakai HTTPS, cookie `Secure`, origin CORS eksplisit, secret berbeda, backup, monitoring, prosedur restore, dan job penghapusan foto berdasarkan retention_until.

## Bukti Foto, Lokasi, dan Presensi Cepat

- Kamera mengambil foto sebagai bukti; browser tidak menentukan presensi berhasil.
- Backend mengikat foto, lokasi, peserta, aksi, sesi kerja, dan expiry pada challenge transaksi.
- MVP tidak memakai identifikasi wajah 1:1 maupun 1:N.
- Tidak ada enrollment wajah; Staff Presensi memeriksa bukti foto sesuai mandat.
- Metadata foto disimpan di PostgreSQL; file foto disimpan pada storage privat sesuai retensi.
- Validasi gambar, ukuran, hash, lokasi, akurasi, usia data, retensi, dan fallback wajib ditetapkan sebelum pilot.
- Halaman Kelola Data menampilkan tabel attendance photos: peserta, lokasi/waktu foto, batas retensi, serta aksi detail/edit/delete.
- Super Admin mengatur durasi penghapusan otomatis foto pada Settings; nilai saat ini disimpan sebagai konfigurasi frontend sampai endpoint policy retention tersedia.
- Presensi dari halaman login tidak menerbitkan sesi dashboard dan tidak boleh membocorkan profil berdasarkan kode peserta.

## Role MVP

| Role | Tanggung Jawab |
| --- | --- |
| Peserta | Aktivasi akun, enrollment wajah sendiri, presensi, izin/sakit, histori, dan koreksi. |
| Staff Presensi | Peserta/placement, validasi enrollment, jadwal/lokasi sesuai mandat, keputusan pengajuan, koreksi, rekap, audit operasional. |
| Super Admin | Akun petugas, kebijakan teknis, keamanan, pencabutan akses, backup/restore, tabel attendance photos, retensi dan penghapusan sesuai kebijakan. |

Tidak ada pendaftaran publik bebas, SSO, role keempat, payroll, HRIS, mobile native, offline otomatis, atau pengelolaan seluruh pegawai dalam MVP.

## Akun Demo

Password semua akun: `password`.

| Role | Email |
| --- | --- |
| Peserta Magang / PKL | `peserta.pkl1@example.com` / `peserta.pkl2@example.com` / `peserta.pkl3@example.com` |
| Staff Presensi | `staff.presensi1@example.com` / `staff.presensi2@example.com` / `staff.presensi3@example.com` |
| Admin Platform | `adminsigma@example.com` / `adminsigma_2@example.com` / `adminsigma_3@example.com` |

## Test dan Build

```powershell
npm run build
npm test
```

Build mencakup TypeScript backend dan Vite frontend. Health check manual:

```powershell
npm run dev:server
Invoke-RestMethod http://127.0.0.1:4000/api/health
```

Pengujian berikut menjadi target bertahap:

- Unit rule status akun, sesi, idempotency, tanggal kerja, dan otorisasi.
- Integration Express + PostgreSQL test database.
- E2E login, absensi sukses/gagal, izin, koreksi, expiry, dan retry timeout.
- Uji kamera, lokasi, upload foto, retensi, dan restore sebelum pilot.
- Uji restore database sebelum pilot.

## Keamanan Repository

- Jangan commit `.env`, password database, session secret, token reset, foto privat, atau kredensial deployment.
- Gunakan `.env.example` hanya sebagai template tanpa nilai rahasia.
- Semua query PostgreSQL memakai parameter binding.
- Semua perubahan state memiliki validasi backend, otorisasi role, dan audit event.
- Cookie sesi production wajib `HttpOnly`, `Secure`, dan `SameSite` sesuai arsitektur deployment.
- State-changing request berbasis cookie wajib memiliki perlindungan CSRF.
- CORS tidak boleh memakai wildcard bersama credentials.
- Jangan menganggap geolocation browser atau foto sebagai pencegahan kecurangan mutlak.








