"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site-config";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-10">
      {siteConfig.nav.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-lg font-medium transition-colors hover:text-gold-600",
              isActive
                ? "text-gold-600"
                : "text-neutral-700"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
