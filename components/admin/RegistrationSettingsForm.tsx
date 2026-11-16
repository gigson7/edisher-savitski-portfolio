"use client";

import { useActionState, useState } from "react";

type Props = {
  current: { enabled: boolean; closesOn: string; timeZone: string } | null;
  action: (previous: string, data: FormData) => Promise<string>;
};

const fieldClass = "mt-1 block min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2";

export function RegistrationSettingsForm({ current, action }: Props) {
  const [error, submit, pending] = useActionState(action, "");
  const [enabled, setEnabled] = useState(current?.enabled ?? false);
  const [closesOn, setClosesOn] = useState(current?.closesOn ?? "");
  const [timeZone, setTimeZone] = useState(current?.timeZone ?? "");
  return (
    <form action={submit} className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <fieldset disabled={pending} className="space-y-5">
        <label className="flex items-start gap-3 text-lg font-semibold">
          <input name="enabled" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.currentTarget.checked)} className="mt-1.5 size-4 accent-gold-700" />
          Accept registrations
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            Last day to register
            <input name="closesOn" type="date" min="2000-01-01" max="2099-12-31" value={closesOn} onChange={(event) => setClosesOn(event.currentTarget.value)} required className={fieldClass} />
          </label>
          <label>
            Venue time zone
            <input name="timeZone" list="registration-time-zones" placeholder="e.g. America/New_York" value={timeZone} onChange={(event) => setTimeZone(event.currentTarget.value)} maxLength={80} required className={fieldClass} />
            <datalist id="registration-time-zones">
              {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Asia/Tbilisi", "Asia/Jerusalem", "Europe/London", "Europe/Paris", "UTC"].map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </label>
        </div>
        <p className="!mb-0 text-sm text-neutral-600">
          Registration closes at the end of the selected day in the venue time zone.
        </p>
        <button type="submit" className="min-h-11 rounded-lg bg-gold-700 px-4 py-2 text-white hover:bg-gold-800 disabled:opacity-60">
          {pending ? "Saving…" : "Save registration settings"}
        </button>
      </fieldset>
      {error && <p role="alert" className="!mb-0 mt-3 text-red-800">{error}</p>}
    </form>
  );
}
