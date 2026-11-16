"use client";

import { useRouter } from "next/navigation";

export function RegistrationEventPicker({ events, selected }: { events: { id: number | null; title: string }[]; selected: number | null }) {
  const router = useRouter();
  if (events.length < 2) return null;

  return (
    <label className="mb-5 block max-w-2xl text-sm font-semibold text-neutral-800">
      Event
      <select
        value={selected ?? ""}
        onChange={(event) => {
          const value = event.currentTarget.value;
          router.push(value ? `/admin/registrations?event=${encodeURIComponent(value)}` : "/admin/registrations");
        }}
        className="mt-1 block min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base font-normal"
      >
        {events.map((event) => <option key={event.id ?? "yasi"} value={event.id ?? ""}>{event.title}</option>)}
      </select>
    </label>
  );
}
