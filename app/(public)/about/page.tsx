import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { biography } from "@/data/biography";
import { Award, Music, Globe, GraduationCap } from "lucide-react";
import { TestimonialCard } from "@/components/about/TestimonialCard";

export const metadata: Metadata = {
  title: "About",
  description:
    "Biography of Dr. Edisher Savitski, award-winning concert pianist and Associate Professor at University of Alabama School of Music.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              About Dr. Edisher Savitski
            </h1>
            <p className="text-lg text-primary-700 leading-relaxed">
              {biography.shortBio} {biography.sections[0]?.content}
            </p>
          </div>
        </Container>
      </Section>

      {/* Critical Acclaim - Testimonials */}
      <Section background="white" className="!pt-4 !pb-12 sm:!pb-16 lg:!pb-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-4">
                Critical Acclaim
              </h2>
              <p className="text-lg text-primary-600">
                Praise from leading music critics and publications
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {biography.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Remaining Biography Sections */}
      {biography.sections.slice(1).map((section, index) => (
        <Section
          key={section.id}
          background={index % 2 === 0 ? "gray" : "white"}
          className="!py-12 sm:!py-16 lg:!py-20"
        >
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-6">
                {section.title}
              </h2>
              <div className="prose prose-lg max-w-none">
                {section.content.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-primary-700 mb-4 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      ))}

      {/* Highlights Grid */}
      <Section background="white" className="!py-12 sm:!py-16 lg:!py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-8 text-center">
              Career Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {biography.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 border border-primary-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0">
                    {index % 4 === 0 ? (
                      <Music className="w-6 h-6 text-accent-500" />
                    ) : index % 4 === 1 ? (
                      <Award className="w-6 h-6 text-accent-500" />
                    ) : index % 4 === 2 ? (
                      <GraduationCap className="w-6 h-6 text-accent-500" />
                    ) : (
                      <Globe className="w-6 h-6 text-accent-500" />
                    )}
                  </div>
                  <p className="text-primary-700">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Venues */}
      <Section background="gray" className="!py-12 sm:!py-16 lg:!py-20">
        <Container>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-8 text-center">
              Performance Venues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-serif font-semibold text-primary-700 mb-4">
                  United States
                </h3>
                <ul className="space-y-2">
                  {biography.venues.usa.map((venue, index) => (
                    <li key={index} className="text-primary-600 text-base">
                      • {venue}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-primary-700 mb-4">
                  Europe
                </h3>
                <ul className="space-y-2">
                  {biography.venues.europe.slice(0, 10).map((venue, index) => (
                    <li key={index} className="text-primary-600 text-base">
                      • {venue}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-primary-700 mb-4">
                  Asia & Other
                </h3>
                <ul className="space-y-2">
                  {[...biography.venues.asia, ...biography.venues.other].map(
                    (venue, index) => (
                      <li key={index} className="text-primary-600 text-base">
                        • {venue}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
