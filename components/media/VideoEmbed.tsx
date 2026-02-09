import { Video } from "@/types";

interface VideoEmbedProps {
  video: Video;
  showDescription?: boolean;
}

export function VideoEmbed({ video, showDescription = true }: VideoEmbedProps) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900">
          {video.title}
        </h3>
      </div>
    </div>
  );
}
