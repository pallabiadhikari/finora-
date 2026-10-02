/* =====================================================
   Finora — FirstTimeSetup
   Three-step onboarding wizard shown the first time a
   user signs in.

   Step 1 — pick a currency
   Step 2 — choose which features to track
   Step 3 — optional starting monthly income

   Finishing saves everything, marks setup complete,
   and hands control back to App via onComplete().
   ===================================================== */

import { useEffect, useRef, useState } from 'react';
import { currencies } from '../../data/categories';
import {
  getSettings,
  saveSettings,
  markSetupComplete,
} from '../../utils/user';
import { addIncome } from '../../utils/storage';

// Tracking feature definitions (Step 2)
const TRACKING_OPTIONS = [
  { key: 'expenses', label: 'Expenses', icon: 'fa-receipt' },
  { key: 'income', label: 'Income', icon: 'fa-sack-dollar' },
  { key: 'budgets', label: 'Budgets', icon: 'fa-bullseye' },
  { key: 'goals', label: 'Savings goals', icon: 'fa-flag' },
];

const TOTAL_STEPS = 3;

function FirstTimeSetup({ user, onComplete }) {
  const [step, setStep] = useState(1);

  // Step 1 — currency
  const [currency, setCurrency] = useState(
    () => getSettings()?.currency || 'USD'
  );

  // Step 2 — what to track
  const [tracking, setTracking] = useState({
    expenses: true,
    income: true,
    budgets: true,
    goals: true,
  });

  // Step 3 — optional monthly income
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const [saving, setSaving] = useState(false);

  // Focus the step heading when the step changes, so keyboard
  // and screen-reader users land on the new content.
  const headingRef = useRef(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // ---------- Navigation ----------
  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const toggleTracking = (key) => {
    setTracking((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------- Finish ----------
  const finish = async ({ skip = false } = {}) => {
    if (saving) return;
    setSaving(true);

    try {
      // 1. Save currency preference
      const settings = getSettings();
      saveSettings({ ...settings, currency });

      // 2. Save tracking preferences
      try {
        localStorage.setItem(
          'finora.tracking',
          JSON.stringify(tracking)
        );
      } catch (err) {
        console.error('Could not save tracking prefs:', err);
      }

      // 3. Optional monthly income
      if (!skip && monthlyIncome) {
        const numeric = Number(monthlyIncome);
        if (Number.isFinite(numeric) && numeric > 0) {
          await addIncome({
            id: Date.now(),
            amount: numeric,
            source: 'salary',
            date: new Date().toISOString().slice(0, 10),
            note: 'Starting monthly income',
          });
        }
      }

      markSetupComplete();
      onComplete();
    } catch (err) {
      console.error('Setup failed:', err);
      // Let the user try again — don't mark complete
      setSaving(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        {/* ---------- Progress ---------- */}
        <div
          className="setup-progress"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Step ${step} of ${TOTAL_STEPS}`}
        >
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`setup-dot${
                step >= i + 1 ? ' active' : ''
              }`}
            />
          ))}
        </div>

        {/* ========== Step 1 — Currency ========== */}
        {step === 1 && (
          <div className="setup-step">
            <h1
              className="setup-title"
              tabIndex="-1"
              ref={headingRef}
            >
              What currency do you use?
            </h1>
            <p className="setup-subtitle">
              Hi {user?.name || 'there'}! Let's set Finora up for
              you.
            </p>

            <div className="setup-grid">
              {currencies.map((c) => {
                const selected = currency === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    className={`setup-choice${
                      selected ? ' active' : ''
                    }`}
                    onClick={() => setCurrency(c.code)}
                    aria-pressed={selected}
                  >
                    <span className="setup-choice-symbol">
                      {c.symbol}
                    </span>
                    <span className="setup-choice-label">
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="setup-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={next}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 2 — What to track ========== */}
        {step === 2 && (
          <div className="setup-step">
            <h1
              className="setup-title"
              tabIndex="-1"
              ref={headingRef}
            >
              What would you like to track?
            </h1>
            <p className="setup-subtitle">
              You can turn these on or off later in Settings.
            </p>

            <div className="setup-list">
              {TRACKING_OPTIONS.map((item) => {
                const on = tracking[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`setup-toggle${on ? ' active' : ''}`}
                    onClick={() => toggleTracking(item.key)}
                    aria-pressed={on}
                  >
                    <span
                      className="setup-toggle-icon"
                      aria-hidden="true"
                    >
                      <i className={`fas ${item.icon}`}></i>
                    </span>
                    <span className="setup-toggle-label">
                      {item.label}
                    </span>
                    <span
                      className="setup-toggle-check"
                      aria-hidden="true"
                    >
                      <i
                        className={`fas ${
                          on ? 'fa-check' : 'fa-plus'
                        }`}
                      ></i>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="setup-actions setup-actions--between">
              <button
                type="button"
                className="button button--ghost"
                onClick={back}
              >
                Back
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={next}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========== Step 3 — Monthly income ========== */}
        {step === 3 && (
          <div className="setup-step">
            <h1
              className="setup-title"
              tabIndex="-1"
              ref={headingRef}
            >
              What's your approximate monthly income?
            </h1>
            <p className="setup-subtitle">
              Optional. You can skip this and add it later.
            </p>

            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                finish();
              }}
              noValidate
            >
              <div className="form-field">
                <label htmlFor="setup-income">
                  Monthly income
                </label>
                <input
                  id="setup-income"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={monthlyIncome}
                  onChange={(e) =>
                    setMonthlyIncome(e.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="setup-actions setup-actions--between">
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={back}
                  disabled={saving}
                >
                  Back
                </button>
                <div className="setup-actions-right">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => finish({ skip: true })}
                    disabled={saving}
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={saving}
                    aria-busy={saving}
                  >
                    {saving ? (
                      <>
                        <i
                          className="fas fa-circle-notch fa-spin"
                          aria-hidden="true"
                        ></i>{' '}
                        Finishing…
                      </>
                    ) : (
                      'Finish Setup'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default FirstTimeSetup;