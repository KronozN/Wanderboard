import { NextRequest, NextResponse } from "next/server";
import { ProviderError } from "./providers/types";
export function num(req: NextRequest, key: string, min: number, max: number): number {
  const v = Number(req.nextUrl.searchParams.get(key));
  if (!Number.isFinite(v) || v < min || v > max) throw new ProviderError(`Invalid "${key}"`, 400);
  return v;
}
export function fail(e: unknown) {
  const err = e instanceof ProviderError ? e : new ProviderError("Unexpected server error", 500);
  return NextResponse.json({ error: err.message }, { status: err.status });
}
