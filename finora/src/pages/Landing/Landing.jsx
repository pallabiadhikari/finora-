/* =====================================================
   Finora — Landing
   Marketing page shown before login. Composed of:
     • Nav (brand + sign in / sign up)
     • Hero + product preview card
     • Features grid
     • Stats strip
     • How it works
     • Testimonials
     • FAQ (native <details>)
     • Final CTA banner
     • Footer + back-to-top button

   Props:
     onLogin  → open the login view
     onSignup → open the signup view
   ===================================================== */

import { useCallback, useEffect, useState } from 'react';
import Logo from '../../components/Logo/Logo';

// How far the user must scroll before the back-to-top button appears
const BACK_TO_TOP_THRESHOLD = 300;

function Landing({ onLogin, onSignup }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ---------- Show back-to-top when scrolled past the threshold ----------
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > BACK_TO_TOP_THRESHOLD);
    };

    onScroll(); // sync on mount (e.g. page reloaded mid-scroll)
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ---------- Actions ----------
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="landing">
      {/* =============== NAV =============== */}
      <nav className="landing-nav" aria-label="Main navigation">
        <button
          type="button"
          className="landing-nav-brand"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <Logo size={36} decorative />
          <span className="landing-nav-name">Finora</span>
        </button>

        <div className="landing-nav-actions">
          <button
            type="button"
            className="landing-link-btn"
            onClick={onLogin}
          >
            Sign in
          </button>
          <button
            type="button"
            className="landing-primary-btn landing-primary-btn--sm"
            onClick={onSignup}
          >
            Get started
            <i
              className="fas fa-arrow-right"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </nav>

      {/* =============== HERO =============== */}
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">
            <i
              className="fas fa-sparkles"
              aria-hidden="true"
            ></i>
            Your money. Your picture. Your way.
          </span>

          <h1 className="landing-title">
            Make every rupee
            <em> count.</em>
          </h1>

          <p className="landing-lead">
            Finora helps you record expenses, understand your habits,
            and stay close to the goals that matter — all in one
            calm, elegant place.
          </p>

          <div className="landing-cta-row">
            <button
              type="button"
              className="landing-primary-btn"
              onClick={onSignup}
            >
              Create your free account
              <i
                className="fas fa-arrow-right"
                aria-hidden="true"
              ></i>
            </button>
            <button
              type="button"
              className="landing-secondary-btn"
              onClick={onLogin}
            >
              I already have an account
            </button>
          </div>

          <ul className="landing-trust">
            <li>
              <i className="fas fa-lock" aria-hidden="true"></i>
              Secure and private
            </li>
            <li>
              <i
                className="fas fa-check-circle"
                aria-hidden="true"
              ></i>
              No credit card required
            </li>
            <li>
              <i className="fas fa-infinity" aria-hidden="true"></i>
              Free forever
            </li>
          </ul>
        </div>

        {/* ---------- Product preview card ---------- */}
        <div
          className="landing-preview"
          role="img"
          aria-label="Preview of the Finora dashboard showing a balance of Rs. 24,680 and recent transactions"
        >
          <div className="preview-top" aria-hidden="true">
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-dot" />
            <span className="preview-label">Overview</span>
          </div>

          <div className="preview-total-label">Total balance</div>
          <div className="preview-total">
            Rs. 24,680<span>.00</span>
          </div>

          <div className="preview-progress">
            <span style={{ width: '68%' }} />
          </div>

          <div className="preview-meta">
            <span>68% of monthly budget</span>
            <strong>Rs. 10,320 left</strong>
          </div>

          <div className="preview-divider" />

          <div className="preview-list-heading" aria-hidden="true">
            <span>Recent</span>
            <span>This month</span>
          </div>

          {/* Rows are pure visual — screen readers get the aria-label above */}
          <div className="preview-row" aria-hidden="true">
            <span className="preview-icon preview-icon--food">
              <i className="fas fa-utensils"></i>
            </span>
            <div>
              <strong>Lunch with team</strong>
              <small>Food</small>
            </div>
            <b>-Rs. 420</b>
          </div>

          <div className="preview-row" aria-hidden="true">
            <span className="preview-icon preview-icon--transport">
              <i className="fas fa-car"></i>
            </span>
            <div>
              <strong>Monthly commute</strong>
              <small>Transport</small>
            </div>
            <b>-Rs. 1,850</b>
          </div>

          <div className="preview-row" aria-hidden="true">
            <span className="preview-icon preview-icon--shopping">
              <i className="fas fa-bag-shopping"></i>
            </span>
            <div>
              <strong>Home supplies</strong>
              <small>Shopping</small>
            </div>
            <b>-Rs. 2,400</b>
          </div>
        </div>
      </section>

      {/* =============== FEATURES =============== */}
      <section className="landing-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">
            <i className="fas fa-star" aria-hidden="true"></i>
            What makes Finora different
          </span>
          <h2 className="landing-section-title">
            Built for calm, not clutter
          </h2>
        </div>

        <div className="landing-features">
          <article className="landing-feature">
            <span
              className="landing-feature-icon"
              aria-hidden="true"
            >
              <i className="fas fa-bolt"></i>
            </span>
            <h3>Capture in seconds</h3>
            <p>
              Log an expense before the moment passes. Amount,
              category, done — five seconds flat.
            </p>
          </article>

          <article className="landing-feature">
            <span
              className="landing-feature-icon landing-feature-icon--gold"
              aria-hidden="true"
            >
              <i className="fas fa-chart-pie"></i>
            </span>
            <h3>See the pattern</h3>
            <p>
              Friendly charts and plain-language insights turn raw
              numbers into understanding.
            </p>
          </article>

          <article className="landing-feature">
            <span
              className="landing-feature-icon"
              aria-hidden="true"
            >
              <i className="fas fa-bullseye"></i>
            </span>
            <h3>Plan with confidence</h3>
            <p>
              Budgets, savings goals and gentle reminders help you
              stay on track — without guilt.
            </p>
          </article>
        </div>
      </section>

      {/* =============== STATS =============== */}
      <section className="landing-stats">
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

      {/* =============== HOW IT WORKS =============== */}
      <section className="landing-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">
            <i className="fas fa-compass" aria-hidden="true"></i>
            How it works
          </span>
          <h2 className="landing-section-title">
            Three steps to financial clarity
          </h2>
        </div>

        <div className="landing-how">
          <article className="landing-how-card">
            <span className="landing-how-number">01</span>
            <h3>Create your account</h3>
            <p>
              Sign up in seconds. No credit card, no setup ritual.
              Just your name, an email and a password.
            </p>
          </article>
          <article className="landing-how-card">
            <span className="landing-how-number">02</span>
            <h3>Log your first expense</h3>
            <p>
              Choose a category, enter the amount, and you're done.
              Finora remembers every detail.
            </p>
          </article>
          <article className="landing-how-card">
            <span className="landing-how-number">03</span>
            <h3>Watch your patterns</h3>
            <p>
              Insights and charts reveal where your money actually
              goes — without spreadsheets or guilt.
            </p>
          </article>
        </div>
      </section>

      {/* =============== TESTIMONIALS =============== */}
      <section className="landing-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">
            <i
              className="fas fa-quote-left"
              aria-hidden="true"
            ></i>
            Loved by users
          </span>
          <h2 className="landing-section-title">
            Real people, real clarity
          </h2>
        </div>

        <div className="landing-testimonials">
          <article className="landing-testimonial">
            <div
              className="landing-stars"
              aria-label="5 out of 5 stars"
            >
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
            </div>
            <p>
              "Finally an expense tracker that doesn't feel like a
              spreadsheet. The interface is beautiful and I actually
              enjoy logging my expenses now."
            </p>
            <div className="landing-testimonial-author">
              <span
                className="landing-testimonial-avatar"
                aria-hidden="true"
              >
                A
              </span>
              <div>
                <strong>Anisha Sharma</strong>
                <span>Kathmandu</span>
              </div>
            </div>
          </article>

          <article className="landing-testimonial">
            <div
              className="landing-stars"
              aria-label="5 out of 5 stars"
            >
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
            </div>
            <p>
              "I used to track expenses in a notebook. Finora makes
              it effortless. My monthly budget finally makes sense."
            </p>
            <div className="landing-testimonial-author">
              <span
                className="landing-testimonial-avatar"
                aria-hidden="true"
              >
                R
              </span>
              <div>
                <strong>Rajesh Thapa</strong>
                <span>Pokhara</span>
              </div>
            </div>
          </article>

          <article className="landing-testimonial">
            <div
              className="landing-stars"
              aria-label="5 out of 5 stars"
            >
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
              <i className="fas fa-star" aria-hidden="true"></i>
            </div>
            <p>
              "The privacy-first approach won me over. I have full
              control over my data. Exactly what I wanted."
            </p>
            <div className="landing-testimonial-author">
              <span
                className="landing-testimonial-avatar"
                aria-hidden="true"
              >
                S
              </span>
              <div>
                <strong>Sneha Gurung</strong>
                <span>Lalitpur</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* =============== FAQ =============== */}
      <section className="landing-section landing-section--narrow">
        <div className="landing-section-head">
          <span className="landing-eyebrow">
            <i
              className="fas fa-circle-question"
              aria-hidden="true"
            ></i>
            FAQ
          </span>
          <h2 className="landing-section-title">
            Questions, answered
          </h2>
        </div>

        <div className="landing-faq">
          <details className="landing-faq-item">
            <summary>Is Finora really free?</summary>
            <p>
              Yes. Finora is completely free to use. No trials, no
              hidden fees, no premium tiers. Everything you see is
              available to everyone.
            </p>
          </details>

          <details className="landing-faq-item">
            <summary>Where is my data stored?</summary>
            <p>
              Your data is stored securely on our servers and tied
              to your account. Only you can access it.
            </p>
          </details>

          <details className="landing-faq-item">
            <summary>Do I need to create an account?</summary>
            <p>
              Yes, but it takes seconds. Creating an account lets us
              keep your data separate and secure. You only need an
              email and a password.
            </p>
          </details>

          <details className="landing-faq-item">
            <summary>Can I use Finora on my phone?</summary>
            <p>
              Yes. Finora is fully responsive and works beautifully
              on phones, tablets and desktops.
            </p>
          </details>
        </div>
      </section>

      {/* =============== FINAL CTA =============== */}
      <section className="landing-final">
        <div className="landing-final-inner">
          <span className="landing-eyebrow landing-eyebrow--light">
            <i className="fas fa-rocket" aria-hidden="true"></i>
            Ready when you are
          </span>
          <h2>Take control of your money today.</h2>
          <p>
            Join thousands of people who've made their spending
            clearer with Finora.
          </p>
          <div className="landing-cta-row landing-cta-row--center">
            <button
              type="button"
              className="landing-primary-btn landing-primary-btn--light"
              onClick={onSignup}
            >
              Create your free account
              <i
                className="fas fa-arrow-right"
                aria-hidden="true"
              ></i>
            </button>
            <button
              type="button"
              className="landing-secondary-btn landing-secondary-btn--light"
              onClick={onLogin}
            >
              Sign in instead
            </button>
          </div>
        </div>
      </section>

      {/* =============== FOOTER =============== */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Finora. Built with care.</p>
      </footer>

      {/* =============== BACK TO TOP =============== */}
      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <i className="fas fa-arrow-up" aria-hidden="true"></i>
        </button>
      )}
    </main>
  );
}

export default Landing;