import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any> | null;
}

export function SEO({ title, description, canonical, jsonLd }: SEOProps) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Meta description
    const existingDesc = document.querySelector('meta[name="description"]');
    if (description) {
      if (existingDesc) {
        existingDesc.setAttribute("content", description);
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = description;
        document.head.appendChild(meta);
      }
    }

    // Canonical
    const href = canonical || window.location.href;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    // JSON-LD
    const scriptId = "seo-json-ld";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, canonical, jsonLd]);

  return null;
}

export default SEO;
