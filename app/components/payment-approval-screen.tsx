import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type PaymentRail = "crossmint" | "agent-wallet";

const config = {
  crossmint: {
    eyebrow: "Card payment rail",
    title: "Crossmint approval",
    description: "Review card-based agent purchases in a dedicated approval surface. Card credentials stay in Crossmint’s vault and never enter Hello Kaouzn or the model.",
    railName: "Crossmint Agent Commerce",
    route: "Card / hosted checkout",
    safeguards: ["Merchant and exact amount must be visible before approval", "Provider-hosted user approval and provider-side limits required", "Card data, CVCs, and verification codes never enter this app"],
  },
  "agent-wallet": {
    eyebrow: "Wallet payment rail",
    title: "StalkChain wallet approval",
    description: "Review wallet transactions separately from card purchases. Each request must identify the destination, asset, network, exact amount, and transaction intent.",
    railName: "StalkChain agent wallet",
    route: "Separate agent wallet / signer",
    safeguards: ["Destination address and chain must be allowlisted", "Independent per-transaction and aggregate caps required", "No seed phrase or private key is exposed to the model or browser"],
  },
} satisfies Record<PaymentRail, {
  eyebrow: string; title: string; description: string; railName: string; route: string; safeguards: string[];
}>;

export async function PaymentApprovalScreen({ rail }: { rail: PaymentRail }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const item = config[rail];
  return (
    <main className="wrap approval-wrap">
      <nav className="nav">
        <a className="brand" href="/">Hello <span>Kaouzn</span></a>
        <span className="pill">Security mode: fail closed</span>
      </nav>
      <div className="approval-heading">
        <div className="eyebrow">{item.eyebrow}</div>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
      </div>
      <section className="approval-status-card" aria-labelledby="rail-status">
        <div className="approval-status-top">
          <div>
            <div className="eyebrow">Independent payment rail</div>
            <h2 id="rail-status">{item.railName}</h2>
          </div>
          <span className="approval-disabled"><span aria-hidden="true" /> Disabled</span>
        </div>
        <div className="approval-meta">
          <div><span>Payment path</span><strong>{item.route}</strong></div>
          <div><span>Approval source</span><strong>Authenticated user only</strong></div>
          <div><span>Execution</span><strong>Blocked until security tests pass</strong></div>
        </div>
        <div className="approval-notice" role="status">
          <strong>Live approvals are not available yet.</strong>
          <p>This screen is the approval UI milestone. No payment request can be approved, signed, or executed here until verified sign-in, trusted approval storage, single-use consumption, provider controls, and security tests are complete.</p>
        </div>
        <div className="approval-inbox">
          <div>
            <h3>Approval inbox</h3>
            <p>Request inbox is not connected to trusted storage.</p>
          </div>
          <span className="pill">Not connected</span>
        </div>
        <div className="approval-actions">
          <button className="btn" type="button" disabled aria-disabled="true">Approve request — locked</button>
          <button className="btn alt" type="button" disabled aria-disabled="true">Deny request — locked</button>
        </div>
      </section>
      <section className="approval-guardrails">
        <h2>Required safeguards for this rail</h2>
        <ul>{item.safeguards.map((rule) => <li key={rule}>{rule}</li>)}</ul>
      </section>
      <div className="approval-footer">
        <a href="/approvals/crossmint">Crossmint approvals</a>
        <a href="/approvals/agent-wallet">StalkChain wallet approvals</a>
        <a href="/">Back to dashboard</a>
      </div>
    </main>
  );
}
