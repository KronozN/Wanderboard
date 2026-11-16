import type { Festival } from "../types";
import { EventsProvider, ProviderError } from "./types";
export const ticketmaster: EventsProvider = {
  name: "ticketmaster",
  async between({ lat, lng }, from, to) {
    const key = process.env.TICKETMASTER_API_KEY;
    if (!key) return [];
    const qs = new URLSearchParams({ apikey: key, latlong: `${lat},${lng}`, radius: "50", unit: "km", classificationName: "festival", size: "20", sort: "date,asc", startDateTime: `${from}T00:00:00Z`, endDateTime: `${to}T23:59:59Z` });
    const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${qs}`, { next: { revalidate: 21600 } });
    if (!res.ok) throw new ProviderError(`Ticketmaster returned ${res.status}`);
    const j = await res.json();
    return (j._embedded?.events ?? []).flatMap((e: any): Festival[] => {
      const d = e.dates?.start?.localDate;
      return d ? [{ name: e.name, venue: e._embedded?.venues?.[0]?.name ?? "", from: d, to: d, blurb: "Listed on Ticketmaster.", recurring: false, url: e.url }] : [];
    });
  },
};
