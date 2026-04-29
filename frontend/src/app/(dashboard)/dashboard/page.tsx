"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pill, AlertTriangle, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
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

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Olá, {user?.name || "Usuário"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao PharmIA - Análise de Interações Medicamentosas
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/interactions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 hover:border-primary">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Nova Consulta</p>
                <p className="text-sm text-muted-foreground">Verificar interação</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </CardContent>
          </Card>
        </Link>

        {user?.role !== "patient" && (
          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-secondary/20 hover:border-secondary">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Análises</p>
                  <p className="text-sm text-muted-foreground">Ver métricas</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/history">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Pill className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Histórico</p>
                <p className="text-sm text-muted-foreground">Suas consultas</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
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
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Consultas</CardDescription>
                <CardTitle className="text-3xl font-bold">
                  {stats?.totalInteractions || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Interações verificadas
                </div>
              </CardContent>
            </Card>

            <Card className="border-severity-grave/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-severity-grave">Interações Graves</CardDescription>
                <CardTitle className="text-3xl font-bold text-severity-grave">
                  {stats?.graveCount || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-severity-grave">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Requer atenção</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-severity-moderada/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-severity-moderada">Interações Moderadas</CardDescription>
                <CardTitle className="text-3xl font-bold text-severity-moderada">
                  {stats?.moderadaCount || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-severity-moderada">
                  <AlertCircle className="w-4 h-4" />
                  <span>Monitorar</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-severity-leve/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-severity-leve">Interações Leves</CardDescription>
                <CardTitle className="text-3xl font-bold text-severity-leve">
                  {stats?.leveCount || 0}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-severity-leve">
                  <AlertCircle className="w-4 h-4" />
                  <span>Baixo risco</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent queries */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Recentes</CardTitle>
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
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {query.drug1} + {query.drug2}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(query.timestamp).toLocaleDateString("pt-BR")}
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
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma consulta ainda</p>
              <Link
                href="/interactions"
                className="text-primary hover:underline text-sm"
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