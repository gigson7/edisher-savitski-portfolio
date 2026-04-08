"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminNavItems, isAdminNavActive } from "@/lib/admin-nav";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 min-h-screen bg-neutral-900 flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-neutral-800">
        <h1
          className="text-xl font-bold leading-tight"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            color: "#8d7336",
          }}
        >
          Edisher Savitski
        </h1>
        <p className="text-xs text-neutral-500 mt-1 tracking-wide uppercase">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNavItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isAdminNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
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
                className="w-4 h-4 flex-shrink-0"
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
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
