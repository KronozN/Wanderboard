import type { Place } from "./types";
export const STYLE = { budget: { label: "Budget", mult: 0.6 }, comfort: { label: "Comfort", mult: 1 }, luxury: { label: "Luxury", mult: 2.2 } };
export type Style = keyof typeof STYLE;
const BY_LEVEL = [0, 8, 20, 45, 90];                       // USD per activity from Google's price level
const BY_VIBE = { food: 15, nature: 5, culture: 10, city: 15 }; // fallback when no price level exists
const DAILY_BASE = 65; // USD: meals, local transport, shared lodging. Tune this
export const placeCost = (p: Place) => (p.priceLevel !== undefined ? BY_LEVEL[p.priceLevel] : BY_VIBE[p.vibe]);
export const dayCost = (ps: Place[], tier: Style) => Math.round((DAILY_BASE + ps.reduce((s, p) => s + placeCost(p), 0)) * STYLE[tier].mult);