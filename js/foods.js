/**
 * foods.js — food explorer page.
 * Handles the USDA FoodData Central search section and the hand-curated
 * "Diabetes-Friendly Picks" dataset, kept as two clearly separate concerns.
 */
class FoodExplorer {
  // DEMO_KEY is USDA's public testing key (rate-limited to ~30 requests/hour
  // per IP). Get your own free key instantly at https://api.data.gov/signup/
  // and paste it below for normal use.
  static API_KEY = 'rQGfWW7krGFtsSVqi3yrUawyK3NiaoWyiDGCiRKv';
  static API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
  static RESULT_LIMIT = 6;

  // USDA nutrient names vary slightly by data source, so each stat is matched
  // by a case-insensitive substring rather than an exact nutrientId.
  static NUTRIENT_MATCHERS = {
    calories: (n) => n.nutrientName.includes('Energy') && n.unitName === 'KCAL',
    protein: (n) => n.nutrientName.includes('Protein'),
    fat: (n) => n.nutrientName.includes('lipid'),
    carbs: (n) => n.nutrientName.includes('Carbohydrate'),
    sugar: (n) => n.nutrientName.includes('Sugars'),
  };

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
    this.searchForm.addEventListener('submit', (e) => this.handleSearchSubmit(e));
  }

  handleSearchSubmit(event) {
    event.preventDefault();
    this.searchFood(this.searchInput.value);
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
      // Fetch a larger pool than we display: USDA's relevance ranking often
      // puts composite dishes (e.g. "Croissants, apple") above the plain
      // whole food, so we re-rank client-side before trimming to the limit.
      const params = new URLSearchParams({
        query,
        pageSize: 20,
        dataType: 'Foundation,SR Legacy',
        api_key: FoodExplorer.API_KEY,
      });
      const response = await fetch(`${FoodExplorer.API_URL}?${params.toString()}`);

      if (response.status === 401 || response.status === 403) {
        throw new Error('INVALID_KEY');
      }
      if (!response.ok) {
        throw new Error('NETWORK');
      }

      const data = await response.json();

      if (!data.foods || data.foods.length === 0) {
        this.renderNoResults(query);
        return;
      }

      const ranked = this._prioritizeDirectMatches(data.foods, query);
      this.renderNutritionResults(ranked.slice(0, FoodExplorer.RESULT_LIMIT));
    } catch (err) {
      console.error('FoodExplorer: search failed', err);
      if (err.message === 'INVALID_KEY') {
        this.renderError('The USDA FoodData Central API key is missing or invalid. Add a valid key in js/foods.js to search live nutrition data.');
      } else {
        this.renderError('Something went wrong reaching the nutrition service. Check your connection and try again.');
      }
    }
  }

  _prioritizeDirectMatches(foods, query) {
    const q = query.trim().toLowerCase();
    // USDA's description format is "Main food, modifiers, ..." — a direct
    // match means the food itself (not a composite dish it's an ingredient
    // in) is what was searched for, e.g. "Apples, raw" for query "apple".
    const isDirectMatch = (food) => {
      const firstSegment = food.description.split(',')[0].trim().toLowerCase();
      return firstSegment === q || firstSegment === `${q}s` || firstSegment.startsWith(q);
    };
    return [...foods].sort((a, b) => Number(!isDirectMatch(a)) - Number(!isDirectMatch(b)));
  }

  _readNutrient(foodNutrients, statKey) {
    const matcher = FoodExplorer.NUTRIENT_MATCHERS[statKey];
    const match = foodNutrients.find(matcher);
    return match ? Math.round(match.value * 10) / 10 : null;
  }

  _nutritionCardHtml(food) {
    const stats = {
      calories: this._readNutrient(food.foodNutrients, 'calories'),
      carbs: this._readNutrient(food.foodNutrients, 'carbs'),
      protein: this._readNutrient(food.foodNutrients, 'protein'),
      fat: this._readNutrient(food.foodNutrients, 'fat'),
      sugar: this._readNutrient(food.foodNutrients, 'sugar'),
    };
    const display = (value, unit) => (value === null ? '—' : `${value}${unit}`);

    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="nutrition-card h-100">
          <h3>${this._escape(food.description.toLowerCase())}</h3>
          <ul class="nutrition-stats">
            <li><span class="stat-label">Calories</span><span class="stat-value">${display(stats.calories, '')}</span></li>
            <li><span class="stat-label">Carbs (g)</span><span class="stat-value">${display(stats.carbs, '')}</span></li>
            <li><span class="stat-label">Protein (g)</span><span class="stat-value">${display(stats.protein, '')}</span></li>
            <li><span class="stat-label">Fat (g)</span><span class="stat-value">${display(stats.fat, '')}</span></li>
            <li><span class="stat-label">Sugar (g)</span><span class="stat-value">${display(stats.sugar, '')}</span></li>
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
