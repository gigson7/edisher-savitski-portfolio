import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VideoForm } from "@/components/admin/VideoForm";
import { updateVideo } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageProps) {
  const { id: idString } = await params;
  const id = parseInt(idString, 10);

  if (isNaN(id)) notFound();

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) notFound();

  const boundAction = updateVideo.bind(null, id);

  const repertoire = Array.isArray(video.repertoire)
    ? (video.repertoire as string[])
    : [];

  return (
    <div>
      <h1
        className="font-bold text-3xl text-neutral-800 mb-8"
        style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
        }}
      >
        Edit Video
      </h1>
      <VideoForm
        video={{
          id: video.id,
          title: video.title,
          youtubeId: video.youtubeId,
          venue: video.venue,
          description: video.description,
          repertoire,
          isFeatured: video.isFeatured,
        }}
        action={boundAction}
      />
    </div>
  );
}
