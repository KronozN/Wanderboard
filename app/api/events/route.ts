import { NextRequest, NextResponse } from "next/server";
import { eventProviders } from "@/lib/providers";
import { fail, num } from "@/lib/http";
import { ProviderError } from "@/lib/providers/types";
import type { Festival } from "@/lib/types";
const ISO = /^\d{4}-\d{2}-\d{2}$/;
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams, start = sp.get("start") ?? "", end = sp.get("end") ?? "";
    if (!ISO.test(start) || !ISO.test(end) || end < start || +new Date(end) - +new Date(start) > 31 * 864e5) throw new ProviderError("Invalid date range (max 31 days)", 400);
    const where = { lat: num(req, "lat", -90, 90), lng: num(req, "lng", -180, 180), country: (sp.get("country") ?? "").slice(0, 80) };
    const out = await Promise.allSettled(eventProviders.map(p => p.between(where, start, end)));
    const events: Festival[] = out.flatMap(r => (r.status === "fulfilled" ? r.value : []));
    const warnings = out.flatMap((r, i) => (r.status === "rejected" ? [`${eventProviders[i].name} events unavailable.`] : []));
    return NextResponse.json({ events, warnings });
  } catch (e) { return fail(e); }
}
