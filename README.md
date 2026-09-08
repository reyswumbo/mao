# 99app — Web Comic & Video Reader

> **Baca komik, nonton anime — nyaman.** Dua mode dalam satu aplikasi, sumber
> tunggal per mode: [Komiku](https://komiku.org/) untuk komik & [AnimeXin](https://animexin.dev/)
> untuk video, dengan desain UI/UX **orisinil** (tidak menyalin situs sumber)
> dan fokus **mobile-first** di semua perangkat.

## Fitur

### Mode Baca Komik

- **Beranda** — “Populer” (peringkat Komiku), section “Baru Ditambahkan”, dan
  deretan per genre. Desain kartu & hero sendiri.
- **Katalog** — jelajah seluruh komik urut abjad (`# A–Z`) dengan saringan
  **tipe** (Manga/Manhwa/Manhua), **status** (On Going/Tamat), pagination
  “Muat Lainnya”.
- **Pencarian** — pencarian instan via REST WordPress Komiku, dengan hasil
  yang bisa langsung dipakai.
- **Detail komik** — poster, sinopsis, info pengarang/ilustrasi, tag genre,
  daftar bab (hingga ribuan) lengkap dengan **pencarian bab** dan
  **penanda bab terakhir dibaca**.
- **Pembaca (reader)** — inti dari challenge:
  - Mode **gulir vertikal** dan **per-halaman**.
  - Pengaturan baca: **lebar lembar** (S/M/L), **tema area** (Gelap/Abu/Terang),
    **jarak antar halaman**, kontrol **sembunyikan otomatis**.
  - **Navigasi bab**: prev/next bab dari toolbar, tombol bawah (mode per-halaman),
    dan tombol di akhir bab (mode gulir).
  - **Layar penuh** (desktop), dukungan **keyboard** panah pada mode per-halaman.
  - **Bar progres** baca yang selalu terlihat.
  - **Lanjut Membaca** tersimpan di `localStorage` per perangkat — posisi baca
    dipulihkan otomatis saat kembali ke bab yang sama.

### Mode Nonton Video

- **Hamburger** — pindah mode Baca Komik ↔ Nonton Video dari pita atas
  (logo & navigasi bawah ikut menyesuaikan mode aktif).
- **Beranda video** — deretan “Populer” dan “Rilis Terbaru” + “Muat lainnya”
  (pagination browse `/anime/`).
- **Pencarian video** — cari judul anime/donghua via jalur `/search/`.
- **Detail seri** — poster, status, studio/jaringan, rating, genre, sinopsis,
  dan daftar episode (nomor + tanggal).
- **Pemutar** — pilih **server** (mirror) dengan pilihan sub judul, navigasi
  episode sebelumnya/berikutnya, dan tautan kembali ke daftar episode.
  Beberapa server menampilkan iklan singkat di awal video.

### Bersama

- **Performansi** — gambar `<img>` native + lazy-loading, kamera fetch antar
  bab memakai cache memori TTL, halaman beranda/detail server-rendered.
- **Aksesibilitas** — kontras tema terang/gelap, `aria-label` pada seluruh
  kontrol, `prefers-reduced-motion`, target sentuh yang cukup besar.
- **PWA-ready** — `manifest.webmanifest`, ikon aplikasi, tema per skin.

## Teknologi

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS** dengan token desain kustom (palet “kertas hangat”,
  aksen vermilion; font Manrope + Fraunces)
- TypeScript ketat; UI Bahasa Indonesia

## Struktur

```
src/
  app/
    api/            # REST internal {home, katalog, cari, komik, bab,
                    #               nonton/home, nonton/cari, nonton/feed,
                    #               nonton/seri, nonton/ep}
    baca/[bab]/     # halaman pembaca
    nonton/         # beranda video, cari, detail seri, pemutar ep
    cari/           # halaman pencarian komik
    katalog/        # halaman katalog
    komik/[slug]/   # halaman detail komik
    layout.tsx      # layout root global
    globals.css     # tema & token desain
  components/       # UI (Hero, ComicCard, VideoCard, Reader, MenuDrawer, dll.)
  lib/              # lapisan data & logika lokal
    config/source.ts # konfigurasi sumber & modul (komiku.org, animexin.dev)
    html.ts          # fetch HTML + cache + deteksi DDoS-Guard
    komiku.ts        # parser & adapter sumber komik
    animexin.ts      # parser & adapter sumber video
    reader-store.ts  # localStorage lanjut-baca & pengaturan
    types.ts         # model data bersama
```

## Pengembangan

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

## Deploy

Sudah disiapkan untuk **Vercel** (`vercel.json`, no runtime konfigurasi
khusus). Sumber diakses langsung dari serverless.

```bash
npx vercel --prod
```

## Catatan teknis

- Data komik diambil dari halaman publik Komiku; genre/hot page bersifat
  JS-driven sehingga tidak di-scrape — beranda + katalog dipakai sebagai
  permukaan data yang server-rendered.
- Data video diambil dari AnimeXin; halaman depan, `wp-json`, dan `/page/N`
  diblokir **Cloudflare challenge** dari IP pusat data, sehingga memakai
  halaman `/anime/` (urutan `popular`/`update`, pagination `?page=N`) dan
  pencarian `/search/` yang tetap terbuka.
- Image CDN Komiku disajikan apa adanya (host `*.komiku.to`), dengan
  lazy-loading & ukuran sesuai mode.
- Posisi baca disimpan hanya **di perangkat pengguna** (`localStorage`),
  tanpa akun maupun server backend.