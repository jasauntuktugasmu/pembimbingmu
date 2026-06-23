import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "isomorphic-dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumb } from "@/components/blog/public/Breadcrumb";
import { ArticleCard } from "@/components/blog/public/ArticleCard";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User } from "lucide-react";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

export default function BlogDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [author, setAuthor] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("*, blog_categories(name,slug), profiles!blog_articles_author_id_fkey(id,full_name)")
        .eq("slug", slug).eq("status", "published").maybeSingle();
      if (!data) { setNotFound(true); return; }
      setArticle(data);
      setAuthor((data as any).profiles);

      const [tagRes, relRes] = await Promise.all([
        supabase.from("blog_article_tags").select("blog_tags(id,name,slug)").eq("article_id", data.id),
        supabase.from("blog_articles").select("slug,title,excerpt,featured_image,published_at,reading_time_minutes, blog_categories(name,slug)").eq("status", "published").eq("category_id", data.category_id || "").neq("id", data.id).limit(3),
      ]);
      setTags((tagRes.data || []).map((t: any) => t.blog_tags).filter(Boolean));
      setRelated(relRes.data || []);

      // Fire view tracker
      try { await supabase.functions.invoke("increment-article-view", { body: { article_id: data.id } }); } catch {}
    })();
  }, [slug]);

  if (notFound) {
    return <div className="container max-w-3xl mx-auto py-16 px-4 text-center">
      <h1 className="text-2xl font-bold">Artikel tidak ditemukan</h1>
      <Link className="text-primary underline mt-4 inline-block" to="/blog">Kembali ke Blog</Link>
    </div>;
  }
  if (!article) return <div className="container py-12 text-center">Loading...</div>;

  const url = `${BLOG_BASE_URL}/blog/${article.slug}`;
  const ogImage = article.og_image || article.featured_image;
  const seoTitle = article.seo_title || article.title;
  const description = article.meta_description || article.excerpt || "";
  const canonical = article.canonical_url || url;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    image: ogImage ? [ogImage] : undefined,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: author ? { "@type": "Person", name: author.full_name || "Tim Pembimbingmu" } : undefined,
    publisher: { "@type": "Organization", name: "Pembimbingmu", url: BLOG_BASE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: article.meta_keywords || article.focus_keyword || undefined,
  };

  const safeHtml = DOMPurify.sanitize(article.content_html || "");

  return (
    <article className="container max-w-3xl mx-auto py-8 px-4">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={article.meta_keywords || ""} />
        <meta name="robots" content={article.robots_meta || "index,follow"} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={article.og_title || seoTitle} />
        <meta property="og:description" content={article.og_description || description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.og_title || seoTitle} />
        <meta name="twitter:description" content={article.og_description || description} />
        {(article.twitter_image || ogImage) && <meta name="twitter:image" content={article.twitter_image || ogImage} />}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <Breadcrumb items={[
        { label: "Beranda", href: "/" },
        { label: "Blog", href: "/blog" },
        ...(article.blog_categories ? [{ label: article.blog_categories.name, href: `/blog/kategori/${article.blog_categories.slug}` }] : []),
        { label: article.title },
      ]} />

      <h1 className="text-3xl md:text-4xl font-bold mb-3">{article.title}</h1>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
        {author && <Link to={`/blog/penulis/${author.id}`} className="flex items-center gap-1 hover:text-primary"><User className="h-4 w-4" /> {author.full_name || "Tim Pembimbingmu"}</Link>}
        {article.published_at && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>}
        {article.reading_time_minutes && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {article.reading_time_minutes} min baca</span>}
      </div>

      {article.featured_image && <img src={article.featured_image} alt={article.title} className="w-full rounded-lg mb-6" />}

      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml }} />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {tags.map((t) => <Link key={t.id} to={`/blog/tag/${t.slug}`}><Badge variant="secondary">#{t.name}</Badge></Link>)}
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => <ArticleCard key={r.slug} article={r} />)}
          </div>
        </section>
      )}
    </article>
  );
}
