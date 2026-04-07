"use server";

import { prisma } from "@/lib/prisma";
import { processAndSavePhoto, deletePhotoFiles } from "@/lib/image-processing";
import { revalidatePath } from "next/cache";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function revalidateAll() {
  revalidatePath("/admin/photos");
  revalidatePath("/media");
  revalidatePath("/");
}

export async function uploadPhoto(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File is too large. Maximum size is 10 MB." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      error: "Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.",
    };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate with Sharp — ensures it's a real image, not just a renamed file
  try {
    const { default: sharp } = await import("sharp");
    await sharp(buffer).metadata();
  } catch {
    return { error: "File is not a valid image." };
  }

  let filename: string | undefined;

  try {
    filename = await processAndSavePhoto(buffer, file.name);

    const maxRecord = await prisma.photo.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (maxRecord?.sortOrder ?? 0) + 1;

    await prisma.photo.create({
      data: {
        filename,
        altText: file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " "),
        objectPosition: "center center",
        sortOrder,
      },
    });

    revalidateAll();
    return { success: true };
  } catch (err) {
    // Clean up files if DB insert failed
    if (filename) {
      await deletePhotoFiles(filename).catch(() => {});
    }
    console.error("uploadPhoto error:", err);
    return { error: "Failed to upload photo. Please try again." };
  }
}

export async function deletePhoto(id: number): Promise<void> {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;

  await deletePhotoFiles(photo.filename);
  await prisma.photo.delete({ where: { id } });

  revalidateAll();
}

export async function updatePhotoMeta(
  id: number,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const altText = (formData.get("altText") as string | null)?.trim() ?? "";
  const objectPosition =
    (formData.get("objectPosition") as string | null)?.trim() ?? "center center";

  try {
    await prisma.photo.update({
      where: { id },
      data: { altText, objectPosition },
    });
    revalidateAll();
    return { success: true };
  } catch (err) {
    console.error("updatePhotoMeta error:", err);
    return { error: "Failed to save changes." };
  }
}

export async function reorderPhotos(orderedIds: number[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.photo.update({
        where: { id },
        data: { sortOrder: index + 1 },
      })
    )
  );
  revalidateAll();
}
