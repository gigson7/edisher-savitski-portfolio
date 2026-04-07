"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePerformance(id: number) {
  await prisma.performance.delete({ where: { id } });
  revalidatePath("/admin/performances");
  revalidatePath("/events");
  revalidatePath("/");
}
