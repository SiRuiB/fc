import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function ActionCardsPage() {
  const { data, error } = await supabaseAdmin
    .from("action_cards")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Action Cards</h1>

      {!data?.length && (
        <div className="opacity-70">No action cards found.</div>
      )}

      {data?.map((card) => (
        <div key={card.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{card.title}</div>
              <div className="text-sm opacity-70">
                {card.jurisdiction ?? "—"} · Risk {card.risk_level}/100 · Conf{" "}
                {(Number(card.confidence) * 100).toFixed(0)}%
              </div>
            </div>

            {card.source_url && (
              <a
                href={card.source_url}
                target="_blank"
                className="text-sm underline"
              >
                Source
              </a>
            )}
          </div>

          <div className="mt-3 text-sm space-y-1">
            <div>
              <strong>What changed:</strong> {card.what_changed_1l ?? "—"}
            </div>
            <div>
              <strong>Why it matters:</strong> {card.why_it_matters_1l ?? "—"}
            </div>
            <div className="opacity-70">
              HS Codes:{" "}
              {Array.isArray(card.hs_codes)
                ? card.hs_codes.join(", ")
                : "—"}
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}