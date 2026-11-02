import { PRIVATE_HEADERS } from "@/lib/concert-registration";

type DeleteDependencies = {
  isAuthenticated: () => Promise<boolean>;
  allowedOrigin: string;
  remove: (id: number) => Promise<void>;
};

function response(status: number, error?: string) {
  return Response.json(error ? { error } : { success: true }, { status, headers: PRIVATE_HEADERS });
}

export async function handleDeleteConcertRegistration(request: Request, rawId: string, deps: DeleteDependencies): Promise<Response> {
  try {
    if (!(await deps.isAuthenticated())) return response(401, "Please sign in again.");
    if (request.headers.get("origin") !== new URL(deps.allowedOrigin).origin) {
      return response(403, "Please delete registrations from this website.");
    }
    const id = Number(rawId);
    if (!/^[1-9]\d{0,9}$/.test(rawId) || !Number.isSafeInteger(id) || id > 2147483647) {
      return response(400, "Invalid registration.");
    }
    await deps.remove(id);
    return response(200);
  } catch {
    // Database errors may contain attendee data. Keep failures private and generic.
    return response(503, "The registration could not be deleted. Please try again.");
  }
}
