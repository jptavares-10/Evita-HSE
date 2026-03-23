import { useAuth } from "@/contexts/AuthContext";
import { ClipboardList, GraduationCap, Recycle, Truck, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const modules = [
  { title: "Serviços Periódicos", description: "Gerencie ASOs, NRs e documentos periódicos", icon: ClipboardList },
  { title: "Treinamentos", description: "Controle de treinamentos e certificações", icon: GraduationCap },
  { title: "Gestão de MTR", description: "Manifesto de Transporte de Resíduos", icon: Recycle },
  { title: "Fornecedores", description: "Gestão e avaliação de fornecedores", icon: Truck },
];

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {profile?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel de gestão de HSE.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Módulos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <Tooltip key={mod.title}>
              <TooltipTrigger asChild>
                <div className="relative bg-card border rounded-lg p-6 opacity-50 cursor-not-allowed select-none">
                  <div className="absolute top-3 right-3">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <mod.icon className="h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                  <span className="inline-block mt-3 text-[10px] font-medium uppercase tracking-wider bg-muted text-muted-foreground px-2 py-1 rounded">
                    Em breve
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Em breve</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
