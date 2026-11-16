import Link from "next/link";
import { eventRegistrationEnabled } from "@/lib/event-registration";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PerformanceForm } from "@/components/admin/PerformanceForm";
import { updatePerformance } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPerformancePage({ params }: PageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);

  if (isNaN(id)) notFound();

  const performance = await prisma.performance.findUnique({ where: { id } });
  if (!performance) notFound();

  const boundAction = updatePerformance.bind(null, id);

  // Normalise JSON fields from Prisma (stored as Json, comes back as unknown)
  const collaborators = Array.isArray(performance.collaborators)
    ? (performance.collaborators as string[])
    : [];
  const repertoire = Array.isArray(performance.repertoire)
    ? (performance.repertoire as string[])
    : [];

  return (
    <div>
      <h1
        className="font-bold text-3xl text-neutral-800 mb-8"
        style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" }}
      >
        Edit Performance
      </h1>
      {eventRegistrationEnabled() && (
        <Link href={`/admin/registrations/settings/${id}`} className="mb-5 inline-flex min-h-11 items-center rounded-lg border border-gold-300 bg-gold-50 px-4 py-2 font-semibold text-gold-800 hover:bg-gold-100">
          Registration settings
        </Link>
      )}
      <PerformanceForm
        performance={{
          id: performance.id,
          title: performance.title,
          date: performance.date,
          venue: performance.venue,
          location: performance.location,
          country: performance.country,
          organization: performance.organization,
          linkUrl: performance.linkUrl,
          linkTitle: performance.linkTitle,
          collaborators,
          repertoire,
          isFeatured: performance.isFeatured,
        }}
        action={boundAction}
      />
    </div>
  );
}
