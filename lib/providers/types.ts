import type { Festival, Place } from "../types";
export class ProviderError extends Error { constructor(msg: string, public status = 502) { super(msg); } }
// Swap or add providers here: implement these two interfaces and register them in ./index.ts.
export interface PlacesProvider { name: string; nearby(lat: number, lng: number, radiusKm: number): Promise<Place[]> }
export interface EventsProvider { name: string; between(where: { lat: number; lng: number; country: string }, from: string, to: string): Promise<Festival[]> }
