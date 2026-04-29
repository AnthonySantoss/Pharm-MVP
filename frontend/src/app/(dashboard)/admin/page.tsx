"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, User as UserIcon, Pill as PillIcon, Trash2, Edit3, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { User } from "@/types";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  pharmacist: "Farmacêutico",
  patient: "Paciente",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  pharmacist: <PillIcon className="w-4 h-4" />,
  patient: <UserIcon className="w-4 h-4" />,
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; pharmacists: number; patients: number; admins: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, statsData] = await Promise.all([
          api.getAllUsers(),
          api.getAdminStats(),
        ]);
        setUsers(usersData);
        setAdminStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleUpdate = async (userId: number) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updateUserRole(userId, editRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar usuário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    setIsSaving(true);
    setError(null);
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie usuários e visualize estatísticas do sistema
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total de Usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold">{adminStats?.totalUsers || 0}</CardTitle>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-severity-grave">
                  <Shield className="w-4 h-4" />
                  Administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold">{adminStats?.admins || 0}</CardTitle>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <PillIcon className="w-4 h-4" />
                  Farmacêuticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold">{adminStats?.pharmacists || 0}</CardTitle>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold">{adminStats?.patients || 0}</CardTitle>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>
                {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">E-mail</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Perfil</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {roleIcons[u.role]}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">
                          {editingUser === u.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                              >
                                <option value="admin">Admin</option>
                                <option value="pharmacist">Farmacêutico</option>
                                <option value="patient">Paciente</option>
                              </select>
                              <Button size="sm" onClick={() => handleRoleUpdate(u.id)} isLoading={isSaving}>
                                Salvar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Badge variant={u.role === "admin" ? "destructive" : u.role === "pharmacist" ? "secondary" : "outline"}>
                              {roleLabels[u.role]}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingUser !== u.id && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingUser(u.id);
                                  setEditRole(u.role);
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              {u.id !== user?.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}