/* =====================================================
   Finora — Error boundary
   Catches any render-time error in its subtree and shows
   a friendly fallback card. Logs the error for debugging
   and lets the user retry or copy details.

   Props:
     onReset → optional callback fired after a reset
   ===================================================== */

import { Component, Fragment } from 'react';

// Show raw error text + copy button only during development
const SHOW_DETAILS = import.meta.env.DEV;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
      // Bumping this key forces the subtree to remount on reset,
      // which is required because React won't recover a crashed
      // tree just by flipping hasError back to false.
      resetKey: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || '' };
  }

  componentDidCatch(error, info) {
    // Log locally so devs can debug.
    // TODO: forward to an error service in production (Sentry, etc.)
    console.error('Finora error boundary caught:', error, info);
    this.errorInfo = { error, info };
  }

  handleReset = () => {
    this.setState((s) => ({
      hasError: false,
      message: '',
      resetKey: s.resetKey + 1,
    }));
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleCopy = async () => {
    const { error } = this.errorInfo || {};
    const text = [
      error?.name || 'Error',
      error?.message || '(no message)',
      error?.stack || '',
    ]
      .filter(Boolean)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API can fail on insecure origins — silently ignore
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <div className="error-card">
            <i
              className="fas fa-triangle-exclamation error-icon"
              aria-hidden="true"
            ></i>

            <h1 className="error-title">Something went wrong</h1>

            <p className="error-text">
              We hit an unexpected problem. You can try again, or reload the
              page.
            </p>

            {SHOW_DETAILS && this.state.message && (
              <p className="error-detail">{this.state.message}</p>
            )}

            <div className="error-actions">
              {SHOW_DETAILS && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={this.handleCopy}
                >
                  <i className="fas fa-copy" aria-hidden="true"></i>
                  Copy error
                </button>
              )}

              <button
                type="button"
                className="button button--ghost"
                onClick={this.handleReload}
              >
                <i className="fas fa-rotate-right" aria-hidden="true"></i>
                Reload
              </button>

              <button
                type="button"
                className="button button--primary"
                onClick={this.handleReset}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // The key forces a fresh mount of the subtree after a reset
    return (
      <Fragment key={this.state.resetKey}>{this.props.children}</Fragment>
    );
  }
}

export default ErrorBoundary;