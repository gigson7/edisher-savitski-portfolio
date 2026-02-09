"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/site-config";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!siteConfig.formspree.endpoint) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(siteConfig.formspree.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
          Name *
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: "Name is required" })}
          className="w-full px-4 py-3 border border-neutral-300 rounded text-neutral-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className="w-full px-4 py-3 border border-neutral-300 rounded text-neutral-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="your.email@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-primary-700 mb-2">
          Subject *
        </label>
        <input
          id="subject"
          type="text"
          {...register("subject", { required: "Subject is required" })}
          className="w-full px-4 py-3 border border-neutral-300 rounded text-neutral-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="Inquiry subject"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-primary-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          rows={6}
          {...register("message", { required: "Message is required" })}
          className="w-full px-4 py-3 border border-neutral-300 rounded text-neutral-800 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
          placeholder="Your message..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !siteConfig.formspree.endpoint}
        size="lg"
        className="w-full"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {!siteConfig.formspree.endpoint && (
        <p className="text-sm text-amber-600 text-center">
          Contact form is not configured yet. Please use the email address below.
        </p>
      )}

      {submitStatus === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          <p className="font-medium">Thank you for your message!</p>
          <p className="text-sm mt-1">I'll get back to you soon.</p>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Something went wrong.</p>
          <p className="text-sm mt-1">
            Please try again or email directly at {siteConfig.contact.email}
          </p>
        </div>
      )}
    </form>
  );
}
