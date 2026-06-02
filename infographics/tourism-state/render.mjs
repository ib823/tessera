#!/usr/bin/env node
// Renders the "tourism dependency by Malaysian state" infographic.
//
// Draws a true geographic choropleth of Malaysia's 16 states (domestic tourism
// receipts as % of state GDP, 2024) plus a legend and two ranked panels, then
// rasterises the SVG to PNG with sharp. Inspired by the country-level
// "how dependent are countries on tourism" infographic: light paper theme,
// boarding-pass header, banded colours, ranked tables.
//
//   node infographics/tourism-state/render.mjs
//
// Output: infographics/tourism-state/tourism-state.png
//
// Boundaries: malaysia-states.geojson (DOSM open data, dosm-malaysia/data-open,
// administrative_1_state — simplified to 3-decimal coords). Offline/reproducible.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";

const HERE = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(join(HERE, "data.json"), "utf8"));
const geo = JSON.parse(await readFile(join(HERE, "malaysia-states.geojson"), "utf8"));

// QR -> canonical T4A page for this infographic + writeup
const QR_URL = "https://thefourthangle.pages.dev/infographics/tourism-state";
const QR_LABEL = "thefourthangle.pages.dev/infographics/tourism-state";
const qr = QRCode.create(QR_URL, { errorCorrectionLevel: "M" });

// ---- canvas ----
const W = 1240;
const H = 1500;
const SCALE = 2;

// light paper palette
const PAPER = "#efe7d6";
const INK = "#2c2b38";
const MUTE = "#6f6a5d";
const BANNER = "#3b3b76";
const BANNER2 = "#2c2c5c";
const CREAM = "#f6f1e6";
const PANEL = "#fbf7ee";
const PANEL_LINE = "#e3d9c4";
const NA = "#b9b2a3";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(n < 10 ? 2 : 1));

// ---- model ----
function pctOf(s) {
  if (s.gdp_rm_b == null || s.receipts_rm_b == null) return null;
  return (s.receipts_rm_b / s.gdp_rm_b) * 100;
}
function bandColor(pct) {
  if (pct == null) return NA;
  for (const b of data.bands) if (pct < b.max) return b.color;
  return data.bands[data.bands.length - 1].color;
}
const states = data.states.map((s) => {
  const pct = pctOf(s);
  return { ...s, pct, color: bandColor(pct) };
});
const byName = new Map(states.map((s) => [s.state, s]));
const anyPending = states.some((s) => s.pct == null);

// geojson name -> data.json name (Putrajaya folds into Kuala Lumpur)
const NAME_MAP = {
  "Pulau Pinang": "Penang",
  "W.P. Kuala Lumpur": "Kuala Lumpur",
  "W.P. Labuan": "Labuan",
  "W.P. Putrajaya": "Kuala Lumpur",
};
const dataName = (gn) => NAME_MAP[gn] || gn;

// ---- projection (equirectangular, fit to map box) ----
const MX = 36, MY = 372, MW = W - 72, MH = 486;
let minLon = 1e9, maxLon = -1e9, minLat = 1e9, maxLat = -1e9;
const walk = (c, f) => {
  if (typeof c[0] === "number") f(c[0], c[1]);
  else for (const cc of c) walk(cc, f);
};
for (const ft of geo.features)
  walk(ft.geometry.coordinates, (lon, lat) => {
    minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
  });
const k = Math.min(MW / (maxLon - minLon), MH / (maxLat - minLat));
const usedW = (maxLon - minLon) * k, usedH = (maxLat - minLat) * k;
const offX = MX + (MW - usedW) / 2, offY = MY + (MH - usedH) / 2;
const px = (lon) => offX + (lon - minLon) * k;
const py = (lat) => offY + (maxLat - lat) * k;

const ringPath = (ring) =>
  ring.map((p, i) => `${i ? "L" : "M"}${px(p[0]).toFixed(1)} ${py(p[1]).toFixed(1)}`).join("") + "Z";
function polysOf(geom) {
  return geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
}
// shoelace area + centroid (projected) of a ring
function ringStats(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const x0 = px(ring[i][0]), y0 = py(ring[i][1]);
    const x1 = px(ring[i + 1][0]), y1 = py(ring[i + 1][1]);
    const cr = x0 * y1 - x1 * y0;
    a += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-6) return { area: 0, cx: px(ring[0][0]), cy: py(ring[0][1]) };
  return { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a) };
}

// build per-feature render info
const shapes = geo.features.map((ft) => {
  const s = byName.get(dataName(ft.properties.state));
  const polys = polysOf(ft.geometry);
  let big = null;
  let d = "";
  for (const poly of polys) {
    d += poly.map(ringPath).join(""); // outer + holes (fill-rule evenodd)
    const st = ringStats(poly[0]);
    if (!big || st.area > big.area) big = st;
  }
  return {
    name: ft.properties.state,
    d,
    color: s ? s.color : NA,
    pct: s ? s.pct : null,
    area: big.area,
    cx: big.cx,
    cy: big.cy,
  };
});
// draw large areas first, small enclaves (KL/Putrajaya) last so they sit on top
shapes.sort((a, b) => b.area - a.area);

function mapSvg() {
  const paths = shapes
    .map(
      (s) =>
        `<path d="${s.d}" fill="${s.color}" fill-rule="evenodd" stroke="${PAPER}" stroke-width="1.1" stroke-linejoin="round"/>`,
    )
    .join("");
  // on-map % labels for states with enough area (skip tiny enclaves; panels cover them)
  const labels = shapes
    .filter((s) => s.pct != null && s.area > 2600 && s.name !== "W.P. Putrajaya" && s.name !== "W.P. Kuala Lumpur")
    .map((s) => {
      const dark = s.pct == null || s.pct < 2;
      const fill = dark ? "#ffffff" : "#1d1c26";
      const t = `${s.pct.toFixed(1)}%`;
      return `<text x="${s.cx.toFixed(1)}" y="${(s.cy + 4).toFixed(1)}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="15" font-weight="800"
        fill="${fill}" stroke="${dark ? "#00000055" : "#ffffffcc"}" stroke-width="2.4"
        paint-order="stroke">${t}</text>`;
    })
    .join("");
  // KL callout (federal-territory cluster is too small to label in place)
  const kl = byName.get("Kuala Lumpur");
  const klShape = shapes.find((s) => s.name === "W.P. Kuala Lumpur");
  let callout = "";
  if (kl && klShape) {
    const lx = klShape.cx, ly = klShape.cy;
    const bx = Math.min(lx, MX + 150), by = MY + MH - 26;
    callout = `
      <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${(by - 9).toFixed(1)}"
            stroke="${INK}" stroke-width="1" opacity="0.55"/>
      <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.6" fill="${INK}"/>
      <text x="${bx.toFixed(1)}" y="${by.toFixed(1)}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="14" font-weight="800" fill="${INK}">
        KL + Putrajaya ${kl.pct.toFixed(1)}%</text>`;
  }
  return paths + labels + callout;
}

// ---- legend pills ----
function legend(y) {
  let x = 0;
  const items = data.bands.map((b) => {
    const w = 30 + b.label.length * 10;
    const g = { x, w, b };
    x += w + 12;
    return g;
  });
  const total = x - 12;
  const startX = (W - total) / 2;
  return items
    .map(({ x, w, b }) => {
      const cx = startX + x;
      const light = b.max <= 2;
      return `<g>
        <rect x="${cx}" y="${y}" width="${w}" height="34" rx="17" fill="${b.color}"/>
        <text x="${cx + w / 2}" y="${y + 23}" text-anchor="middle" font-family="Arial, sans-serif"
              font-size="16" font-weight="800" fill="${light ? "#ffffff" : "#1d1c26"}">${esc(b.label)}</text>
      </g>`;
    })
    .join("");
}

// ---- ranked panel ----
function panel(x, y, w, title, rows) {
  const rowH = 40;
  const bodyTop = y + 74;
  const h = 74 + rows.length * rowH + 12;
  let out = `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${PANEL}" stroke="${PANEL_LINE}" stroke-width="1.5"/>
    <rect x="${x}" y="${y}" width="${w}" height="40" rx="16" fill="${BANNER}"/>
    <rect x="${x}" y="${y + 22}" width="${w}" height="18" fill="${BANNER}"/>
    <text x="${x + 18}" y="${y + 26}" font-family="Arial, sans-serif" font-size="17" font-weight="800" fill="${CREAM}">${esc(title)}</text>`;
  rows.forEach((r, i) => {
    const ry = bodyTop + i * rowH;
    if (i % 2)
      out += `<rect x="${x + 8}" y="${ry - 26}" width="${w - 16}" height="${rowH - 6}" rx="8" fill="#00000008"/>`;
    out += `
      <circle cx="${x + 30}" cy="${ry - 8}" r="13" fill="${r.color}"/>
      <text x="${x + 30}" y="${ry - 3}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="800" fill="${r.color === NA || r.dark ? "#fff" : "#1d1c26"}">${i + 1}</text>
      <text x="${x + 52}" y="${ry - 3}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="${INK}">${esc(r.name)}</text>
      <text x="${x + w - 96}" y="${ry - 3}" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="${MUTE}">${esc(r.meta)}</text>
      <text x="${x + w - 16}" y="${ry - 3}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="${r.color === NA ? MUTE : r.color}">${esc(r.val)}</text>`;
  });
  return out;
}

const ranked = states.filter((s) => s.pct != null);
const depRows = [...ranked]
  .sort((a, b) => b.pct - a.pct)
  .slice(0, 8)
  .map((s) => ({
    name: s.state,
    color: s.color,
    dark: s.pct < 2,
    val: `${s.pct.toFixed(1)}%`,
    meta: `RM${fmt(s.receipts_rm_b)}b`,
  }));
const gdpRows = [...ranked]
  .sort((a, b) => b.gdp_rm_b - a.gdp_rm_b)
  .slice(0, 8)
  .map((s) => ({
    name: s.state,
    color: s.color,
    dark: s.pct < 2,
    val: `${s.pct.toFixed(1)}%`,
    meta: `RM${fmt(s.gdp_rm_b)}b GDP`,
  }));

// ---- QR card (white rounded card + dark modules, row-run merged) ----
function qrCard(x, y, size) {
  const n = qr.modules.size;
  const d = qr.modules.data;
  const pad = size * 0.1;
  const inner = size - pad * 2;
  const m = inner / n;
  let mods = "";
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (d[r * n + c]) {
        let c2 = c;
        while (c2 < n && d[r * n + c2]) c2++;
        mods += `<rect x="${(x + pad + c * m).toFixed(2)}" y="${(y + pad + r * m).toFixed(2)}" width="${((c2 - c) * m + 0.35).toFixed(2)}" height="${(m + 0.35).toFixed(2)}" fill="#1d1c26"/>`;
        c = c2;
      } else c++;
    }
  }
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="#ffffff"/>${mods}`;
}

// ---- header (boarding-pass style, QR stub) ----
function header() {
  const x = 36, y = 36, w = W - 72, h = 250;
  const perf = x + w - 372;        // perforation line
  const stubCx = perf + (x + w - perf) / 2; // centre of right stub
  const qrSize = 118;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${BANNER}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="url(#bannerGrad)"/>
    <line x1="${perf}" y1="${y + 18}" x2="${perf}" y2="${y + h - 18}"
          stroke="${CREAM}" stroke-width="2" stroke-dasharray="2 7" opacity="0.5"/>

    <text x="${x + 28}" y="${y + 58}" font-family="Arial, sans-serif" font-size="15" font-weight="700"
          fill="${CREAM}" opacity="0.85" letter-spacing="3">DOMESTIC TOURISM · MALAYSIA · 2024</text>
    <text x="${x + 26}" y="${y + 116}" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="#ffffff">How tourism-dependent</text>
    <text x="${x + 26}" y="${y + 162}" font-family="Arial, sans-serif" font-size="40" font-weight="800" fill="#ffffff">is each Malaysian state?</text>
    <text x="${x + 28}" y="${y + 204}" font-family="Arial, sans-serif" font-size="18" fill="${CREAM}" opacity="0.9">Domestic tourism receipts as % of state GDP · derived ratio, 2024</text>

    <text x="${stubCx}" y="${y + 42}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="800"
          fill="${CREAM}" letter-spacing="2">✈ SCAN FOR THE WRITEUP</text>
    ${qrCard(stubCx - qrSize / 2, y + 54, qrSize)}
    <text x="${stubCx}" y="${y + 196}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12.5" fill="${CREAM}" opacity="0.92">${esc(QR_LABEL)}</text>
    <text x="${stubCx}" y="${y + 222}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${CREAM}" opacity="0.62">Full data, sources &amp; method</text>`;
}

function watermark() {
  if (!anyPending) return "";
  return `<g transform="translate(${W / 2}, ${H / 2}) rotate(-24)">
    <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif" font-size="74" font-weight="800"
          fill="#000000" opacity="0.10">DRAFT — PENDING DOSM VERIFICATION</text></g>`;
}

const panelsY = 880;
const colW = (W - 72 - 24) / 2;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bannerGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${BANNER}"/>
      <stop offset="1" stop-color="${BANNER2}"/>
    </linearGradient>
    <radialGradient id="vign" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.06"/>
    </radialGradient>
    <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${PAPER}"/>
      <circle cx="1" cy="1" r="0.5" fill="#000000" opacity="0.03"/>
      <circle cx="4" cy="3" r="0.5" fill="#ffffff" opacity="0.05"/>
      <circle cx="2.5" cy="5" r="0.5" fill="#000000" opacity="0.025"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect width="${W}" height="${H}" fill="url(#grain)"/>
  <rect width="${W}" height="${H}" fill="url(#vign)"/>

  ${header()}
  ${legend(308)}

  <text x="${W / 2}" y="364" text-anchor="middle" font-family="Arial, sans-serif" font-size="13"
        font-weight="700" fill="${MUTE}" letter-spacing="1.5">SHARE OF EACH STATE'S GDP THAT COMES FROM DOMESTIC TOURISM</text>
  ${mapSvg()}

  <text x="36" y="${panelsY - 14}" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="${INK}">The rankings</text>
  ${panel(36, panelsY, colW, "Most tourism-dependent states", depRows)}
  ${panel(36 + colW + 24, panelsY, colW, "Largest state economies (by GDP)", gdpRows)}

  ${watermark()}

  <line x1="36" y1="${H - 78}" x2="${W - 36}" y2="${H - 78}" stroke="${PANEL_LINE}" stroke-width="1.5"/>
  <text x="36" y="${H - 50}" font-family="Arial, sans-serif" font-size="14" fill="${MUTE}">
    Source: Department of Statistics Malaysia — Domestic Tourism Survey (States) 2024 &amp; GDP by State 2024 (current prices). CC-BY 4.0.</text>
  <text x="36" y="${H - 28}" font-family="Arial, sans-serif" font-size="14" fill="${MUTE}">
    Metric = domestic tourism receipts ÷ nominal state GDP (derived; both 2024). KL tile includes Putrajaya. Boundaries: DOSM open data.</text>
  <text x="${W - 36}" y="${H - 28}" text-anchor="end" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="${BANNER}">The Fourth Angle</text>
</svg>`;

const out = join(HERE, "tourism-state.png");
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`Wrote ${out}`);
console.log(
  `States with computed %: ${states.filter((s) => s.pct != null).length}/${states.length}` +
    (anyPending ? "  (DRAFT — pending values present)" : ""),
);
