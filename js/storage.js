/**
 * storage.js — generic localStorage wrapper with JSON parse/stringify.
 * Used by GlucoseTracker to persist glucose readings.
 */
class StorageManager {
  constructor(namespace = 'buddy') {
    this.namespace = namespace;
  }

  _key(key) {
    return `${this.namespace}:${key}`;
  }

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      console.error(`StorageManager: failed to read "${key}"`, err);
      return fallback;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`StorageManager: failed to write "${key}"`, err);
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(this._key(key));
  }
}
