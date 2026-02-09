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
        <h3 className="font-semibold text-neutral-900 mb-1">
          {video.title}
        </h3>
        {showDescription && video.description && (
          <p className="text-sm text-neutral-600">{video.description}</p>
        )}
        {showDescription && video.repertoire && video.repertoire.length > 0 && (
          <p className="text-sm text-neutral-500 mt-2">
            {video.repertoire.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
