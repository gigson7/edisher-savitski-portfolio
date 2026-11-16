import { siteConfig } from "@/data/site-config";
import { handleConcertRegistration, PRIVATE_HEADERS } from "@/lib/concert-registration";
import { takeRegistrationRateLimit } from "@/lib/concert-registration-store";
import { eventRegistrationEnabled, eventRegistrationKey, parseEventId } from "@/lib/event-registration";
import { getEventRegistration, savePerformanceRegistration } from "@/lib/event-registration-store";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const error = (status: number, message: string) => Response.json({ error: message }, { status, headers: PRIVATE_HEADERS });

  const id = parseEventId((await params).id);
  if (id === null || !eventRegistrationEnabled()) return error(404, "Registration form not found.");
  if (request.headers.get("origin") !== new URL(siteConfig.url).origin) {
    return error(403, "Please submit the form from this website.");
  }

  try {
    const form = await getEventRegistration(id);
    if (!form) return error(404, "Registration form not found.");
    return await handleConcertRegistration(request, {
      enabled: form.enabled,
      closesAt: form.closesAt.toISOString(),
      allowedOrigin: siteConfig.url,
      takeRateLimit: () => takeRegistrationRateLimit(eventRegistrationKey(id)),
      save: (input) => savePerformanceRegistration(id, input),
    });
  } catch {
    return error(503, "Registration is currently unavailable. Please try again later.");
  }
}
