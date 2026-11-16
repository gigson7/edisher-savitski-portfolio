import { resolveRegistrationEvent } from "@/lib/admin-registration-event";
import { getSession } from "@/lib/auth";
import { siteConfig } from "@/data/site-config";
import { handleDeleteConcertRegistration } from "@/lib/concert-registration-delete";
import { deleteConcertRegistration } from "@/lib/concert-registration-store";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleDeleteConcertRegistration(request, id, {
    isAuthenticated: async () => Boolean(await getSession()),
    allowedOrigin: siteConfig.url,
    remove: async (registrationId) => {
      const requested = new URL(request.url).searchParams.getAll("event");
      const event = await resolveRegistrationEvent(requested.length > 1 ? requested : requested[0]);
      if (!event) return false;
      await deleteConcertRegistration(registrationId, event.key);
      return true;
    },
  });
}
