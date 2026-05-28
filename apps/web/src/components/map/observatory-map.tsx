"use client";

import { useMemo } from "react";
import Map, { NavigationControl, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { MapboxOverlayProps } from "@deck.gl/mapbox";
import type { ZonePayload } from "@/lib/report-serializers";
import { getObservatoryMapStyle, MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/map/map-style";
import { markerRadius, severityCount, severityRgb } from "@/lib/map/severity-scale";

type Props = {
  zones: ZonePayload[];
  onSelect: (zone: ZonePayload) => void;
  selectedZoneId?: string | null;
};

type ZonePoint = ZonePayload & {
  lat: number;
  lng: number;
  severity: number;
  radius: number;
};

function toPoints(zones: ZonePayload[]): ZonePoint[] {
  return zones.map((z) => ({
    ...z,
    lat: z.centroidLat,
    lng: z.centroidLng,
    severity: severityCount(z),
    radius: markerRadius(z.molecules.length),
  }));
}

function DeckGLOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export function ObservatoryMap({ zones, onSelect, selectedZoneId }: Props) {
  const points = useMemo(() => toPoints(zones), [zones]);
  const mapStyle = useMemo(() => getObservatoryMapStyle(), []);

  const layers = useMemo(() => {
    const haloLayer = new ScatterplotLayer<ZonePoint>({
      id: "zones-halo",
      data: points,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => d.radius * 2.8,
      getFillColor: (d) => {
        const [r, g, b] = severityRgb(d.severity);
        return [r, g, b, 56];
      },
      radiusUnits: "pixels",
      pickable: false,
    });

    const coreLayer = new ScatterplotLayer<ZonePoint>({
      id: "zones-core",
      data: points,
      getPosition: (d) => [d.lng, d.lat],
      getRadius: (d) => {
        const base = d.radius;
        return d.locationId === selectedZoneId ? base * 1.2 : base;
      },
      getFillColor: (d) => severityRgb(d.severity),
      getLineColor: (d) =>
        d.locationId === selectedZoneId ? [167, 139, 250, 255] : [255, 255, 255, 80],
      getLineWidth: (d) => (d.locationId === selectedZoneId ? 2 : 1),
      lineWidthUnits: "pixels",
      stroked: true,
      radiusUnits: "pixels",
      pickable: true,
      onClick: (info: PickingInfo<ZonePoint>) => {
        if (info.object) onSelect(info.object);
      },
      updateTriggers: {
        getRadius: [selectedZoneId],
        getLineColor: [selectedZoneId],
        getLineWidth: [selectedZoneId],
      },
    });

    return [haloLayer, coreLayer];
  }, [points, selectedZoneId, onSelect]);

  return (
    <Map
      mapLib={import("maplibre-gl")}
      initialViewState={{
        longitude: MAP_DEFAULT_CENTER.lng,
        latitude: MAP_DEFAULT_CENTER.lat,
        zoom: MAP_DEFAULT_ZOOM,
      }}
      minZoom={3}
      maxZoom={14}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      cursor="crosshair"
      attributionControl={{ compact: true }}
    >
      <DeckGLOverlay interleaved layers={layers} />
      <NavigationControl position="bottom-right" showCompass={false} visualizePitch={false} />
    </Map>
  );
}
