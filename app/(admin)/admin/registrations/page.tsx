import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listRegistrationEvents, resolveRegistrationEvent } from "@/lib/admin-registration-event";
import { RegistrationEventPicker } from "@/components/admin/RegistrationEventPicker";
import { DeleteRegistrationButton } from "@/components/admin/DeleteRegistrationButton";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ page?: string; event?: string | string[] }> }) {
  if (!(await getSession())) redirect("/admin/login");
  const params = await searchParams;
  const selection = await resolveRegistrationEvent(params.event);
  if (!selection) notFound();
  const events = await listRegistrationEvents();
  const exportParams = new URLSearchParams();
  if (selection.id !== null) exportParams.set("event", String(selection.id));
  const csvQuery = exportParams.toString();
  const xlsxQuery = new URLSearchParams(exportParams);
  xlsxQuery.set("format", "xlsx");
  const pageHref = (page: number) => {
    const query = new URLSearchParams(exportParams);
    query.set("page", String(page));
    return `/admin/registrations?${query}`;
  };

  const requested = Number(params.page ?? "1");
  let page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 100000) : 1;
  let rows: Array<{ id: number; firstName: string; lastName: string; email: string; createdAt: Date }> = [];
  let total = 0;
  let unavailable = false;
  try {
    total = await prisma.concertRegistration.count({ where: { eventSlug: selection.key } });
    page = Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE)));
    rows = await prisma.concertRegistration.findMany({
      where: { eventSlug: selection.key },
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE,
    });
  } catch {
    unavailable = true;
  }

  return (
    <div className="sentry-block" data-private>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-bold">Concert registrations</h1><p className="!mb-0 mt-1 text-sm text-neutral-600">{selection.title}</p></div>
        {!unavailable && <div className="flex flex-wrap items-center gap-4">
          <a href={`/admin/registrations/export?${xlsxQuery}`} download={`${selection.key}-registrations.xlsx`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-700 px-4 py-2 text-base text-white hover:bg-gold-800"><Download className="h-4 w-4" aria-hidden="true" /> Download Excel (.xlsx)</a>
          <a href={`/admin/registrations/export${csvQuery ? `?${csvQuery}` : ""}`} download={`${selection.key}-registrations.csv`} className="text-sm text-gold-700 underline underline-offset-4">CSV</a>
        </div>}
      </div>
      <RegistrationEventPicker events={events} selected={selection.id} />
      <p className="text-base text-neutral-600">
        {selection.id === null && "Download the attendee list to share with Yamaha for entry QR codes. "}
        Only share this list with the event organizers for registration and admission.
      </p>
      {unavailable ? <p role="alert" className="rounded border border-red-200 bg-red-50 p-4 text-base text-red-800">Registrations could not be loaded. Please try again later.</p> : (
        <>
          <p className="text-base text-neutral-700">{total} {total === 1 ? "registration" : "registrations"}</p>
          {rows.length === 0 ? <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-base text-neutral-600">No registrations on this page.</div> : (
            <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {rows.map((row) => <li key={row.id} className="flex min-w-0 flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center sm:px-6">
                <div className="min-w-0"><div className="break-words text-lg font-semibold">{row.firstName} {row.lastName}</div><div className="break-all text-base text-neutral-600">{row.email}</div></div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <time dateTime={row.createdAt.toISOString()} className="shrink-0 text-sm text-neutral-500">{row.createdAt.toLocaleString("en-US", { timeZone: selection.id === null ? "America/New_York" : "UTC", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} {selection.id === null ? "ET" : "UTC"}</time>
                  <DeleteRegistrationButton id={row.id} eventId={selection.id} />
                </div>
              </li>)}
            </ul>
          )}
          <nav aria-label="Registration pages" className="mt-4 flex items-center gap-4 text-base">
            {page > 1 && <Link href={pageHref(page - 1)} className="text-gold-700 underline">Previous</Link>}
            <span>Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
            {page * PAGE_SIZE < total && <Link href={pageHref(page + 1)} className="text-gold-700 underline">Next</Link>}
          </nav>
        </>
      )}
    </div>
  );
}
