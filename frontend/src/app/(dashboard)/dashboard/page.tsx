"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Pill, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityCard } from "@/components/ui/severity-card";
import { InteractionRow } from "@/components/ui/interaction-row";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

interface Stats {
  totalInteractions: number;
  graveCount: number;
  moderadaCount: number;
  leveCount: number;
  topDrugs: { drug: string; count: number }[];
  recentQueries?: Array<{
    drug1: string;
    drug2: string;
    severity: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </>
        ) : (
          <>
            <StatCard
              icon={Activity}
              label="Total de Consultas"
              value={stats?.totalInteractions || 0}
              suffix="interações"
              variant="glass"
              className="animate-fade-in stagger-1"
            />

            <SeverityCard
              severity="Grave"
              count={stats?.graveCount || 0}
              label="Interações Graves"
              subtitle="Requer atenção imediata"
              withSparkline
              animate="animate-fade-in stagger-2"
            />

            <SeverityCard
              severity="Moderada"
              count={stats?.moderadaCount || 0}
              label="Interações Moderadas"
              subtitle="Monitorar efeitos"
              withSparkline
              animate="animate-fade-in stagger-3"
            />

            <SeverityCard
              severity="Leve"
              count={stats?.leveCount || 0}
              label="Interações Leves"
              subtitle="Baixo risco clínico"
              withSparkline
              animate="animate-fade-in stagger-4"
            />
          </>
        )}
      </div>

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
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : stats?.recentQueries && stats.recentQueries.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQueries.slice(0, 5).map((query, index) => (
                <InteractionRow
                  key={index}
                  drug1={query.drug1}
                  drug2={query.drug2}
                  severity={query.severity}
                  timestamp={new Date(query.timestamp).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="Nenhuma consulta ainda"
              actionLabel="Fazer primeira consulta"
              onAction={() => router.push("/interactions")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
