"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { SeverityCard } from "@/components/ui/severity-card";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Stats {
  totalInteractions: number;
  graveCount: number;
  moderadaCount: number;
  leveCount: number;
  topDrugs: { drug: string; count: number }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
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

  if (!isAuthenticated || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  const severityData = stats ? [
    { name: "Grave", value: stats.graveCount, color: "#ef4444" },
    { name: "Moderada", value: stats.moderadaCount, color: "#f59e0b" },
    { name: "Leve", value: stats.leveCount, color: "#10b981" },
  ] : [];

  const topDrugsData = stats?.topDrugs.slice(0, 10).map((item) => ({
    name: item.drug.length > 15 ? item.drug.substring(0, 15) + "..." : item.drug,
    consultas: item.count,
  })) || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Análises e Métricas"
        description="Visualize estatísticas e tendências das interações medicamentosas"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Total de Consultas"
          value={stats?.totalInteractions || 0}
          variant="glass"
          className="animate-fade-in stagger-1"
        />
        <SeverityCard
          severity="Grave"
          count={stats?.graveCount || 0}
          label="Interações Graves"
          animate="animate-fade-in stagger-2"
        />
        <SeverityCard
          severity="Moderada"
          count={stats?.moderadaCount || 0}
          label="Interações Moderadas"
          animate="animate-fade-in stagger-3"
        />
        <SeverityCard
          severity="Leve"
          count={stats?.leveCount || 0}
          label="Interações Leves"
          animate="animate-fade-in stagger-4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card animate-fade-in stagger-1">
          <CardHeader className="pb-2 border-b border-border/40 bg-muted/5">
            <CardTitle className="text-foreground font-semibold">Distribuição por Severidade</CardTitle>
            <CardDescription>Proporção de cada tipo de interação clinica</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 10px 25px -10px rgba(0,0,0,0.05)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-fade-in stagger-2">
          <CardHeader className="pb-2 border-b border-border/40 bg-muted/5">
            <CardTitle className="text-foreground font-semibold">Medicamentos Mais Consultados</CardTitle>
            <CardDescription>Top 10 medicamentos verificados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDrugsData} layout="vertical">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(0,0,0,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="name" width={100} stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 10px 25px -10px rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="consultas" fill="url(#barGradient)" radius={[0, 8, 8, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card animate-fade-in stagger-3">
        <CardHeader className="pb-2 border-b border-border/40 bg-muted/5">
          <CardTitle className="text-foreground font-semibold">Comparação de Severidade</CardTitle>
          <CardDescription>Quantidade absoluta de interações registradas por risco</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <defs>
                  <linearGradient id="severityGraveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="severityModeradaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="severityLeveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(0,0,0,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 10px 25px -10px rgba(0,0,0,0.05)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {severityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={`url(${index === 0 ? "#severityGraveGrad" : index === 1 ? "#severityModeradaGrad" : "#severityLeveGrad"})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
