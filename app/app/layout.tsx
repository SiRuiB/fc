import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="flex items-center gap-6 p-4">
          <Link href="/app" className="font-semibold">
            Dashboard
          </Link>
          <Link href="/app/action-cards">Action Cards</Link>
          <Link href="/app/map">Risk Map</Link>
          <Link href="/app/simulator">Simulator</Link>
          <Link href="/app/policy-log" className="ml-auto rounded-md border px-3 py-1">
            Ingest
          </Link>
        </nav>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}