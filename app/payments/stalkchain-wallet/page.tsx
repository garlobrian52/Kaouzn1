import Link from "next/link";

export const metadata = { title: "StalkChain Wallet Approval | Hello Kaouzn" };

export default function StalkChainWalletApprovalPage() {
  return (
    <main className="wrap">
      <nav className="nav">
        <Link className="brand" href="/">Hello <span>Kaouzn</span></Link>
        <span className="pill">Agent wallet · isolated</span>
      </nav>
      <section className="hero" style={{ textAlign: "left", paddingTop: 48 }}>
        <div className="eyebrow">StalkChain Agent Wallet</div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", maxWidth: 820 }}>Wallet transaction approval</h1>
        <p style={{ marginLeft: 0 }}>Review agent-wallet transactions in a completely separate approval flow. This rail must use its own wallet, signer/custody boundary, allowlist, limits, ledger, and approval records—not Crossmint card credentials or approvals.</p>
      </section>
      <section className="card">
        <div className="pill"> <span aria-hidden="true">●</span> DISABLED — SECURITY GATE</div>
        <h2>Wallet approvals are not connected yet.</h2>
        <p>This screen is a safe UI milestone only. A wallet provider and custody/signing model, verified user authentication, trusted approval storage, transactional limits, and replay-safe single-use approval consumption are not implemented. No signing or transfer action is available here.</p>
        <p><strong>Required approval:</strong> You must personally approve each exact destination + amount request in an authenticated approval flow. The agent cannot sign, approve itself, raise limits, or reuse an approval.</p>
        <ul>
          <li>Rail: StalkChain agent wallet only</li>
          <li>Current state: disabled by configuration</li>
          <li>Approval state: unavailable until secure backend is implemented</li>
          <li>Wallet custody and signing: not configured</li>
        </ul>
      </section>
      <p style={{ marginTop: 24 }}><Link className="btn alt" href="/payments/crossmint">View separate Crossmint card approval →</Link></p>
      <p style={{ marginTop: 20 }}><Link href="/">← Back to Hello Kaouzn</Link></p>
    </main>
  );
}
