import Link from "next/link";

type Rail = "cash" | "crypto";

const config = {
  cash: {
    title: "USD cash withdrawal approval",
    method: "Verified bank payout",
    checks: ["Bank destination ownership must match the verified user.", "Only settled USD funds may be reserved.", "Provider-side payout limits and compliance checks are mandatory."],
  },
  crypto: {
    title: "Crypto withdrawal approval",
    method: "Allowlisted blockchain transfer",
    checks: ["Destination address and network must be validated and allowlisted.", "Asset-specific limits, fee estimation, and transaction simulation are required.", "Signing must happen in an isolated custody or MPC provider; never in the browser."],
  },
} satisfies Record<Rail, { title: string; method: string; checks: string[] }>;

export function WithdrawalApprovalScreen({ rail }: { rail: Rail }) {
  const item = config[rail];
  return (
    <main className="wrap approval-wrap">
      <nav className="nav">
        <Link className="brand" href="/wallet">Hello <span>Kaouzn</span></Link>
        <span className="pill">Fail-closed security mode</span>
      </nav>
      <header className="approval-heading">
        <div className="eyebrow">Separate withdrawal control</div>
        <h1>{item.title}</h1>
        <p>{item.method}. This approval path is independent from purchases and from the other withdrawal rail.</p>
      </header>
      <section className="approval-status-card">
        <div className="approval-status-top">
          <div><div className="eyebrow">Execution status</div><h2>Not connected</h2></div>
          <span className="approval-disabled"><span aria-hidden="true" /> Disabled</span>
        </div>
        <div className="approval-notice" role="status">
          <strong>No withdrawal can be approved or executed.</strong>
          <p>Trusted approval storage, server-side identity checks, atomic ledger reservation, provider integration, and independent security tests are not complete. No live payout or blockchain transfer is available.</p>
        </div>
        <div className="approval-meta">
          <div><span>Signed-in owner</span><strong>Clerk verification required</strong></div>
          <div><span>Available funds</span><strong>Settled ledger balance only</strong></div>
          <div><span>Approval</span><strong>Explicit, scoped, single-use</strong></div>
          <div><span>Limits</span><strong>Per transaction + daily + monthly</strong></div>
        </div>
        <div className="approval-actions">
          <button className="btn" type="button" disabled aria-disabled="true">Approve withdrawal — locked</button>
          <button className="btn alt" type="button" disabled aria-disabled="true">Reject request — locked</button>
        </div>
      </section>
      <section className="approval-guardrails">
        <h2>Required safeguards</h2>
        <ul>{item.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      </section>
      <div className="approval-footer">
        <Link href="/approvals/cash-withdrawal">Cash withdrawal</Link>
        <Link href="/approvals/crypto-withdrawal">Crypto withdrawal</Link>
        <Link href="/wallet">Wallet center</Link>
      </div>
    </main>
  );
}
