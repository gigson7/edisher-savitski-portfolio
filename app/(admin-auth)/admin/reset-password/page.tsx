"use client";

import { Suspense, useActionState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "./actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/admin/login?reset=success");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold text-gold-600"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter and confirm your new password below.
          </p>
        </div>

        {/* Success message */}
        {state?.success && (
          <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
            Password reset successfully. Redirecting to login…
          </div>
        )}

        {/* Error message */}
        {state?.error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            {state.error}
          </div>
        )}

        {/* Missing token warning */}
        {!token && !state?.success && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
            No reset token found. Please use the link from your email.
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-5">
            {/* Hidden token field */}
            <input type="hidden" name="token" value={token} />

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
                placeholder="Repeat your new password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !token}
              className="w-full rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isPending ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-gold-600 hover:text-gold-700 hover:underline transition"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-400 text-sm">Loading…</div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
