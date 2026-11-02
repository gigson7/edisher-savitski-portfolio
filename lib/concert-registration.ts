import { registrationIsClosed } from "@/data/concert";

export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Vary: "Cookie",
};

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  email: string;
};

type RegistrationDependencies = {
  enabled: boolean;
  allowedOrigin: string;
  now?: () => number;
  takeRateLimit: () => Promise<{ allowed: boolean; retryAfter: number }>;
  save: (input: RegistrationInput) => Promise<boolean>;
};

const CONTROL_CHARACTERS = /[\p{Cc}\p{Cf}]/u;
const EMAIL = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i;

function response(status: number, error?: string, extraHeaders?: Record<string, string>) {
  return Response.json(error ? { error } : { success: true }, {
    status,
    headers: { ...PRIVATE_HEADERS, ...extraHeaders },
  });
}

async function readBoundedJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid-body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        throw new Error("body-too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export function parseRegistration(value: unknown): RegistrationInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const fields = value as Record<string, unknown>;
  if (fields.consent !== true || fields.website !== "") return null;
  if ([fields.firstName, fields.lastName, fields.email].some((s) => typeof s !== "string")) return null;
  const firstName = (fields.firstName as string).trim();
  const lastName = (fields.lastName as string).trim();
  const email = (fields.email as string).trim().toLowerCase();
  if ([firstName, lastName].some((s) => !s || s.length > 100 || CONTROL_CHARACTERS.test(s))) return null;
  if (!email || email.length > 254 || email.split("@")[0].length > 64 || !EMAIL.test(email)) return null;
  const localPart = email.split("@")[0];
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return null;
  if (email.split("@")[1].split(".").some((label) => label.length > 63)) return null;
  return { firstName, lastName, email };
}

export async function handleConcertRegistration(request: Request, deps: RegistrationDependencies): Promise<Response> {
  const now = deps.now ?? Date.now;
  if (!deps.enabled) return response(503, "Registration is currently unavailable. Please try again later.");
  if (registrationIsClosed(now())) return response(410, "Registration for this recital has closed.");
  if (request.headers.get("origin") !== new URL(deps.allowedOrigin).origin) return response(403, "Please submit the form from this website.");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return response(415, "Please use the registration form.");

  let body: unknown;
  try {
    body = await readBoundedJson(request);
  } catch (error) {
    return response(error instanceof Error && error.message === "body-too-large" ? 413 : 400, "Please check the form and try again.");
  }
  const input = parseRegistration(body);
  if (!input) return response(400, "Please enter your first name, last name and a valid email, and agree to the admission notice.");

  try {
    const limit = await deps.takeRateLimit();
    if (!limit.allowed) return response(429, "Registration is busy. Please try again in a few minutes.", { "Retry-After": String(limit.retryAfter) });
    if (registrationIsClosed(now()) || !(await deps.save(input))) return response(410, "Registration for this recital has closed.");
    // A duplicate receives this same response. Never disclose an attendee's presence.
    return response(200);
  } catch {
    // Database errors can contain names and addresses: do not log/capture them.
    return response(503, "We could not save your registration. Please try again.");
  }
}

export function csvCell(value: string): string {
  const safe = /^[\s]*[=+\-@\t\r\n]/u.test(value) || /^[\t\r\n]/u.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function registrationsCsv(rows: Array<RegistrationInput & { createdAt: Date }>): string {
  const header = ["First name", "Last name", "Email", "Registered at (UTC)"];
  return "\uFEFF" + [header, ...rows.map((r) => [r.firstName, r.lastName, r.email, r.createdAt.toISOString()])]
    .map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
