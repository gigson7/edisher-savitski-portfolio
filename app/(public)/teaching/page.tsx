import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { GraduationCap, Users, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Teaching",
  description:
    "Dr. Edisher Savitski offers piano instruction, masterclasses, and clinics worldwide.",
};

export default function TeachingPage() {
  return (
    <>
      {/* Header */}
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              Teaching
            </h1>
            <p className="text-lg text-primary-600">
              Piano instruction and masterclasses worldwide
            </p>
          </div>
        </Container>
      </Section>

      {/* Content */}
      <Section background="gray" className="!pt-6">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
                  <GraduationCap className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary-800 mb-2">
                  Professor
                </h3>
                <p className="text-base text-primary-600">
                  Associate Professor at University of Alabama School of Music
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
                  <Users className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary-800 mb-2">
                  Masterclasses
                </h3>
                <p className="text-base text-primary-600">
                  Regular masterclasses throughout USA, Europe, and China
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-4">
                  <Globe className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary-800 mb-2">
                  Clinician
                </h3>
                <p className="text-base text-primary-600">
                  International clinician and pedagogue
                </p>
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-primary-200 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-primary-800 mb-4">
                Teaching Information Coming Soon
              </h2>
              <p className="text-lg text-primary-600 mb-6 max-w-2xl mx-auto">
                Detailed information about teaching philosophy, private lessons,
                masterclass opportunities, and rates will be available soon.
              </p>
              <p className="text-primary-600 mb-8">
                For teaching inquiries, please contact Dr. Savitski directly.
              </p>
              <Link href="/contact">
                <Button size="lg">Contact for Teaching Inquiries</Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
