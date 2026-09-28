function Landing({ onLogin, onSignup, onAbout }) {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Landing page navigation">
        <button type="button" className="brand landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Go to ExpenseFlow home">
          <span className="brand-mark"><i className="fas fa-wallet"></i></span>
          <span>ExpenseFlow</span>
        </button>
        <div className="landing-nav-actions">
          <span className="landing-nav-note">Your money, made clearer</span>
          <button type="button" className="landing-link-button landing-about-link" onClick={onAbout}>About</button>
          <button type="button" className="landing-link-button" onClick={onLogin}>
            Sign in <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </nav>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <span className="landing-eyebrow"><i className="fas fa-sparkles"></i> A calmer way to track spending</span>
          <h1 id="landing-title">Make every rupee <em>count.</em></h1>
          <p className="landing-intro">
            ExpenseFlow gives you one clear place to record expenses, understand your habits, and stay close to the goals that matter.
          </p>
          <div className="landing-cta-row">
            <button type="button" className="landing-primary-button" onClick={onSignup}>
              Create your free account <i className="fas fa-arrow-right"></i>
            </button>
            <button type="button" className="landing-secondary-button" onClick={onLogin}>
              I already have an account
            </button>
          </div>
          <p className="landing-trust"><i className="fas fa-lock"></i> Your expense data stays in your browser</p>
        </div>

        <div className="landing-preview" aria-label="ExpenseFlow dashboard preview">
          <div className="preview-topline">
            <span><i className="fas fa-chart-line"></i> Monthly overview</span>
            <span className="preview-status"><i className="fas fa-circle"></i> On track</span>
          </div>
          <div className="preview-total-label">Available to spend</div>
          <div className="preview-total">Rs. 24,680<span>.00</span></div>
          <div className="preview-progress"><span></span></div>
          <div className="preview-progress-meta"><span>68% of monthly budget</span><strong>Rs. 10,320 left</strong></div>
          <div className="preview-divider"></div>
          <div className="preview-list-heading"><span>Recent expenses</span><span>View all</span></div>
          <div className="preview-expense"><span className="preview-icon preview-icon--food"><i className="fas fa-utensils"></i></span><span><strong>Lunch with team</strong><small>Food</small></span><b>-Rs. 420</b></div>
          <div className="preview-expense"><span className="preview-icon preview-icon--transport"><i className="fas fa-car"></i></span><span><strong>Monthly commute</strong><small>Transport</small></span><b>-Rs. 1,850</b></div>
          <div className="preview-expense"><span className="preview-icon preview-icon--home"><i className="fas fa-house"></i></span><span><strong>Home supplies</strong><small>Shopping</small></span><b>-Rs. 2,400</b></div>
          <div className="preview-note"><i className="fas fa-wand-magic-sparkles"></i><span><strong>Small steps add up</strong><small>See where your money is moving.</small></span></div>
        </div>
      </section>

      <section className="landing-features" aria-label="ExpenseFlow features">
        <article className="landing-feature">
          <span className="feature-icon feature-icon--green"><i className="fas fa-receipt"></i></span>
          <div><h2>Capture quickly</h2><p>Add an expense in seconds, before the detail disappears.</p></div>
        </article>
        <article className="landing-feature">
          <span className="feature-icon feature-icon--blue"><i className="fas fa-chart-pie"></i></span>
          <div><h2>See the pattern</h2><p>Simple summaries show what is shaping your monthly spend.</p></div>
        </article>
        <article className="landing-feature">
          <span className="feature-icon feature-icon--orange"><i className="fas fa-bullseye"></i></span>
          <div><h2>Plan with confidence</h2><p>Use budgets and reports to turn awareness into action.</p></div>
        </article>
      </section>
    </main>
  );
}

export default Landing;
