"use client";
import { useEffect, useMemo, useState } from "react";
import { addDays, buildItinerary } from "@/lib/itinerary";
import type { Day, Festival, Location, Place, Vibe } from "@/lib/types";
import Postcard from "@/components/Postcard";
import DayRibbon from "@/components/DayRibbon";
import ComparePanel from "../components/ComparePanel";
import { dayCost, STYLE } from "@/lib/cost";

const VIBES: Vibe[] = ["food", "nature", "culture", "city"];
const DEFAULT_SORT: "asc" | "desc" = "asc"; // change to "desc" for best-rated first
const toggle = <T,>(a: T[], v: T) => (a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
async function getJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const r = await fetch(url, { signal }); const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "Request failed");
  return j;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loc, setLoc] = useState<Location | null>(null);
  const [radius, setRadius] = useState(15);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [cmp, setCmp] = useState<string[]>([]);
  const [days, setDays] = useState(7);
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(() => addDays(new Date().toISOString().slice(0, 10), 6));
  const [tier, setTier] = useState<"comfort" | "luxury">("comfort");
  const [trip, setTrip] = useState<Day[] | null>(null);
  const [building, setBuilding] = useState(false);

  // Debounced destination suggestions
  useEffect(() => {
    if (loc || query.trim().length < 2) { setSuggestions([]); return; }
    const ac = new AbortController();
    const t = setTimeout(() => getJSON<{ results: Location[] }>(`/api/geocode?q=${encodeURIComponent(query.trim())}`, ac.signal)
      .then(j => setSuggestions(j.results)).catch(e => e.name !== "AbortError" && setError(e.message)), 300);
    return () => { clearTimeout(t); ac.abort(); };
  }, [query, loc]);

  // Places near the chosen destination (re-runs, debounced, when the radius changes)
  useEffect(() => {
    if (!loc) return;
    const ac = new AbortController();
    const t = setTimeout(() => {
      setLoading(true); setError("");
      getJSON<{ places: Place[] }>(`/api/places?lat=${loc.lat}&lng=${loc.lng}&radius=${radius}`, ac.signal)
        .then(j => { setPlaces(j.places); setCmp([]); setTrip(null); })
        .catch(e => e.name !== "AbortError" && (setError(e.message), setPlaces([])))
        .finally(() => !ac.signal.aborted && setLoading(false));
    }, 400);
    return () => { clearTimeout(t); ac.abort(); };
  }, [loc, radius]);

  const results = useMemo(() => places
    .filter(p => p.rating >= minRating && (!vibes.length || vibes.includes(p.vibe)))
    .sort((a, b) => (sort === "asc" ? a.rating - b.rating : b.rating - a.rating)), [places, vibes, minRating, sort]);
  const picked = places.filter(p => cmp.includes(p.id));
  const onCompare = (id: string) => setCmp(c => (c.includes(id) ? c.filter(x => x !== id) : c.length < 3 ? [...c, id] : c));

  async function build() {
    if (!loc) return;
    setBuilding(true); setWarn("");
    let events: Festival[] = [];
    try {
      const j = await getJSON<{ events: Festival[]; warnings: string[] }>(`/api/events?lat=${loc.lat}&lng=${loc.lng}&country=${encodeURIComponent(loc.country)}&start=${start}&end=${addDays(start, days - 1)}`);
      events = j.events; setWarn(j.warnings.join(" "));
    } catch { setWarn("Festival data unavailable right now."); }
    setTrip(buildItinerary(places.filter(p => !vibes.length || vibes.includes(p.vibe)), events, start, days));
    setBuilding(false);
  }
  const total = trip ? trip.reduce((s, d) => s + dayCost(d.places, tier), 0) : 0;

  return (
    <main>
      <header className="hero">
  <p className="eyebrow">Trip planner</p>
  <h1>Where to <em>next?</em></h1>
  <p className="lead">Pick anywhere on Earth. See what's worth your time, compare the finalists, and get a day-by-day plan with a cost estimate.</p>
  <div className="quick">{["Lisbon", "Kyoto", "Hanoi", "Mexico City"].map(c => <button key={c} onClick={() => { setLoc(null); setQuery(c); }}>{c}</button>)}</div>
</header>
      <div className="pass">
        <div className="search">
          <input value={query} onChange={e => { setQuery(e.target.value); setLoc(null); }} placeholder="Search any city or region" aria-label="Search destination" />
          {suggestions.length > 0 && <ul className="suggest">{suggestions.map(s => <li key={s.id}><button onClick={() => { setLoc(s); setQuery(s.label); setSuggestions([]); }}>{s.label}</button></li>)}</ul>}
        </div>
        <label>Radius: {radius} km<input type="range" min={5} max={50} step={5} value={radius} onChange={e => setRadius(+e.target.value)} /></label>
        <label>Min rating: {minRating.toFixed(1)}<input type="range" min={0} max={5} step={0.5} value={minRating} onChange={e => setMinRating(+e.target.value)} /></label>
        <div className="chips">{VIBES.map(v => <button key={v} aria-pressed={vibes.includes(v)} onClick={() => setVibes(toggle(vibes, v))}>{v}</button>)}</div>
        <button onClick={() => setSort(s => (s === "asc" ? "desc" : "asc"))}>Rating: {sort === "asc" ? "low to high" : "high to low"}</button>
      </div>

      {error && <p className="banner" role="alert">{error}</p>}
      {!loc && !error && <p className="muted">Pick a destination from the suggestions to see places.</p>}
      {loading && <div className="grid" aria-busy="true">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" />)}</div>}
      <div className="grid">{results.map((p, i) => <Postcard key={p.id} p={p} i={i} on={cmp.includes(p.id)} onToggle={() => onCompare(p.id)} tier={tier} />)}</div>
      {loc && !loading && !error && !results.length && <p>No matches. Widen the radius, lower the minimum rating or clear a vibe.</p>}

      <h2>Plan my trip</h2>
      <div className="pass">
        <label>Start<input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
<label>End<input type="date" value={end} min={start} max={addDays(start, 30)} onChange={e => setEnd(e.target.value)} /></label>
<span className="pill">{days} {days === 1 ? "day" : "days"}</span>
<select value={tier} onChange={e => setTier(e.target.value as "comfort" | "luxury")} aria-label="Travel style">
  {(Object.keys(STYLE) as ("comfort" | "luxury")[]).map(s => <option key={s} value={s}>{STYLE[s].label}</option>)}
</select>
        <button className="go" onClick={build} disabled={!loc || !places.length || building}>{building ? "Building…" : "Build itinerary"}</button>
      </div>
      {warn && <p className="banner">{warn}</p>}
      {trip && <div className="summary">
        <div><b>{trip.length}</b><span>days</span></div>
        <div><b>${total}</b><span>est. per person</span></div>
        <div><b>{trip.reduce((s, d) => s + d.places.length, 0)}</b><span>stops</span></div>
        <div><b>{trip.reduce((s, d) => s + d.festivals.length, 0)}</b><span>festival days</span></div>
      </div>}
      {trip?.map(d => <DayRibbon key={d.n} d={d} tier={tier} />)}

     {picked.length > 0 && loc && <ComparePanel items={picked} center={loc} tier={tier} onRemove={onCompare} onClear={() => setCmp([])} />}
      <p className="muted">Place data from Google Places API</p>
    </main>
  );
}
