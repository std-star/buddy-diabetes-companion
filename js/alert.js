/**
 * alert.js
 *
 * Fulfills this project's unique UI requirement:
 * "Display user feedback with styled alert messages."
 *
 * AlertBanner is a reusable, self-contained class — any page can import
 * this file and call `new AlertBanner(type, message).show()` to surface
 * success/warning/danger/error feedback. Used by the tracker for save
 * confirmations + validation errors, and by the food explorer for API states.
 */
class AlertBanner {
  static containerId = 'alertStack';

  constructor(type, message, options = {}) {
    this.type = type; // 'success' | 'warning' | 'danger' | 'error'
    this.message = message;
    this.duration = options.duration ?? 4500;
    this.el = null;
    this.timer = null;
  }

  static getContainer() {
    let container = document.getElementById(AlertBanner.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = AlertBanner.containerId;
      container.className = 'alert-stack';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  }

  show() {
    const container = AlertBanner.getContainer();

    this.el = document.createElement('div');
    this.el.className = `alert-buddy alert-${this.type}`;
    this.el.setAttribute('role', 'alert');
    this.el.innerHTML = `
      ${this._iconFor(this.type)}
      <span>${this.message}</span>
      <button type="button" class="alert-close" aria-label="Dismiss message">&times;</button>
    `;

    container.appendChild(this.el);
    // next frame so the CSS transition actually animates in
    requestAnimationFrame(() => this.el.classList.add('show'));

    this.el.querySelector('.alert-close').addEventListener('click', () => this.dismiss());

    if (this.duration > 0) {
      this.timer = setTimeout(() => this.dismiss(), this.duration);
    }

    return this;
  }

  dismiss() {
    if (!this.el) return;
    clearTimeout(this.timer);
    this.el.classList.remove('show');
    setTimeout(() => this.el && this.el.remove(), 250);
  }

  _iconFor(type) {
    const icons = {
      success:
        '<svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      warning:
        '<svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>',
      danger:
        '<svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      error:
        '<svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    };
    return icons[type] || icons.success;
  }
}
