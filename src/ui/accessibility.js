// UI-only observers: no polling or subscriptions to the per-frame game HUD.
const modalSelector = '.modal-overlay, .pause-overlay, .name-input-modal, .launch-modal-backdrop, #lock-modal';
const focusableSelector = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const dialogs = new Map();
let opened = [];

function visible(element) {
  return element.isConnected && !element.closest('.hidden, [inert]') && element.getClientRects().length > 0;
}

function topDialog() {
  return opened.filter(visible).reduce((top, element) => {
    if (!top) return element;
    return (Number(getComputedStyle(element).zIndex) || 0) >= (Number(getComputedStyle(top).zIndex) || 0) ? element : top;
  }, null);
}

function focusDialog(modal) {
  // Focus the dialog itself so opening login on a phone does not summon a keyboard.
  modal.focus({ preventScroll: true });
}

function syncDialog(modal) {
  const state = dialogs.get(modal);
  const isOpen = !modal.classList.contains('hidden') && modal.isConnected;
  if (state.open === isOpen) return;
  state.open = isOpen;
  if (isOpen) {
    state.returnFocus = document.activeElement;
    opened.push(modal);
    if (topDialog() === modal) focusDialog(modal);
  } else {
    opened = opened.filter(item => item !== modal);
    const top = topDialog();
    if (top) focusDialog(top);
    else if (state.returnFocus && visible(state.returnFocus)) state.returnFocus.focus({ preventScroll: true });
    state.returnFocus = null;
  }
}

function registerDialog(modal) {
  if (dialogs.has(modal)) return;
  const dialog = modal.querySelector('[role="dialog"]') || modal;
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  modal.tabIndex = -1;
  if (!dialog.hasAttribute('aria-labelledby') && !dialog.hasAttribute('aria-label')) {
    const heading = modal.querySelector('h1, h2, h3');
    if (heading) {
      if (!heading.id) heading.id = `dialog-heading-${++registerDialog.nextId}`;
      dialog.setAttribute('aria-labelledby', heading.id);
    } else dialog.setAttribute('aria-label', 'Neon Piano');
  }
  const observer = new MutationObserver(() => syncDialog(modal));
  dialogs.set(modal, { observer, open: false, returnFocus: null });
  observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  syncDialog(modal);
}
registerDialog.nextId = 0;

document.querySelectorAll(modalSelector).forEach(registerDialog);
// Dynamic launch/leaderboard dialogs are appended directly to body. Avoid watching
// the subtree, where score updates and animated effects mutate on every frame.
new MutationObserver(records => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.matches(modalSelector)) registerDialog(node);
      node.querySelectorAll(modalSelector).forEach(registerDialog);
    }
  }
  for (const [modal, state] of dialogs) {
    if (!modal.isConnected) {
      syncDialog(modal);
      state.observer.disconnect();
      dialogs.delete(modal);
    }
  }
}).observe(document.body, { childList: true });

window.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const modal = topDialog();
  if (!modal) return;
  const targets = [...modal.querySelectorAll(focusableSelector)].filter(element =>
    !element.disabled && element.tabIndex >= 0 && visible(element));
  const index = targets.indexOf(document.activeElement);
  if (!targets.length) {
    event.preventDefault();
    focusDialog(modal);
  } else if (index < 0 || (event.shiftKey ? index === 0 : index === targets.length - 1)) {
    event.preventDefault();
    targets[event.shiftKey ? targets.length - 1 : 0].focus();
  }
}, true);

// Existing translations update placeholders; mirror them as persistent accessible
// names so fields remain identifiable after players type into them.
for (const field of document.querySelectorAll('input[placeholder], textarea[placeholder]')) {
  if (field.labels?.length || field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) continue;
  const label = () => field.setAttribute('aria-label', field.placeholder);
  label();
  new MutationObserver(label).observe(field, { attributes: true, attributeFilter: ['placeholder'] });
}

for (const chip of document.querySelectorAll('.filter-chip')) {
  const sync = () => chip.setAttribute('aria-pressed', String(chip.classList.contains('active')));
  sync();
  new MutationObserver(sync).observe(chip, { attributes: true, attributeFilter: ['class'] });
}

// Custom profile controls retain their existing click handlers.
document.addEventListener('keydown', event => {
  const control = event.target.closest?.('[role="button"]');
  if (!control || control.matches('button, input') || event.repeat) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    control.click();
  }
});
