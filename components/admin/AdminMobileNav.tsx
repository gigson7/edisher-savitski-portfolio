"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { adminNavItems, isAdminNavActive } from "@/lib/admin-nav";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      {/* Hamburger button — only visible below lg */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden -ml-2 p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-neutral-900 z-50 flex flex-col transform transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* Brand + Close */}
        <div className="px-5 py-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold leading-tight"
              style={{
                fontFamily:
                  "var(--font-cormorant), 'Cormorant Garamond', serif",
                color: "#8d7336",
              }}
            >
              Edisher Savitski
            </h1>
            <p className="text-[10px] text-neutral-500 mt-0.5 tracking-wide uppercase">
              Admin Panel
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNavItems.map(({ href, label, icon: Icon, exact }) => {
            const active = isAdminNavActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: "rgba(141, 115, 54, 0.15)",
                        color: "#c4a35a",
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-5 h-5 flex-shrink-0"
                  style={active ? { color: "#8d7336" } : undefined}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-neutral-800">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              Log Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
