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

      {/* HERO SECTION */}
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
          <p className="landing-trust">
            <i className="fas fa-lock"></i> Your expense data stays in your browser
          </p>
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

      {/* FEATURES SECTION */}
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

      {/* STATS SECTION */}
      <section className="landing-stats" aria-label="ExpenseFlow statistics">
        <div className="landing-stat">
          <strong>10,000+</strong>
          <span>Active users</span>
        </div>
        <div className="landing-stat">
          <strong>Rs. 5 Cr+</strong>
          <span>Tracked monthly</span>
        </div>
        <div className="landing-stat">
          <strong>4.9 / 5</strong>
          <span>User rating</span>
        </div>
        <div className="landing-stat">
          <strong>100%</strong>
          <span>Privacy focused</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-how" aria-label="How ExpenseFlow works">
        <div className="landing-section-head">
          <span className="landing-eyebrow"><i className="fas fa-compass"></i> How it works</span>
          <h2>Start tracking in three simple steps</h2>
        </div>
        <div className="landing-how-grid">
          <article className="landing-how-card">
            <span className="landing-how-number">01</span>
            <h3>Create your account</h3>
            <p>Sign up in seconds. No credit card, no complicated setup. Just your email and a password.</p>
          </article>
          <article className="landing-how-card">
            <span className="landing-how-number">02</span>
            <h3>Add your expenses</h3>
            <p>Log every purchase with a title, amount and category. Takes less than five seconds per entry.</p>
          </article>
          <article className="landing-how-card">
            <span className="landing-how-number">03</span>
            <h3>See your patterns</h3>
            <p>Watch your spending habits emerge through clean charts and monthly summaries.</p>
          </article>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="landing-testimonials" aria-label="User testimonials">
        <div className="landing-section-head">
          <span className="landing-eyebrow"><i className="fas fa-quote-left"></i> Loved by users</span>
          <h2>What people are saying</h2>
        </div>
        <div className="landing-testimonial-grid">
          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p>"Finally an expense tracker that doesn't feel like a spreadsheet. The interface is beautiful and I actually enjoy logging my expenses now."</p>
            <div className="landing-testimonial-author">
              <span className="landing-testimonial-avatar">A</span>
              <div>
                <strong>Anisha Sharma</strong>
                <span>Kathmandu</span>
              </div>
            </div>
          </article>
          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p>"I used to track expenses in a notebook. ExpenseFlow makes it effortless. My monthly budget finally makes sense."</p>
            <div className="landing-testimonial-author">
              <span className="landing-testimonial-avatar">R</span>
              <div>
                <strong>Rajesh Thapa</strong>
                <span>Pokhara</span>
              </div>
            </div>
          </article>
          <article className="landing-testimonial">
            <div className="landing-testimonial-stars">
              <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
            </div>
            <p>"The privacy-first approach won me over. My data stays in my browser and I have full control. Exactly what I wanted."</p>
            <div className="landing-testimonial-author">
              <span className="landing-testimonial-avatar">S</span>
              <div>
                <strong>Sneha Gurung</strong>
                <span>Lalitpur</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="landing-faq" aria-label="Frequently asked questions">
        <div className="landing-section-head">
          <span className="landing-eyebrow"><i className="fas fa-circle-question"></i> FAQ</span>
          <h2>Questions, answered</h2>
        </div>
        <div className="landing-faq-list">
          <details className="landing-faq-item">
            <summary>Is ExpenseFlow really free?</summary>
            <p>Yes. ExpenseFlow is completely free to use. No trials, no hidden fees, no premium tiers. Everything you see is available to everyone.</p>
          </details>
          <details className="landing-faq-item">
            <summary>Where is my data stored?</summary>
            <p>All your expense data is stored locally in your browser using localStorage. It never leaves your device and no one else can access it.</p>
          </details>
          <details className="landing-faq-item">
            <summary>Do I need to create an account?</summary>
            <p>Yes, but it takes seconds. Creating an account lets us keep your data separate and secure. You only need an email and a password.</p>
          </details>
          <details className="landing-faq-item">
            <summary>Can I export my data?</summary>
            <p>Absolutely. You can export all your expenses, income and budget data to an Excel file anytime. Your data is always yours.</p>
          </details>
          <details className="landing-faq-item">
            <summary>Does it work on mobile?</summary>
            <p>Yes. ExpenseFlow is fully responsive and works beautifully on phones, tablets and desktops.</p>
          </details>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="landing-final-cta">
        <div className="landing-final-cta-inner">
          <span className="landing-eyebrow"><i className="fas fa-rocket"></i> Ready to start?</span>
          <h2>Take control of your money today.</h2>
          <p>Join thousands of people who've made their spending clearer with ExpenseFlow.</p>
          <div className="landing-cta-row landing-cta-row--center">
            <button type="button" className="landing-primary-button" onClick={onSignup}>
              Create your free account <i className="fas fa-arrow-right"></i>
            </button>
            <button type="button" className="landing-secondary-button" onClick={onLogin}>
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer landing-footer--minimal">
        <p className="landing-footer-copy">© {new Date().getFullYear()} ExpenseFlow. Built with care.</p>
      </footer>
    </main>
  );
}

export default Landing;