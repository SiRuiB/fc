"use client";

<div className="flex items-start justify-between gap-3">
  <div>
    <h1 className="text-2xl font-semibold">Action Cards</h1>
    <p className="text-sm opacity-70 mt-1">
      Extracted policy changes with risk scoring and operational next steps.
    </p>
  </div>
</div>



import { useEffect, useMemo, useState } from "react";

type ScenarioListRow = {
  id: string;
  name: string;
  country_code: string | null;
  created_at: string;
  updated_at: string;
};

type ScenarioFull = {
  id: string;
  name: string;
  country_code: string | null;
  inputs: any;
  shocks: any;
  notes: string | null;
};

export default function SimulatorPage() {
  // Base inputs
  const [sellPrice, setSellPrice] = useState(40);
  const [supplierCost, setSupplierCost] = useState(12);
  const [fx, setFx] = useState(0.79);
  const [freight, setFreight] = useState(2.2);
  const [dutyPct, setDutyPct] = useState(4);
  const [vatPct, setVatPct] = useState(20);
  const [otherCost, setOtherCost] = useState(1.0);
  const [leadDays, setLeadDays] = useState(90);
  const [capitalRate, setCapitalRate] = useState(12);

  // Shocks
  const [shockDuty, setShockDuty] = useState(10);
  const [shockFx, setShockFx] = useState(-5);
  const [shockLead, setShockLead] = useState(14);

  // Save/Load UI state
  const [scenarioName, setScenarioName] = useState("My scenario");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [savingMsg, setSavingMsg] = useState<string>("");

  // Auto agent state
  const [autoMsg, setAutoMsg] = useState<string>("");
  const [autoRationale, setAutoRationale] = useState<string>("");

  const [list, setList] = useState<ScenarioListRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refreshList() {
    const res = await fetch("/api/scenarios", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) setList(json.rows ?? []);
  }

  async function autoSuggestShocks() {
    const cc = (countryCode ?? "").trim().toUpperCase();
    if (!cc) {
      setAutoMsg("Set Country code first (e.g., US or UK). ");
      return;
    }

    setAutoMsg("Thinking...");
    setAutoRationale("");

    const res = await fetch("/api/agent/suggest-shocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country_code: cc }),
    });

    const json = await res.json();

    if (!res.ok) {
      setAutoMsg(`Error: ${json.error}`);
      return;
    }

    const s = json.suggestion;

    setShockDuty(Number(s.shockDuty));
    setShockFx(Number(s.shockFx));
    setShockLead(Number(s.shockLead));

    setAutoRationale(`${s.rationale} (confidence ${s.confidence})`);
    setAutoMsg("Applied.");
    setTimeout(() => setAutoMsg(""), 1200);
  }

  useEffect(() => {
    refreshList();
  }, []);

  const result = useMemo(() => {
    const supplierCostGbp = supplierCost * fx;
    const landedBeforeDuty = supplierCostGbp + freight + otherCost;
    const duty = landedBeforeDuty * (dutyPct / 100);
    const landedCost = landedBeforeDuty + duty;
    const vat = landedCost * (vatPct / 100);
    const grossProfit = sellPrice - (landedCost + vat);
    const marginPct = (grossProfit / sellPrice) * 100;
    const capitalCost = landedCost * (capitalRate / 100) * (leadDays / 365);
    const profitAfterCapital = grossProfit - capitalCost;

    const fx2 = fx * (1 + shockFx / 100);
    const dutyPct2 = dutyPct + shockDuty;
    const leadDays2 = leadDays + shockLead;

    const supplierCostGbp2 = supplierCost * fx2;
    const landedBeforeDuty2 = supplierCostGbp2 + freight + otherCost;
    const duty2 = landedBeforeDuty2 * (dutyPct2 / 100);
    const landedCost2 = landedBeforeDuty2 + duty2;
    const vat2 = landedCost2 * (vatPct / 100);

    const grossProfit2 = sellPrice - (landedCost2 + vat2);
    const marginPct2 = (grossProfit2 / sellPrice) * 100;
    const capitalCost2 = landedCost2 * (capitalRate / 100) * (leadDays2 / 365);
    const profitAfterCapital2 = grossProfit2 - capitalCost2;

    return {
      base: { marginPct, profitAfterCapital },
      shock: { marginPct2, profitAfterCapital2 },
      delta: {
        margin: marginPct2 - marginPct,
        profit: profitAfterCapital2 - profitAfterCapital,
        landed: landedCost2 - landedCost,
      },
    };
  }, [
    sellPrice,
    supplierCost,
    fx,
    freight,
    dutyPct,
    vatPct,
    otherCost,
    leadDays,
    capitalRate,
    shockDuty,
    shockFx,
    shockLead,
  ]);

  async function saveScenario() {
    setSavingMsg("Saving...");
    const payload = {
      name: scenarioName,
      country_code: countryCode,
      inputs: {
        sellPrice,
        supplierCost,
        fx,
        freight,
        dutyPct,
        vatPct,
        otherCost,
        leadDays,
        capitalRate,
      },
      shocks: { shockDuty, shockFx, shockLead },
      notes: notes || null,
    };

    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      setSavingMsg(`Error: ${json.error}`);
      return;
    }

    setSavingMsg("Saved.");
    await refreshList();
    setTimeout(() => setSavingMsg(""), 1200);
  }

  async function loadScenario(id: string) {
    const res = await fetch(`/api/scenarios/${id}`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) return;

    const s: ScenarioFull = json.row;
    setSelectedId(s.id);

    setScenarioName(s.name);
    setCountryCode(s.country_code ?? null);
    setNotes(s.notes ?? "");

    // Inputs
    setSellPrice(Number(s.inputs.sellPrice));
    setSupplierCost(Number(s.inputs.supplierCost));
    setFx(Number(s.inputs.fx));
    setFreight(Number(s.inputs.freight));
    setDutyPct(Number(s.inputs.dutyPct));
    setVatPct(Number(s.inputs.vatPct));
    setOtherCost(Number(s.inputs.otherCost));
    setLeadDays(Number(s.inputs.leadDays));
    setCapitalRate(Number(s.inputs.capitalRate));

    // Shocks
    setShockDuty(Number(s.shocks.shockDuty));
    setShockFx(Number(s.shocks.shockFx));
    setShockLead(Number(s.shocks.shockLead));
  }

  async function deleteScenario(id: string) {
    const res = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (selectedId === id) setSelectedId(null);
      await refreshList();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Scenario Simulator</h1>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={refreshList}>
          Refresh list
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Simulator */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-semibold">Base case</div>
            <Field label="Sell price (GBP)" value={sellPrice} setValue={setSellPrice} />
            <Field label="Supplier cost (USD)" value={supplierCost} setValue={setSupplierCost} />
            <Field label="FX USD→GBP" value={fx} setValue={setFx} step={0.01} />
            <Field label="Freight per unit (GBP)" value={freight} setValue={setFreight} step={0.1} />
            <Field label="Other cost per unit (GBP)" value={otherCost} setValue={setOtherCost} step={0.1} />
            <Field label="Duty (%)" value={dutyPct} setValue={setDutyPct} />
            <Field label="VAT (%)" value={vatPct} setValue={setVatPct} />
            <Field label="Lead time (days)" value={leadDays} setValue={setLeadDays} />
            <Field label="Cost of capital (% annual)" value={capitalRate} setValue={setCapitalRate} />
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-semibold">Policy shock</div>
            <Field label="Duty shock (+%)" value={shockDuty} setValue={setShockDuty} />
            <Field label="FX shock (% change)" value={shockFx} setValue={setShockFx} />
            <Field label="Lead time shock (+days)" value={shockLead} setValue={setShockLead} />

            <div className="mt-4 rounded-md border p-3 text-sm space-y-2">
              <div className="font-semibold">Outputs</div>
              <Row label="Base margin" value={`${result.base.marginPct.toFixed(1)}%`} />
              <Row label="Shock margin" value={`${result.shock.marginPct2.toFixed(1)}%`} />
              <Row label="Margin change" value={`${result.delta.margin.toFixed(1)}pp`} />
              <Row
                label="Base profit (after capital)"
                value={`£${result.base.profitAfterCapital.toFixed(2)}`}
              />
              <Row
                label="Shock profit (after capital)"
                value={`£${result.shock.profitAfterCapital2.toFixed(2)}`}
              />
              <Row label="Profit change" value={`£${result.delta.profit.toFixed(2)}`} />
              <Row label="Landed cost change" value={`£${result.delta.landed.toFixed(2)}`} />
            </div>
          </div>
        </div>

        {/* Save/Load */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-semibold">Save scenario</div>
            <label className="grid gap-2 text-sm">
              <span className="opacity-80">Name</span>
              <input
                className="rounded-md border px-3 py-2"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="opacity-80">Country code (optional)</span>
              <input
                className="rounded-md border px-3 py-2"
                placeholder="US / UK / CN ..."
                value={countryCode ?? ""}
                onChange={(e) => setCountryCode(e.target.value || null)}
              />
            </label>

            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={autoSuggestShocks}
            >
              Auto-suggest shocks (from action cards)
            </button>

            {autoMsg ? <div className="text-xs opacity-70">{autoMsg}</div> : null}
            {autoRationale ? (
              <div className="text-xs opacity-70">
                <span className="font-semibold">Rationale:</span> {autoRationale}
              </div>
            ) : null}

            <label className="grid gap-2 text-sm">
              <span className="opacity-80">Notes (optional)</span>
              <textarea
                className="rounded-md border px-3 py-2 min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <button className="rounded-md border px-3 py-2 text-sm" onClick={saveScenario}>
              Save
            </button>

            {savingMsg ? <div className="text-xs opacity-70">{savingMsg}</div> : null}

            {selectedId ? (
              <div className="text-xs opacity-70">
                Loaded scenario: <span className="font-semibold">{selectedId}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">My scenarios</div>
              <div className="text-xs opacity-70">{list.length}</div>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-auto">
              {list.map((s) => (
                <div key={s.id} className="rounded-md border p-2">
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs opacity-70">
                    {s.country_code ?? "—"} · Updated {new Date(s.updated_at).toLocaleString()}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded-md border px-2 py-1 text-xs"
                      onClick={() => loadScenario(s.id)}
                    >
                      Load
                    </button>
                    <button
                      className="rounded-md border px-2 py-1 text-xs"
                      onClick={() => deleteScenario(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!list.length ? <div className="text-sm opacity-70">No saved scenarios yet.</div> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm opacity-70">
        Next: auto-suggest shocks from action cards + save scenario versions.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  step,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="grid grid-cols-2 gap-3 items-center text-sm">
      <span className="opacity-80">{label}</span>
      <input
        className="rounded-md border px-3 py-2"
        type="number"
        value={value}
        step={step ?? 1}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="opacity-80">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}