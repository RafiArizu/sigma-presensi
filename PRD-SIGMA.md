# PRD-SIGMA — Instruksi AI Agent

> Dokumen ini dikonversi dari `PRD-SIGMA.docx`. Isi berikut menjadi sumber kebutuhan produk dan batasan implementasi SIGMA.
> Instruksi eksekusi AI Agent harus tetap mengikuti permintaan pengguna dan aturan repository; PRD ini adalah konteks produk, bukan perintah untuk mengabaikan instruksi yang lebih tinggi.

# PRODUCT REQUIREMENTS DOCUMENT

## SIGMA — Sistem Presensi PKL dan Magang Vaiotech

**Versi: 0.2  |  Status: Draft / MVP  |  Platform: Web Application**  
**Teknologi: React · Vite · TypeScript · Node.js · Express · MySQL · mysql2**  
**Target Pengguna: Staff Presensi (Admin), Peserta PKL & Magang (User), Super Admin**  
**Arsitektur: MVC pada root proyek  |  Perusahaan: PT. Vaiotech Lintas Nusantara**  
Dokumen ini mendefinisikan kebutuhan produk, fitur, halaman, tiga aktor, alur presensi wajah dan lokasi, arsitektur MVC, model data, aturan database, serta acceptance criteria untuk aplikasi SIGMA.

## 1. Product Overview

SIGMA (Sistem Identifikasi dan Pengelolaan Magang serta Absensi) adalah aplikasi web responsif untuk mencatat presensi peserta PKL dan magang di PT. Vaiotech Lintas Nusantara. Presensi masuk dan pulang menggunakan verifikasi wajah serta pemeriksaan lokasi, baik setelah login maupun dari halaman login tanpa membuka dashboard.

Aplikasi dikembangkan satu orang dan melayani satu perusahaan pada MVP. Kamera mengambil sampel; mesin face recognition memverifikasi identitas. Foto tersimpan saja bukan verifikasi wajah. Browser tidak berwenang menentukan bahwa wajah cocok, peserta hadir, atau lokasi valid.

Keputusan final pemilik proyek: tiga role pada bagian 3, stack pada bagian 4, dan konsep MVC langsung pada root proyek. Rekomendasi: verifikasi 1:1, sesi server, pendaftaran peserta oleh Staff Presensi, serta operasi online. Perlu konfirmasi: kebijakan waktu/lokasi, cuti, retensi data wajah, kapasitas dan hosting production.

Revisi 0.2 tanggal 12 November 2026 menggantikan struktur PRD 0.1 dengan 13 bagian sesuai daftar isi. Dokumen berstatus draft untuk validasi pemilik proyek; belum menyatakan persetujuan operasional perusahaan. Angka kebijakan yang belum diberikan tidak ditetapkan sebagai fakta.

## 2. Product Goals

- Presensi yang dapat ditelusuri: satu bukti masuk dan pulang per sesi kerja, dengan identitas, waktu server, lokasi, versi kebijakan dan hasil verifikasi yang konsisten.
- Akses cepat dengan kontrol identitas: peserta dapat presensi dari halaman login tanpa menerima akses dashboard atau histori secara otomatis.
- Administrasi yang jelas: Staff Presensi menangani peserta, jadwal, izin/sakit, koreksi dan rekap; Super Admin mengelola akun petugas, konfigurasi sistem, keamanan dan pemulihan.
- Rekap yang dapat diperiksa: data hadir, izin disetujui, sesi belum lengkap dan koreksi dapat dijelaskan dari sumber datanya, bukan perubahan manual tanpa jejak.
- Pemeliharaan realistis: root MVC memisahkan View, Controller dan Model dengan TypeScript, migrasi SQL berversi, pengujian dan dokumentasi untuk satu pengembang.
- Ukuran keberhasilan yang terukur: ukur duplikasi, keberhasilan tugas pada HP, waktu penyusunan rekap, kesalahan wajah, serta hasil restore selama pilot. Baseline, target kapasitas, SLA dan batas PoC masih perlu disetujui.
## 3. Actors and Roles

Hanya tiga role berikut yang digunakan. Nilai role disimpan sebagai peserta, staff_presensi, atau super_admin; tidak ada role keempat untuk aktivitas operasional sistem.

| Aktor | Peran | Kebutuhan Utama |
| --- | --- | --- |
| Staff Presensi (Admin) | Pengelola operasional presensi | Mendaftarkan/menonaktifkan peserta dan penempatannya, memvalidasi enrollment, mengelola jadwal/lokasi sesuai mandat, memutuskan izin/koreksi, dan melihat rekap serta audit operasional. |
| Peserta PKL & Magang (User) | Pengguna presensi | Mengaktifkan akun, mendaftarkan wajah, presensi masuk/pulang, mengajukan izin/sakit atau koreksi, melihat riwayat sendiri dan memperbarui kredensial sendiri. |
| Super Admin | Pengelola sistem | Mengelola akun Staff Presensi dan Super Admin, kebijakan sistem dan keamanan, audit sistem, pencabutan akses, backup/restore, retensi serta penghapusan data sesuai kebijakan yang disahkan. |

### 3.1 Batas Kewenangan

| Operasi | Staff Presensi | Peserta | Super Admin |
| --- | --- | --- | --- |
| Presensi otomatis | Tidak menyamar sebagai peserta | Diri sendiri | Tidak menyamar sebagai peserta |
| Peserta dan penempatan | Kelola dalam mandat | Baca milik sendiri | Kelola akses/eskalasi sistem |
| Enrollment wajah | Verifikasi identitas dan aktivasi | Ajukan sampel sendiri | Kebijakan/revocation; bukan unduh massal |
| Izin dan koreksi | Putuskan dengan alasan/audit | Ajukan/baca/batalkan pending sendiri | Tidak otomatis menjadi pemberi keputusan bisnis |
| Jadwal dan lokasi kantor | Kelola sesuai kebijakan disahkan | Baca jadwal relevan | Konfigurasi sistem dan pembatasan perubahan |
| Akun Staff dan Super Admin | Tidak | Tidak | Kelola; tidak boleh menonaktifkan Super Admin aktif terakhir |
| Audit dan restore | Audit operasional terbatas | Tidak membaca audit sistem | Audit sistem dan operasi pemulihan |

Backend menegakkan role dan kepemilikan objek pada setiap request. Kewenangan tinggi tidak membolehkan mengubah presensi tanpa workflow koreksi. Tidak ada pengajuan yang boleh disetujui sendiri; bila ada konflik kepentingan, penanggung jawab perusahaan menetapkan petugas pengganti dari role yang tersedia.

## 4. Technology Stack

| Komponen | Teknologi & Keterangan |
| --- | --- |
| Programming Language | TypeScript untuk frontend dan backend; runtime development Node.js 24. |
| Frontend & Build Tool | React + Vite untuk SPA. React adalah View pada arsitektur MVC SIGMA; Vite berjalan dari direktori views/. |
| Styling | CSS Modules untuk komponen dan CSS global untuk reset, tipografi serta token desain. |
| Backend Framework | Node.js + Express + TypeScript. Routes dan middleware meneruskan request ke Controller; aturan bisnis berada pada service; akses SQL melalui Model. |
| Primary Database | MySQL dengan InnoDB. Laragon menjalankan MySQL lokal; penyedia/konfigurasi production belum ditetapkan. |
| Database Driver | mysql2 Promise API, connection pool, parameter binding dan transaksi. Tidak memakai ORM. |
| Authentication & Authorization | Rekomendasi sesi server dengan cookie dan session store MySQL; tiga role tetap. Library sesi dipilih saat implementasi dan tidak menambah role. |
| Face Recognition | Verifikasi 1:1 direkomendasikan. Model/library, liveness, runtime dan threshold dipilih setelah PoC, bukan dianggap sudah final. |
| Tooling | npm, Git, lockfile dan migrasi SQL. Satu repository sigma-presensi; Docker, Next.js dan Tailwind tidak digunakan. |

Catatan MVC: root proyek wajib memiliki models/, controllers/, dan views/. React/Vite ditempatkan pada views/; Model dan Controller berjalan di server Express. Struktur ini menggantikan pemisahan folder root frontend/ dan backend/ pada rancangan awal. Dua proses development tetap ada, tetapi berada dalam satu repository.

### 4.1 Root Project dengan Konsep MVC

| Path pada root sigma-presensi | Tanggung Jawab |
| --- | --- |
| models/ | Entitas domain, tipe data dan query/repository mysql2. Contoh: UserModel, AttendanceModel, LeaveRequestModel. Tidak mengimpor View atau Controller. |
| controllers/ | Menerima input HTTP tervalidasi, membaca identitas server, memanggil service/Model, dan mengembalikan DTO/respons. Tidak merender atau mempercayai logika React. |
| views/ | Root aplikasi React + Vite dengan package.json, index.html, vite.config.ts dan src/. Berisi pages/, components/, api/, styles/ serta App.tsx dan main.tsx. |
| routes/ dan middlewares/ | Pemetaan endpoint, autentikasi, otorisasi, CSRF, validasi, rate limit dan penanganan error. |
| services/ dan adapters/ | Aturan presensi, transaksi lintas Model, idempotency, integrasi mesin wajah dan kontrol kebijakan. Mendukung MVC, bukan menggantikan Model/Controller. |
| config/ dan database/ | Validasi environment, pool MySQL; database/migrations/ dan seeds/ untuk SQL berversi. Konfigurasi rahasia server tidak berada di views/. |
| tests/ dan docs/ | Pengujian domain/API/integrasi serta PRD, BRD, spesifikasi API dan runbook. |
| app.ts dan server.ts | Bootstrap Express, middleware/routes dan listener Node pada root. package.json dan tsconfig.json root untuk backend serta script orkestrasi development. |
| .env dan .env.example | Environment backend dan contoh tanpa rahasia. File .env tidak masuk Git; variabel VITE_ tidak boleh berisi password MySQL atau kunci wajah. |

Alur dependensi: View mengirim HTTP ke route; middleware memeriksa akses; Controller memanggil service; service menggunakan Model dan adapter; Model mengakses MySQL; hasil dikembalikan sebagai DTO ke View. Controller tidak memuat query SQL tersebar dan React tidak terhubung langsung ke database. Konsep MVC berlaku pada aplikasi secara keseluruhan; React tidak dipaksa menjadi backend MVC tersendiri.

Diagram MVC SIGMA. Seluruh keputusan presensi dan akses data berada di server.

### 4.2 Development dan Production

Development menjalankan Vite dari views/ dan Express dari root. Konfigurasi usulan: browser localhost:5173, Express 127.0.0.1:4000, dan MySQL sesuai port Laragon. Proxy Vite meneruskan /api; proxy tersebut hanya untuk development [S1]. tsconfig backend hanya menyertakan direktori/file server dan mengecualikan views/ agar build frontend/backend tidak tercampur.

Production direkomendasikan satu origin HTTPS yang menyajikan views/dist/ dan meneruskan /api ke Express. Reverse proxy dan pengelola proses belum dipilih. MySQL tidak diekspos ke browser. Build aset dan compile TypeScript menggantikan development server. Library tambahan harus melalui evaluasi kompatibilitas, lisensi dan pemeliharaan.

## 5. Scope MVP

| Area | Termasuk MVP | Di luar MVP |
| --- | --- | --- |
| Authentication | Aktivasi akun terundang, login/logout, reset terkontrol dan tiga role final. | Pendaftaran publik bebas, SSO dan role tambahan. |
| Administrasi Peserta | Data peserta, masa penempatan, status aktif dan enrollment terverifikasi. | Pengelolaan seluruh pegawai dan penilaian/logbook. |
| Presensi | Masuk/pulang dengan lokasi dan wajah, waktu server, bukti serta idempotency. | Offline otomatis dan pelacakan lokasi terus-menerus. |
| Presensi Cepat | Dari halaman login dengan identitas diklaim dan verifikasi 1:1; rilis setelah gerbang PoC. | Identifikasi wajah 1:N tanpa input identitas. |
| Izin & Koreksi | Izin/sakit, keputusan Staff Presensi, koreksi dengan riwayat. | Cuti sebelum hak/kebijakannya ditetapkan; persetujuan banyak tingkat. |
| Laporan | Riwayat sendiri dan rekap operasional berfilter. | Payroll, analitik prediktif dan integrasi HR. |
| System Administration | Super Admin mengelola akun petugas, kebijakan teknis, audit, retensi dan runbook backup/restore. | Dashboard infrastruktur kompleks, microservices, Redis dan Kubernetes. |
| Jadwal & Lokasi | Satu pola jadwal operasional yang disahkan; sesi kerja konkret dan lokasi berversi. | Shift kompleks/WFH/tugas luar tanpa kebijakan yang disetujui. |

Must: seluruh fondasi identitas, presensi, izin/sakit, koreksi, histori/rekap, audit dan operasi aman. Must bersyarat: presensi cepat tetap kebutuhan inti tetapi menunggu penerimaan hasil PoC. Should: filter dan notifikasi dalam aplikasi. Could: ekspor CSV dan pengingat setelah kebutuhan disahkan. Jumlah peserta, deadline dan beban bersamaan belum diberikan.

Urutan implementasi usulan: validasi kebijakan dan PoC → fondasi MVC/database/akses → enrollment dan presensi inti → izin/koreksi/rekap dan jalur cepat → UAT, restore, serta pilot. Gerbang PoC adalah pembuktian teknis, bukan penambahan role atau penghilangan fitur secara sepihak.

## 6. Functional Requirements

ID FR-001 sampai FR-018 mempertahankan keterlacakan PRD sebelumnya; FR-019 dan FR-020 menegaskan pengelolaan Super Admin serta MVC. Perilaku di bawah merupakan rekomendasi implementasi, kecuali tiga role, MVC dan stack yang telah ditetapkan pemilik proyek.

### FR-001 Registrasi dan aktivasi

- Kebutuhan: Staff Presensi membuat peserta dan penempatan serta mengirim undangan aktivasi sekali pakai. Pendaftaran publik terbuka tidak tersedia.
- Prioritas dan keterlacakan: Must; BR-001 / US-001. Kriteria uji terinci pada bagian 12.
### FR-002 Penempatan dan status peserta

- Kebutuhan: Simpan periode penempatan, Staff Presensi dan status. Akhir/nonaktif memblokir transaksi operasional serta membatalkan sesi aktif.
- Prioritas dan keterlacakan: Must; BR-001 / US-001. Kriteria uji terinci pada bagian 12.
### FR-003 Login logout dan sesi

- Kebutuhan: Verifikasi kredensial, regenerasi ID sesi setelah login, batasi percobaan, dan hapus sesi saat logout.
- Prioritas dan keterlacakan: Must; BR-002 / US-002. Kriteria uji terinci pada bagian 12.
### FR-004 Hak akses dan pemulihan akun

- Kebutuhan: Backend memeriksa tiga role dan pemilikan objek. Reset peserta dibantu Staff Presensi dengan verifikasi identitas; reset akun petugas ditangani Super Admin melalui token sekali pakai.
- Prioritas dan keterlacakan: Must; BR-002 / US-002. Kriteria uji terinci pada bagian 12.
### FR-005 Enrollment wajah

- Kebutuhan: Peserta mengajukan enrollment miliknya; Staff Presensi memvalidasi ikatan identitas sebelum aktivasi. Simpan versi template/model dan bukti pemberitahuan/persetujuan sesuai kebijakan; enrollment ulang menonaktifkan versi lama secara atomik.
- Prioritas dan keterlacakan: Must; BR-003 / US-003. Kriteria uji terinci pada bagian 12.
### FR-006 Verifikasi lokasi dan wajah

- Kebutuhan: Server memeriksa koordinat, akurasi, usia sampel dan kebijakan geofence; hasil wajah diproduksi mesin tepercaya dan diikat challenge. Nilai face_match dari browser tidak dipercaya.
- Input tidak tepercaya: nilai face_match, identitas, koordinat dan waktu dari browser harus diperiksa. Threshold, radius, batas akurasi serta usia sampel ditetapkan sebelum pilot; tidak ada jaminan anti-manipulasi mutlak.
- Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-007 Presensi masuk

- Kebutuhan: Gunakan identitas dari sesi, penempatan aktif dan sesi kerja yang sesuai; rekam waktu server serta versi kebijakan.
- Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-008 Presensi pulang

- Kebutuhan: Pulang memerlukan masuk pada sesi yang sama, validasi ulang dan urutan waktu yang benar.
- Prioritas dan keterlacakan: Must; BR-003 / US-004. Kriteria uji terinci pada bagian 12.
### FR-009 Presensi dari halaman login

- Kebutuhan: Identitas yang diklaim diverifikasi 1:1 melalui challenge singkat dan pembuktian wajah; otoritas sementara hanya untuk satu tindakan/sesi kerja.
- Pembatasan jalur cepat: challenge terikat identitas, aksi, sesi kerja dan expiry. Tidak menerbitkan sesi dashboard. Respons awal generik, rate limit, anti-replay dan liveness diuji sebelum rilis.
- Prioritas dan keterlacakan: Must bersyarat gerbang PoC; BR-004 / US-005. Kriteria uji terinci pada bagian 12.
### FR-010 Idempotency dan hasil tidak pasti

- Kebutuhan: Ikat key ke aktor/otoritas transaksi, tindakan dan fingerprint payload. Konsumsi challenge, update presensi, hasil idempotency dan audit dilakukan atomik.
- Konsistensi: key sama dengan payload sama mengembalikan hasil sebelumnya; key sama dengan payload berbeda ditolak. Constraint sesi tetap menahan duplikasi dengan key berbeda.
- Prioritas dan keterlacakan: Must; BR-005 / US-006. Kriteria uji terinci pada bagian 12.
### FR-011 Pengajuan izin dan sakit

- Kebutuhan: Peserta mengirim rentang sesi/tanggal, jenis dan alasan. Cuti tersembunyi sampai kebijakan aktif; bukti unggahan hanya jika diwajibkan.
- Batas kebijakan: pending bukan approved. Cuti tidak tampil sebelum hak dan kebijakannya disahkan; bukti unggahan hanya diaktifkan bila diperlukan.
- Prioritas dan keterlacakan: Must; BR-006 / US-007. Kriteria uji terinci pada bagian 12.
### FR-012 Keputusan pengajuan

- Kebutuhan: Staff Presensi memutuskan izin/sakit dengan alasan dan pemeriksaan versi. Pengajuan yang berkonflik dengan presensi memerlukan resolusi eksplisit; tidak boleh menyetujui pengajuan sendiri.
- Prioritas dan keterlacakan: Must; BR-006 / US-008. Kriteria uji terinci pada bagian 12.
### FR-013 Koreksi presensi

- Kebutuhan: Peserta mengajukan koreksi atau Staff Presensi membuka kasus bantuan. Keputusan Staff Presensi merekam bukti, nilai sebelum/sesudah dan sumber manual tanpa menghapus event asli.
- Prioritas dan keterlacakan: Must; BR-007 / US-009. Kriteria uji terinci pada bagian 12.
### FR-014 Histori peserta

- Kebutuhan: Tampilkan presensi, status ketidakhadiran dan bukti transaksi milik sendiri dengan filter dan paginasi.
- Prioritas dan keterlacakan: Must; BR-008 / US-010. Kriteria uji terinci pada bagian 12.
### FR-015 Rekap Staff Presensi

- Kebutuhan: Staff Presensi membaca rekap dari jadwal, presensi, keputusan izin dan koreksi dalam mandat. Pisahkan sesi terbuka, tidak lengkap, izin disetujui dan alpa setelah rekonsiliasi.
- Prioritas dan keterlacakan: Must; BR-008 / US-010. Kriteria uji terinci pada bagian 12.
### FR-016 Konfigurasi jadwal dan lokasi

- Kebutuhan: Staff Presensi mengelola jadwal/lokasi operasional bertanggal efektif sesuai kebijakan disahkan. Super Admin membatasi perubahan konfigurasi sistem. Konfigurasi tidak lengkap memblokir operasi terkait.
- Prioritas dan keterlacakan: Must; BR-009 / US-011. Kriteria uji terinci pada bagian 12.
### FR-017 Audit dan tata kelola data

- Kebutuhan: Staff Presensi melihat audit operasional dalam mandat; Super Admin mengelola audit sistem, retensi dan penghapusan yang disahkan. Password, token dan template/gambar wajah tidak berada dalam log umum.
- Penghapusan: nonaktifkan akses/template terkait, jalankan retensi yang disetujui, dan terapkan ulang daftar penghapusan setelah restore sebelum akses dibuka.
- Prioritas dan keterlacakan: Must; BR-010 / US-012. Kriteria uji terinci pada bagian 12.
### FR-018 Pemulihan dan bantuan

- Kebutuhan: Super Admin menjalankan backup, restore dan prosedur insiden. Staff Presensi menangani bantuan melalui koreksi berjejak; kegagalan wajah tidak diubah menjadi hasil otomatis yang palsu.
- Prioritas dan keterlacakan: Must; BR-010 / US-012. Kriteria uji terinci pada bagian 12.
### FR-019 Pengelolaan Sistem oleh Super Admin

- Super Admin membuat/menonaktifkan akun Staff Presensi dan Super Admin, mencabut sesi serta mengaudit perubahan role. Tidak boleh menghapus/menonaktifkan Super Admin aktif terakhir.
- Akun Super Admin awal dibuat melalui proses bootstrap terkontrol tanpa password default dalam repository. Pengelolaan akun petugas tidak tersedia bagi Staff Presensi atau Peserta.
- Super Admin mengelola kebijakan teknis, keamanan, monitoring minimum dan operasi pemulihan; perubahan presensi tetap melalui Staff Presensi dan workflow koreksi, bukan bypass database.
### FR-020 Penerapan MVC pada Root Project

- Direktori models/, controllers/ dan views/ wajib ada pada root sigma-presensi. React/Vite berjalan dari views/ dan bootstrap Express berada di root.
- Controller hanya mengorkestrasi request/respons. Aturan lintas entitas ditempatkan di services/; semua query mysql2 dikelola Model/repository di models/.
- View menggunakan API dan tidak membaca environment rahasia atau MySQL. Model tidak mengimpor View/Controller. Pemeriksaan struktur dan dependency menjadi bagian review sebelum rilis.
## 7. Required Pages / UI

URL berikut merupakan rute halaman React, bukan endpoint backend. Tidak ada halaman atau role di luar tiga aktor final. Backend memakai prefix /api/v1; perubahan state dilakukan melalui endpoint terotorisasi, bukan langsung dari halaman.

### 7.1 Halaman Publik dan Peserta PKL & Magang

| URL / Endpoint | Fungsi & Konten Halaman |
| --- | --- |
| /login | Form login semua role; tab Presensi Cepat dengan kode peserta, aksi masuk/pulang, kamera/lokasi dan bukti minimal. Tidak menampilkan profil peserta dari pencarian kode. |
| /activate dan /reset-password | Aktivasi/reset melalui token sekali pakai. Pesan token tidak valid generik; tidak ada registrasi publik bebas. |
| /peserta/dashboard | Ringkasan sesi kerja dan status masuk/pulang, pengajuan aktif serta shortcut presensi. |
| /peserta/presensi | Pengambilan wajah/lokasi, tindakan masuk/pulang, status kirim dan pemulihan hasil transaksi. |
| /peserta/wajah | Pemberitahuan/persetujuan sesuai kebijakan, enrollment sendiri dan status validasi Staff Presensi; tidak menampilkan embedding. |
| /peserta/riwayat | Riwayat presensi dan detail bukti milik sendiri; filter periode, label otomatis/manual/koreksi. |
| /peserta/izin | Pengajuan izin/sakit, alasan keputusan, detail dan pembatalan pending; cuti bersyarat kebijakan. |
| /peserta/koreksi | Permintaan koreksi atau bantuan teknis terkait sesi kerja; status keputusan dan riwayat perubahan. |
| /peserta/profil | Profil yang boleh diubah dan penggantian password; kode identitas/role tidak dapat diubah sendiri. |

### 7.2 Staff Presensi Pages

| URL / Endpoint | Fungsi & Konten Halaman |
| --- | --- |
| /admin/dashboard | Ringkasan kehadiran operasional, pengajuan pending, sesi tidak lengkap dan kasus bantuan. |
| /admin/peserta | Daftar peserta, aktivasi/nonaktif, periode penempatan dan reset akses peserta terverifikasi. |
| /admin/enrollment | Antrian verifikasi identitas/enrollment dan aktivasi versi template setelah pemeriksaan. |
| /admin/jadwal dan /admin/lokasi | Jadwal konkret, tanggal kerja, lokasi kantor dan versi efektif sesuai kebijakan; perubahan diaudit. |
| /admin/izin dan /admin/koreksi | Antrian keputusan, bukti terbatas, alasan, konflik dan pemeriksaan versi. |
| /admin/rekap | Rekap kehadiran per periode/penempatan dengan penelusuran sumber dan koreksi. |
| /admin/audit | Audit operasional peserta, enrollment, pengajuan serta koreksi dalam mandat; tidak membuka rahasia sistem. |

### 7.3 Super Admin Pages

| URL / Endpoint | Fungsi & Konten Halaman |
| --- | --- |
| /super-admin/dashboard | Kesehatan aplikasi dan ringkasan kejadian keamanan; tidak memerlukan dashboard observabilitas kompleks. |
| /super-admin/users | Akun Staff Presensi/Super Admin, role, status, reset terkontrol dan pencabutan sesi. |
| /super-admin/settings | Konfigurasi teknis yang diperbolehkan, batas akses, versi kebijakan dan parameter yang sudah disahkan; rahasia tidak ditampilkan kembali. |
| /super-admin/audit | Audit sistem dan perubahan kewenangan, akses khusus serta hasil proses pemulihan/retensi. |
| /super-admin/data-governance | Status retensi/penghapusan biometrik dan pelaksanaan kebijakan. Tidak ada unduh template massal. |
| /super-admin/operations | Status backup/restore dan runbook; operasi berisiko memerlukan autentikasi ulang. UI tidak memberikan eksekusi shell bebas. |

### 7.4 Perilaku UI dan Kontrak API

- Loading menunjukkan proses nyata; data kosong bukan error. Kamera/lokasi ditolak, wajah tidak cocok, jaringan lambat dan layanan gagal memiliki pesan serta tindakan lanjut yang jelas.
- Selama kirim, tombol dinonaktifkan, tetapi backend tetap memakai idempotency. Setelah timeout, UI menyatakan hasil belum diketahui dan memulihkan operasi yang sama sebelum mencoba baru.
- Tampilkan sukses hanya setelah konfirmasi server. Hentikan stream kamera setelah selesai/batal. Status tidak dibedakan warna saja dan form memiliki label/fokus keyboard.

| Endpoint API Utama | Akses dan Kontrak |
| --- | --- |
| POST /auth/login; /auth/logout; /auth/activate; /auth/reset | Login/logout/aktivasi/reset; CSRF pada operasi berbasis cookie dan token sekali pakai sesuai alur. |
| POST /attendance/challenges; /public/attendance/challenges | Jalur login mengambil identitas dari sesi; jalur publik memakai identitas diklaim dan challenge generik terbatas. |
| POST /attendance/verifications; /attendance/check-in; /attendance/check-out | Hasil mesin tepercaya terikat challenge; commit memakai Idempotency-Key. Retry sah mengembalikan hasil tersimpan. |
| GET /attendance/operations/{id}; /attendance/me | Hasil operasi dengan otoritas sama; histori hanya milik peserta login. Tidak dapat dibaca hanya dari ID yang ditebak. |
| POST /leave-requests; /corrections; PATCH /admin/.../decision | Peserta membuat pengajuan; Staff Presensi memutuskan dengan alasan dan version check. |
| POST /face/enrollments; PATCH /admin/face-enrollments/{id}/decision | Peserta mengajukan sampel; Staff Presensi memvalidasi identitas dan mengaktifkan template secara atomik. |
| POST atau PATCH /super-admin/users dan /super-admin/settings | Hanya Super Admin; perubahan role/status/kebijakan diaudit. Staff Presensi tidak dapat meningkatkan kewenangan. |

Base path /api/v1. Respons memuat success, data atau error terstruktur serta requestId. Status utama: 200/201 sukses, 401 sesi tidak valid, 403 akses ditolak, 404 objek tidak tersedia, 409 konflik/idempotency/versi, 413 upload terlalu besar, 422 validasi, 429 rate limit dan 503 layanan tidak tersedia. Detail SQL, token dan stack trace tidak dikirim ke browser.

## 8. Core User Flows

### 8.1 Pendaftaran Peserta dan Aktivasi

Aktor: Staff Presensi dan Peserta. Prasyarat: Staff Presensi login; identitas dan periode peserta tersedia.

1. Staff Presensi membuat peserta, kode unik dan penempatan yang valid.

2. Server memeriksa duplikasi, menerbitkan undangan sekali pakai dan mencatat audit.

3. Peserta membuka undangan dan menetapkan kredensial; akun aktif tanpa otomatis mengaktifkan wajah.

Alternatif / gagal: Kode duplikat/periode invalid ditolak; undangan kedaluwarsa/bekas tidak dapat digunakan. Retry pengiriman membatalkan token lama.

### 8.2 Enrollment dan Perubahan Wajah

Aktor: Peserta dan Staff Presensi. Prasyarat: Identitas peserta diperiksa; kebijakan penggunaan data telah ditetapkan.

1. Peserta membaca pemberitahuan dan memberi persetujuan bila diwajibkan kebijakan.

2. Server membuka challenge enrollment; browser meminta izin kamera dan mengambil sampel berkualitas.

3. Mesin tepercaya menghasilkan template; Staff Presensi memvalidasi ikatan identitas sebelum aktivasi.

4. Server mengaktifkan versi baru secara atomik, menonaktifkan versi lama dan mencabut challenge terkait.

Alternatif / gagal: Izin ditolak, banyak wajah, sampel buruk atau model gagal tidak mengaktifkan template. Pada enrollment ulang, versi lama tetap berlaku sampai penggantian berhasil.

### 8.3 Login Logout dan Pemulihan Akun

Aktor: Ketiga role sesuai akun masing-masing. Prasyarat: Akun diizinkan aktif.

1. Pengguna login; server memverifikasi password dan role, meregenerasi ID sesi dan mengarahkan ke halaman role yang sesuai.

2. Logout membatalkan sesi. Reset Peserta dibantu Staff Presensi; reset akun petugas ditangani Super Admin dengan verifikasi identitas.

3. Token reset sekali pakai yang valid mengubah password dan mencabut sesi lama.

Alternatif / gagal: Salah kredensial memberi pesan generik dan rate limit. Kode peserta saja tidak cukup untuk reset; token kedaluwarsa/bekas ditolak.

### 8.4 Presensi Masuk dan Pulang Setelah Login

Aktor: Peserta. Prasyarat: Penempatan, wajah dan sesi kerja aktif; kebijakan lengkap.

1. Peserta memilih masuk atau pulang; server menentukan identitas, work_session dan challenge untuk aksi tersebut.

2. Browser mengambil lokasi dan sampel wajah. Mesin tepercaya memverifikasi wajah; server memeriksa geofence, kualitas/usia sampel dan aturan jadwal.

3. Server memeriksa ulang status/versi lalu melakukan commit presensi, konsumsi challenge, idempotency dan audit secara atomik.

4. Peserta menerima bukti waktu server; pulang memerlukan masuk pada sesi yang sama.

Alternatif / gagal: Di luar lokasi, wajah gagal atau pulang tanpa masuk ditolak. Timeout setelah kirim dipulihkan dengan key dan otoritas yang sama; tidak membuat presensi ganda.

### 8.5 Presensi Cepat dari Halaman Login

Aktor: Peserta tanpa sesi dashboard. Prasyarat: Wajah terdaftar dan kontrol jalur cepat lolos PoC.

1. Peserta memasukkan kode identitas dan memilih masuk/pulang pada /login.

2. Server menerbitkan challenge generik terikat identitas yang diklaim, aksi, sesi kerja, versi template dan expiry.

3. Sampel wajah dan lokasi diproses; pencocokan 1:1 dan kontrol anti-spoof harus lolos sesuai kebijakan.

4. Server memakai otoritas satu transaksi untuk commit; bukti minimum dikembalikan tanpa menerbitkan sesi akun penuh.

Alternatif / gagal: Identitas palsu tidak menerima akses profil. Challenge expired/replay/wrong-action ditolak; retry idempotent memulihkan hasil tersimpan, bukan memberi izin aksi baru.

### 8.6 Pengajuan Izin Sakit dan Keputusan

Aktor: Peserta dan Staff Presensi. Prasyarat: Peserta login; kategori pengajuan yang diizinkan tersedia.

1. Peserta memilih sesi/rentang, jenis dan alasan, serta bukti jika diwajibkan.

2. Server memeriksa periode dan overlap, lalu menyimpan pending. Peserta dapat membatalkan sebelum diputuskan.

3. Staff Presensi memeriksa bukti/konflik dan memberi keputusan dengan alasan serta version check.

4. Keputusan tersimpan bersama audit dan proyeksi rekap. Cuti hanya diaktifkan setelah kebijakannya disahkan.

Alternatif / gagal: Pending bukan approved. Rentang invalid ditolak. Dua keputusan bersamaan hanya menghasilkan satu keputusan; konflik dengan hadir tidak ditimpa otomatis.

### 8.7 Koreksi dan Bantuan Teknis

Aktor: Peserta dan Staff Presensi. Prasyarat: Kasus menunjuk sesi kerja dan alasan; event asli dapat belum tersedia.

1. Peserta mengajukan koreksi atau Staff Presensi membuka kasus bantuan karena lupa absen/kegagalan perangkat.

2. Staff Presensi memverifikasi bukti, memberi keputusan dan alasan; pemohon tidak boleh menyetujui sendiri.

3. Persetujuan mencatat nilai sebelum/sesudah dan sumber manual, mempertahankan event asli serta memperbarui rekap dalam transaksi.

Alternatif / gagal: Bukti tidak cukup dapat ditolak. Gagal menulis audit menggagalkan perubahan. Jalur bantuan tidak memalsukan status wajah lolos otomatis.

### 8.8 Riwayat Rekap dan Konfigurasi

Aktor: Peserta, Staff Presensi dan Super Admin sesuai lingkup. Prasyarat: Sesi login dan scope objek valid.

1. Peserta membaca histori milik sendiri; Staff Presensi memfilter rekap program dan menelusuri pengajuan/koreksi.

2. Staff Presensi mengubah jadwal/lokasi sesuai mandat dengan versi efektif baru.

3. Super Admin mengelola akun petugas dan kebijakan teknis; seluruh perubahan sensitif dicatat dan sesi terdampak dicabut.

Alternatif / gagal: Data kosong tampil sebagai keadaan kosong; query gagal dapat diulang. Perubahan konfigurasi tidak menghitung ulang histori secara diam-diam.

### 8.9 Akhir Penempatan Retensi dan Pemulihan

Aktor: Staff Presensi dan Super Admin. Prasyarat: Akhir penempatan atau permintaan penghapusan telah diverifikasi.

1. Staff Presensi menonaktifkan akses operasional Peserta yang selesai; sistem mencabut sesi dan challenge.

2. Super Admin menjalankan retensi/penghapusan sesuai kebijakan dan merekam hasil tanpa menyimpan biometrik di audit.

3. Super Admin menguji restore di lingkungan terisolasi, memeriksa relasi/skema dan menerapkan ulang daftar penghapusan sebelum layanan dibuka.

Alternatif / gagal: Proses gagal menjadi tugas tindak lanjut; data tidak dinyatakan terhapus sebelum hasil diverifikasi. Target pemulihan dan masa retensi masih perlu ditetapkan.

### 8.10 Ringkasan Status

| Objek | Transisi Utama |
| --- | --- |
| Akun / penempatan | Invited → Active → Inactive / Ended. Histori tidak dihapus hanya karena akses berakhir. |
| Template wajah | Pending → Active → Superseded / Deleted; satu versi aktif sesuai kebijakan. |
| Presensi | Not started → Open → Complete; sesi tanpa pulang dapat Incomplete setelah penutupan. |
| Izin / koreksi | Pending → Approved / Rejected / Cancelled. Revisi keputusan melalui workflow berjejak. |
| Challenge | Issued → Consumed / Expired / Revoked. Retry idempotent sah memulihkan hasil, bukan aksi baru. |
| Sesi kerja | Planned → Open → Closed → Reconciled; label alpa setelah pemeriksaan izin, koreksi dan jadwal. |

## 9. Data Model / ERD Baseline

Baseline ini mengikuti sigma_presensi.sql revisi 0.2 dengan tepat 17 tabel MySQL/InnoDB. Nama tabel dan kolom mengikuti skema terbaru, termasuk ejaan yang ditetapkan pemilik proyek. Migrasi SQL disimpan di database/migrations/; akses mysql2 berada di models/ pada root MVC. Tidak ada ORM dan hanya ada tiga role: peserta, staff_presensi, super_admin.

Tabel kebijakan terpisah dan tabel riwayat revisi koreksi tidak digunakan. Aturan presensi disimpan sebagai policy_snapshot pada work_sessions; isi pemberitahuan disimpan langsung pada consent_records. Permohonan, keputusan terakhir, serta nilai sebelum/sesudah koreksi berada pada correction_request. Riwayat perubahan koreksi tetap dicatat di audit_events.

### 9.1 Daftar 17 Tabel dan Atribut

| Tabel | Fungsi dan Atribut |
| --- | --- |
| users | Identitas akun untuk tiga role. code unik; email opsional dan unik bila diisi. Password disimpan sebagai hash. Atribut: id, code, name, email, password_hash, role, status, created_at, updated_at. |
| placements | Periode PKL/magang. participant_user_id menunjuk peserta; staff_user_id menunjuk Staff Presensi penanggung jawab. Atribut: id, participant_user_id, staff_user_id, program_type, institution_name, start_date, end_date, status, created_at, updated_at. |
| location | Lokasi presensi dan riwayat versinya. Perubahan koordinat/radius yang sudah digunakan membuat baris versi baru. Atribut: id, location_code, version, name, latitude, longitude, radius_meters, valid_from, valid_to, created_by, created_at. |
| work_sessions | Sesi kerja konkret per penempatan. location_version_id tetap merupakan nama kolom FK ke location.id. policy_snapshot berisi parameter aturan tervalidasi saat sesi ditetapkan. Atribut: id, placement_id, policy_snapshot, location_version_id, work_date, start_at_utc, end_at_utc, timezone, status, created_at, updated_at. |
| face_recognation | Versi template wajah terenkripsi. user_id menunjuk pemilik; activated_by menunjuk Staff Presensi. active_slot adalah kolom generated untuk membatasi satu versi aktif. Atribut: id, user_id, model_version, template_version, encrypted_payload, encryption_key_id, status, enrolled_at, activated_by, activated_at, deleted_at, active_slot. |
| consent_records | Catatan pemberitahuan/persetujuan dan penarikannya. notice_text menyimpan isi yang ditampilkan; tidak merujuk tabel kebijakan. Atribut: id, user_id, notice_code, notice_version, notice_text, mechanism, status, recorded_at. |
| verification | Challenge enrollment/presensi, versi template terkait, hasil tepercaya dan masa berlaku. face_recognation_id menunjuk template. Token mentah tidak disimpan. Atribut: id, token_hash, user_id, work_session_id, face_recognation_id, action, status, trusted_result, verified_at, expires_at, consumed_at, created_at. |
| attendance_records | Proyeksi presensi terkini untuk satu sesi. Waktu efektif dapat berubah melalui koreksi, tanpa menghapus event asli. Atribut: id, work_session_id, effective_check_in_at, effective_check_out_at, status, version, created_at, updated_at. |
| attandance | Bukti masuk/pulang asli yang berhasil. verification_id mengikat satu bukti ke satu verification; source membedakan jalur login dan presensi cepat. Atribut: id, attendance_record_id, verification_id, type, source, occurred_at_server, created_at. |
| idempotency_records | Identitas permintaan, fingerprint payload dan referensi hasil untuk retry aman setelah timeout. Tidak menggantikan constraint bisnis. Atribut: id, challenge_id, authority_scope, idempotency_key, request_fingerprint, operation_status, result_reference, response_status, expires_at, created_at, updated_at. |
| absense_request | Pengajuan izin/sakit berdasarkan rentang tanggal. Cuti hanya diaktifkan setelah kebijakannya disahkan. Atribut: id, placement_id, requested_by, start_date, end_date, type, reason, status, version, created_at, updated_at. |
| absense_decisions | Riwayat keputusan Staff Presensi atas pengajuan izin/sakit, terikat request_version. Status pengajuan dan keputusan diperbarui atomik. Atribut: id, absense_request_id, decided_by, request_version, decision, reason, decided_at. |
| correction_request | Permohonan koreksi, usulan waktu, keputusan terakhir, snapshot sebelum/sesudah dan versi record yang diubah. Dapat menunjuk sesi tanpa record presensi. Atribut: id, work_session_id, requested_by, reason, status, version, proposed_check_in_at, proposed_check_out_at, decided_by, decision_reason, decided_at, before_values, after_values, record_version_before, record_version_after, created_at, updated_at. |
| attandance_document | Metadata bukti berkas privat yang opsional. Tepat satu induk: absense_request atau correction_request. File fisik mengikuti kebijakan retensi. Atribut: id, owner_user_id, absense_request_id, correction_request_id, mime_type, size_bytes, private_storage_key, retention_until, created_at. |
| sessions | Sesi autentikasi server yang dapat kedaluwarsa/dicabut. Struktur fisik diselaraskan dengan adapter session library saat implementasi. Atribut: id_hash, user_id, expires_at, revoked_at, created_at. |
| audit_events | Jejak tindakan operasional/sistem. safe_changes hanya memuat perubahan aman; tanpa password, token mentah, foto atau embedding. Atribut: id, actor_user_id, authority_scope, action, entity_type, entity_id, request_id, safe_changes, occurred_at. |
| account_tokens | Token sekali pakai untuk aktivasi/reset password. user_id adalah akun tujuan; issued_by adalah petugas penerbit. Atribut: id, user_id, issued_by, token_hash, purpose, expires_at, consumed_at, revoked_at, created_at. |

### 9.2 ERD per Kelompok Data

Diagram berikut membagi relasi utama menjadi empat kelompok agar terbaca. Seluruh kelompok berada dalam satu database. Arah panah menunjukkan FK dari tabel anak menuju tabel induk. Uraian pada bagian 9.3 melengkapi kardinalitas dan relasi pelaku yang tidak digambar berulang.

### A. Penempatan, lokasi dan presensi

### B. Wajah, verifikasi dan retry

### C. Pengajuan, keputusan dan dokumen

### D. Akun, pemberitahuan dan audit

### 9.3 Kardinalitas, Foreign Key dan Kepemilikan

- users sebagai peserta memiliki 0..N placements; setiap placement wajib memiliki satu peserta dan satu Staff Presensi penanggung jawab. FK menjamin akun ada; role dan mandat diperiksa backend.
- placements memiliki 0..N work_sessions dan absense_request. location memiliki 0..N work_sessions. Satu sesi wajib menunjuk satu penempatan dan satu versi lokasi.
- work_sessions memiliki 0..1 attendance_records. Satu record memiliki 0..2 attandance, dibatasi dua jenis unik: check_in dan check_out. Pulang memerlukan masuk pada sesi yang sama.
- users memiliki 0..N face_recognation; maksimal satu template berstatus active. Satu template dapat dirujuk 0..N verification. activated_by pada template dan created_by pada location menunjuk users dengan kewenangan yang diperiksa server.
- verification dapat merujuk satu users, work_sessions dan face_recognation; kolom nullable mendukung enrollment atau respons publik generik. Presensi berhasil wajib memiliki ketiganya dengan pemilik yang cocok. users juga direferensikan langsung oleh verification.user_id.
- verification memiliki 0..1 attandance melalui verification_id yang unik dan 0..N idempotency_records melalui challenge_id. challenge_id boleh kosong untuk operasi lain yang diotorisasi sesuai scope.
- absense_request memiliki 0..N absense_decisions. requested_by dan decided_by menunjuk users. Pemohon adalah peserta pemilik penempatan; keputusan hanya oleh Staff Presensi yang berwenang dan bukan pemohon sendiri.
- work_sessions memiliki 0..N correction_request. requested_by menunjuk peserta atau Staff pembuka kasus; decided_by menunjuk Staff pemberi keputusan. Keputusan terakhir dan before/after berada pada baris yang sama, sedangkan riwayat perubahannya berada pada audit_events.
- absense_request dan correction_request masing-masing dapat memiliki 0..N attandance_document. Setiap dokumen wajib menunjuk tepat satu jenis pengajuan. owner_user_id menunjuk users; akses berkas mengikuti kepemilikan pengajuan dan mandat petugas.
- users memiliki 0..N sessions, consent_records dan account_tokens. account_tokens.issued_by juga menunjuk users sebagai penerbit. Audit dapat memiliki satu actor_user_id atau otoritas transaksi tanpa akun; entity_type/entity_id adalah referensi logis, bukan FK ke banyak tabel.
### 9.4 Constraint dan Konsistensi Baseline

- Unik: users.code; users.email bila terisi; location(location_code, version); face_recognation(user_id, template_version); face_recognation(user_id, active_slot); attendance_records.work_session_id; attandance(attendance_record_id, type); attandance.verification_id; verification.token_hash.
- Unik tambahan: idempotency_records(authority_scope, idempotency_key); absense_decisions(absense_request_id, request_version); attandance_document.private_storage_key; sessions.id_hash; account_tokens.token_hash. Semua FK memakai RESTRICT default untuk menjaga riwayat.
- Aturan sesi disimpan pada work_sessions.policy_snapshot. Backend memvalidasi struktur JSON dan menetapkan nilai yang disahkan; perubahan aturan/lokasi tidak menimpa sesi yang sudah digunakan. consent_records menyimpan notice_code, notice_version dan notice_text secara langsung.
- Persetujuan correction_request memperbarui keputusan, before_values/after_values, attendance_records dan audit dalam satu transaksi. Periksa version permohonan serta versi record. Perubahan berikutnya tidak menghapus audit lama dan tidak memalsukan event verifikasi asli.
- Commit presensi memeriksa identitas, aksi, status, expiry dan versi; konsumsi verification, penulisan attandance/proyeksi, idempotency dan audit dilakukan atomik. Nilai face_match dari browser bukan keputusan otoritatif.
- Identitas unik jadwal masih perlu difinalkan sesuai pola sesi kerja perusahaan. Skema saat ini belum memiliki constraint yang sepenuhnya mencegah duplikasi work_sessions. Jangan menetapkan unik peserta + tanggal apabila beberapa sesi pada hari yang sama diizinkan.
- Waktu disimpan UTC; work_date mengikuti zona operasional. Rekap hadir, izin, alpa dan sesi tidak lengkap menggabungkan jadwal, keputusan izin dan koreksi. Nonaktif akun tidak sama dengan menghapus histori; retensi metadata bukti dan payload biometrik ditangani terpisah.
## 10. Database Rules

- DB-001 Relasi dan Role: Gunakan InnoDB dan foreign key. users.role hanya menerima peserta, staff_presensi, super_admin. Validasi aplikasi dan constraint database saling melengkapi; jangan mengandalkan tampilan menu.
- DB-002 Presensi Unik: Unik attendance_records.work_session_id dan (attendance_record_id, type). Jangan menetapkan unik peserta + tanggal karena beberapa sesi dapat terjadi pada hari yang sama.
- DB-003 Waktu Server dan Tanggal Kerja: Simpan waktu UTC dengan konvensi driver/database yang sama. work_date berasal dari zona operasional/sesi, bukan tanggal perangkat atau DATE(timestamp UTC) saja. Zona kantor dan aturan lintas hari perlu disahkan.
- DB-004 Commit Atomik: Inferensi wajah dilakukan sebelum membuka transaksi SQL. Saat commit, periksa ulang status, sesi, versi dan expiry; konsumsi challenge, event/proyeksi, idempotency serta audit disimpan atomik. Rollback bila satu tahap gagal.
- DB-005 Idempotency dan Konkurensi: Scope key pada otoritas transaksi dan fingerprint payload. Key sama/payload sama mengembalikan hasil asli; beda payload menghasilkan konflik. Key berbeda tetap terkena constraint bisnis. Deadlock ditangani retry terbatas tanpa menggandakan.
- DB-006 Pulang dan Koreksi: Pulang memerlukan masuk pada sesi yang sama. Koreksi menyimpan nilai sebelum/sesudah dan sumber manual tanpa menghapus event asli; alasan serta Staff Presensi pemberi keputusan wajib ada.
- DB-007 Pengajuan dan Versi: Pending tidak sama dengan approved. Periksa overlap dan konflik dengan hadir dalam mekanisme terkontrol; version check mencegah dua keputusan final serentak. Perubahan konfigurasi efektif tidak mengubah histori otomatis.
- DB-008 Verifikasi Tepercaya: Jangan menyimpan status lolos hanya dari face_match client. Challenge terikat peserta, aksi, sesi dan versi model/template. Retry atas hasil tersimpan tidak membolehkan aksi baru atau membaca hasil peserta lain.
- DB-009 Biometrik dan Retensi: Embedding/template tetap data sensitif. Enkripsi payload/backup, pisahkan kunci, batasi akses, dan jangan menyimpan foto/video permanen sebagai default. Masa simpan dan penghapusan harus disahkan sebelum pilot data nyata.
- DB-010 Audit dan Penghapusan: Audit bersifat append-only pada aplikasi dan tidak memuat password, token atau biometrik mentah. Nonaktif akun berbeda dari menghapus data. Restore menerapkan ulang catatan penghapusan agar template yang dihapus tidak kembali aktif.
- DB-011 Index dan Query: Mulai dari index (placement_id, work_date), (placement_id, status, start_date) pada pengajuan dan (entity_type, entity_id, occurred_at) pada audit. Validasi EXPLAIN/query nyata sebelum menambah index. Semua nilai memakai parameter binding; sort/identifier memakai allowlist.
- DB-012 Migrasi dan Akses: Migrasi SQL terurut dan berversi. Akun runtime dibatasi operasi data, akun migrasi terpisah. Super Admin aplikasi tidak otomatis memakai kredensial root MySQL; tidak boleh menonaktifkan akun Super Admin aktif terakhir.
## 11. Non-Functional Requirements

### 11.1 Security dan Data Protection

- Session: rekomendasi cookie HttpOnly, Secure pada HTTPS, SameSite sesuai alur diuji dan server-side store MySQL. Regenerasi setelah login; cabut setelah logout/reset/nonaktif. MemoryStore development tidak digunakan pada production [S5][S7].
- CSRF dan CORS: mutasi berbasis cookie menggunakan token CSRF dan pemeriksaan Origin; SameSite adalah tambahan [S6]. Satu origin usulan tidak perlu CORS lintas domain. Bila origin terpisah, gunakan allowlist eksplisit dan uji cookie/credentials; CORS bukan otorisasi.
- Input dan akses: validasi skema, ukuran/MIME upload, parameterized query, pembatasan akses objek dan rate limit pada login/reset/jalur cepat. Simpan password hash adaptif melalui library yang direview, bukan password asli.
- Akses sistem: Super Admin memerlukan autentikasi ulang untuk operasi sensitif dan audit perubahan role. Staff Presensi tidak dapat meningkatkan role; aktivitas koreksi tidak boleh dilewati lewat dashboard sistem.
### 11.2 Face Recognition Reliability dan PoC

Rekomendasi mode 1:1 membandingkan sampel dengan identitas yang diklaim; 1:N mencari dari galeri dan ditunda [S10]. Pilih mesin setelah memeriksa lisensi, runtime, latensi/memori, kualitas capture dan integrasi Node. Browser dapat membantu pratinjau/kualitas, tetapi bukan sumber keputusan otoritatif.

Laporkan FMR/FNMR, kegagalan capture, kondisi perangkat/pencahayaan dan threshold pada data uji yang diizinkan dengan pemisahan enrollment/evaluasi. Kualitas citra memengaruhi hasil [S11][S12]. Uji foto cetak, layar HP, video, replay dan manipulasi respons. Challenge gerakan sederhana bukan jaminan liveness kuat. Tidak ada klaim akurasi SIGMA sebelum pengujian.

Gerbang rilis wajah: model/runtime dan lisensi layak; batas kesalahan serta latensi disetujui; enrollment tervalidasi; spoof/replay diuji; retensi dan fallback diputuskan. Jalur cepat memerlukan penerimaan risiko residual secara eksplisit. Jika belum layak, tahan rilis terkait dan gunakan workflow bantuan yang diaudit, bukan menerima semua wajah.

### 11.3 Usability Performance dan Maintainability

- Responsiveness: target awal viewport 360 px sampai desktop; uji HP nyata, navigasi keyboard, label form dan status yang tidak bergantung warna. Daftar browser final perlu dikonfirmasi.
- Camera dan location: izin pengguna serta secure context diperlukan [S8][S9]. localhost pada laptop tidak membuktikan akses kamera melalui IP LAN di HP; lingkungan uji mobile perlu HTTPS yang dipercaya.
- Performance: ukur p50/p95 API, durasi inferensi dan beban bersamaan secara terpisah. Skala pengguna dan ambang penerimaan belum diberikan, sehingga tidak mengarang SLA/kapasitas.
- MVC maintainability: root wajib models/controllers/views; pisahkan service, middleware dan migrasi; cegah import silang View–Model. Build/typecheck frontend dan backend terpisah, disertai lockfile serta dokumentasi.
- Observability: request ID, kode error dan latensi cukup untuk penelusuran tanpa membocorkan wajah, session ID atau password. Kegagalan layanan tidak menghasilkan sukses palsu.
### 11.4 Deployment Backup dan Governance

Super Admin menjalankan prosedur rilis dan pemulihan. Production menggunakan hasil build, HTTPS dan proses Node yang diawasi; domain/hosting belum dipilih. Rahasia di luar Git dan View; akses MySQL dibatasi. Migrasi diuji bersama backup pra-rilis, smoke test dan rencana rollback yang membedakan kode dari skema.

RPO/RTO, jadwal dan retensi backup perlu disepakati. Uji restore terenkripsi di lingkungan terisolasi mencakup skema, relasi, berkas privat yang diperlukan dan kebijakan penghapusan. Gangguan wajah diarahkan ke Staff Presensi untuk bantuan/koreksi. Penanggung jawab perusahaan menetapkan pemberitahuan, penggunaan data, persetujuan bila diperlukan, retensi dan kondisi peserta di bawah umur bila ada; dokumen ini tidak menyatakan kepatuhan hukum.

### 11.5 Referensi Teknis

Referensi mendukung prinsip teknis, bukan kebijakan perusahaan. Diakses 12 November 2026. Pilihan arsitektur dan perilaku domain SIGMA tetap keputusan proyek; versi library dikunci saat implementasi.

[S1] Vite — Getting Started dan Server Options

https://vite.dev/guide/ ; https://vite.dev/config/server-options.html#server-proxy

[S2] Express — Production Best Practices Security

https://expressjs.com/en/advanced/best-practice-security/

[S3] MySQL — Introduction to InnoDB

https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html

[S4] MySQL2 — Quickstart

https://sidorares.github.io/node-mysql2/docs

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

[S10] NIST — Facial Recognition Technology Part III

https://www.nist.gov/speech-testimony/facial-recognition-technology-part-iii-ensuring-commercial-transparency-accuracy

[S11] NIST — FRTE 1 to 1 Verification

https://pages.nist.gov/frvt/html/frvt11.html

[S12] NIST — Biometric Quality

https://www.nist.gov/programs-projects/biometric-quality

## 12. Acceptance Criteria MVP

Kriteria berikut adalah gerbang UAT MVP. Skenario positif dan negatif wajib diuji pada dataset yang diizinkan. ID AC-001 sampai AC-018 mengacu FR yang sama; semua butir pada satu ID harus lulus. Role final dan MVC tidak lagi bersifat opsional.

### AC-001 Registrasi dan aktivasi

- Peserta valid diaktifkan satu kali.
- Kode peserta duplikat ditolak.
- Token bekas/kedaluwarsa tidak dapat dipakai.
- Pesan tidak membocorkan status akun.
### AC-002 Penempatan dan status peserta

- Peserta di luar periode/nonaktif tidak dapat presensi.
- Histori tidak hilang.
- Perubahan periode tercatat dan tidak mengubah histori tanpa rekonsiliasi.
### AC-003 Login logout dan sesi

- Login benar memberi sesi baru.
- Salah login memberi pesan generik.
- Sesi lama setelah logout ditolak.
- Sesi tidak aktif/kedaluwarsa tidak dapat melakukan mutasi.
### AC-004 Hak akses dan pemulihan akun

- Peserta A tidak membaca/mengubah data B.
- Staff Presensi tidak mengubah role petugas.
- Reset kedaluwarsa ditolak dan reset berhasil membatalkan sesi lama.
### AC-005 Enrollment wajah

- Sampel kosong/banyak wajah/berkualitas buruk ditolak.
- Peserta tidak bisa mengganti identitas template.
- Enrollment ulang tercatat dan challenge versi lama tidak berlaku.
- Staff Presensi harus mengonfirmasi identitas sebelum template aktif; Peserta dan Super Admin tidak mem-bypass persetujuan enrollment.
### AC-006 Verifikasi lokasi dan wajah

- Lokasi tidak valid/terlalu lama/di luar aturan dan wajah tidak cocok menolak presensi.
- Payload yang dimanipulasi tidak melewati verifikasi.
- Alasan aman ditampilkan.
### AC-007 Presensi masuk

- Masuk valid menghasilkan bukti.
- Tidak ada sesi kerja atau peserta nonaktif ditolak.
- Masuk kedua pada sesi sama tidak membuat baris tambahan.
### AC-008 Presensi pulang

- Pulang valid melengkapi sesi.
- Tanpa masuk ditolak.
- Pulang kedua tidak menambah catatan.
- Lintas hari tetap terikat sesi jika kebijakannya diaktifkan.
### AC-009 Presensi dari halaman login

- Berhasil tidak menghasilkan sesi dashboard.
- Token tidak bisa digunakan ulang atau untuk peserta/tindakan lain.
- Wajah salah ditolak.
- Identitas tidak valid mendapat pesan generik.
### AC-010 Idempotency dan hasil tidak pasti

- Key sama/payload sama mengembalikan hasil asli.
- Payload berbeda menghasilkan 409.
- Key berbeda untuk masuk sama tetap tidak menggandakan.
- Timeout pascacommit dapat dipulihkan.
### AC-011 Pengajuan izin dan sakit

- Rentang terbalik/di luar penempatan dan konflik ditolak.
- Pengajuan baru pending.
- Pending tidak meniadakan kewajiban presensi.
- Akses hanya pada milik sendiri.
### AC-012 Keputusan pengajuan

- Dua keputusan serentak hanya satu berlaku.
- Staff Presensi tak berwenang ditolak.
- Perubahan status dan audit atomik.
- Penolakan memuat alasan yang terlihat peserta.
- Pemohon tidak dapat menyetujui pengajuan sendiri; perubahan keputusan mengikuti koreksi berversi.
### AC-013 Koreksi presensi

- Alasan wajib.
- Koreksi disetujui memperbarui proyeksi rekap dan menyimpan versi.
- Kegagalan audit menggagalkan mutasi.
- Koreksi ditolak tidak mengubah catatan.
### AC-014 Histori peserta

- Histori hanya milik sesi pengguna.
- Tidak ada data memakai keadaan kosong.
- Timeout menyediakan retry tanpa perubahan.
- Label manual/koreksi terlihat.
### AC-015 Rekap Staff Presensi

- Hasil cocok dengan dataset UAT.
- Filter penempatan/periode benar.
- Peserta tidak membaca rekap orang lain.
- Perubahan yang disetujui tercermin setelah refresh.
### AC-016 Konfigurasi jadwal dan lokasi

- Koordinat/radius tidak valid ditolak.
- Perubahan menghasilkan versi dan audit.
- Histori memakai versi lama.
- Tidak ada jadwal yang dibuat dari tebakan browser.
### AC-017 Audit dan tata kelola data

- Setiap mutasi sensitif memiliki aktor/waktu/alasan.
- Pengguna biasa tidak membaca audit.
- Penghapusan memblokir template lama dan mencatat hasil tanpa menyimpan biometrik di audit.
### AC-018 Pemulihan dan bantuan

- Restore pada lingkungan terisolasi memulihkan data terkait dan skema.
- Super Admin memeriksa penghapusan/retensi sebelum layanan dibuka.
- Bantuan tidak menandai wajah lolos secara palsu.
### AC-019 Tiga Role dan Kendali Super Admin

- Database dan backend hanya menerima role peserta, staff_presensi dan super_admin; payload role lain ditolak.
- Peserta tidak dapat mengakses endpoint Staff Presensi/Super Admin; Staff Presensi tidak dapat mengubah role akun petugas.
- Super Admin dapat mengelola akun petugas dengan audit, tetapi tidak mengubah presensi langsung atau menonaktifkan Super Admin aktif terakhir.
### AC-020 Root Project MVC

- Root sigma-presensi berisi models/, controllers/ dan views/; views/ memuat React/Vite dan root menjalankan Express/TypeScript.
- Review dependency membuktikan View hanya memakai API, Model tidak mengimpor View/Controller, dan query mysql2 tidak tersebar di komponen React/controller.
- Build dan pemeriksaan TypeScript backend mengecualikan views/; build frontend menghasilkan views/dist/ tanpa rahasia backend.
### 12.1 Gerbang Penerimaan Lintas Fitur

- Uji paralel dengan key sama/berbeda dan timeout sebelum/pascacommit menghasilkan satu catatan sesuai aturan.
- Rekap cocok dengan jadwal, presensi, izin approved, sesi tidak lengkap dan koreksi pada sampel UAT; tidak menghitung izin dan hadir sebagai dua hari.
- PoC mencatat kecocokan, capture failure, spoof/replay, latensi dan keterbatasan; pemilik keputusan menetapkan ambang serta risiko residual sebelum pilot.
- Seluruh uji akses lintas peserta/role, CSRF dan pencabutan sesi lulus. Restore terisolasi memulihkan skema/data dan menerapkan ulang penghapusan.
- Kebijakan waktu/lokasi, pengajuan dan penggunaan data wajah telah disahkan sebelum data nyata diproses.
### 12.2 Keputusan Terbuka Sebelum Pilot

| Prioritas | Keputusan yang Dibutuhkan |
| --- | --- |
| 1 | Nama petugas yang mengisi tiga role, mandat Staff Presensi, dan prosedur konflik kepentingan/eskalasi. |
| 2 | Jumlah peserta aktif, beban bersamaan dan perangkat/browser sasaran. |
| 3 | Zona waktu, jam kerja, toleransi, libur, shift dan aturan lintas tengah malam. |
| 4 | Koordinat kantor, radius, akurasi/usia sampel dan kebijakan WFH/tugas luar bila ada. |
| 5 | Penggunaan jalur cepat pada HP pribadi atau kiosk dan penerimaan input kode peserta untuk verifikasi 1:1. |
| 6 | Prosedur enrollment, bukti identitas dan jalur bantuan ketika kamera/wajah gagal. |
| 7 | Jenis izin/sakit, tenggat, bukti dan hak cuti peserta bila ada. |
| 8 | Penanggung jawab data, pemberitahuan/persetujuan, retensi dan penghapusan wajah termasuk backup. |
| 9 | Hosting/domain, pengelolaan rahasia, RPO/RTO serta jadwal backup dan pemeliharaan. |
| 10 | Ambang kelulusan PoC/liveness, baseline rekap dan pemberi keputusan peluncuran. |

## 13. Future Enhancements

Pengembangan setelah MVP hanya diprioritaskan setelah kebutuhan bisnis terverifikasi. Tidak menambah role di luar tiga aktor final tanpa perubahan kebutuhan yang disetujui.

- Cuti sesuai kebijakan: aktifkan jenis, hak dan kuota jika perusahaan menetapkannya untuk peserta; jangan menyalin hak pegawai otomatis.
- Jadwal dan penugasan lebih kompleks: shift berganda, WFH atau tugas luar dengan aturan lokasi/approval yang eksplisit.
- Ekspor dan integrasi: CSV/XLSX atau integrasi internal setelah format, akses dan tujuan data ditetapkan.
- Notifikasi: pengingat atau kanal email setelah kebutuhan operasional dan biaya pemeliharaan jelas.
- Penguatan biometrik: liveness yang lebih kuat atau model lain berdasarkan hasil pilot. Evaluasi ulang versi template, kebutuhan enrollment dan dampak privasi.
- Identifikasi 1:N atau kiosk: kajian terpisah untuk pencarian galeri, risiko salah identifikasi, spoof dan pengawasan perangkat; bukan default versi awal.
- Aplikasi mobile/offline: hanya bila keterbatasan web terbukti; memerlukan kajian sinkronisasi, replay dan kebijakan waktu yang berbeda.
- Operasi dan kapasitas: tuning query/index dan observabilitas berdasarkan beban nyata. Tidak menambah microservices atau infrastruktur kompleks hanya untuk mengikuti tren.
Product Requirements Document — SIGMA
Versi 0.2 · 12 November 2026 · Status Draft / MVP
PT. Vaiotech Lintas Nusantara
Root MVC · React + Vite + TypeScript · Node.js + Express · MySQL · mysql2
