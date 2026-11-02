import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ConcertRegistrationForm } from "@/components/events/ConcertRegistrationForm";
import { concert, registrationIsClosed } from "@/data/concert";

export const dynamic = "force-dynamic";

// Visible poster bounds within the source JPEG; clip its printed white margins
// in the layout so the supplied original remains unchanged.
const posterBounds = { left: 90, top: 87, width: 738, height: 1061 };
const shareDescription = "November 24, 2026 · 4:30 PM · Yamaha Artist Services, New York. Registration closes November 22.";
const shareImage = {
  url: "/images/events/yasi-2026-share.png",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: "Edisher Savitski Piano Recital — November 24, 2026 at 4:30 PM — Yamaha Artist Services, New York",
};

export const metadata: Metadata = {
  title: "Piano Recital at Yamaha Artist Services — November 24, 2026",
  description: "Register for Edisher Savitski’s piano recital at Yamaha Artist Services, New York, on November 24, 2026 at 4:30 PM. Entry QR codes will be emailed by Yamaha.",
  alternates: { canonical: concert.path },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Edisher Savitski",
    title: concert.title,
    description: shareDescription,
    url: concert.path,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: concert.title,
    description: shareDescription,
    images: [{ url: shareImage.url, alt: shareImage.alt }],
  },
};

export default function ConcertPage() {
  return (
    <div className="bg-gold-50/40 pb-16 pt-9 sm:pb-24 sm:pt-12">
      <Container>
        <Link href="/events" className="mb-8 inline-flex items-center gap-2 text-base text-neutral-600 transition hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All performances
        </Link>
        <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="w-full max-w-xl justify-self-center lg:sticky lg:top-28 lg:max-w-none">
            <div className="relative overflow-hidden" style={{ aspectRatio: `${posterBounds.width} / ${posterBounds.height}` }} data-concert-poster>
              <Image src="/images/events/yasi-2026-poster.jpg" alt="Concert poster: Edisher Savitski Piano Recital, YASI New York, Tuesday November 24, 4:30 PM, in celebration of the University of Alabama Million Dollar Band’s performance at Macy’s Parade." width={927} height={1200} priority sizes="(max-width: 1023px) 125vw, 820px" className="absolute h-auto max-w-none" style={{ width: `${927 / posterBounds.width * 100}%`, left: `${-posterBounds.left / posterBounds.width * 100}%`, top: `${-posterBounds.top / posterBounds.height * 100}%` }} />
            </div>
          </div>
          <div className="min-w-0 lg:pt-1">
            <p className="!mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gold-700">Yamaha Artist Services · New York</p>
            <h1 className="text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]">Edisher Savitski</h1>
            <p className="!mb-5 mt-2 text-3xl text-gold-700">Piano Recital</p>
            <p className="!mb-6 text-lg leading-relaxed text-neutral-600">In celebration of the University of Alabama Million Dollar Band&apos;s performance at Macy&apos;s Parade.</p>
            <dl className="mb-6 space-y-4 text-lg text-neutral-700">
              <div className="flex gap-3"><CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" /><div><dt className="sr-only">Date</dt><dd>Tuesday, November 24, 2026</dd></div></div>
              <div className="flex gap-3"><Clock3 className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" /><div><dt className="sr-only">Time</dt><dd><time dateTime={concert.startsAt}>4:30 PM</time><span className="text-neutral-500"> · New York time</span></dd></div></div>
              <div className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" /><div><dt className="sr-only">Venue</dt><dd>Yamaha Artist Services (YASI)<br /><span className="text-neutral-600">689 5th Ave. #3, New York, NY<br />Entrance on 54th St.</span></dd></div></div>
            </dl>
            <div className="mb-7 flex gap-3 rounded border border-gold-200 bg-gold-50 px-4 py-4">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
              <div><p className="!mb-1 text-lg leading-relaxed text-neutral-800">{concert.qrNotice}</p><p className="!mb-0 text-base text-neutral-600">QR codes will be sent by Yamaha.</p></div>
            </div>
            <ConcertRegistrationForm enabled={process.env.CONCERT_REGISTRATION_ENABLED === "true"} initiallyClosed={registrationIsClosed()} />
          </div>
        </div>
      </Container>
    </div>
  );
}
