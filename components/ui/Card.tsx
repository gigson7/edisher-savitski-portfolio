import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-neutral-200 bg-neutral-50 p-8",
        hover && "transition-all duration-200 hover:border-gold-500",
        className
      )}
    >
      {children}
    </div>
  );
}
