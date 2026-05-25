import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";
import { severityToBadgeVariant } from "@/lib/severity";

interface InteractionRowProps {
  drug1: string;
  drug2: string;
  severity: string;
  timestamp?: string;
  className?: string;
}

export function InteractionRow({ drug1, drug2, severity, timestamp, className }: InteractionRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all hover-lift ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Pill className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{drug1} + {drug2}</p>
          {timestamp && <p className="text-sm text-muted-foreground">{timestamp}</p>}
        </div>
      </div>
      <Badge variant={severityToBadgeVariant(severity)}>{severity}</Badge>
    </div>
  );
}
