import { km } from "./geo";
import type { Day, Festival, Place } from "./types";

export const DAY_COLORS = ["#FF6B57", "#F2A93B", "#1FA6A0", "#7A5CFA", "#5BAA4E", "#E85D9E", "#3C8DEB"];
export const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const score = (p: Place) => p.rating + Math.log10(p.reviews + 1) * 0.3;
const onDay = (f: Festival, iso: string) => (f.recurring ? iso.slice(5) >= f.from && iso.slice(5) <= f.to : iso >= f.from && iso <= f.to);

// Takes the top-scored places, chains them nearest-neighbour from the best one, then cuts the chain into days.
export function buildItinerary(places: Place[], events: Festival[], start: string, days: number): Day[] {
  const rest = [...places].sort((a, b) => score(b) - score(a)).slice(0, days * 3);
  const path: Place[] = rest.length ? [rest.shift()!] : [];
  while (rest.length) {
    const last = path[path.length - 1];
    let bi = 0;
    rest.forEach((p, i) => { if (km(last, p) < km(last, rest[bi])) bi = i; });
    path.push(rest.splice(bi, 1)[0]);
  }
  const per = Math.max(1, Math.ceil(path.length / days));
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(start, i), ps = path.slice(i * per, (i + 1) * per);
    return { n: i + 1, date, color: DAY_COLORS[i % DAY_COLORS.length], region: ps[0] ? `Around ${ps[0].name}` : "Open day", places: ps, festivals: events.filter(f => onDay(f, date)).slice(0, 2) };
  });
}
