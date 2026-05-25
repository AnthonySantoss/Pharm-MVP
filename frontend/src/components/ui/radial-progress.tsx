import { cn } from "@/lib/utils";

interface RadialProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  strokeClass?: string;
  label?: string;
}

export function RadialProgress({ value, size = 32, strokeWidth = 8, className, strokeClass, label }: RadialProgressProps) {
  const viewBox = size;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          className="stroke-muted/10"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={viewBox / 2}
          cy={viewBox / 2}
          r={radius}
          className={strokeClass ?? (value >= 80 ? "stroke-severity-leve" : value >= 50 ? "stroke-severity-moderada" : "stroke-severity-grave")}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-xs font-bold text-foreground">{label}</span>
      )}
    </div>
  );
}
