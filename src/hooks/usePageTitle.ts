import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => { document.title = "Evita HSE — Gestão de HSE simplificada"; };
  }, [title]);
}
