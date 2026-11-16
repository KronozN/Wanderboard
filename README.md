# Wanderboard
Next.js trip planner: worldwide place search, compare (up to 3), rating sort, filters, colour-coded itinerary with festivals.

## Run
```bash
corepack enable            # once, to get pnpm
cp .env.example .env.local # add GOOGLE_PLACES_API_KEY (free, google.com/maps)
pnpm install && pnpm dev   # http://localhost:3000
```
## How it works
`Search box -> /api/geocode (Photon) -> /api/places (GOOGLE/-> UI`, and `Build itinerary -> /api/events (curated + Ticketmaster)`.
Providers live in `lib/providers/`; implement `PlacesProvider` / `EventsProvider` to add Google Places, Foursquare or PredictHQ and register them in `lib/providers/index.ts`. Keys stay server-side.
- Google Places API gives a 1-5 rating score, not star ratings or review counts. The UI labels it "rating".
- Festivals: Ticketmaster is strongest in the US/Europe. Add recurring ones per country in `data/festivals.json` (dates approximate, verify before travel).
- Photon's public server is fair-use; self-host or switch geocoder for heavy traffic.
- Sort default is ascending per spec: flip `DEFAULT_SORT` in `app/page.tsx`.
## Deploy
- Vercel: push to GitHub, import the repo, add the env vars in Project Settings.
- Docker: `docker build -t wanderboard . && docker run -p 3000:3000 --env-file .env.local wanderboard`
# Wanderboard