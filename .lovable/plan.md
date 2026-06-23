## Tambah Section "Artikel Terbaru" di Halaman Utama

Menambahkan slider 5-6 artikel terbaru di halaman utama, tepat di bawah section "Hubungi Kami", dengan tombol untuk melihat semua artikel.

### Yang akan dibangun

1. **Section baru "Artikel Terbaru"** di `src/pages/Index.tsx`
   - Disisipkan setelah section Hubungi Kami (sebelum `<footer>`)
   - Heading: "Artikel Terbaru" + sub-judul singkat
   - Background putih agar kontras dengan section abu-abu di atasnya
   - Tombol "Lihat Semua Artikel" (mengarah ke `/blog`) di kanan heading (desktop) atau di bawah slider (mobile)

2. **Komponen slider baru** `src/components/LatestArticlesSlider.tsx`
   - Mengambil 6 artikel terbaru dari Supabase (`blog_articles` status `published`, order `published_at desc`, limit 6)
   - Menggunakan komponen `Carousel` shadcn (Embla) yang sudah tersedia di project
   - Menampilkan kartu artikel: thumbnail (rasio 16:9, rounded sesuai memori desain), kategori (badge), judul (line-clamp-2), excerpt singkat, tanggal & reading time
   - Klik kartu → menuju `/blog/:slug`
   - Responsif: 1 kartu (mobile), 2 (tablet), 3 (desktop)
   - Tombol panah prev/next, autoplay halus opsional (transisi 300ms sesuai memori)
   - State loading: skeleton; state kosong: tidak menampilkan section

3. **Tombol "Lihat Semua Artikel"**
   - Variant solid hijau brand `#81b59a` dengan ikon `ArrowRight`
   - `<Link to="/blog">` dari `react-router-dom`

### Catatan teknis

- Reuse pola query dari `BlogList.tsx` agar konsisten.
- Tidak ada perubahan database, tidak ada perubahan routing — `/blog` sudah ada.
- Mengikuti palette brand sage green dan animasi smooth 300ms (memori proyek).
- Tidak mengubah konten lain di Index.

### File yang berubah

- Baru: `src/components/LatestArticlesSlider.tsx`
- Edit: `src/pages/Index.tsx` (sisipkan section + import)
