export default function DashboardHome() {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold">Policy Impact OS</h1>
      <p className="opacity-80">
        Ingest policy updates, let an AI agent extract structured fields, then compute
        impact on supply chain, commodities, and retail.
      </p>
      <div className="rounded-lg border p-4 text-sm opacity-80">
        MVP flow: Ingest → Parse → Action Cards → Country Risk Map → Scenario Simulator → Automation
      </div>
    </div>
  );
}