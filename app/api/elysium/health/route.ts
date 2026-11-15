import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { elysiumStatus, getElysiumReadClient } from "@/lib/elysium";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const client = getElysiumReadClient();
    const [chainId, blockNumber] = await Promise.all([client.getChainId(), client.getBlockNumber()]);
    if (chainId !== 99901) return NextResponse.json({ ok: false, error: "CHAIN_ID_MISMATCH", expected: 99901, actual: chainId }, { status: 502 });
    return NextResponse.json({ ok: true, ...elysiumStatus(), connected: true, latestBlock: blockNumber.toString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ ok: false, ...elysiumStatus(), connected: false, error: message }, { status: 503 });
  }
}
