import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { LandingRoute } from "@/components/LandingRoute";
import { AppLayout } from "@/components/AppLayout";
import { ModuleGuard } from "@/components/ModuleGuard";

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
import EpiFicha from "./pages/EpiFicha";
import Aso from "./pages/Aso";
import Inspecoes from "./pages/Inspecoes";
import InspecoesExecucoes from "./pages/InspecoesExecucoes";
import InspecoesModelos from "./pages/InspecoesModelos";
import InspecaoDetalhe from "./pages/InspecaoDetalhe";

import Funcionalidades from "./pages/Funcionalidades";
import ServicosPage from "./pages/funcionalidades/ServicosPage";
import InspecoesPage from "./pages/funcionalidades/InspecoesPage";
import IncidentesPage from "./pages/funcionalidades/IncidentesPage";
import EpiPage from "./pages/funcionalidades/EpiPage";
import DocumentosPage from "./pages/funcionalidades/DocumentosPage";
import TreinamentosPage from "./pages/funcionalidades/TreinamentosPage";
import AsoPage from "./pages/funcionalidades/AsoPage";
import MtrPage from "./pages/funcionalidades/MtrPage";
import LicencasPage from "./pages/funcionalidades/LicencasPage";
import FornecedoresPage from "./pages/funcionalidades/FornecedoresPage";

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

            {/* Public SEO pages */}
            <Route path="/funcionalidades" element={<LandingRoute><Funcionalidades /></LandingRoute>} />
            <Route path="/funcionalidades/servicos-periodicos" element={<LandingRoute><ServicosPage /></LandingRoute>} />
            <Route path="/funcionalidades/inspecoes" element={<LandingRoute><InspecoesPage /></LandingRoute>} />
            <Route path="/funcionalidades/incidentes" element={<LandingRoute><IncidentesPage /></LandingRoute>} />
            <Route path="/funcionalidades/epi" element={<LandingRoute><EpiPage /></LandingRoute>} />
            <Route path="/funcionalidades/documentos" element={<LandingRoute><DocumentosPage /></LandingRoute>} />
            <Route path="/funcionalidades/treinamentos" element={<LandingRoute><TreinamentosPage /></LandingRoute>} />
            <Route path="/funcionalidades/aso" element={<LandingRoute><AsoPage /></LandingRoute>} />
            <Route path="/funcionalidades/mtr" element={<LandingRoute><MtrPage /></LandingRoute>} />
            <Route path="/funcionalidades/licencas" element={<LandingRoute><LicencasPage /></LandingRoute>} />
            <Route path="/funcionalidades/fornecedores" element={<LandingRoute><FornecedoresPage /></LandingRoute>} />
            <Route path="/portal/fornecedor/:token" element={<PortalFornecedor />} />
            <Route path="/completar-cadastro" element={<CompletarCadastro />} />

            {/* Protected routes with layout */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/servicos" element={<ModuleGuard module="periodic_services"><Servicos /></ModuleGuard>} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/empresa" element={<Empresa />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/treinamentos" element={<ModuleGuard module="trainings"><Treinamentos /></ModuleGuard>}>
                <Route index element={<TreinamentosVisaoGeral />} />
                <Route path="colaboradores" element={<TreinamentosColaboradores />} />
                <Route path="catalogo" element={<TreinamentosCatalogo />} />
                <Route path="matriz" element={<TreinamentosMatriz />} />
                <Route path="cargos" element={<TreinamentosCargos />} />
              </Route>
              <Route path="/mtr" element={<ModuleGuard module="mtr"><Mtr /></ModuleGuard>} />
              <Route path="/mtr/analise" element={<ModuleGuard module="mtr"><MtrAnalise /></ModuleGuard>} />
              <Route path="/fornecedores" element={<ModuleGuard module="suppliers"><Fornecedores /></ModuleGuard>} />
              <Route path="/fornecedores/:id" element={<ModuleGuard module="suppliers"><FornecedorDocumentos /></ModuleGuard>} />
              <Route path="/incidentes" element={<ModuleGuard module="ic_nc"><Incidentes /></ModuleGuard>} />
              <Route path="/licencas" element={<ModuleGuard module="environmental_licenses"><Licencas /></ModuleGuard>} />
              <Route path="/documentos" element={<ModuleGuard module="document_library"><Documentos /></ModuleGuard>} />
              <Route path="/aso" element={<ModuleGuard module="aso"><Aso /></ModuleGuard>} />
              <Route path="/inspecoes" element={<ModuleGuard module="inspections"><Inspecoes /></ModuleGuard>}>
                <Route index element={<InspecoesExecucoes />} />
                <Route path="modelos" element={<InspecoesModelos />} />
              </Route>
              <Route path="/inspecoes/:id" element={<ModuleGuard module="inspections"><InspecaoDetalhe /></ModuleGuard>} />
              <Route path="/epi" element={<ModuleGuard module="epi"><Epi /></ModuleGuard>}>
                <Route index element={<EpiVisaoGeral />} />
                <Route path="catalogo" element={<EpiCatalogo />} />
                <Route path="estoque" element={<EpiEstoque />} />
                <Route path="entregas" element={<EpiEntregas />} />
                <Route path="ficha" element={<EpiFicha />} />
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
