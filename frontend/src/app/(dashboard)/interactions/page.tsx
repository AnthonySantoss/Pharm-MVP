"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pill, AlertTriangle, AlertCircle, CheckCircle, RotateCcw, Info, FileText, Clock, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<MultiInteractionCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "description">("details");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        console.log("[DEBUG] Fetching drugs...");
        const data = await api.getAllDrugs();
        console.log("[DEBUG] Drugs received:", data.count, "drugs");
        setDrugs(data.drugs);
      } catch (err) {
        console.error("[DEBUG] Failed to fetch drugs:", err);
      } finally {
        setIsLoadingDrugs(false);
      }
    };
    fetchDrugs();
  }, []);

  const handleCheck = async () => {
    if (selectedDrugs.length < 2) {
      setError("Por favor, selecione pelo menos 2 medicamentos");
      return;
    }

    setIsChecking(true);
    setError(null);
    setResult(null);
    setActiveTab("details");

    try {
      const data = await api.checkMultiInteraction(selectedDrugs.map(d => d.inn));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar interação");
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddDrug = (inn: string, dcb: string) => {
    if (selectedDrugs.length >= 10) {
      setError("Máximo de 10 medicamentos permitidos");
      return;
    }
    if (selectedDrugs.some(d => d.inn === inn)) {
      setError("Medicamento já adicionado");
      return;
    }
    setSelectedDrugs([...selectedDrugs, { inn, dcb }]);
    setError(null);
  };

  const handleRemoveDrug = (inn: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.inn !== inn));
  };

  const handleReset = () => {
    setSelectedDrugs([]);
    setResult(null);
    setError(null);
  };

  const getSafetyScore = () => {
    if (!result) return 100;
    const grave = result.summary.grave || 0;
    const moderada = result.summary.moderada || 0;
    const leve = result.summary.leve || 0;
    
    if (grave > 0) {
      return Math.max(15, 100 - (grave * 35) - (moderada * 10));
    }
    if (moderada > 0) {
      return Math.max(45, 100 - (moderada * 15) - (leve * 5));
    }
    if (leve > 0) {
      return Math.max(80, 100 - (leve * 5));
    }
    return 100;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Grave":
        return <AlertTriangle className="w-5 h-5 animate-pulse-gentle" />;
      case "Moderada":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Grave":
        return {
          container: "glass border-l-4 border-l-severity-grave border-t-border/20 border-r-border/20 border-b-border/20 rounded-2xl relative overflow-hidden bg-white/40 shadow-sm transition-all duration-300 hover:shadow-md",
          icon: "text-severity-grave",
          badge: "grave" as const,
          text: "text-severity-grave",
          glow: "shadow-none",
          iconBg: "bg-severity-grave/10",
        };
      case "Moderada":
        return {
          container: "glass border-l-4 border-l-severity-moderada border-t-border/20 border-r-border/20 border-b-border/20 rounded-2xl relative overflow-hidden bg-white/40 shadow-sm transition-all duration-300 hover:shadow-md",
          icon: "text-severity-moderada",
          badge: "moderada" as const,
          text: "text-severity-moderada",
          glow: "shadow-none",
          iconBg: "bg-severity-moderada/10",
        };
      default:
        return {
          container: "glass border-l-4 border-l-severity-leve border-t-border/20 border-r-border/20 border-b-border/20 rounded-2xl relative overflow-hidden bg-white/40 shadow-sm transition-all duration-300 hover:shadow-md",
          icon: "text-severity-leve",
          badge: "leve" as const,
          text: "text-severity-leve",
          glow: "shadow-none",
          iconBg: "bg-severity-leve/10",
        };
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Consultar Interações</h1>
        <p className="text-muted-foreground mt-1">
          Verifique a severidade da interação entre múltiplos medicamentos
        </p>
      </div>

      {/* Search form */}
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
          {/* Selected drugs list */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Medicamentos Selecionados ({selectedDrugs.length}/10)
            </label>
            
            {/* Selected Tags list */}
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

            {/* Wide Search autocomplete field */}
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

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

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

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
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
                {/* Radial circular progress safety score gauge */}
                <div className="flex flex-col items-center justify-center p-6 glass rounded-2xl border border-border/40 relative overflow-hidden bg-white/20 w-full md:w-56 flex-shrink-0">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* SVG Radial Meter */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Inner track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-muted/10"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      {/* Active safety percentage path */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={`transition-all duration-1000 ease-out ${getSafetyScore() >= 80 ? "stroke-severity-leve" : getSafetyScore() >= 50 ? "stroke-severity-moderada" : "stroke-severity-grave animate-pulse-gentle"}`}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (getSafetyScore() / 100) * 251.2}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Inside text absolute overlay */}
                    <div className="absolute text-center">
                      <p className="text-3xl font-extrabold tracking-tight text-foreground">{getSafetyScore()}%</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Seguro</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getSafetyScore() >= 80 ? "bg-severity-leve/10 text-severity-leve" : getSafetyScore() >= 50 ? "bg-severity-moderada/10 text-severity-moderada" : "bg-severity-grave/10 text-severity-grave"}`}>
                      {getSafetyScore() >= 80 ? "Prescrição Segura" : getSafetyScore() >= 50 ? "Atenção Requerida" : "Alto Risco Clínico"}
                    </span>
                  </div>
                </div>

                {/* Grid summary metrics on the right */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
                  <div className="glass p-4 rounded-xl border border-border/40 relative overflow-hidden text-center hover:bg-neutral-50/20 transition-all duration-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-severity-grave animate-pulse-gentle mx-auto mb-2" />
                    <p className="text-3xl font-extrabold text-foreground">{result.summary.grave}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Graves</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-border/40 relative overflow-hidden text-center hover:bg-neutral-50/20 transition-all duration-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-severity-moderada mx-auto mb-2" />
                    <p className="text-3xl font-extrabold text-foreground">{result.summary.moderada}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Moderadas</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-border/40 relative overflow-hidden text-center hover:bg-neutral-50/20 transition-all duration-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-severity-leve mx-auto mb-2" />
                    <p className="text-3xl font-extrabold text-foreground">{result.summary.leve}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Leves</p>
                  </div>
                  <div className="glass p-4 rounded-xl border border-border/40 relative overflow-hidden text-center hover:bg-neutral-50/20 transition-all duration-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 mx-auto mb-2" />
                    <p className="text-3xl font-extrabold text-foreground">{result.summary.total}</p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Total Pares</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drug list */}
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

          {/* Interactions list */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Interações por Par</h3>
            {result.interactions.map((interaction, idx) => (
             <Card key={idx} className={`${getSeverityStyles(interaction.severity).container}`}>
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

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/history")}
            >
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