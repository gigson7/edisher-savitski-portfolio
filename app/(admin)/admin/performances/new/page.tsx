import { PerformanceForm } from "@/components/admin/PerformanceForm";
import { createPerformance } from "../actions";

export default function NewPerformancePage() {
  return (
    <div>
      <h1
        className="font-bold text-3xl text-neutral-800 mb-8"
        style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
      >
        Add Performance
      </h1>
      <PerformanceForm action={createPerformance} />
    </div>
  );
}
