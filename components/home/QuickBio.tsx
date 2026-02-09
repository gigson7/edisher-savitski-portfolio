import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { biography } from "@/data/biography";
import { Button } from "@/components/ui/Button";
import { Award, Music, GraduationCap, Users } from "lucide-react";

export function QuickBio() {
  const highlights = [
    {
      icon: Music,
      title: "Yamaha Artist",
      description: "Official Yamaha Artist and clinician",
    },
    {
      icon: Award,
      title: "Award Winner",
      description: "First Prize - International Piano-E-Competition",
    },
    {
      icon: GraduationCap,
      title: "Professor",
      description: "Associate Professor at University of Alabama",
    },
    {
      icon: Users,
      title: "Artistic Director",
      description: "Toradze International Music Festival",
    },
  ];

  return (
    <Section background="white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Bio Text */}
          <div>
            <h2 className="text-4xl sm:text-5xl font-semibold text-neutral-900 mb-8">
              About Dr. Savitski
            </h2>
            <p className="text-lg text-neutral-700 mb-6 leading-relaxed">
              {biography.shortBio}
            </p>
            <p className="text-base text-neutral-600 mb-10 leading-relaxed">
              Award-winning pianist performing at prestigious venues worldwide including
              Carnegie Hall, Wigmore Hall, and Teatro alla Scala. As a clinician he regularly
              conducts master classes throughout USA, Europe and China. His performances have
              been praised by critics worldwide and broadcasted on live TV and radio throughout
              Europe and USA.
            </p>
            <Link href="/about">
              <Button variant="primary" size="lg">Read Full Biography</Button>
            </Link>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="border border-neutral-200 rounded p-8 hover:border-gold-500 transition-all duration-200"
                >
                  <Icon className="w-8 h-8 text-gold-600 mb-4" />
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
