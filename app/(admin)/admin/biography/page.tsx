import { prisma } from "@/lib/prisma";
import { BiographyForm } from "@/components/admin/BiographyForm";

export const dynamic = "force-dynamic";

const DEFAULT_BIO = {
  shortBio: "",
  fullBio: { type: "doc", content: [{ type: "paragraph" }] } as Record<
    string,
    unknown
  >,
  sections: [] as {
    id: string;
    title: string;
    content: Record<string, unknown>;
  }[],
  highlights: [] as string[],
  venues: { usa: [], europe: [], asia: [], other: [] } as {
    usa: string[];
    europe: string[];
    asia: string[];
    other: string[];
  },
  testimonials: [] as {
    id: string;
    quote: string;
    author: string;
    source: string;
  }[],
};

export default async function BiographyAdminPage() {
  let bio = DEFAULT_BIO;

  try {
    const record = await prisma.biography.findFirst({
      orderBy: { id: "asc" },
    });

    if (record) {
      bio = {
        shortBio: record.shortBio,
        fullBio: JSON.parse(JSON.stringify(record.fullBio)) as Record<
          string,
          unknown
        >,
        sections: JSON.parse(
          JSON.stringify(record.sections)
        ) as typeof DEFAULT_BIO.sections,
        highlights: JSON.parse(
          JSON.stringify(record.highlights)
        ) as string[],
        venues: JSON.parse(
          JSON.stringify(record.venues)
        ) as typeof DEFAULT_BIO.venues,
        testimonials: JSON.parse(
          JSON.stringify(record.testimonials)
        ) as typeof DEFAULT_BIO.testimonials,
      };
    }
  } catch {
    // DB not available during build/preview — use defaults
  }

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-neutral-900"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
          }}
        >
          Biography
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage biography content displayed across the site.
        </p>
      </div>

      <BiographyForm
        shortBio={bio.shortBio}
        fullBio={bio.fullBio}
        sections={bio.sections}
        highlights={bio.highlights}
        venues={bio.venues}
        testimonials={bio.testimonials}
      />
    </div>
  );
}
