"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionState = { error?: string } | null;

function sanitizeYoutubeId(input: string): string {
  // Extract ID from full URLs
  const match = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/
  );
  const id = match ? match[1] : input;
  // Strip any remaining query params or whitespace
  return id.split(/[?&#\s]/)[0].trim();
}

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

function revalidateAll() {
  revalidatePath("/admin/videos");
  revalidatePath("/media");
  revalidatePath("/");
}

export async function createVideo(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const youtubeId = sanitizeYoutubeId(
    (formData.get("youtubeId") as string | null)?.trim() ?? ""
  );
  const venue =
    (formData.get("venue") as string | null)?.trim() || null;
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const repertoire = parseStringArray(
    formData.get("repertoire") as string | null
  );
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required." };
  if (!youtubeId) return { error: "YouTube URL or Video ID is required." };

  // Determine max sortOrder
  const maxRecord = await prisma.video.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const sortOrder = (maxRecord?.sortOrder ?? 0) + 1;

  try {
    await prisma.video.create({
      data: {
        title,
        youtubeId,
        venue,
        description,
        repertoire,
        isFeatured,
        sortOrder,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { error: "A video with this YouTube ID already exists." };
    }
    return { error: "Failed to create video. Please try again." };
  }

  revalidateAll();
  redirect("/admin/videos");
}

export async function updateVideo(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = (formData.get("title") as string | null)?.trim() ?? "";
  const youtubeId = sanitizeYoutubeId(
    (formData.get("youtubeId") as string | null)?.trim() ?? ""
  );
  const venue =
    (formData.get("venue") as string | null)?.trim() || null;
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const repertoire = parseStringArray(
    formData.get("repertoire") as string | null
  );
  const isFeatured = formData.get("isFeatured") === "on";

  if (!title) return { error: "Title is required." };
  if (!youtubeId) return { error: "YouTube URL or Video ID is required." };

  try {
    await prisma.video.update({
      where: { id },
      data: {
        title,
        youtubeId,
        venue,
        description,
        repertoire,
        isFeatured,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique constraint") || msg.includes("unique")) {
      return { error: "A video with this YouTube ID already exists." };
    }
    return { error: "Failed to update video. Please try again." };
  }

  revalidateAll();
  redirect("/admin/videos");
}

export async function deleteVideo(id: number) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.video.delete({ where: { id } });
  revalidatePath("/admin/videos");
  revalidatePath("/media");
  revalidatePath("/");
}

