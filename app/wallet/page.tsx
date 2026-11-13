import Link from "next/link";

const assets = [
  { name: "USD cash wallet", detail: "Bank payouts only to a verified account owned by the signed-in user.", status: "Design ready" },
  { name: "Multi-asset crypto wallet", detail: "Asset and network support must be explicitly allowlisted before deposits or withdrawals.", status: "Asset list pending" },
];

export default function WalletPage() {
  return (
    <main className="wrap approval-wrap">
      <nav className="nav">
        <Link className="brand" href="/">Hello <span>Kaouzn</span></Link>
        <span className="pill">Wallet setup • test mode</span>
      </nav>

      <header className="approval-heading">
        <div className="eyebrow">Cash + crypto wallet</div>
        <h1>Your wallet center</h1>
        <p>One place to review USD cash and supported crypto balances. Withdrawals are designed for verified, settled funds and destinations owned by the signed-in account.</p>
      </header>

      <section className="approval-status-card">
        <div className="approval-status-top">
          <div>
            <div className="eyebrow">Wallet availability</div>
            <h2>Withdrawals are disabled</h2>
          </div>
          <span className="approval-disabled"><span aria-hidden="true" /> Locked</span>
        </div>
        <div className="approval-notice" role="status">
          <strong>This is a non-custodial product shell, not an active wallet.</strong>
          <p>No funds are held here. No bank payout, blockchain transfer, deposit address, signing, or withdrawal request can be created from this page. Balances will appear only after a verified ledger and provider integrations are connected.</p>
        </div>
        <div className="approval-meta">
          <div><span>Cash denomination</span><strong>USD</strong></div>
          <div><span>Crypto support</span><strong>Multiple allowlisted assets</strong></div>
          <div><span>Identity</span><strong>Clerk sign-in + verification required</strong></div>
          <div><span>Balance eligibility</span><strong>Settled and available only</strong></div>
        </div>
      </section>

      <section className="section">
        <h2>Wallet accounts</h2>
        <div className="grid">
          {assets.map((asset) => (
            <article className="card" key={asset.name}>
              <div className="eyebrow">{asset.status}</div>
              <h3>{asset.name}</h3>
              <p>{asset.detail}</p>
              <p><strong>Balance:</strong> Not connected</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Withdrawal security</h2>
        <div className="card">
          <ul>
            <li>Withdraw only the signed-in user's own verified, settled funds.</li>
            <li>Verify bank-account or crypto-address ownership before saving a destination.</li>
            <li>Use separate cash and crypto withdrawal approval screens.</li>
            <li>Apply per-transaction, daily, and monthly limits with atomic balance reservation.</li>
            <li>Record immutable ledger entries and auditable status changes.</li>
            <li>Require step-up authentication and risk checks for sensitive changes.</li>
            <li>Keep payout and blockchain signing credentials isolated from the browser and AI model.</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <h2>Separate approval paths</h2>
        <div className="approval-nav-links">
          <Link href="/approvals/cash-withdrawal">USD cash withdrawal approval</Link>
          <Link href="/approvals/crypto-withdrawal">Crypto withdrawal approval</Link>
        </div>
        <p>These are separate control surfaces. Neither path is connected to a payout provider or blockchain signer yet.</p>
      </section>

      <div className="approval-footer">
        <Link href="/approvals/crossmint">Crossmint purchase approvals</Link>
        <Link href="/approvals/agent-wallet">StalkChain purchase approvals</Link>
        <Link href="/">Back to dashboard</Link>
      </div>
    </main>
  );
}
