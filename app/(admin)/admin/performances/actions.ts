"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PerformanceType } from "@/lib/generated/prisma/enums";

export async function deletePerformance(id: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.performance.delete({ where: { id } });
  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");
}

type ActionState = { error?: string } | null;

function parseStringArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function isValidPerformanceType(value: string): value is PerformanceType {
  return Object.values(PerformanceType).includes(value as PerformanceType);
}

export async function createPerformance(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const dateString = (formData.get("date") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null)?.trim() ?? "";
  const venue = (formData.get("venue") as string | null)?.trim() ?? "";
  const location = (formData.get("location") as string | null)?.trim() ?? "";
  const country = (formData.get("country") as string | null)?.trim() ?? "";
  const organization =
    (formData.get("organization") as string | null)?.trim() || null;
  const collaborators = parseStringArray(
    formData.get("collaborators") as string | null
  );
  const repertoire = parseStringArray(
    formData.get("repertoire") as string | null
  );
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required." };
  if (!dateString) return { error: "Date is required." };
  if (!type || !isValidPerformanceType(type))
    return { error: "Please select a valid performance type." };
  if (!venue) return { error: "Venue is required." };
  if (!location) return { error: "Location is required." };
  if (!country) return { error: "Country is required." };

  // Parse date as UTC noon to avoid timezone-related off-by-one issues
  const date = new Date(dateString + "T12:00:00Z");
  if (isNaN(date.getTime())) return { error: "Invalid date." };

  await prisma.performance.create({
    data: {
      title,
      date,
      type,
      venue,
      location,
      country,
      organization,
      collaborators,
      repertoire,
      isFeatured,
    },
  });

  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");

  redirect("/admin/performances");
}

export async function updatePerformance(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const dateString = (formData.get("date") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null)?.trim() ?? "";
  const venue = (formData.get("venue") as string | null)?.trim() ?? "";
  const location = (formData.get("location") as string | null)?.trim() ?? "";
  const country = (formData.get("country") as string | null)?.trim() ?? "";
  const organization =
    (formData.get("organization") as string | null)?.trim() || null;
  const collaborators = parseStringArray(
    formData.get("collaborators") as string | null
  );
  const repertoire = parseStringArray(
    formData.get("repertoire") as string | null
  );
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required." };
  if (!dateString) return { error: "Date is required." };
  if (!type || !isValidPerformanceType(type))
    return { error: "Please select a valid performance type." };
  if (!venue) return { error: "Venue is required." };
  if (!location) return { error: "Location is required." };
  if (!country) return { error: "Country is required." };

  const date = new Date(dateString + "T12:00:00Z");
  if (isNaN(date.getTime())) return { error: "Invalid date." };

  await prisma.performance.update({
    where: { id },
    data: {
      title,
      date,
      type,
      venue,
      location,
      country,
      organization,
      collaborators,
      repertoire,
      isFeatured,
    },
  });

  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");

  redirect("/admin/performances");
}
