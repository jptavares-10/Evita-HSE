import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, ClipboardList, FileText, Recycle, Building2,
  ShieldAlert, ScrollText, HardHat, Stethoscope, ClipboardCheck, Users
} from "lucide-react";

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  icon: any;
  path: string;
  group: string;
}

const NAV_ITEMS: SearchResult[] = [
  { id: "nav-dashboard", label: "Dashboard", icon: ClipboardList, path: "/dashboard", group: "Navegação" },
  { id: "nav-servicos", label: "Serviços Periódicos", icon: ClipboardList, path: "/servicos", group: "Navegação" },
  { id: "nav-treinamentos", label: "Treinamentos", icon: GraduationCap, path: "/treinamentos", group: "Navegação" },
  { id: "nav-colaboradores", label: "Colaboradores", icon: Users, path: "/treinamentos/colaboradores", group: "Navegação" },
  { id: "nav-inspecoes", label: "Inspeções", icon: ClipboardCheck, path: "/inspecoes", group: "Navegação" },
  { id: "nav-incidentes", label: "IC & NC", icon: ShieldAlert, path: "/incidentes", group: "Navegação" },
  { id: "nav-epi", label: "EPIs", icon: HardHat, path: "/epi", group: "Navegação" },
  { id: "nav-aso", label: "ASO", icon: Stethoscope, path: "/aso", group: "Navegação" },
  { id: "nav-documentos", label: "Documentos", icon: FileText, path: "/documentos", group: "Navegação" },
  { id: "nav-licencas", label: "Licenças", icon: ScrollText, path: "/licencas", group: "Navegação" },
  { id: "nav-mtr", label: "MTR / Resíduos", icon: Recycle, path: "/mtr", group: "Navegação" },
  { id: "nav-fornecedores", label: "Fornecedores", icon: Building2, path: "/fornecedores", group: "Navegação" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { company } = useAuth();

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search database when query changes
  useEffect(() => {
    if (!query || query.length < 2 || !company) {
      setDbResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const term = `%${query}%`;

      const [employees, services, documents, trainings, suppliers] = await Promise.all([
        supabase.from("employees").select("id, name, sector").ilike("name", term).limit(5),
        supabase.from("periodic_services").select("id, name, supplier").ilike("name", term).limit(5),
        supabase.from("documents").select("id, title, code").or(`title.ilike.${term},code.ilike.${term}`).limit(5),
        supabase.from("trainings").select("id, name").ilike("name", term).limit(5),
        supabase.from("suppliers").select("id, name, contact_name").ilike("name", term).limit(5),
      ]);

      const results: SearchResult[] = [];

      (employees.data ?? []).forEach((e) =>
        results.push({ id: `emp-${e.id}`, label: e.name, sublabel: e.sector || undefined, icon: Users, path: "/treinamentos/colaboradores", group: "Colaboradores" })
      );
      (services.data ?? []).forEach((s) =>
        results.push({ id: `svc-${s.id}`, label: s.name, sublabel: s.supplier || undefined, icon: ClipboardList, path: "/servicos", group: "Serviços" })
      );
      (documents.data ?? []).forEach((d) =>
        results.push({ id: `doc-${d.id}`, label: d.title, sublabel: d.code || undefined, icon: FileText, path: "/documentos", group: "Documentos" })
      );
      (trainings.data ?? []).forEach((t) =>
        results.push({ id: `trn-${t.id}`, label: t.name, icon: GraduationCap, path: "/treinamentos/catalogo", group: "Treinamentos" })
      );
      (suppliers.data ?? []).forEach((s) =>
        results.push({ id: `sup-${s.id}`, label: s.name, sublabel: s.contact_name || undefined, icon: Building2, path: "/fornecedores", group: "Fornecedores" })
      );

      setDbResults(results);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, company]);

  const filteredNav = useMemo(() => {
    if (!query) return NAV_ITEMS;
    const lower = query.toLowerCase();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(lower));
  }, [query]);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  }, [navigate]);

  // Group db results
  const groups = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    dbResults.forEach((r) => {
      const arr = map.get(r.group) || [];
      arr.push(r);
      map.set(r.group, arr);
    });
    return map;
  }, [dbResults]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar módulos, colaboradores, documentos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? "Buscando..." : "Nenhum resultado encontrado."}
        </CommandEmpty>

        {filteredNav.length > 0 && (
          <CommandGroup heading="Navegação">
            {filteredNav.map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item.path)} className="gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {Array.from(groups.entries()).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item.path)} className="gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.sublabel && <span className="text-xs text-muted-foreground">{item.sublabel}</span>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
