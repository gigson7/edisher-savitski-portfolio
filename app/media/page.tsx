import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { VideoGallery } from "@/components/media/VideoGallery";
import { videos } from "@/data/videos";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Photo gallery and video performances of Dr. Edisher Savitski performing at prestigious venues worldwide.",
};

export default function MediaPage() {
  return (
    <>
      {/* Header */}
      <Section background="white" className="!pt-20 !pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primary-800 mb-2">
              Media Gallery
            </h1>
            <p className="text-sm text-primary-600">
              Photos and videos from performances around the world
            </p>
          </div>
        </Container>
      </Section>

      {/* Video Gallery */}
      {videos.length > 0 && (
        <Section background="gray" id="videos" className="!pt-12 sm:!pt-14 !pb-20">
          <Container>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-4">
                Performance Videos
              </h2>
              <p className="text-primary-600">
                Watch performances and masterclasses
              </p>
            </div>
            <VideoGallery videos={videos} />
          </Container>
        </Section>
      )}

      {/* Placeholder if no videos */}
      {videos.length === 0 && (
        <Section background="gray" id="videos">
          <Container>
            <div className="text-center py-12">
              <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-4">
                Performance Videos
              </h2>
              <p className="text-primary-600">
                Video content coming soon. Check back for performances and masterclasses.
              </p>
            </div>
          </Container>
        </Section>
      )}

      {/* Photo Gallery */}
      <Section background="white" id="photos">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-semibold text-primary-800 mb-4">
              Photos
            </h2>
            <p className="text-primary-600">
              Professional photographs from concerts and recitals
            </p>
          </div>
          <PhotoGallery />
        </Container>
      </Section>
    </>
  );
}
