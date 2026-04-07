"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type PhotoData = {
  id: number;
  filename: string;
  altText: string;
  objectPosition: string;
};

export function PhotoGallery({ photos }: { photos: PhotoData[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
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
              loading={index < 3 ? "eager" : "lazy"}
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
        slides={photos.map((photo) => ({ src: `/images/gallery/${photo.filename}-large.webp` }))}
      />
    </>
  );
}
