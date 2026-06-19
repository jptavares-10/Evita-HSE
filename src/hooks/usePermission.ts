import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";

export type ModuleKey =
  | "periodic_services"
  | "trainings"
  | "mtr"
  | "suppliers"
  | "ic_nc"
  | "environmental_licenses"
  | "document_library"
  | "inspections"
  | "aso"
  | "epi"
  | "calendar";

// Global cache so multiple hooks share the same data
let permissionsCache: Record<string, Record<ModuleKey, string>> = {};
let fetchPromise: Record<string, Promise<Record<ModuleKey, string>> | null> = {};

function fetchPermissions(userId: string): Promise<Record<ModuleKey, string>> {
  if (fetchPromise[userId]) return fetchPromise[userId]!;
  const p = supabase
    .rpc("get_user_permissions", { p_user_id: userId })
    .then(({ data, error }) => {
      fetchPromise[userId] = null;
      if (error || !data) {
        return {} as Record<ModuleKey, string>;
      }
      const obj = data as any;
      if (obj && typeof obj === "object" && obj.error) {
        return {} as Record<ModuleKey, string>;
      }
      const result = obj as Record<ModuleKey, string>;
      permissionsCache[userId] = result;
      return result;
    }) as Promise<Record<ModuleKey, string>>;
  fetchPromise[userId] = p;
  return p;
}

export function clearPermissionsCache(userId?: string) {
  if (userId) {
    delete permissionsCache[userId];
    delete fetchPromise[userId];
  } else {
    permissionsCache = {};
    fetchPromise = {};
  }
}

export function usePermission(module: ModuleKey) {
  const { profile } = useAuth();
  const { hasModule, isExpired } = usePlan();
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setCanEdit(false);
      setLoading(false);
      return;
    }

    // If plan is expired or module not in plan, block editing
    if (isExpired || !hasModule(module)) {
      setCanEdit(false);
      setLoading(false);
      return;
    }

    // Admin always has full access
    if (profile.role === "admin") {
      setCanEdit(true);
      setLoading(false);
      return;
    }

    // Check cache first
    if (permissionsCache[profile.id]) {
      const perm = permissionsCache[profile.id][module];
      setCanEdit(perm === "editor");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchPermissions(profile.id).then((perms) => {
      const perm = perms[module];
      setCanEdit(perm === "editor");
      setLoading(false);
    });
  }, [profile?.id, profile?.role, module, isExpired, hasModule]);

  return { canEdit, loading };
}
