import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { severityConfig } from "@/lib/severity";
import type { Severity } from "@/lib/severity";

interface SeverityCardProps {
  severity: Severity;
  count: number;
  label: string;
  subtitle?: string;
  withSparkline?: boolean;
  className?: string;
  animate?: string;
}

export function SeverityCard({ severity, count, label, subtitle, withSparkline, className, animate }: SeverityCardProps) {
  const config = severityConfig[severity];

  return (
    <Card
      className={cn(
        "glass-card hover-lift relative overflow-hidden flex flex-col justify-between",
        config.border,
        animate,
        className,
      )}
    >
      <div>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2 font-medium text-foreground">
            <span className={cn("w-2 h-2 rounded-full", config.dot, severity === "Grave" && "animate-pulse-gentle")} />
            {label}
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(withSparkline ? "pb-0" : undefined)}>
          <CardTitle className={cn("text-4xl font-bold", withSparkline ? "text-foreground" : "text-foreground")}>
            {count}
          </CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
        </CardContent>
      </div>
      {withSparkline && (
        <SeveritySparkline severity={severity} />
      )}
    </Card>
  );
}

function SeveritySparkline({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  const paths: Record<Severity, { fill: string; line: string }> = {
    Grave: {
      fill: "M 0 25 Q 15 15, 30 20 T 60 10 T 80 18 T 100 5 L 100 30 L 0 30 Z",
      line: "M 0 25 Q 15 15, 30 20 T 60 10 T 80 18 T 100 5",
    },
    Moderada: {
      fill: "M 0 20 Q 25 10, 50 25 T 75 8 T 100 15 L 100 30 L 0 30 Z",
      line: "M 0 20 Q 25 10, 50 25 T 75 8 T 100 15",
    },
    Leve: {
      fill: "M 0 26 Q 20 18, 40 22 T 80 12 T 100 18 L 100 30 L 0 30 Z",
      line: "M 0 26 Q 20 18, 40 22 T 80 12 T 100 18",
    },
  };

  return (
    <div className="h-10 mt-4 -mx-6 -mb-6 opacity-75 hover:opacity-100 transition-opacity">
      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sparkline-${severity}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={config.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={paths[severity].fill} fill={`url(#sparkline-${severity})`} />
        <path d={paths[severity].line} fill="none" stroke={config.color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
