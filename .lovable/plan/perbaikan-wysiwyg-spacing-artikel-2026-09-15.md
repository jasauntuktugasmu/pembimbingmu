# Perbaikan WYSIWYG Spacing Artikel

## Temuan terverifikasi

- Editor memakai TipTap `StarterKit` dan menyimpan dua representasi sekaligus: dokumen JSON pada `content` dan HTML pada `content_html`.
- Save draft, publish, dan update melewati fungsi penyimpanan yang sama tanpa `trim` atau regex pada konten.
- Trigger database hanya menormalisasi salinan teks sementara untuk menghitung jumlah kata; nilai `content` dan `content_html` yang disimpan tidak diubah.
- Data artikel terbaru di Supabase masih memuat node paragraf kosong pada JSON dan tag `<p></p>` pada HTML, termasuk beberapa paragraf kosong berurutan.
- DOMPurify pada halaman publik mempertahankan tag paragraf kosong. Akar masalahnya adalah perilaku HTML/CSS: `<p></p>` tidak menghasilkan tinggi baris secara alami, sehingga jarak terlihat hilang meskipun datanya masih tersimpan.
- Admin dan writer memakai komponen `ArticleEditor` yang sama, jalur penyimpanan yang sama, dan renderer publik yang sama. Tidak diperlukan perubahan permission atau implementasi terpisah.

## Perubahan

1. **Samakan aturan spacing editor dan artikel publik**
   - Jadikan paragraf kosong TipTap sebagai baris yang benar-benar memiliki tinggi sesuai line-height.
   - Terapkan aturan yang sama pada area editor dan konten publik, termasuk beberapa paragraf kosong berurutan.
   - Pertahankan spacing dari struktur dokumen; tidak menggantinya dengan margin besar pada seluruh paragraf.

2. **Perkuat persistence tanpa mengubah format artikel lama**
   - Tetap simpan JSON TipTap dan HTML lengkap tanpa normalisasi whitespace.
   - Saat membuka artikel lama, prioritaskan dokumen JSON yang tersimpan sebagai sumber struktur; gunakan HTML sebagai fallback agar artikel lama tetap kompatibel.
   - Pastikan perubahan isi editor selalu menyinkronkan JSON dan HTML sebelum insert/update.

3. **Pertahankan sanitization aman**
   - Audit konfigurasi DOMPurify dan pastikan elemen format yang didukung editor tetap lolos: paragraf kosong, `<br>`, heading, list, bold, italic, blockquote, link, gambar, alignment, dan blok “Baca Juga”.
   - Tidak melonggarkan sanitization untuk script atau atribut berbahaya.

4. **Uji seluruh siklus artikel**
   - Uji satu dan beberapa paragraf kosong: editor → draft → refresh → edit ulang.
   - Uji publish → halaman publik → edit → publish ulang.
   - Bandingkan struktur JSON/HTML sebelum dan sesudah penyimpanan untuk memastikan empty paragraph tidak hilang.
   - Jalankan alur yang sama sebagai superadmin dan writer; pastikan heading, bold/italic, link, list, blockquote, gambar, alignment, “Baca Juga”, dan artikel lama tetap normal.
   - Verifikasi tampilan pada desktop dan mobile.

## Batas perubahan

- Tidak membangun ulang editor.
- Tidak mengubah schema database, RLS, role, atau permission.
- Tidak menambahkan behavior berbeda per role.
- Perubahan difokuskan pada sinkronisasi konten, pemuatan ulang, sanitization, dan rendering spacing.
