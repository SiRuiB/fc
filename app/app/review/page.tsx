"use client";

import { useEffect, useMemo, useState } from "react";

type PolicyEvent = {
  id: string;
  status: string;
  jurisdiction: string;
  hs_codes: string[] | null;
  policy_type: string | null;
  change_type: string | null;
  publish_date: string | null;
  effective_date: string | null;
  summary_1l: string | null;
  why_it_matters_1l: string | null;
  actions: any; // jsonb
  citations: any; // jsonb
  confidence: number | null;
  updated_at: string;
  raw_source_id: string | null;
};

type ReviewTaskRow = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  priority: "LOW" | "MED" | "HIGH" | string;
  reason: string | null;
  reviewer_note: string | null;
  created_at: string;
  policy_event: PolicyEvent | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function PriorityPill({ p }: { p: string }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  if (p === "HIGH") return <span className={`${base} border-red-400 text-red-700`}>HIGH</span>;
  if (p === "LOW") return <span className={`${base} border-green-400 text-green-700`}>LOW</span>;
  return <span className={`${base} border-yellow-400 text-yellow-700`}>MED</span>;
}

function StatusPill({ s }: { s: string }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  if (s === "APPROVED") return <span className={`${base} border-green-400 text-green-700`}>APPROVED</span>;
  if (s === "REJECTED") return <span className={`${base} border-red-400 text-red-700`}>REJECTED</span>;
  return <span className={`${base} border-gray-300 text-gray-600`}>PENDING</span>;
}

function ConfidencePill({ c }: { c: number }) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";
  const pct = clamp(c, 0, 1) * 100;
  if (pct >= 80) return <span className={`${base} border-green-400 text-green-700`}>{pct.toFixed(0)}% conf</span>;
  if (pct >= 60) return <span className={`${base} border-yellow-400 text-yellow-700`}>{pct.toFixed(0)}% conf</span>;
  return <span className={`${base} border-red-400 text-red-700`}>{pct.toFixed(0)}% conf</span>;
}

export default function ReviewQueuePage() {
  const [rows, setRows] = useState<ReviewTaskRow[]>([]);
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteByTask, setNoteByTask] = useState<Record<string, string>>({});

  async function load() {
    setMsg("Loading...");
    try {
      const res = await fetch("/api/review/tasks", { cache: "no-store" });
      const text = await res.text();

      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const errMsg = json?.error ?? `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
        setMsg(`Error: ${errMsg}`);
        return;
      }

      setRows(json?.rows ?? []);
      setMsg("");
    } catch (e: any) {
      setMsg(`Error: ${e?.message ?? "Failed to load"}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => r.status === "PENDING").length;
    const approved = rows.filter((r) => r.status === "APPROVED").length;
    return { pending, approved, total: rows.length };
  }, [rows]);

  async function decide(taskId: string, decision: "APPROVE" | "REJECT") {
    setBusyId(taskId);
    setMsg(decision === "APPROVE" ? "Approving..." : "Rejecting...");

    try {
      const res = await fetch("/api/review/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, decision, note: noteByTask[taskId] ?? "" }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const errMsg = json?.error ?? `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
        setMsg(`Error: ${errMsg}`);
        setBusyId(null);
        return;
      }

      setMsg(decision === "APPROVE" ? "Approved." : "Rejected.");
      setBusyId(null);
      await load();
    } catch (e: any) {
      setBusyId(null);
      setMsg(`Error: ${e?.message ?? "Request failed"}`);
    }
  }

  async function publish(policyEventId?: string, taskId?: string) {
    if (!policyEventId) return;

    // lock UI on this task
    if (taskId) setBusyId(taskId);
    setMsg("Publishing...");

    try {
      const res = await fetch("/api/publish/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyEventId }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        const errMsg = json?.error ?? `HTTP ${res.status}. Non-JSON response: ${text?.slice(0, 300) || "(empty)"}`;
        setMsg(`Error: ${errMsg}`);
        if (taskId) setBusyId(null);
        return;
      }

      setMsg("Published to Action Cards.");
      if (taskId) setBusyId(null);
      await load();
    } catch (e: any) {
      if (taskId) setBusyId(null);
      setMsg(`Error: ${e?.message ?? "Publish failed"}`);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Review Queue</h1>
          <div className="mt-1 text-sm opacity-70">
            Human approval layer for extracted policy events. Approve to mark as trusted, reject to block. Approved items can be
            published into Action Cards.
          </div>
          <div className="mt-2 text-sm">
            Pending: <span className="font-medium">{counts.pending}</span> · Approved:{" "}
            <span className="font-medium">{counts.approved}</span> · Total:{" "}
            <span className="font-medium">{counts.total}</span>
          </div>
        </div>

        <button className="rounded-md border px-3 py-1 text-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-80">{msg}</div> : null}

      {!rows.length && !msg ? <div className="opacity-70">No review items found.</div> : null}

      {/* List */}
      <div className="space-y-3">
        {rows.map((r) => {
          const ev = r.policy_event;
          const conf = typeof ev?.confidence === "number" ? ev.confidence : 0;

          const isPending = r.status === "PENDING";
          const isApproved = r.status === "APPROVED";

          return (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill s={r.status ?? "PENDING"} />
                    <PriorityPill p={r.priority ?? "MED"} />
                    <span className="text-sm opacity-70">{new Date(r.created_at).toLocaleString()}</span>

                    {ev?.jurisdiction ? <span className="text-sm opacity-70">· {ev.jurisdiction}</span> : null}

                    <ConfidencePill c={conf} />

                    {ev?.policy_type ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium opacity-80">
                        {ev.policy_type}
                      </span>
                    ) : null}

                    {ev?.change_type ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium opacity-80">
                        {ev.change_type}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 text-lg font-semibold">{ev?.summary_1l ?? "Untitled event draft"}</div>

                  <div className="mt-2 text-sm">
                    <span className="font-medium">Why it matters:</span> {ev?.why_it_matters_1l ?? "—"}
                  </div>

                  <div className="mt-2 text-sm opacity-80">
                    <span className="font-medium">HS Codes:</span>{" "}
                    {Array.isArray(ev?.hs_codes) && ev?.hs_codes?.length ? ev.hs_codes.join(", ") : "—"}
                  </div>

                  <div className="mt-1 text-sm opacity-80">
                    <span className="font-medium">Publish / Effective:</span>{" "}
                    {(ev?.publish_date ?? "—") + " / " + (ev?.effective_date ?? "—")}
                  </div>

                  <div className="mt-2 text-xs opacity-70">
                    <span className="font-medium">Citations:</span>{" "}
                    {Array.isArray(ev?.citations) ? `${ev.citations.length} evidence items` : "—"}
                  </div>

                  {r.reason ? (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Flag:</span>{" "}
                      <span className="text-red-600">{r.reason}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-72 flex-col gap-2">
                  <textarea
                    className="min-h-[88px] w-full rounded-md border p-2 text-sm"
                    placeholder="Reviewer note (optional)"
                    value={noteByTask[r.id] ?? ""}
                    onChange={(e) => setNoteByTask((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    disabled={busyId === r.id || isApproved}
                  />

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      <>
                        <button
                          className="flex-1 rounded-md border px-3 py-2 text-sm"
                          onClick={() => decide(r.id, "REJECT")}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? "Working..." : "Reject"}
                        </button>
                        <button
                          className="flex-1 rounded-md border px-3 py-2 text-sm"
                          onClick={() => decide(r.id, "APPROVE")}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? "Working..." : "Approve"}
                        </button>
                      </>
                    ) : isApproved ? (
                      <button
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        onClick={() => publish(ev?.id, r.id)}
                        disabled={busyId === r.id || !ev?.id}
                      >
                        {busyId === r.id ? "Working..." : "Publish to Action Cards"}
                      </button>
                    ) : (
                      <button className="w-full rounded-md border px-3 py-2 text-sm" disabled>
                        No actions available
                      </button>
                    )}
                  </div>

                  <div className="text-xs opacity-60">
                    {isPending
                      ? "Approve moves item to APPROVED. Rejected items are blocked."
                      : isApproved
                      ? "Publish will create an Action Card and mark the policy event as PUBLISHED."
                      : "This item is already decided."}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}