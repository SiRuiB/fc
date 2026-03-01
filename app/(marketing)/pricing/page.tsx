import Link from "next/link";

function PriceCard({
  name,
  price,
  desc,
  items,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  desc: string;
  items: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 space-y-3 ${
        highlight ? "border-neutral-900" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{name}</div>
        {highlight ? (
          <span className="text-xs rounded-full border bg-neutral-900 text-white px-2 py-0.5">
            Recommended
          </span>
        ) : null}
      </div>

      <div className="text-3xl font-semibold">{price}</div>
      <div className="text-sm opacity-75">{desc}</div>

      <ul className="text-sm opacity-80 space-y-2 pt-2">
        {items.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-neutral-900" />
            <span>{x}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2">
        <Link
          href="/contact"
          className={`inline-flex rounded-md border px-4 py-2 text-sm hover:opacity-90 ${
            highlight ? "bg-neutral-900 text-white" : "bg-white"
          }`}
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="text-sm opacity-75 max-w-3xl">
          MVP pricing for investor testing. For now, we run pilots and tailor to team size and data sources.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriceCard
          name="Pilot"
          price="£0–£499"
          desc="Investor demo / short pilot with limited scope."
          items={[
            "Manual ingest (paste policies)",
            "Action cards + risk map",
            "Decision pack generation",
            "Basic audit trail",
          ]}
          cta="Request pilot"
        />

        <PriceCard
          name="Team"
          price="£1,999/mo"
          desc="For compliance + commercial teams who need weekly coverage."
          items={[
            "Role-based access (auth)",
            "Policy log + ingestion workflow",
            "Decision packs with approvals",
            "Supabase database + export",
          ]}
          cta="Talk to sales"
          highlight
        />

        <PriceCard
          name="Enterprise"
          price="Custom"
          desc="For multi-region risk teams with automated sources and integrations."
          items={[
            "Automated ingestion (feeds/APIs)",
            "Custom risk scoring and levers",
            "Slack/email alerts and dashboards",
            "SLA + security review",
          ]}
          cta="Contact us"
        />
      </section>

      <section className="rounded-2xl border bg-white p-6 space-y-2">
        <div className="text-sm font-semibold">Notes</div>
        <div className="text-sm opacity-75 leading-relaxed">
          Pricing is indicative for MVP. Investors care more about workflow clarity and a clear path to paid pilots.
        </div>
      </section>
    </div>
  );
}