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
    remove: deleteConcertRegistration,
  });
}
