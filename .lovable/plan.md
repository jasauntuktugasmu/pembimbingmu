
## Tujuan

Di dalam editor konten artikel (TipTap), tambahkan:
1. **Upload gambar inline** langsung dari perangkat (bukan hanya prompt URL).
2. **Blok "Baca Juga"** — sisipkan satu/lebih rekomendasi artikel (dipilih dari artikel `published` yang sudah ada) di posisi kursor.

Keduanya tersimpan sebagai bagian dari `content` (JSON TipTap) + `content_html`, sehingga tampil otomatis di halaman publik `/blog/:slug`.

## Perubahan

### 1. Toolbar editor (`TiptapToolbar.tsx`)
- Tombol **Image** diubah: buka menu kecil dengan dua opsi:
  - **Upload dari komputer** → trigger `<input type="file">` tersembunyi → upload ke bucket `package-images` folder `blog/inline/` → minta alt text → insert `setImage({src,alt})`.
  - **Dari URL** (perilaku lama, tetap dipertahankan).
- Tombol baru **Baca Juga** (ikon BookOpen) → buka dialog pemilih artikel.

Toolbar perlu menerima callback dari `ArticleEditor` (untuk akses `uploadImage` dan dialog state), jadi prop di-extend: `onUploadImage`, `onInsertRelated`.

### 2. Ekstensi TipTap baru: `BacaJugaNode`
File baru `src/components/blog/editor/extensions/BacaJugaNode.ts`:
- Custom Node TipTap (`group: "block"`, `atom: true`, `selectable: true`).
- Attributes: `articleIds: string[]` (atau lebih sederhana: array `{id, title, slug, image}` di-cache supaya render HTML lengkap tanpa fetch).
- `renderHTML`: keluarkan markup statis (div) dengan class `baca-juga-block` dan link `<a href="/blog/{slug}">`. Karena `content_html` disimpan & di-render di publik dengan DOMPurify, struktur HTML-nya harus self-contained.
- `parseHTML`: kenali `div[data-baca-juga]` agar editor bisa re-load saat edit artikel.
- `addNodeView` (React): tampilkan kartu cantik di dalam editor dengan tombol hapus + edit pilihan.

### 3. Dialog pemilih artikel
Komponen baru `src/components/blog/editor/RelatedArticlePickerDialog.tsx`:
- Query `blog_articles` `status='published'`, exclude artikel yang sedang diedit.
- Search box + checkbox multi-select (limit 5).
- Tombol "Sisipkan" → panggil `editor.chain().focus().insertContent({ type: "bacaJuga", attrs: { items: [...] }}).run()`.

### 4. `ArticleEditor.tsx`
- Daftarkan ekstensi `BacaJugaNode` di `useEditor`.
- State `relatedPickerOpen`, render `RelatedArticlePickerDialog`.
- Helper `insertInlineImage(file)` reuse `uploadImage` lalu `editor.chain().focus().setImage(...).run()`.
- Pass callback ke `TiptapToolbar`.

### 5. Render publik (`src/pages/blog/BlogDetail.tsx`)
- Tambah `div[data-baca-juga]` + `a` ke allowlist DOMPurify (default sudah mengizinkan, jadi cukup pastikan `ADD_ATTR: ['data-baca-juga']`).
- Tambah CSS di `src/index.css` untuk class `.baca-juga-block` (kotak highlight dengan border + judul "Baca Juga") supaya konsisten di editor maupun halaman publik.

### 6. Tidak diubah
- Schema database (semua tersimpan di kolom `content`/`content_html` yang sudah ada).
- Tabel `blog_related_articles` tetap untuk "related otomatis di bawah artikel" — fitur baru ini independen (inline di tengah konten).

## Catatan
- Gambar inline diupload ke bucket existing `package-images` (sudah public).
- Pemilihan artikel rekomendasi minimal 1, maksimal 5 per blok. Blok bisa disisipkan beberapa kali di posisi berbeda.
- Saat editor dimuat ulang dari `content_html`, `parseHTML` `BacaJugaNode` akan mengubah div kembali jadi node interaktif.
