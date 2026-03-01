import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg border flex items-center justify-center font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            >
              FC
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Future Commodities</div>
              <div className="text-xs opacity-60">Policy Risk Console</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/about">
              About
            </Link>
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            >
              Open Console
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-2 flex gap-2 overflow-x-auto">
            <Link className="rounded-md border bg-white px-3 py-1.5 text-sm text-neutral-700 hover:text-orange-600 hover:bg-neutral-50 transition-colors" href="/about">
              About
            </Link>
            <Link className="rounded-md border bg-white px-3 py-1.5 text-sm text-neutral-700 hover:text-orange-600 hover:bg-neutral-50 transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="rounded-md border bg-white px-3 py-1.5 text-sm text-neutral-700 hover:text-orange-600 hover:bg-neutral-50 transition-colors" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs opacity-70 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Future Commodities</div>
          <div className="flex gap-4">
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/about">
              About
            </Link>
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/pricing">
              Pricing
            </Link>
            <Link className="text-neutral-700 hover:text-orange-600 transition-colors" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}