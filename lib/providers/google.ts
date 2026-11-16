import type { Place, Vibe } from "../types";
import { PlacesProvider, ProviderError } from "./types";

const MIN_REVIEWS = 50; // hides places with too few reviews for the rating to mean much
const GROUPS: Record<Vibe, string[]> = {
  food: ["restaurant", "cafe"],
  nature: ["park", "national_park"],
  culture: ["museum", "art_gallery", "church", "hindu_temple", "mosque", "synagogue"],
  city: ["tourist_attraction", "amusement_park", "aquarium", "zoo", "shopping_mall"],
};
const PRICE: Record<string, 0 | 1 | 2 | 3 | 4> = { PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 };

const FIELDS = "places.id,places.displayName,places.rating,places.userRatingCount,places.primaryType,places.location,places.editorialSummary,places.priceLevel";

async function search(vibe: Vibe, types: string[], lat: number, lng: number, radiusM: number, key: string): Promise<Place[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    cache: "no-store", // Google's terms limit caching of Places content
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify({
      includedTypes: types, maxResultCount: 20, rankPreference: "POPULARITY",
      locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: radiusM } },
    }),
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => null))?.error?.message;
    throw new ProviderError(`Google Places: ${msg ?? res.status}`);
  }
  const j = await res.json();
  return (j.places ?? []).flatMap((x: any): Place[] =>
    x.rating && x.userRatingCount >= MIN_REVIEWS && x.displayName?.text && x.location
      ? [{ 
        id: x.id, 
        name: x.displayName.text, 
        vibe, rating: x.rating, 
        reviews: x.userRatingCount, 
        ratingSource: "stars", 
        priceLevel: PRICE[x.priceLevel], 
        blurb: x.editorialSummary?.text ?? (x.primaryType ?? "").replace(/_/g, " "), lat: x.location.latitude, lng: x.location.longitude }]
      : []);
}

export const google: PlacesProvider = {
  name: "google",
  async nearby(lat, lng, radiusKm) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) throw new ProviderError("GOOGLE_PLACES_API_KEY is not set. Enable Places API (New) in Google Cloud and add the key to .env.local.", 503);
    // One request per vibe (20 results each), so the vibe filter works without guessing from type lists.
    const groups = await Promise.all((Object.entries(GROUPS) as [Vibe, string[]][]).map(([v, t]) => search(v, t, lat, lng, radiusKm * 1000, key)));
    const seen = new Set<string>();
    return groups.flat().filter(p => !seen.has(p.id) && seen.add(p.id));
  },
};