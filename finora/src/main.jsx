/* =====================================================
   Finora — React entry point
   Mounts the app into #root and wires up the top-level
   providers: ErrorBoundary (outermost) → ToastProvider → App.
   ===================================================== */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// --- Global styles (order matters) ---
// Font Awesome first so icon font is registered before our styles use it.
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css' // our own stylesheet bundle (imports the split styles)

// --- App + providers ---
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import { ToastProvider } from './components/Toast/ToastContext'

// Find the mount point defined in index.html
const container = document.getElementById('root')

createRoot(container).render(
  <StrictMode>
    {/*
      ErrorBoundary sits at the very top so any crash anywhere
      in the tree falls back to a friendly error page instead of
      a blank white screen.

      ToastProvider wraps the app so any component can call
      useToast() to show success / error messages.
    */}
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)