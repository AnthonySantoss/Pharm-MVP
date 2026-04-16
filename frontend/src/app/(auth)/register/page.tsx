"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pill, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["pharmacist", "patient"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "pharmacist",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(data.email, data.password, data.name, data.role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary/5 to-primary/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">PharmIA</h1>
          <p className="text-muted-foreground mt-2">Crie sua conta</p>
        </div>

        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold">Novo Cadastro</CardTitle>
            <CardDescription>
              Selecione seu perfil e preencha os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedRole === "pharmacist"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    value="pharmacist"
                    className="sr-only"
                    {...register("role")}
                  />
                  <Stethoscope
                    className={`w-8 h-8 mb-2 ${
                      selectedRole === "pharmacist" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedRole === "pharmacist" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Farmacêutico
                  </span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedRole === "patient"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    value="patient"
                    className="sr-only"
                    {...register("role")}
                  />
                  <User
                    className={`w-8 h-8 mb-2 ${
                      selectedRole === "patient" ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selectedRole === "patient" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    Paciente
                  </span>
                </label>
              </div>

              <Input
                label="Nome completo"
                placeholder="Seu nome"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Criar conta
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}