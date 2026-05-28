"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { ZonePayload } from "@/lib/report-serializers";

type Props = {
  zones: ZonePayload[];
  onSelect: (zone: ZonePayload) => void;
};

function severityColor(adverseEffectCount: number): string {
  const t = Math.min(adverseEffectCount / 6, 1);
  const r = Math.round(34 + t * (220 - 34));
  const g = Math.round(197 - t * (197 - 38));
  const b = Math.round(94 - t * (94 - 38));
  return `rgb(${r}, ${g}, ${b})`;
}

function circleRadius(moleculeCount: number): number {
  const base = 8;
  const scaled = base + Math.sqrt(moleculeCount) * 6;
  return Math.min(scaled, 40);
}

function ClusteredZones({ zones, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const layers: L.CircleMarker[] = [];

    for (const zone of zones) {
      const radius = circleRadius(zone.molecules.length);
      const color = severityColor(zone.adverseEffects.length);

      const circle = L.circleMarker([zone.centroidLat, zone.centroidLng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.55,
        weight: 2,
        opacity: 0.9,
      });

      circle.on("click", () => onSelect(zone));
      circle.addTo(map);
      layers.push(circle);
    }

    return () => {
      for (const layer of layers) {
        map.removeLayer(layer);
      }
    };
  }, [map, onSelect, zones]);

  return null;
}

export function ZoneMap(props: Props) {
  return (
    <MapContainer center={[48.8566, 2.3522]} zoom={5} minZoom={3} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ClusteredZones {...props} />
    </MapContainer>
  );
}
