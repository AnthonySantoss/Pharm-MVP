"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Pill,
  History,
  BarChart3,
  Users,
  Brain,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "pharmacist", "patient"] },
  { href: "/interactions", icon: Pill, label: "Interações", roles: ["admin", "pharmacist", "patient"] },
  { href: "/history", icon: History, label: "Histórico", roles: ["admin", "pharmacist", "patient"] },
  { href: "/analytics", icon: BarChart3, label: "Análises", roles: ["admin", "pharmacist"] },
  { href: "/admin", icon: Users, label: "Usuários", roles: ["admin"] },
  { href: "/accuracy", icon: Brain, label: "Acurácia IA", roles: ["admin"] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Premium Cinematic Ambient Glow Auras */}
      <div className="ambient-glow-wrapper">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
      </div>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-4 left-4 z-40 h-[calc(100vh-2rem)] rounded-2xl border border-border/40 glass transition-all duration-300 shadow-sm",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border/40">
            <Link href="/dashboard" className="flex items-center gap-3">
              <img
                alt="PharmIA"
                src="/logo.png"
                className="w-10 h-10 object-contain"
              />
              {isSidebarOpen && (
                <span className="font-bold text-xl text-foreground tracking-tight">PharmIA</span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex hover:bg-muted/50"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/8 text-primary font-semibold border-l-2 border-primary rounded-l-none"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                  {isSidebarOpen && <span className="font-medium text-[14px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border/40">
            {isSidebarOpen && user && (
              <div className="mb-4 px-2">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                  {user.role === "pharmacist" ? "Farmacêutico" : user.role === "patient" ? "Paciente" : "Admin"}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5", !isSidebarOpen && "lg:justify-center")}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3 lg:mr-0 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium text-[14px]">Sair</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-72" : "lg:ml-28"
        )}
      >
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
