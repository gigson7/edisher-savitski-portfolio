import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Calendar, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative h-[650px] lg:h-[750px] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0 bg-black">
        {/* Centered container with responsive widths */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[85%] md:w-[80%] lg:w-[70%]">
          <Image
            src="/images/hero/hero-main.webp"
            alt="Dr. Edisher Savitski performing"
            fill
            priority
            className="object-cover object-[center_5%]"
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 80vw, 70vw"
          />
          {/* Gradient overlay - only over the image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/50" />
        </div>
      </div>

      {/* Overlay Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="max-w-3xl pt-[30px]">
            <p className="text-2xl sm:text-3xl text-gold-200 mb-10 font-light tracking-wide">
              Concert Pianist • Associate Professor • Artistic Director
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/events">
                <Button size="lg" className="w-full sm:w-auto border-gold-400 text-gold-300 hover:bg-gold-400 hover:text-neutral-900">
                  <Calendar className="w-5 h-5 mr-2" />
                  View Upcoming Events
                </Button>
              </Link>
              <Link href="/media">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto border-white/40 text-white hover:border-gold-400 hover:text-gold-300">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Performances
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
