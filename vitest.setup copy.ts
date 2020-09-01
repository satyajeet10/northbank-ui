import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement <dialog> methods yet; minimal stand-ins so components can be tested.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) { this.open = true; };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) { this.open = false; };
}
