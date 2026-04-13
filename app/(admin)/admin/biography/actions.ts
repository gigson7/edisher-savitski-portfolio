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

  // JSON.parse/stringify to satisfy Prisma 7's strict InputJsonValue type.
  // Avoid `upsert`: Prisma 7's interpreter wraps it in an interactive
  // transaction, which the Neon HTTP adapter cannot execute.
  const data = {
    shortBio,
    fullBio: JSON.parse(JSON.stringify(fullBio)),
    sections: JSON.parse(JSON.stringify(sections)),
    highlights: JSON.parse(JSON.stringify(highlights)),
    venues: JSON.parse(JSON.stringify(venues)),
    testimonials: JSON.parse(JSON.stringify(testimonials)),
  };

  const existing = await prisma.biography.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.biography.update({ where: { id: existing.id }, data });
  } else {
    await prisma.biography.create({ data });
  }

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true };
}
