# 99app — Web Comic Reader Challenge

> **Baca komik, nyaman.** Platform baca komik berbasis web, sumber tunggal
> [Komiku](https://komiku.org/), dengan desain UI/UX **orisinil** (tidak
> menyalin situs sumber) dan fokus **mobile-first** di semua perangkat.

## Fitur

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
    api/            # REST internal {home, katalog, cari, komik, bab}
    baca/[bab]/     # halaman pembaca
    cari/           # halaman pencarian
    katalog/        # halaman katalog
    komik/[slug]/   # halaman detail
    layout.tsx      # layout root global
    globals.css     # tema & token desain
  components/       # UI (Hero, ComicCard, Reader, ChapterList, dll.)
  lib/              # lapisan data & logika lokal
    config/source.ts # konfigurasi sumber (komiku.org)
    html.ts          # fetch HTML + cache + deteksi DDoS-Guard
    komiku.ts        # parser & adapter sumber
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

- Semua data diambil dari halaman publik Komiku; genre/hot page bersifat
  JS-driven sehingga tidak di-scrape — beranda + katalog dipakai sebagai
  permukaan data yang server-rendered.
- Image CDN Komiku disajikan apa adanya (host `*.komiku.to`), dengan
  lazy-loading & ukuran sesuai mode.
- Posil baca disimpan hanya **di perangkat pengguna** (`localStorage`),
  tanpa akun maupun server backend.