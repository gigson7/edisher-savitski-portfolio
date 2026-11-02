const PRIVATE_PATHS = ["/events/yasi-2026", "/api/concert-registration", "/admin/registrations"];

export function isConcertPrivate(value: string | undefined): boolean {
  if (!value) return false;
  return PRIVATE_PATHS.some((path) => value.includes(path));
}

type TelemetryEvent = { request?: { url?: string }; transaction?: string };

export function dropConcertTelemetry<T extends TelemetryEvent>(event: T): T | null {
  if (typeof window !== "undefined" && isConcertPrivate(window.location.pathname)) return null;
  if (isConcertPrivate(event.request?.url) || isConcertPrivate(event.transaction)) return null;
  return event;
}
