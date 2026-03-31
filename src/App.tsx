import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { LandingRoute } from "@/components/LandingRoute";
import { AppLayout } from "@/components/AppLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Convite from "./pages/Convite";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Servicos from "./pages/Servicos";
import Usuarios from "./pages/Usuarios";
import Empresa from "./pages/Empresa";
import Planos from "./pages/Planos";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import CompletarCadastro from "./pages/CompletarCadastro";
import Treinamentos from "./pages/Treinamentos";
import TreinamentosVisaoGeral from "./pages/TreinamentosVisaoGeral";
import TreinamentosColaboradores from "./pages/TreinamentosColaboradores";
import TreinamentosCatalogo from "./pages/TreinamentosCatalogo";
import TreinamentosMatriz from "./pages/TreinamentosMatriz";
import TreinamentosCargos from "./pages/TreinamentosCargos";
import Mtr from "./pages/Mtr";
import MtrAnalise from "./pages/MtrAnalise";
import Fornecedores from "./pages/Fornecedores";
import FornecedorDocumentos from "./pages/FornecedorDocumentos";
import PortalFornecedor from "./pages/PortalFornecedor";
import Incidentes from "./pages/Incidentes";
import Licencas from "./pages/Licencas";
import Documentos from "./pages/Documentos";
import Epi from "./pages/Epi";
import EpiVisaoGeral from "./pages/EpiVisaoGeral";
import EpiCatalogo from "./pages/EpiCatalogo";
import EpiEstoque from "./pages/EpiEstoque";
import EpiEntregas from "./pages/EpiEntregas";
import Aso from "./pages/Aso";
import Inspecoes from "./pages/Inspecoes";
import InspecoesExecucoes from "./pages/InspecoesExecucoes";
import InspecoesModelos from "./pages/InspecoesModelos";
import InspecaoDetalhe from "./pages/InspecaoDetalhe";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Landing page - redirects to dashboard if authenticated */}
            <Route path="/" element={<LandingRoute><LandingPage /></LandingRoute>} />

            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
            <Route path="/convite" element={<Convite />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/portal/fornecedor/:token" element={<PortalFornecedor />} />
            <Route path="/completar-cadastro" element={<CompletarCadastro />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/empresa" element={<Empresa />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/treinamentos" element={<Treinamentos />}>
                <Route index element={<TreinamentosVisaoGeral />} />
                <Route path="colaboradores" element={<TreinamentosColaboradores />} />
                <Route path="catalogo" element={<TreinamentosCatalogo />} />
                <Route path="matriz" element={<TreinamentosMatriz />} />
                <Route path="cargos" element={<TreinamentosCargos />} />
              </Route>
              <Route path="/mtr" element={<Mtr />} />
              <Route path="/mtr/analise" element={<MtrAnalise />} />
              <Route path="/fornecedores" element={<Fornecedores />} />
              <Route path="/fornecedores/:id" element={<FornecedorDocumentos />} />
              <Route path="/incidentes" element={<Incidentes />} />
              <Route path="/licencas" element={<Licencas />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/aso" element={<Aso />} />
              <Route path="/epi" element={<Epi />}>
                <Route index element={<EpiVisaoGeral />} />
                <Route path="catalogo" element={<EpiCatalogo />} />
                <Route path="estoque" element={<EpiEstoque />} />
                <Route path="entregas" element={<EpiEntregas />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
