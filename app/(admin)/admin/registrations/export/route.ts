import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRIVATE_HEADERS, registrationsCsv } from "@/lib/concert-registration";
import { concert } from "@/data/concert";
import { registrationsXlsx } from "@/lib/concert-registration-xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401, headers: PRIVATE_HEADERS });
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  if (format !== "csv" && format !== "xlsx") return new Response("Unsupported export format", { status: 400, headers: PRIVATE_HEADERS });
  try {
    const rows = await prisma.concertRegistration.findMany({
      where: { eventSlug: concert.slug },
      select: { firstName: true, lastName: true, email: true, createdAt: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 10001,
    });
    if (rows.length > 10000) return new Response("The list is too large for a single export. Please contact the site administrator.", { status: 413, headers: PRIVATE_HEADERS });
    if (format === "xlsx") {
      return new Response(await registrationsXlsx(rows), {
        headers: {
          ...PRIVATE_HEADERS,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="yasi-2026-registrations.xlsx"',
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return new Response(registrationsCsv(rows), {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="yasi-2026-registrations.csv"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("The registrations could not be exported. Please try again later.", { status: 503, headers: PRIVATE_HEADERS });
  }
}
