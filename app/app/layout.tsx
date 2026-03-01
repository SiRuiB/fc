import Link from "next/link";

const nav = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/action-cards", label: "Action Cards" },
  { href: "/app/decision-packs", label: "Decision Packs" },
  { href: "/app/map", label: "Risk Map" },
  { href: "/app/simulator", label: "Simulator" },
  { href: "/app/policy-log", label: "Ingest" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-white">
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg border flex items-center justify-center font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                }}
              >
                FC
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">Future Commodities</div>
                <div className="text-xs opacity-60 leading-tight">Policy Risk Console</div>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t p-3">
            <div className="rounded-md bg-neutral-50 border p-3">
              <div className="text-xs font-semibold">Demo mode</div>
              <div className="text-xs opacity-70 mt-1">
                Investor view: generated packs, approvals, audit trail.
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Mobile brand */}
                <div className="md:hidden flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg border flex items-center justify-center font-semibold text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                    }}
                  >
                    FC
                  </div>
                  <div className="text-sm font-semibold">Future Commodities</div>
                </div>

                {/* Desktop breadcrumb placeholder */}
                <div className="hidden md:flex items-center gap-2 text-sm opacity-70">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                    }}
                  />
                  <span>Risk workflows · Policy ingest → Decision pack → Approval</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/app/policy-log"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
                  style={{
                    background:
                      "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                  }}
                >
                  + Ingest Policy
                </Link>

                <div className="hidden sm:flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
                  <span className="opacity-80">Live</span>
                </div>
              </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden border-t px-2 py-2 overflow-x-auto">
              <div className="flex gap-2">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md border bg-white px-3 py-1.5 text-sm text-neutral-700 hover:text-orange-600 hover:bg-neutral-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {/* Page container */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-white">
            <div className="mx-auto w-full max-w-6xl px-4 py-3 text-xs opacity-60">
              © {new Date().getFullYear()} Future Commodities · Policy Risk Console MVP
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}