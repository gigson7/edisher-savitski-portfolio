"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
} from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { updateBiography } from "@/app/(admin)/admin/biography/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type BioSection = {
  id: string;
  title: string;
  content: Record<string, unknown>;
};

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  source: string;
};

type Venues = {
  usa: string[];
  europe: string[];
  asia: string[];
  other: string[];
};

type Props = {
  shortBio: string;
  fullBio: Record<string, unknown>;
  sections: BioSection[];
  highlights: string[];
  venues: Venues;
  testimonials: Testimonial[];
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function emptyDoc(): Record<string, unknown> {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      {children}
    </div>
  );
}

function SectionTitle({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4">
      <h2
        className="text-xl font-bold text-neutral-900"
        style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
        }}
      >
        {title}
      </h2>
      {sub && <p className="text-sm text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BiographyForm(props: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Fields
  const [shortBio, setShortBio] = useState(props.shortBio);
  const [fullBio, setFullBio] = useState<Record<string, unknown>>(
    props.fullBio
  );
  const [sections, setSections] = useState<BioSection[]>(props.sections);
  const [highlights, setHighlights] = useState<string[]>(props.highlights);
  const [venues, setVenues] = useState<Venues>(props.venues);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    props.testimonials
  );

  // ── Highlights ─────────────────────────────────────────────────────────────
  const [highlightInput, setHighlightInput] = useState("");

  function addHighlight() {
    const v = highlightInput.trim();
    if (v && !highlights.includes(v)) {
      setHighlights((prev) => [...prev, v]);
    }
    setHighlightInput("");
  }

  function removeHighlight(idx: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Venues ─────────────────────────────────────────────────────────────────
  const [venueInputs, setVenueInputs] = useState<Record<keyof Venues, string>>(
    { usa: "", europe: "", asia: "", other: "" }
  );

  function addVenue(region: keyof Venues) {
    const v = venueInputs[region].trim();
    if (v) {
      setVenues((prev) => ({
        ...prev,
        [region]: [...prev[region], v],
      }));
      setVenueInputs((prev) => ({ ...prev, [region]: "" }));
    }
  }

  function removeVenue(region: keyof Venues, idx: number) {
    setVenues((prev) => ({
      ...prev,
      [region]: prev[region].filter((_, i) => i !== idx),
    }));
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  function addSection() {
    setSections((prev) => [
      ...prev,
      { id: uid(), title: "", content: emptyDoc() },
    ]);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSectionTitle(id: string, title: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  }

  function updateSectionContent(id: string, content: Record<string, unknown>) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
  }

  // ── Testimonials ───────────────────────────────────────────────────────────
  function addTestimonial() {
    setTestimonials((prev) => [
      ...prev,
      { id: uid(), quote: "", author: "", source: "" },
    ]);
  }

  function removeTestimonial(id: string) {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTestimonial(
    id: string,
    field: keyof Omit<Testimonial, "id">,
    value: string
  ) {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  function handleSave() {
    const formData = new FormData();
    formData.set("shortBio", shortBio);
    formData.set("fullBio", JSON.stringify(fullBio));
    formData.set("sections", JSON.stringify(sections));
    formData.set("highlights", JSON.stringify(highlights));
    formData.set("venues", JSON.stringify(venues));
    formData.set("testimonials", JSON.stringify(testimonials));

    startTransition(async () => {
      await updateBiography(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const venueRegions: { key: keyof Venues; label: string }[] = [
    { key: "usa", label: "USA" },
    { key: "europe", label: "Europe" },
    { key: "asia", label: "Asia" },
    { key: "other", label: "Other" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Sticky Save Bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-neutral-50/90 backdrop-blur-sm border-b border-neutral-200 -mx-6 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#8d7336" }}
          >
            {isPending ? "Saving…" : "Save All Changes"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Saved successfully
            </span>
          )}
        </div>
      </div>

      {/* ── Short Bio ───────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Short Bio"
          sub="Displayed on the homepage. Plain text only."
        />
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336] resize-y"
          placeholder="Brief biographical summary…"
        />
      </SectionCard>

      {/* ── Full Bio ────────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Full Biography"
          sub="Displayed on the About page. Supports rich formatting."
        />
        <RichTextEditor content={fullBio} onChange={setFullBio} />
      </SectionCard>

      {/* ── Biography Sections ──────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Biography Sections"
          sub="Additional named sections for the About page."
        />
        <div className="space-y-4">
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="border border-neutral-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <GripVertical className="w-4 h-4 text-neutral-300 shrink-0" />
                <input
                  type="text"
                  value={sec.title}
                  onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                  placeholder="Section title…"
                  className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
                />
                <button
                  type="button"
                  onClick={() => removeSection(sec.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <RichTextEditor
                content={sec.content}
                onChange={(json) => updateSectionContent(sec.id, json)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSection}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </SectionCard>

      {/* ── Career Highlights ───────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Career Highlights"
          sub="Notable achievements and accolades."
        />
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addHighlight();
              }
            }}
            placeholder="Add a highlight…"
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
          />
          <button
            type="button"
            onClick={addHighlight}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gold-600 hover:text-gold-700 border border-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {highlights.length > 0 && (
          <ul className="space-y-1.5">
            {highlights.map((h, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-neutral-50 rounded-lg text-sm text-neutral-700"
              >
                <span>{h}</span>
                <button
                  type="button"
                  onClick={() => removeHighlight(idx)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* ── Performance Venues ──────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Performance Venues"
          sub="Notable venues grouped by region."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {venueRegions.map(({ key, label }) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">
                {label}
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={venueInputs[key]}
                  onChange={(e) =>
                    setVenueInputs((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addVenue(key);
                    }
                  }}
                  placeholder={`Add ${label} venue…`}
                  className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
                />
                <button
                  type="button"
                  onClick={() => addVenue(key)}
                  className="p-1.5 text-gold-600 hover:text-gold-700 border border-neutral-200 rounded-lg transition-colors"
                  title="Add venue"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {venues[key].length > 0 && (
                <ul className="space-y-1">
                  {venues[key].map((v, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-sm text-neutral-700"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => removeVenue(key, idx)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle
          title="Testimonials"
          sub="Quotes and praise from critics, colleagues, and audiences."
        />
        <div className="space-y-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="border border-neutral-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Testimonial
                </span>
                <button
                  type="button"
                  onClick={() => removeTestimonial(t.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Remove testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={t.quote}
                onChange={(e) =>
                  updateTestimonial(t.id, "quote", e.target.value)
                }
                rows={3}
                placeholder="Quote…"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336] resize-y"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={t.author}
                  onChange={(e) =>
                    updateTestimonial(t.id, "author", e.target.value)
                  }
                  placeholder="Author…"
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
                />
                <input
                  type="text"
                  value={t.source}
                  onChange={(e) =>
                    updateTestimonial(t.id, "source", e.target.value)
                  }
                  placeholder="Source (publication, institution…)"
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addTestimonial}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:text-gold-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </SectionCard>
    </div>
  );
}
