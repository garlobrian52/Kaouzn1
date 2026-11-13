# Hello Kaouzn: Crossmint + StalkChain dual payment architecture

**Status: integration scaffold only.** This change does not configure provider credentials, cards, wallet signers, spending allowances, or live payments.

## Trust boundaries

- **StalkChain research** remains read-only.
- **StalkChain agent wallet** is a separate future payment rail with its own wallet identity, signer/custody boundary, allowlist, caps, ledger, and approval records. It must never receive Crossmint card credentials.
- **Crossmint Agent Commerce** is a separate card/checkout rail using `https://agent-commerce.demos-crossmint.com/api/mcp`.
- The model may propose a purchase and request an approval. It must not create, approve, raise, select, or consume its own spending approval.
- Crossmint's user-facing approval surface and provider/network-enforced limits are authoritative for card spending. A prompt, UI-only cap, or local preflight helper is not an enforceable payment limit.

## Repository findings

The inspected app is Next.js with AI SDK, Supabase packages, and an AI Gateway key. No verified end-user auth provider, MCP client, payment UI, approval database schema, or Crossmint credentials were found. Therefore this change deliberately does not expose a checkout endpoint or connect a live payment method.

The existing StalkChain feature branch contains a server-only read-only research proxy. Keep it separate from commerce/payment routes.

## Configuration

Copy the new variables from `.env.example` into server-side Vercel environment settings. Do not prefix secrets with `NEXT_PUBLIC_`.

- `CROSSMINT_MCP_URL`: hosted MCP endpoint.
- `CROSSMINT_ENABLED=false`: fail closed until auth, provider credentials, approval UI, and provider-side controls are configured.
- `CROSSMINT_MAX_PER_PURCHASE_CENTS`, `CROSSMINT_DAILY_CAP_CENTS`, `CROSSMINT_MONTHLY_CAP_CENTS`: proposed application ceilings in cents. Daily/monthly totals still require transactional storage enforcement.
- `AGENT_WALLET_ENABLED=false`: separate StalkChain wallet rail remains disabled.
- `AGENT_WALLET_MAX_PER_TX_CENTS`, `AGENT_WALLET_DAILY_CAP_CENTS`: wallet-specific limits. Never share Crossmint limits or credentials.

The example $25 per-purchase / $50 daily / $150 monthly Crossmint caps are proposed ceilings, not proof of provider enforcement. Confirm them in the provider dashboard and on the actual payment rail before enabling.

## Authentication milestone (Clerk selected)

Clerk is the selected identity provider. The app now wraps its layout in `ClerkProvider`, adds Clerk sign-in/sign-up routes, and uses `proxy.ts` with `clerkMiddleware` to protect `/approvals/*` and the future `/api/payments/*` namespace. Each approval screen also checks the Clerk server session and redirects unauthenticated visitors to sign-in. This derives identity from the verified Clerk session rather than request-body or model-supplied user IDs.

Required server environment variables are `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; configure them in the Clerk dashboard and Vercel environment settings. Set the sign-in and sign-up path variables shown in `.env.example`. Do not commit real keys. The Clerk application, production domain, allowed redirect URLs, and environment secrets still need to be configured and verified before deployment.

## Approval UI milestone (implemented)

Two separate routes now exist:

- `/approvals/crossmint` — Crossmint card/hosted-checkout approval surface.
- `/approvals/agent-wallet` — StalkChain agent-wallet approval surface.

Both screens are intentionally read-only placeholders: they show the independent rail, required safeguards, and a locked approval area. Approve/deny controls are disabled because verified end-user authentication and trusted approval storage are not present in the inspected repository. The inbox is explicitly marked not connected; no approval request is fabricated and no payment action is exposed. The home dashboard links to both screens.

## Required implementation sequence

1. Establish verified user authentication and derive `userId` from the server session. Never accept identity from model arguments.
2. Add a Supabase schema for payment approvals and a separate ledger per rail. Store approval ID, user ID, rail, merchant identifier, exact amount/currency, expiry, status, provider reference, and audit timestamps. Apply row-level security.
3. Build a user-only approval page. The agent can create a pending request only. Only the authenticated user can approve or deny it. Do not expose an MCP tool that approves or increases a limit.
4. Before execution, load the approval server-side and atomically transition `approved → consumed` in a transaction. Prevent replay and concurrent double-spend.
5. Enforce daily/monthly aggregate limits transactionally per user and per rail. Fail closed when usage data is unavailable.
6. Connect Crossmint using its current official Agent Commerce integration and OAuth/session model. Use the provider's hosted approval flow, card vault, agent-card/checkout APIs, and network-enforced limits where eligible. Never put card data in prompts, logs, Supabase, or StalkChain.
7. Implement the StalkChain wallet rail separately only after choosing a wallet provider and custody/signing model. Require explicit per-transaction approval and independent allowlists/caps. No private keys or seed phrases in model context.
8. Test denial, expired approval, wrong merchant, wrong rail, over-cap amount, replay, concurrent requests, provider timeout, duplicate callback, refund, and revocation.
9. Enable each rail independently only after security review and successful tests. Keep both disabled by default.

## Helper

`lib/commerce-policy.ts` provides a server-only fail-closed preflight check for exact user/rail/merchant/amount/expiry matching. It is not a substitute for authenticated approval storage, atomic consumption, provider authorization, or network-enforced spending controls.

## Separate approval screens (UI milestone)

Two isolated, intentionally non-functional approval surfaces now exist:

- `/payments/crossmint` — Crossmint card approval status and requirements.
- `/payments/stalkchain-wallet` — StalkChain agent-wallet approval status and requirements.

Both pages are informational only. They do not authenticate a user, create or approve a request, invoke MCP, authorize a provider, sign a transaction, or initiate a payment. The screens explicitly show the rails as disabled. This is intentional until the next backend milestone provides verified identity, RLS-protected approval records, user-only approval mutations, atomic one-time consumption, transactional per-rail limits, and security tests.

The two pages link to each other for navigation, but do not share approval state, credentials, limits, or wallet/card controls.
