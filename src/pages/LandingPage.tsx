import { Link } from "react-router-dom";
import { Shield, Calendar, GraduationCap, FileText, Users, AlertTriangle, BarChart3, Check, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const features = [
  { icon: Calendar, title: "Serviços Periódicos", desc: "Controle vencimentos de extintores, limpeza de caixa d'água, dedetização e qualquer serviço recorrente. Alertas automáticos para nunca perder um prazo." },
  { icon: GraduationCap, title: "Gestão de Treinamentos", desc: "Matriz de treinamentos por cargo, controle de certificados e validades. Saiba exatamente quem está em conformidade e quem precisa renovar." },
  { icon: FileText, title: "Gestão de MTR", desc: "Controle seus Manifestos de Transporte de Resíduos e os prazos de CDF. Relatórios de geração de resíduos com gráficos mensais." },
  { icon: Users, title: "Portal de Fornecedores", desc: "Compartilhe um link com seu fornecedor e receba documentos organizados em pastas. Sem burocracia, sem WhatsApp." },
  { icon: AlertTriangle, title: "Incidentes e Não Conformidades", desc: "Registre ocorrências, analise causas e acompanhe planos de ação corretiva. Feche o ciclo de melhoria contínua." },
  { icon: BarChart3, title: "Visão Consolidada", desc: "Dashboard com indicadores de todos os módulos. Exporte relatórios e acompanhe a conformidade da sua empresa em tempo real." },
];

const plans = [
  { key: "trial", label: "Trial", price: "Grátis", period: "14 dias", users: "Até 2 usuários", features: ["Todos os módulos", "Suporte por e-mail"], highlight: false },
  { key: "basic", label: "Basic", price: "R$ 79", period: "/mês", users: "Até 5 usuários", features: ["Todos os módulos", "Suporte prioritário"], highlight: false },
  { key: "pro", label: "Pro", price: "R$ 149", period: "/mês", users: "Usuários ilimitados", features: ["Todos os módulos", "Portal do Fornecedor", "Suporte dedicado"], highlight: true },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Evita HSE</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Planos</a>
            <Link to="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
            <Link to="/cadastro"><Button size="sm">Criar conta</Button></Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="#funcionalidades" className="block text-sm" onClick={() => setMenuOpen(false)}>Funcionalidades</a>
            <a href="#planos" className="block text-sm" onClick={() => setMenuOpen(false)}>Planos</a>
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Entrar</Button></Link>
              <Link to="/cadastro" className="flex-1"><Button className="w-full" size="sm">Criar conta</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
            Gestão de HSE simplificada
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Controle total da sua gestão de Saúde, Segurança e Meio Ambiente
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Centralize treinamentos, serviços periódicos, MTRs, fornecedores e ocorrências em um só lugar. Simples, visual e feito para quem trabalha com HSE.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/cadastro"><Button size="lg" className="text-base px-8">Criar conta grátis</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="text-base px-8">Fazer login</Button></Link>
          </div>
          <p className="text-sm text-muted-foreground">14 dias grátis. Sem cartão de crédito.</p>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Tudo que você precisa em um só sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card border rounded-xl p-6 space-y-3 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Planos simples e transparentes</h2>
            <p className="text-muted-foreground mt-2">Comece grátis. Faça upgrade quando precisar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.key} className={`relative bg-card border rounded-xl p-6 flex flex-col ${plan.highlight ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Recomendado</span>
                )}
                <h3 className="text-lg font-bold">{plan.label}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.users}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/cadastro">
                    <Button className="w-full" variant={plan.highlight ? "default" : "outline"}>
                      Começar grátis
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Pagamentos serão ativados em breve. Crie sua conta agora e aproveite o acesso completo durante o período trial.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-white">Evita HSE</span>
            <span className="text-sm ml-2 hidden sm:inline">Feito para profissionais de HSE no Brasil</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/cadastro" className="hover:text-white transition-colors">Criar conta</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          © 2026 Evita HSE. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
