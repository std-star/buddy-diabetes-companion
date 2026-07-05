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
    this.timeInput = document.getElementById('readingTime');
    this.notesInput = document.getElementById('notes');
    this.filterDateInput = document.getElementById('filterDate');
    this.clearFilterBtn = document.getElementById('clearFilterBtn');
    this.readings = this.storage.get('readings', []);
    this.activeFilterDate = null;
    this.init();
  }

  init() {
    this._resetDateTimeDefaults();
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.filterDateInput.addEventListener('change', () => this.handleFilterChange());
    this.clearFilterBtn.addEventListener('click', () => this.clearFilter());
    this.render();
  }

  handleFilterChange() {
    this.activeFilterDate = this.filterDateInput.value || null;
    this.clearFilterBtn.style.display = this.activeFilterDate ? 'inline-flex' : 'none';
    this.render();
  }

  clearFilter() {
    this.filterDateInput.value = '';
    this.activeFilterDate = null;
    this.clearFilterBtn.style.display = 'none';
    this.render();
  }

  handleSubmit(event) {
    event.preventDefault();

    const rawValue = this.valueInput.value;
    const date = this.dateInput.value;
    const time = this.timeInput.value;
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

    const reading = { id: Date.now(), value, date, time, notes };
    this.readings.unshift(reading);
    this.storage.set('readings', this.readings);

    this.showRangeAlert(value);
    this.form.reset();
    this._resetDateTimeDefaults();
    this.render();
  }

  _resetDateTimeDefaults() {
    if (!this.dateInput.value) {
      this.dateInput.value = this._today();
    }
    if (!this.timeInput.value) {
      this.timeInput.value = this._now();
    }
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

    const visible = this.activeFilterDate
      ? this.readings.filter((r) => r.date === this.activeFilterDate)
      : this.readings;

    if (visible.length === 0) {
      const label = new Date(`${this.activeFilterDate}T00:00:00`).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      this.listEl.innerHTML = `<div class="reading-empty">No readings logged on ${label}.</div>`;
      return;
    }

    this.listEl.innerHTML = visible.map((reading) => this._readingCardHtml(reading)).join('');
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
    const formattedTime = this._formatTime(reading.time);

    return `
      <div class="reading-card ${status.cls}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
          <div>
            <div class="reading-value">${reading.value} <span style="font-size:0.9rem; font-weight:400;">mg/dL</span></div>
            <div class="reading-meta">${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}</div>
          </div>
          <span class="reading-badge" style="background: var(--${status.bg}); color: var(--${status.fg});">${status.label}</span>
        </div>
        ${reading.notes ? `<p class="reading-meta" style="margin-top:0.75rem; margin-bottom:0;">${this._escape(reading.notes)}</p>` : ''}
      </div>
    `;
  }

  _formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  _toIsoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  _today() {
    return this._toIsoDate(new Date());
  }

  _now() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GlucoseTracker();
});
