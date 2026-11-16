import { ArrowUpRight } from "lucide-react";
import { validatePerformanceLink } from "@/lib/performance-link";

type PerformanceLinkProps = {
  linkUrl?: string | null;
  linkTitle?: string | null;
};

export function PerformanceLink({ linkUrl, linkTitle }: PerformanceLinkProps) {
  if (!linkUrl || !linkTitle) return null;
  const { values } = validatePerformanceLink(linkUrl, linkTitle);
  if (!values?.linkUrl) return null;

  return (
    <a
      href={values.linkUrl}
      className="mt-5 inline-flex max-w-full items-center gap-2 self-start text-lg font-semibold text-gold-700 underline decoration-gold-300 underline-offset-4 hover:text-gold-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600"
    >
      <span className="min-w-0 wrap-anywhere">{values.linkTitle}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}
