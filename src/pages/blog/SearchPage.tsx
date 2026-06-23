import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [input, setInput] = useState(q);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!q) { setArticles([]); return; }
    (async () => {
      const { data } = await supabase.from("blog_articles")
        .select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)")
        .eq("status", "published")
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content_html.ilike.%${q}%`)
        .order("published_at", { ascending: false });
      setArticles(data || []);
    })();
  }, [q]);

  const url = `${BLOG_BASE_URL}/blog/cari`;
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>{q ? `Pencarian "${q}"` : "Pencarian"} — Blog Pembimbingmu</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={url} />
      </Helmet>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Pencarian" }]} />
      <form className="flex gap-2 mb-6" onSubmit={(e) => { e.preventDefault(); setParams({ q: input }); }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Cari artikel..." />
        <Button type="submit">Cari</Button>
      </form>
      {q && <p className="text-sm text-muted-foreground mb-4">Hasil pencarian untuk: <b>{q}</b> ({articles.length})</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
      {q && articles.length === 0 && <div className="text-center py-12 text-muted-foreground">Tidak ada hasil.</div>}
    </div>
  );
}
