"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { PerformanceType } from "@/lib/generated/prisma/enums";

type PerformanceData = {
  id: number;
  title: string;
  date: Date;
  type: string;
  venue: string;
  location: string;
  country: string;
  organization: string | null;
  collaborators: string[];
  repertoire: string[];
  isFeatured: boolean;
};

type ActionState = { error?: string } | null;

type Props = {
  performance?: PerformanceData;
  action: (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
};

function TagList({
  name,
  label,
  initialItems,
}: {
  name: string;
  label: string;
  initialItems: string[];
}) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addItem() {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems((prev) => [...prev, trimmed]);
    }
    setInputValue("");
    inputRef.current?.focus();
  }

  function removeItem(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      {/* Hidden input carries JSON value */}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}…`}
          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-sm text-neutral-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors leading-none"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function PerformanceForm({ performance, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  const isEdit = !!performance;
  const defaultDate = performance
    ? new Date(performance.date).toISOString().split("T")[0]
    : "";

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 max-w-3xl shadow-sm">
      {state?.error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title — full width */}
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={performance?.title ?? ""}
              placeholder="Performance title"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={defaultDate}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={performance?.type ?? ""}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            >
              <option value="" disabled>
                Select type…
              </option>
              {(
                Object.values(PerformanceType) as PerformanceType[]
              ).map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="venue"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Venue <span className="text-red-500">*</span>
            </label>
            <input
              id="venue"
              name="venue"
              type="text"
              required
              defaultValue={performance?.venue ?? ""}
              placeholder="Concert hall or venue name"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={performance?.location ?? ""}
              placeholder="City"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              defaultValue={performance?.country ?? ""}
              placeholder="Country"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Organization */}
          <div>
            <label
              htmlFor="organization"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Organization
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              defaultValue={performance?.organization ?? ""}
              placeholder="Presenting organization (optional)"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Collaborators */}
          <TagList
            name="collaborators"
            label="Collaborators"
            initialItems={performance?.collaborators ?? []}
          />

          {/* Repertoire */}
          <TagList
            name="repertoire"
            label="Repertoire"
            initialItems={performance?.repertoire ?? []}
          />

          {/* Featured */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={performance?.isFeatured ?? false}
              className="w-4 h-4 rounded border-neutral-300 accent-[#8d7336]"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm text-neutral-700 cursor-pointer select-none"
            >
              Featured performance (shown on homepage)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#8d7336" }}
          >
            {isPending
              ? "Saving…"
              : isEdit
              ? "Update Performance"
              : "Create Performance"}
          </button>
          <Link
            href="/admin/performances"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
