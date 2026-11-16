"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { readPerformanceLinkFields } from "@/lib/performance-link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function deletePerformance(id: number): Promise<string> {
  const session = await getSession();
  if (!session) {
    return "Please sign in again.";
  }

  try {
    await prisma.performance.delete({ where: { id } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error.code === "P2003" || error.code === "23503")) {
      return "This performance has a registration form. Turn off registration in its settings to stop accepting signups.";
    }
    return "This performance could not be deleted. Please try again.";
  }
  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");
  return "";
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

export async function createPerformance(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }
  const link = readPerformanceLinkFields(formData);
  if (link.error) return { error: link.error };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const dateString = (formData.get("date") as string | null)?.trim() ?? "";
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
      type: "solo",
      venue,
      location,
      country,
      organization,
      ...link.values,
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
  const link = readPerformanceLinkFields(formData);
  if (link.error) return { error: link.error };

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const dateString = (formData.get("date") as string | null)?.trim() ?? "";
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
      venue,
      location,
      country,
      organization,
      ...link.values,
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
