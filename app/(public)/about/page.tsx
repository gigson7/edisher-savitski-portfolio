import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getBiography } from "@/lib/data";
import { Award, Music, Globe, GraduationCap } from "lucide-react";
import { TestimonialCard } from "@/components/about/TestimonialCard";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Biography of Dr. Edisher Savitski, award-winning concert pianist and Associate Professor at University of Alabama School of Music.",
};

type BiographySection = {
  id: string;
  title: string;
  content: unknown;
  order: number;
};

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  source: string;
  performance?: string | null;
};

type Venues = {
  usa: string[];
  europe: string[];
  asia: string[];
  other: string[];
};

const tiptapExtensions = [StarterKit, Link, Underline];

function renderTiptapContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return generateHTML(content as any, tiptapExtensions);
  } catch {
    // Fallback: if content is a plain string somehow
    if (typeof content === "string") return content;
    return "";
  }
}

export default async function AboutPage() {
  const biography = await getBiography();

  if (!biography) {
    return (
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              About Dr. Edisher Savitski
            </h1>
            <p className="text-lg text-primary-700">Biography coming soon.</p>
          </div>
        </Container>
      </Section>
    );
  }

  const sections = (biography.sections as BiographySection[]) || [];
  const testimonials = (biography.testimonials as Testimonial[]) || [];
  const highlights = (biography.highlights as string[]) || [];
  const venues = (biography.venues as Venues) || { usa: [], europe: [], asia: [], other: [] };

  // Render the first section's content (used as intro paragraph alongside shortBio)
  const firstSectionHtml = sections[0]?.content
    ? renderTiptapContent(sections[0].content)
    : "";
  // Strip HTML tags from the first section for the intro text
  const firstSectionText = firstSectionHtml.replace(/<[^>]*>/g, "").trim();

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
              {biography.shortBio} {firstSectionText}
            </p>
          </div>
        </Container>
      </Section>

      {/* Critical Acclaim - Testimonials */}
      {testimonials.length > 0 && (
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
                {testimonials.map((testimonial) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Remaining Biography Sections */}
      {sections.slice(1).map((section, index) => {
        const sectionHtml = renderTiptapContent(section.content);
        return (
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
                <div
                  className="prose prose-lg max-w-none [&_p]:text-primary-700 [&_p]:mb-4 [&_p]:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sectionHtml }}
                />
              </div>
            </Container>
          </Section>
        );
      })}

      {/* Highlights Grid */}
      {highlights.length > 0 && (
        <Section background="white" className="!py-12 sm:!py-16 lg:!py-20">
          <Container>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-8 text-center">
                Career Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highlights.map((highlight, index) => (
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
      )}

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
                  {venues.usa.map((venue, index) => (
                    <li key={index} className="text-primary-600 text-base">
                      &bull; {venue}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-primary-700 mb-4">
                  Europe
                </h3>
                <ul className="space-y-2">
                  {venues.europe.slice(0, 10).map((venue, index) => (
                    <li key={index} className="text-primary-600 text-base">
                      &bull; {venue}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-serif font-semibold text-primary-700 mb-4">
                  Asia & Other
                </h3>
                <ul className="space-y-2">
                  {[...venues.asia, ...venues.other].map(
                    (venue, index) => (
                      <li key={index} className="text-primary-600 text-base">
                        &bull; {venue}
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
