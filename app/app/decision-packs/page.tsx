"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  country_code: string | null;
  status: string;
  updated_at: string;
  action_card_id: string;
};

export default function DecisionPacksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("Loading...");
    const res = await fetch("/api/decision-packs", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      setMsg(`Error: ${json.error}`);
      return;
    }
    setRows(json.rows ?? []);
    setMsg("");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Decision Packs</h1>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      <div className="rounded-lg border p-4 space-y-2">
        {rows.map((r) => (
          <Link
            key={r.id}
            href={`/app/decision-packs/${r.id}`}
            className="block rounded-md border p-3 hover:bg-neutral-50"
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.title}</div>
              <div className="text-xs rounded-md border px-2 py-1">
                {r.status}
              </div>
            </div>
            <div className="text-xs opacity-70 mt-1">
              {r.country_code ?? "—"} · Updated {new Date(r.updated_at).toLocaleString()}
            </div>
          </Link>
        ))}

        {!rows.length ? (
          <div className="text-sm opacity-70">
            No decision packs yet. Generate one from an action card (next step).
          </div>
        ) : null}
      </div>
    </div>
  );
}