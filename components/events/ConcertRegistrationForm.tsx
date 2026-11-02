"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ArrowRight, LoaderCircle } from "lucide-react";
import { concert, registrationIsClosed } from "@/data/concert";

export function ConcertRegistrationForm({ enabled, initiallyClosed }: { enabled: boolean; initiallyClosed: boolean }) {
  const [closed, setClosed] = useState(initiallyClosed);
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");
  const [error, setError] = useState("");
  const messageRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);

  useEffect(() => {
    const update = () => setClosed(registrationIsClosed());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "success" || error) messageRef.current?.focus();
  }, [status, error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("pending");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await fetch("/api/concert-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"), lastName: form.get("lastName"),
          email: form.get("email"), consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await result.json();
      if (!result.ok || data.success !== true) {
        if (result.status === 410) setClosed(true);
        throw new Error(typeof data.error === "string" ? data.error : "We could not save your registration. Please try again.");
      }
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : "We could not confirm your registration. Please check your connection and try again.");
    } finally {
      submitting.current = false;
    }
  }

  const inputClass = "mt-1.5 w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-lg text-neutral-900 outline-none transition focus:border-gold-600 focus:ring-2 focus:ring-gold-200 disabled:opacity-60";

  return (
    <section id="register" aria-labelledby="registration-heading" className="sentry-block scroll-mt-28 border-t border-gold-200 pt-7" data-private>
      {status === "success" ? (
        <div ref={messageRef} tabIndex={-1} role="status" className="rounded-lg bg-gold-50 p-6 outline-none focus-visible:ring-2 focus-visible:ring-gold-600">
          <Check className="mb-3 h-7 w-7 text-gold-700" aria-hidden="true" />
          <h2 id="registration-heading" className="mb-2 text-3xl">Thank you for registering</h2>
          <p className="!mb-2 text-lg text-neutral-700">Your details have been saved for this recital.</p>
          <p className="!mb-0 text-lg text-neutral-700">Yamaha will email your entry QR code. {concert.qrNotice}</p>
        </div>
      ) : closed ? (
        <div role="status">
          <h2 id="registration-heading" className="mb-2 text-3xl">Registration has closed</h2>
          <p className="!mb-0 text-lg text-neutral-600">Registration ended on November 22, 2026, at 11:59 PM New York time.</p>
        </div>
      ) : !enabled ? (
        <div role="status">
          <h2 id="registration-heading" className="mb-2 text-3xl">Concert registration</h2>
          <p className="!mb-0 text-lg text-neutral-600">Registration is currently unavailable. Please check back soon.</p>
        </div>
      ) : (
        <>
          <h2 id="registration-heading" className="mb-1 text-3xl">Register to attend</h2>
          <p className="!mb-5 text-lg text-neutral-600">Leave your details to receive your entry QR code from Yamaha.</p>
          <form onSubmit={submit} aria-busy={status === "pending"}>
            <fieldset disabled={status === "pending"} className="space-y-4">
              <legend className="sr-only">Your registration details — all fields are required</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-lg text-neutral-800" htmlFor="concert-first-name">First name
                  <input id="concert-first-name" name="firstName" autoComplete="given-name" required maxLength={100} className={inputClass} />
                </label>
                <label className="block text-lg text-neutral-800" htmlFor="concert-last-name">Last name
                  <input id="concert-last-name" name="lastName" autoComplete="family-name" required maxLength={100} className={inputClass} />
                </label>
              </div>
              <label className="block text-lg text-neutral-800" htmlFor="concert-email">Email address
                <input id="concert-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} className={inputClass} aria-describedby="concert-email-help" />
              </label>
              <p id="concert-email-help" className="!mb-0 text-base text-neutral-600">Please use the email where you would like to receive your QR code.</p>
              <div hidden aria-hidden="true">
                <label htmlFor="concert-website">Leave this field empty</label>
                <input id="concert-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <label className="flex cursor-pointer items-start gap-3 py-1 text-base leading-relaxed text-neutral-700">
                <input name="consent" type="checkbox" required className="mt-1.5 h-4 w-4 shrink-0 accent-gold-700" />
                <span>I agree that my name and email address will be collected and shared with Yamaha solely to arrange admission to this concert.</span>
              </label>
              <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-3 rounded bg-gold-700 px-6 py-3 text-lg font-semibold text-white transition hover:bg-gold-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600 disabled:opacity-60">
                {status === "pending" ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving your registration…</> : <>Register for the recital <ArrowRight className="h-4 w-4" aria-hidden="true" /></>}
              </button>
            </fieldset>
            {error && <div ref={messageRef} role="alert" tabIndex={-1} className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-base text-red-800 outline-none">{error}</div>}
            <p className="!mb-0 mt-3 text-center text-base text-neutral-500">Registration closes November 22 at 11:59 PM, New York time.</p>
          </form>
        </>
      )}
    </section>
  );
}
