"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { siteConfig } from "@/data/site-config";
import { getSession } from "@/lib/auth";
import { eventRegistrationEnabled, parseEventId, parseRegistrationSettings } from "@/lib/event-registration";
import { saveRegistrationSettings } from "@/lib/event-registration-store";

export async function updateRegistrationSettings(rawId: string, _previous: string, fields: FormData): Promise<string> {
  if (!(await getSession()) || !eventRegistrationEnabled()) return "Registration settings are unavailable.";
  if ((await headers()).get("origin") !== new URL(siteConfig.url).origin) {
    return "Please save registration settings from this website.";
  }

  const id = parseEventId(rawId);
  const settings = parseRegistrationSettings(fields);
  if (id === null || !settings) return "Enter a valid closing date and time zone, such as America/New_York.";

  try {
    if (!(await saveRegistrationSettings(id, settings))) {
      return "This performance or deadline is unavailable. Check the time zone and choose a last day followed by a local midnight.";
    }
  } catch {
    return "Registration settings could not be saved. Please try again.";
  }

  redirect(`/admin/registrations/settings/${id}?saved=1`);
}
