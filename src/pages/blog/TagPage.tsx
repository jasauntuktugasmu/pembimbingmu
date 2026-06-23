import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

export default function TagPage() {
  const { slug } = useParams();
  const [tag, setTag] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: t } = await supabase.from("blog_tags").select("*").eq("slug", slug).maybeSingle();
      setTag(t);
      if (t) {
        const { data } = await supabase.from("blog_article_tags")
          .select("blog_articles!inner(slug,title,excerpt,featured_image,published_at,reading_time_minutes,status, blog_categories(name,slug))")
          .eq("tag_id", t.id);
        const arts = (data || []).map((r: any) => r.blog_articles).filter((a: any) => a?.status === "published");
        setArticles(arts);
      }
    })();
  }, [slug]);

  if (!tag) return <div className="container py-12 text-center">Loading...</div>;
  const url = `${BLOG_BASE_URL}/blog/tag/${tag.slug}`;
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>#{tag.name} — Blog Pembimbingmu</title>
        <meta name="description" content={`Artikel dengan tag ${tag.name}`} />
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
      </Helmet>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Blog", href: "/blog" }, { label: `#${tag.name}` }]} />
      <h1 className="text-3xl font-bold mb-6">#{tag.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
      {articles.length === 0 && <div className="text-center py-12 text-muted-foreground">Belum ada artikel.</div>}
    </div>
  );
}
