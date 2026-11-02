"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteRegistrationButton({ id }: { id: number }) {
  const router = useRouter();
  const messageId = useId();
  const deleteButton = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/admin/registrations/${id}`, { method: "DELETE", redirect: "error" });
      if (!response.ok) throw new Error("delete-failed");
      setDeleted(true);
      router.refresh();
    } catch {
      setError("The registration could not be deleted. Please try again. If your session expired, sign in again.");
    } finally {
      setPending(false);
    }
  }

  if (deleted) return <p role="status" className="!mb-0 text-sm text-neutral-600">Registration deleted.</p>;

  return (
    <div className="sm:max-w-sm">
      {!confirming ? (
        <button ref={deleteButton} type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
        </button>
      ) : (
        <div role="group" aria-labelledby={messageId} className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p id={messageId} className="!mb-2 text-sm text-red-900">Permanently delete this registration? It will be removed from future Excel and CSV downloads. This cannot be undone.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={remove} className="min-h-11 rounded-lg bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-60">{pending ? "Deleting…" : "Delete registration"}</button>
            <button autoFocus type="button" disabled={pending} onClick={() => { setConfirming(false); setError(""); requestAnimationFrame(() => deleteButton.current?.focus()); }} className="min-h-11 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-white disabled:opacity-60">Cancel</button>
          </div>
          {error && <p role="alert" className="!mb-0 mt-2 text-sm text-red-800">{error}</p>}
        </div>
      )}
    </div>
  );
}
