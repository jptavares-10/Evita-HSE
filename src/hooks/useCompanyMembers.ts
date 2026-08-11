import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanyMember {
  id: string;
  full_name: string | null;
  role: string | null;
}

/** Usuários do sistema (perfis) da empresa atual — usados em campos de responsável. */
export function useCompanyMembers() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["company-members", company?.id],
    enabled: !!company?.id,
    queryFn: async (): Promise<CompanyMember[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("company_id", company!.id)
        .order("full_name");
      if (error) throw error;
      return (data || []) as CompanyMember[];
    },
  });
}