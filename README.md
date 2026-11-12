# SIGMA

Sistem Identifikasi dan Pengelolaan Magang serta Absensi. SIGMA adalah aplikasi web presensi peserta PKL dan magang PT. Vaiotech Lintas Nusantara dengan verifikasi wajah, pemeriksaan lokasi, pengelolaan penempatan, pengajuan izin/sakit, koreksi, rekap, dan audit.

Status proyek: **Draft / MVP**. Aplikasi dikembangkan satu orang untuk satu organisasi pada tahap awal.

## Tech Stack

- Backend: Node.js 24, Express, TypeScript.
- Frontend: React, TypeScript, Vite.
- Styling: CSS Modules dan CSS global.
- Database: MySQL 8+ dari Laragon, driver `mysql2` Promise API.
- Authentication: sesi server berbasis cookie; session store MySQL disiapkan sebagai target implementasi.
- Face recognition: verifikasi 1:1 melalui adapter; model, library, liveness, dan threshold belum final.
- Testing: Vitest untuk unit/integration; E2E ditambahkan saat flow MVP stabil.
- Tooling: npm, Git, migrasi SQL berversi.

## Arsitektur MVC dan Struktur Project

Root project wajib mengikuti konsep MVC. `views/` adalah aplikasi React/Vite; Model dan Controller berjalan pada server Express.

- `models/`: tipe domain dan query/repository `mysql2`; tidak mengimpor View atau Controller.
- `controllers/`: menerima HTTP request tervalidasi, memanggil service/model, mengembalikan DTO.
- `views/`: root React + Vite dengan `src/pages`, `src/components`, `src/api`, `src/styles`.
- `routes/`: pemetaan endpoint API.
- `middlewares/`: autentikasi, otorisasi role, CSRF, validasi, rate limit, dan error handling.
- `services/`: aturan bisnis, transaksi lintas model, idempotency, dan kebijakan presensi.
- `adapters/`: adapter face engine, session, storage, atau integrasi yang belum dipilih.
- `config/`: validasi environment, pool MySQL, dan konfigurasi server.
- `database/migrations/`: SQL berversi untuk MySQL InnoDB.
- `database/seeds/`: data awal lokal, tanpa kredensial produksi.
- `tests/`: unit, integration, dan E2E.
- `docs/`: PRD, BRD, spesifikasi API, runbook, dan keputusan arsitektur.
- `app.ts` dan `server.ts`: bootstrap Express dan listener Node.js.

Alur dependensi: View mengirim HTTP ke route; middleware memeriksa akses; Controller memanggil service; service menggunakan Model/adapter; Model mengakses MySQL. Browser tidak pernah mengakses MySQL langsung.

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
- MySQL 8+ atau MySQL Laragon.
- Git.
- Browser modern dengan dukungan kamera dan geolocation untuk pengujian presensi.
- Mesin/model face recognition belum menjadi prasyarat scaffold; integrasinya menunggu gerbang PoC.
- Docker tidak termasuk stack final. Bagian Docker hanya disediakan sebagai opsi lokal jika nanti konfigurasi container disetujui.

## Setup Native

```powershell
git clone <url-repository-sigma>
Set-Location sigma-presensi
npm install
npm install --prefix views
Copy-Item .env.example .env
```

Buat database dan tabel awal pada MySQL Laragon. Jalankan isi migrasi dari:

```text
database/migrations/001_foundation.sql
```

Atur `.env` untuk MySQL lokal. Jangan commit `.env`:

```env
NODE_ENV=development
PORT=4000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=sigma_presensi
MYSQL_USER=root
MYSQL_PASSWORD=
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

- Laragon menjalankan MySQL lokal.
- Backend memakai connection pool `mysql2` dan parameterized query.
- Browser tidak menyimpan atau membaca kredensial MySQL.
- Migrasi dijalankan secara eksplisit dan berversi.
- Jangan mengubah struktur production secara manual tanpa migrasi dan backup.

```powershell
# Jalankan dengan client MySQL Laragon sesuai instalasi lokal
mysql -u root -p < database/migrations/001_foundation.sql
```

Migration saat ini baru berisi fondasi `users` dan `sessions`. Entitas placement, lokasi berversi, work session, face template, verification, attendance, pengajuan, koreksi, audit, dan token akan ditambahkan bertahap mengikuti implementasi MVP.

## Development dan Production

Development:

- Browser: `http://localhost:5173`.
- Express: `http://127.0.0.1:4000`.
- Vite proxy: `/api` ke Express.
- MySQL: Laragon atau MySQL lokal.

Production belum ditetapkan. Rekomendasi sementara adalah satu origin HTTPS dengan reverse proxy yang menyajikan `views/dist/` dan meneruskan `/api` ke Express. Reverse proxy, process manager, hosting, domain, session store, dan secret manager harus diputuskan sebelum deployment.

Konfigurasi development tidak otomatis menjadi konfigurasi production. Production wajib memakai HTTPS, cookie `Secure`, origin CORS eksplisit, secret berbeda, backup, monitoring, dan prosedur restore.

## Face Recognition dan Presensi Cepat

- Kamera hanya mengambil sampel gambar; browser tidak memutuskan wajah cocok.
- Backend harus menerima hasil dari mesin/adapter tepercaya yang terikat challenge, peserta, aksi, sesi kerja, versi template, dan expiry.
- Rekomendasi MVP: verifikasi 1:1, bukan identifikasi 1:N.
- Enrollment harus melalui pengajuan peserta dan validasi Staff Presensi.
- Template/embedding diperlakukan sebagai data sensitif; foto asli tidak otomatis disimpan.
- Threshold, false acceptance, false rejection, liveness, retensi, persetujuan, dan fallback wajib diputuskan setelah PoC.
- Presensi dari halaman login tidak menerbitkan sesi dashboard dan tidak boleh membocorkan profil berdasarkan kode peserta.

## Role MVP

| Role | Tanggung Jawab |
| --- | --- |
| Peserta | Aktivasi akun, enrollment wajah sendiri, presensi, izin/sakit, histori, dan koreksi. |
| Staff Presensi | Peserta/placement, validasi enrollment, jadwal/lokasi sesuai mandat, keputusan pengajuan, koreksi, rekap, audit operasional. |
| Super Admin | Akun petugas, kebijakan teknis, keamanan, audit sistem, pencabutan akses, backup/restore, retensi dan penghapusan sesuai kebijakan. |

Tidak ada pendaftaran publik bebas, SSO, role keempat, payroll, HRIS, mobile native, offline otomatis, atau pengelolaan seluruh pegawai dalam MVP.

## Akun Demo

Akun demo belum dibuat pada scaffold. Jangan mengarang password atau kredensial demo sebelum seed resmi tersedia.

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
- Integration Express + MySQL test database.
- E2E login, absensi sukses/gagal, izin, koreksi, expiry, dan retry timeout.
- PoC face recognition dengan dataset berizin dan metrik FAR/FRR.
- Uji restore database sebelum pilot.

## Keamanan Repository

- Jangan commit `.env`, password database, session secret, token reset, embedding, foto wajah, atau kredensial deployment.
- Gunakan `.env.example` hanya sebagai template tanpa nilai rahasia.
- Semua query MySQL memakai parameter binding.
- Semua perubahan state memiliki validasi backend, otorisasi role, dan audit event.
- Cookie sesi production wajib `HttpOnly`, `Secure`, dan `SameSite` sesuai arsitektur deployment.
- State-changing request berbasis cookie wajib memiliki perlindungan CSRF.
- CORS tidak boleh memakai wildcard bersama credentials.
- Jangan menganggap geolocation browser atau face recognition sebagai pencegahan kecurangan mutlak.
