import { cn } from "@/lib/utils";

interface SummaryMetricCardProps {
  value: number | string;
  label: string;
  dotColor: string;
  pulse?: boolean;
}

export function SummaryMetricCard({ value, label, dotColor, pulse }: SummaryMetricCardProps) {
  return (
    <div className="glass p-4 rounded-xl border border-border/40 relative overflow-hidden text-center hover:bg-neutral-50/20 transition-all duration-200">
      <div className={cn("w-2.5 h-2.5 rounded-full mx-auto mb-2", dotColor, pulse && "animate-pulse-gentle")} />
      <p className="text-3xl font-extrabold text-foreground">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
