"use client";

import { Trash2 } from "lucide-react";
import { deletePhoto } from "@/app/(admin)/admin/photos/actions";

interface Props {
  id: number;
}

export function DeletePhotoButton({ id }: Props) {
  return (
    <form
      action={async () => {
        await deletePhoto(id);
      }}
    >
      <button
        type="submit"
        className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Delete photo"
        onClick={(e) => {
          if (!confirm("Delete this photo? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
