import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getFeaturedPerformances, getUpcomingPerformances } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";
import { ArrowUpRight, Calendar, MapPin, Music } from "lucide-react";
import { ConcertRegistrationLink } from "@/components/events/ConcertRegistrationLink";
import { validatePerformanceLink } from "@/lib/performance-link";

type FeaturedPerformance = {
  id: string | number;
  title: string;
  date: string | Date;
  venue: string;
  location: string;
  organization?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
};

function PerformanceLink({ linkUrl, linkTitle }: Pick<FeaturedPerformance, "linkUrl" | "linkTitle">) {
  if (!linkUrl || !linkTitle) return null;
  const { values } = validatePerformanceLink(linkUrl, linkTitle);
  if (!values?.linkUrl) return null;

  return (
    <a href={values.linkUrl} className="mt-5 inline-flex max-w-full items-center gap-2 self-start text-lg font-semibold text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600">
      <span className="min-w-0 wrap-anywhere">{values.linkTitle}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

export async function FeaturedPerformances() {
  const [featured, upcoming] = await Promise.all([
    getFeaturedPerformances(),
    getUpcomingPerformances(),
  ]);
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
          {displayPerformances.map((performance: FeaturedPerformance) => (
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
              <ConcertRegistrationLink performance={performance} />
              <PerformanceLink linkUrl={performance.linkUrl} linkTitle={performance.linkTitle} />
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
