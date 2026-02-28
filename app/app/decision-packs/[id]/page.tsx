"use client";

import { use, useEffect, useState } from "react";

type EventRow = {
  id: string;
  event_type: string;
  payload: any;
  created_at: string;
};

export default function DecisionPackDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Next.js 16: params is a Promise
  const { id } = use(params);

  const [row, setRow] = useState<any>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [msg, setMsg] = useState("");

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
  }, [id]);

  async function save() {
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

  if (!row)
    return (
      <div className="text-sm opacity-70">
        {msg || "Loading..."}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Decision Pack</h1>
        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={save}
          >
            Save
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={approve}
          >
            Approve
          </button>
        </div>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      <div className="rounded-lg border p-4 space-y-3">
        <label className="grid gap-2 text-sm">
          <span className="opacity-80">Title</span>
          <input
            className="rounded-md border px-3 py-2"
            value={row.title ?? ""}
            onChange={(e) =>
              setRow({ ...row, title: e.target.value })
            }
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Country</span>
            <input
              className="rounded-md border px-3 py-2"
              value={row.country_code ?? ""}
              readOnly
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Owner</span>
            <input
              className="rounded-md border px-3 py-2"
              value={row.owner ?? ""}
              onChange={(e) =>
                setRow({ ...row, owner: e.target.value })
              }
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="opacity-80">Due date</span>
            <input
              type="date"
              className="rounded-md border px-3 py-2"
              value={row.due_date ?? ""}
              onChange={(e) =>
                setRow({ ...row, due_date: e.target.value })
              }
            />
          </label>
        </div>

        <div className="text-xs opacity-70">
          Status: <span className="font-semibold">{row.status}</span>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="font-semibold">Impact</div>
        <textarea
          className="w-full rounded-md border p-3 text-sm min-h-[140px]"
          value={JSON.stringify(row.impact ?? {}, null, 2)}
          onChange={(e) => {
            try {
              setRow({ ...row, impact: JSON.parse(e.target.value) });
            } catch {}
          }}
        />
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="font-semibold">Recommended actions</div>
        <textarea
          className="w-full rounded-md border p-3 text-sm min-h-[180px]"
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
        <div className="font-semibold">Evidence</div>
        <textarea
          className="w-full rounded-md border p-3 text-sm min-h-[140px]"
          value={JSON.stringify(row.evidence ?? {}, null, 2)}
          onChange={(e) => {
            try {
              setRow({ ...row, evidence: JSON.parse(e.target.value) });
            } catch {}
          }}
        />
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="font-semibold">Audit log</div>
        {events.map((ev) => (
          <div key={ev.id} className="rounded-md border p-2 text-sm">
            <div className="font-medium">{ev.event_type}</div>
            <div className="text-xs opacity-70">
              {new Date(ev.created_at).toLocaleString()}
            </div>
            <pre className="text-xs overflow-auto mt-2">
              {JSON.stringify(ev.payload, null, 2)}
            </pre>
          </div>
        ))}
        {!events.length ? (
          <div className="text-sm opacity-70">No events.</div>
        ) : null}
      </div>
    </div>
  );
}