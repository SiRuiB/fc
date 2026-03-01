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
  country_code: string;
  iso3: string | null;
  name: string | null;
  risk_level: number;
  updated_at: string;
  top_cards_expanded?: Card[];
};

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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

export default function RiskMapPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [rows, setRows] = useState<RiskRow[]>([]);
  const [msg, setMsg] = useState("");
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    iso3?: string;
    risk?: number;
    cards?: Card[];
  } | null>(null);

  async function loadData() {
    setMsg("Loading...");
    const res = await fetch("/api/country-risk", { cache: "no-store" });
    const text = await res.text();

    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      setMsg(`Error: ${json?.error ?? `HTTP ${res.status}`}`);
      return;
    }

    setRows(json?.rows ?? []);
    setMsg("");
  }

  useEffect(() => {
    loadData();
  }, []);

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
        .attr("stroke", "#999")
        .attr("strokeWidth", 0.6)
        .on("mousemove", function (event: MouseEvent, d: any) {
          const props = d?.properties ?? {};
          const name =
            (props?.ADMIN as string | undefined) ||
            (props?.NAME as string | undefined) ||
            "Country";

          const iso3 = pickIso3(props);
          const rr = iso3 ? riskByIso3.get(iso3) : undefined;

          setTooltip({
            x: event.clientX,
            y: event.clientY,
            name,
            iso3,
            risk: rr?.risk_level,
            cards: rr?.top_cards_expanded ?? [],
          });

          d3.select(this as SVGPathElement).attr("strokeWidth", 1.2);
        })
        .on("mouseleave", function () {
          setTooltip(null);
          d3.select(this as SVGPathElement).attr("strokeWidth", 0.6);
        });
    }

    draw();
  }, [rows]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Risk Map</h1>
          <p className="text-sm opacity-70 mt-1">
            Country heatmap driven by policy events and top action cards.
          </p>
        </div>

        <button
          className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 shadow-sm"
          onClick={loadData}
        >
          Refresh
        </button>
      </div>

      {msg ? <div className="text-sm opacity-70">{msg}</div> : null}

      {/* Map container */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm relative">
        <svg ref={svgRef} className="w-full h-[560px]" />

        {tooltip ? (
          <div
            className="fixed z-50 pointer-events-none rounded-xl border bg-white px-3 py-2 text-xs shadow-md"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12, width: 360 }}
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
          </div>
        ) : null}
      </div>

      <div className="text-sm opacity-70">
        Shading uses ISO3 via Natural Earth (ADM0_A3). Darker means higher risk.
      </div>
    </div>
  );
}