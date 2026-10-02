function About({ onBack, onLogin, onSignup }) {
  return (
    <main className="about-page">
      <nav className="landing-nav about-nav" aria-label="About page navigation">
        <button type="button" className="brand about-brand" onClick={onBack}>
          <span className="brand-mark"><i className="fas fa-wallet"></i></span>
          <span>ExpenseFlow</span>
        </button>
        <div className="landing-nav-actions">
          <button type="button" className="landing-link-button" onClick={onBack}><i className="fas fa-arrow-left"></i> Home</button>
          <button type="button" className="about-nav-cta" onClick={onLogin}>Sign in</button>
        </div>
      </nav>

      <section className="about-hero" aria-labelledby="about-title">
        <div>
          <span className="landing-eyebrow"><i className="fas fa-circle-info"></i> About ExpenseFlow</span>
          <h1 id="about-title">A clear, practical home for your <em>money story.</em></h1>
          <p>ExpenseFlow is a personal expense tracker that helps you record everyday spending, understand where your money goes, and make more confident decisions month after month.</p>
          <div className="about-actions">
            <button type="button" className="landing-primary-button" onClick={onSignup}>Create your free account <i className="fas fa-arrow-right"></i></button>
          </div>
        </div>
        <div className="about-purpose-card">
          <span className="about-card-label">Why we built it</span>
          <h2>Good financial habits should be easy to keep.</h2>
          <p>We made ExpenseFlow for the small moments: the coffee you almost forget, the monthly plan you want to check, and the end-of-month question, “Where did it all go?”</p>
        </div>
      </section>

      <section className="about-details" aria-label="About the ExpenseFlow product">
        <div className="about-section-heading"><span className="landing-eyebrow">The product</span><h2>Everything you need to stay aware.</h2></div>
        <div className="about-detail-grid">
          <article><span className="about-detail-icon"><i className="fas fa-receipt"></i></span><h3>Record spending</h3><p>Add an expense with a title, amount, category, and date. Your recent activity stays easy to find and edit.</p></article>
          <article><span className="about-detail-icon"><i className="fas fa-chart-pie"></i></span><h3>Understand patterns</h3><p>See totals, averages, category breakdowns, and monthly trends so your spending has useful context.</p></article>
          <article><span className="about-detail-icon"><i className="fas fa-wallet"></i></span><h3>Plan ahead</h3><p>Use the budget view to compare category spending with your monthly limit and keep your next decision visible.</p></article>
        </div>
      </section>

      <section className="about-trust" aria-label="ExpenseFlow privacy information">
        <div className="about-trust-icon"><i className="fas fa-shield-halved"></i></div>
        <div><span className="landing-eyebrow">Your privacy</span><h2>Your data stays close to you.</h2><p>ExpenseFlow currently stores your account and expense data in your browser using local storage. This keeps the experience fast and private while you manage your personal workspace.</p></div>
      </section>
    </main>
  );
}

export default About;
