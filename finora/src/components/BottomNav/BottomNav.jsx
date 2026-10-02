/* =====================================================
   Finora — Bottom navigation (mobile only)
   Fixed bar at the bottom of the screen with:
     • Home, History            → nav links
     • Add (floating +)         → opens Quick Add modal
     • Income                   → nav link
     • More                     → opens the More menu

   Hidden on desktop via CSS (.bottom-nav { display: none }).

   Props:
     activePage → current page key
     onNavigate → called with a page key
     onAddClick → called when the + button is pressed
     onMoreClick→ called when More is pressed
   ===================================================== */

// Defined once so the array isn't rebuilt every render.
// `kind` tells the loop how to render each entry.
const ITEMS = [
  { key: 'overview',     label: 'Home',    icon: 'fa-house',       kind: 'nav' },
  { key: 'transactions', label: 'History', icon: 'fa-receipt',     kind: 'nav' },
  { key: 'add',          label: 'Add',     icon: 'fa-plus',        kind: 'add' },
  { key: 'income',       label: 'Income',  icon: 'fa-sack-dollar', kind: 'nav' },
  { key: 'more',         label: 'More',    icon: 'fa-ellipsis',    kind: 'more' },
];

function BottomNav({ activePage, onNavigate, onAddClick, onMoreClick }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {ITEMS.map((item) => {
        // ---------- Floating "+" button ----------
        if (item.kind === 'add') {
          return (
            <button
              key={item.key}
              type="button"
              className="bottom-nav-add"
              onClick={onAddClick}
              aria-label="Add expense"
              aria-haspopup="dialog"
            >
              <i
                className={`fas ${item.icon}`}
                aria-hidden="true"
              ></i>
            </button>
          );
        }

        // ---------- "More" — opens the More menu ----------
        if (item.kind === 'more') {
          return (
            <button
              key={item.key}
              type="button"
              className="bottom-nav-item"
              onClick={onMoreClick}
              aria-label="More options"
              aria-haspopup="true"
            >
              <i
                className={`fas ${item.icon}`}
                aria-hidden="true"
              ></i>
              <span>{item.label}</span>
            </button>
          );
        }

        // ---------- Regular nav link ----------
        const isActive = activePage === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
            aria-current={isActive ? 'page' : undefined}
          >
            <i
              className={`fas ${item.icon}`}
              aria-hidden="true"
            ></i>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;