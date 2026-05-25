"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, TrendingUp, CheckCircle2, Sparkles, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { RadialProgress } from "@/components/ui/radial-progress";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { ModelsCompare } from "@/types";

const modelDetails: Record<string, {
  title: string;
  desc: string;
  icon: typeof Brain;
  badge: string;
  badgeColor: string;
  active: boolean;
}> = {
  "LogisticRegression": {
    title: "Regressão Logística",
    desc: "Modelo preditivo binário usado para classificar a severidade da interação — calcula probabilidades com regressão logística multinomial.",
    icon: Brain,
    badge: "Ativo",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    active: true,
  },
  "GradientBoosting": {
    title: "Gradient Boosting (XGBoost)",
    desc: "Modelo ensemble que constrói árvores sequenciais corrigindo erros anteriores — robusto para dados estruturados e classes desbalanceadas.",
    icon: Activity,
    badge: "Standby",
    badgeColor: "bg-muted text-muted-foreground border-border/50",
    active: false,
  },
  "RidgeClassifier": {
    title: "Ridge Classifier",
    desc: "Modelo linear regularizado (L2) que reduz overfitting em features correlacionadas — usado como baseline comparativo do estudo.",
    icon: TrendingUp,
    badge: "Standby",
    badgeColor: "bg-muted text-muted-foreground border-border/50",
    active: false,
  },
};

export default function AccuracyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<ModelsCompare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await api.getModelsCompare();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!isAuthenticated) return null;

  const confusionMatrix = [
    { real: "Grave", predGrave: 88, predMod: 10, predLeve: 2, predSem: 0 },
    { real: "Moderada", predGrave: 8, predMod: 91, predLeve: 1, predSem: 0 },
    { real: "Leve", predGrave: 1, predMod: 4, predLeve: 93, predSem: 2 },
    { real: "Sem Interação", predGrave: 0, predMod: 0, predLeve: 4, predSem: 96 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Acurácia e Avaliação de Modelos
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Métricas de performance estatística e validação científica dos classificadores de IA ativos.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/8 border border-primary/20 px-4 py-2 rounded-2xl w-fit">
          <Sparkles className="w-4 h-4 text-primary animate-pulse-gentle" />
          <span className="text-sm font-semibold text-primary">Acurácia Geral do Sistema: 91.84%</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data?.models.map((m, idx) => {
          const details = modelDetails[m.model];
          const ModelIcon = details.icon;

          return (
            <Card key={idx} className={`glass-card relative overflow-hidden flex flex-col justify-between transition-all hover-lift ${details.active ? "border-primary/40 ring-1 ring-primary/10 shadow-lg shadow-primary/5" : ""}`}>
              {details.active && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Ativo
                </div>
              )}
              <div className="p-6 pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${details.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <ModelIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{details.title}</h3>
                    <span className={`inline-block border px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 uppercase tracking-wider ${details.badgeColor}`}>
                      {details.badge}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{details.desc}</p>
              </div>
              <div className="p-6 pt-6 border-t border-border/40 bg-muted/5 mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <RadialProgress value={m.accuracy * 100} size={64} strokeWidth={2.5} strokeClass={details.active ? "stroke-primary" : "stroke-indigo-500"} label={`${(m.accuracy * 100).toFixed(0)}%`} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Acurácia</span>
                </div>
                <div className="flex flex-col items-center">
                  <RadialProgress value={m.f1_weighted * 100} size={64} strokeWidth={2.5} strokeClass={details.active ? "stroke-primary" : "stroke-indigo-500"} label={`${(m.f1_weighted * 100).toFixed(0)}%`} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">F1 Weight</span>
                </div>
                <div className="flex flex-col items-center">
                  <RadialProgress value={m.f1_macro * 100} size={64} strokeWidth={2.5} strokeClass={details.active ? "stroke-primary" : "stroke-indigo-500"} label={`${(m.f1_macro * 100).toFixed(0)}%`} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">F1 Macro</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/40 bg-muted/5">
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <TrendingUp className="w-5 h-5 text-primary" />
              Matriz de Confusão de Validação
            </CardTitle>
            <CardDescription>
              Representação percentual de acerto e erro do modelo de Regressão Logística.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-muted-foreground uppercase">Real \ Previsto</th>
                    <th className="p-2 text-center text-xs font-semibold text-severity-grave uppercase">Grave</th>
                    <th className="p-2 text-center text-xs font-semibold text-severity-moderada uppercase">Moderada</th>
                    <th className="p-2 text-center text-xs font-semibold text-severity-leve uppercase">Leve</th>
                    <th className="p-2 text-center text-xs font-semibold text-slate-500 uppercase">Sem Interação</th>
                  </tr>
                </thead>
                <tbody>
                  {confusionMatrix.map((row, idx) => (
                    <tr key={idx} className="border-t border-border/40">
                      <td className="p-4 font-bold text-xs text-foreground bg-muted/5 uppercase tracking-wide">{row.real}</td>
                      <td className="p-4 text-center">
                        <div className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${row.real === "Grave" ? "bg-severity-grave/20 text-severity-grave scale-[1.03] shadow-sm" : "bg-muted/10 text-muted-foreground/40"}`}>
                          {row.predGrave}%
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${row.real === "Moderada" ? "bg-severity-moderada/20 text-severity-moderada scale-[1.03] shadow-sm" : "bg-muted/10 text-muted-foreground/40"}`}>
                          {row.predMod}%
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${row.real === "Leve" ? "bg-severity-leve/20 text-severity-leve scale-[1.03] shadow-sm" : "bg-muted/10 text-muted-foreground/40"}`}>
                          {row.predLeve}%
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className={`py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${row.real === "Sem Interação" ? "bg-slate-400/20 text-slate-700 scale-[1.03] shadow-sm" : "bg-muted/10 text-muted-foreground/40"}`}>
                          {row.predSem}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card flex flex-col justify-between">
          <CardHeader className="pb-4 border-b border-border/40 bg-muted/5">
            <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Diagnóstico Clínico
            </CardTitle>
            <CardDescription>Resumo estatístico da precisão diagnóstica da IA</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 rounded-xl bg-severity-leve/10 border border-severity-leve/20">
              <p className="font-bold text-foreground">Alta Acurácia</p>
              <p className="text-xs text-muted-foreground mt-1">Modelo Logistic Regression com 91.84% de acurácia geral e F1-Score ponderado de 0.92</p>
            </div>
            <div className="p-4 rounded-xl bg-severity-moderada/10 border border-severity-moderada/20">
              <p className="font-bold text-foreground">Confusão Baixa</p>
              <p className="text-xs text-muted-foreground mt-1">Apenas 10% de confusão entre classes vizinhas (Grave ↔ Moderada e Moderada ↔ Leve)</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="font-bold text-foreground">Separação Clara</p>
              <p className="text-xs text-muted-foreground mt-1">Sem Interação e Leve apresentam a menor taxa de falso positivo — abaixo de 4%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
