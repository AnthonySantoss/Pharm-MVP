import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn(className)}>
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
      {children}
    </div>
  );
}
