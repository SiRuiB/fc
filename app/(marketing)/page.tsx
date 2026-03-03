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

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        {/* Stripe-like soft gradient wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 15% 10%, rgba(249,115,22,0.22), transparent 60%), radial-gradient(900px 420px at 85% 30%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(900px 420px at 55% 95%, rgba(220,38,38,0.14), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-14 md:px-14 md:py-20">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Policy ingest → Action cards → Decision packs</Pill>
            <Pill>Evidence-first</Pill>
            <Pill>Audit-ready</Pill>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900">
                Policy risk, translated into <GradientText>decisions</GradientText>.
              </h1>

              <p className="mt-6 text-lg md:text-xl leading-relaxed text-neutral-600 max-w-2xl">
                Future Commodities turns fragmented policy updates into structured operational impact:
                landed cost, lead time, compliance burden, and availability. One workflow your teams can
                execute, with evidence and traceability.
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

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition"
                >
                  View pricing →
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">Minutes</div>
                  <div className="mt-1 text-sm text-neutral-600">From update to action card</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">Audit-ready</div>
                  <div className="mt-1 text-sm text-neutral-600">Evidence + lineage</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight">One output</div>
                  <div className="mt-1 text-sm text-neutral-600">Decision packs for teams</div>
                </div>
              </div>
            </div>

            {/* Right: “product preview” placeholder (no images required) */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur p-5 md:p-6">
                <div className="text-sm font-semibold text-neutral-900">Live console preview</div>
                <div className="mt-1 text-xs text-neutral-500">
                  What your team sees when an update hits
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">Action Card</div>
                      <span className="text-xs font-semibold text-neutral-700">High</span>
                    </div>
                    <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
                      New documentation requirement affecting EU imports. HS code scope detected.
                      Suggested owner and next steps generated with evidence.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs rounded-full border px-2 py-0.5 bg-neutral-50">
                        HS: 85xx
                      </span>
                      <span className="text-xs rounded-full border px-2 py-0.5 bg-neutral-50">
                        Compliance
                      </span>
                      <span className="text-xs rounded-full border px-2 py-0.5 bg-neutral-50">
                        Effective: 14 days
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-semibold">Decision Pack</div>
                    <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
                      Executive-ready memo with impact levers, quantified downside, and an approval checklist.
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-semibold">Country Risk Map</div>
                    <div className="mt-2 text-sm text-neutral-600 leading-relaxed">
                      Heatmap for triage. Hover to see top updates and evidence snippets.
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-xs text-neutral-500">
                  Tip: Start manual for MVP. Automate ingestion later without changing the workflow.
                </div>
              </div>
            </div>
          </div>

          {/* Social proof (Stripe-like) */}
          <div className="mt-14 border-t border-neutral-200 pt-8">
            <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Built for teams across trade and operations
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm text-neutral-600">
              <div className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center">
                Compliance
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center">
                Logistics
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center">
                Procurement
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center">
                Category
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white/60 px-3 py-2 text-center">
                Risk
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY / PROBLEM */}
      <section className="space-y-10">
        <SectionTitle
          eyebrow="Why this exists"
          title={
            <>
              Policy updates are <span className="text-neutral-500">everywhere</span>. Decisions are not.
            </>
          }
          desc="Teams lose time copying links, translating PDFs, and debating severity without a shared structure. We convert policy text into operational levers with evidence, confidence, and owners."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="text-sm font-semibold text-neutral-900">What breaks today</div>
            <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
              Updates arrive across ministries, customs portals, newsletters, and PDFs. They are forwarded as messages,
              screenshots, or links. The same questions repeat: what changed, does it apply to us, when does it hit, and
              who owns the response.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">What good looks like</div>
            <p className="mt-3 text-base md:text-lg text-neutral-600 leading-relaxed">
              One shared artifact with consistent fields: scope, HS codes, routes, effective date, severity, confidence,
              and evidence. That artifact becomes an action card, feeds your risk map, and rolls into an executive
              decision pack.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8 md:p-12">
        <SectionTitle
          eyebrow="How it works"
          title={
            <>
              A workflow that scales from <GradientText>manual MVP</GradientText> to automation
            </>
          }
          desc="Start by pasting policies. Later, add scrapers and an AI extraction agent. Your product surface stays the same."
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-sm font-semibold text-neutral-900">1. Ingest</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Capture the update once: source, jurisdiction, publish and effective dates, raw text or PDF, and tags like
              HS code or category.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">2. Extract</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Convert text into structured fields: impacted items, levers, severity, confidence, evidence quotes, and
              recommended actions with owners.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">3. Decide</div>
            <p className="mt-2 text-sm md:text-base text-neutral-600 leading-relaxed">
              Generate decision packs for cross functional alignment. Track approvals, mitigations, and open questions.
              Feed dashboards and alerts.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition"
          >
            Learn more
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            style={{
              background:
                "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",
            }}
          >
            Explore console
          </Link>
        </div>
      </section>

      {/* PRODUCT MODULES */}
      <section className="space-y-10">
        <SectionTitle
          eyebrow="What you get"
          title="Three outputs your team can align on"
          desc="These modules map directly to your current MVP: action cards, risk map, and decision packs."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Action Cards",
              desc: "Structured extraction of what changed, scope, HS codes, severity, confidence, owners, and evidence quotes.",
              bullets: ["Scope and applicability", "Impact levers", "Next actions and owner"],
            },
            {
              title: "Risk Map",
              desc: "Country heatmap for triage. Hover to see top updates, evidence, and suggested mitigation paths.",
              bullets: ["Heatmap by jurisdiction", "Top cards per country", "Fast triage workflow"],
            },
            {
              title: "Decision Packs",
              desc: "Executive memo format with measurable impact, assumptions, approval checklist, and audit trail.",
              bullets: ["Decision summary", "Owners and timeline", "Audit-ready evidence"],
            },
          ].map((x) => (
            <div key={x.title} className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-7">
              <div className="text-base font-semibold text-neutral-900">{x.title}</div>
              <p className="mt-3 text-sm md:text-base text-neutral-600 leading-relaxed">{x.desc}</p>
              <div className="mt-5 space-y-2 text-sm text-neutral-700">
                {x.bullets.map((b) => (
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
              <div className="mt-6">
                <Link
                  href={x.title === "Risk Map" ? "/app/map" : x.title === "Decision Packs" ? "/app/decision-packs" : "/app/action-cards"}
                  className="text-sm font-semibold text-neutral-900 hover:opacity-80 transition"
                >
                  View in console →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(249,115,22,0.16), transparent 60%), radial-gradient(900px 420px at 80% 100%, rgba(220,38,38,0.12), transparent 60%)",
          }}
        />
        <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold tracking-widest text-neutral-500 uppercase">
              Get started
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              Bring policy risk into a workflow your team can run.
            </div>
            <div className="mt-2 text-base md:text-lg text-neutral-600">
              Start manual today. Add automation when the schema is stable.
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
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}