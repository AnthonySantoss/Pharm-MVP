import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Heart,
  Info,
  Pill,
  Shield,
  ShieldCheck,
} from 'lucide-react';
const drugClasses = [
  {
    name: 'Anticoagulantes',
    count: 14,
    icon: Heart,
    bg: 'bg-red-50',
    color: 'text-red-500',
  },
  {
    name: 'Antidepressivos',
    count: 11,
    icon: Brain,
    bg: 'bg-violet-50',
    color: 'text-violet-500',
  },
  {
    name: 'Antihipertensivos',
    count: 12,
    icon: Activity,
    bg: 'bg-blue-50',
    color: 'text-blue-500',
  },
  {
    name: 'Antipsicóticos',
    count: 14,
    icon: Shield,
    bg: 'bg-amber-50',
    color: 'text-amber-500',
  },
] as const;

export default function Home() {
  return (
    <div className="bg-neutral-bg text-dark-text font-body-md min-h-screen flex flex-col">

      {/*  TopNavBar Component  */}
      <nav
        aria-label="Navegação principal"
        className="fixed top-0 w-full z-50 bg-neutral-bg/80 backdrop-blur-md border-b border-neutral-border/50 shadow-sm transition-all duration-300 ease-in-out"
      >
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {/*  Brand  */}
          <Link href="/landing" className="flex items-center gap-2" aria-label="Página inicial PharmIA">
            <img
              alt="PharmIA"
              src="/logo.png"
              className="h-8 w-8 object-contain"
            />
            <span className="font-headline-md text-headline-md font-bold text-dark-text">
              PharmIA
            </span>
          </Link>
          {/*  Links (Desktop)  */}
          <div className="hidden md:flex gap-gutter">
            <a
              className="font-body-md text-body-md text-dark-text/60 hover:text-dark-text transition-colors"
              href="#features"
            >
              Recursos
            </a>
            <a
              className="font-body-md text-body-md text-dark-text/60 hover:text-dark-text transition-colors"
              href="#how-it-works"
            >
              Como Funciona
            </a>
          </div>
          {/*  Trailing Action  */}
          <Link
            href="/login"
            aria-label="Fazer login no sistema"
            className="font-label-md text-label-md bg-dark-primary text-on-dark hover:bg-dark-primary/90 px-4 py-2 rounded-full transition-colors duration-200 active:scale-[0.97]"
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/*  Main Canvas  */}
      <main className="flex-grow pt-20 pb-stack-lg">
        {/*  Hero Section  */}
        <section className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto pt-16 pb-24 lg:pt-28 lg:pb-36 overflow-hidden">
          {/*  Decorative Background Elements  */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-br from-dark-primary/5 via-sec-default/10 to-dark-primary/15 rounded-full blur-3xl -z-10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-dark-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-gutter items-center">
            {/*  Text Content  */}
            <div className="flex flex-col gap-stack-lg z-10">
              <div className="inline-flex items-center gap-2 bg-neutral-surface px-3 py-1.5 rounded-full w-max border border-neutral-border/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sec-default animate-pulse-gentle" />
                <span className="font-label-sm text-label-sm text-muted-text">
                  Análise clínica em tempo real
                </span>
              </div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-dark-text max-w-[800px]">
                Interações Medicamentosas{' '}
                <span className="text-sec-default">Analisadas em Segundos</span>
              </h1>
              <p className="font-body-lg text-body-lg text-dark-text/80 max-w-[600px]">
                Identifique riscos entre medicamentos antes da prescrição. O PharmIA analisa combinações como Varfarina + Aspirina, Simvastatina + Claritromicina e alerta sobre interações graves, moderadas e leves.
              </p>
              <div className="flex flex-wrap gap-stack-md pt-4">
                <Link
                  href="/register"
                  aria-label="Criar conta no PharmIA"
                  className="bg-sec-default text-on-sec font-label-md text-label-md px-6 py-3 rounded-full hover:bg-sec-hover transition-colors shadow-lg shadow-sec-default/30 hover:shadow-xl hover:shadow-sec-hover/20 font-semibold active:scale-[0.97] inline-flex text-center items-center justify-center cursor-pointer"
                >
                  Criar Conta Gratuita
                </Link>
                <Link
                  href="/interactions"
                  aria-label="Ver demonstração do sistema"
                  className="bg-transparent border-2 border-neutral-border text-muted-text font-label-md text-label-md px-6 py-3 rounded-full hover:border-dark-primary hover:text-dark-primary transition-colors font-semibold active:scale-[0.97] inline-block text-center"
                >
                  Ver Demonstração
                </Link>
              </div>
            </div>

            {/*  Therapeutic Class Cards  */}
            <div className="relative z-10 mt-8 lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                {drugClasses.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-xl p-5 shadow-md border border-neutral-border/50 hover:shadow-lg hover:border-sec-default/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-3`}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
                    </div>
                    <h4 className="font-label-md text-label-md text-dark-text font-semibold">
                      {item.name}
                    </h4>
                    <p className="font-label-sm text-label-sm text-muted-text mt-1">
                      {item.count} fármacos na base
                    </p>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-dark-primary text-on-dark text-label-sm font-label-sm px-4 py-2 rounded-full shadow-lg shadow-dark-primary/20 hidden md:block">
                +1.700 medicamentos na base
              </div>
            </div>
          </div>
        </section>

        {/*  Stats Bar  */}
        <section className="relative -mt-12 mb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto z-20">
          <div className="bg-neutral-surface rounded-xl shadow-xl shadow-dark-primary/5 border border-neutral-border/50 divide-y md:divide-y-0 md:divide-x divide-neutral-border/50 grid grid-cols-1 md:grid-cols-3">
            <div className="p-6 text-center">
              <p className="font-headline-lg text-headline-lg text-sec-default font-bold">+1.700</p>
              <p className="font-label-md text-label-md text-muted-text mt-1">medicamentos na base de dados</p>
            </div>
            <div className="p-6 text-center">
              <p className="font-headline-lg text-headline-lg text-sec-default font-bold">&lt; 2s</p>
              <p className="font-label-md text-label-md text-muted-text mt-1">tempo médio de análise</p>
            </div>
            <div className="p-6 text-center">
              <p className="font-headline-lg text-headline-lg text-sec-default font-bold">+191 mil</p>
              <p className="font-label-md text-label-md text-muted-text mt-1">pares de interação mapeados</p>
            </div>
          </div>
        </section>

        {/*  Features Section  */}
        <section className="bg-neutral-subtle py-24 px-margin-mobile md:px-margin-desktop" id="features">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-dark-text mb-4">
                Classificação de Risco em 3 Níveis
              </h2>
              <p className="font-body-md text-body-md text-dark-text/80 max-w-[600px] mx-auto">
                Cada interação é classificada automaticamente com base na gravidade do risco, permitindo que o profissional priorize os casos mais críticos.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/*  Grave  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-severity-grave/20 transition-all duration-300 hover:scale-[1.02] flex flex-col items-start border-t-2 border-t-severity-grave">
                <div className="bg-severity-grave/10 p-3 rounded-full mb-4">
                  <AlertTriangle className="w-5 h-5 text-severity-grave" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">Grave</h3>
                <p className="font-body-md text-body-md text-dark-text/80 mb-4">
                  Risco elevado de danos ao paciente. Ex: Varfarina + Aspirina aumenta risco de sangramento. O sistema bloqueia a prescrição e emite alerta crítico.
                </p>
                <div className="mt-auto inline-flex items-center gap-1 text-severity-grave font-label-sm text-label-sm">
                  <Cpu className="w-4 h-4" aria-hidden="true" /> Notificação imediata
                </div>
              </div>
              {/*  Moderada  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-severity-moderada/20 transition-all duration-300 hover:scale-[1.02] flex flex-col items-start border-t-2 border-t-severity-moderada">
                <div className="bg-severity-moderada/10 p-3 rounded-full mb-4">
                  <FlaskConical className="w-5 h-5 text-severity-moderada" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">Moderada</h3>
                <p className="font-body-md text-body-md text-dark-text/80 mb-4">
                  Requer monitoramento. Ex: Sinvastatina + Claritromicina pode elevar risco de miopatia. O sistema sugere ajuste de dose ou substituição.
                </p>
                <div className="mt-auto inline-flex items-center gap-1 text-severity-moderada font-label-sm text-label-sm">
                  <BarChart3 className="w-4 h-4" aria-hidden="true" /> Sugestão de conduta
                </div>
              </div>
              {/*  Leve  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-severity-leve/20 transition-all duration-300 hover:scale-[1.02] flex flex-col items-start border-t-2 border-t-severity-leve">
                <div className="bg-severity-leve/10 p-3 rounded-full mb-4">
                  <Info className="w-5 h-5 text-severity-leve" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">Leve</h3>
                <p className="font-body-md text-body-md text-dark-text/80 mb-4">
                  Baixo risco clínico. Informação relevante para o profissional, geralmente sem necessidade de intervenção. O sistema apenas documenta para prontuário.
                </p>
                <div className="mt-auto inline-flex items-center gap-1 text-severity-leve font-label-sm text-label-sm">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Documentação automática
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  How It Works / Trust Section  */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-neutral-bg" id="how-it-works">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-dark-text mb-4">
                Como o PharmIA Funciona
              </h2>
              <p className="font-body-md text-body-md text-dark-text/80 max-w-[600px] mx-auto">
                Em menos de 2 segundos, o sistema analisa combinações entre medicamentos e classifica o risco de interação.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/*  Step 1  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-dark-primary/10 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center">
                <div className="bg-sec-bg p-4 rounded-full mb-4">
                  <Pill className="w-6 h-6 text-sec-default" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">
                  Informe os Medicamentos
                </h3>
                <p className="font-body-md text-body-md text-dark-text/80">
                  Digite ou selecione os medicamentos que o paciente está utilizando. O sistema busca automaticamente na base com mais de 1.700 fármacos.
                </p>
              </div>
              {/*  Step 2  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-dark-primary/10 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center">
                <div className="bg-sec-bg p-4 rounded-full mb-4">
                  <Brain className="w-6 h-6 text-sec-default" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">
                  Análise Automática
                </h3>
                <p className="font-body-md text-body-md text-dark-text/80">
                  Em menos de 2 segundos, o sistema cruza os dados e classifica cada interação como grave, moderada ou leve, com explicações detalhadas.
                </p>
              </div>
              {/*  Step 3  */}
              <div className="glass-card rounded-lg p-stack-lg shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-dark-primary/10 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center text-center">
                <div className="bg-sec-bg p-4 rounded-full mb-4">
                  <ShieldCheck className="w-6 h-6 text-sec-default" aria-hidden="true" />
                </div>
                <h3 className="font-headline-md text-headline-md text-dark-text mb-2">
                  Decida com Segurança
                </h3>
                <p className="font-body-md text-body-md text-dark-text/80">
                  Visualize as recomendações, ajuste dosagens, substitua medicamentos e gere relatórios para o prontuário do paciente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  CTA Section  */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-neutral-subtle border-t border-neutral-border/30">
          <div className="max-w-[800px] mx-auto text-center glass-card rounded-2xl p-12 shadow-xl shadow-dark-primary/5 hover:shadow-2xl hover:shadow-dark-primary/10 transition-shadow duration-300">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-dark-text mb-6">
              Comece a Analisar Interações Agora
            </h2>
            <p className="font-body-md text-body-md text-dark-text/80 mb-8">
              Crie sua conta gratuita e tenha acesso imediato à base completa de medicamentos e ao sistema de classificação de risco.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                aria-label="Criar conta gratuita no PharmIA"
                className="bg-sec-default text-on-sec font-label-md text-label-md px-8 py-4 rounded-full hover:bg-sec-hover transition-colors shadow-lg shadow-sec-default/30 hover:shadow-xl hover:shadow-sec-hover/20 font-semibold text-[16px] active:scale-[0.97] inline-flex text-center align-center items-center justify-center cursor-pointer"
              >
                Criar Conta Gratuita
              </Link>
              <Link
                href="/login"
                aria-label="Fazer login no sistema"
                className="bg-transparent border-2 border-neutral-border text-muted-text font-label-md text-label-md px-8 py-4 rounded-full hover:border-dark-primary hover:text-dark-primary transition-colors font-semibold text-[16px] active:scale-[0.97] inline-block cursor-pointer"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/*  Footer Component  */}
      <footer className="w-full py-stack-lg bg-neutral-surface border-t border-neutral-border/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {/*  Brand / Copyright  */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-headline-md font-bold text-dark-text text-[18px]">
                PharmIA
              </span>
            </div>
            <p className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text/80 transition-opacity">
              &copy; 2024 PharmIA Research. Todos os direitos reservados.
            </p>
          </div>
          {/*  Links Column 1  */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <a
              className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text transition-colors"
              href="#"
            >
              Política de Privacidade
            </a>
            <a
              className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text transition-colors"
              href="#"
            >
              Termos de Serviço
            </a>
          </div>
          {/*  Links Column 2  */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <a
              className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text transition-colors"
              href="#"
            >
              Suporte
            </a>
          </div>
          {/*  Links Column 3  */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <a
              className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text transition-colors"
              href="#"
            >
              Documentação
            </a>
            <a
              className="font-label-md text-label-md text-muted-text/80 hover:text-dark-text transition-colors"
              href="#"
            >
              Referência da API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
