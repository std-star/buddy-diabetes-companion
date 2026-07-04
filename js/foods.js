/**
 * foods.js — food explorer page.
 * Handles the CalorieNinjas API search section and the hand-curated
 * "Diabetes-Friendly Picks" dataset, kept as two clearly separate concerns.
 */
class FoodExplorer {
  constructor() {
    this.storage = new StorageManager('buddy');
    this.searchForm = document.getElementById('searchForm');
    this.searchInput = document.getElementById('foodSearchInput');
    this.resultsEl = document.getElementById('searchResults');
    this.ownGridEl = document.getElementById('ownFoodsGrid');

    this.init();
  }

  init() {
    this.renderEmptyState();
    this.loadOwnDataset();
  }

  renderEmptyState() {
    this.resultsEl.innerHTML = `
      <div class="state-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>Search for a food above to see its nutrition facts.</p>
      </div>
    `;
  }

  async loadOwnDataset() {
    try {
      const response = await fetch('data/foods.json');
      if (!response.ok) throw new Error('Failed to load foods.json');
      const foods = await response.json();
      this.renderOwnDataset(foods);
    } catch (err) {
      console.error('FoodExplorer: could not load own dataset', err);
      this.ownGridEl.innerHTML = '<p class="text-muted-custom">Couldn\'t load the food dataset right now.</p>';
    }
  }

  renderOwnDataset(foods) {
    this.ownGridEl.innerHTML = foods.map((food) => this._ownFoodCardHtml(food)).join('');
  }

  _ownFoodCardHtml(food) {
    const giClass = food.giCategory === 'low' ? 'gi-low' : 'gi-medium';
    return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <div class="nutrition-card h-100">
          <div class="food-emoji-badge" aria-hidden="true">${food.emoji}</div>
          <span class="gi-badge ${giClass}">GI ${food.glycemicIndex} · ${food.giCategory}</span>
          <h3>${food.name}</h3>
          <p class="text-muted-custom" style="font-size:0.9rem;">${food.description}</p>
          <p style="font-size:0.85rem; margin-bottom:0;"><strong>Why it's recommended:</strong> ${food.whyRecommended}</p>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FoodExplorer();
});
