import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Policy Agent App",
  description: "Policy impact intelligence for supply chain, commodities, and retail",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <nav className="flex items-center gap-6 p-4">
            <Link href="/" className="font-semibold">
              Policy Agent
            </Link>
            <Link href="/about">About</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
            <div className="ml-auto flex items-center gap-3">
              <Link className="rounded-md border px-3 py-1" href="/app">
                Open Dashboard
              </Link>
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}