import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  variant?: "destructive" | "warning";
  className?: string;
}

export function ErrorBanner({ message, variant = "destructive", className }: ErrorBannerProps) {
  const Icon = variant === "destructive" ? AlertCircle : AlertTriangle;

  return (
    <div
      className={cn(
        "p-3 rounded-lg flex items-center gap-2 text-sm",
        variant === "destructive"
          ? "bg-destructive/10 border border-destructive/20 text-destructive"
          : "bg-severity-moderada/10 border border-severity-moderada/20 text-severity-moderada",
        className,
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
