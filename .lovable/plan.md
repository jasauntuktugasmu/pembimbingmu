## Tujuan
Mengganti placeholder "Activity log akan ditampilkan di sini..." pada kartu **Recent Activity** di halaman `/admin` dengan daftar artikel terbaru beserta nama writer-nya, agar admin langsung tahu siapa yang menulis artikel apa.

## Perubahan
File: `src/pages/admin/AdminDashboard.tsx`

1. Tambahkan state `recentArticles` (5 item).
2. Pada `fetchDashboardStats`, ambil juga:
   ```ts
   supabase
     .from('blog_articles')
     .select('id, title, slug, status, published_at, updated_at, author_id, profiles!blog_articles_author_id_fkey(full_name)')
     .order('updated_at', { ascending: false })
     .limit(5)
   ```
3. Render di dalam kartu **Recent Activity**:
   - Setiap baris: judul artikel (link ke `/admin/blog/articles/{id}/edit`), badge status, nama writer (`profiles.full_name` atau "—"), dan waktu update (format singkat `id-ID`).
   - Empty state: "Belum ada artikel".
4. Tidak mengubah business logic lain, tidak ada perubahan DB / RLS.

## Catatan
- Foreign key `blog_articles_author_id_fkey` ke `profiles` sudah dipakai di `BlogArticlesList`, jadi query aman.
- Hanya UI/presentation pada satu file.
