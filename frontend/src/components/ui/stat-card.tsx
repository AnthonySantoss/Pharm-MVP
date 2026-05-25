import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: number | string;
  suffix?: string;
  variant?: "default" | "glass";
  className?: string;
}

export function StatCard({ icon: Icon, label, value, suffix, variant = "default", className }: StatCardProps) {
  return (
    <Card className={cn(variant === "glass" && "glass-card", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-bold flex items-baseline gap-2">
          <span>{value}</span>
          {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
