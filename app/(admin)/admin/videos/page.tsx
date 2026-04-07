import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteVideoButton } from "@/components/admin/DeleteVideoButton";

export const dynamic = "force-dynamic";

export default async function VideosPage() {
  let videos: Awaited<ReturnType<typeof prisma.video.findMany>> = [];

  try {
    videos = await prisma.video.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not available in build/preview — render empty state
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
            Videos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage YouTube video entries.
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#8d7336" }}
        >
          <Plus className="w-4 h-4" />
          Add Video
        </Link>
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 py-16 text-center text-neutral-400 text-sm shadow-sm">
          No videos yet.{" "}
          <Link
            href="/admin/videos/new"
            className="underline hover:text-neutral-600"
          >
            Add the first one
          </Link>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-neutral-100">
                <Image
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-medium text-neutral-900 text-sm leading-snug line-clamp-2">
                      {video.title}
                    </h2>
                    {video.venue && (
                      <p className="text-xs text-neutral-500 mt-1 truncate">
                        {video.venue}
                      </p>
                    )}
                  </div>
                  {video.isFeatured && (
                    <span
                      className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: "#f5f1e8", color: "#8d7336" }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/videos/${video.id}/edit`}
                    className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <DeleteVideoButton id={video.id} title={video.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
