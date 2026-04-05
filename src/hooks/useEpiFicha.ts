import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSectors() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["sectors", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("sectors").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useJobPositions() {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["job-positions", company?.id],
    queryFn: async () => {
      if (!company) return [];
      const { data, error } = await supabase.from("job_positions").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company,
  });
}

export function useEmployeeDeliveries(employeeId: string | null) {
  const { company } = useAuth();
  return useQuery({
    queryKey: ["epi-employee-deliveries", company?.id, employeeId],
    queryFn: async () => {
      if (!company || !employeeId) return [];
      const { data, error } = await supabase
        .from("epi_deliveries")
        .select("*, epi_types(id, name, unit, ca_number), profiles:registered_by(full_name)")
        .eq("employee_id", employeeId)
        .order("delivered_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!company && !!employeeId,
  });
}
