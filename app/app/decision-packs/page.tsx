"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusPill } from "@/components/StatusPill";

type Row = {
  id: string;
  title: string;
  country_code: string | null;
  status: string;
  updated_at: string;
  action_card_id: string;
};

function fmtDateTime(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function DecisionPacksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("Loading...");
    const res = await fetch("/api/decision-packs", { cache: "no-store" });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      const err =
        json?.error ??
        `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
      setMsg(`Error: ${err}`);
      return;
    }

    setRows(json?.rows ?? []);
    setMsg("");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Decision Packs</h1>
          <p className="text-sm opacity-70 mt-1">
            Approval-ready memos with levers, scope, actions, evidence, and audit trail.
          </p>
        </div>

        <button
          className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 shadow-sm"
          onClick={load}
        >
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      {!rows.length && !msg ? (
        <div className="rounded-2xl border bg-white p-6 text-sm opacity-70 shadow-sm">
          No decision packs yet. Generate one from an action card.
        </div>
      ) : null}

      {/* List container */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="divide-y">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/app/decision-packs/${r.id}`}
              className="block px-3 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold truncate">{r.title}</div>
                    {r.country_code ? (
                      <span className="inline-flex items-center rounded-full border bg-neutral-50 px-2 py-0.5 text-xs font-medium">
                        {r.country_code}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-xs opacity-70 mt-2">
                    Updated {fmtDateTime(r.updated_at)}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <StatusPill status={r.status} />
                  <span className="text-xs opacity-60">Open →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}