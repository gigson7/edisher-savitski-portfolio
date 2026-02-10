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
      description: (
        <>
          Official <a href="https://www.yamaha.com/yasi/artists/details.html?CNTID=4101986&type=classical" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700 underline underline-offset-2">Yamaha</a> Artist and clinician
        </>
      ),
    },
    {
      icon: Award,
      title: "Award Winner",
      description: "First Prize - International Piano-E-Competition",
    },
    {
      icon: GraduationCap,
      title: "Professor",
      description: (
        <>
          Associate Professor at <a href="https://piano.music.ua.edu/?_gl=1%2Agtydnc%2A_ga%2ANTY1ODQ3MTQ2LjE3NzA2NTkzOTEu%2A_ga_HH7BR7ZRHP%2AczE3NzA2NTkzOTEkbzEkZzAkdDE3NzA2NTkzOTEkajYwJGwwJGgw" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700 underline underline-offset-2">University of Alabama</a>
        </>
      ),
    },
    {
      icon: Users,
      title: "Artistic Director",
      description: (
        <>
          <a href="https://toradze.org/" target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-700 underline underline-offset-2">Toradze</a> International Music Festival
        </>
      ),
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
            <p className="text-xl text-neutral-700 mb-6 leading-relaxed">
              {biography.shortBio}
            </p>
            <p className="text-xl text-neutral-600 mb-10 leading-relaxed">
              As a clinician he regularly conducts master classes throughout USA, Europe and
              China. His performances are frequently broadcasted on live TV and radio throughout
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
                  <p className="text-lg text-neutral-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
