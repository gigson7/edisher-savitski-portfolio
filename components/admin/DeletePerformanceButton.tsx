"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deletePerformance } from "@/app/(admin)/admin/performances/actions";

interface Props {
  id: number;
  title: string;
}

export function DeletePerformanceButton({ id, title }: Props) {
  const [error, remove, pending] = useActionState(() => deletePerformance(id), "");
  return (
    <form action={remove} onSubmit={(event) => {
      if (!confirm(`Delete "${title}"? This cannot be undone.`)) event.preventDefault();
    }}>
      <button
        type="submit"
        className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete"
        disabled={pending}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {error && <p role="alert" className="!mb-0 max-w-64 text-sm text-red-700">{error}</p>}
    </form>
  );
}
