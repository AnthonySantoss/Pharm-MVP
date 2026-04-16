"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Pill, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
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
  LineChart,
  Line,
} from "recharts";

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

const COLORS = ["#DC2626", "#F59E0B", "#22C55E"];

export default function AnalyticsPage() {
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

  if (!isAuthenticated || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Prepare chart data
  const severityData = stats ? [
    { name: "Grave", value: stats.graveCount, color: "#DC2626" },
    { name: "Moderada", value: stats.moderadaCount, color: "#F59E0B" },
    { name: "Leve", value: stats.leveCount, color: "#22C55E" },
  ] : [];

  const topDrugsData = stats?.topDrugs.slice(0, 10).map((item) => ({
    name: item.drug.length > 15 ? item.drug.substring(0, 15) + "..." : item.drug,
    consultas: item.count,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Análises e Métricas</h1>
        <p className="text-muted-foreground mt-1">
          Visualize estatísticas e tendências das interações medicamentosas
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total de Consultas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold">{stats?.totalInteractions || 0}</CardTitle>
          </CardContent>
        </Card>

        <Card className="border-severity-grave/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-severity-grave">
              <AlertTriangle className="w-4 h-4" />
              Graves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold text-severity-grave">
              {stats?.graveCount || 0}
            </CardTitle>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-severity-moderada">
              <TrendingUp className="w-4 h-4" />
              Moderadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold text-severity-moderada">
              {stats?.moderadaCount || 0}
            </CardTitle>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-severity-leve">
              <Pill className="w-4 h-4" />
              Leves
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-bold text-severity-leve">
              {stats?.leveCount || 0}
            </CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity distribution - Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
            <CardDescription>Proporção de cada tipo de interação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top drugs - Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Medicamentos Mais Consultados</CardTitle>
            <CardDescription>Top 10 medicamentos mais verificados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDrugsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="consultas" fill="#0F766E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Severity comparison - Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Severidade</CardTitle>
          <CardDescription>Quantidade de interações por nível de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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