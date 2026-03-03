import "./globals.css";

export const metadata = {
  title: "Future Commodities",
  description: "Policy risk console for supply chain, commodities, and retail",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">{children}</body>
    </html>
  );
}