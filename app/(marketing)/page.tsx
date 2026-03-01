import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border bg-white p-10 md:p-14">
        {/* soft gradient wash */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 20% 10%, rgba(249,115,22,0.18), transparent 45%), radial-gradient(circle at 80% 30%, rgba(245,158,11,0.18), transparent 45%), radial-gradient(circle at 50% 90%, rgba(220,38,38,0.12), transparent 55%)",
          }}
        />

        <div className="relative max-w-3xl space-y-5">
          <div
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(249,115,22,0.08)" }}
          >
            Policy ingest → Action cards → Decision pack → Approval
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Policy risk, converted into{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              decision-ready workflow
            </span>
          </h1>

          <p className="text-lg opacity-80 leading-relaxed">
            Future Commodities helps compliance and commercial teams transform policy updates into operational impact,
            quantified risk, and investor-ready decision packs with audit trail.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/app"
              className="rounded-md px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            >
              Open Console
            </Link>

            <Link
              href="/pricing"
              className="rounded-md border bg-white px-5 py-2.5 text-sm hover:bg-neutral-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Action Cards",
            desc: "Extract what changed, why it matters, HS codes, risk level, confidence, and next actions.",
          },
          {
            title: "Risk Map",
            desc: "Country heatmap with top action cards and evidence for fast triage.",
          },
          {
            title: "Decision Packs",
            desc: "Executive memo format with levers, owners, approvals, and audit trail.",
          },
        ].map((x) => (
          <div key={x.title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">{x.title}</div>
            <div className="text-sm opacity-75 leading-relaxed mt-2">{x.desc}</div>
          </div>
        ))}
      </section>
    </div>
  );
}