import { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "Dr. Edisher Savitski",
  title: "Dr. Edisher Savitski - Concert Pianist",
  description:
    "Award-winning concert pianist Dr. Edisher Savitski, Associate Professor at University of Alabama, performs at prestigious venues worldwide including Carnegie Hall and Wigmore Hall.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://edishersavitski.com",

  contact: {
    email: "contact@edishersavitski.com", // Update with actual email
    phone: "", // Add if available
    social: {
      youtube: "https://www.youtube.com/@svetski",
      facebook: "https://www.facebook.com/edisher.savitski",
      instagram: "https://www.instagram.com/edisher.savitski",
      linkedin: "https://www.linkedin.com/in/edisher-savitski",
    },
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Media", href: "/media" },
    { label: "Teaching", href: "/teaching" },
    { label: "Contact", href: "/contact" },
  ],

  formspree: {
    endpoint: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "",
  },
};
