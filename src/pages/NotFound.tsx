import { usePageTitle } from "@/hooks/usePageTitle";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  usePageTitle("Página não encontrada — Evita HSE");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Ir para o início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
