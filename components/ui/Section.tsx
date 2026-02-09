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
        "py-20 sm:py-28 lg:py-32",
        background === "white" ? "bg-neutral-50" : "bg-neutral-100",
        className
      )}
    >
      {children}
    </section>
  );
}
