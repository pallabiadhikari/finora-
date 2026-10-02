/* =====================================================
   Finora — Money
   Displays an amount with the user's chosen currency
   symbol. When "Private View" is enabled in Settings,
   the value is masked and a small eye button reveals it.

   Props:
     amount    → number (or numeric string)
     showSign  → force a leading + for positive values
     className → extra classes on the wrapper
   ===================================================== */

import { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { currencies } from '../../data/categories';

function Money({ amount, showSign = false, className = '' }) {
  const settings = useSettings();
  const [revealed, setRevealed] = useState(false);

  // If Private View is switched off, drop the reveal state so
  // that turning it back on starts masked again.
  useEffect(() => {
    if (!settings.privateView) setRevealed(false);
  }, [settings.privateView]);

  // Look up the currency symbol; fall back to a plain "$"
  const currency = currencies.find((c) => c.code === settings.currency);
  const symbol = currency ? currency.symbol : '$';

  // Sanitise: NaN / null / undefined → 0
  const numeric = Number(amount);
  const safe = Number.isFinite(numeric) ? numeric : 0;

  // Format with thousands separators, always two decimals
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(safe));

  // Sign handling:
  //   negative amount → "-" prefix
  //   showSign + positive → "+" prefix
  //   everything else → no prefix
  const sign = safe < 0 ? '-' : showSign && safe > 0 ? '+' : '';

  const display = `${sign}${symbol}${formatted}`;
  const masked = '••••••';

  // ---------- Private View OFF — plain value ----------
  if (!settings.privateView) {
    return <span className={className}>{display}</span>;
  }

  // ---------- Private View ON — toggle between dots and value ----------
  return (
    <span className={`money-hidden ${className}`}>
      <span className="money-dots">{revealed ? display : masked}</span>
      <button
        type="button"
        className="money-eye"
        onClick={() => setRevealed((v) => !v)}
        aria-label={revealed ? 'Hide value' : 'Show value'}
        title={revealed ? 'Hide value' : 'Show value'}
      >
        <i
          className={`fas ${revealed ? 'fa-eye-slash' : 'fa-eye'}`}
          aria-hidden="true"
        ></i>
      </button>
    </span>
  );
}

export default Money;