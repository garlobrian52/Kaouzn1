import Link from "next/link";

export const metadata = { title: "Crossmint Card Approval | Hello Kaouzn" };

export default function CrossmintApprovalPage() {
  return (
    <main className="wrap">
      <nav className="nav">
        <Link className="brand" href="/">Hello <span>Kaouzn</span></Link>
        <span className="pill">Card rail · isolated</span>
      </nav>
      <section className="hero" style={{ textAlign: "left", paddingTop: 48 }}>
        <div className="eyebrow">Crossmint Agent Commerce</div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", maxWidth: 820 }}>Card payment approval</h1>
        <p style={{ marginLeft: 0 }}>Review Crossmint card purchase requests separately from the StalkChain agent wallet. A request must identify the merchant, exact amount, currency, expiry, and purpose before you can approve it.</p>
      </section>
      <section className="card">
        <div className="pill"> <span aria-hidden="true">●</span> DISABLED — SECURITY GATE</div>
        <h2>Approvals are not connected yet.</h2>
        <p>This screen is a safe UI milestone only. Verified sign-in, trusted approval storage, Crossmint OAuth/session setup, provider-enforced limits, and single-use approval consumption are not implemented. No card, checkout, or spending action is available here.</p>
        <p><strong>Required approval:</strong> You must personally approve each exact merchant + amount request in an authenticated approval flow. The agent cannot approve itself, increase limits, or reuse an approval.</p>
        <ul>
          <li>Rail: Crossmint card only</li>
          <li>Current state: disabled by configuration</li>
          <li>Approval state: unavailable until secure backend is implemented</li>
          <li>Spending cap: not active or provider-verified</li>
        </ul>
      </section>
      <p style={{ marginTop: 24 }}><Link className="btn alt" href="/payments/stalkchain-wallet">View separate StalkChain wallet approval →</Link></p>
      <p style={{ marginTop: 20 }}><Link href="/">← Back to Hello Kaouzn</Link></p>
    </main>
  );
}
