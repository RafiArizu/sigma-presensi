# PRODUCT REQUIREMENTS DOCUMENT
## SIGMA — Sistem Presensi PKL dan Magang Vaiotech
Versi: 0.4  |  Status: Draft / MVP  |  Platform: Web Application  
Teknologi: React · Vite · TypeScript · Node.js · Express · PostgreSQL · pg
Target Pengguna: Staff Presensi (Admin), Peserta PKL & Magang (User), Super Admin
Arsitektur: MVC pada root proyek  |  Perusahaan: PT. Vaiotech Lintas Nusantara
Dokumen ini mendefinisikan fitur, halaman, tiga aktor, alur ambil foto → deteksi lokasi → presensi, impor/ekspor Excel, arsitektur MVC, model data dan kriteria penerimaan SIGMA.
Daftar Isi
## 1. Product Overview
## 2. Product Goals
## 3. Actors and Roles
## 4. Technology Stack
## 5. Scope MVP
## 6. Functional Requirements
## 7. Required Pages / UI
## 8. Core User Flows
## 9. Data Model / ERD Baseline
## 10. Database Rules
## 11. Non-Functional Requirements
## 12. Acceptance Criteria MVP
## 13. Future Enhancements
## 1. Product Overview
SIGMA (Sistem Identifikasi dan Pengelolaan Magang serta Absensi) adalah aplikasi web responsif untuk mencatat presensi peserta PKL dan magang di PT. Vaiotech Lintas Nusantara. Peserta mengambil foto, mengaktifkan lokasi, lalu mengirim presensi masuk/pulang. Identitas berasal dari akun yang telah diautentikasi.
Aplikasi dikembangkan satu orang untuk satu perusahaan. Foto menjadi bukti dokumentasi yang dapat diperiksa Staff Presensi. Sistem tidak mencocokkan wajah atau menyimpulkan identitas dari foto. Server memvalidasi berkas, lokasi, jadwal dan hak akses sebelum mencatat presensi.
Keputusan proyek: tiga role, stack dan root MVC tetap. Presensi memakai foto dan lokasi; Staff Presensi mengimpor peserta/penempatan serta mengekspor rekap dalam Excel (.xlsx). Jam kerja, radius lokasi, retensi foto, kapasitas dan hosting perlu ditetapkan sebelum pilot.
Revisi 0.4 tanggal 20 November 2026 mempertahankan struktur dasar dokumen dan memperjelas Pages Staff Presensi serta implementasi lokasi berbasis peta. Alur presensi diganti menjadi bukti foto dan lokasi; impor/ekspor Excel masuk MVP. Implementasi UI terbaru memusatkan Kelola Data pada tabel attendance photos dan pengaturan durasi retensi pada Settings Super Admin. Dokumen tetap draft untuk validasi kebijakan operasional perusahaan.
## 2. Product Goals
Presensi yang dapat ditelusuri: satu bukti masuk/pulang per sesi kerja, dengan akun peserta, foto privat, waktu server, lokasi dan versi kebijakan yang konsisten.
Akses cepat yang aman: presensi dari halaman login tetap memverifikasi email/password, kemudian memberi otoritas satu transaksi tanpa membuka dashboard.
Administrasi yang jelas: Staff Presensi menangani peserta, jadwal, izin/sakit, koreksi dan rekap; Super Admin mengelola akun petugas, konfigurasi sistem, keamanan dan pemulihan.
Rekap yang dapat diperiksa: sumber hadir, izin, sesi tidak lengkap dan koreksi dapat ditelusuri; Staff Presensi mengekspor rekap dan mengimpor peserta melalui Excel dengan validasi serta pratinjau.
Pemeliharaan realistis: root MVC memisahkan View, Controller dan Model dengan TypeScript, migrasi SQL berversi, pengujian dan dokumentasi untuk satu pengembang.
Ukuran keberhasilan: duplikasi presensi, keberhasilan kamera/lokasi di HP, waktu penyusunan rekap, hasil impor/ekspor Excel dan restore. Target kapasitas serta latensi ditetapkan dari pilot.
## 3. Actors and Roles
Hanya tiga role berikut yang digunakan. Nilai role disimpan sebagai peserta, staff_presensi, atau super_admin; tidak ada role keempat untuk aktivitas operasional sistem.

| Aktor | Peran | Kebutuhan Utama |
| Staff Presensi (Admin) | Pengelola operasional presensi | Mengelola peserta/penempatan, jadwal/lokasi, izin/koreksi, memeriksa bukti foto dan rekap; impor peserta serta ekspor rekap Excel sesuai mandat. |
| Peserta PKL & Magang (User) | Pengguna presensi | Mengaktifkan akun, mengambil foto dan lokasi untuk masuk/pulang, mengajukan izin/koreksi, melihat histori sendiri dan mengganti kredensial. |
| Super Admin | Pengelola sistem | Mengelola akun Staff Presensi dan Super Admin, kebijakan sistem dan keamanan, audit sistem, pencabutan akses, backup/restore, retensi serta penghapusan data sesuai kebijakan yang disahkan. |

### 3.1 Batas Kewenangan

| Operasi | Staff Presensi | Peserta | Super Admin |
| Presensi otomatis | Tidak menyamar sebagai peserta | Diri sendiri | Tidak menyamar sebagai peserta |
| Peserta dan penempatan | Kelola dalam mandat | Baca milik sendiri | Kelola akses/eskalasi sistem |
| Bukti foto presensi | Periksa bukti dalam mandat | Ambil dan baca bukti sendiri | Kebijakan retensi/penghapusan; akses terbatas |
| Izin dan koreksi | Putuskan dengan alasan/audit | Ajukan/baca/batalkan pending sendiri | Tidak otomatis menjadi pemberi keputusan bisnis |
| Jadwal dan lokasi kantor | Kelola sesuai kebijakan disahkan | Baca jadwal relevan | Konfigurasi sistem dan pembatasan perubahan |
| Akun Staff dan Super Admin | Tidak | Tidak | Kelola; tidak boleh menonaktifkan Super Admin aktif terakhir |
| Audit dan restore | Audit operasional terbatas | Tidak membaca audit sistem | Audit sistem dan operasi pemulihan |

Backend menegakkan role dan kepemilikan objek pada setiap request. Kewenangan tinggi tidak membolehkan mengubah presensi tanpa workflow koreksi. Tidak ada pengajuan yang boleh disetujui sendiri; bila ada konflik kepentingan, penanggung jawab perusahaan menetapkan petugas pengganti dari role yang tersedia.
## 4. Technology Stack

| Komponen | Teknologi & Keterangan |
| Programming Language | TypeScript untuk frontend dan backend; runtime development Node.js 24. |
| Frontend & Build Tool | React + Vite untuk SPA. React adalah View pada arsitektur MVC SIGMA; Vite berjalan dari direktori views/. |
| Styling | CSS Modules untuk komponen dan CSS global untuk reset, tipografi serta token desain. |
| Backend Framework | Node.js + Express + TypeScript. Routes dan middleware meneruskan request ke Controller; aturan bisnis berada pada service; akses SQL melalui Model. |
| Primary Database | PostgreSQL. Laragon menjalankan PostgreSQL lokal; penyedia/konfigurasi production belum ditetapkan. |
| Database Driver | pg Pool API, connection pool, parameter binding dan transaksi. Tidak memakai ORM. |
| Authentication & Authorization | Rekomendasi sesi server dengan cookie dan session store PostgreSQL; tiga role tetap. Library sesi dipilih saat implementasi dan tidak menambah role. |
| Kamera, Lokasi & Excel | getUserMedia dan Geolocation API untuk foto/lokasi. Server memvalidasi gambar dan geofence. Parser/writer .xlsx dipilih berdasarkan kompatibilitas, lisensi dan batas sumber daya. |
| Peta & Visualisasi Lokasi | Leaflet untuk komponen peta interaktif pada browser, dengan OpenStreetMap tiles sebagai sumber tile peta. |
| Deteksi Lokasi Browser | Browser Geolocation API digunakan untuk mengambil koordinat perangkat setelah persetujuan pengguna dan memeriksa error/akurasi sampel. |
| Validasi Radius Backend | Backend menghitung jarak koordinat perangkat ke lokasi terdaftar menggunakan formula Haversine; keputusan berada di server, bukan di browser. |
| Tooling | npm, Git, lockfile dan migrasi SQL. Satu repository sigma-presensi; Docker, Next.js dan Tailwind tidak digunakan. |

Catatan MVC: root proyek wajib memiliki models/, controllers/, dan views/. React/Vite ditempatkan pada views/; Model dan Controller berjalan di server Express. Struktur ini menggantikan pemisahan folder root frontend/ dan backend/ pada rancangan awal. Dua proses development tetap ada, tetapi berada dalam satu repository.
### 4.1 Root Project dengan Konsep MVC

| Path pada root sigma-presensi | Tanggung Jawab |
| models/ | Entitas domain, tipe data dan query/repository pg. Contoh: UserModel, AttendanceModel, LeaveRequestModel. Tidak mengimpor View atau Controller. |
| controllers/ | Menerima input HTTP tervalidasi, membaca identitas server, memanggil service/Model, dan mengembalikan DTO/respons. Tidak merender atau mempercayai logika React. |
| views/ | Root aplikasi React + Vite dengan package.json, index.html, vite.config.ts dan src/. Berisi pages/, components/, api/, styles/ serta App.tsx dan main.tsx. |
| routes/ dan middlewares/ | Pemetaan endpoint, autentikasi, otorisasi, CSRF, validasi, rate limit dan penanganan error. |
| services/ dan adapters/ | Aturan presensi, transaksi lintas Model, idempotency, penyimpanan foto privat, validasi lokasi dan pemrosesan Excel. Mendukung MVC. |
| config/ dan database/ | Validasi environment, pool PostgreSQL; database/migrations/ dan seeds/ untuk SQL berversi. Konfigurasi rahasia server tidak berada di views/. |
| tests/ dan docs/ | Pengujian domain/API/integrasi serta PRD, BRD, spesifikasi API dan runbook. |
| app.ts dan server.ts | Bootstrap Express, middleware/routes dan listener Node pada root. package.json dan tsconfig.json root untuk backend serta script orkestrasi development. |
| .env dan .env.example | Environment backend dan contoh tanpa rahasia. .env tidak masuk Git; variabel VITE_ tidak berisi password PostgreSQL atau kunci penyimpanan. |

Alur dependensi: View mengirim HTTP ke route; middleware memeriksa akses; Controller memanggil service; service menggunakan Model dan adapter; Model mengakses PostgreSQL; hasil dikembalikan sebagai DTO ke View. Controller tidak memuat query SQL tersebar dan React tidak terhubung langsung ke database. Konsep MVC berlaku pada aplikasi secara keseluruhan; React tidak dipaksa menjadi backend MVC tersendiri.
Diagram MVC SIGMA. Seluruh keputusan presensi dan akses data berada di server.
### 4.2 Development dan Production
Development menjalankan Vite dari views/ dan Express dari root. Konfigurasi usulan: browser localhost:5173, Express 127.0.0.1:4000, dan PostgreSQL pada port yang dikonfigurasi. Proxy Vite meneruskan /api; proxy tersebut hanya untuk development [S1]. tsconfig backend hanya menyertakan direktori/file server dan mengecualikan views/ agar build frontend/backend tidak tercampur.
Production direkomendasikan satu origin HTTPS yang menyajikan views/dist/ dan meneruskan /api ke Express. Reverse proxy dan pengelola proses belum dipilih. PostgreSQL tidak diekspos ke browser. Build aset dan compile TypeScript menggantikan development server. Library tambahan harus melalui evaluasi kompatibilitas, lisensi dan pemeliharaan.
## 5. Scope MVP

| Area | Termasuk MVP | Di luar MVP |
| Authentication | Aktivasi akun terundang, login/logout, reset terkontrol dan tiga role final. | Pendaftaran publik bebas, SSO dan role tambahan. |
| Administrasi Peserta | Data peserta, penempatan dan status; impor .xlsx melalui template, validasi/pratinjau dan commit atomik. | Pengelolaan seluruh pegawai dan penilaian/logbook. |
| Presensi | Ambil foto → deteksi lokasi → presensi masuk/pulang; waktu server, bukti privat dan idempotency. | Offline otomatis dan pelacakan lokasi terus-menerus. |
| Presensi Cepat | Dari halaman login: email/password valid, token satu transaksi, foto dan lokasi. | Presensi anonim atau hanya bermodal email/foto tanpa autentikasi. |
| Izin & Koreksi | Izin/sakit, keputusan Staff Presensi, koreksi dengan riwayat. | Cuti sebelum hak/kebijakannya ditetapkan; persetujuan banyak tingkat. |
| Laporan | Histori sendiri, rekap berfilter dan ekspor .xlsx; impor peserta/penempatan oleh Staff Presensi. | Payroll, analitik prediktif, impor histori presensi dan integrasi HR. |
| System Administration | Super Admin mengelola akun petugas, kebijakan teknis, audit, retensi dan runbook backup/restore. | Dashboard infrastruktur kompleks, microservices, Redis dan Kubernetes. |
| Jadwal & Lokasi | Satu pola jadwal operasional yang disahkan; sesi kerja konkret dan lokasi berversi. | Shift kompleks/WFH/tugas luar tanpa kebijakan yang disetujui. |

Must: autentikasi, foto/lokasi, presensi, izin/sakit, koreksi, histori/rekap, impor/ekspor Excel, audit dan pemulihan. Jalur cepat memerlukan kredensial. Should: notifikasi dalam aplikasi. Could: CSV dan pengingat. Jumlah peserta serta beban bersamaan belum ditetapkan.
Urutan implementasi: validasi kebijakan → fondasi MVC/database/akses → kamera, lokasi dan presensi inti → izin/koreksi/rekap serta Excel → UAT, restore dan pilot. Uji perangkat memastikan foto dan lokasi dapat dikirim dengan andal.
## 6. Functional Requirements
### FR-001 sampai FR-020 mempertahankan penomoran dan susunan dokumen. FR-005 mengatur bukti foto; FR-006 validasi lokasi; FR-015 mencakup impor/ekspor Excel. Tiga role, stack dan root MVC tetap berlaku.
### FR-001 Registrasi dan aktivasi
Kebutuhan: Staff Presensi membuat peserta dan penempatan serta mengirim undangan aktivasi sekali pakai. Pendaftaran publik terbuka tidak tersedia.
Prioritas dan keterlacakan: Must; BR-001 / US-001. Kriteria uji terinci pada bagian 12.
### FR-002 Penempatan dan status peserta
Kebutuhan: Simpan periode penempatan, Staff Presensi dan status. Akhir/nonaktif memblokir transaksi operasional serta membatalkan sesi aktif.
Prioritas dan keterlacakan: Must; BR-001 / US-001. Kriteria uji terinci pada bagian 12.
### FR-003 Login logout dan sesi
Kebutuhan: Verifikasi kredensial, regenerasi ID sesi setelah login, batasi percobaan, dan hapus sesi saat logout.
Prioritas dan keterlacakan: Must; BR-002 / US-002. Kriteria uji terinci pada bagian 12.
### FR-004 Hak akses dan pemulihan akun
Kebutuhan: Backend memeriksa tiga role dan pemilikan objek. Reset peserta dibantu Staff Presensi dengan verifikasi identitas; reset akun petugas ditangani Super Admin melalui token sekali pakai.
Prioritas dan keterlacakan: Must; BR-002 / US-002. Kriteria uji terinci pada bagian 12.
### FR-005 Pengambilan dan Penyimpanan Foto
Kebutuhan: Peserta mengambil foto baru melalui kamera untuk setiap masuk/pulang, melihat pratinjau dan dapat mengulang sebelum kirim. Server memeriksa isi gambar, MIME, ukuran dan dimensi, lalu menyimpan bukti privat terkait peserta, aksi dan sesi. Foto bukan hasil identifikasi otomatis.
Prioritas dan keterlacakan: Must; BR-003 / US-003. Kriteria uji terinci pada bagian 12.
### FR-006 Deteksi dan Validasi Lokasi
Kebutuhan: Setelah foto diambil, browser meminta lokasi. Server memvalidasi latitude/longitude, akurasi, usia koordinat dan jarak terhadap versi lokasi kantor. Foto valid dan lokasi sesuai aturan wajib tersedia sebelum commit.
Input browser tidak dipercaya begitu saja. Server menghitung jarak dan memakai waktu server; flag lokasi valid dari client ditolak sebagai otoritas. Radius, akurasi maksimum, masa berlaku koordinat/foto dan batas ukuran gambar ditetapkan sebelum pilot. GPS dan foto tidak menjamin anti-kecurangan mutlak.
Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-007 Presensi masuk
Kebutuhan: Gunakan identitas dari sesi, penempatan aktif dan sesi kerja yang sesuai; rekam waktu server serta versi kebijakan.
Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-008 Presensi pulang
Kebutuhan: Pulang memerlukan masuk pada sesi yang sama, pengambilan foto baru, validasi lokasi ulang dan urutan waktu yang benar.
Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-009 Presensi dari halaman login
Kebutuhan: Peserta memasukkan email/password dan memilih masuk/pulang pada halaman login. Server memverifikasi kredensial, status serta penempatan sebelum menerbitkan token singkat khusus satu transaksi; foto dan lokasi tetap wajib.
Pembatasan jalur cepat: token terikat peserta, aksi, sesi kerja dan expiry; tidak memberi akses dashboard. Token mentah tidak disimpan. Kredensial salah mendapat respons generik; rate limit, anti-replay dan CSRF/Origin sesuai alur wajib diuji.
Prioritas dan keterlacakan: Must; BR-004 / US-005. Kriteria uji terinci pada bagian 12.
### FR-010 Idempotency dan hasil tidak pasti
Kebutuhan: Ikat key ke aktor/otoritas transaksi, tindakan dan fingerprint payload. Konsumsi challenge, update presensi, hasil idempotency dan audit dilakukan atomik.
Konsistensi: key sama dengan payload sama mengembalikan hasil sebelumnya; key sama dengan payload berbeda ditolak. Constraint sesi tetap menahan duplikasi dengan key berbeda.
Prioritas dan keterlacakan: Must; BR-005 / US-006. Kriteria uji terinci pada bagian 12.
### FR-011 Pengajuan izin dan sakit
Kebutuhan: Peserta mengirim rentang sesi/tanggal, jenis dan alasan. Cuti tersembunyi sampai kebijakan aktif; bukti unggahan hanya jika diwajibkan.
Batas kebijakan: pending bukan approved. Cuti tidak tampil sebelum hak dan kebijakannya disahkan; bukti unggahan hanya diaktifkan bila diperlukan.
Prioritas dan keterlacakan: Must; BR-006 / US-007. Kriteria uji terinci pada bagian 12.
### FR-012 Keputusan pengajuan
Kebutuhan: Staff Presensi memutuskan izin/sakit dengan alasan dan pemeriksaan versi. Pengajuan yang berkonflik dengan presensi memerlukan resolusi eksplisit; tidak boleh menyetujui pengajuan sendiri.
Prioritas dan keterlacakan: Must; BR-006 / US-008. Kriteria uji terinci pada bagian 12.
### FR-013 Koreksi presensi
Kebutuhan: Peserta mengajukan koreksi atau Staff Presensi membuka kasus bantuan. Keputusan Staff Presensi merekam bukti, nilai sebelum/sesudah dan sumber manual tanpa menghapus event asli.
Prioritas dan keterlacakan: Must; BR-007 / US-009. Kriteria uji terinci pada bagian 12.
### FR-014 Histori peserta
Kebutuhan: Tampilkan presensi, status ketidakhadiran dan bukti transaksi milik sendiri dengan filter dan paginasi.
Prioritas dan keterlacakan: Must; BR-008 / US-010. Kriteria uji terinci pada bagian 12.
### FR-015 Rekap Staff Presensi
Kebutuhan: Staff Presensi membaca rekap berfilter periode/penempatan dan mengekspor .xlsx sesuai filter. Impor .xlsx hanya untuk peserta serta penempatan menggunakan template, validasi seluruh baris, pratinjau dan konfirmasi. Tampilkan nomor baris dan alasan error; impor invalid tidak menulis data. Histori presensi tidak diimpor/ditimpa.
Prioritas dan keterlacakan: Must; BR-008 / US-010. Ekspor memuat identitas, tanggal kerja, jam masuk/pulang, status dan penanda koreksi; tanpa password, token, foto atau URL privat. Impor membuat peserta baru berstatus invited, tanpa password dari Excel; duplikat ditolak dan commit seluruh batch atomik serta diaudit.
### FR-016 Konfigurasi jadwal dan lokasi
Kebutuhan: Staff Presensi mengelola jadwal/lokasi operasional bertanggal efektif sesuai kebijakan disahkan. Super Admin membatasi perubahan konfigurasi sistem. Konfigurasi tidak lengkap memblokir operasi terkait.
Prioritas dan keterlacakan: Must; BR-009 / US-011. Kriteria uji terinci pada bagian 12.
### FR-017 Audit dan tata kelola data
Kebutuhan: Staff Presensi melihat audit operasional dalam mandat; Super Admin mengelola audit sistem, retensi dan penghapusan foto/berkas sesuai kebijakan. Password, token dan isi foto tidak masuk log umum.
Penghapusan: blokir akses foto, hapus berkas fisik sesuai kebijakan dan simpan metadata minimum serta hasil audit. deleted_at saja bukan penghapusan berkas. Terapkan ulang daftar penghapusan setelah restore sebelum akses dibuka.
Prioritas dan keterlacakan: Must; BR-010 / US-012. Kriteria uji terinci pada bagian 12.
### FR-018 Pemulihan dan bantuan
Kebutuhan: Super Admin menjalankan backup, restore dan prosedur insiden. Kegagalan kamera/lokasi ditangani Staff Presensi melalui bantuan/koreksi berjejak; sistem tidak membuat foto atau hasil lokasi palsu.
Prioritas dan keterlacakan: Must; BR-010 / US-012. Kriteria uji terinci pada bagian 12.
### FR-019 Pengelolaan Sistem oleh Super Admin
Super Admin membuat/menonaktifkan akun Staff Presensi dan Super Admin, mencabut sesi serta mengaudit perubahan role. Tidak boleh menghapus/menonaktifkan Super Admin aktif terakhir.
Akun Super Admin awal dibuat melalui proses bootstrap terkontrol tanpa password default dalam repository. Pengelolaan akun petugas tidak tersedia bagi Staff Presensi atau Peserta.
Super Admin mengelola kebijakan teknis, keamanan, monitoring minimum, durasi retensi foto pada Settings, dan operasi pemulihan; perubahan presensi tetap melalui Staff Presensi dan workflow koreksi, bukan bypass database.
### FR-020 Penerapan MVC pada Root Project
Direktori models/, controllers/ dan views/ wajib ada pada root sigma-presensi. React/Vite berjalan dari views/ dan bootstrap Express berada di root.
Controller hanya mengorkestrasi request/respons. Aturan lintas entitas ditempatkan di services/; semua query pg dikelola Model/repository di models/.
View menggunakan API dan tidak membaca environment rahasia atau PostgreSQL. Model tidak mengimpor View/Controller. Pemeriksaan struktur dan dependency menjadi bagian review sebelum rilis.
## 7. Required Pages / UI
URL berikut merupakan rute halaman React, bukan endpoint backend. Tidak ada halaman atau role di luar tiga aktor final. Backend memakai prefix /api/v1; perubahan state dilakukan melalui endpoint terotorisasi, bukan langsung dari halaman.
### 7.1 Halaman Publik dan Peserta PKL & Magang

| URL / Endpoint | Fungsi & Konten Halaman |
| /login | Login semua role; tab Presensi Cepat memakai email/password, aksi masuk/pulang, ambil foto lalu lokasi; tidak membuka dashboard. |
| /activate dan /reset-password | Aktivasi/reset melalui token sekali pakai. Pesan token tidak valid generik; tidak ada registrasi publik bebas. |
| /peserta/dashboard | Ringkasan sesi kerja dan status masuk/pulang, pengajuan aktif serta shortcut presensi. |
| /peserta/presensi | Ambil foto, pratinjau/ulang, deteksi lokasi lalu kirim masuk/pulang; status dan pemulihan transaksi. |
| /peserta/bukti-foto | Pemberitahuan penggunaan foto/lokasi dan daftar bukti milik sendiri sesuai retensi; tidak ada pendaftaran wajah. |
| /peserta/riwayat | Riwayat presensi dan detail bukti milik sendiri; filter periode, label otomatis/manual/koreksi. |
| /peserta/izin | Pengajuan izin/sakit, alasan keputusan, detail dan pembatalan pending; cuti bersyarat kebijakan. |
| /peserta/koreksi | Permintaan koreksi atau bantuan teknis terkait sesi kerja; status keputusan dan riwayat perubahan. |
| /peserta/profil | Profil dan penggantian password; email identitas/role tidak dapat diubah sendiri. |

### 7.2 Staff Presensi Pages

| URL / Endpoint | Fungsi & Konten Halaman |
| /staff/dashboard | Ringkasan kehadiran operasional, pengajuan pending dan sesi tidak lengkap. |
| /staff/peserta | Daftar peserta, aktivasi/nonaktif, periode penempatan dan reset akses peserta terverifikasi. |
| /staff/institut-pendidikan | Kelola daftar institut pendidikan sekolah dan perguruan tinggi. |
| /staff/jadwal-prakerin | Atur jadwal masuk sampai pulang prakerin. |
| /staff/periode-prakerin | Pantau masa periode peserta prakerin. |
| /staff/izin-kehadiran | Atur dan kelola izin kehadiran peserta prakerin. |
| /staff/rekap | Rekap kehadiran per periode/penempatan dengan penelusuran sumber dan koreksi. |

Implementasi halaman Staff Presensi menggunakan pola UI konsisten dengan shell dashboard SIGMA, tabel operasional, filter status/periode, state loading/error/empty, dan action yang dibatasi role. Halaman lokasi menggunakan Leaflet dan OpenStreetMap tiles untuk memilih titik/radius; peserta memakai Browser Geolocation API saat presensi; backend melakukan verifikasi jarak Haversine sebelum menerima transaksi.

### 7.3 Super Admin Pages

| URL / Endpoint | Fungsi & Konten Halaman |
| /super-admin/dashboard | Kesehatan aplikasi dan ringkasan kejadian keamanan; tidak memerlukan dashboard observabilitas kompleks. |
| /super-admin/users | Akun Staff Presensi/Super Admin, role, status, reset terkontrol dan pencabutan sesi. |
| /super-admin/data-governance | Tabel attendance photos, akun peserta, lokasi/waktu, retensi otomatis, dan aksi detail/edit/delete.
| /super-admin/settings | Profil Super Admin dan konfigurasi durasi penghapusan otomatis foto. |

### 7.4 Perilaku UI dan Kontrak API
Loading menunjukkan proses nyata; data kosong bukan error. Kamera/lokasi ditolak, unggah gagal, lokasi di luar radius dan Excel invalid memiliki pesan serta langkah lanjut yang jelas.
Selama kirim, tombol dinonaktifkan, tetapi backend tetap memakai idempotency. Setelah timeout, UI menyatakan hasil belum diketahui dan memulihkan operasi yang sama sebelum mencoba baru.
Tampilkan sukses hanya setelah konfirmasi server. Hentikan stream kamera setelah selesai/batal. Status tidak dibedakan warna saja dan form memiliki label/fokus keyboard.

| Endpoint API Utama | Akses dan Kontrak |
| POST /auth/login; /auth/logout; /auth/activate; /auth/reset | Login/logout/aktivasi/reset; CSRF pada operasi berbasis cookie dan token sekali pakai sesuai alur. |
| POST /attendance/challenges; /public/attendance/challenges | Jalur login memakai sesi; jalur cepat memverifikasi email/password sebelum menerbitkan token transaksi terbatas. |
| POST /attendance/photos; /attendance/check-in; /attendance/check-out | Unggah foto privat terikat challenge; commit memvalidasi foto/lokasi dan Idempotency-Key. Retry sah mengembalikan hasil tersimpan. |
| GET /attendance/operations/{id}; /attendance/me | Hasil operasi dengan otoritas sama; histori hanya milik peserta login. Tidak dapat dibaca hanya dari ID yang ditebak. |
| POST /leave-requests; /corrections; PATCH /admin/.../decision | Peserta membuat pengajuan; Staff Presensi memutuskan dengan alasan dan version check. |
| POST /admin/participants/import/preview; /import/commit; GET /admin/participants/import/template; /admin/reports/export | Staff Presensi: template dan impor .xlsx peserta/penempatan; commit batch tervalidasi. Ekspor rekap sesuai scope/filter, tanpa foto atau rahasia. |
| POST atau PATCH /super-admin/users dan /super-admin/settings | Hanya Super Admin; perubahan role/status/kebijakan diaudit. Staff Presensi tidak dapat meningkatkan kewenangan. |

Base path /api/v1. Respons memuat success, data atau error terstruktur serta requestId. Status utama: 200/201 sukses, 401 sesi tidak valid, 403 akses ditolak, 404 objek tidak tersedia, 409 konflik/idempotency/versi, 413 upload terlalu besar, 422 validasi, 429 rate limit dan 503 layanan tidak tersedia. Detail SQL, token dan stack trace tidak dikirim ke browser.
## 8. Core User Flows
### 8.1 Pendaftaran Peserta dan Aktivasi
Aktor: Staff Presensi dan Peserta. Prasyarat: Staff Presensi login; identitas dan periode peserta tersedia.
## 1. Staff Presensi membuat peserta dan penempatan melalui form atau unggah template .xlsx dengan email unik.
## 2. Server memvalidasi data/duplikasi; impor menampilkan pratinjau serta error per baris sebelum konfirmasi dan commit atomik. Undangan aktivasi diterbitkan setelah data berhasil disimpan.
## 3. Peserta membuka undangan, menetapkan password dan membaca pemberitahuan penggunaan foto/lokasi; akun aktif tanpa pendaftaran wajah.
Alternatif / gagal: Email duplikat, periode invalid atau satu baris impor salah membatalkan seluruh batch. Token aktivasi kedaluwarsa/bekas ditolak. Retry impor memakai identitas batch agar tidak menggandakan akun.
### 8.2 Pengambilan dan Pengelolaan Bukti Foto
Aktor: Peserta dan Staff Presensi. Prasyarat: Akun aktif dan pemberitahuan penggunaan foto tersedia.
## 1. Peserta membaca pemberitahuan dan mencatat persetujuan bila diwajibkan kebijakan.
## 2. Saat masuk/pulang, peserta mengizinkan kamera, mengambil foto dan memeriksa pratinjau; foto dapat diulang sebelum kirim.
## 3. Server memvalidasi gambar, menyimpan berkas privat dan mengikatnya ke peserta, aksi serta sesi kerja. Akses bukti mengikuti kepemilikan dan mandat petugas.
## 4. Foto terhubung ke event hanya setelah presensi berhasil. Berkas sementara/gagal dibersihkan; penghapusan foto terpakai mengikuti retensi tanpa menghapus histori.
Alternatif / gagal: Kamera ditolak, gambar rusak/kosong atau batas unggah terlampaui memblokir presensi. Peserta diberi retry atau jalur bantuan; tidak ada aktivasi template wajah.
### 8.3 Login Logout dan Pemulihan Akun
Aktor: Ketiga role sesuai akun masing-masing. Prasyarat: Akun diizinkan aktif.
## 1. Pengguna login; server memverifikasi password dan role, meregenerasi ID sesi dan mengarahkan ke halaman role yang sesuai.
## 2. Logout membatalkan sesi. Reset Peserta dibantu Staff Presensi; reset akun petugas ditangani Super Admin dengan verifikasi identitas.
## 3. Token reset sekali pakai yang valid mengubah password dan mencabut sesi lama.
Alternatif / gagal: Salah kredensial memberi pesan generik dan rate limit. Email saja tidak cukup untuk reset; token kedaluwarsa/bekas ditolak.
### 8.4 Presensi Masuk dan Pulang Setelah Login
Aktor: Peserta. Prasyarat: Sesi login, penempatan dan sesi kerja aktif; kebijakan lengkap.
## 1. Peserta memilih masuk/pulang; server menentukan identitas, work_session dan challenge untuk aksi tersebut.
## 2. Peserta mengambil foto, lalu browser mendeteksi lokasi. Server memvalidasi gambar, koordinat, akurasi, usia data, geofence dan jadwal.
## 3. Server memeriksa ulang status/versi dan ketersediaan foto privat; event, tautan foto, konsumsi challenge, idempotency dan audit di-commit atomik di PostgreSQL.
## 4. Peserta menerima bukti waktu server; pulang memerlukan masuk pada sesi yang sama.
Alternatif / gagal: Foto gagal, lokasi ditolak/tidak sesuai atau pulang tanpa masuk menolak transaksi. Timeout dipulihkan dengan key dan otoritas sama; berkas yatim dibersihkan tanpa menggandakan presensi.
### 8.5 Presensi Cepat dari Halaman Login
Aktor: Peserta tanpa sesi dashboard. Prasyarat: Email/password valid serta penempatan dan sesi kerja aktif.
## 1. Peserta memasukkan email/password dan memilih masuk/pulang pada tab Presensi Cepat di /login.
## 2. Server memverifikasi kredensial dan menerbitkan token singkat terikat peserta, aksi, sesi kerja serta expiry; tidak membuat sesi dashboard.
## 3. Peserta mengambil foto, lalu mendeteksi lokasi; server memvalidasi berkas, geofence, akurasi, usia data dan jadwal.
## 4. Server memakai otoritas satu transaksi untuk commit dan mengembalikan bukti minimum. Foto tidak menggantikan pemeriksaan kredensial.
Alternatif / gagal: Identitas palsu tidak menerima akses profil. Challenge expired/replay/wrong-action ditolak; retry idempotent memulihkan hasil tersimpan, bukan memberi izin aksi baru.
### 8.6 Pengajuan Izin Sakit dan Keputusan
Aktor: Peserta dan Staff Presensi. Prasyarat: Peserta login; kategori pengajuan yang diizinkan tersedia.
## 1. Peserta memilih sesi/rentang, jenis dan alasan, serta bukti jika diwajibkan.
## 2. Server memeriksa periode dan overlap, lalu menyimpan pending. Peserta dapat membatalkan sebelum diputuskan.
## 3. Staff Presensi memeriksa bukti/konflik dan memberi keputusan dengan alasan serta version check.
## 4. Keputusan tersimpan bersama audit dan proyeksi rekap. Cuti hanya diaktifkan setelah kebijakannya disahkan.
Alternatif / gagal: Pending bukan approved. Rentang invalid ditolak. Dua keputusan bersamaan hanya menghasilkan satu keputusan; konflik dengan hadir tidak ditimpa otomatis.
### 8.7 Koreksi dan Bantuan Teknis
Aktor: Peserta dan Staff Presensi. Prasyarat: Kasus menunjuk sesi kerja dan alasan; event asli dapat belum tersedia.
## 1. Peserta mengajukan koreksi atau Staff Presensi membuka kasus bantuan karena lupa absen/kegagalan perangkat.
## 2. Staff Presensi memverifikasi bukti, memberi keputusan dan alasan; pemohon tidak boleh menyetujui sendiri.
## 3. Persetujuan mencatat nilai sebelum/sesudah dan sumber manual, mempertahankan event asli serta memperbarui rekap dalam transaksi.
Alternatif / gagal: Bukti tidak cukup dapat ditolak. Gagal menulis audit menggagalkan perubahan. Bantuan tidak membuat event kamera/lokasi palsu.
### 8.8 Riwayat Rekap dan Konfigurasi
Aktor: Peserta, Staff Presensi dan Super Admin sesuai lingkup. Prasyarat: Sesi login dan scope objek valid.
## 1. Peserta membaca histori sendiri; Staff Presensi memfilter rekap dan mengekspor .xlsx yang mencakup sumber serta penanda koreksi. Ekspor dicatat tanpa memuat foto atau rahasia akun.
## 2. Staff Presensi mengubah jadwal/lokasi sesuai mandat dengan versi efektif baru.
## 3. Super Admin mengelola akun petugas dan kebijakan teknis; seluruh perubahan sensitif dicatat dan sesi terdampak dicabut.
Alternatif / gagal: Data kosong tampil sebagai keadaan kosong; query gagal dapat diulang. Perubahan konfigurasi tidak menghitung ulang histori secara diam-diam.
### 8.9 Akhir Penempatan Retensi dan Pemulihan
Aktor: Staff Presensi dan Super Admin. Prasyarat: Akhir penempatan atau permintaan penghapusan telah diverifikasi.
## 1. Staff Presensi menonaktifkan akses operasional Peserta yang selesai; sistem mencabut sesi dan challenge.
## 2. Super Admin menjalankan retensi foto/berkas privat dan merekam hasil tanpa memasukkan isi foto ke audit.
## 3. Super Admin menguji restore di lingkungan terisolasi, memeriksa relasi/skema dan menerapkan ulang daftar penghapusan sebelum layanan dibuka.
Alternatif / gagal: Proses gagal menjadi tugas tindak lanjut; data tidak dinyatakan terhapus sebelum hasil diverifikasi. Target pemulihan dan masa retensi masih perlu ditetapkan.
### 8.10 Ringkasan Status

| Objek | Transisi Utama |
| Akun / penempatan | Invited → Active → Inactive / Ended. Histori tidak dihapus hanya karena akses berakhir. |
| Bukti foto | Temporary → Available → Deleted; upload gagal/yatim dibersihkan; metadata minimum tetap untuk histori. |
| Presensi | Not started → Open → Complete; sesi tanpa pulang dapat Incomplete setelah penutupan. |
| Izin / koreksi | Pending → Approved / Rejected / Cancelled. Revisi keputusan melalui workflow berjejak. |
| Challenge | Issued → Consumed / Expired / Revoked. Retry idempotent sah memulihkan hasil, bukan aksi baru. |
| Sesi kerja | Planned → Open → Closed → Reconciled; label alpa setelah pemeriksaan izin, koreksi dan jadwal. |

## 9. Data Model / ERD Baseline
Baseline revisi 0.3 merancang 17 tabel PostgreSQL untuk foto dan lokasi. Skema ini merupakan target migrasi, bukan klaim bahwa SQL lama sudah diubah. Tabel template diganti attendance_photos; verification menyimpan challenge dan hasil validasi lokasi. Query tetap melalui pg di models/; hanya tiga role.
Aturan berada pada work_sessions.policy_snapshot; pemberitahuan pada consent_records. Foto disimpan di penyimpanan privat, PostgreSQL hanya menyimpan metadata. Koreksi dan audit mempertahankan histori. Ringkasan batch Excel dicatat pada audit_events; file impor sementara dibersihkan sesuai kebijakan.
### 9.1 Daftar 17 Tabel dan Atribut

| Tabel | Fungsi dan Atribut |
| users | Identitas tiga role. email wajib unik untuk login dan impor; code tidak digunakan pada desain revisi ini. Password berupa hash.Atribut: id, name, email, password_hash, role, status, created_at, updated_at. |
| placements | Periode PKL/magang. participant_user_id menunjuk peserta; staff_user_id menunjuk Staff Presensi penanggung jawab.Atribut: id, participant_user_id, staff_user_id, program_type, institution_name, start_date, end_date, status, created_at, updated_at. |
| location | Lokasi presensi dan riwayat versinya. Perubahan koordinat/radius yang sudah digunakan membuat baris versi baru.Atribut: id, location_code, version, name, latitude, longitude, radius_meters, valid_from, valid_to, created_by, created_at. |
| work_sessions | Sesi kerja konkret per penempatan. location_version_id tetap merupakan nama kolom FK ke location.id. policy_snapshot berisi parameter aturan tervalidasi saat sesi ditetapkan.Atribut: id, placement_id, policy_snapshot, location_version_id, work_date, start_at_utc, end_at_utc, timezone, status, created_at, updated_at. |
| attendance_photos | Metadata bukti foto privat per challenge; satu foto baru untuk setiap aksi. File disimpan di luar direktori publik, bukan BLOB/template.Atribut: id, user_id, verification_id, private_storage_key, mime_type, size_bytes, sha256, captured_at_client, received_at_server, status, retention_until, deleted_at. |
| consent_records | Catatan pemberitahuan/persetujuan dan penarikannya. notice_text menyimpan isi yang ditampilkan; tidak merujuk tabel kebijakan.Atribut: id, user_id, notice_code, notice_version, notice_text, mechanism, status, recorded_at. |
| verification | Challenge satu transaksi dan hasil validasi lokasi server; token mentah tidak disimpan. user_id dan work_session_id wajib.Atribut: id, token_hash, user_id, work_session_id, action, status, latitude, longitude, accuracy_meters, location_captured_at, distance_meters, location_validated_at, expires_at, consumed_at, created_at. |
| attendance_records | Proyeksi presensi terkini untuk satu sesi. Waktu efektif dapat berubah melalui koreksi, tanpa menghapus event asli.Atribut: id, work_session_id, effective_check_in_at, effective_check_out_at, status, version, created_at, updated_at. |
| attandance | Event masuk/pulang asli. verification_id mengikat lokasi dan foto pada challenge yang sama; source membedakan login dan jalur cepat.Atribut: id, attendance_record_id, verification_id, type, source, occurred_at_server, created_at. |
| idempotency_records | Identitas permintaan, fingerprint payload dan referensi hasil untuk retry aman setelah timeout. Tidak menggantikan constraint bisnis.Atribut: id, challenge_id, authority_scope, idempotency_key, request_fingerprint, operation_status, result_reference, response_status, expires_at, created_at, updated_at. |
| absense_request | Pengajuan izin/sakit berdasarkan rentang tanggal. Cuti hanya diaktifkan setelah kebijakannya disahkan.Atribut: id, placement_id, requested_by, start_date, end_date, type, reason, status, version, created_at, updated_at. |
| absense_decisions | Riwayat keputusan Staff Presensi atas pengajuan izin/sakit, terikat request_version. Status pengajuan dan keputusan diperbarui atomik.Atribut: id, absense_request_id, decided_by, request_version, decision, reason, decided_at. |
| correction_request | Permohonan koreksi, usulan waktu, keputusan terakhir, snapshot sebelum/sesudah dan versi record yang diubah. Dapat menunjuk sesi tanpa record presensi.Atribut: id, work_session_id, requested_by, reason, status, version, proposed_check_in_at, proposed_check_out_at, decided_by, decision_reason, decided_at, before_values, after_values, record_version_before, record_version_after, created_at, updated_at. |
| attandance_document | Metadata bukti berkas privat yang opsional. Tepat satu induk: absense_request atau correction_request. File fisik mengikuti kebijakan retensi.Atribut: id, owner_user_id, absense_request_id, correction_request_id, mime_type, size_bytes, private_storage_key, retention_until, created_at. |
| sessions | Sesi autentikasi server yang dapat kedaluwarsa/dicabut. Struktur fisik diselaraskan dengan adapter session library saat implementasi.Atribut: id_hash, user_id, expires_at, revoked_at, created_at. |
| audit_events | Jejak operasional/sistem, akses/penghapusan foto dan batch Excel. safe_changes memuat ringkasan aman, bukan password, token atau isi foto.Atribut: id, actor_user_id, authority_scope, action, entity_type, entity_id, request_id, safe_changes, occurred_at. |
| account_tokens | Token sekali pakai untuk aktivasi/reset password. user_id adalah akun tujuan; issued_by adalah petugas penerbit.Atribut: id, user_id, issued_by, token_hash, purpose, expires_at, consumed_at, revoked_at, created_at. |

### 9.2 ERD per Kelompok Data
Diagram berikut membagi relasi utama menjadi empat kelompok agar terbaca. Seluruh kelompok berada dalam satu database. Arah panah menunjukkan FK dari tabel anak menuju tabel induk. Uraian pada bagian 9.3 melengkapi kardinalitas dan relasi pelaku yang tidak digambar berulang.
A. Penempatan, lokasi dan presensi
B. Foto, validasi lokasi dan retry
C. Pengajuan, keputusan dan dokumen
D. Akun, pemberitahuan dan audit
### 9.3 Kardinalitas, Foreign Key dan Kepemilikan
users sebagai peserta memiliki 0..N placements; setiap placement wajib memiliki satu peserta dan satu Staff Presensi penanggung jawab. FK menjamin akun ada; role dan mandat diperiksa backend.
placements memiliki 0..N work_sessions dan absense_request. location memiliki 0..N work_sessions. Satu sesi wajib menunjuk satu penempatan dan satu versi lokasi.
work_sessions memiliki 0..1 attendance_records. Satu record memiliki 0..2 attandance, dibatasi dua jenis unik: check_in dan check_out. Pulang memerlukan masuk pada sesi yang sama.
users memiliki 0..N attendance_photos. Setiap foto wajib menunjuk satu pemilik dan satu verification; verification_id unik. Satu verification memiliki 0..1 foto. Tidak ada template atau versi model pengenalan identitas.
verification wajib menunjuk satu users dan satu work_sessions; aksi hanya check_in/check_out. Pemilik harus cocok dengan peserta pada penempatan. Latitude, longitude, accuracy_meters, location_captured_at dan hasil validasi diikat ke challenge yang sama.
verification memiliki 0..1 attandance melalui verification_id unik dan 0..N idempotency_records melalui challenge_id. Event sukses wajib memiliki foto tersedia dan lokasi valid pada verification yang sama; foto percobaan gagal dibersihkan.
absense_request memiliki 0..N absense_decisions. requested_by dan decided_by menunjuk users. Pemohon adalah peserta pemilik penempatan; keputusan hanya oleh Staff Presensi yang berwenang dan bukan pemohon sendiri.
work_sessions memiliki 0..N correction_request. requested_by menunjuk peserta atau Staff pembuka kasus; decided_by menunjuk Staff pemberi keputusan. Keputusan terakhir dan before/after berada pada baris yang sama, sedangkan riwayat perubahannya berada pada audit_events.
absense_request dan correction_request masing-masing dapat memiliki 0..N attandance_document. Setiap dokumen wajib menunjuk tepat satu jenis pengajuan. owner_user_id menunjuk users; akses berkas mengikuti kepemilikan pengajuan dan mandat petugas.
users memiliki 0..N sessions, consent_records dan account_tokens. account_tokens.issued_by juga menunjuk users sebagai penerbit. Audit dapat memiliki satu actor_user_id atau otoritas transaksi tanpa akun; entity_type/entity_id adalah referensi logis, bukan FK ke banyak tabel.
### 9.4 Constraint dan Konsistensi Baseline
Unik: users.email; location(location_code, version); attendance_records.work_session_id; attandance(attendance_record_id, type); attandance.verification_id; verification.token_hash; attendance_photos.verification_id; attendance_photos.private_storage_key.
Unik tambahan: idempotency_records(authority_scope, idempotency_key); absense_decisions(absense_request_id, request_version); attandance_document.private_storage_key; sessions.id_hash; account_tokens.token_hash. FK memakai RESTRICT; penghapusan payload foto mempertahankan metadata referensi.
Aturan sesi disimpan pada work_sessions.policy_snapshot. Backend memvalidasi struktur JSON dan menetapkan nilai yang disahkan; perubahan aturan/lokasi tidak menimpa sesi yang sudah digunakan. consent_records menyimpan notice_code, notice_version dan notice_text secara langsung.
Persetujuan correction_request memperbarui keputusan, before_values/after_values, attendance_records dan audit dalam satu transaksi. Periksa version permohonan serta versi record. Perubahan berikutnya tidak menghapus audit lama dan tidak memalsukan event presensi asli.
Commit memeriksa identitas, aksi, expiry, foto tersedia serta hasil validasi lokasi; konsumsi verification, event/proyeksi, idempotency dan audit atomik. Penyimpanan file tidak ikut transaksi SQL: unggah disiapkan dahulu, kegagalan commit memicu cleanup/retry terkontrol.
Identitas unik jadwal masih perlu difinalkan sesuai pola sesi kerja perusahaan. Skema saat ini belum memiliki constraint yang sepenuhnya mencegah duplikasi work_sessions. Jangan menetapkan unik peserta + tanggal apabila beberapa sesi pada hari yang sama diizinkan.
Waktu disimpan UTC; work_date mengikuti zona operasional. Rekap menggabungkan jadwal, presensi, izin dan koreksi. Nonaktif akun tidak menghapus histori; retensi foto dan metadata dipisah. Impor Excel tidak mengubah event presensi atau keputusan bisnis.
## 10. Database Rules
- **DB-001 Relasi dan Role: Gunakan PostgreSQL dan foreign key. users.role hanya menerima peserta, staff_presensi, super_admin. Validasi aplikasi dan constraint database saling melengkapi; jangan mengandalkan tampilan menu.**
- **DB-002 Presensi Unik: Unik attendance_records.work_session_id dan (attendance_record_id, type). Jangan menetapkan unik peserta + tanggal karena beberapa sesi dapat terjadi pada hari yang sama.**
- **DB-003 Waktu Server dan Tanggal Kerja: Simpan waktu UTC dengan konvensi driver/database yang sama. work_date berasal dari zona operasional/sesi, bukan tanggal perangkat atau DATE(timestamp UTC) saja. Zona kantor dan aturan lintas hari perlu disahkan.**
- **DB-004 Commit Atomik: Validasi dan penyimpanan foto privat dilakukan sebelum transaksi SQL. Commit memeriksa status, sesi, expiry, lokasi serta foto tersedia; event/proyeksi, konsumsi challenge, idempotency dan audit atomik. File yatim dibersihkan bila transaksi gagal.**
- **DB-005 Idempotency dan Konkurensi: Scope key pada otoritas transaksi dan fingerprint payload. Key sama/payload sama mengembalikan hasil asli; beda payload menghasilkan konflik. Key berbeda tetap terkena constraint bisnis. Deadlock ditangani retry terbatas tanpa menggandakan.**
- **DB-006 Pulang dan Koreksi: Pulang memerlukan masuk pada sesi yang sama. Koreksi menyimpan nilai sebelum/sesudah dan sumber manual tanpa menghapus event asli; alasan serta Staff Presensi pemberi keputusan wajib ada.**
- **DB-007 Pengajuan dan Versi: Pending tidak sama dengan approved. Periksa overlap dan konflik dengan hadir dalam mekanisme terkontrol; version check mencegah dua keputusan final serentak. Perubahan konfigurasi efektif tidak mengubah histori otomatis.**
- **DB-008 Foto dan Lokasi: verification mengikat peserta, aksi, sesi, koordinat, akurasi, usia data dan hasil geofence server. Event sukses wajib memiliki satu foto privat tersedia melalui verification yang sama. Flag client bukan keputusan server; token tidak bisa dipakai ulang untuk aksi baru.**
- **DB-009 Foto dan Retensi: Simpan metadata foto pada attendance_photos dan file di luar direktori publik. Terapkan otorisasi, enkripsi penyimpanan/backup, retensi dan penghapusan fisik terverifikasi. Metadata minimum tetap ada untuk histori; tidak ada pencocokan identitas dari foto.**
- **DB-010 Audit dan Penghapusan: Audit append-only tidak memuat password, token atau isi foto. Nonaktif akun berbeda dari penghapusan. Restore menerapkan ulang daftar penghapusan agar berkas yang dihapus tidak kembali dapat diakses.**
- **DB-011 Index dan Query: Mulai dari index (placement_id, work_date), (placement_id, status, start_date) pada pengajuan dan (entity_type, entity_id, occurred_at) pada audit. Validasi EXPLAIN/query nyata sebelum menambah index. Semua nilai memakai parameter binding; sort/identifier memakai allowlist.**
- **DB-012 Migrasi, Akses dan Excel: Migrasi berversi; akun runtime terpisah dari migrasi. Impor peserta/penempatan memakai parameter binding, validasi email unik dan transaksi seluruh batch. Role dibatasi peserta dan status invited; impor tidak menimpa histori/akun petugas. Ekspor mengikuti scope dan dicatat di audit.**
## 11. Non-Functional Requirements
### 11.1 Security dan Data Protection
Session: rekomendasi cookie HttpOnly, Secure pada HTTPS, SameSite sesuai alur diuji dan server-side store PostgreSQL. Regenerasi setelah login; cabut setelah logout/reset/nonaktif. MemoryStore development tidak digunakan pada production [S5][S7].
CSRF dan CORS: mutasi berbasis cookie menggunakan token CSRF dan pemeriksaan Origin; SameSite adalah tambahan [S6]. Satu origin usulan tidak perlu CORS lintas domain. Bila origin terpisah, gunakan allowlist eksplisit dan uji cookie/credentials; CORS bukan otorisasi.
Input dan akses: validasi skema, ukuran/MIME upload, parameterized query, pembatasan akses objek dan rate limit pada login/reset/jalur cepat. Simpan password hash adaptif melalui library yang direview, bukan password asli.
Akses sistem: Super Admin memerlukan autentikasi ulang untuk operasi sensitif dan audit perubahan role. Staff Presensi tidak dapat meningkatkan role; aktivitas koreksi tidak boleh dilewati lewat dashboard sistem.
### 11.2 Keandalan Foto Lokasi dan Excel
Uji kamera depan, pratinjau, pengambilan ulang dan unggah pada perangkat sasaran. Server memeriksa byte gambar, MIME, dimensi dan batas ukuran; nama file serta metadata client bukan bukti keaslian. Foto digunakan sebagai dokumentasi, bukan autentikasi [S10].
Uji lokasi ditolak, timeout, koordinat tidak valid, akurasi rendah, data lama dan di luar radius. Browser/GPS dapat dimanipulasi; pemeriksaan server mengurangi kesalahan tanpa menjamin keberadaan fisik mutlak. Staff memeriksa bukti bila ada sengketa.
Excel hanya .xlsx dengan template berversi. Batasi ukuran, jumlah baris dan hasil dekompresi; tolak formula, macro, tautan eksternal dan kolom tak dikenal. Pratinjau tidak menulis data; commit memvalidasi ulang. Ekspor menulis input pengguna sebagai teks literal agar tidak dieksekusi sebagai formula [S11][S12].
### 11.3 Usability Performance dan Maintainability
Responsiveness: target awal viewport 360 px sampai desktop; uji HP nyata, navigasi keyboard, label form dan status yang tidak bergantung warna. Daftar browser final perlu dikonfirmasi.
Camera dan location: izin pengguna serta secure context diperlukan [S8][S9]. localhost pada laptop tidak membuktikan akses kamera melalui IP LAN di HP; lingkungan uji mobile perlu HTTPS yang dipercaya.
Performance: ukur p50/p95 API, durasi unggah foto, validasi lokasi, impor dan ekspor Excel serta beban bersamaan. Batas ukuran/baris dan target latensi ditetapkan sebelum pilot berdasarkan perangkat dan kapasitas hosting.
MVC maintainability: root wajib models/controllers/views; pisahkan service, middleware dan migrasi; cegah import silang View–Model. Build/typecheck frontend dan backend terpisah, disertai lockfile serta dokumentasi.
Observability: request ID, kode error dan latensi cukup untuk penelusuran tanpa membocorkan wajah, session ID atau password. Kegagalan layanan tidak menghasilkan sukses palsu.
### 11.4 Deployment Backup dan Governance
Super Admin menjalankan prosedur rilis dan pemulihan. Production menggunakan hasil build, HTTPS dan proses Node yang diawasi; domain/hosting belum dipilih. Rahasia di luar Git dan View; akses PostgreSQL dibatasi. Migrasi diuji bersama backup pra-rilis, smoke test dan rencana rollback yang membedakan kode dari skema.
RPO/RTO serta retensi backup perlu disepakati. Restore terisolasi mencakup skema, relasi, foto/berkas privat dan daftar penghapusan. Kegagalan kamera/lokasi diarahkan ke bantuan/koreksi. Perusahaan menetapkan pemberitahuan, persetujuan bila diperlukan dan retensi foto sebelum data nyata dipakai.
### 11.5 Referensi Teknis
Referensi mendukung prinsip teknis; bukan penetapan kebijakan perusahaan. Referensi dasar dipertahankan; rujukan unggahan dan Excel ditambahkan untuk revisi 0.3. Versi library dikunci saat implementasi.
[S1] Vite — Getting Started dan Server Options
https://vite.dev/guide/ ; https://vite.dev/config/server-options.html#server-proxy
[S2] Express — Production Best Practices Security
https://expressjs.com/en/advanced/best-practice-security/
[S3] PostgreSQL documentation
https://www.postgresql.org/docs/current/
[S4] pg — Quickstart
https://sidorares.github.io/node-pg/docs
[S5] OWASP — Session Management Cheat Sheet
https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
[S6] OWASP — Cross Site Request Forgery Prevention
https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
[S7] Express — Session Middleware
https://expressjs.com/en/resources/middleware/session/
[S8] MDN — MediaDevices getUserMedia
https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
[S9] MDN — Geolocation API
https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
[S10] OWASP — File Upload Cheat Sheet
https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
[S11] OWASP — CSV Injection (prinsip keamanan formula spreadsheet)
https://owasp.org/www-community/attacks/CSV_Injection
[S12] Microsoft — Excel file formats
https://support.microsoft.com/en-us/office/file-formats-that-are-supported-in-excel-0943ff2c-6014-4e8d-aaea-b83d51d46247
## 12. Acceptance Criteria MVP
Kriteria berikut menjadi gerbang UAT MVP. AC-001 sampai AC-020 mengacu FR dengan nomor yang sama, termasuk foto/lokasi dan Excel pada AC-015. Semua butir positif/negatif harus lulus; tiga role dan root MVC tetap wajib.
### AC-001 Registrasi dan aktivasi
Peserta valid diaktifkan satu kali.
Email peserta duplikat ditolak.
Token bekas/kedaluwarsa tidak dapat dipakai.
Pesan tidak membocorkan status akun.
### AC-002 Penempatan dan status peserta
Peserta di luar periode/nonaktif tidak dapat presensi.
Histori tidak hilang.
Perubahan periode tercatat dan tidak mengubah histori tanpa rekonsiliasi.
### AC-003 Login logout dan sesi
Login benar memberi sesi baru.
Salah login memberi pesan generik.
Sesi lama setelah logout ditolak.
Sesi tidak aktif/kedaluwarsa tidak dapat melakukan mutasi.
### AC-004 Hak akses dan pemulihan akun
Peserta A tidak membaca/mengubah data B.
Staff Presensi tidak mengubah role petugas.
Reset kedaluwarsa ditolak dan reset berhasil membatalkan sesi lama.
### AC-005 Pengambilan dan Penyimpanan Foto
Foto kosong, rusak, format tidak didukung atau melebihi batas ditolak.
Foto peserta lain tidak dapat ditautkan atau diakses di luar kewenangan.
Peserta dapat mengambil ulang sebelum kirim; masuk dan pulang membutuhkan foto baru.
Foto tersimpan privat dan terikat aksi/sesi; kegagalan penyimpanan mencegah sukses. Tidak ada proses pendaftaran atau pencocokan wajah.
### AC-006 Deteksi dan Validasi Lokasi
Koordinat invalid, lama, akurasi di luar batas atau di luar radius menolak presensi.
Flag client yang mengaku lokasi valid tidak melewati perhitungan server.
Alasan aman ditampilkan.
### AC-007 Presensi masuk
Masuk valid menghasilkan bukti.
Tidak ada sesi kerja atau peserta nonaktif ditolak.
Masuk kedua pada sesi sama tidak membuat baris tambahan.
### AC-008 Presensi pulang
Pulang valid melengkapi sesi.
Tanpa masuk ditolak.
Pulang kedua tidak menambah catatan.
Lintas hari tetap terikat sesi jika kebijakannya diaktifkan.
### AC-009 Presensi dari halaman login
Berhasil tidak menghasilkan sesi dashboard.
Token tidak bisa digunakan ulang atau untuk peserta/tindakan lain.
Kredensial salah atau foto/lokasi tidak valid menolak presensi cepat.
Identitas tidak valid mendapat pesan generik.
### AC-010 Idempotency dan hasil tidak pasti
Key sama/payload sama mengembalikan hasil asli.
Payload berbeda menghasilkan 409.
Key berbeda untuk masuk sama tetap tidak menggandakan.
Timeout pascacommit dapat dipulihkan.
### AC-011 Pengajuan izin dan sakit
Rentang terbalik/di luar penempatan dan konflik ditolak.
Pengajuan baru pending.
Pending tidak meniadakan kewajiban presensi.
Akses hanya pada milik sendiri.
### AC-012 Keputusan pengajuan
Dua keputusan serentak hanya satu berlaku.
Staff Presensi tak berwenang ditolak.
Perubahan status dan audit atomik.
Penolakan memuat alasan yang terlihat peserta.
Pemohon tidak dapat menyetujui pengajuan sendiri; perubahan keputusan mengikuti koreksi berversi.
### AC-013 Koreksi presensi
Alasan wajib.
Koreksi disetujui memperbarui proyeksi rekap dan menyimpan versi.
Kegagalan audit menggagalkan mutasi.
Koreksi ditolak tidak mengubah catatan.
### AC-014 Histori peserta
Histori hanya milik sesi pengguna.
Tidak ada data memakai keadaan kosong.
Timeout menyediakan retry tanpa perubahan.
Label manual/koreksi terlihat.
### AC-015 Rekap dan Impor Ekspor Excel
Rekap dan ekspor .xlsx sesuai dataset UAT, filter periode/penempatan dan penanda koreksi; tanpa foto, password atau token.
Impor template .xlsx peserta/penempatan menampilkan pratinjau serta nomor baris/alasan error; duplikat email dalam file/database ditolak.
Satu baris invalid, formula, format salah atau batas file/baris terlampaui menolak seluruh batch; tanpa perubahan data sebelum konfirmasi.
Commit impor atomik, retry tidak menggandakan data dan audit mencatat hasil; peserta/staff di luar mandat ditolak. Histori presensi tidak ditimpa.
### AC-016 Konfigurasi jadwal dan lokasi
Koordinat/radius tidak valid ditolak.
Perubahan menghasilkan versi dan audit.
Histori memakai versi lama.
Tidak ada jadwal yang dibuat dari tebakan browser.
### AC-017 Audit dan tata kelola data
Setiap mutasi sensitif memiliki aktor/waktu/alasan.
Pengguna biasa tidak membaca audit.
Penghapusan mencabut akses dan menghapus file foto; metadata/audit minimum tetap tanpa isi foto.
### AC-018 Pemulihan dan bantuan
Restore pada lingkungan terisolasi memulihkan data terkait dan skema.
Super Admin memeriksa penghapusan/retensi sebelum layanan dibuka.
Bantuan dicatat manual/koreksi tanpa membuat foto atau hasil lokasi palsu.
### AC-019 Tiga Role dan Kendali Super Admin
Database dan backend hanya menerima role peserta, staff_presensi dan super_admin; payload role lain ditolak.
Peserta tidak dapat mengakses endpoint Staff Presensi/Super Admin; Staff Presensi tidak dapat mengubah role akun petugas.
Super Admin dapat mengelola akun petugas dengan audit, tetapi tidak mengubah presensi langsung atau menonaktifkan Super Admin aktif terakhir.
### AC-020 Root Project MVC
Root sigma-presensi berisi models/, controllers/ dan views/; views/ memuat React/Vite dan root menjalankan Express/TypeScript.
Review dependency membuktikan View hanya memakai API, Model tidak mengimpor View/Controller, dan query pg tidak tersebar di komponen React/controller.
Build dan pemeriksaan TypeScript backend mengecualikan views/; build frontend menghasilkan views/dist/ tanpa rahasia backend.
### 12.1 Gerbang Penerimaan Lintas Fitur
Uji paralel dengan key sama/berbeda dan timeout sebelum/pascacommit menghasilkan satu catatan sesuai aturan.
Rekap cocok dengan jadwal, presensi, izin approved, sesi tidak lengkap dan koreksi pada sampel UAT; tidak menghitung izin dan hadir sebagai dua hari.
Uji kamera/lokasi mencakup HP nyata dan gangguan jaringan; uji Excel mencakup template, duplikat, formula, batas file, rollback serta hasil rekap yang sesuai filter.
Seluruh uji akses lintas peserta/role, CSRF dan pencabutan sesi lulus. Restore terisolasi memulihkan skema/data dan menerapkan ulang penghapusan.
Kebijakan waktu/lokasi, pengajuan, foto, durasi retensi pada Settings, penghapusan otomatis, dan batas impor/ekspor telah disahkan sebelum pilot data nyata.
### 12.2 Keputusan Terbuka Sebelum Pilot

| Prioritas | Keputusan yang Dibutuhkan |
| 1 | Nama petugas yang mengisi tiga role, mandat Staff Presensi, dan prosedur konflik kepentingan/eskalasi. |
| 2 | Jumlah peserta aktif, beban bersamaan dan perangkat/browser sasaran. |
| 3 | Zona waktu, jam kerja, toleransi, libur, shift dan aturan lintas tengah malam. |
| 4 | Koordinat kantor, radius, akurasi/usia sampel dan kebijakan WFH/tugas luar bila ada. |
| 5 | Penggunaan jalur cepat dengan email/password dan token satu transaksi pada HP pribadi atau perangkat bersama. |
| 6 | Standar foto bukti, batas ukuran/usia capture, perangkat dan jalur bantuan kamera/lokasi. |
| 7 | Jenis izin/sakit, tenggat, bukti dan hak cuti peserta bila ada. |
| 8 | Penanggung jawab data, pemberitahuan/persetujuan serta retensi dan penghapusan foto termasuk backup. |
| 9 | Hosting/domain, pengelolaan rahasia, RPO/RTO serta jadwal backup dan pemeliharaan. |
| 10 | Template/kolom Excel, batas file/baris, baseline rekap serta pemberi keputusan peluncuran. |

## 13. Future Enhancements
Pengembangan setelah MVP hanya diprioritaskan setelah kebutuhan bisnis terverifikasi. Tidak menambah role di luar tiga aktor final tanpa perubahan kebutuhan yang disetujui.
Cuti sesuai kebijakan: aktifkan jenis, hak dan kuota jika perusahaan menetapkannya untuk peserta; jangan menyalin hak pegawai otomatis.
Jadwal dan penugasan lebih kompleks: shift berganda, WFH atau tugas luar dengan aturan lokasi/approval yang eksplisit.
Ekspor dan integrasi lanjutan: impor peserta/penempatan dan ekspor rekap .xlsx sudah masuk MVP. CSV, integrasi HR atau format tambahan dievaluasi setelah kebutuhan terverifikasi.
Notifikasi: pengingat atau kanal email setelah kebutuhan operasional dan biaya pemeliharaan jelas.
Pengelolaan bukti foto: optimasi kompresi, penyimpanan dan retensi berdasarkan pilot tanpa menghilangkan keterbacaan bukti atau menambah identifikasi otomatis.
Kiosk terawasi: kajian perangkat bersama dan autentikasi peserta terpisah bila dibutuhkan; bukan pengenalan identitas dari foto.
Aplikasi mobile/offline: hanya bila keterbatasan web terbukti; memerlukan kajian sinkronisasi, replay dan kebijakan waktu yang berbeda.
Operasi dan kapasitas: tuning query/index dan observabilitas berdasarkan beban nyata. Tidak menambah microservices atau infrastruktur kompleks hanya untuk mengikuti tren.
Product Requirements Document — SIGMAVersi 0.4 · 20 November 2026 · Status Draft / MVPPT. Vaiotech Lintas NusantaraRoot MVC · React + Vite + TypeScript · Node.js + Express · PostgreSQL · pg





