# Wallet ledger and withdrawal backend — implementation gate

Status: design specification only. This document is not an applied database migration and does not enable withdrawals.

## Scope

- Cash wallet: USD represented as integer cents.
- Crypto wallet: only explicitly configured asset/network pairs; quantities represented as integer base units, never floating point.
- Identity: Clerk user ID is established server-side by a verified Clerk session. Never accept a user ID or ownership claim from the browser as authority.
- Destinations: bank accounts and crypto addresses are provider-verified and bound to one Clerk user. Destination changes require step-up verification and a cooling-off period.
- Withdrawals: cash and crypto have separate request, approval, limits, and execution controls.

## Database model to implement in a reviewed migration

Use a non-exposed schema (for example `wallet_private`) and keep all tables inaccessible to `anon` and `authenticated`. Enable RLS on every table as defense in depth. Do not expose ledger tables through PostgREST. A trusted server process may access them only after validating the Clerk session and resolving the user ID from `auth()`.

Required tables:

1. `wallet_accounts`: account ID, Clerk user ID, rail, asset, network, status, created timestamp. Unique per user/rail/asset/network.
2. `ledger_transactions`: immutable transaction header, idempotency key, transaction type, status, provider reference, timestamps. Unique idempotency key scoped to user and operation.
3. `ledger_postings`: immutable debit/credit postings in integer base units. Every posted transaction must balance to zero per asset/network.
4. `withdrawal_destinations`: owner user ID, rail, provider token/reference (never raw bank credentials), asset/network, verification status, allowlist status, created/verified timestamps.
5. `withdrawal_requests`: owner, rail, destination, exact amount, asset/network, status, expiry, idempotency key, provider reference, failure reason.
6. `withdrawal_approvals`: owner, rail, request ID, exact destination and amount scope, approver, expiry, one-time status, consumed timestamp.
7. `wallet_limits`: per-user and global per-rail/per-asset limits for transaction, daily, and monthly windows.
8. `wallet_audit_events`: append-only actor/action/resource metadata; never store secrets or full bank details.

## Atomic reservation protocol

Within one database transaction:

1. Lock the relevant user's available-balance account row with `SELECT ... FOR UPDATE`.
2. Check verified destination ownership, asset/network allowlist, settled available balance, and all transaction/day/month limits.
3. Verify the approval belongs to this user and exact request, is unexpired, and is still approved.
4. Insert the idempotent withdrawal request and reserve funds by moving available to pending through balanced ledger postings.
5. Consume the approval with a conditional update (`WHERE status = 'approved'`) and require exactly one affected row.
6. Commit. If any step fails, roll back all steps.

Only after reservation may a provider adapter be called. A provider timeout must be reconciled by idempotency key and webhook, not retried as a new payout. On provider success, post final settlement; on definitive failure, release the reservation with compensating ledger postings. Webhooks must have verified signatures and replay protection.

## Authorization boundaries

- Clerk session validation occurs server-side on every wallet API route.
- Use the verified Clerk `userId`; never trust request body user IDs, Clerk public/user metadata, or client-supplied balance values.
- Never expose Supabase service-role/secret keys in `NEXT_PUBLIC_*` variables or browser bundles.
- Do not create public `SECURITY DEFINER` functions. Prefer a private schema and narrowly granted server-only operations.
- If Clerk-to-Supabase JWT trust is configured later, test issuer, audience, subject, expiry, and RLS behavior. Do not assume Clerk IDs equal Supabase `auth.uid()`.
- All writes require idempotency keys, rate limiting, audit events, and explicit per-rail feature flags defaulting to false.

## Release gates — all must pass independently per rail

- Clerk auth and step-up verification tests.
- Ownership/IDOR and RLS negative tests.
- Double-spend, race, replay, duplicate webhook, idempotency, and rollback tests.
- Ledger balance invariant and daily/monthly limit concurrency tests.
- Provider sandbox tests and verified webhook tests.
- Independent security review and operational reconciliation procedures.

Until then: no deposits, payouts, crypto signing, or withdrawal approvals are enabled. The Crossmint purchase rail and StalkChain agent-wallet purchase rail remain independently disabled too.
