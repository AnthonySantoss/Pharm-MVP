export type Severity = "Grave" | "Moderada" | "Leve";

export function severityToBadgeVariant(severity: string): "grave" | "moderada" | "leve" {
  switch (severity) {
    case "Grave": return "grave";
    case "Moderada": return "moderada";
    default: return "leve";
  }
}

export const severityConfig: Record<Severity, {
  bg: string;
  text: string;
  border: string;
  dot: string;
  lightBg: string;
  color: string;
}> = {
  Grave: {
    bg: "bg-severity-grave",
    text: "text-severity-grave",
    border: "border-t-severity-grave",
    dot: "bg-severity-grave",
    lightBg: "bg-severity-grave/10",
    color: "var(--severity-grave)",
  },
  Moderada: {
    bg: "bg-severity-moderada",
    text: "text-severity-moderada",
    border: "border-t-severity-moderada",
    dot: "bg-severity-moderada",
    lightBg: "bg-severity-moderada/10",
    color: "var(--severity-moderada)",
  },
  Leve: {
    bg: "bg-severity-leve",
    text: "text-severity-leve",
    border: "border-t-severity-leve",
    dot: "bg-severity-leve",
    lightBg: "bg-severity-leve/10",
    color: "var(--severity-leve)",
  },
};
