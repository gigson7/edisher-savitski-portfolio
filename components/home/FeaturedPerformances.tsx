import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getFeaturedPerformances, getUpcomingPerformances } from "@/data/performances";
import { formatDateShort } from "@/lib/utils";
import { Calendar, MapPin, Music } from "lucide-react";

export function FeaturedPerformances() {
  const featured = getFeaturedPerformances();
  const upcoming = getUpcomingPerformances();
  const displayPerformances = featured.length > 0 ? featured.slice(0, 3) : upcoming.slice(0, 3);

  return (
    <Section background="gray">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-neutral-900 mb-6">
            Featured Performances
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Upcoming concerts and recent highlights from prestigious venues worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {displayPerformances.map((performance) => (
            <Card key={performance.id} hover className="flex flex-col h-full">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                {performance.title}
              </h3>

              <div className="space-y-3 mb-4 flex-grow">
                <div className="flex items-start gap-2 text-lg text-neutral-600">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
                  <span>{formatDateShort(performance.date)}</span>
                </div>
                <div className="flex items-start gap-2 text-lg text-neutral-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
                  <span>
                    {performance.venue}, {performance.location}
                  </span>
                </div>
                {performance.organization && (
                  <div className="flex items-start gap-2 text-lg text-neutral-600">
                    <Music className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-600" />
                    <span>{performance.organization}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/events">
            <Button size="lg" variant="secondary">
              View All Events
            </Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
