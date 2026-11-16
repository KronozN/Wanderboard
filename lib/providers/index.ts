import { curated } from "./curated";
import { google } from "./google";
import { ticketmaster } from "./ticketmaster";
import type { EventsProvider, PlacesProvider } from "./types";
export const placesProvider: PlacesProvider = google; // swap for a Google Places adapter later
export const eventProviders: EventsProvider[] = [curated, ticketmaster];
