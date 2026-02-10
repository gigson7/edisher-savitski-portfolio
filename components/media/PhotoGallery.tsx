"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const galleryImages = [
  {
    src: "/images/gallery/DSCF5956-large.webp",
    alt: "Dr. Edisher Savitski performing",
    objectPosition: "center 28%",
  },
  {
    src: "/images/gallery/DSCF6301-large.webp",
    alt: "Piano performance",
    objectPosition: "center top",
  },
  {
    src: "/images/gallery/DSCF6347-large.webp",
    alt: "Concert hall performance",
    objectPosition: "center top",
  },
  {
    src: "/images/gallery/edisher 123-large.webp",
    alt: "Performance at piano",
    objectPosition: "center top",
  },
  {
    src: "/images/gallery/edisher 124-large.webp",
    alt: "Recital performance",
    objectPosition: "center top",
  },
  { src: "/images/gallery/edisher 127-large.webp", alt: "Solo recital", objectPosition: "center 80%" },
  { src: "/images/gallery/edisher 130-large.webp", alt: "Concert performance" },
  { src: "/images/gallery/edisher 132-large.webp", alt: "Piano recital" },
];

export function PhotoGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            onClick={() => {
              setPhotoIndex(index);
              setIsOpen(true);
            }}
            className="relative aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              loading={index < 3 ? "eager" : "lazy"}
              className="object-cover transition-transform group-hover:scale-105"
              style={
                image.objectPosition
                  ? { objectPosition: image.objectPosition }
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
        slides={galleryImages.map((img) => ({ src: img.src }))}
      />
    </>
  );
}
