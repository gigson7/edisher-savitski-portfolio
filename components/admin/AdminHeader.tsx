import { getSession } from "@/lib/auth";
import { AdminMobileNav } from "./AdminMobileNav";

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-4 sm:px-6">
      <div className="flex items-center justify-between w-full gap-3">
        {/* Mobile menu button (hidden on lg+) + brand on mobile */}
        <div className="flex items-center gap-2 min-w-0">
          <AdminMobileNav />
          <span
            className="lg:hidden text-base font-bold truncate"
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              color: "#8d7336",
            }}
          >
            Admin
          </span>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="hidden sm:inline text-sm text-neutral-600 truncate max-w-[200px]">
            {session?.email}
          </span>
          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-neutral-600">
              {session?.email?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
