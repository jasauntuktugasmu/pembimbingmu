// Runs before vite dev/build via predev/prebuild npm scripts. Writes public/sitemap.xml.
// Includes static routes + dynamic blog content (articles, categories, tags).
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://pembimbingmu.lovable.app";
const SUPABASE_URL = "https://gwxwuplmjzlwnqvutkla.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3eHd1cGxtanpsd25xdnV0a2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTQ2MTcsImV4cCI6MjA3MDY3MDYxN30.DCPQ4lbKSEkvD-_ANkCKAU1K9YEDb_9DGCsWHFLfVWE";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/login", changefreq: "monthly", priority: "0.5" },
  { path: "/register", changefreq: "monthly", priority: "0.5" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
];

async function fetchTable(table: string, select: string, filter = ""): Promise<any[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter}`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function main() {
  const entries: SitemapEntry[] = [...staticEntries];

  const articles = await fetchTable("blog_articles", "slug,updated_at,published_at", "&status=eq.published");
  for (const a of articles) {
    entries.push({ path: `/blog/${a.slug}`, lastmod: (a.updated_at || a.published_at || "").slice(0, 10), changefreq: "weekly", priority: "0.8" });
  }

  const categories = await fetchTable("blog_categories", "slug,updated_at");
  for (const c of categories) {
    entries.push({ path: `/blog/kategori/${c.slug}`, lastmod: (c.updated_at || "").slice(0, 10), changefreq: "weekly", priority: "0.6" });
  }

  const tags = await fetchTable("blog_tags", "slug,updated_at");
  for (const t of tags) {
    entries.push({ path: `/blog/tag/${t.slug}`, lastmod: (t.updated_at || "").slice(0, 10), changefreq: "weekly", priority: "0.5" });
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ].filter(Boolean).join("\n")
    ),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
}

main();
