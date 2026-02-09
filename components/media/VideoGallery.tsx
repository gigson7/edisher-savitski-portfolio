"use client";

import { useState } from "react";
import { Video } from "@/types";
import { VideoEmbed } from "./VideoEmbed";
import { Button } from "@/components/ui/Button";

interface VideoGalleryProps {
  videos: Video[];
}

const ITEMS_PER_PAGE = 6;

export function VideoGallery({ videos }: VideoGalleryProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const displayedVideos = videos.slice(0, displayCount);
  const hasMore = displayCount < videos.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <div>
      <p className="mb-6 text-sm text-primary-600">
        Showing {displayedVideos.length} of {videos.length} videos
      </p>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedVideos.map((video) => (
          <VideoEmbed key={video.id} video={video} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-12 text-center">
          <Button onClick={loadMore} variant="outline" size="lg">
            Load More
          </Button>
          <p className="mt-4 text-sm text-primary-600">
            {videos.length - displayCount} more videos
          </p>
        </div>
      )}
    </div>
  );
}
