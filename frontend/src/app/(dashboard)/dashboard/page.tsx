"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pill, AlertTriangle, AlertCircle, TrendingUp, ArrowRight, Activity, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

interface Stats {
  totalInteractions?: number;
  graveCount?: number;
  moderadaCount?: number;
  leveCount?: number;
  recentQueries?: Array<{
    drug1: string;
    drug2: string;
    severity: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getSeverityVariant = (severity: string): "grave" | "moderada" | "leve" => {
    switch (severity) {
      case "Grave":
        return "grave";
      case "Moderada":
        return "moderada";
      default:
        return "leve";
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">👋</span>
          <div>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
              {getTimeGreeting()}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
             Olá, {user?.name?.split(" ")[0] || "Usuário"}!
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao PharmIA - Análise de Interações Medicamentosas
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/interactions" className="animate-fade-in stagger-1">
          <Card className="hover-lift cursor-pointer border-primary/20 hover:border-primary glass-card group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nova Consulta</p>
                <p className="text-sm text-muted-foreground">Verificar interação</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        {user?.role !== "patient" && (
          <Link href="/analytics" className="animate-fade-in stagger-2">
            <Card className="hover-lift cursor-pointer border-secondary/20 hover:border-secondary glass-card group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Análises</p>
                  <p className="text-sm text-muted-foreground">Ver métricas</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/history" className="animate-fade-in stagger-3">
          <Card className="hover-lift cursor-pointer glass-card group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-neutral-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Histórico</p>
                <p className="text-sm text-muted-foreground">Suas consultas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="glass-card animate-fade-in stagger-1">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total de Consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-4xl font-bold flex items-baseline gap-2">
                  <span className="text-foreground">{stats?.totalInteractions || 0}</span>
                  <span className="text-sm font-normal text-muted-foreground">interações</span>
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="glass-card animate-fade-in stagger-1 hover-lift relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Total de Consultas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <CardTitle className="text-4xl font-bold flex items-baseline gap-2 text-foreground">
                    <span>{stats?.totalInteractions || 0}</span>
                    <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider">interações</span>
                  </CardTitle>
                </CardContent>
              </div>
              {/* SVG Sparkline Total */}
              <div className="h-10 mt-4 -mx-6 -mb-6 opacity-75 hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-total" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 22 Q 20 28, 40 12 T 70 18 T 100 8 L 100 30 L 0 30 Z"
                    fill="url(#sparkline-total)"
                  />
                  <path
                    d="M 0 22 Q 20 28, 40 12 T 70 18 T 100 8"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>

            <Card className="glass-card border-t-2 border-t-severity-grave animate-fade-in stagger-2 hover-lift relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-medium text-foreground">
                    <span className="w-2 h-2 rounded-full bg-severity-grave animate-pulse-gentle" />
                    Interações Graves
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <CardTitle className="text-4xl font-bold text-foreground">
                    {stats?.graveCount || 0}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1.5">Requer atenção imediata</p>
                </CardContent>
              </div>
              {/* SVG Sparkline Grave */}
              <div className="h-10 mt-4 -mx-6 -mb-6 opacity-75 hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-grave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--severity-grave)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--severity-grave)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 25 Q 15 15, 30 20 T 60 10 T 80 18 T 100 5 L 100 30 L 0 30 Z"
                    fill="url(#sparkline-grave)"
                  />
                  <path
                    d="M 0 25 Q 15 15, 30 20 T 60 10 T 80 18 T 100 5"
                    fill="none"
                    stroke="var(--severity-grave)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>

            <Card className="glass-card border-t-2 border-t-severity-moderada animate-fade-in stagger-3 hover-lift relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-medium text-foreground">
                    <span className="w-2 h-2 rounded-full bg-severity-moderada" />
                    Interações Moderadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <CardTitle className="text-4xl font-bold text-foreground">
                    {stats?.moderadaCount || 0}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1.5">Monitorar efeitos</p>
                </CardContent>
              </div>
              {/* SVG Sparkline Moderada */}
              <div className="h-10 mt-4 -mx-6 -mb-6 opacity-75 hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-moderada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--severity-moderada)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--severity-moderada)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 20 Q 25 10, 50 25 T 75 8 T 100 15 L 100 30 L 0 30 Z"
                    fill="url(#sparkline-moderada)"
                  />
                  <path
                    d="M 0 20 Q 25 10, 50 25 T 75 8 T 100 15"
                    fill="none"
                    stroke="var(--severity-moderada)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>

            <Card className="glass-card border-t-2 border-t-severity-leve animate-fade-in stagger-4 hover-lift relative overflow-hidden flex flex-col justify-between">
              <div>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2 font-medium text-foreground">
                    <span className="w-2 h-2 rounded-full bg-severity-leve" />
                    Interações Leves
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <CardTitle className="text-4xl font-bold text-foreground">
                    {stats?.leveCount || 0}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1.5">Baixo risco clínico</p>
                </CardContent>
              </div>
              {/* SVG Sparkline Leve */}
              <div className="h-10 mt-4 -mx-6 -mb-6 opacity-75 hover:opacity-100 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparkline-leve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--severity-leve)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--severity-leve)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 26 Q 20 18, 40 22 T 80 12 T 100 18 L 100 30 L 0 30 Z"
                    fill="url(#sparkline-leve)"
                  />
                  <path
                    d="M 0 26 Q 20 18, 40 22 T 80 12 T 100 18"
                    fill="none"
                    stroke="var(--severity-leve)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Recent queries */}
      <Card className="glass-card animate-fade-in stagger-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Consultas Recentes
          </CardTitle>
          <CardDescription>Últimas interações verificadas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : stats?.recentQueries && stats.recentQueries.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQueries.slice(0, 5).map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {query.drug1} + {query.drug2}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(query.timestamp).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityVariant(query.severity)}>
                    {query.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground mb-4">Nenhuma consulta ainda</p>
              <Link
                href="/interactions"
                className="text-primary hover:underline font-medium"
              >
                Fazer primeira consulta
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}