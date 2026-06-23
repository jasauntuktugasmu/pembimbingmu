import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { BLOG_BASE_URL } from "@/lib/seo-utils";
import { Search } from "lucide-react";

const PAGE_SIZE = 9;

export default function BlogList() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const [articles, setArticles] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const from = (page - 1) * PAGE_SIZE;
      const { data, count: c } = await supabase
        .from("blog_articles")
        .select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      setArticles(data || []);
      setCount(c || 0);

      const { data: cats } = await supabase.from("blog_categories").select("name,slug").order("name");
      setCategories(cats || []);
    })();
  }, [page]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const url = `${BLOG_BASE_URL}/blog`;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>Blog Pembimbingmu — Tips Skripsi, Karier & Akademik</title>
        <meta name="description" content="Artikel terbaru seputar bimbingan skripsi, tips akademik, dan pengembangan karier untuk mahasiswa." />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Blog Pembimbingmu" />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Blog" }]} />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog Pembimbingmu</h1>
      <p className="text-muted-foreground mb-6">Tips dan panduan seputar skripsi, akademik, dan karier.</p>

      <form className="flex gap-2 mb-6" onSubmit={(e) => { e.preventDefault(); if (search.trim()) window.location.href = `/blog/cari?q=${encodeURIComponent(search)}`; }}>
        <Input placeholder="Cari artikel..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit"><Search className="h-4 w-4" /></Button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <Link key={c.slug} to={`/blog/kategori/${c.slug}`} className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition">{c.name}</Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((a) => <ArticleCard key={a.slug} article={a} />)}
      </div>
      {articles.length === 0 && <div className="text-center py-12 text-muted-foreground">Belum ada artikel.</div>}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => setParams({ page: String(p) })}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  );
}
