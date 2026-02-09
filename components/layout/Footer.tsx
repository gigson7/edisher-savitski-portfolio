import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/site-config";
import { Youtube, Linkedin, Instagram, Facebook } from "lucide-react";

const socialLinks = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@svetski",
    icon: Youtube,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/edisher-savitski",
    icon: Linkedin,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/edisher.savitski",
    icon: Instagram,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/edisher.savitski",
    icon: Facebook,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-100">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Social Media */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Follow
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-gold-600 hover:text-gold-600 transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Contact
              </h3>
              <div className="space-y-3">
                {siteConfig.contact.email && (
                  <p className="text-lg text-neutral-600">
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="hover:text-gold-600 transition-colors"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </p>
                )}
                <p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center text-lg font-medium text-gold-600 hover:text-gold-700 transition-colors"
                  >
                    Send a Message →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-300">
            <p className="text-center text-lg text-neutral-600">
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
