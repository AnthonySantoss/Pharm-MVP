"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { InteractionRow } from "@/components/ui/interaction-row";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { HistoryEntry } from "@/types";

const ITEMS_PER_PAGE = 10;
type SeverityFilter = "all" | "Grave" | "Moderada" | "Leve";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchHistory();
  }, [isAuthenticated, router]);

  const fetchHistory = async () => {
    try {
      const data = await api.getInteractionsHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = history;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.drug1.toLowerCase().includes(q) ||
          item.drug2.toLowerCase().includes(q) ||
          item.drug1_dcb?.toLowerCase().includes(q) ||
          item.drug2_dcb?.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== "all") {
      filtered = filtered.filter((item) => item.severity === severityFilter);
    }
    return filtered;
  }, [history, search, severityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    const csv = [
      ["Medicamento 1", "DCB 1", "Medicamento 2", "DCB 2", "Severidade", "Data"].join(","),
      ...filteredHistory.map((item) =>
        [
          item.drug1,
          item.drug1_dcb,
          item.drug2,
          item.drug2_dcb,
          item.severity,
          new Date(item.timestamp).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-interacoes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Histórico de Consultas"
        description="Visualize todas as interações que você verificou"
        className="animate-fade-in"
      />

      <Card className="glass-card animate-fade-in stagger-1">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Suas Consultas
              </CardTitle>
              <CardDescription>
                {filteredHistory.length} interação{filteredHistory.length !== 1 ? "ões" : ""} encontrada{filteredHistory.length !== 1 ? "s" : ""}
                {search || severityFilter !== "all" ? " (filtrada)" : ""}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredHistory.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Buscar por medicamento..."
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value as SeverityFilter); setCurrentPage(1); }}
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Todas</option>
                <option value="Grave">Grave</option>
                <option value="Moderada">Moderada</option>
                <option value="Leve">Leve</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : paginatedHistory.length > 0 ? (
            <div className="space-y-3">
              {paginatedHistory.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
                  <InteractionRow
                    drug1={item.drug1_dcb}
                    drug2={item.drug2_dcb}
                    severity={item.severity}
                    timestamp={new Date(item.timestamp).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={History}
              title={search || severityFilter !== "all" ? "Nenhuma consulta encontrada" : "Nenhuma consulta ainda"}
              description={search || severityFilter !== "all" ? "Tente ajustar os filtros" : "Comece a verificar interações medicamentosas"}
              actionLabel={!search && severityFilter === "all" ? "Fazer primeira consulta" : undefined}
              onAction={!search && severityFilter === "all" ? () => router.push("/interactions") : undefined}
            />
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
