import { useEffect } from "react";

const BASE_TITLE = "Evita HSE — Software de Gestão de Segurança do Trabalho, Saúde e Meio Ambiente";
const BASE_URL = "https://evita-hse-br.lovable.app";

interface PageSEOOptions {
  description?: string;
}

export function usePageTitle(title: string, options?: PageSEOOptions) {
  useEffect(() => {
    document.title = title === BASE_TITLE ? title : `${title} | Evita HSE`;

    // Dynamic meta description
    if (options?.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute("content", options.description);
      }
    }

    // Dynamic canonical
    const path = window.location.pathname;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = `${BASE_URL}${path === "/" ? "" : path}`;
    }

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, options?.description]);
}
