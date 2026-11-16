import data from "@/data/festivals.json";
import type { Festival } from "../types";
import type { EventsProvider } from "./types";
// Hand-maintained recurring festivals (data/festivals.json). Add entries per country; dates are approximate.
export const curated: EventsProvider = {
  name: "curated",
  async between({ country }) {
    return (data as (Festival & { country: string })[]).filter(f => f.country.toLowerCase() === country.toLowerCase());
  },
};
