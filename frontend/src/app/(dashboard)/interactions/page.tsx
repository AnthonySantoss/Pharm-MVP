"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pill, AlertTriangle, AlertCircle, CheckCircle, RotateCcw, X, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryMetricCard } from "@/components/ui/summary-metric-card";
import { ErrorBanner } from "@/components/ui/error-banner";
import { DrugAutocomplete } from "@/components/ui/drug-autocomplete";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { Drug, MultiInteractionCheck } from "@/types";

interface SelectedDrug {
  inn: string;
  dcb: string;
}

export default function InteractionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedDrugs, setSelectedDrugs] = useState<SelectedDrug[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<MultiInteractionCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const data = await api.getAllDrugs();
        setDrugs(data.drugs);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
      }
    };
    fetchDrugs();
  }, []);

  const handleAddDrug = (inn: string, dcb: string) => {
    if (selectedDrugs.length >= 10) return;
    if (selectedDrugs.some((d) => d.inn === inn)) return;
    setSelectedDrugs([...selectedDrugs, { inn, dcb }]);
    setResult(null);
    setError(null);
  };

  const handleRemoveDrug = (inn: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d.inn !== inn));
    setResult(null);
  };

  const handleCheck = async () => {
    if (selectedDrugs.length < 2) {
      setError("Selecione pelo menos 2 medicamentos para verificar interações");
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const data = await api.checkMultiInteraction(selectedDrugs.map((d) => d.inn));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar interações");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    setSelectedDrugs([]);
    setResult(null);
    setError(null);
  };

  const getSafetyScore = () => {
    if (!result || !result.interactions || result.interactions.length === 0) return 100;

    const basePenalty: Record<string, number> = {
      Grave: 35,
      Moderada: 15,
      Leve: 5,
    };

    let totalPenalty = 0;
    for (const interaction of result.interactions) {
      const penalty = basePenalty[interaction.severity] || 0;
      const confidence = interaction.confidence ?? 0.5;
      totalPenalty += penalty * (2 - confidence);
    }

    return Math.max(5, Math.round(100 - totalPenalty));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Grave": return <AlertTriangle className="w-5 h-5 animate-pulse-gentle" />;
      case "Moderada": return <AlertCircle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    const base = "glass border-l-4 border-t-border/20 border-r-border/20 border-b-border/20 rounded-2xl relative overflow-hidden bg-white/40 shadow-sm transition-all duration-300 hover:shadow-md";
    switch (severity) {
      case "Grave":
        return { container: `${base} border-l-severity-grave`, icon: "text-severity-grave", badge: "grave" as const, iconBg: "bg-severity-grave/10" };
      case "Moderada":
        return { container: `${base} border-l-severity-moderada`, icon: "text-severity-moderada", badge: "moderada" as const, iconBg: "bg-severity-moderada/10" };
      default:
        return { container: `${base} border-l-severity-leve`, icon: "text-severity-leve", badge: "leve" as const, iconBg: "bg-severity-leve/10" };
    }
  };

  if (!isAuthenticated) return null;

  const safetyScore = getSafetyScore();
  const safetyColor = safetyScore >= 80 ? "stroke-severity-leve" : safetyScore >= 50 ? "stroke-severity-moderada" : "stroke-severity-grave";
  const safetyLabel = safetyScore >= 80 ? "Prescrição Segura" : safetyScore >= 50 ? "Atenção Requerida" : "Alto Risco Clínico";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Consultar Interações"
        description="Verifique a severidade da interação entre múltiplos medicamentos"
        className="animate-fade-in"
      />

      <Card className="glass-card animate-fade-in stagger-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Selecione os Medicamentos
          </CardTitle>
          <CardDescription>
            Escolha até 10 medicamentos para verificar todas as interações entre pares
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Medicamentos Selecionados ({selectedDrugs.length}/10)
            </label>

            {selectedDrugs.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/20 border border-border/50">
                {selectedDrugs.map((drug) => (
                  <div
                    key={drug.inn}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm animate-scale-in"
                  >
                    <span className="font-medium text-primary-dark">{drug.dcb}</span>
                    <button
                      onClick={() => handleRemoveDrug(drug.inn)}
                      className="p-1 rounded-full hover:bg-destructive/15 text-destructive/80 hover:text-destructive transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg bg-muted/10">
                Nenhum medicamento selecionado ainda. Busque e adicione medicamentos abaixo.
              </div>
            )}

            {selectedDrugs.length < 10 && (
              <div className="space-y-1.5">
                <label className="block text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Buscar e Adicionar Medicamento
                </label>
                <DrugAutocomplete
                  drugs={drugs}
                  value=""
                  onChange={(val) => {
                    const drug = drugs.find(d => d.inn === val);
                    if (drug) handleAddDrug(drug.inn, drug.dcb);
                  }}
                  placeholder="Selecione ou digite o nome de um medicamento..."
                  exclude={selectedDrugs.map(d => d.inn)}
                />
              </div>
            )}
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3">
            <Button onClick={handleCheck} isLoading={isChecking} className="flex-1 hover-lift">
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

      {result && (
        <div className="space-y-4">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/40 bg-muted/5">
              <CardTitle className="flex items-center gap-2 text-foreground font-semibold">
                <Pill className="w-5 h-5 text-primary" />
                Resumo de Compatibilidade Clínica
              </CardTitle>
              <CardDescription>
                Análise geral de {result.pairs_checked} pares clínicos avaliados para {result.drugs.length} fármacos
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex flex-col items-center justify-center p-6 glass rounded-2xl border border-border/40 relative overflow-hidden bg-white/20 w-full md:w-56 flex-shrink-0">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-muted/10" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50" cy="50" r="40"
                        className={`transition-all duration-1000 ease-out ${safetyColor} ${safetyScore < 50 ? "animate-pulse-gentle" : ""}`}
                        strokeWidth="8" fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (safetyScore / 100) * 251.2}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-3xl font-extrabold tracking-tight text-foreground">{safetyScore}%</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Seguro</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${safetyScore >= 80 ? "bg-severity-leve/10 text-severity-leve" : safetyScore >= 50 ? "bg-severity-moderada/10 text-severity-moderada" : "bg-severity-grave/10 text-severity-grave"}`}>
                      {safetyLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
                  <SummaryMetricCard value={result.summary.grave} label="Graves" dotColor="bg-severity-grave" pulse />
                  <SummaryMetricCard value={result.summary.moderada} label="Moderadas" dotColor="bg-severity-moderada" />
                  <SummaryMetricCard value={result.summary.leve} label="Leves" dotColor="bg-severity-leve" />
                  <SummaryMetricCard value={result.summary.total} label="Total Pares" dotColor="bg-neutral-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medicamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.drugs.map((drug, idx) => (
                  <Badge key={drug} variant="outline" className="px-3 py-1">
                    {result.drugs_dcb[idx]} ({drug})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Interações por Par</h3>
            {result.interactions.map((interaction, idx) => (
              <Card key={idx} className={getSeverityStyles(interaction.severity).container}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${getSeverityStyles(interaction.severity).iconBg} flex items-center justify-center ${getSeverityStyles(interaction.severity).icon}`}>
                        {getSeverityIcon(interaction.severity)}
                      </div>
                      <div>
                        <p className="font-medium">
                          {interaction.drug1_dcb} + {interaction.drug2_dcb}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({interaction.drug1}) + ({interaction.drug2})
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSeverityStyles(interaction.severity).badge}>
                      {interaction.severity}
                    </Badge>
                  </div>
                  {interaction.description && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-sm text-muted-foreground">{interaction.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/history")}>
              <Clock className="w-4 h-4 mr-2" />
              Ver Histórico
            </Button>
            <Button onClick={handleReset} className="hover-lift">
              Nova Consulta
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
