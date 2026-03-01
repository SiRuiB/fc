"use client";

import { use, useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/StatusPill";

type EventRow = {
  id: string;
  event_type: string;
  payload: any;
  created_at: string;
};

type LeverLevel = "LOW" | "MEDIUM" | "HIGH";

type DecisionPackRow = {
  id: string;
  title: string;
  country_code: string;
  status: string;
  owner: string | null;
  due_date: string | null;
  impact: any;
  recommended_actions: any;
  evidence: any;
  created_at?: string;
  updated_at?: string;
};


function LeverPill({ level }: { level: LeverLevel | null | undefined }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium";
  if (!level)
    return (
      <span className={`${base} border-neutral-200 bg-neutral-50 text-neutral-600`}>
        —
      </span>
    );
  if (level === "HIGH")
    return (
      <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
        HIGH
      </span>
    );
  if (level === "MEDIUM")
    return (
      <span className={`${base} border-yellow-200 bg-yellow-50 text-yellow-800`}>
        MEDIUM
      </span>
    );
  return (
    <span className={`${base} border-green-200 bg-green-50 text-green-700`}>
      LOW
    </span>
  );
}

function safeArray<T = any>(v: any): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function fmtDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function ScopeBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs opacity-60">{label}</div>
      {items.length ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {items.slice(0, 10).map((x) => (
            <span
              key={x}
              className="inline-flex items-center rounded-full border bg-neutral-50 px-2 py-0.5 text-xs"
            >
              {x}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-sm font-medium">—</div>
      )}
    </div>
  );
}

function ActionColumn({
  title,
  hint,
  items,
}: {
  title: string;
  hint: string;
  items: any[];
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-60">{hint}</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 6).map((a, idx) => {
            const checklist = safeArray<string>(a?.checklist);
            return (
              <div key={idx} className="rounded-md border bg-neutral-50 p-2">
                <div className="text-sm font-medium">
                  {String(a?.action ?? "—")}
                </div>
                <div className="mt-1 text-xs opacity-70">
                  {a?.owner ? `Owner: ${a.owner}` : "Owner: —"}
                  {typeof a?.due_days === "number" ? ` · Due: ${a.due_days}d` : ""}
                </div>

                {checklist.length ? (
                  <ul className="mt-2 space-y-1">
                    {checklist.slice(0, 4).map((c, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <span className="mt-[2px] inline-block h-3 w-3 rounded border bg-white" />
                        <span className="opacity-80">{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="text-sm opacity-70">—</div>
        )}
      </div>
    </div>
  );
}

export default function DecisionPackDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 16: params is a Promise
  const { id } = use(params);

  const [row, setRow] = useState<DecisionPackRow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [msg, setMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function load() {
    setMsg("Loading...");
    const res = await fetch(`/api/decision-packs/${id}`, {
      cache: "no-store",
    });

    let json: any = {};
    try {
      json = await res.json();
    } catch {
      setMsg("Invalid server response");
      return;
    }

    if (!res.ok) {
      setMsg(`Error: ${json.error}`);
      return;
    }

    setRow(json.row);
    setMsg("");
  }

  async function loadEvents() {
    const res = await fetch(`/api/decision-packs/${id}/events`, {
      cache: "no-store",
    });

    if (!res.ok) return;

    const json = await res.json().catch(() => null);
    if (json?.rows) setEvents(json.rows);
  }

  useEffect(() => {
    load();
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!row) return;
    setMsg("Saving...");

    const res = await fetch(`/api/decision-packs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: row.title,
        owner: row.owner,
        due_date: row.due_date,
        impact: row.impact,
        recommended_actions: row.recommended_actions,
        evidence: row.evidence,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(`Error: ${json?.error ?? "Save failed"}`);
      return;
    }

    setMsg("Saved.");
    await loadEvents();
    setTimeout(() => setMsg(""), 1200);
  }

  async function approve() {
    setMsg("Approving...");

    const res = await fetch(`/api/decision-packs/${id}/approve`, {
      method: "POST",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(`Error: ${json?.error ?? "Approve failed"}`);
      return;
    }

    setMsg("Approved.");
    await load();
    await loadEvents();
    setTimeout(() => setMsg(""), 1200);
  }

  // Derived view models (no data model changes)
  const impact = useMemo(() => (row?.impact ?? {}) as any, [row]);
  const levers = (impact?.levers ?? {}) as any;
  const scope = (impact?.scope ?? {}) as any;
  const actions = useMemo(() => safeArray<any>(row?.recommended_actions), [row]);
  const evidence = useMemo(() => (row?.evidence ?? {}) as any, [row]);

  const p0 = actions.filter((a) => String(a?.priority).toUpperCase() === "P0");
  const p1 = actions.filter((a) => String(a?.priority).toUpperCase() === "P1");
  const p2 = actions.filter((a) => String(a?.priority).toUpperCase() === "P2");

  if (!row) return <div className="text-sm opacity-70">{msg || "Loading..."}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{row.title}</h1>
              <StatusPill status={row.status} />
            </div>
            <p className="text-sm opacity-70 mt-1">
              Decision Pack for {row.country_code} · Compliance and commercial execution
            </p>
          </div>

          <div className="flex gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={save}>
              Save
            </button>
            <button
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={approve}
            >
              Approve
            </button>
          </div>
        </div>

        {msg ? <div className="text-sm opacity-70">{msg}</div> : null}
      </div>

      {/* Top summary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 space-y-2">
          <div className="text-xs font-semibold opacity-70">Executive summary</div>
          <div className="text-sm leading-relaxed">
            {impact?.summary_1l ? String(impact.summary_1l) : "—"}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="text-xs font-semibold opacity-70">Owner and governance</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs opacity-60">Owner</div>
              <div className="font-medium">{row.owner || "—"}</div>
            </div>
            <div>
              <div className="text-xs opacity-60">Due date</div>
              <div className="font-medium">{fmtDate(row.due_date)}</div>
            </div>
            <div>
              <div className="text-xs opacity-60">Status</div>
              <div className="font-medium">{row.status}</div>
            </div>
            <div>
              <div className="text-xs opacity-60">Updated</div>
              <div className="font-medium">{fmtDate(row.updated_at)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="text-xs font-semibold opacity-70">Risk levers</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs opacity-60">Duty (pp)</div>
              <div className="font-medium">
                {typeof levers?.duty_pp === "number" ? levers.duty_pp : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-60">Lead time (days)</div>
              <div className="font-medium">
                {typeof levers?.lead_days === "number" ? levers.lead_days : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-60">Doc burden</div>
              <div className="mt-1">
                <LeverPill level={levers?.doc_burden as LeverLevel | null} />
              </div>
            </div>
            <div>
              <div className="text-xs opacity-60">Penalties</div>
              <div className="mt-1">
                <LeverPill level={levers?.penalties as LeverLevel | null} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action checklist */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recommended actions</div>
            <div className="text-xs opacity-70 mt-1">
              Prioritized execution list (P0 within 24–72 hours)
            </div>
          </div>
          <div className="text-xs opacity-60">Total: {actions.length}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <ActionColumn title="P0" hint="Immediate" items={p0} />
          <ActionColumn title="P1" hint="This week" items={p1} />
          <ActionColumn title="P2" hint="Monitor" items={p2} />
        </div>
      </div>

      {/* Scope + Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="text-sm font-semibold">Scope</div>
          <div className="text-sm space-y-2">
            <ScopeBlock label="HS codes" items={safeArray<string>(scope?.hs_codes)} />
            <ScopeBlock label="Products" items={safeArray<string>(scope?.products)} />
            <ScopeBlock label="Routes" items={safeArray<string>(scope?.routes)} />
            <ScopeBlock
              label="Affected parties"
              items={safeArray<string>(scope?.affected_parties)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div className="text-sm font-semibold">Evidence</div>
          <div className="text-sm space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-xs opacity-60">Authority</div>
                <div className="font-medium">{evidence?.authority || "—"}</div>
              </div>
              <div>
                <div className="text-xs opacity-60">Publish date</div>
                <div className="font-medium">{fmtDate(evidence?.publish_date)}</div>
              </div>
            </div>

            <div>
              <div className="text-xs opacity-60">Source</div>
              {evidence?.source_url ? (
                <a
                  className="text-sm underline"
                  target="_blank"
                  rel="noreferrer"
                  href={String(evidence.source_url)}
                >
                  {String(evidence.source_url)}
                </a>
              ) : (
                <div className="font-medium">—</div>
              )}
            </div>

            <div>
              <div className="text-xs opacity-60">Key quotes</div>
              <ul className="mt-2 space-y-2">
                {safeArray<string>(evidence?.key_quotes)
                  .slice(0, 5)
                  .map((q, idx) => (
                    <li
                      key={idx}
                      className="rounded-md border bg-neutral-50 p-2 text-xs leading-relaxed"
                    >
                      {q}
                    </li>
                  ))}
                {!safeArray<string>(evidence?.key_quotes).length ? (
                  <li className="text-sm opacity-70">—</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Audit log */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Audit trail</div>
          <div className="text-xs opacity-60">{events.length} events</div>
        </div>

        {events.length ? (
          <div className="space-y-2">
            {events.map((ev) => (
              <div key={ev.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{ev.event_type}</div>
                    <div className="text-xs opacity-60">
                      {new Date(ev.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <pre className="mt-2 text-xs overflow-auto rounded-md bg-neutral-50 border p-2">
{JSON.stringify(ev.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm opacity-70">No events.</div>
        )}
      </div>

      {/* Advanced editor */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Advanced editor</div>
            <div className="text-xs opacity-70 mt-1">
              Optional: edit raw JSON fields without changing the data model
            </div>
          </div>
          <button
            className="rounded-md border px-3 py-1.5 text-sm"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide" : "Show"}
          </button>
        </div>

        {showAdvanced ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="font-semibold">Impact (JSON)</div>
              <textarea
                className="w-full rounded-md border p-3 text-sm min-h-[140px] font-mono"
                value={JSON.stringify(row.impact ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setRow({ ...row, impact: JSON.parse(e.target.value) });
                  } catch {}
                }}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="font-semibold">Recommended actions (JSON)</div>
              <textarea
                className="w-full rounded-md border p-3 text-sm min-h-[180px] font-mono"
                value={JSON.stringify(row.recommended_actions ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    setRow({
                      ...row,
                      recommended_actions: JSON.parse(e.target.value),
                    });
                  } catch {}
                }}
              />
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="font-semibold">Evidence (JSON)</div>
              <textarea
                className="w-full rounded-md border p-3 text-sm min-h-[140px] font-mono"
                value={JSON.stringify(row.evidence ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setRow({ ...row, evidence: JSON.parse(e.target.value) });
                  } catch {}
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit header fields */}
      <div className="rounded-lg border bg-white p-4 space-y-3">
        <div className="text-sm font-semibold">Edit metadata</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Title</span>
            <input
              className="rounded-md border px-3 py-2"
              value={row.title ?? ""}
              onChange={(e) => setRow({ ...row, title: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Owner</span>
            <input
              className="rounded-md border px-3 py-2"
              value={row.owner ?? ""}
              onChange={(e) => setRow({ ...row, owner: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Due date</span>
            <input
              type="date"
              className="rounded-md border px-3 py-2"
              value={row.due_date ?? ""}
              onChange={(e) => setRow({ ...row, due_date: e.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}