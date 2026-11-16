import { NextRequest, NextResponse } from "next/server";
import { geocode } from "@/lib/providers/photon";
import { fail } from "@/lib/http";
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 80) return NextResponse.json({ results: [] });
  try { return NextResponse.json({ results: await geocode(q) }); } catch (e) { return fail(e); }
}
