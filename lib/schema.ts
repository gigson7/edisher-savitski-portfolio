import { Performance } from "@/types";
import { siteConfig } from "@/data/site-config";

/**
 * Generate Person schema (JSON-LD) for musician
 */
export function generatePersonSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}/#person`,
    name: "Dr. Edisher Savitski",
    givenName: "Edisher",
    familyName: "Savitski",
    honorificPrefix: "Dr.",
    jobTitle: "Associate Professor of Piano",
    description: siteConfig.description,
    url: url,
    image: `${url}/images/hero/hero-main.webp`,
    email: siteConfig.contact.email,
    sameAs: [
      siteConfig.contact.social.youtube,
      siteConfig.contact.social.linkedin,
      siteConfig.contact.social.instagram,
      siteConfig.contact.social.facebook,
    ].filter(Boolean),
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "Michigan State University",
        description: "Doctor of Musical Arts",
      },
      {
        "@type": "EducationalOrganization",
        name: "Indiana University South Bend",
        description: "Master of Music, Artist Diploma",
      },
      {
        "@type": "EducationalOrganization",
        name: "Tbilisi State Conservatory",
      },
    ],
    affiliation: {
      "@type": "EducationalOrganization",
      name: "University of Alabama School of Music",
      url: "https://music.ua.edu",
    },
    award: [
      "First Prize - Third International Piano-E-Competition (2006)",
      "First Prize - Hilton Head International Piano Competition (2001)",
      "First Prize - Sacramento International Piano Competition",
      "First Prize - Wideman International Piano Competition",
      "Yamaha Artist",
    ],
    performerIn: [
      {
        "@type": "Place",
        name: "Carnegie Hall",
      },
      {
        "@type": "Place",
        name: "Wigmore Hall",
      },
      {
        "@type": "Place",
        name: "Teatro alla Scala",
      },
    ],
  };
}

/**
 * Generate WebSite schema (JSON-LD)
 */
export function generateWebsiteSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dr. Edisher Savitski",
    url: url,
    description: "Official website of concert pianist Dr. Edisher Savitski",
    publisher: {
      "@type": "Person",
      "@id": `${url}/#person`,
    },
  };
}

/**
 * Generate MusicEvent schema (JSON-LD) for a performance
 */
export function generateMusicEventSchema(
  performance: Performance,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: performance.title,
    startDate: performance.date,
    location: {
      "@type": "Place",
      name: performance.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: performance.location,
        addressCountry: performance.country,
      },
    },
    performer: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
    },
    eventStatus: performance.isPast
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(performance.organization && {
      organizer: {
        "@type": "Organization",
        name: performance.organization,
      },
    }),
  };
}

/**
 * Generate Organization schema (JSON-LD) for University affiliation
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "University of Alabama School of Music",
    employee: {
      "@type": "Person",
      name: "Dr. Edisher Savitski",
      jobTitle: "Associate Professor of Piano",
    },
  };
}

/**
 * Generate BreadcrumbList schema (JSON-LD) for navigation
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
