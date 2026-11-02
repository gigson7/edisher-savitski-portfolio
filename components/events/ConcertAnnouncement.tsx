import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { concert, registrationIsClosed } from "@/data/concert";
import { Container } from "@/components/ui/Container";

export function ConcertAnnouncement() {
  if (process.env.CONCERT_REGISTRATION_ENABLED !== "true" || registrationIsClosed()) return null;
  return (
    <aside aria-label="New York recital registration" className="border-y border-gold-200 bg-gold-50 py-5">
      <Container>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div><p className="!mb-0 text-xl font-semibold">Piano Recital · New York</p><p className="!mb-0 text-base text-neutral-600">November 24, 2026 · 4:30 PM · Yamaha Artist Services</p></div>
          <Link href={concert.path} className="inline-flex shrink-0 items-center gap-2 text-lg font-semibold text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-900">Details & registration <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </Container>
    </aside>
  );
}
