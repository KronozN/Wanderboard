import type { Location } from "../types";
import { ProviderError } from "./types";
// Photon (OpenStreetMap) geocoder. The public instance is fair-use only; self-host or switch to Mapbox/Google for heavy traffic.
export async function geocode(q: string): Promise<Location[]> {
  const res = await fetch(`https://photon.komoot.io/api/?${new URLSearchParams({ q, limit: "6", lang: "en" })}`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new ProviderError(`Search service returned ${res.status}`);
  const j = await res.json();
  return (j.features ?? []).map((f: any, i: number) => {
    const p = f.properties ?? {};
    const label = [...new Set([p.name, p.state, p.country].filter(Boolean))].join(", ");
    return { id: `${p.osm_type ?? "x"}${p.osm_id ?? i}`, label, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], country: p.country ?? "" };
  });
}
