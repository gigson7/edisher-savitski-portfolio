import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { concert, isConcertPerformance, registrationIsClosed } from "@/data/concert";

export function ConcertRegistrationLink({ performance }: { performance: { date: string | Date; venue: string; location: string } }) {
  if (!isConcertPerformance(performance)) return null;
  return (
    <Link href={concert.path} className="mt-5 inline-flex items-center gap-2 self-start text-lg font-semibold text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600">
      {registrationIsClosed() ? "View recital details" : "Register to attend"}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}
