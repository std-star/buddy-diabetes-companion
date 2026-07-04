/**
 * tracker.js — glucose logging page.
 * Validates input, persists readings via StorageManager, and surfaces
 * every outcome (errors + range feedback) through AlertBanner.
 */
class GlucoseTracker {
  constructor() {
    this.storage = new StorageManager('buddy');
    this.form = document.getElementById('glucoseForm');
    this.listEl = document.getElementById('readingsList');
    this.valueInput = document.getElementById('glucoseValue');
    this.dateInput = document.getElementById('readingDate');
    this.notesInput = document.getElementById('notes');
    this.readings = this.storage.get('readings', []);
    this.init();
  }

  init() {
    if (!this.dateInput.value) {
      this.dateInput.value = this._today();
    }
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.render();
  }

  handleSubmit(event) {
    event.preventDefault();

    const rawValue = this.valueInput.value;
    const date = this.dateInput.value;
    const notes = this.notesInput.value.trim();

    if (!rawValue || !date) {
      new AlertBanner('danger', 'Please fill in both the glucose value and date before saving.').show();
      return;
    }

    const value = Number(rawValue);
    if (Number.isNaN(value) || value <= 0) {
      new AlertBanner('danger', 'Glucose value must be a positive number.').show();
      return;
    }

    const reading = { id: Date.now(), value, date, notes };
    this.readings.unshift(reading);
    this.storage.set('readings', this.readings);

    this.showRangeAlert(value);
    this.form.reset();
    this.dateInput.value = this._today();
    this.render();
  }

  showRangeAlert(value) {
    if (value > 180) {
      new AlertBanner('warning', `Saved — ${value} mg/dL is high. Consider a check-in.`).show();
    } else if (value < 70) {
      new AlertBanner('danger', `Saved — ${value} mg/dL is low. Please take care.`).show();
    } else {
      new AlertBanner('success', `Nice, ${value} mg/dL is in range!`).show();
    }
  }

  render() {
    if (this.readings.length === 0) {
      this.listEl.innerHTML = '<div class="reading-empty">No readings yet — log your first one to see it here.</div>';
      return;
    }
    this.listEl.innerHTML = this.readings.map((reading) => this._readingCardHtml(reading)).join('');
  }

  _statusFor(value) {
    if (value > 180) return { cls: 'reading-high', label: 'High', bg: 'amber-100', fg: 'amber-600' };
    if (value < 70) return { cls: 'reading-low', label: 'Low', bg: 'danger-100', fg: 'danger-600' };
    return { cls: 'reading-ok', label: 'In range', bg: 'success-100', fg: 'success-600' };
  }

  _readingCardHtml(reading) {
    const status = this._statusFor(reading.value);
    const formattedDate = new Date(`${reading.date}T00:00:00`).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return `
      <div class="reading-card ${status.cls}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          <div>
            <div class="reading-value">${reading.value} <span style="font-size:0.9rem; font-weight:400;">mg/dL</span></div>
            <div class="reading-meta">${formattedDate}</div>
          </div>
          <span class="reading-badge" style="background: var(--${status.bg}); color: var(--${status.fg});">${status.label}</span>
        </div>
        ${reading.notes ? `<p class="reading-meta" style="margin-top:0.75rem; margin-bottom:0;">${this._escape(reading.notes)}</p>` : ''}
      </div>
    `;
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _today() {
    return new Date().toISOString().slice(0, 10);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GlucoseTracker();
});
