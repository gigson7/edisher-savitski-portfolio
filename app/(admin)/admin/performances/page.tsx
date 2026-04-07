import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeletePerformanceButton } from "@/components/admin/DeletePerformanceButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type PerformanceType = "solo" | "chamber" | "orchestra" | "masterclass";

interface SearchParams {
  tab?: string;
  search?: string;
  year?: string;
  type?: string;
  page?: string;
}

async function getPerformances(params: SearchParams) {
  const tab = params.tab === "past" ? "past" : "upcoming";
  const search = params.search?.trim() ?? "";
  const year = params.year ? parseInt(params.year, 10) : null;
  const type = params.type as PerformanceType | undefined;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const now = new Date();

  // Tab constraint
  const tabConstraint =
    tab === "upcoming" ? { date: { gte: now } } : { date: { lt: now } };

  // Build AND array for date filters
  const dateFilters: object[] = [tabConstraint];
  if (year && !isNaN(year)) {
    dateFilters.push({ date: { gte: new Date(`${year}-01-01`) } });
    dateFilters.push({ date: { lt: new Date(`${year + 1}-01-01`) } });
  }

  // Search filter
  const searchFilter =
    search.length > 0
      ? {
          OR: [
            { title: { contains: search } },
            { venue: { contains: search } },
            { location: { contains: search } },
          ],
        }
      : undefined;

  const where = {
    AND: dateFilters,
    ...(type ? { type } : {}),
    ...(searchFilter ?? {}),
  };

  const [performances, total] = await Promise.all([
    prisma.performance.findMany({
      where,
      orderBy: tab === "upcoming" ? { date: "asc" } : { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.performance.count({ where }),
  ]);

  return { performances, total, page, tab };
}

async function getYears() {
  try {
    const records = await prisma.performance.findMany({
      select: { date: true },
      distinct: ["date"],
      orderBy: { date: "desc" },
    });
    const years = [
      ...new Set(records.map((r) => r.date.getFullYear())),
    ].sort((a, b) => b - a);
    return years;
  } catch {
    return [];
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PerformancesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [{ performances, total, page, tab }, years] = await Promise.all([
    (async () => {
      try {
        return await getPerformances(params);
      } catch {
        return {
          performances: [] as Awaited<
            ReturnType<typeof getPerformances>
          >["performances"],
          total: 0,
          page: 1,
          tab: params.tab === "past" ? "past" : ("upcoming" as string),
        };
      }
    })(),
    getYears(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // Build URL helper that preserves other params
  function buildUrl(overrides: Partial<SearchParams>): string {
    const merged: Record<string, string> = {};
    if (params.tab) merged.tab = params.tab;
    if (params.search) merged.search = params.search;
    if (params.year) merged.year = params.year;
    if (params.type) merged.type = params.type;
    if (params.page) merged.page = params.page;
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) merged[k] = v;
      else delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return `/admin/performances${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-neutral-900"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            }}
          >
            Performances
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage concert performances and events.
          </p>
        </div>
        <Link
          href="/admin/performances/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#8d7336" }}
        >
          <Plus className="w-4 h-4" />
          Add Performance
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(["upcoming", "past"] as const).map((t) => {
          const isActive = tab === t;
          return (
            <Link
              key={t}
              href={buildUrl({ tab: t, page: "1" })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
              style={isActive ? { backgroundColor: "#8d7336" } : undefined}
            >
              {capitalize(t)}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <form
        method="GET"
        action="/admin/performances"
        className="mb-5 flex flex-wrap gap-3 items-center"
      >
        {/* Preserve tab */}
        <input type="hidden" name="tab" value={tab} />

        {/* Search */}
        <input
          type="text"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search title, venue, location…"
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 w-64"
          style={{ "--tw-ring-color": "#8d7336" } as React.CSSProperties}
        />

        {/* Year */}
        <select
          name="year"
          defaultValue={params.year ?? ""}
          className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#8d7336" } as React.CSSProperties}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

<button
          type="submit"
          className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Filter
        </button>

        {(params.search || params.year || params.type) && (
          <Link
            href={buildUrl({
              search: undefined,
              year: undefined,
              type: undefined,
              page: "1",
            })}
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            Clear filters
          </Link>
        )}
      </form>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        {performances.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-sm">
            No performances found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Venue
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-500">
                    Location
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {performances.map((p) => {
                  const isUpcoming = p.date >= new Date();
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-neutral-700">
                        {formatDate(p.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-neutral-900">
                            {p.title}
                          </span>
                          {isUpcoming && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              Upcoming
                            </span>
                          )}
                          {p.isFeatured && (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: "#f5f1e8",
                                color: "#8d7336",
                              }}
                            >
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{p.venue}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {p.location}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/performances/${p.id}/edit`}
                            className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeletePerformanceButton
                            id={p.id}
                            title={p.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-neutral-50">
            <p className="text-sm text-neutral-500">
              Showing {from}–{to} of {total}
            </p>
            <div className="flex gap-2">
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                  page <= 1
                    ? "border-neutral-200 text-neutral-300 pointer-events-none"
                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                }`}
                aria-disabled={page <= 1}
              >
                Previous
              </Link>
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                  page >= totalPages
                    ? "border-neutral-200 text-neutral-300 pointer-events-none"
                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                }`}
                aria-disabled={page >= totalPages}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
