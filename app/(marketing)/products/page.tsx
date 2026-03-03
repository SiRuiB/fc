import Link from "next/link";

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background:
          "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-700">
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  desc?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {desc ? <p className="mt-3 text-base md:text-lg text-neutral-600">{desc}</p> : null}
    </div>
  );
}

function Feature({
  title,
  desc,
  bullets,
}: {
  title: string;
  desc: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-7">
      <div className="text-base font-semibold text-neutral-900">{title}</div>
      <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">{desc}</p>
      <div className="mt-5 space-y-2 text-sm text-neutral-700">
        {bullets.map((b) => (
          <div key={b} className="flex items-start gap-2">
            <span
              className="mt-1 inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </div>
      <div className="mt-1 text-sm text-neutral-600">{label}</div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 15% 10%, rgba(249,115,22,0.18), transparent 60%), radial-gradient(900px 420px at 85% 35%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(900px 420px at 55% 95%, rgba(220,38,38,0.12), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-14 md:px-14 md:py-18">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Action Cards</Pill>
            <Pill>Risk Map</Pill>
            <Pill>Decision Packs</Pill>
            <Pill>Audit-ready</Pill>
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">
              Products that turn policy text into <GradientText>operational decisions</GradientText>.
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-neutral-600">
              Future Commodities is a policy risk workflow. It ingests updates, extracts structured impact,
              and produces decision-grade artifacts your teams can execute, share, and audit.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                }}
              >
                Open Console
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
              >
                Request demo
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <MiniStat label="From update to card" value="Minutes" />
              <MiniStat label="Evidence and lineage" value="Traceable" />
              <MiniStat label="Cross-team output" value="Standardized" />
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="space-y-10">
        <SectionTitle
          eyebrow="Core modules"
          title={
            <>
              Three building blocks for a <GradientText>policy risk system</GradientText>
            </>
          }
          desc="Each module is useful alone. Together, they form a workflow from ingestion to approval."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Feature
            title="Action Cards"
            desc="Convert raw text into structured impact. Action cards capture what changed, who is impacted, and what to do next, with evidence and confidence."
            bullets={[
              "Scope, applicability, HS codes, and effective dates",
              "Impact levers: cost, lead time, compliance, availability",
              "Suggested owner, next actions, and evidence quotes",
            ]}
          />
          <Feature
            title="Risk Map"
            desc="Triage globally. The map aggregates recent updates into a clear heatmap, with top cards and evidence to support fast decisions."
            bullets={[
              "Jurisdiction heatmap with risk level and recency",
              "Hover to see top updates, severity, and evidence",
              "Designed for daily monitoring and escalation",
            ]}
          />
          <Feature
            title="Decision Packs"
            desc="Create executive-ready outputs. Decision packs turn cards into a single memo with assumptions, mitigation paths, owners, and an approval checklist."
            bullets={[
              "Decision summary with quantified downside",
              "Owners, deadlines, and approval workflow",
              "Audit trail: sources, extraction, and edits",
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/app/action-cards"
            className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 transition"
          >
            <div className="text-sm font-semibold text-neutral-900">Explore Action Cards →</div>
            <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
              View structured cards, severity, confidence, and evidence.
            </div>
          </Link>

          <Link
            href="/app/map"
            className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 transition"
          >
            <div className="text-sm font-semibold text-neutral-900">Explore Risk Map →</div>
            <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Triage by country and drill into top updates.
            </div>
          </Link>

          <Link
            href="/app/decision-packs"
            className="rounded-2xl border border-neutral-200 bg-white p-6 hover:bg-neutral-50 transition"
          >
            <div className="text-sm font-semibold text-neutral-900">Explore Decision Packs →</div>
            <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Generate decision-ready memos with owners and approvals.
            </div>
          </Link>
        </div>
      </section>

      {/* Workflow */}
      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 md:p-12 space-y-10">
        <SectionTitle
          eyebrow="Workflow"
          title="Designed to scale from manual to automated"
          desc="Start with manual ingest for MVP. When the schema is stable, plug in scrapers and an extraction agent without changing what users see."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-semibold text-neutral-900">1. Ingest</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Capture the policy once with source, jurisdiction, dates, and raw text or PDF. Add tags like HS codes,
              product family, routes, and supplier exposure.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">2. Extract</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Convert text into structured fields and impact levers. Attach quotes as evidence and score severity and
              confidence for triage.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">3. Decide</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Generate decision packs and route to owners for approval. Track mitigations and open questions, and push
              risk signals to dashboards and alerts.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
          <div className="text-sm font-semibold text-neutral-900">Automation roadmap</div>
          <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">
            Manual ingest is not a compromise. It defines the schema and surfaces edge cases. Once stable, ingestion
            becomes a collector, extraction becomes an agent, and review becomes a publishing workflow, all without
            rebuilding the product.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(249,115,22,0.14), transparent 60%), radial-gradient(900px 420px at 80% 100%, rgba(220,38,38,0.10), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Get started
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              Build a policy risk workflow your team can run daily.
            </div>
            <div className="mt-2 text-base md:text-lg text-neutral-600">
              Explore the console or talk to us about sources and coverage.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            >
              Open Console
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
            >
              Request demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}