
# Plan: Blog/Artikel + Role Writer + SEO

Fitur blog lengkap terintegrasi Supabase, dengan role baru **Writer**, editor TipTap, SEO real-time, dan halaman publik yang siap diindeks Google.

## 1. Database (Supabase)

Migrasi tunggal — semua tabel di `public` + GRANT + RLS + policy.

**Update enum role:** `user_role` ditambah nilai `writer`. Login → routing: superadmin ke `/admin`, writer ke `/writer`, subscriber ke `/subscriber`.

**Tabel baru:**

- `blog_categories` — `name, slug (unique), description, seo_title, meta_description`
- `blog_tags` — `name, slug (unique)`
- `blog_articles` — kolom lengkap:
  - Konten: `title, slug (unique), excerpt, content (jsonb TipTap), content_html (untuk SEO + reading time), featured_image, thumbnail_seo`
  - Author: `author_id (FK profiles), category_id (FK)`
  - Status: `status ('draft'|'published'|'archived'), published_at, updated_at, created_at`
  - Hitung otomatis: `reading_time_minutes, word_count`
  - SEO: `seo_title, meta_description, focus_keyword, meta_keywords, og_title, og_description, og_image, twitter_image, robots_meta, canonical_url, seo_score`
  - Stats: `views_count`
- `blog_article_tags` — pivot many-to-many
- `blog_related_articles` — pivot self-relasi (manual related)
- `blog_article_views` — log view (article_id, viewed_at, ip_hash) untuk statistik

**RLS policies (pakai `is_superadmin()` dan helper baru `is_writer()`):**

- Public (`anon` + `authenticated`): SELECT artikel `status='published'`, semua kategori/tag.
- Writer: SELECT/INSERT/UPDATE/DELETE artikel miliknya (`author_id = auth.uid()`). Bisa publish (mengubah status). Tidak bisa lihat artikel writer lain.
- Superadmin: full CRUD semua tabel blog + manage writer.
- `blog_article_views`: INSERT untuk semua (anon), SELECT untuk superadmin & author terkait.

GRANT: `anon SELECT` untuk tabel public-readable (artikel published, kategori, tag); `authenticated` full CRUD sesuai policy; `service_role ALL`.

**Trigger:** `updated_at`, auto-set `published_at` saat status pertama kali jadi `published`, auto-hitung `word_count` & `reading_time_minutes` dari `content_html`.

## 2. Edge Functions

- `create-writer` — verify_jwt=false, dipanggil dari panel admin. Input: nama/email/password. Pakai `SUPABASE_SERVICE_ROLE_KEY` → `auth.admin.createUser({ email_confirm: true })` (tanpa email verification), lalu set role `writer` di `profiles`. Caller diverifikasi sebagai superadmin via access token.
- `reset-writer-password` — admin only, update password via admin API.
- `increment-article-view` — insert ke `blog_article_views` + increment `views_count` (debounce per IP/session via ip_hash).

## 3. Frontend — Stack & Dependensi

`bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder react-helmet-async slugify`

Tambah `<HelmetProvider>` di `src/main.tsx`.

## 4. Admin Panel (superadmin) — `/admin/blog/*`

Menu baru di `AdminSidebar`:
- `/admin/blog/articles` — list semua artikel (filter status, kategori, author, search). Aksi: edit, publish/unpublish/archive, delete, lihat stats.
- `/admin/blog/articles/new` & `/admin/blog/articles/:id/edit` — form editor (lihat §6).
- `/admin/blog/categories` — CRUD kategori (+ SEO fields).
- `/admin/blog/tags` — CRUD tag.
- `/admin/blog/writers` — Management Writer (list, add, edit, deactivate, delete, reset password). Add writer = form Nama/Email/Password → panggil edge function `create-writer`.
- `/admin/blog/analytics` — dashboard statistik (lihat §7).

## 5. Writer Panel — `/writer/*`

Layout terpisah (mirip `SubscriberLayout`) dengan sidebar minimal:
- `/writer` — dashboard pribadi (artikel saya, total view, draft, published, avg SEO score).
- `/writer/articles` — list artikel milik sendiri.
- `/writer/articles/new` & `/writer/articles/:id/edit` — editor (sama dgn admin, tapi RLS membatasi ke artikelnya sendiri).

`ProtectedRoute` diperluas mendukung `requireRole="writer"`.

## 6. Article Editor (komponen `ArticleEditor`)

Layout: kiri konten utama, kanan sidebar SEO/meta.

- **Konten**: Title (auto-generate slug, bisa edit), TipTap editor (heading, bold, italic, list, link, image, code, blockquote), Excerpt, Featured Image + Thumbnail SEO (upload ke bucket `package-images` folder `blog/`), Kategori (select), Tags (multi-select dgn create-on-the-fly), Status, Publish Date.
- **SEO sidebar**: SEO Title, Meta Description, Focus Keyword, Meta Keywords, OG title/desc/image, Twitter image, Robots meta, Canonical URL.
- **SEO Analysis panel** (real-time, client-side):
  - Cek panjang SEO title (50–60) & meta description (150–160)
  - Focus keyword di: title, slug, H1/H2, paragraf pertama, meta description
  - Word count, jumlah H1/H2/H3, internal link count, external link count, image alt missing
  - Readability score (Flesch sederhana)
  - SEO Score 0-100 (weighted) ditampilkan dgn progress bar + checklist hijau/merah
- Related Articles: multi-select dari artikel published.

## 7. Dashboard Analytics

- Cards: Total Articles, Published, Draft, Archived, Total Views, Avg SEO Score.
- List: Most Viewed Articles (top 10), Most Viewed Categories, Top Authors (by views & jumlah artikel).
- Pakai `supabase` query agregat; view chart pakai `recharts` (sudah ada).

## 8. Frontend Publik (SEO-ready)

Routes baru (di `App.tsx`, public):
- `/blog` — Blog List (paginasi, filter kategori/tag, search). Helmet: title, description, og, canonical.
- `/blog/:slug` — Blog Detail. Helmet penuh: title (seo_title || title), meta description, canonical, og:*, twitter:*, robots. JSON-LD: Article + BreadcrumbList (+ FAQ jika ada). Tampilkan author, kategori, tags, reading time, related articles, share. Trigger `increment-article-view`.
- `/blog/kategori/:slug` — Category Page (artikel dalam kategori).
- `/blog/tag/:slug` — Tag Page.
- `/blog/penulis/:authorId` — Author Page + Author JSON-LD.
- `/blog/cari?q=` — Search Result Page.

Setiap halaman: Helmet meta + Breadcrumb component + JSON-LD. Render konten dari `content_html` dgn DOMPurify sanitize. Lazy load image (`loading="lazy"`), responsive img.

`index.html`: tambah sitewide WebSite JSON-LD; canonical dipindah ke Helmet per-route (sesuai head-meta knowledge).

## 9. SEO Technical

- **Sitemap dinamis**: `scripts/generate-sitemap.ts` (baru) — fetch artikel published, kategori, tag dari Supabase (pakai anon key dari env), tulis ke `public/sitemap.xml`. Hook `predev` & `prebuild` di `package.json`. Entries: `/`, `/blog`, tiap artikel, tiap kategori, tiap tag.
- **robots.txt**: sudah ada — tambah baris `Sitemap: https://pembimbingmu.lovable.app/sitemap.xml` (sudah ada juga, verifikasi).
- Structured data: Organization (sitewide), WebSite (sitewide search action), Article, BreadcrumbList, Person/Author, FAQ (jika field FAQ diisi).
- Clean URL slug (slugify), canonical self-reference, alt text wajib saat upload image di editor (warning jika kosong).

## 10. Catatan SSR

Project ini Vite SPA → Helmet menulis meta client-side. Googlebot mengeksekusi JS sehingga indexing tetap jalan. Crawler social (LinkedIn/Slack/Facebook) hanya melihat fallback di `index.html`. Per-artikel OG preview di sosmed tidak akurat tanpa SSR — akan saya catat di UI editor sebagai info.

---

## Technical Section

**Files dibuat:**
- Migrasi SQL (via tool) — enum + 6 tabel + GRANT + RLS + trigger + helper function `is_writer()`.
- `supabase/functions/create-writer/index.ts`, `reset-writer-password/index.ts`, `increment-article-view/index.ts` + entry di `supabase/config.toml`.
- `src/components/blog/editor/ArticleEditor.tsx`, `TiptapToolbar.tsx`, `SeoAnalysisPanel.tsx`, `seo-utils.ts`.
- `src/components/blog/public/ArticleCard.tsx`, `Breadcrumb.tsx`, `ArticleJsonLd.tsx`.
- `src/components/layout/WriterLayout.tsx`, `WriterSidebar.tsx`.
- `src/pages/admin/blog/*` (Articles, ArticleForm, Categories, Tags, Writers, Analytics).
- `src/pages/writer/*` (Dashboard, Articles, ArticleForm).
- `src/pages/blog/*` (BlogList, BlogDetail, CategoryPage, TagPage, AuthorPage, SearchPage).
- `scripts/generate-sitemap.ts` + update `package.json` scripts.
- Update `src/App.tsx` (route baru), `src/main.tsx` (HelmetProvider), `src/contexts/AuthContext.tsx` (role 'writer'), `src/components/auth/ProtectedRoute.tsx`, `src/components/layout/AdminSidebar.tsx`, `index.html` (sitewide JSON-LD), `public/robots.txt` (verifikasi sitemap).

**Tidak diubah:** fitur subscriber, LMS, payments existing.

---

## Catatan / Asumsi

- Role: hanya **superadmin + writer** (sesuai jawaban). "Admin" diperlakukan sama dengan superadmin.
- Gambar upload ke bucket existing `package-images` di folder `blog/`.
- Karena fitur sangat besar, akan saya kerjakan **bertahap dalam beberapa giliran**: (1) DB + auth/role + edge functions, (2) Admin panel artikel + writer management + editor + SEO analysis, (3) Writer panel, (4) Frontend publik + sitemap + JSON-LD, (5) Dashboard analytics. Konfirmasi tiap tahap selesai sebelum lanjut.
- Untuk SSR/social preview, sudah dicatat keterbatasan SPA.
