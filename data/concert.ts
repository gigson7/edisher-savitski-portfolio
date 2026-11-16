export const concert = {
  slug: "yasi-2026",
  path: "/events/yasi-2026",
  title: "Edisher Savitski — Piano Recital",
  startsAt: "2026-11-24T16:30:00-05:00",
  // Exclusive cutoff: midnight after November 22 in America/New_York.
  registrationClosesAt: "2026-11-23T05:00:00.000Z",
  consentVersion: "yasi-2026-v1",
  qrNotice:
    "To enter the venue, guests will receive a QR code via email, on Monday, November 23.",
} as const;

export function registrationIsClosed(now = Date.now()): boolean {
  return now >= Date.parse(concert.registrationClosesAt);
}

export const legacyConcertMatch = {
  date: "2026-11-24",
  venue: String.raw`^(yasi|yamaha artist services)(\s*,.*)?$`,
  location: String.raw`^new york(\s*,.*)?$`,
} as const;

const concertVenue = new RegExp(legacyConcertMatch.venue, "i");
const concertLocation = new RegExp(legacyConcertMatch.location, "i");

export function isConcertPerformance(performance: { date: string | Date; venue: string; location: string }): boolean {
  const date = new Date(performance.date);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === legacyConcertMatch.date
    && concertVenue.test(performance.venue.trim())
    && concertLocation.test(performance.location.trim());
}
