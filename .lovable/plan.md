
## Tujuan

Hilangkan `window.prompt` (alert dari atas browser) di editor artikel, ganti dengan dialog modal yang rapi. Tambah pengaturan ukuran gambar dengan rekomendasi siap pakai. Pastikan responsif di HP, tablet, dan desktop.

## Perubahan

### 1. Dialog baru: `ImageInsertDialog`
File baru `src/components/blog/editor/ImageInsertDialog.tsx` — modal shadcn `<Dialog>` dengan dua tab:
- **Upload** — drag-drop area + tombol pilih file, preview thumbnail setelah dipilih.
- **Dari URL** — input URL + preview otomatis.

Field bersama di bawah preview:
- **Alt text** (wajib, dengan helper "penting untuk SEO").
- **Ukuran tampilan** — pilihan chip:
  - Kecil (300px) — cocok untuk ikon/diagram kecil
  - Sedang (600px) — default, untuk kebanyakan gambar konten
  - Besar (900px) — untuk screenshot/ilustrasi penting
  - Penuh (100%) — full-width artikel
  - Custom (px) — input angka manual
- **Perataan** — kiri / tengah / kanan (tombol toggle).
- Catatan rekomendasi: "Rasio 16:9 atau 4:3, max 1600px, format JPG/WebP <300KB untuk performa terbaik."

Tombol: Batal · Sisipkan (disabled sampai gambar + alt terisi).

Hasil insert ke TipTap: `setImage({ src, alt, width, 'data-align' })` — node Image dikonfigurasi menerima atribut `width` dan `data-align`.

### 2. Dialog baru: `LinkInsertDialog`
File baru `src/components/blog/editor/LinkInsertDialog.tsx` — modal kecil:
- Input URL (auto-prefix `https://` kalau kosong protokol)
- Checkbox "Buka di tab baru" (set `target="_blank" rel="noopener noreferrer nofollow"`)
- Tombol Batal · Sisipkan / Update · Hapus link (jika edit)

Menggantikan `window.prompt` untuk link.

### 3. Update TipTap Image extension (di `ArticleEditor.tsx`)
Extend `Image` dengan atribut tambahan supaya bisa simpan width/align:
```ts
Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null, renderHTML: a => a.width ? { style: `width:${typeof a.width==='number'?a.width+'px':a.width};` } : {} },
      'data-align': { default: 'center', renderHTML: a => ({ 'data-align': a['data-align'] || 'center' }) },
    };
  },
})
```
+ CSS di `index.css`: `.ProseMirror img[data-align="left"]{margin-right:auto;margin-left:0}` dst, `.baca-juga-block` & `img` sudah ada — tambah aturan align.

### 4. `TiptapToolbar.tsx`
Hapus `window.prompt` untuk link & image URL. Toolbar terima callback baru:
- `onInsertImage()` → buka `ImageInsertDialog`
- `onInsertLink()` → buka `LinkInsertDialog`
- `onInsertRelated()` (sudah ada)

Toolbar dibuat responsif: di mobile, tombol wrap dengan `flex-wrap gap-1`, label "Baca Juga" disembunyikan (`sm:inline`), tombol tetap 32px (mudah disentuh).

### 5. `ArticleEditor.tsx`
- Kelola state `imageDialogOpen`, `linkDialogOpen`.
- Render kedua dialog baru, kirim handler upload (reuse `uploadImage`) ke `ImageInsertDialog`.
- Pass callback ke toolbar.
- Hapus prop `onUploadImage` lama (logika upload pindah ke dalam dialog, tapi tetap pakai helper `uploadImage` lewat prop `onUpload`).

### 6. Responsif
- `ImageInsertDialog` & `RelatedArticlePickerDialog`: `max-w-xl` di desktop, `w-[95vw] max-h-[90vh] overflow-y-auto` di mobile.
- Grid editor: sudah `lg:grid-cols-3` — di tablet/mobile sidebar SEO turun ke bawah (sudah jalan).
- Toolbar: `flex flex-wrap`, tombol pakai size icon kompak.
- `RelatedArticlePickerDialog`: list pakai font/spacing yang nyaman di sentuhan (min h-target 44px).

## Tidak diubah

- Skema database (gambar tetap disimpan inline di `content_html` dengan style width).
- Halaman publik `/blog/:slug` otomatis menghormati `width` & `data-align` lewat CSS yang sama (akan ditambah di scope `.prose img[data-align]`).

## Catatan teknis

- DOMPurify config sudah meng-allow `style` & `data-align`? Default DOMPurify mengizinkan inline `style`. Tambah `ADD_ATTR: ['data-align','style']` di `BlogDetail.tsx` untuk jaga-jaga.
- Ukuran rekomendasi ditulis sebagai chip preset; user tetap bisa override via Custom.
