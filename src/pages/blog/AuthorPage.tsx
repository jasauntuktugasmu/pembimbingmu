import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

export default function AuthorPage() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (!authorId) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("id,full_name,email").eq("id", authorId).maybeSingle();
      setAuthor(p);
      const { data } = await supabase.from("blog_articles")
        .select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)")
        .eq("status", "published").eq("author_id", authorId).order("published_at", { ascending: false });
      setArticles(data || []);
    })();
  }, [authorId]);

  if (!author) return <div className="container py-12 text-center">Loading...</div>;
  const url = `${BLOG_BASE_URL}/blog/penulis/${author.id}`;
  const ld = { "@context": "https://schema.org", "@type": "Person", name: author.full_name || "Penulis", url };
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Helmet>
        <title>Artikel oleh {author.full_name || "Penulis"} — Blog Pembimbingmu</title>
        <meta name="description" content={`Daftar artikel yang ditulis oleh ${author.full_name || "penulis"} di Pembimbingmu.`} />
        <link rel="canonical" href={url} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Blog", href: "/blog" }, { label: author.full_name || "Penulis" }]} />
      <h1 className="text-3xl font-bold mb-6">Penulis: {author.full_name || "Penulis"}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
      {articles.length === 0 && <div className="text-center py-12 text-muted-foreground">Belum ada artikel.</div>}
    </div>
  );
}
