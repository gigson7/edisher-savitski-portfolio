"use client";

import { useState } from "react";
import { updatePhotoMeta } from "@/app/(admin)/admin/photos/actions";

const OBJECT_POSITION_OPTIONS = [
  { label: "Center", value: "center center" },
  { label: "Top", value: "center top" },
  { label: "Upper (28%)", value: "center 28%" },
  { label: "Lower (80%)", value: "center 80%" },
  { label: "Bottom", value: "center bottom" },
];

interface Props {
  id: number;
  initialAltText: string;
  initialObjectPosition: string;
}

export function PhotoMetaForm({
  id,
  initialAltText,
  initialObjectPosition,
}: Props) {
  const [altText, setAltText] = useState(initialAltText);
  const [objectPosition, setObjectPosition] = useState(initialObjectPosition);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.set("altText", altText);
    formData.set("objectPosition", objectPosition);

    const result = await updatePhotoMeta(id, formData);
    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Saved" });
      setTimeout(() => setMessage(null), 2000);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-3 space-y-2">
      <input
        type="text"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        placeholder="Alt text"
        className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8d7336] focus:border-[#8d7336]"
      />

      <select
        value={objectPosition}
        onChange={(e) => setObjectPosition(e.target.value)}
        className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8d7336] focus:border-[#8d7336] bg-white"
      >
        {OBJECT_POSITION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: "#8d7336" }}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {message && (
          <span
            className={`text-xs ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
