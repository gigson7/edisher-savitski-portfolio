"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";

type ActionState = { error?: string } | null;

type VideoData = {
  id: number;
  title: string;
  youtubeId: string;
  performanceDate?: string | null;
  venue?: string | null;
  description?: string | null;
  repertoire: string[];
  isFeatured: boolean;
};

type Props = {
  video?: VideoData;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const parseYoutubeId = (input: string): string => {
  const match = input.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/
  );
  return match ? match[1] : input;
};

function TagList({
  name,
  label,
  initialItems,
}: {
  name: string;
  label: string;
  initialItems: string[];
}) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addItem() {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems((prev) => [...prev, trimmed]);
    }
    setInputValue("");
    inputRef.current?.focus();
  }

  function removeItem(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Add ${label.toLowerCase()}…`}
          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          Add
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-sm text-neutral-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors leading-none"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoForm({ video, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [youtubeInput, setYoutubeInput] = useState(video?.youtubeId ?? "");

  const isEdit = !!video;
  const previewId = parseYoutubeId(youtubeInput);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-8 max-w-3xl shadow-sm">
      {state?.error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title — full width */}
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={video?.title ?? ""}
              placeholder="Video title"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* YouTube URL or ID — full width */}
          <div className="md:col-span-2">
            <label
              htmlFor="youtubeId"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              YouTube URL or Video ID <span className="text-red-500">*</span>
            </label>
            <input
              id="youtubeId"
              name="youtubeId"
              type="text"
              required
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(parseYoutubeId(e.target.value))}
              placeholder="https://youtube.com/watch?v=... or video ID"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
            {previewId && (
              <div className="mt-3 aspect-video max-w-sm rounded-lg overflow-hidden border border-neutral-200">
                <iframe
                  src={`https://www.youtube.com/embed/${previewId}`}
                  title="YouTube preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Performance Date */}
          <div>
            <label
              htmlFor="performanceDate"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Performance Date
            </label>
            <input
              id="performanceDate"
              name="performanceDate"
              type="text"
              defaultValue={video?.performanceDate ?? ""}
              placeholder="e.g. March 2024"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="venue"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Venue
            </label>
            <input
              id="venue"
              name="venue"
              type="text"
              defaultValue={video?.venue ?? ""}
              placeholder="Concert hall or venue name"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336]"
            />
          </div>

          {/* Description — full width */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={video?.description ?? ""}
              placeholder="Brief description of the video…"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#8d7336] resize-none"
            />
          </div>

          {/* Repertoire */}
          <TagList
            name="repertoire"
            label="Repertoire"
            initialItems={video?.repertoire ?? []}
          />

          {/* Featured */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={video?.isFeatured ?? false}
              className="w-4 h-4 rounded border-neutral-300 accent-[#8d7336]"
            />
            <label
              htmlFor="isFeatured"
              className="text-sm text-neutral-700 cursor-pointer select-none"
            >
              Featured video (shown on homepage)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#8d7336" }}
          >
            {isPending ? "Saving…" : isEdit ? "Update Video" : "Create Video"}
          </button>
          <Link
            href="/admin/videos"
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
