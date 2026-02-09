export interface BiographySection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  source: string;
  performance?: string | null;
}

export interface Biography {
  shortBio: string;
  fullBio: string;
  sections: BiographySection[];
  highlights: string[];
  venues: {
    usa: string[];
    europe: string[];
    asia: string[];
    other: string[];
  };
  testimonials: Testimonial[];
}

export type PerformanceType = "solo" | "chamber" | "orchestra" | "masterclass";

export interface Performance {
  id: string;
  date: string; // ISO 8601 format
  type: PerformanceType;
  title: string;
  venue: string;
  location: string;
  country: string;
  organization?: string;
  collaborators?: string[];
  repertoire?: string[];
  isPast: boolean;
  isFeatured?: boolean;
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description?: string;
  performanceDate?: string;
  venue?: string;
  repertoire: string[];
  thumbnail?: string;
  featured?: boolean;
}

export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
  contact: {
    email: string;
    phone?: string;
    social: {
      youtube?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  nav: Array<{
    label: string;
    href: string;
  }>;
  formspree: {
    endpoint: string;
  };
}
