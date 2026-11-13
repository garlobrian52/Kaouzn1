import "server-only";
import { timingSafeEqual } from "node:crypto";

const BASE_URL = "https://data.stalkchain.com/api/v1";

export const RESEARCH_TOOLS = {
  stalkchain_fomo_search: ["q", "type", "limit"],
  stalkchain_fomo_leaderboard: ["window", "limit"],
  stalkchain_fomo_token_board: ["chain", "limit"],
  stalkchain_wallet_pnl: ["address"],
  stalkchain_token_info: ["address"],
} as const;

export type ResearchTool = keyof typeof RESEARCH_TOOLS;

export function isResearchTool(value: unknown): value is ResearchTool {
  return typeof value === "string" && Object.hasOwn(RESEARCH_TOOLS, value);
}

export function isAuthorized(request: Request): boolean {
  const expected = process.env.STALKCHAIN_PROXY_SECRET;
  const supplied = request.headers.get("x-hello-kaouzn-key");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function callStalkchainTool(
  tool: string,
  params: Record<string, string>,
) {
  const apiKey = process.env.STALKCHAIN_API_KEY;
  if (!apiKey) throw new Error("STALKCHAIN_NOT_CONFIGURED");

  const url = new URL(`${BASE_URL}/tools/${encodeURIComponent(tool)}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`STALKCHAIN_UPSTREAM_${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("STALKCHAIN_INVALID_RESPONSE");
  }
}
