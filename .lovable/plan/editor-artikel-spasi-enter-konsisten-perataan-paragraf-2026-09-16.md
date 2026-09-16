# Editor Artikel: Spasi Enter Konsisten + Perataan Paragraf

## Masalah yang ditemukan

1. **Tampilan editor dan halaman publik tidak dibuat dari aturan yang sama.**
   Area menulis memakai aturan jaraknya sendiri (jarak antar paragraf 0.9em), sedangkan halaman artikel publik memakai gaya bawaan `prose` dari Tailwind (jarak 1.25em, ukuran huruf berbeda). Jadi hasil ketikan tidak pernah persis sama dengan hasil terbit, walau isinya identik.

2. **Baris kosong tidak selalu bertahan.**
   Baris kosong hanya "punya tinggi" bila bentuknya `<p></p>` atau `<p><br></p>`. Artikel yang dibuat/disunting lewat jalur lain (artikel lama, tempel dari Word/Google Docs) bisa menghasilkan paragraf berisi spasi saja, yang tidak kena aturan itu — itulah kenapa sebagian enter muncul dan sebagian hilang. Perbaikan sebelumnya hanya menyentuh tulisan baru yang disimpan ulang.

3. **Belum ada pengaturan rata teks** (kiri, tengah, kanan, rata kanan-kiri) di editor.

## Yang akan dikerjakan

### 1. Satu gaya untuk editor dan artikel terbit
- Membuat satu set aturan tampilan artikel (huruf, ukuran, tinggi baris, jarak antar paragraf, judul, daftar, kutipan, gambar) yang dipakai bersama oleh area menulis dan halaman artikel publik.
- Melepas gaya `prose` bawaan di halaman artikel agar tidak menimpa aturan tersebut.
- Hasil: apa yang terlihat saat menulis = apa yang dilihat pembaca.

### 2. Baris kosong selalu bertahan
- Saat menyimpan (draft maupun terbit), setiap paragraf kosong — termasuk yang hanya berisi spasi — dinormalkan ke bentuk baku yang selalu punya tinggi satu baris.
- Saat artikel lama dibuka untuk disunting, normalisasi yang sama dijalankan, sehingga sekali disimpan ulang artikel lama ikut benar.
- Saat ditampilkan ke pembaca, paragraf kosong dalam bentuk apa pun (kosong, berisi `<br>`, berisi spasi) diberi tinggi satu baris. Ini menutup artikel lama yang belum pernah disimpan ulang.
- Beberapa enter berurutan tetap menghasilkan jarak sebanyak enter yang diketik.

### 3. Pengaturan rata teks
- Tombol baru di bilah alat editor: rata kiri, rata tengah, rata kanan, rata kanan-kiri (justify). Berlaku untuk paragraf dan judul.
- Perataan ikut tersimpan dan tampil sama persis di halaman artikel publik.

## Catatan teknis

- Tambah paket `@tiptap/extension-text-align`, dikonfigurasi untuk `paragraph` dan `heading`, default kiri; tombol di `TiptapToolbar.tsx` dengan status aktif.
- `serializeArticleContent` di `ArticleEditor.tsx` diperluas: paragraf tanpa teks bermakna (termasuk `&nbsp;`/spasi) diisi `<br>`; normalisasi yang sama dipakai saat memuat HTML artikel lama.
- `src/index.css`: gabungkan aturan editor dan `.article-content` dalam satu blok selektor bersama; tambahkan fallback tinggi baris kosong tanpa bergantung pada `:has` (styling `p > br:only-child` langsung) dan dukungan `[style*="text-align"]`.
- `BlogDetail.tsx`: hapus kelas `prose prose-slate`, pertahankan `article-content`; DOMPurify tetap mengizinkan `style` sehingga perataan lolos sanitasi — tidak ada pelonggaran keamanan lain.
- Tidak ada perubahan skema database, hak akses, atau alur simpan/publish. Judul, tebal, miring, tautan, daftar, gambar, kutipan, dan blok "Baca Juga" tidak diubah.

## Pengujian

- Tulis artikel dengan 1, 2, dan 5 enter berurutan → simpan draft → muat ulang → sunting → terbitkan → buka sebagai pembaca; jarak harus identik di setiap tahap.
- Buka artikel lama yang enter-nya sempat hilang dan pastikan tampil benar tanpa disimpan ulang.
- Uji keempat perataan pada paragraf dan judul, lalu cek hasilnya di halaman publik.
- Cek di ponsel, tablet, dan desktop.
