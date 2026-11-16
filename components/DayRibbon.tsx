import type { Day } from "@/lib/types";
import { dayCost, Style } from "@/lib/cost";
export default function DayRibbon({ d, tier }: { d: Day; tier: Style }) {
  const label = new Date(d.date + "T00:00:00Z").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <section className="day" style={{ ["--c" as string]: d.color }}>
      <header><strong>Day {d.n}</strong><span>{label} · {d.region}</span><span className="cost"> ${dayCost(d.places, tier)}pp</span></header>
      {d.festivals.map(f => <p key={f.name} className="fest">🏮 {f.url ? <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a> : f.name}{f.venue && ` at ${f.venue}`}. {f.blurb}</p>)}
      {d.places.length ? d.places.map(p => <p key={p.id}><b>{p.name}</b> ({p.rating.toFixed(1)}){p.blurb && `. ${p.blurb}`}</p>) : <p className="muted">Open day. Widen the radius or add vibes to fill it.</p>}
    </section>
  );
}
