import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickBio } from "@/components/home/QuickBio";
import { FeaturedPerformances } from "@/components/home/FeaturedPerformances";
import { FeaturedMedia } from "@/components/home/FeaturedMedia";

export const metadata: Metadata = {
  title: "Dr. Edisher Savitski - Award-Winning Concert Pianist",
  description:
    "Experience world-class piano performances by Dr. Edisher Savitski. Award-winning concert pianist, Associate Professor at University of Alabama, with performances at Carnegie Hall, Wigmore Hall, and Teatro alla Scala.",
  openGraph: {
    title: "Dr. Edisher Savitski - Concert Pianist",
    description:
      "Award-winning concert pianist performing worldwide at prestigious venues including Carnegie Hall and Wigmore Hall.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Dr. Edisher Savitski - Award-winning Concert Pianist",
      },
    ],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuickBio />
      <FeaturedPerformances />
      <FeaturedMedia />
    </>
  );
}
