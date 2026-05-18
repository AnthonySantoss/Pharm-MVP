"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { History, Pill, Trash2, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";

interface HistoryItem {
  id: string;
  drug1: string;
  drug1_dcb: string;
  drug2: string;
  drug2_dcb: string;
  severity: string;
  timestamp: string;
}

type SeverityFilter = "all" | "Grave" | "Moderada" | "Leve";

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
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
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        item.drug1.toLowerCase().includes(searchLower) ||
        item.drug1_dcb.toLowerCase().includes(searchLower) ||
        item.drug2.toLowerCase().includes(searchLower) ||
        item.drug2_dcb.toLowerCase().includes(searchLower);
      const matchesSeverity =
        severityFilter === "all" || item.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [history, search, severityFilter]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHistory.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, severityFilter]);

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

  const handleExport = () => {
    const csv = [
      ["Data", "Medicamento 1", "Medicamento 2", "Severidade"].join(","),
      ...filteredHistory.map((item) =>
        [
          new Date(item.timestamp).toLocaleString("pt-BR"),
          item.drug1_dcb,
          item.drug2_dcb,
          item.severity,
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Histórico de Consultas</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todas as interações que você verificou
        </p>
      </div>

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
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por medicamento..."
                className="flex h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Todas</option>
                <option value="Grave">Grave</option>
                <option value="Moderada">Moderada</option>
                <option value="Leve">Leve</option>
              </select>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : paginatedHistory.length > 0 ? (
            <div className="space-y-3">
              {paginatedHistory.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {item.drug1_dcb} + {item.drug2_dcb}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getSeverityVariant(item.severity)}>
                    {item.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {search || severityFilter !== "all"
                  ? "Nenhuma consulta encontrada"
                  : "Nenhuma consulta ainda"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || severityFilter !== "all"
                  ? "Tente ajustar os filtros"
                  : "Comece a verificar interações medicamentosas"}
              </p>
              {!search && severityFilter === "all" && (
                <Button onClick={() => router.push("/interactions")}>
                  Fazer primeira consulta
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
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