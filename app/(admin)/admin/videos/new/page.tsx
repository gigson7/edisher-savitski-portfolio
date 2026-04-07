import { VideoForm } from "@/components/admin/VideoForm";
import { createVideo } from "../actions";

export default function NewVideoPage() {
  return (
    <div>
      <h1
        className="font-bold text-3xl text-neutral-800 mb-8"
        style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
        }}
      >
        Add Video
      </h1>
      <VideoForm action={createVideo} />
    </div>
  );
}
