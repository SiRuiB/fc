"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type Card = {
  id: string;
  title: string;
  risk_level: number;
  confidence: number;
  created_at: string;
};

type RiskRow = {
  country_code: string; // "US", "UK"
  iso3: string | null; // "USA", "GBR"
  name: string | null;
  risk_level: number; // 0-100 aggregated
  updated_at: string;
  top_cards_expanded?: Card[];
};

// Natural Earth Admin-0 countries (ISO fields are much more consistent)
const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// risk 0..100 -> grayscale darker for higher risk
function riskToFill(risk: number) {
  const v = clamp(risk, 0, 100);
  const shade = 245 - Math.round((v / 100) * 170); // 245..75
  return `rgb(${shade},${shade},${shade})`;
}

function pickIso3(props: any): string | undefined {
  const cand =
    props?.ADM0_A3 ??
    props?.ISO_A3 ??
    props?.SOV_A3 ??
    props?.GU_A3 ??
    props?.BRK_A3;

  if (!cand || typeof cand !== "string") return undefined;
  if (cand === "-99") return undefined;
  return cand;
}

function formatWhen(ts?: string) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

export default function RiskMapPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [rows, setRows] = useState<RiskRow[]>([]);
  const [msg, setMsg] = useState("");

  // hover tooltip
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    iso3?: string;
    risk?: number;
    cards?: Card[];
  } | null>(null);

  // click-to-lock selection
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null);

  async function loadData() {
    setMsg("Loading...");
    const res = await fetch("/api/country-risk", { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) {
      setMsg(`Error: ${json.error}`);
      return;
    }
    setRows(json.rows ?? []);
    setMsg("");
  }

  useEffect(() => {
    loadData();
  }, []);

  // Lookup for side panel
  const selectedRow =
    selectedIso3 && rows.find((r) => r.iso3 === selectedIso3)
      ? rows.find((r) => r.iso3 === selectedIso3)
      : null;

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 980;
    const height = 540;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const projection = d3
      .geoNaturalEarth1()
      .scale(175)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const riskByIso3 = new Map<string, RiskRow>();
    for (const r of rows) {
      if (r.iso3) riskByIso3.set(r.iso3, r);
    }

    async function draw() {
      const geo = (await d3.json(GEOJSON_URL)) as any;
      const features: any[] = geo?.features ?? [];
      if (!features.length) return;

      const g = svg.append("g");

      g.selectAll<SVGPathElement, any>("path")
        .data(features)
        .enter()
        .append("path")
        .attr("d", (d: any) => path(d) ?? "")
        .attr("fill", (d: any) => {
          const iso3 = pickIso3(d?.properties);
          const rr = iso3 ? riskByIso3.get(iso3) : undefined;
          return rr ? riskToFill(rr.risk_level) : "#eee";
        })
        .attr("stroke", (d: any) => {
          const iso3 = pickIso3(d?.properties);
          return iso3 && selectedIso3 && iso3 === selectedIso3 ? "#111" : "#999";
        })
        .attr("strokeWidth", (d: any) => {
          const iso3 = pickIso3(d?.properties);
          return iso3 && selectedIso3 && iso3 === selectedIso3 ? 1.4 : 0.6;
        })
        .style("cursor", "pointer")
        .on("mousemove", function (event: MouseEvent, d: any) {
          const props = d?.properties ?? {};
          const name =
            (props?.ADMIN as string | undefined) ||
            (props?.NAME as string | undefined) ||
            "Country";

          const iso3 = pickIso3(props);
          const rr = iso3 ? riskByIso3.get(iso3) : undefined;

          // If user has clicked (locked selection), we don't override tooltip
          if (!selectedIso3) {
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              name,
              iso3,
              risk: rr?.risk_level,
              cards: rr?.top_cards_expanded ?? [],
            });
          }

          // hover emphasis (unless selected)
          if (!selectedIso3) {
            d3.select(this as SVGPathElement).attr("strokeWidth", 1.2);
          }
        })
        .on("mouseleave", function () {
          if (!selectedIso3) setTooltip(null);
          if (!selectedIso3) {
            d3.select(this as SVGPathElement).attr("strokeWidth", 0.6);
          }
        })
        .on("click", function (event: MouseEvent, d: any) {
          const iso3 = pickIso3(d?.properties);
          const props = d?.properties ?? {};
          const name =
            (props?.ADMIN as string | undefined) ||
            (props?.NAME as string | undefined) ||
            "Country";

          if (!iso3) {
            setSelectedIso3(null);
            setTooltip({
              x: event.clientX,
              y: event.clientY,
              name,
              iso3: undefined,
              risk: undefined,
              cards: [],
            });
            return;
          }

          // toggle
          setSelectedIso3((prev) => (prev === iso3 ? null : iso3));

          const rr = riskByIso3.get(iso3);
          setTooltip({
            x: event.clientX,
            y: event.clientY,
            name,
            iso3,
            risk: rr?.risk_level,
            cards: rr?.top_cards_expanded ?? [],
          });
        });
    }

    draw();
  }, [rows, selectedIso3]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Risk Map</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={loadData}
          >
            Refresh
          </button>
          <button
            className="rounded-md border px-3 py-1 text-sm"
            onClick={() => {
              setSelectedIso3(null);
              setTooltip(null);
            }}
          >
            Clear selection
          </button>
        </div>
      </div>

      {msg ? <div className="text-sm opacity-80">{msg}</div> : null}

      <div className="grid grid-cols-12 gap-4">
        {/* Map */}
        <div className="col-span-12 lg:col-span-8 rounded-lg border p-4 relative">
          <svg ref={svgRef} className="w-full h-[560px]" />

          {tooltip ? (
            <div
              className="fixed z-50 pointer-events-none rounded-md border bg-white px-3 py-2 text-xs shadow"
              style={{ left: tooltip.x + 12, top: tooltip.y + 12, width: 340 }}
            >
              <div className="font-medium">{tooltip.name}</div>

              <div className="mt-1 opacity-80">
                ISO3:{" "}
                <span className="font-semibold">{tooltip.iso3 ?? "—"}</span>
              </div>

              <div className="mt-1 opacity-80">
                Risk:{" "}
                <span className="font-semibold">
                  {typeof tooltip.risk === "number" ? tooltip.risk : "—"}
                </span>
              </div>

              {tooltip.cards && tooltip.cards.length ? (
                <div className="mt-2 space-y-1">
                  <div className="text-[11px] font-semibold opacity-70">
                    Top action cards
                  </div>
                  {tooltip.cards.slice(0, 3).map((c) => (
                    <div key={c.id} className="text-[11px] opacity-80">
                      • {c.title}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-[11px] opacity-60">
                  No top cards for this country.
                </div>
              )}

              <div className="mt-2 text-[11px] opacity-60">
                Tip: click a country to lock selection.
              </div>
            </div>
          ) : null}
        </div>

        {/* Side panel */}
        <div className="col-span-12 lg:col-span-4 rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Selected</div>
            <div className="text-xs opacity-70">
              {selectedRow?.country_code ?? "None"}
            </div>
          </div>

          {!selectedRow ? (
            <div className="text-sm opacity-70">
              Click a country on the map to lock it and view details here.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border p-3">
                <div className="text-sm font-semibold">
                  {selectedRow.name ?? selectedRow.country_code}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {selectedRow.country_code} · {selectedRow.iso3} · Updated{" "}
                  {formatWhen(selectedRow.updated_at)}
                </div>
                <div className="mt-2 text-sm">
                  Risk score:{" "}
                  <span className="font-semibold">{selectedRow.risk_level}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Top action cards</div>

                {(selectedRow.top_cards_expanded ?? []).length ? (
                  (selectedRow.top_cards_expanded ?? []).map((c) => (
                    <div key={c.id} className="rounded-md border p-3">
                      <div className="text-sm font-medium">{c.title}</div>
                      <div className="mt-1 text-xs opacity-70">
                        Risk: {c.risk_level} · Conf: {c.confidence} ·{" "}
                        {formatWhen(c.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm opacity-70">No top cards.</div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t text-xs opacity-70">
            Next: connect selected country to Simulator defaults (duty, delays,
            compliance overhead) based on action cards.
          </div>
        </div>
      </div>
    </div>
  );
}