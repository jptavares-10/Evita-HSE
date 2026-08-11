import { useEffect } from "react";

const BASE_TITLE = "Evita HSE — Software de Gestão de SST, Saúde e Meio Ambiente";
const BASE_DESCRIPTION = "Software de SST, Saúde e Meio Ambiente. Controle EPIs, treinamentos NR, inspeções, MTR, licenças e ASO com alertas automáticos. Teste 14 dias grátis.";
const BASE_URL = "https://evita-hse-br.lovable.app";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f0e68888-85c8-45e8-bf0c-f8a7622ec777/id-preview-b4231701--13a6f3b0-7d66-463d-aaf0-2c8c73ab3512.lovable.app-1774239475213.png";

interface PageSEOOptions {
  description?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  noindex?: boolean;
}

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${property}"]`);
  if (tag) {
    tag.setAttribute("content", content);
  } else {
    tag = document.createElement("meta");
    tag.setAttribute(attr, property);
    tag.setAttribute("content", content);
    document.head.appendChild(tag);
  }
}

export function usePageTitle(title: string, options?: PageSEOOptions) {
  useEffect(() => {
    // Avoid appending the brand if the title already contains it (prevents redundancy like "… — Evita HSE | Evita HSE")
    const alreadyBranded = /evita\s*hse/i.test(title) || title === BASE_TITLE;
    const displayTitle = alreadyBranded ? title : `${title} | Evita HSE`;
    document.title = displayTitle;

    const path = window.location.pathname;
    const fullUrl = `${BASE_URL}${path === "/" ? "" : path}`;

    // Dynamic meta description
    if (options?.description) {
      setMetaTag("description", options.description);
    }

    // Noindex for pages that should not appear in search results
    if (options?.noindex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      const existing = document.querySelector('meta[name="robots"]');
      if (existing) existing.remove();
    }

    // Dynamic canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = fullUrl;
    }

    // Dynamic Open Graph
    setMetaTag("og:title", displayTitle, true);
    setMetaTag("og:url", fullUrl, true);
    if (options?.description) {
      setMetaTag("og:description", options.description, true);
    }

    // Dynamic Twitter
    setMetaTag("twitter:title", displayTitle);
    if (options?.description) {
      setMetaTag("twitter:description", options.description);
    }

    // BreadcrumbList JSON-LD
    if (options?.breadcrumbs && options.breadcrumbs.length > 0) {
      const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: options.breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "breadcrumb-jsonld";
      script.textContent = JSON.stringify(breadcrumbJsonLd);
      document.getElementById("breadcrumb-jsonld")?.remove();
      document.head.appendChild(script);
    }

    return () => {
      document.title = BASE_TITLE;
      document.getElementById("breadcrumb-jsonld")?.remove();
      // Reset OG and description to sitewide defaults to avoid stale metadata
      setMetaTag("og:title", BASE_TITLE, true);
      setMetaTag("og:url", BASE_URL, true);
      setMetaTag("og:description", BASE_DESCRIPTION, true);
      setMetaTag("description", BASE_DESCRIPTION);
      setMetaTag("twitter:description", BASE_DESCRIPTION);
    };
  }, [title, options?.description]);
}
