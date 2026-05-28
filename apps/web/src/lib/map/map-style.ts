/** MapTiler basemap — DataViz Dark tuned for Observatory void aesthetic */

export function getObservatoryMapStyle(): string {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (key) {
    return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${key}`;
  }
  // Fallback: OpenFreeMap dark vector (no key required for dev)
  return "https://tiles.openfreemap.org/styles/dark";
}

export const MAP_DEFAULT_CENTER = { lng: 8, lat: 50 } as const;
export const MAP_DEFAULT_ZOOM = 4;
