import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  emitInstatusTestSignals,
  forceFlushTelemetry,
  initTelemetry,
} from "@/lib/telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request, expectedKey: string): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expectedKey);
  return suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  const apiKey = process.env.INSTATUS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "INSTATUS_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request, apiKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    initTelemetry();
    emitInstatusTestSignals();
    await forceFlushTelemetry();
    return NextResponse.json({
      ok: true,
      acceptedForExport: true,
      signals: ["logs", "traces", "metrics"],
      service: "ai-revenue-os",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
