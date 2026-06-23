import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

export default function CategoryPage() {
  const { slug } = useParams();
  const [cat, setCat] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: c } = await supabase.from("blog_categories").select("*").eq("slug", slug).maybeSingle();
      setCat(c);
      if (c) {
        const { data } = await supabase.from("blog_articles")
          .select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)")
          .eq("status", "published").eq("category_id", c.id).order("published_at", { ascending: false });
        setArticles(data || []);
      }
    })();
  }, [slug]);

  if (!cat) return <div className="container py-12 text-center">Loading...</div>;
  const url = `${BLOG_BASE_URL}/blog/kategori/${cat.slug}`;
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>{cat.seo_title || `${cat.name} — Blog Pembimbingmu`}</title>
        <meta name="description" content={cat.meta_description || cat.description || `Artikel kategori ${cat.name}`} />
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={cat.seo_title || cat.name} />
      </Helmet>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Blog", href: "/blog" }, { label: cat.name }]} />
      <h1 className="text-3xl font-bold mb-2">Kategori: {cat.name}</h1>
      {cat.description && <p className="text-muted-foreground mb-6">{cat.description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
      {articles.length === 0 && <div className="text-center py-12 text-muted-foreground">Belum ada artikel di kategori ini.</div>}
    </div>
  );
}
