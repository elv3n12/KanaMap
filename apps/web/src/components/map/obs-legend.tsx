"use client";

import { useEffect, useRef } from "react";
import { axisBottom } from "d3-axis";
import { select } from "d3-selection";
import { legendGradientStops, legendLabel, legendTicks, legendWidthScale } from "@/lib/map/severity-scale";

const WIDTH = 160;
const HEIGHT = 28;

export function ObsLegend() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = select(svgRef.current);
    if (!svg.node()) return;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "obs-severity-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    for (const stop of legendGradientStops) {
      gradient.append("stop").attr("offset", stop.offset).attr("stop-color", stop.color);
    }

    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 4)
      .attr("width", WIDTH)
      .attr("height", 8)
      .attr("rx", 2)
      .attr("fill", "url(#obs-severity-gradient)");

    const xScale = legendWidthScale.range([0, WIDTH]);
    const g = svg.append("g").attr("transform", `translate(0, ${HEIGHT - 4})`);

    g.call(
      axisBottom(xScale)
        .tickValues([...legendTicks])
        .tickFormat((d) => legendLabel(Number(d)))
        .tickSize(0),
    );

    g.select(".domain").remove();
    g.selectAll("text").attr("fill", "#8b8b94").attr("font-size", "9px").attr("font-family", "inherit");
    g.selectAll("line").remove();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="obs-label shrink-0">Severity</span>
      <svg ref={svgRef} width={WIDTH} height={HEIGHT} aria-hidden className="overflow-visible" />
    </div>
  );
}
