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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Action Cards</h1>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      {!data?.length && !msg && (
        <div className="opacity-70">No action cards found.</div>
      )}

      {data?.map((card) => (
        <div key={card.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{card.title}</div>
              <div className="text-sm opacity-70">
                {card.jurisdiction ?? "—"} · Risk {card.risk_level}/100 · Conf{" "}
                {(Number(card.confidence) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {card.source_url ? (
                <a
                  href={card.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  Source
                </a>
              ) : null}

              <button
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => generateDecisionPack(card.id)}
              >
                Generate Decision Pack
              </button>
            </div>
          </div>

          <div className="text-sm space-y-1">
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
    </main>
  );
}