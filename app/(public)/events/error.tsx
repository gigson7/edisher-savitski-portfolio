"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route: "/events" },
      contexts: {
        nextjs: {
          digest: error.digest ?? null,
        },
      },
    });
  }, [error]);

  return (
    <section className="py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-primary-800 mb-4">
          Something went wrong loading events
        </h1>
        <p className="text-primary-600 mb-8">
          We&apos;ve been notified and are looking into it. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary-800 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
