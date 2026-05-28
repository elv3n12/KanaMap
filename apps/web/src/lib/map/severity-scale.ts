import { scaleLinear, scaleSequential } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";

const VIOLET = [139, 92, 246] as const;
const AMBER = [245, 158, 11] as const;
const RED = [220, 38, 38] as const;

function rgb([r, g, b]: readonly [number, number, number], alpha = 255): [number, number, number, number] {
  return [r, g, b, alpha];
}

const severityInterpolator = interpolateRgbBasis([
  `rgb(${VIOLET.join(",")})`,
  `rgb(${AMBER.join(",")})`,
  `rgb(${RED.join(",")})`,
]);

export const severityColorScale = scaleSequential(severityInterpolator).domain([0, 6]);

export function severityCount(zone: { adverseEffects: string[] }): number {
  return zone.adverseEffects.length;
}

export function severityRgb(count: number): [number, number, number, number] {
  const t = Math.min(Math.max(count, 0), 6);
  const hex = severityColorScale(t);
  const m = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(hex);
  if (!m) return rgb(VIOLET);
  return [Number(m[1]), Number(m[2]), Number(m[3]), 220];
}

export function severityHex(count: number): string {
  return severityColorScale(Math.min(Math.max(count, 0), 6));
}

export function markerRadius(moleculeCount: number): number {
  const base = 6;
  const scaled = base + Math.sqrt(Math.max(moleculeCount, 1)) * 4;
  return Math.min(scaled, 28);
}

export const legendTicks = [0, 2, 4, 6] as const;

export const legendGradientStops = legendTicks.map((t) => ({
  offset: `${(t / 6) * 100}%`,
  color: severityColorScale(t),
}));

export function legendLabel(t: number): string {
  if (t === 0) return "Low";
  if (t >= 6) return "High";
  return String(t);
}

export const legendWidthScale = scaleLinear().domain([0, 6]).range([0, 100]);
