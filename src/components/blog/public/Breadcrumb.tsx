import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BLOG_BASE_URL } from "@/lib/seo-utils";

interface Crumb { label: string; href?: string; }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.label,
      ...(c.href ? { item: `${BLOG_BASE_URL}${c.href}` } : {}),
    })),
  };
  return (
    <>
      <Helmet><script type="application/ld+json">{JSON.stringify(ld)}</script></Helmet>
      <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-1">
          {items.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {c.href ? <Link to={c.href} className="hover:text-primary">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
              {i < items.length - 1 && <span>/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
