import slugify from "slugify";

export const BLOG_BASE_URL = "https://pembimbingmu.lovable.app";

export function toSlug(input: string): string {
  return slugify(input || "", { lower: true, strict: true, trim: true });
}

export interface SeoCheck {
  id: string;
  label: string;
  pass: boolean;
  value?: string | number;
}

export interface SeoAnalysisInput {
  title: string;
  slug: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  content_html: string;
  excerpt?: string;
  featured_image?: string;
}

export interface SeoAnalysisResult {
  score: number;
  checks: SeoCheck[];
  stats: {
    word_count: number;
    h1: number;
    h2: number;
    h3: number;
    internal_links: number;
    external_links: number;
    images: number;
    images_missing_alt: number;
    readability: number;
  };
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;
  const syllables = words.reduce((acc, w) => acc + Math.max(1, w.toLowerCase().replace(/[^aiueo]/g, "").length), 0);
  return Math.round(206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount));
}

export function analyzeSeo(input: SeoAnalysisInput): SeoAnalysisResult {
  const html = input.content_html || "";
  const plain = stripHtml(html);
  const words = plain.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const kw = (input.focus_keyword || "").trim().toLowerCase();
  const titleText = (input.seo_title || input.title || "").toLowerCase();
  const metaText = (input.meta_description || "").toLowerCase();
  const slugText = (input.slug || "").toLowerCase();

  const h1 = (html.match(/<h1\b/gi) || []).length;
  const h2 = (html.match(/<h2\b/gi) || []).length;
  const h3 = (html.match(/<h3\b/gi) || []).length;
  const headingText = (html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || []).join(" ").toLowerCase();

  const firstParagraph = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "").toLowerCase();
  const links = html.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
  let internal = 0, external = 0;
  for (const link of links) {
    const href = link.match(/href=["']([^"']+)["']/i)?.[1] || "";
    if (href.startsWith("http") && !href.includes("pembimbingmu")) external++;
    else internal++;
  }

  const images = (html.match(/<img\b[^>]*>/gi) || []);
  const imagesMissingAlt = images.filter((img) => !/alt=["'][^"']+["']/i.test(img)).length;

  const readability = fleschReadingEase(plain);

  const checks: SeoCheck[] = [
    { id: "title_len", label: "SEO Title 50–60 karakter", pass: (input.seo_title || input.title).length >= 50 && (input.seo_title || input.title).length <= 60, value: (input.seo_title || input.title).length },
    { id: "meta_len", label: "Meta Description 150–160 karakter", pass: input.meta_description.length >= 150 && input.meta_description.length <= 160, value: input.meta_description.length },
    { id: "kw_present", label: "Focus keyword diisi", pass: kw.length > 0 },
    { id: "kw_title", label: "Keyword di SEO title", pass: !!kw && titleText.includes(kw) },
    { id: "kw_slug", label: "Keyword di slug URL", pass: !!kw && slugText.includes(toSlug(kw)) },
    { id: "kw_heading", label: "Keyword di heading (H1/H2/H3)", pass: !!kw && headingText.includes(kw) },
    { id: "kw_first_para", label: "Keyword di paragraf pertama", pass: !!kw && firstParagraph.includes(kw) },
    { id: "kw_meta", label: "Keyword di meta description", pass: !!kw && metaText.includes(kw) },
    { id: "word_count", label: "Minimal 300 kata", pass: wordCount >= 300, value: wordCount },
    { id: "has_h2", label: "Minimal 1 heading H2", pass: h2 >= 1, value: h2 },
    { id: "internal_link", label: "Ada minimal 1 internal link", pass: internal >= 1, value: internal },
    { id: "external_link", label: "Ada minimal 1 external link", pass: external >= 1, value: external },
    { id: "image_alt", label: "Semua gambar punya alt text", pass: imagesMissingAlt === 0, value: `${images.length - imagesMissingAlt}/${images.length}` },
    { id: "featured_image", label: "Featured image diisi", pass: !!input.featured_image },
    { id: "readability", label: "Readability ≥ 50 (Flesch)", pass: readability >= 50, value: readability },
  ];

  const passCount = checks.filter((c) => c.pass).length;
  const score = Math.round((passCount / checks.length) * 100);

  return {
    score,
    checks,
    stats: { word_count: wordCount, h1, h2, h3, internal_links: internal, external_links: external, images: images.length, images_missing_alt: imagesMissingAlt, readability },
  };
}

export function readingTimeMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
