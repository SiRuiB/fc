"use client";

import { useEffect, useState } from "react";

type ActionCard = {
  id: string;
  title: string;
  jurisdiction: string | null;
  risk_level: number;
  confidence: number;
  what_changed_1l: string | null;
  why_it_matters_1l: string | null;
  hs_codes: string[] | null;
  source_url?: string | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function RiskPill({ risk }: { risk: number }) {
  const r = clamp(Number.isFinite(risk) ? risk : 0, 0, 100);
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

  if (r >= 80) {
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        HIGH
      </span>
    );
  }
  if (r >= 50) {
    return (
      <span className={`${base} border-yellow-200 bg-yellow-50 text-yellow-800`}>
        MEDIUM
      </span>
    );
  }
  return (
    <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
      LOW
    </span>
  );
}

export default function ActionCardsPage() {
  const [data, setData] = useState<ActionCard[]>([]);
  const [msg, setMsg] = useState<string>("");

  async function load() {
    setMsg("Loading...");
    try {
      const res = await fetch("/api/action-cards", { cache: "no-store" });
      const text = await res.text();

      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const errMsg =
          json?.error ??
          `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
        setMsg(`Error: ${errMsg}`);
        return;
      }

      setData(json?.rows ?? []);
      setMsg("");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? "Failed to load"}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function generateDecisionPack(actionCardId: string) {
    try {
      const res = await fetch("/api/agent/decision-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_card_id: actionCardId }),
      });

      // Read raw text first so we can surface HTML/empty errors.
      const text = await res.text();

      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const errMsg =
          json?.error ??
          `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
        alert(errMsg);
        return;
      }

      if (!json?.id) {
        alert(
          `Server returned OK but missing id. Response: ${text?.slice(0, 300) || "(empty)"}`
        );
        return;
      }

      window.location.href = `/app/decision-packs/${json.id}`;
    } catch (err) {
      console.error(err);
      alert("Failed to generate decision pack (network/client error). ");
    }
  }

  return (
    <main className="space-y-4">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Action Cards</h1>
          <p className="text-sm opacity-70 mt-1">
            Extracted policy changes with risk scoring and operational next steps.
          </p>
        </div>

        <button className="rounded-md border px-3 py-1 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      {!data?.length && !msg ? (
        <div className="rounded-2xl border bg-white p-6 text-sm opacity-70 shadow-sm">
          No action cards found.
        </div>
      ) : null}

      <div className="space-y-3">
        {data?.map((card) => (
          <div key={card.id} className="rounded-2xl border bg-white p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold truncate">{card.title}</div>
                  <RiskPill risk={card.risk_level} />
                </div>

                <div className="text-sm opacity-70 mt-2">
                  {card.jurisdiction ?? "—"} · Risk {card.risk_level}/100 · Conf{" "}
                  {(Number(card.confidence) * 100).toFixed(0)}%
                </div>
              </div>

              <div className="flex gap-2 items-center shrink-0">
                {card.source_url ? (
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline underline-offset-4 hover:opacity-80"
                  >
                    Source
                  </a>
                ) : null}

                <button
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-95"
style={{
  background:
    "linear-gradient(90deg, rgb(var(--fc-red)), rgb(var(--fc-orange)), rgb(var(--fc-gold)))",}}
                  onClick={() => generateDecisionPack(card.id)}
                >
                  Generate Decision Pack
                </button>
              </div>
            </div>

            <div className="text-sm space-y-2">
              <div>
                <strong>What changed:</strong> {card.what_changed_1l ?? "—"}
              </div>
              <div>
                <strong>Why it matters:</strong> {card.why_it_matters_1l ?? "—"}
              </div>
              <div className="opacity-70">
                HS Codes:{" "}
                {Array.isArray(card.hs_codes) ? card.hs_codes.join(", ") : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}