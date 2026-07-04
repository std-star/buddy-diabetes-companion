/**
 * foods.js — food explorer page.
 * Handles the CalorieNinjas API search section and the hand-curated
 * "Diabetes-Friendly Picks" dataset, kept as two clearly separate concerns.
 */
class FoodExplorer {
  // Get a free key at https://calorieninjas.com/api and paste it below.
  static API_KEY = 'YOUR_CALORIENINJAS_API_KEY';
  static API_URL = 'https://api.calorieninjas.com/v1/nutrition?query=';

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
    // Demo call so the API integration is visible before the search box
    // is wired up in the next step.
    this.searchFood('banana');
  }

  renderEmptyState() {
    this.resultsEl.innerHTML = `
      <div class="state-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>Search for a food above to see its nutrition facts.</p>
      </div>
    `;
  }

  renderLoading() {
    this.resultsEl.innerHTML = `
      <div class="state-panel">
        <div class="spinner-buddy" role="status" aria-label="Loading nutrition facts"></div>
        <p style="margin-top: var(--space-4);">Fetching nutrition facts…</p>
      </div>
    `;
  }

  renderNoResults(query) {
    this.resultsEl.innerHTML = `
      <div class="state-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No nutrition facts found for "${this._escape(query)}". Try a different food name.</p>
      </div>
    `;
  }

  renderError(message) {
    this.resultsEl.innerHTML = `
      <div class="state-panel state-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>${this._escape(message)}</p>
      </div>
    `;
    new AlertBanner('error', message).show();
  }

  renderNutritionResults(items) {
    this.resultsEl.innerHTML = `
      <div class="row g-4">
        ${items.map((item) => this._nutritionCardHtml(item)).join('')}
      </div>
    `;
  }

  async searchFood(rawQuery) {
    const query = rawQuery.trim();
    if (!query) {
      this.renderEmptyState();
      return;
    }

    this.renderLoading();

    try {
      const response = await fetch(`${FoodExplorer.API_URL}${encodeURIComponent(query)}`, {
        headers: { 'X-Api-Key': FoodExplorer.API_KEY },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('INVALID_KEY');
      }
      if (!response.ok) {
        throw new Error('NETWORK');
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        this.renderNoResults(query);
        return;
      }

      this.renderNutritionResults(data.items);
    } catch (err) {
      console.error('FoodExplorer: search failed', err);
      if (err.message === 'INVALID_KEY') {
        this.renderError('Your CalorieNinjas API key is missing or invalid. Add a valid key in js/foods.js to search live nutrition data.');
      } else {
        this.renderError('Something went wrong reaching the nutrition service. Check your connection and try again.');
      }
    }
  }

  _nutritionCardHtml(item) {
    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="nutrition-card h-100">
          <h3>${this._escape(item.name)}</h3>
          <ul class="nutrition-stats">
            <li><span class="stat-label">Calories</span><span class="stat-value">${Math.round(item.calories)}</span></li>
            <li><span class="stat-label">Carbs (g)</span><span class="stat-value">${item.carbohydrates_total_g}</span></li>
            <li><span class="stat-label">Protein (g)</span><span class="stat-value">${item.protein_g}</span></li>
            <li><span class="stat-label">Fat (g)</span><span class="stat-value">${item.fat_total_g}</span></li>
            <li><span class="stat-label">Sugar (g)</span><span class="stat-value">${item.sugar_g}</span></li>
          </ul>
        </div>
      </div>
    `;
  }

  _escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
