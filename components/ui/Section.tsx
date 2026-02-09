import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "gray";
  id?: string;
}

export function Section({
  children,
  className,
  background = "white",
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        background === "white" ? "bg-neutral-50" : "bg-neutral-100",
        className
      )}
    >
      {children}
    </section>
  );
}
