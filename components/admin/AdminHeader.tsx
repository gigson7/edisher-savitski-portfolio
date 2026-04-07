import { getSession } from "@/lib/auth";

export async function AdminHeader() {
  const session = await getSession();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div />
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">{session?.email}</span>
          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-600">
              {session?.email?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
