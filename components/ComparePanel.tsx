import { Fragment } from "react";
import type { Place } from "@/lib/types";
import { km } from "@/lib/geo";
import { placeCost, STYLE, Style } from "@/lib/cost";

type Row = {
  label: string;
  val: (p: Place) => number;
  show: (n: number) => string;
  best: "max" | "min";
};
export default function ComparePanel({
  items,
  center,
  tier,
  onRemove,
  onClear,
}: {
  items: Place[];
  center: { lat: number; lng: number };
  tier: Style;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const rows: Row[] = [
    {
      label: "Rating",
      val: (p) => p.rating,
      show: (n) => `${n.toFixed(1)} ★`,
      best: "max",
    },
    {
      label: "Reviews",
      val: (p) => p.reviews,
      show: (n) => n.toLocaleString(),
      best: "max",
    },
    {
      label: "Est. cost pp",
      val: (p) => Math.round(placeCost(p) * STYLE[tier].mult),
      show: (n) => (n === 0 ? "Free" : `$${n}`),
      best: "min",
    },
    {
      label: "From centre",
      val: (p) => km(center, p),
      show: (n) => `${n.toFixed(1)} km`,
      best: "min",
    },
  ];
  const winner = (r: Row) => {
    const v = items.map(r.val),
      b = r.best === "max" ? Math.max(...v) : Math.min(...v);
    return v.filter((x) => x === b).length === 1 ? v.indexOf(b) : -1; // ties have no winner
  };
  const wins = items.map(() => 0);
  rows.forEach((r) => {
    const w = winner(r);
    if (w >= 0) wins[w]++;
  });
  const max = Math.max(...wins),
    top = wins.indexOf(max);
  const verdict =
    items.length < 2
      ? "Add one more place to compare."
      : wins.filter((w) => w === max).length === 1
        ? `${items[top].name} wins ${max} of ${rows.length} categories.`
        : "Too close to call. Pick what matters most to you.";
  return (
    <aside className="cmp" aria-label="Compare places">
      <div className="cmp-top">
        <b>Compare ({items.length}/3)</b>
        <button onClick={onClear}>Clear</button>
      </div>
      <p className="cmp-verdict">{verdict}</p>
      <div
        className="cmp-grid"
        style={{
          gridTemplateColumns: `100px repeat(${items.length}, minmax(130px, 1fr))`,
        }}
      >
        <span />
        {items.map((p) => (
          <div key={p.id} className="cmp-head">
            <b>{p.name}</b>
            <button
              onClick={() => onRemove(p.id)}
              aria-label={`Remove ${p.name}`}
            >
              ×
            </button>
          </div>
        ))}
        {rows.map((r) => {
          const w = winner(r);
          return (
            <Fragment key={r.label}>
              <span className="cmp-label">{r.label}</span>
              {items.map((p, i) => (
                <span
                  key={p.id}
                  className={i === w ? "cmp-cell best" : "cmp-cell"}
                >
                  {r.show(r.val(p))}
                  {i === w && <em>Best</em>}
                </span>
              ))}
            </Fragment>
          );
        })}
      </div>
    </aside>
  );
}
