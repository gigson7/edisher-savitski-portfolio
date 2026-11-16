import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { cache } from "react";
import { ConcertRegistrationForm } from "@/components/events/ConcertRegistrationForm";
import { Container } from "@/components/ui/Container";
import { eventRegistrationPath, parseEventId } from "@/lib/event-registration";
import { getEventRegistration } from "@/lib/event-registration-store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };
const getForm = cache(getEventRegistration);

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = parseEventId((await params).id);
  const form = id === null ? null : await getForm(id);
  if (!form) return {};
  const { title, date, venue, location } = form.performance;
  const description = `${formatDate(date)} · ${venue}, ${location}`;
  const path = eventRegistrationPath(form.performanceId);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website" },
  };
}

export default async function EventRegistrationPage({ params }: Props) {
  const id = parseEventId((await params).id);
  const form = id === null ? null : await getForm(id);
  if (!form) notFound();

  const performance = form.performance;
  return (
    <div className="bg-gold-50/40 py-10 sm:py-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <Link href="/events" className="mb-8 inline-flex items-center gap-2 text-neutral-600 hover:text-gold-800">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All performances
          </Link>
          <h1 className="mb-6 break-words text-4xl leading-tight sm:text-5xl">{performance.title}</h1>
          <div className="mb-7 space-y-3 text-lg text-neutral-700">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
              <time dateTime={performance.date.toISOString().slice(0, 10)}>{formatDate(performance.date)}</time>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
              <span>{performance.venue}, {performance.location}</span>
            </div>
          </div>
          <ConcertRegistrationForm
            enabled={form.enabled}
            initiallyClosed={Date.now() >= form.closesAt.getTime()}
            event={{
              id: form.performanceId,
              closesAt: form.closesAt.toISOString(),
              deadlineLabel: `${formatDate(form.closesOn)} (${form.timeZone})`,
            }}
          />
        </div>
      </Container>
    </div>
  );
}
