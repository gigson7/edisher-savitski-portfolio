import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { EventsList } from "@/components/events/EventsList";
import { getUpcomingPerformances, getPastPerformances } from "@/data/performances";

export const metadata: Metadata = {
  title: "Events",
  description:
    "View upcoming concerts and past performances by Dr. Edisher Savitski at venues including Carnegie Hall, Wigmore Hall, and Teatro alla Scala.",
};

export default function EventsPage() {
  const upcomingPerformances = getUpcomingPerformances();
  const pastPerformances = getPastPerformances();

  return (
    <>
      {/* Header */}
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              Performances & Events
            </h1>
            <p className="text-sm text-primary-600">
              Concert schedule and performance history from prestigious venues worldwide
            </p>
          </div>
        </Container>
      </Section>

      {/* Upcoming Events */}
      {upcomingPerformances.length > 0 && (
        <Section background="gray" className="!pt-12 sm:!pt-14 !pb-20">
          <Container>
            <EventsList
              performances={upcomingPerformances}
              title="Upcoming Performances"
            />
          </Container>
        </Section>
      )}

      {/* Past Performances */}
      <Section background={upcomingPerformances.length > 0 ? "white" : "gray"} className={upcomingPerformances.length === 0 ? "!pt-12 sm:!pt-14 !pb-20" : ""}>
        <Container>
          <EventsList
            performances={pastPerformances}
            title="Past Performances"
          />
        </Container>
      </Section>
    </>
  );
}
