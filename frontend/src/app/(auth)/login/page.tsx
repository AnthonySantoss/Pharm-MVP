"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

const shakeVariants: Variants = {
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      setShakeKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <motion.img
              alt="PharmIA"
              src="/logo.png"
              className="h-12 w-12 object-contain"
              whileHover={{ rotate: -10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <span className="font-headline-lg text-headline-lg font-bold bg-gradient-to-r from-dark-primary to-sec-default bg-clip-text text-transparent">
              PharmIA
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-sec-bg px-3 py-1.5 rounded-full border border-sec-default/20">
            <span className="w-2 h-2 rounded-full bg-sec-default animate-pulse-gentle" />
            <span className="font-label-sm text-label-sm text-sec-default font-medium">
              Análise clínica em tempo real
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-neutral-surface/90 backdrop-blur-sm border-neutral-border/50 shadow-xl shadow-dark-primary/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-dark-text">
                Entrar
              </CardTitle>
              <CardDescription className="text-muted-text">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key={shakeKey}
                      variants={shakeVariants}
                      initial="shake"
                      animate="shake"
                      className="p-3 rounded-lg bg-severity-grave/10 border border-severity-grave/20 text-severity-grave text-sm"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={itemVariants}>
                  <Input
                    label="E-mail"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-sec-default text-on-sec hover:bg-sec-hover rounded-full shadow-lg shadow-sec-default/30 hover:shadow-xl hover:shadow-sec-hover/20 font-semibold h-11 text-[15px]"
                      isLoading={isLoading}
                    >
                      Entrar
                    </Button>
                  </motion.div>
                </motion.div>
              </form>

              <motion.div
                variants={itemVariants}
                className="mt-6 text-center text-sm"
              >
                <span className="text-muted-text">Não tem uma conta? </span>
                <Link
                  href="/register"
                  className="text-sec-default font-medium hover:text-sec-hover transition-colors"
                >
                  Criar conta
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
