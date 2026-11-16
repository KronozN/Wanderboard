import type { Place, Vibe } from "@/lib/types";
import { placeCost, STYLE, Style } from "@/lib/cost";
const THEME: Record<Vibe, { emoji: string; a: string; b: string }> = {
  food: { emoji: "🍜", a: "#FF6B57", b: "#F2A93B" }, nature: { emoji: "🌿", a: "#1FA6A0", b: "#5BAA4E" },
  culture: { emoji: "🏛️", a: "#7A5CFA", b: "#E85D9E" }, city: { emoji: "🌆", a: "#3C8DEB", b: "#7A5CFA" },
};
export default function Postcard({ p, i, on, tier, onToggle }: { p: Place; i: number; on: boolean; tier: Style; onToggle: () => void }) {
  const t = THEME[p.vibe], cost = Math.round(placeCost(p) * STYLE[tier].mult);
  return (
    <article className={`card ${on ? "on" : ""}`} style={{ ["--tilt" as string]: `${[-1.2, 0.8, -0.5, 1.1][i % 4]}deg`, ["--a" as string]: t.a, ["--b" as string]: t.b }}>
      <div className="art" aria-hidden="true"><span>{t.emoji}</span><div className="stamp">{p.rating.toFixed(1)}</div></div>
      <div className="body">
        <h3>{p.name}</h3>
        <p className="meta"><span>{p.vibe}</span><span>{p.reviews.toLocaleString()} reviews</span><span>{cost === 0 ? "Free" : `≈ $${cost} pp`}</span></p>
        {p.blurb && <p>{p.blurb}</p>}
        <div className="row">
          <button onClick={onToggle} aria-pressed={on}>{on ? "Remove" : "Compare"}</button>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}&query_place_id=${p.id}`} target="_blank" rel="noreferrer">Map ↗</a>
        </div>
      </div>
    </article>
  );
}