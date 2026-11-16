import { NextRequest, NextResponse } from "next/server";
import { placesProvider } from "@/lib/providers";
import { fail, num } from "@/lib/http";
export async function GET(req: NextRequest) {
  try {
    const places = await placesProvider.nearby(num(req, "lat", -90, 90), num(req, "lng", -180, 180), num(req, "radius", 1, 50));
    return NextResponse.json({ places });
  } catch (e) { return fail(e); }
}
