import { NextResponse } from "next/server";
import {
  callStalkchainTool,
  isAuthorized,
  isResearchTool,
  RESEARCH_TOOLS,
} from "@/lib/stalkchain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VALUE_LENGTH = 180;

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
  }

  const { tool, params } = body as { tool?: unknown; params?: unknown };
  if (!isResearchTool(tool)) {
    return NextResponse.json({ error: "Research tool is not allowlisted" }, { status: 400 });
  }
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return NextResponse.json({ error: "params must be an object" }, { status: 400 });
  }

  const allowed = RESEARCH_TOOLS[tool] as readonly string[];
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!allowed.includes(key)) {
      return NextResponse.json({ error: `Unsupported parameter: ${key}` }, { status: 400 });
    }
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      return NextResponse.json({ error: `Invalid parameter: ${key}` }, { status: 400 });
    }
    const normalized = String(value).trim();
    if (!normalized || normalized.length > MAX_VALUE_LENGTH) {
      return NextResponse.json({ error: `Invalid parameter: ${key}` }, { status: 400 });
    }
    clean[key] = normalized;
  }

  if (tool === "stalkchain_fomo_search" && !clean.q) {
    return NextResponse.json({ error: "q is required for trader/token search" }, { status: 400 });
  }
  if ((tool === "stalkchain_wallet_pnl" || tool === "stalkchain_token_info") && !clean.address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const data = await callStalkchainTool(tool, clean);
    return NextResponse.json({ ok: true, tool, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "STALKCHAIN_NOT_CONFIGURED" ? 503 : 502;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
