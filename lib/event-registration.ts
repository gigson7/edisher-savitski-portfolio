export function parseEventId(value: unknown): number | null {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value)) return null;
  const id = Number(value);
  return id <= 2147483647 ? id : null;
}

export function eventRegistrationPath(id: number) {
  return `/events/register/${id}`;
}

export function eventRegistrationKey(id: number) {
  return `performance-${id}`;
}

export function parseRegistrationSettings(form: FormData) {
  const closesOn = form.get("closesOn");
  const timeZone = form.get("timeZone");
  if (typeof closesOn !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(closesOn)) return null;
  const date = new Date(closesOn);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== closesOn) return null;
  if (typeof timeZone !== "string" || timeZone.length > 80) return null;
  const zone = timeZone.trim();
  if (zone !== "UTC" && !/^[a-z_]+(?:\/[a-z0-9_+\-]+)+$/i.test(zone)) return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
  } catch {
    return null;
  }
  return { closesOn, timeZone: zone, enabled: form.get("enabled") === "on" };
}

export function eventRegistrationEnabled() {
  return process.env.EVENT_REGISTRATION_ENABLED === "true";
}
