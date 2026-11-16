import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { concert, isConcertPerformance } from "@/data/concert";
import { RegistrationSettingsForm } from "@/components/admin/RegistrationSettingsForm";
import { getSession } from "@/lib/auth";
import { eventRegistrationEnabled, eventRegistrationPath, parseEventId } from "@/lib/event-registration";
import { prisma } from "@/lib/prisma";
import { updateRegistrationSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function RegistrationSettingsPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await getSession())) redirect("/admin/login");
  if (!eventRegistrationEnabled()) notFound();

  const rawId = (await params).id;
  const id = parseEventId(rawId);
  if (id === null) notFound();
  const performance = await prisma.performance.findUnique({
    where: { id },
    select: { title: true, date: true, venue: true, location: true, registrationForm: true },
  });
  if (!performance) notFound();
  const form = performance.registrationForm;
  const legacy = isConcertPerformance(performance);

  return (
    <div className="sentry-block max-w-2xl" data-private>
      <Link href={`/admin/performances/${id}/edit`} className="text-sm text-gold-800 underline">Back to performance</Link>
      <h1 className="mt-4 text-3xl font-bold">Registration settings</h1>
      <p className="mb-5 break-words text-lg text-neutral-600">{performance.title} · {performance.venue}</p>
      {(await searchParams).saved === "1" && <p role="status" className="rounded-lg bg-gold-50 p-3">Registration settings saved.</p>}
      {legacy ? (
        <p>This recital uses its existing registration page.</p>
      ) : (
        <RegistrationSettingsForm
          key={form ? `${form.enabled}-${form.closesAt.toISOString()}-${form.timeZone}` : "new"}
          current={form && { enabled: form.enabled, closesOn: form.closesOn.toISOString().slice(0, 10), timeZone: form.timeZone }}
          action={updateRegistrationSettings.bind(null, rawId)}
        />
      )}
      {(legacy || form) && (
        <div className="mt-5 flex flex-wrap gap-5">
          <Link href={legacy ? concert.path : eventRegistrationPath(id)} className="font-semibold text-gold-800 underline">Open public registration page</Link>
          {legacy && <Link href="/admin/registrations" className="font-semibold text-gold-800 underline">View YASI registrations</Link>}
          {form && <Link href={`/admin/registrations?event=${id}`} className="font-semibold text-gold-800 underline">View {legacy ? "previous " : ""}registrations</Link>}
        </div>
      )}
    </div>
  );
}
