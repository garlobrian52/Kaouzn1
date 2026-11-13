import "server-only";

export type WithdrawalRail = "cash" | "crypto";

export type WithdrawalApproval = {
  id: string;
  userId: string;
  rail: WithdrawalRail;
  destinationId: string;
  asset: string;
  network: string | null;
  amountBaseUnits: string;
  status: "pending" | "approved" | "denied" | "consumed";
  expiresAt: string;
};

export type WithdrawalRequest = {
  userId: string;
  rail: WithdrawalRail;
  destinationId: string;
  destinationOwnedAndVerified: boolean;
  assetNetworkAllowlisted: boolean;
  asset: string;
  network: string | null;
  amountBaseUnits: string;
  settledAvailableBaseUnits: string;
  dailyUsedBaseUnits: string;
  monthlyUsedBaseUnits: string;
};

export type WithdrawalLimits = {
  enabled: boolean;
  maxPerWithdrawalBaseUnits: string;
  dailyCapBaseUnits: string;
  monthlyCapBaseUnits: string;
};

export type WithdrawalPolicyResult =
  | { allowed: true; approvalId: string }
  | { allowed: false; reason: string };

function positiveUnits(value: string): bigint | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

/**
 * Fail-closed preflight only. The caller must load all records from trusted
 * storage, lock/reserve the ledger balance, and atomically consume approval
 * in one database transaction before any provider call. This function never
 * sends a payout or signs a blockchain transaction.
 */
export function checkWithdrawalPreflight(
  request: WithdrawalRequest,
  approval: WithdrawalApproval | null,
  limits: WithdrawalLimits,
  now = new Date(),
): WithdrawalPolicyResult {
  const amount = positiveUnits(request.amountBaseUnits);
  const available = positiveUnits(request.settledAvailableBaseUnits) ?? 0n;
  const dailyUsed = positiveUnits(request.dailyUsedBaseUnits) ?? 0n;
  const monthlyUsed = positiveUnits(request.monthlyUsedBaseUnits) ?? 0n;
  const perWithdrawalCap = positiveUnits(limits.maxPerWithdrawalBaseUnits);
  const dailyCap = positiveUnits(limits.dailyCapBaseUnits);
  const monthlyCap = positiveUnits(limits.monthlyCapBaseUnits);

  if (!amount) return { allowed: false, reason: "invalid_amount" };
  if (!request.userId || !request.destinationId) {
    return { allowed: false, reason: "missing_identity_or_destination" };
  }
  if (!request.destinationOwnedAndVerified) {
    return { allowed: false, reason: "destination_not_verified_for_user" };
  }
  if (!request.assetNetworkAllowlisted) {
    return { allowed: false, reason: "asset_or_network_not_allowlisted" };
  }
  if (!limits.enabled) return { allowed: false, reason: "withdrawal_rail_disabled" };
  if (!perWithdrawalCap || !dailyCap || !monthlyCap) {
    return { allowed: false, reason: "withdrawal_limits_unset_or_invalid" };
  }
  if (amount > available) return { allowed: false, reason: "insufficient_settled_balance" };
  if (amount > perWithdrawalCap) return { allowed: false, reason: "per_withdrawal_cap_exceeded" };
  if (dailyUsed + amount > dailyCap) return { allowed: false, reason: "daily_cap_exceeded" };
  if (monthlyUsed + amount > monthlyCap) return { allowed: false, reason: "monthly_cap_exceeded" };

  if (!approval || approval.status !== "approved") {
    return { allowed: false, reason: "explicit_approval_required" };
  }
  if (
    approval.userId !== request.userId ||
    approval.rail !== request.rail ||
    approval.destinationId !== request.destinationId ||
    approval.asset !== request.asset ||
    approval.network !== request.network ||
    approval.amountBaseUnits !== request.amountBaseUnits
  ) {
    return { allowed: false, reason: "approval_scope_mismatch" };
  }
  const expiry = Date.parse(approval.expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now.getTime()) {
    return { allowed: false, reason: "approval_expired" };
  }
  return { allowed: true, approvalId: approval.id };
}
