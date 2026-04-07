import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PhotoUpload } from "@/components/admin/PhotoUpload";
import { DeletePhotoButton } from "@/components/admin/DeletePhotoButton";
import { PhotoMetaForm } from "@/components/admin/PhotoMetaForm";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  let photos: Awaited<ReturnType<typeof prisma.photo.findMany>> = [];

  try {
    photos = await prisma.photo.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    // DB not available in build/preview — render empty state
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-neutral-900"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
          }}
        >
          Photos
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Upload and manage gallery photos.
        </p>
      </div>

      {/* Upload zone */}
      <PhotoUpload />

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 py-16 text-center text-neutral-400 text-sm shadow-sm">
          No photos yet. Upload your first photo above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image preview — 4:3 aspect ratio */}
              <div className="relative" style={{ aspectRatio: "4 / 3" }}>
                <Image
                  src={`/images/gallery/${photo.filename}-medium.webp`}
                  alt={photo.altText}
                  fill
                  className="object-cover"
                  style={{ objectPosition: photo.objectPosition }}
                  unoptimized
                />
              </div>

              {/* Card body */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-neutral-400 truncate max-w-[calc(100%-2rem)]">
                    {photo.filename}
                  </span>
                  <DeletePhotoButton id={photo.id} />
                </div>

                <PhotoMetaForm
                  id={photo.id}
                  initialAltText={photo.altText}
                  initialObjectPosition={photo.objectPosition}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
