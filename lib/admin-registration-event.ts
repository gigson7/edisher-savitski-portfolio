import { concert } from "@/data/concert";
import { eventRegistrationEnabled, eventRegistrationKey, parseEventId } from "@/lib/event-registration";
import { prisma } from "@/lib/prisma";

const legacy = { id: null, key: concert.slug, title: "Piano Recital · YASI, New York · November 24, 2026" } as const;

function toEvent(performance: { id: number; title: string; date: Date; location: string }) {
  return {
    id: performance.id,
    key: eventRegistrationKey(performance.id),
    title: `${performance.title} · ${performance.location} · ${performance.date.toISOString().slice(0, 10)}`,
  };
}

const performanceFields = { id: true, title: true, date: true, location: true } as const;

export async function resolveRegistrationEvent(selection: unknown) {
  if (selection === undefined || selection === concert.slug) return legacy;
  const id = parseEventId(selection);
  if (id === null || !eventRegistrationEnabled()) return null;

  const form = await prisma.performanceRegistrationForm.findUnique({
    where: { performanceId: id },
    select: { performance: { select: performanceFields } },
  });
  return form && toEvent(form.performance);
}

export async function listRegistrationEvents() {
  if (!eventRegistrationEnabled()) return [legacy];
  const forms = await prisma.performanceRegistrationForm.findMany({
    orderBy: { performance: { date: "desc" } },
    select: { performance: { select: performanceFields } },
  });
  return [legacy, ...forms.map(({ performance }) => toEvent(performance))];
}
