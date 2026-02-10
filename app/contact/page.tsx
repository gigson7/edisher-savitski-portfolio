import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Dr. Edisher Savitski for booking inquiries, masterclass opportunities, and general questions.",
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              Contact
            </h1>
            <p className="text-lg text-primary-600">
              Get in touch for booking inquiries and masterclass opportunities
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Form */}
      <Section background="gray" className="!pt-6">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-primary-200">
              <h3 className="text-2xl font-serif font-semibold text-primary-800 mb-6">
                Send a Message
              </h3>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
