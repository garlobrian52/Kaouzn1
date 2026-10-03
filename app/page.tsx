'use client';

import { useState } from 'react';

const modules = [
  ['Free AI Business Audit', 'Turn a business idea into a prioritized revenue plan.'],
  ['Digital Product Marketplace', 'Package templates, guides, prompts, and systems into sellable offers.'],
  ['AI Offer Generator', 'Generate positioning, pricing, bonuses, guarantees, and checkout copy.'],
  ['AI Content Generator', 'Create short-form hooks, posts, emails, and launch campaigns.'],
  ['Lead Generation', 'Build prospect lists, outreach angles, and lead magnets.'],
  ['Sales Funnel Builder', 'Map traffic → lead → offer → checkout → upsell.'],
  ['Revenue Dashboard', 'Track sales, MRR, conversion, CAC, AOV, and progress to $50K.'],
  ['Customer + Affiliate OS', 'Accounts, subscriptions, referrals, commissions, and admin analytics.'],
];

export default function Home() {
  const [business, setBusiness] = useState('');
  const [audit, setAudit] = useState('');
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    if (!business.trim()) return;
    setLoading(true);
    setAudit('');
    try {
      const response = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business }),
      });
      const data = await response.json();
      setAudit(data.result ?? data.error ?? 'No result returned.');
    } catch {
      setAudit('The audit is temporarily unavailable. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="wrap">
        <nav className="nav">
          <div className="brand">AI Revenue <span>OS</span></div>
          <div className="pill">Target: $50K/mo</div>
        </nav>

        <section className="hero">
          <div className="eyebrow">Build → Sell → Measure → Scale</div>
          <h1>Your AI operating system for digital revenue.</h1>
          <p>Generate offers, create marketing, capture leads, build funnels, sell products, and measure the entire revenue engine from one workspace.</p>
          <div className="actions">
            <a className="btn" href="#audit">Get free AI audit</a>
            <a className="btn alt" href="#dashboard">View revenue plan</a>
          </div>
        </section>

        <section className="grid" id="dashboard">
          <div className="card"><div className="metric">$50K</div><p>Monthly revenue target</p></div>
          <div className="card"><div className="metric">$10K</div><p>Weekly target</p></div>
          <div className="card"><div className="metric">4</div><p>Core revenue channels</p></div>
          <div className="card"><div className="metric">1</div><p>Revenue command center</p></div>
        </section>

        <section className="section">
          <h2>Everything needed to operate the revenue engine.</h2>
          <div className="grid">
            {modules.map(([title, description]) => (
              <div className="card" key={title}><div className="eyebrow">Module</div><h3>{title}</h3><p>{description}</p></div>
            ))}
          </div>
        </section>

        <section className="section audit" id="audit">
          <div className="card">
            <div className="eyebrow">Free AI Business Audit</div>
            <h2>Find your fastest revenue path.</h2>
            <p>Describe what you sell—or what you want to sell. The AI will return a practical offer, audience, channel, funnel, and first revenue actions.</p>
            <textarea className="input textarea" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Example: I want to sell AI templates to small business owners..." />
            <button className="btn" onClick={runAudit} disabled={loading}>{loading ? 'Analyzing…' : 'Run free audit'}</button>
          </div>
          <div className="card">
            <div className="eyebrow">AI Output</div>
            <div className="result">{audit || 'Your personalized revenue plan will appear here.'}</div>
          </div>
        </section>

        <section className="section">
          <h2>Revenue architecture</h2>
          <div className="card">
            <p>GitHub → Vercel → Supabase → AI Gateway → Whop/Checkout → Customer purchases → Revenue Command Center → AWS analytics → $50K/month target.</p>
            <p>Start with the audit as the acquisition engine, then monetize with digital products, subscriptions, implementation services, and affiliate/referral revenue.</p>
          </div>
        </section>

        <footer className="footer">AI Revenue OS • Revenue target dashboard • Revenue outcomes are targets, not guarantees.</footer>
      </div>
    </main>
  );
}