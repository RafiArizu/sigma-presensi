# DESIGN.md — SIGMA

## 1. Peran dan tujuan

Bertindak sebagai Senior UI/UX Designer, Senior Front-end Engineer, dan UX Analyst untuk SIGMA (Sistem Identifikasi dan Pengelolaan Magang serta Absensi), aplikasi website perusahaan berbasis React.

Bangun antarmuka clean, material, dan modern. Utamakan keterbacaan, hierarki informasi, konsistensi, dan kemudahan menyelesaikan tugas. Dokumen ini menjadi instruksi bagi developer maupun AI agent saat membuat atau mengubah UI.

## 2. Prioritas acuan

1. Ketentuan eksplisit terbaru dari pemilik proyek.
2. Screenshot atau frame Figma yang diberikan untuk halaman terkait.
3. Token dan aturan dalam dokumen ini.
4. Pola komponen yang sudah digunakan proyek.

Desain, layout, dan ukuran elemen WAJIB mengikuti screenshot Figma. Jangan melakukan redesign, menambah menu, mengubah urutan konten, atau mengganti komposisi secara sepihak.

- Cocokkan ukuran viewport dengan frame referensi sebelum membandingkan hasil.
- Ikuti lebar sidebar, posisi konten, tinggi navigasi, ukuran card, tabel, tombol, avatar, radius, padding, margin, serta alignment pada referensi.
- Gunakan ukuran dari Figma Inspect bila tersedia. Screenshot saja tidak membuktikan nilai pixel asli; hasil perkiraan harus dicatat sebagai perkiraan.
- Jangan menganggap ukuran screenshot yang terpotong sebagai ukuran viewport aplikasi.
- Jika halaman belum memiliki referensi, gunakan pola halaman terdekat dan catat asumsi. Jangan mengklaim hasil sudah sesuai Figma sebelum diverifikasi.
- Jika referensi bertentangan dengan aksesibilitas atau spesifikasi warna, laporkan konflik secara spesifik sebelum mengubah desain yang terdampak.

## 3. Prinsip visual

- Clean: tampilkan informasi dan tindakan yang diperlukan untuk tugas pengguna.
- Material: gunakan pembagian surface, hierarki, state interaksi, dan elevation ringan untuk menjelaskan hubungan elemen.
- Modern: gunakan garis sederhana, ruang kosong yang cukup, alignment rapi, dan warna konsisten.
- Material Design menjadi prinsip interaksi dan hierarki, bukan izin mengganti tampilan Figma dengan tampilan default suatu library.
- Jangan memasang Material UI atau library komponen baru hanya karena dokumen ini menyebut Material Design.
- Hindari gradient, glassmorphism, shadow berat, ilustrasi dekoratif, border berulang, dan animasi berlebihan kecuali ada pada referensi.
- Kurangi jumlah variasi tipografi dan teks berulang. Jangan mengecilkan teks sampai sulit dibaca atau menghapus label, petunjuk penting, dan pesan validasi.

## 4. Palet warna

| Fungsi | Nilai | Penggunaan |
| --- | --- | --- |
| Main Navy | `#244E96` | Identitas utama, sidebar, dan aksi utama sesuai Figma |
| Background | `#D8E2F0` | Latar halaman abu abu kebiruan |
| Sub Navy | `#2C58A2` | Surface atau lapisan navy sekunder |
| Font utama | `#244E96` | Teks pada surface terang |
| Font dalam card | `#535151` | Warna font dalam card |
| Background card | `#EEF3F9` | background card fix  |

Background card ditetapkan pada `#E6E6E6` sesuai revisi pemilik proyek. Gunakan token `--sigma-card-background`; warna font tetap `#535151`.

Jangan menggunakan oranye sebagai satu-satunya pembeda status. Kombinasikan dengan label atau ikon. Periksa kontras setiap pasangan warna; jangan berasumsi emas di atas latar terang cukup terbaca untuk teks kecil.

## 5. Tipografi

Font wajib: **Poppins**, fallback `'Plus Jakarta Sans', sans-serif` jika font tersebut tersedia; jika tidak, gunakan `sans-serif`. Muat hanya weight yang digunakan. Ukuran, line-height, dan weight mengikuti Figma, bukan ukuran default browser atau library.

| Elemen | Letter spacing Figma | CSS |
| --- | --- | --- |
| Judul | 5% | `0.05em` |
| Teks navigasi sidebar | 6% | `0.06em` |
| Deskripsi sambutan | 6% | `0.06em` |
| Teks card | 6% | `0.06em` |
| Teks tabel | 6% | `0.06em` |
| Teks profil | 6% | `0.06em` |
| Teks hari dan kalender | 6% | `0.06em` |

Persentase letter spacing pada Figma diterjemahkan menjadi `em`, bukan `letter-spacing: 5%` atau `6%`. Elemen lain mengikuti Figma; bila tidak ditentukan, gunakan token teks `0.06em` sebagai default sementara. Jangan mengubah seluruh teks menjadi uppercase.

## 6. Ikon

- Sumber wajib: **Icons8** — https://icons8.com/icons.
- Gunakan satu keluarga **Windows 11 Outline** untuk tampilan modern dan clean, kecuali frame Figma menetapkan varian lain.
- Jangan mencampur Lucide, Font Awesome, emoji, ikon 3D, dan ikon berwarna penuh dalam navigasi yang sama.
- Gunakan satu warna dan bounding box konsisten. Ukuran mengikuti Figma; `24 × 24 px` hanya fallback jika ukuran belum tersedia.
- Pilih aset yang tetap terbaca pada ukuran navigasi. Sesuaikan posisi secara optik tanpa mengubah layout utama.
- Simpan aset yang telah dipilih secara lokal sesuai struktur proyek. Catat sumber dan ikuti ketentuan lisensi/atribusi aset Icons8 yang digunakan.
- Ikon dekoratif memakai `aria-hidden="true"`; tombol hanya ikon wajib memiliki nama aksesibel dan tooltip.

### Pemetaan sidebar Staff

Nama di bawah merupakan kata kunci pencarian Icons8, bukan nama komponen React atau ID aset yang telah ditetapkan.

| Menu sesuai referensi | Kata kunci | Representasi |
| --- | --- | --- |
| Dashboard | Dashboard | Grid atau panel ringkasan |
| Pantau Presensi | Attendance | Daftar kehadiran |
| Penempatan Prakerin | User | Gambar orang user |
| Jadwal dan Lokasi | Schedule | Kalender dengan jam |
| Pengajuan Izin | Document | Dokumen pengajuan |
| Rekap Presensi | Report | Dokumen dengan grafik |
| Settings | Settings | Roda gigi |
| Logout | Logout | Panah keluar |

Pertahankan label dan urutan sesuai screenshot. Jangan mengganti semua ikon menjadi rumah. Pemilihan ikon berbeda sesuai fungsi merupakan penyesuaian yang diminta; geometri sidebar tetap mengikuti Figma.

## 7. Layout dan komponen

### Sidebar, header dan footer

- Sidebar, header dan footer sudah ada di folder components
- isi sidebar, header dan footer berikan pengkondisian dengan mengikuti role yang login saat ini (ada 3 role yaitu peserta, staff dan super admin).
- Ikuti bentuk sidebar biru, area ikon di kiri, area brand SIGMA di atas, serta posisi menu pada screenshot.
- Pertahankan bentuk highlight terang dan lengkung menu aktif sesuai referensi.
- Tempatkan Settings dan Logout di bagian bawah dengan pemisah sesuai referensi.
- Gunakan satu sumber state rute aktif. Tambahkan `aria-current="page"` pada tautan aktif.
- Navigasi halaman menggunakan link; Logout menggunakan button karena menjalankan aksi.
- Jangan memperlebar sidebar, mengubah radius, atau menambahkan submenu tanpa kebutuhan yang disetujui.

### Konten utama dan card

- Jaga alignment judul, filter, card, dan tabel mengikuti frame.
- Gunakan judul singkat, satu deskripsi ringkas bila perlu, dan aksi utama yang mudah ditemukan.
- Hindari card berisi informasi yang sama, sambutan panjang, serta ikon dekoratif tanpa fungsi.
- Gunakan border atau elevation ringan sesuai Figma; jangan menumpuk keduanya tanpa kebutuhan.
- Background card menggunakan `var(--sigma-card-background)` dengan nilai `#E6E6E6`.

### Tabel, form, dan kalender

- Tabel memiliki header jelas, alignment konsisten, dan aksi baris yang ringkas.
- Jangan memotong informasi penting tanpa cara melihat isinya.
- Gunakan label form yang terlihat. Placeholder tidak menggantikan label.
- Tampilkan validasi dekat field dengan bahasa singkat dan tindakan perbaikan yang jelas.
- Hari, tanggal, dan kalender menggunakan letter spacing `0.06em` serta ukuran dari Figma.
- Status presensi dan izin harus terbaca melalui teks, bukan hanya warna.

## 8. Interaksi dan responsivitas

- Definisikan state default, hover, focus-visible, active/selected, disabled, dan loading untuk kontrol interaktif.
- Pertahankan indikator fokus keyboard. Gunakan transisi ringan bila diperlukan dan hormati `prefers-reduced-motion`.
- Sediakan keadaan loading, data kosong, error, dan berhasil tanpa menambah konten dekoratif.
- Desktop mengikuti frame Figma. Tablet/mobile mengikuti frame masing-masing jika tersedia.
- Jika frame mobile belum ada, catat adaptasi yang dipilih: sidebar menjadi drawer, konten tersusun vertikal, dan tabel dapat di-scroll dalam kontainernya.
- Jangan mengecilkan seluruh halaman sebagai gambar agar muat. Hindari overflow horizontal pada halaman; overflow tabel boleh terlokalisasi.

## 9. Implementasi React dan CSS Modules

### 9.1. Keputusan styling wajib

- Gunakan **CSS Modules** (`*.module.css`) untuk styling komponen, layout, dan halaman React.
- CSS global hanya untuk reset, pemuatan font, token `:root`, serta aturan dasar dokumen. Jangan menaruh style sidebar, card, atau halaman di global stylesheet.
- Jangan menambahkan Tailwind, CSS-in-JS, Sass, atau library UI baru untuk pekerjaan ini. Jika proyek masih memakai Tailwind, pindahkan styling komponen yang sedang dikerjakan secara bertahap tanpa merusak komponen lain; jangan melakukan migrasi seluruh aplikasi di luar scope.
- Pertahankan router, dependensi lain, backend, database, dan alur bisnis yang sudah ada.
- Material Design diterapkan melalui desain dan interaksi; tidak mewajibkan Material UI.
- Gunakan CSS variables untuk token bersama. Gunakan props, atribut, atau class lokal untuk variasi visual dan state.

### 9.2. Syntax dan penamaan yang clean

- Nama komponen memakai PascalCase: `Sidebar.tsx`. Pasangan stylenya wajib `Sidebar.module.css` di folder yang sama.
- Import stylesheet menggunakan nama `styles`: `import styles from './Sidebar.module.css';`.
- Nama class menggunakan camelCase dan menjelaskan fungsi: `.sidebar`, `.iconRail`, `.navList`, `.navItem`, `.navItemActive`, `.footer`.
- Akses dengan `styles.navItem`; hindari nama seperti `.box1`, `.abc`, `.blueThing`, atau singkatan yang tidak jelas.
- Gunakan satu declaration per baris, indentasi dua spasi, dan satu baris kosong antarrule. Ikuti formatter proyek jika sudah tersedia.
- Susun properti secara konsisten: positioning → layout → ukuran/spacing → tipografi → warna/border/shadow → interaksi/transisi.
- Utamakan selector class lokal yang datar. Pseudo-class, pseudo-element, dan selector atribut boleh dipakai untuk state atau detail bentuk. Hindari selector keturunan panjang dan ketergantungan pada urutan DOM yang rapuh.
- Hindari `!important`, ID selector untuk styling, `:global` tanpa kebutuhan integrasi yang jelas, dan selector elemen yang menyebar ke seluruh komponen.
- Jangan menduplikasi aturan untuk setiap role. Gunakan struktur komponen bersama dengan data menu sesuai role.
- Gabungkan class kondisional secara terbaca. Jangan memasang dependency penggabung class hanya untuk kebutuhan sederhana.
- Hindari inline style untuk desain statis. Inline style boleh untuk nilai dinamis yang benar-benar berasal dari data, melalui CSS custom property bila sesuai.
- Gunakan Grid/Flexbox untuk layout. Gunakan absolute positioning dan `::before`/`::after` hanya untuk detail bentuk sidebar yang membutuhkannya.
- Jangan membuat abstraksi, utility class, atau shared component sebelum ada kebutuhan penggunaan ulang yang nyata.

### 9.3. Contoh pasangan komponen dan module

Contoh ini menunjukkan pola penulisan, bukan ukuran final Figma. Isi `href`, label, dan status aktif diberikan oleh konfigurasi menu/router proyek.

```tsx
import type { ReactNode } from 'react';
import styles from './SidebarItem.module.css';

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  isActive: boolean;
};

export function SidebarItem({
  href,
  label,
  icon,
  isActive,
}: SidebarItemProps) {
  const itemClassName = [
    styles.navItem,
    isActive ? styles.navItemActive : '',
  ].filter(Boolean).join(' ');

  return (
    <a
      href={href}
      className={itemClassName}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </a>
  );
}
```

Jika proyek memakai router React, gunakan komponen link router yang sudah tersedia agar navigasi internal tidak memuat ulang dokumen. Jangan membuat state rute aktif kedua di luar router.

```css
.navItem {
  display: flex;
  align-items: center;
  font-family: var(--sigma-font-family);
  letter-spacing: var(--sigma-tracking-text);
  text-decoration: none;
}

.navItemActive {
  color: var(--sigma-orange);
  background-color: var(--sigma-background);
}

.navItem:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}

.icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.label {
  min-width: 0;
}
```

Ukuran, gap, padding, radius, dan warna state selain yang sudah ditetapkan harus dilengkapi dari Figma. Jangan menganggap contoh di atas sebagai komponen siap produksi atau spesifikasi ukuran final.

### 9.4. Token dan stylesheet global

Tempatkan token di `styles/tokens.css`, lalu import sekali dari `styles/globals.css`. Contoh lokasi relatif mengikuti folder frontend yang sebenarnya.

```css
/* styles/tokens.css */
:root {
  --sigma-navy: #244e96;
  --sigma-orange: #d7a156;
  --sigma-background: #dadada;
  --sigma-sub-navy: #2c58a2;
  --sigma-text: #535151;
  --sigma-card-background: #e6e6e6;
  --sigma-font-family: 'Poppins', 'Plus Jakarta Sans', sans-serif;
  --sigma-tracking-title: 0.05em;
  --sigma-tracking-text: 0.06em;
}
```

```css
/* styles/globals.css */
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--sigma-font-family);
  color: var(--sigma-text);
  background-color: var(--sigma-background);
}

button,
input,
select,
textarea {
  font: inherit;
}
```

Muat Poppins sesuai mekanisme aset proyek; menulis `font-family` saja tidak memuat font. Plus Jakarta Sans hanya fallback jika tersedia, bukan pengganti Poppins. Import `globals.css` sekali dari entry frontend. Class judul, card, tabel, dan navigasi tetap berada pada module pemiliknya dan mengambil token di atas.

## 10. Penempatan file/folder dan root yang clean

### 10.1. Periksa struktur sebelum menulis file

- Identifikasi root repository, root frontend, entry React, konfigurasi router, serta folder komponen dan halaman yang sudah ada.
- Jangan menganggap `src/` di root repository selalu merupakan frontend; proyek dapat memisahkan frontend dan backend.
- Pertahankan pola MVC dan lokasi halaman/views yang sudah ditetapkan proyek. Jangan membuat folder `pages/` baru jika halaman sudah dikelola di `views/`.
- Sidebar, Header, dan Footer sudah tersedia di `components`. Gunakan dan lengkapi komponen tersebut; jangan membuat salinan lain di setiap role.
- Sebelum membuat file, tentukan pemilik, tanggung jawab, cakupan pemakaian, dan lokasi yang sesuai. Jangan menaruh file di folder yang kebetulan sedang dibuka.

### 10.2. Aturan penempatan

| Jenis file | Lokasi/tanggung jawab |
| --- | --- |
| Konfigurasi build, package manager, TypeScript | Root package frontend sesuai struktur yang sudah ada |
| `DESIGN.md` | Lokasi dokumentasi proyek yang disepakati; jangan menduplikasi pedoman |
| Reset, font, token desain | Folder `styles` frontend |
| Komponen bersama | Folder `components` yang sudah tersedia |
| Layout halaman bersama | Folder layout yang sudah tersedia; jika belum ada, buat satu lokasi yang jelas di frontend |
| Halaman tiap role | Folder halaman/views yang sudah tersedia, mengikuti role dan konvensi proyek |
| Komponen khusus satu halaman | Di dekat halaman pemiliknya; pindahkan ke shared hanya setelah dipakai ulang |
| CSS Module | Berdampingan dengan komponen/halaman pemiliknya |
| Konfigurasi menu berdasarkan role | Lokasi konfigurasi navigasi frontend; pisahkan data menu dari geometri sidebar |
| Aset Icons8 dan brand | Folder aset frontend yang sudah ada; kelompokkan berdasarkan fungsi |
| Hook dan helper | Ikuti folder yang sudah ada; logika khusus halaman tetap dekat pemiliknya |

### 10.3. Contoh struktur acuan

Struktur ini contoh untuk frontend baru, bukan perintah memindahkan seluruh proyek. Nama `views`, subfolder role, dan lokasi layout harus disesuaikan dengan struktur aktual yang telah disepakati.

```text
<frontend-root>/
  src/
    main.tsx
    styles/
      globals.css
      tokens.css
    assets/
      icons/
        icons8/
      images/
    config/
      navigation.ts
    components/
      Sidebar/
        Sidebar.tsx
        Sidebar.module.css
        SidebarItem.tsx
        SidebarItem.module.css
      Header/
        Header.tsx
        Header.module.css
      Footer/
        Footer.tsx
        Footer.module.css
    layouts/
      DashboardLayout/
        DashboardLayout.tsx
        DashboardLayout.module.css
    views/
      staff/
        Dashboard/
          Dashboard.tsx
          Dashboard.module.css
          components/
            AttendanceSummary.tsx
            AttendanceSummary.module.css
      peserta/
      superAdmin/
```

- Jangan membuat `components/common`, `components/shared`, dan `shared/components` bersamaan untuk tanggung jawab yang sama.
- Jangan menaruh page di `components`, CSS halaman di global, atau aset di root `src` secara acak.
- Jangan membuat semua folder contoh jika belum ada file yang membutuhkannya.
- Gunakan folder public hanya untuk aset yang perlu diakses melalui URL publik tetap. Gunakan aset yang di-import untuk kebutuhan komponen sesuai mekanisme bundler proyek.
- Nama folder/file harus konsisten dan cocok dengan import, termasuk huruf besar-kecil pada Linux.
- Hindari barrel export berlapis dan circular dependency. Gunakan alias import hanya jika sudah dikonfigurasi.
- Pemindahan file hanya dilakukan saat diperlukan dalam lingkup tugas. Update seluruh import terkait dan hapus file lama yang benar-benar digantikan agar tidak ada dua sumber implementasi.
- Pembagian menu berdasarkan role mengatur tampilan navigasi; otorisasi akses tetap menjadi tanggung jawab mekanisme autentikasi/otorisasi proyek.

## 11. Alur pengerjaan dan kriteria selesai

1. Baca halaman terkait dan identifikasi komponen yang sudah tersedia.
2. Inventarisasi frame Figma: viewport, ukuran, jarak, font, warna, ikon, dan state.
3. Catat konflik atau ukuran yang belum diketahui; kerjakan bagian yang tidak bergantung pada konflik tersebut.
4. Implementasikan perubahan UI dalam ruang lingkup yang diminta.
5. Bandingkan screenshot hasil render dengan Figma pada viewport yang sama. Periksa geometri, alignment, ukuran, spacing, dan warna.
6. Verifikasi navigasi, state aktif, tombol, form, fokus keyboard, dan layout pada ukuran layar relevan.
7. Jalankan pemeriksaan build/type/lint yang tersedia dan relevan pada proyek.
8. Laporkan perubahan, hasil verifikasi, dan bagian yang belum final secara singkat.

Checklist penerimaan:

- [ ] Layout dan ukuran mengikuti referensi halaman terkait.
- [ ] Poppins dimuat dan digunakan secara konsisten.
- [ ] Letter spacing judul 0.05em; kategori teks yang ditetapkan 0.06em.
- [ ] Warna menggunakan token sesuai brief.
- [ ] Background card menggunakan token `#E6E6E6` sesuai revisi.
- [ ] Ikon Icons8 satu keluarga dan mewakili fungsi menu.
- [ ] Menu Staff sesuai screenshot dan rute aktif bekerja.
- [ ] Tidak ada teks, elemen, atau dependensi tambahan tanpa kebutuhan.
- [ ] Konten terbaca, fokus keyboard terlihat, dan status tidak hanya memakai warna.
- [ ] Tidak ada perubahan di luar ruang lingkup UI yang diminta.
- [ ] Klaim kesesuaian Figma didukung perbandingan visual, bukan asumsi.

- [ ] Style komponen dan halaman menggunakan CSS Modules dengan penamaan yang jelas.
- [ ] Style global hanya berisi aturan dasar, font, dan token bersama.
- [ ] CSS Module berada di dekat komponen/halaman pemiliknya.
- [ ] Penempatan file mengikuti root frontend dan struktur aktual proyek.
- [ ] Tidak ada komponen duplikat, folder paralel dengan fungsi sama, atau import rusak.
