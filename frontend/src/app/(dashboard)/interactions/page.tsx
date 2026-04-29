"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Pill, AlertTriangle, AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { Drug } from "@/types";

interface InteractionResult {
  drug1: string;
  drug1_dcb: string;
  drug2: string;
  drug2_dcb: string;
  severity: string;
  description?: string;
  confidence?: number;
}

export default function InteractionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [drug1, setDrug1] = useState("");
  const [drug2, setDrug2] = useState("");
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const data = await api.getAllDrugs();
        setDrugs(data.drugs);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
      } finally {
        setIsLoadingDrugs(false);
      }
    };
    fetchDrugs();
  }, []);

  const handleCheck = async () => {
    if (!drug1 || !drug2) {
      setError("Por favor, selecione dois medicamentos");
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.checkInteraction(drug1, drug2);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar interação");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setDrug1("");
    setDrug2("");
    setResult(null);
    setError(null);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Grave":
        return <AlertTriangle className="w-6 h-6" />;
      case "Moderada":
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Grave":
        return {
          container: "bg-severity-grave-light border-severity-grave",
          icon: "text-severity-grave",
          badge: "grave" as const,
          text: "text-severity-grave",
        };
      case "Moderada":
        return {
          container: "bg-severity-moderada-light border-severity-moderada",
          icon: "text-severity-moderada",
          badge: "moderada" as const,
          text: "text-severity-moderada",
        };
      default:
        return {
          container: "bg-severity-leve-light border-severity-leve",
          icon: "text-severity-leve",
          badge: "leve" as const,
          text: "text-severity-leve",
        };
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Consultar Interações</h1>
        <p className="text-muted-foreground mt-1">
          Verifique a severidade da interação entre dois medicamentos
        </p>
      </div>

      {/* Search form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Selecione os Medicamentos
          </CardTitle>
          <CardDescription>
            Escolha dois medicamentos para verificar a interação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drug selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Primeiro Medicamento
              </label>
              {isLoadingDrugs ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={drug1}
                  onChange={(e) => setDrug1(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {drugs.map((drug) => (
                    <option key={drug.inn} value={drug.inn}>
                      {drug.dcb || drug.inn}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Segundo Medicamento
              </label>
              {isLoadingDrugs ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={drug2}
                  onChange={(e) => setDrug2(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {drugs.map((drug) => (
                    <option key={drug.inn} value={drug.inn} disabled={drug.inn === drug1}>
                      {drug.dcb || drug.inn}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCheck} isLoading={isChecking} className="flex-1">
              <Pill className="w-4 h-4 mr-2" />
              Verificar Interação
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className={`border-2 ${getSeverityStyles(result.severity).container}`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className={getSeverityStyles(result.severity).icon}>
                  {getSeverityIcon(result.severity)}
                </div>
                Resultado da Análise
              </CardTitle>
              <Badge variant={getSeverityStyles(result.severity).badge}>
                {result.severity}
              </Badge>
            </div>
            <CardDescription>
              Interação entre {result.drug1_dcb} ({result.drug1}) e {result.drug2_dcb} ({result.drug2})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background/50">
              <h4 className="font-medium text-foreground mb-2">Descrição da Interação</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.description}
              </p>
            </div>

            {result.confidence && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Confiança do modelo:</span>
                <span className="font-medium text-foreground">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/history")}
              >
                Ver Histórico
              </Button>
              <Button size="sm" onClick={handleReset}>
                Nova Consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}