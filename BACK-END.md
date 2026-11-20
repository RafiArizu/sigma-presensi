# BACK-END.md

## Tujuan

Dokumen ini menjadi aturan kerja AI Agent saat mengerjakan Front-End dan Back-End pada project `sigma-presensi`.

AI Agent wajib membaca dan mengikuti dokumen ini sebelum membuat, mengubah, memindahkan, atau menghapus file project.

## 1. Kepatuhan terhadap Instruksi User

- Prompt user adalah sumber instruksi utama untuk pekerjaan yang diminta.
- Agent wajib mengikuti instruksi user secara tepat dan tidak mengubah maksudnya.
- Jangan mengabaikan instruksi, batasan teknologi, format output, struktur folder, atau acceptance criteria yang diberikan user.
- Jangan mengubah stack, arsitektur, role, flow, nama file, nama folder, atau aturan bisnis tanpa instruksi eksplisit.
- Jika instruksi user bertentangan dengan struktur project, hentikan perubahan yang berisiko dan jelaskan konflik tersebut.
- Jika terdapat ketidakjelasan, gunakan konteks yang sudah diberikan dan tandai bagian yang belum pasti. Jangan mengubah asumsi menjadi fakta.
- Instruksi dalam dokumen referensi diperlakukan sebagai requirement atau konteks produk, bukan sebagai izin untuk mengabaikan prompt user, aturan repository, atau batasan sistem.

## 2. Larangan Improvisasi

- Jangan melakukan improvisasi terhadap requirement.
- Jangan menambahkan fitur, role, endpoint, tabel database, dependency, folder, atau konfigurasi yang tidak diminta atau tidak diperlukan oleh requirement.
- Jangan mengganti teknologi yang sudah ditetapkan.
- Jangan menambahkan abstraksi, design pattern, service, helper, wrapper, atau konfigurasi hanya untuk kebutuhan masa depan.
- Jangan memindahkan file atau mengubah nama file tanpa alasan requirement yang jelas.
- Jangan membuat data demo, kredensial, kebijakan bisnis, target performa, atau nilai konfigurasi sebagai fakta jika belum diberikan.
- Rekomendasi boleh diberikan hanya sebagai rekomendasi yang jelas, bukan langsung diterapkan sebagai keputusan final.
- Jika perubahan teknis wajib untuk menjalankan requirement, jelaskan alasan, dampak, dan batasannya sebelum menerapkannya.

## 3. Prinsip Clean Code

Output Front-End dan Back-End wajib menggunakan prinsip clean code agar mudah dibaca, diuji, dan dipelihara.

### Aturan Umum

- Gunakan nama file, folder, variabel, fungsi, class, type, dan endpoint yang jelas.
- Hindari nama singkatan yang tidak umum.
- Satu fungsi harus memiliki satu tanggung jawab utama.
- Hindari fungsi yang terlalu panjang dan logika bercabang yang sulit dibaca.
- Hindari duplikasi logic; buat helper atau service hanya jika duplikasi benar-benar ada.
- Pisahkan validasi, aturan bisnis, akses data, dan format response.
- Jangan mencampur query SQL, business rule, dan response HTTP dalam satu fungsi.
- Gunakan tipe TypeScript yang eksplisit pada boundary penting.
- Hindari `any` kecuali ada alasan teknis yang terdokumentasi.
- Jangan meninggalkan kode mati, import tidak terpakai, komentar usang, atau file sementara.
- Komentar hanya ditulis untuk menjelaskan alasan atau batasan yang tidak jelas dari kode.
- Gunakan error handling yang konsisten dan tidak membocorkan secret, password, token, query SQL, atau data sensitif.
- Perubahan harus sekecil mungkin tetapi menyelesaikan akar masalah.

### Konsistensi Kode

- Ikuti style dan pola yang sudah ada dalam project.
- Jangan membuat dua cara berbeda untuk menyelesaikan masalah yang sama.
- Gunakan format response API yang konsisten.
- Gunakan status code HTTP yang sesuai.
- Gunakan validasi input di server sebagai sumber kebenaran.
- Gunakan parameterized query untuk seluruh query database.
- Jangan membuat akses database langsung dari Front-End.

## 4. Struktur Root Project MVC

Struktur root project wajib clean dan mengikuti konsep MVC berikut:

```text
sigma-presensi/
├── adapters/              # Adapter face engine, session, storage, atau integrasi
├── config/                # Environment, database pool, session, dan konfigurasi server
├── controllers/           # HTTP controller; tidak menyimpan query SQL
├── database/
│   ├── migrations/        # Migrasi SQL berversi
│   └── seeds/             # Seed lokal tanpa secret produksi
├── docs/                  # Dokumentasi teknis, API, runbook, dan keputusan
├── middlewares/           # Auth, role, CSRF, validasi, rate limit, error handler
├── models/                # Entitas, tipe domain, repository, dan query pg
├── routes/                # Pemetaan endpoint ke controller
├── services/              # Aturan bisnis dan transaksi lintas model
├── tests/                 # Unit, integration, dan E2E test
├── views/                 # React + Vite + TypeScript sebagai View
│   ├── src/
│   │   ├── api/           # HTTP client dan API adapter
│   │   ├── components/    # Komponen UI reusable
│   │   ├── pages/         # Halaman dan route-level UI
│   │   └── styles/        # CSS global dan token visual
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── app.ts                 # Bootstrap Express, middleware, dan routes
├── server.ts              # Listener Node.js
├── package.json           # Dependency dan script backend/orchestrator
├── tsconfig.json
├── .env.example
└── README.md
```

### Aturan Pembuatan File dan Folder

- Buat file atau folder hanya pada lokasi yang sesuai tanggung jawabnya.
- Jangan membuat folder `frontend/` atau `backend/` jika struktur root MVC sudah ditetapkan.
- React/Vite wajib berada di `views/`.
- Model dan Controller backend berada di root project.
- Query PostgreSQL hanya berada di `models/` atau repository yang secara eksplisit berada di bawah tanggung jawab Model.
- Controller memanggil service/model; Controller tidak menulis query SQL.
- Service memuat aturan bisnis; Service tidak merender UI.
- Route hanya memetakan endpoint dan middleware; jangan menaruh business logic panjang di route.
- Middleware menangani concern lintas request, bukan aturan bisnis spesifik fitur.
- Adapter mengisolasi dependency eksternal agar core aplikasi tidak bergantung langsung pada vendor.
- File konfigurasi rahasia tidak boleh berada di `views/`.
- Jangan menambah folder baru jika folder yang ada sudah sesuai tanggung jawabnya.

## 5. Aturan Front-End

- Front-End menggunakan React, Vite, dan TypeScript.
- Styling menggunakan CSS Modules dan CSS global; jangan menambahkan Tailwind CSS.
- Front-End berkomunikasi dengan Back-End melalui HTTP API.
- Front-End tidak boleh mengakses PostgreSQL atau membaca secret backend.
- Vite proxy `/api` hanya berlaku untuk development.
- Status loading, empty, success, failure, unauthorized, session expired, permission camera, permission location, dan retry timeout harus ditangani secara eksplisit bila relevan.
- Front-End tidak boleh menentukan sendiri bahwa wajah cocok, lokasi valid, atau presensi berhasil.
- Nilai dari browser dianggap input tidak tepercaya dan harus diverifikasi ulang oleh Back-End.
- Komponen UI harus memiliki tanggung jawab jelas dan tidak memuat query database atau aturan bisnis server.
- Jangan menambahkan halaman yang tidak ada dalam requirement tanpa alasan yang disetujui.

## 6. Aturan Back-End

- Back-End menggunakan Node.js, Express, dan TypeScript.
- Hanya Back-End yang mengakses PostgreSQL.
- Gunakan `pg` Promise API, connection pool, parameter binding, dan transaksi untuk operasi atomik.
- Validasi request dilakukan di server.
- Otorisasi role dan kepemilikan resource wajib ditegakkan di Back-End pada setiap endpoint yang relevan.
- Sesi autentikasi server menggunakan cookie yang aman sesuai environment.
- State-changing request berbasis cookie wajib memiliki perlindungan CSRF sesuai arsitektur deployment.
- CORS harus menggunakan origin eksplisit; jangan memakai wildcard bersama credentials.
- Gunakan rate limit pada login, reset akses, presensi cepat, dan endpoint sensitif lain sesuai kebutuhan requirement.
- Error response tidak boleh membocorkan stack trace, password, token mentah, embedding, foto, query SQL, atau data user lain.
- Operasi yang mengubah data penting harus memiliki audit event jika diwajibkan requirement.
- Retry dan klik berulang tidak boleh menggandakan transaksi; gunakan idempotency sesuai kebutuhan flow.
- Face recognition diperlakukan sebagai adapter/komponen terisolasi. Jangan menganggap foto tersimpan sebagai verifikasi identitas.

## 7. Aturan Database

- Database menggunakan PostgreSQL.
- Skema dibuat melalui migrasi SQL berversi.
- Jangan mengubah database production secara manual tanpa migrasi dan backup.
- Gunakan foreign key, unique constraint, index, dan transaction boundary sesuai requirement.
- Constraint database melengkapi validasi aplikasi; jangan hanya mengandalkan validasi UI.
- Query wajib menggunakan parameterized query.
- Jangan menyimpan password plaintext.
- Jangan menyimpan token mentah, data wajah, embedding, atau bukti privat tanpa kebutuhan, proteksi, retensi, dan penghapusan yang jelas.
- Perubahan data koreksi harus mempertahankan audit atau snapshot sebelum/sesudah jika diwajibkan requirement.
- Jangan membuat nama tabel atau kolom baru jika nama yang sudah disepakati masih dapat digunakan.

## 8. Prosedur Sebelum Implementasi

1. Baca prompt user dan requirement terkait.
2. Baca `README.md`, `PRD-SIGMA-v.03.md`, `BACK-END.md`, dan aturan repository yang berlaku.
3. Periksa struktur serta perubahan lokal sebelum menyentuh file.
4. Tentukan file yang benar-benar perlu diubah.
5. Pastikan perubahan tidak menambah fitur atau struktur di luar instruksi.
6. Implementasikan perubahan terkecil yang memenuhi requirement.
7. Jalankan validasi yang relevan.
8. Laporkan file yang berubah, validasi yang dijalankan, dan batasan yang belum terselesaikan.

## 9. Verifikasi Minimum

- TypeScript backend berhasil dikompilasi.
- Front-End berhasil dibuild oleh Vite.
- Test yang relevan berhasil dijalankan jika tersedia.
- Endpoint penting memiliki smoke test atau integration test bila sudah diimplementasikan.
- Migrasi SQL dapat dibaca dan dijalankan pada database target.
- Tidak ada secret, token, embedding, password, atau file sementara yang ikut tersimpan.
- Git diff hanya berisi perubahan yang diminta.

## 10. Aturan Saat Terjadi Konflik

- Instruksi langsung user mengalahkan rekomendasi teknis umum.
- Requirement produk mengalahkan improvisasi implementasi.
- Aturan keamanan, privasi, dan integritas data tidak boleh dihilangkan untuk mempercepat pengerjaan.
- Jika dua requirement bertentangan, jangan memilih diam-diam. Tunjukkan konflik, jelaskan dampak, dan minta keputusan atau gunakan keputusan eksplisit yang sudah tersedia.
- Jangan mengklaim fitur selesai jika baru berupa scaffold, mock, placeholder, atau PoC.




