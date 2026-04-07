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

  // JSON.parse/stringify to satisfy Prisma 7's strict InputJsonValue type
  await prisma.biography.upsert({
    where: { id: 1 },
    update: {
      shortBio,
      fullBio: JSON.parse(JSON.stringify(fullBio)),
      sections: JSON.parse(JSON.stringify(sections)),
      highlights: JSON.parse(JSON.stringify(highlights)),
      venues: JSON.parse(JSON.stringify(venues)),
      testimonials: JSON.parse(JSON.stringify(testimonials)),
    },
    create: {
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
