"use client";

import { useEffect, useState } from "react";

type PolicyRow = {
  id: string;
  created_at: string;
  jurisdiction: string | null;
  source_url: string | null;
  parse_status: string;
  parse_error: string | null;
};

export default function PolicyLogPage() {
  const [jurisdiction, setJurisdiction] = useState("UK");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [msg, setMsg] = useState("");
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadRecent() {
    const res = await fetch("/api/policy-log/recent", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) setRows(json.rows ?? []);
  }

  useEffect(() => {
    loadRecent();
  }, []);

  async function ingest() {
    setMsg("Saving...");
    const res = await fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jurisdiction, sourceUrl, rawText }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(`Error: ${json.error}`);
      return;
    }
    setMsg(`Saved policyId: ${json.id}`);
    setRawText("");
    await loadRecent();
  }

  async function runAgent(policyId: string) {
    setBusyId(policyId);
    setMsg("Running agent...");
    const res = await fetch("/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policyId }),
    });
    const json = await res.json();
    setBusyId(null);

    if (!res.ok) {
      setMsg(`Agent error: ${json.error}`);
      await loadRecent();
      return;
    }

    setMsg(`Created actionCardId: ${json.actionCardId}`);
    await loadRecent();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Ingest Policy</h1>

        <div className="grid gap-2 max-w-2xl">
          <label className="text-xs opacity-70">Jurisdiction</label>
          <input
            className="rounded-md border p-2"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />

          <label className="text-xs opacity-70">Source URL (optional)</label>
          <input
            className="rounded-md border p-2"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
          />

          <label className="text-xs opacity-70">Raw policy text</label>
          <textarea
            className="min-h-[220px] rounded-md border p-2"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />

          <button className="rounded-md border px-4 py-2 w-fit" onClick={ingest}>
            Save to Policy Log
          </button>
        </div>

        {msg ? <div className="text-sm opacity-80">{msg}</div> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent policy_log</h2>
          <button className="rounded-md border px-3 py-1 text-sm" onClick={loadRecent}>
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm opacity-70">
                    {new Date(r.created_at).toLocaleString()} · {r.jurisdiction ?? "—"}
                  </div>
                  <div className="mt-1 text-sm">
                    Status: <span className="font-medium">{r.parse_status}</span>
                    {r.parse_error ? <span className="text-red-600"> · {r.parse_error}</span> : null}
                  </div>
                  {r.source_url ? (
                    <a className="text-sm underline opacity-80" href={r.source_url} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  ) : null}
                </div>

                <button
                  className="rounded-md border px-3 py-1 text-sm"
                  onClick={() => runAgent(r.id)}
                  disabled={busyId === r.id}
                >
                  {busyId === r.id ? "Running..." : "Run Agent"}
                </button>
              </div>
            </div>
          ))}

          {!rows.length ? <div className="opacity-70">No policies yet.</div> : null}
        </div>
      </div>
    </div>
  );
}