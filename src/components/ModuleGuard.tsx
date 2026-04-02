import { Navigate } from "react-router-dom";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface ModuleGuardProps {
  module: string;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasModule, loading } = usePlan();
  const { toast } = useToast();
  const toasted = useRef(false);

  const allowed = hasModule(module);

  useEffect(() => {
    if (!loading && !allowed && !toasted.current) {
      toasted.current = true;
      toast({
        title: "Módulo indisponível",
        description: "Este módulo não está incluído no seu plano atual.",
        variant: "destructive",
      });
    }
  }, [loading, allowed, toast]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/planos" replace />;
  }

  return <>{children}</>;
}
