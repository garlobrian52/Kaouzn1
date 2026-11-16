import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getZoraReadClient, zoraStatus } from "@/lib/zora";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = getZoraReadClient();
    const [chainId, blockNumber] = await Promise.all([client.getChainId(), client.getBlockNumber()]);
    if (chainId !== 7777777) return NextResponse.json({ ok: false, error: "CHAIN_ID_MISMATCH", expected: 7777777, actual: chainId }, { status: 502 });
    return NextResponse.json({ ok: true, ...zoraStatus(), connected: true, latestBlock: blockNumber.toString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, ...zoraStatus(), connected: false, error: message }, { status: 503 });
  }
}
