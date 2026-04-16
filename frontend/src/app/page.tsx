import Link from "next/link";
import { Pill, Shield, Brain, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-primary/10">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">PharmIA</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-foreground hover:text-primary font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            <span>Inteligência Artificial aplicada à Saúde</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Análise Inteligente de
            <span className="text-primary"> Interações Medicamentosas</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema de análise de interações medicamentosas com machine learning.
            Identifique rapidamente interações graves, moderadas e leves entre medicamentos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <Pill className="w-5 h-5" />
              Começar Agora
            </Link>
            <Link
              href="/login"
              className="border border-input bg-white text-foreground px-8 py-3 rounded-lg font-medium hover:bg-muted transition-all inline-flex items-center justify-center gap-2"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Recursos Principais</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ferramentas powerfuls para pharmacists e pacientes
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-primary/5 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Machine Learning</h3>
            <p className="text-muted-foreground">
              Modelo de Regressão Logística treinado com +191k interações do DrugBank para classificação precisa de severidade.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-primary/5 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Classificação por Severidade</h3>
            <p className="text-muted-foreground">
              Identifique rapidamente interações Graves, Moderadas ou Leves com indicações visuais claras.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-primary/5 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-severity-moderada/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-severity-moderada" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Análises e Histórico</h3>
            <p className="text-muted-foreground">
              Dashboard completo com métricas, gráficos e histórico de todas as consultas realizadas.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl my-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Tecnologias Utilizadas</h2>
          <p className="text-muted-foreground">Stack moderno e escalável</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {["Next.js 14", "TypeScript", "Tailwind CSS", "FastAPI", "scikit-learn", "SQLAlchemy"].map((tech) => (
            <div key={tech} className="px-4 py-2 rounded-full bg-muted text-sm font-medium text-foreground">
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Pill className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">PharmIA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PharmIA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}