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

function PersonaBlock({
  title,
  subtitle,
  pains,
  outcomes,
  ctaHref,
  ctaText,
}: {
  title: string;
  subtitle: string;
  pains: string[];
  outcomes: string[];
  ctaHref: string;
  ctaText: string;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-7 md:p-9">
      <div className="text-base font-semibold text-neutral-900">{title}</div>
      <div className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
        {subtitle}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            What they face
          </div>
          <div className="mt-3 space-y-2 text-sm text-neutral-700">
            {pains.map((p) => (
              <div key={p} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-neutral-300" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            What they get
          </div>
          <div className="mt-3 space-y-2 text-sm text-neutral-700">
            {outcomes.map((o) => (
              <div key={o} className="flex items-start gap-2">
                <span
                  className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                  }}
                />
                <span>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href={ctaHref}
          className="text-sm font-semibold text-neutral-900 hover:opacity-80 transition"
        >
          {ctaText} →
        </Link>
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 15% 10%, rgba(249,115,22,0.16), transparent 60%), radial-gradient(900px 420px at 85% 35%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(900px 420px at 55% 95%, rgba(220,38,38,0.10), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-14 md:px-14 md:py-18">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Compliance</Pill>
            <Pill>Logistics</Pill>
            <Pill>Procurement</Pill>
            <Pill>Category</Pill>
            <Pill>Risk</Pill>
          </div>

          <div className="mt-6 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">
              Solutions for teams that need <GradientText>policy clarity</GradientText> fast.
            </h1>
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-neutral-600">
              Different teams ask different questions. Future Commodities standardizes the answers with structured action
              cards, risk signals, and decision packs, so everyone can align and execute.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
                }}
              >
                Talk to us
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
              >
                View products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="space-y-10">
        <SectionTitle
          eyebrow="How teams use FC"
          title={
            <>
              One workflow, <GradientText>different value</GradientText> for each function
            </>
          }
          desc="Policy risk touches everyone. The fastest teams are the ones who can convert updates into decisions with clear owners and evidence."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Shared language</div>
            <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
              Action cards standardize the fields that matter: scope, effective date, levers, severity, confidence, and
              evidence. This replaces endless back and forth and prevents missed applicability.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">Shared output</div>
            <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
              Decision packs become the one artifact everyone signs off on. They include assumptions, mitigations,
              owners, and an approval checklist, making policy response measurable and auditable.
            </p>
          </div>
        </div>
      </section>

      {/* Persona blocks */}
      <section className="space-y-8">
        <PersonaBlock
          title="Compliance & Trade teams"
          subtitle="Stay ahead of enforcement, documentation requirements, and jurisdiction-specific rules without drowning in PDFs."
          pains={[
            "Fragmented sources across customs, ministries, and regulators",
            "Hard to evaluate scope and applicability across HS codes",
            "Escalations lack evidence, confidence, and clear owners",
          ]}
          outcomes={[
            "Structured extraction with evidence quotes and confidence scoring",
            "Clear next steps and ownership for remediation and filing",
            "Decision packs for sign-off with audit trail",
          ]}
          ctaHref="/app/action-cards"
          ctaText="See action cards"
        />

        <PersonaBlock
          title="Logistics & Operations"
          subtitle="Understand what changes do to routing, lead time, documentation, and capacity before it hits the warehouse."
          pains={[
            "Lead time risk surfaces too late, after inventory is already locked",
            "Route constraints and carrier rules change faster than SOPs",
            "Operational impact gets lost in regulatory language",
          ]}
          outcomes={[
            "Impact levers translate policy into lead time and routing risk",
            "Country map helps triage where to dig deeper",
            "Decision packs capture mitigations and deadlines",
          ]}
          ctaHref="/app/map"
          ctaText="Explore risk map"
        />

        <PersonaBlock
          title="Procurement & Sourcing"
          subtitle="Quantify cost and availability impact, then adapt suppliers, terms, and buffer inventory with confidence."
          pains={[
            "Cost shocks from duty, VAT, or compliance upgrades are hard to model quickly",
            "Supplier terms do not reflect changing regulatory burden",
            "Lack of structured evidence for renegotiation",
          ]}
          outcomes={[
            "Structured levers connect policy to landed cost and compliance effort",
            "Evidence-backed action cards support supplier conversations",
            "Decision packs define mitigation plans and owners",
          ]}
          ctaHref="/app/decision-packs"
          ctaText="View decision packs"
        />

        <PersonaBlock
          title="Category & Commercial teams"
          subtitle="Protect margin by linking policy change to pricing, assortment, and availability decisions."
          pains={[
            "Margin compression appears as a surprise after import and warehousing",
            "Assortment decisions are made without updated risk signals",
            "No single narrative to align commercial and risk stakeholders",
          ]}
          outcomes={[
            "Decision-ready memo for commercial trade-offs",
            "Clear severity and confidence to prioritize actions",
            "Cross-functional owner tracking and approvals",
          ]}
          ctaHref="/products"
          ctaText="See the product modules"
        />
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(249,115,22,0.12), transparent 60%), radial-gradient(900px 420px at 80% 100%, rgba(220,38,38,0.10), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Next step
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              Tell us your categories, HS codes, and routes. We will map policy risk to your workflow.
            </div>
            <div className="mt-2 text-base md:text-lg text-neutral-600">
              Start manual today. Add automation when you are ready.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
              }}
            >
              Contact sales
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
            >
              Open console
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}