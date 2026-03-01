export default function AboutPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">About</h1>
        <p className="text-sm opacity-75 max-w-3xl leading-relaxed">
          Future Commodities is building an AI-native workflow for policy risk:
          ingest updates, translate them into operational impact, and produce decision-grade artifacts.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-6 space-y-3">
        <div className="text-sm font-semibold">What we believe</div>
        <p className="text-sm opacity-80 leading-relaxed">
          Policy risk is not “news”. It is a set of levers that hit landed cost, lead time, compliance burden,
          and availability. Teams need a system that converts policy text into structured decisions.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-6 space-y-2">
          <div className="text-sm font-semibold">Built for risk teams</div>
          <div className="text-sm opacity-75 leading-relaxed">
            Compliance, trade, logistics, and category teams get one shared artifact: the decision pack.
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 space-y-2">
          <div className="text-sm font-semibold">Built for speed</div>
          <div className="text-sm opacity-75 leading-relaxed">
            The workflow emphasizes actionability: what changed, why, who owns next steps, and evidence.
          </div>
        </div>
      </section>
    </div>
  );
}