"use client";

import { Trash2 } from "lucide-react";
import { deletePerformance } from "@/app/(admin)/admin/performances/actions";

interface Props {
  id: number;
  title: string;
}

export function DeletePerformanceButton({ id, title }: Props) {
  return (
    <form
      action={async () => {
        await deletePerformance(id);
      }}
    >
      <button
        type="submit"
        className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
