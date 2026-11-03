import { NextResponse } from "next/server";
import { callStalkchainTool, isAuthorized } from "@/lib/stalkchain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await callStalkchainTool("stalkchain_health", {});
    return NextResponse.json({ ok: true, provider: "stalkchain", data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "STALKCHAIN_NOT_CONFIGURED" ? 503 : 502;
    return NextResponse.json(
      { ok: false, error: message },
      { status },
    );
  }
}
