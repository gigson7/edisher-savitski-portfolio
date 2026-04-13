"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBiography(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const shortBio = formData.get("shortBio") as string;
  const fullBio = JSON.parse(formData.get("fullBio") as string);
  const sections = JSON.parse(formData.get("sections") as string);
  const highlights = JSON.parse(formData.get("highlights") as string);
  const venues = JSON.parse(formData.get("venues") as string);
  const testimonials = JSON.parse(formData.get("testimonials") as string);

  // Biography is a singleton seeded at id=1. Use `update` rather than
  // `upsert`: Prisma 7's interpreter compiles upsert into an interactive
  // transaction, which the Neon HTTP adapter rejects. A plain update is
  // a single UPDATE statement — no transaction, no race. If the row is
  // ever missing, this throws loudly (which is the correct signal —
  // re-run `prisma/seed.ts`) instead of silently creating duplicates.
  // JSON.parse/stringify satisfies Prisma 7's strict InputJsonValue type.
  await prisma.biography.update({
    where: { id: 1 },
    data: {
      shortBio,
      fullBio: JSON.parse(JSON.stringify(fullBio)),
      sections: JSON.parse(JSON.stringify(sections)),
      highlights: JSON.parse(JSON.stringify(highlights)),
      venues: JSON.parse(JSON.stringify(venues)),
      testimonials: JSON.parse(JSON.stringify(testimonials)),
    },
  });

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true };
}
