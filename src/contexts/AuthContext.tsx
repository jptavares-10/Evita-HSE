import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  segment: string | null;
  logo_url: string | null;
  plan: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  max_users: number;
  plan_billing: string | null;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  storage_gb: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  profileLoaded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data as Profile | null;
  };

  const fetchCompany = async (companyId: string) => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle();
    return data as Company | null;
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      setProfile(p);
      setProfileLoaded(true);
      if (p?.company_id) {
        const c = await fetchCompany(p.company_id);
        setCompany(c);
      }
    }
  };

  const refreshCompany = async () => {
    if (profile?.company_id) {
      const c = await fetchCompany(profile.company_id);
      setCompany(c);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        applySession(nextSession);
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session: nextSession } }) => {
        applySession(nextSession);
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!user) {
        if (!isMounted) return;
        setProfile(null);
        setCompany(null);
        setProfileLoaded(false);
        return;
      }

      try {
        const p = await fetchProfile(user.id);
        if (!isMounted) return;

        setProfile(p);
        setProfileLoaded(true);

        if (p?.company_id) {
          const c = await fetchCompany(p.company_id);
          if (!isMounted) return;
          setCompany(c);
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        if (!isMounted) return;
        setProfile(null);
        setCompany(null);
        setProfileLoaded(true);
      }
    };

    void loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setCompany(null);
    setProfileLoaded(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, company, loading, profileLoaded, signOut, refreshProfile, refreshCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
