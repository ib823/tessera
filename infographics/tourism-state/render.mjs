#!/usr/bin/env node
// Renders the "tourism dependency by Malaysian state" infographic.
//
// Reads data.json, draws a tile-grid cartogram (one rounded tile per state,
// arranged in an approximate geographic grid — peninsula on the left, Borneo
// on the right) plus a ranked dependency table, then rasterises the SVG to PNG
// with sharp (already a project dependency; no map library / headless browser).
//
//   node infographics/tourism-state/render.mjs
//
// Output: infographics/tourism-state/tourism-state.png

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(join(HERE, "data.json"), "utf8"));

// ---- canvas geometry (logical units; rasterised at 2x for crispness) ----
const W = 1200;
const H = 1700;
const SCALE = 2;

const BG = "#0f0f23";        // T4A deep navy
const PANEL = "#1c1c4d";
const PANEL_SOFT = "#15153a";
const INK = "#f4f4ff";
const MUTE = "#9aa0c8";
const NA = "#5b6078";

// ---- helpers ----
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pctOf(s) {
  if (s.gdp_rm_b == null || s.receipts_rm_b == null) return null;
  return (s.receipts_rm_b / s.gdp_rm_b) * 100;
}

function bandColor(pct) {
  if (pct == null) return NA;
  for (const b of data.bands) if (pct < b.max) return b.color;
  return data.bands[data.bands.length - 1].color;
}

// Enrich states with computed percentage + colour.
const states = data.states.map((s) => {
  const pct = pctOf(s);
  return { ...s, pct, color: bandColor(pct) };
});
const anyPending = states.some((s) => s.pct == null);

// ---- cartogram grid ----
const COLS = 7;
const ROWS = 6;
const TILE = 110;
const GAP = 12;
const gridW = COLS * TILE + (COLS - 1) * GAP;
const gridH = ROWS * TILE + (ROWS - 1) * GAP;
const ORIGIN_X = (W - gridW) / 2;
const ORIGIN_Y = 320;

function tile(s) {
  const x = ORIGIN_X + s.grid.c * (TILE + GAP);
  const y = ORIGIN_Y + s.grid.r * (TILE + GAP);
  const valTxt = s.pct == null ? "n/a" : `${s.pct.toFixed(1)}%`;
  const valColor = s.pct == null ? MUTE : "#0f0f23";
  // dark bands need light value text for contrast
  const darkBand = s.pct == null || s.pct < 2;
  const vCol = darkBand ? INK : valColor;
  const ftMark = s.ft
    ? `<circle cx="${x + TILE - 16}" cy="${y + 16}" r="5" fill="${INK}" opacity="0.7"/>`
    : "";
  return `
    <g>
      <rect x="${x}" y="${y}" width="${TILE}" height="${TILE}" rx="12"
            fill="${s.color}" stroke="${BG}" stroke-width="2"/>
      ${ftMark}
      <text x="${x + TILE / 2}" y="${y + 44}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="22" font-weight="700"
            fill="${darkBand ? INK : "#0f0f23"}">${esc(s.code)}</text>
      <text x="${x + TILE / 2}" y="${y + 74}" text-anchor="middle"
            font-family="Arial, sans-serif" font-size="20" font-weight="700"
            fill="${vCol}">${valTxt}</text>
    </g>`;
}

// ---- legend ----
function legend() {
  const chipH = 38;
  const y = 250;
  let x = ORIGIN_X;
  const parts = data.bands
    .map((b) => {
      const w = 24 + b.label.length * 11 + 26;
      const g = `
        <g>
          <rect x="${x}" y="${y}" width="${w}" height="${chipH}" rx="19" fill="${b.color}"/>
          <text x="${x + w / 2}" y="${y + 25}" text-anchor="middle"
                font-family="Arial, sans-serif" font-size="18" font-weight="700"
                fill="${b.max <= 2 ? INK : "#0f0f23"}">${esc(b.label)}</text>
        </g>`;
      x += w + 10;
      return g;
    })
    .join("");
  return parts;
}

// ---- ranking table ----
function ranking() {
  const ranked = states
    .filter((s) => s.pct != null)
    .sort((a, b) => b.pct - a.pct);
  const pending = states.filter((s) => s.pct == null);

  const tx = ORIGIN_X;
  const ty = 1110;
  const rowH = 46;
  const colW = gridW;

  let rows = "";
  ranked.forEach((s, i) => {
    const ry = ty + 52 + i * rowH;
    rows += `
      <rect x="${tx}" y="${ry - 32}" width="${colW}" height="${rowH - 6}" rx="8"
            fill="${i % 2 ? PANEL_SOFT : PANEL}"/>
      <circle cx="${tx + 28}" cy="${ry - 9}" r="11" fill="${s.color}"/>
      <text x="${tx + 56}" y="${ry - 2}" font-family="Arial, sans-serif"
            font-size="24" font-weight="600" fill="${INK}">${esc(s.state)}</text>
      <text x="${tx + colW - 130}" y="${ry - 2}" text-anchor="end"
            font-family="Arial, sans-serif" font-size="17" fill="${MUTE}">RM${s.receipts_rm_b}b / RM${s.gdp_rm_b}b</text>
      <text x="${tx + colW - 16}" y="${ry - 2}" text-anchor="end"
            font-family="Arial, sans-serif" font-size="24" font-weight="700"
            fill="${INK}">${s.pct.toFixed(1)}%</text>`;
  });

  let pendingNote = "";
  if (pending.length) {
    const names = pending.map((s) => s.state);
    const perLine = 6;
    const lines = [];
    for (let i = 0; i < names.length; i += perLine)
      lines.push(names.slice(i, i + perLine).join(", "));
    const baseY = ty + 60 + ranked.length * rowH + 16;
    pendingNote =
      `<text x="${tx}" y="${baseY}" font-family="Arial, sans-serif" font-size="18"
             font-weight="700" fill="${MUTE}">Awaiting DOSM figures (${pending.length}):</text>` +
      lines
        .map(
          (ln, i) =>
            `<text x="${tx}" y="${baseY + 28 + i * 26}" font-family="Arial, sans-serif"
                   font-size="18" fill="${MUTE}">${esc(ln)}</text>`,
        )
        .join("");
  }

  return `
    <text x="${tx}" y="${ty}" font-family="Arial, sans-serif" font-size="28"
          font-weight="700" fill="${INK}">States ranked by domestic tourism dependency</text>
    ${rows}
    ${pendingNote}`;
}

// ---- draft watermark ----
function watermark() {
  if (!anyPending) return "";
  return `
    <g transform="translate(${W / 2}, ${H / 2}) rotate(-24)">
      <text x="0" y="0" text-anchor="middle" font-family="Arial, sans-serif"
            font-size="74" font-weight="800" fill="#ffffff" opacity="0.10">
        DRAFT — PENDING DOSM VERIFICATION</text>
    </g>`;
}

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}"
     viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- header -->
  <rect x="40" y="40" width="${W - 80}" height="170" rx="18" fill="${PANEL}"/>
  <text x="70" y="110" font-family="Arial, sans-serif" font-size="46" font-weight="800"
        fill="${INK}">How tourism-dependent is each state?</text>
  <text x="70" y="158" font-family="Arial, sans-serif" font-size="26" fill="${MUTE}">
    Domestic tourism receipts as % of state GDP · Malaysia · 2024</text>
  <text x="70" y="190" font-family="Arial, sans-serif" font-size="18" fill="${MUTE}">
    Derived ratio · domestic tourism only (not comparable to international receipts charts)</text>

  ${legend()}
  ${states.map(tile).join("")}
  ${ranking()}
  ${watermark()}

  <!-- footer -->
  <line x1="40" y1="${H - 96}" x2="${W - 40}" y2="${H - 96}" stroke="${PANEL}" stroke-width="2"/>
  <text x="40" y="${H - 64}" font-family="Arial, sans-serif" font-size="17" fill="${MUTE}">
    Source: Department of Statistics Malaysia (DOSM) — Domestic Tourism Survey (States) 2024 &amp; GDP by State 2024. CC-BY 4.0.</text>
  <text x="40" y="${H - 40}" font-family="Arial, sans-serif" font-size="17" fill="${MUTE}">
    Metric = domestic tourism receipts ÷ nominal state GDP (derived; both 2024). ● = federal territory.</text>
</svg>`;

const out = join(HERE, "tourism-state.png");
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`Wrote ${out}`);
console.log(
  `States with computed %: ${states.filter((s) => s.pct != null).length}/${states.length}` +
    (anyPending ? "  (DRAFT — pending values present)" : ""),
);
