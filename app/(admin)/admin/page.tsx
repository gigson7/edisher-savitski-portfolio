import Link from "next/link";
import { Calendar, Video, Image, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  try {
    const [performanceCount, videoCount, photoCount, biography] =
      await Promise.all([
        prisma.performance.count(),
        prisma.video.count(),
        prisma.photo.count(),
        prisma.biography.findFirst({
          select: { updatedAt: true },
          orderBy: { updatedAt: "desc" },
        }),
      ]);

    return {
      performanceCount,
      videoCount,
      photoCount,
      lastBioUpdate: biography?.updatedAt ?? null,
    };
  } catch {
    return {
      performanceCount: 0,
      videoCount: 0,
      photoCount: 0,
      lastBioUpdate: null,
    };
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "Not yet updated";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Performances",
      value: stats.performanceCount,
      description: "Total performances",
      href: "/admin/performances",
      icon: Calendar,
    },
    {
      label: "Videos",
      value: stats.videoCount,
      description: "YouTube videos",
      href: "/admin/videos",
      icon: Video,
    },
    {
      label: "Photos",
      value: stats.photoCount,
      description: "Gallery photos",
      href: "/admin/photos",
      icon: Image,
    },
    {
      label: "Biography",
      value: formatDate(stats.lastBioUpdate),
      description: "Last updated",
      href: "/admin/biography",
      icon: FileText,
      isDate: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-neutral-900"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
          }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome back. Here&apos;s an overview of your content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(({ label, value, description, href, icon: Icon, isDate }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-[#8d7336] transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "rgba(141, 115, 54, 0.1)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#8d7336" }} />
              </div>
            </div>
            <div
              className={`font-bold text-neutral-900 mb-1 ${
                isDate ? "text-lg" : "text-3xl"
              }`}
              style={
                isDate
                  ? {
                      fontFamily:
                        "var(--font-cormorant), 'Cormorant Garamond', serif",
                    }
                  : undefined
              }
            >
              {value}
            </div>
            <div className="text-sm text-neutral-500">{description}</div>
            <div className="mt-3 text-xs font-medium text-neutral-400 group-hover:text-[#8d7336] transition-colors">
              {label} &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
