"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type VideoData = {
  id: number;
  youtubeId: string;
  title: string;
  description: string | null;
};

type PhotoData = {
  id: number;
  filename: string;
  altText: string;
  objectPosition: string;
};

interface FeaturedMediaProps {
  videos: VideoData[];
  photos: PhotoData[];
}

export function FeaturedMedia({ videos, photos }: FeaturedMediaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const featuredVideos = videos.slice(0, 3);
  const featuredPhotos = photos.slice(0, 3);

  return (
    <Section background="white">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-neutral-900 mb-6">
            Media Gallery
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Watch performances and explore photos from concerts worldwide
          </p>
        </div>

        {/* Videos Section */}
        {featuredVideos.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold text-neutral-900">
                Performance Videos
              </h3>
              <Link
                href="/media#videos"
                className="text-gold-600 hover:text-gold-700 transition-colors text-base font-medium flex items-center gap-1"
              >
                See more
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVideos.map((video) => (
                <VideoEmbed key={video.id} video={video} showDescription={false} />
              ))}
            </div>
          </div>
        )}

        {/* Photos Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-neutral-900">
              Photo Gallery
            </h3>
            <Link
              href="/media#photos"
              className="text-gold-600 hover:text-gold-700 transition-colors text-base font-medium flex items-center gap-1"
            >
              See more
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setPhotoIndex(index);
                  setIsOpen(true);
                }}
                className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer"
              >
                <Image
                  src={`/images/gallery/${photo.filename}-large.webp`}
                  alt={photo.altText}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  style={
                    photo.objectPosition
                      ? { objectPosition: photo.objectPosition }
                      : undefined
                  }
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>

          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            index={photoIndex}
            slides={featuredPhotos.map((photo) => ({ src: `/images/gallery/${photo.filename}-large.webp` }))}
          />
        </div>
      </Container>
    </Section>
  );
}
