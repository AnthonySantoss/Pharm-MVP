"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Pill, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Histórico de Consultas</h1>
        <p className="text-muted-foreground mt-1">
          Visualize todas as interações que você verificou
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Suas Consultas
          </CardTitle>
          <CardDescription>
            {history.length} interação{history.length !== 1 ? "ões" : ""} verificada{history.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                Nenhuma consulta ainda
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece a verificar interações medicamentosas
              </p>
              <button
                onClick={() => router.push("/interactions")}
                className="text-primary hover:underline font-medium"
              >
                Fazer primeira consulta
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}