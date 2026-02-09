"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Navigation } from "./Navigation";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-neutral-50">
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide"
            style={{ color: '#8d7336' }}
          >
            {siteConfig.name}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-neutral-700 hover:text-gold-600 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-6">
            <nav className="flex flex-col space-y-4">
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
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
