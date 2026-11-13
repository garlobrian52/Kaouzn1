import "server-only";

export type PaymentRail = "crossmint_card" | "stalkchain_agent_wallet";

export type PurchaseApproval = {
  id: string;
  userId: string;
  rail: PaymentRail;
  merchant: string;
  amountCents: number;
  status: "approved" | "pending" | "denied" | "consumed";
  expiresAt: string;
};

export type PurchaseRequest = {
  userId: string;
  rail: PaymentRail;
  merchant: string;
  amountCents: number;
};

export type PolicyResult =
  | { allowed: true; approvalId: string }
  | { allowed: false; reason: string };

function positiveInteger(value: string | undefined): number | null {
  if (!value || !/^\\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function envEnabled(value: string | undefined): boolean {
  return value === "true";
}

/**
 * Server-side preflight only. Load approvals from trusted storage, atomically
 * consume them, and enforce provider/network limits before initiating payment.
 * Never accept the approval object directly from a browser or model tool call.
 */
export function checkPurchasePreflight(
  request: PurchaseRequest,
  approval: PurchaseApproval | null,
  now = new Date(),
): PolicyResult {
  if (!Number.isSafeInteger(request.amountCents) || request.amountCents <= 0) {
    return { allowed: false, reason: "invalid_amount" };
  }
  if (!request.userId || !request.merchant.trim()) {
    return { allowed: false, reason: "missing_identity_or_merchant" };
  }

  if (request.rail === "crossmint_card") {
    if (!envEnabled(process.env.CROSSMINT_ENABLED)) {
      return { allowed: false, reason: "crossmint_disabled" };
    }
    const cap = positiveInteger(process.env.CROSSMINT_MAX_PER_PURCHASE_CENTS);
    if (cap === null || request.amountCents > cap) {
      return { allowed: false, reason: "crossmint_cap_exceeded_or_unset" };
    }
  } else {
    if (!envEnabled(process.env.AGENT_WALLET_ENABLED)) {
      return { allowed: false, reason: "stalkchain_wallet_disabled" };
    }
    const cap = positiveInteger(process.env.AGENT_WALLET_MAX_PER_TX_CENTS);
    if (cap === null || request.amountCents > cap) {
      return { allowed: false, reason: "stalkchain_wallet_cap_exceeded_or_unset" };
    }
  }

  if (!approval || approval.status !== "approved") {
    return { allowed: false, reason: "explicit_user_approval_required" };
  }
  if (
    approval.userId !== request.userId ||
    approval.rail !== request.rail ||
    approval.merchant !== request.merchant ||
    approval.amountCents < request.amountCents
  ) {
    return { allowed: false, reason: "approval_scope_mismatch" };
  }

  const expiry = Date.parse(approval.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now.getTime()) {
    return { allowed: false, reason: "approval_expired" };
  }
  return { allowed: true, approvalId: approval.id };
}
