import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type PlanStatus = "active" | "trial" | "expired" | "grace";

interface PlanData {
  plan: string;
  billing: string | null;
  status: PlanStatus;
  modulesIncluded: string[];
  daysRemaining: number;
  maxUsers: number;
  storageGb: number;
}

// Global cache
let planCache: Record<string, PlanData> = {};
let planPromise: Record<string, Promise<PlanData> | null> = {};

function fetchPlanData(userId: string): Promise<PlanData> {
  if (planPromise[userId]) return planPromise[userId]!;
  const p = supabase
    .rpc("get_company_access_status")
    .then(({ data, error }) => {
      planPromise[userId] = null;
      if (error || !data) {
        return {
          plan: "expired",
          billing: null,
          status: "expired" as PlanStatus,
          modulesIncluded: [],
          daysRemaining: 0,
          maxUsers: 2,
          storageGb: 5,
        };
      }
      const obj = data as any;
      if (obj?.error) {
        return {
          plan: "expired",
          billing: null,
          status: "expired" as PlanStatus,
          modulesIncluded: [],
          daysRemaining: 0,
          maxUsers: 2,
          storageGb: 5,
        };
      }
      const result: PlanData = {
        plan: obj.plan || "expired",
        billing: obj.billing || null,
        status: (obj.status || "expired") as PlanStatus,
        modulesIncluded: obj.modules_included || [],
        daysRemaining: obj.days_remaining || 0,
        maxUsers: obj.max_users || 2,
        storageGb: obj.storage_gb || 5,
      };
      planCache[userId] = result;
      return result;
    }) as Promise<PlanData>;
  planPromise[userId] = p;
  return p;
}

export function clearPlanCache(userId?: string) {
  if (userId) {
    delete planCache[userId];
    delete planPromise[userId];
  } else {
    planCache = {};
    planPromise = {};
  }
}

const defaultPlan: PlanData = {
  plan: "trial",
  billing: null,
  status: "trial",
  modulesIncluded: [],
  daysRemaining: 0,
  maxUsers: 2,
  storageGb: 5,
};

export function usePlan() {
  const { profile } = useAuth();
  const [data, setData] = useState<PlanData>(defaultPlan);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setData(defaultPlan);
      setLoading(false);
      return;
    }

    if (planCache[profile.id]) {
      setData(planCache[profile.id]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchPlanData(profile.id).then((result) => {
      setData(result);
      setLoading(false);
    });
  }, [profile?.id]);

  const hasModule = useCallback(
    (module: string): boolean => {
      if (data.status === "trial") return true;
      if (data.status === "expired") return false;
      return data.modulesIncluded.includes(module);
    },
    [data.status, data.modulesIncluded]
  );

  return {
    plan: data.plan,
    status: data.status,
    billing: data.billing,
    hasModule,
    daysRemaining: data.daysRemaining,
    isExpired: data.status === "expired",
    canEdit: data.status !== "expired",
    modulesIncluded: data.modulesIncluded,
    maxUsers: data.maxUsers,
    storageGb: data.storageGb,
    loading,
  };
}
