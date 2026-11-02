import { handleConcertRegistration } from "@/lib/concert-registration";
import { saveConcertRegistration, takeRegistrationRateLimit } from "@/lib/concert-registration-store";
import { siteConfig } from "@/data/site-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleConcertRegistration(request, {
    enabled: process.env.CONCERT_REGISTRATION_ENABLED === "true",
    allowedOrigin: siteConfig.url,
    takeRateLimit: takeRegistrationRateLimit,
    save: saveConcertRegistration,
  });
}
