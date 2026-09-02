import { gameState } from '../config.js';

const DEFAULT_STATE = JSON.parse(JSON.stringify(gameState));

export default class SaveManager {
  static key = 'rescate-de-amor-save';

  static load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) return this.defaults();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Number.isFinite(parsed.unlockedLevel)) throw new Error('Formato inválido');
      const data = { ...this.defaults(), ...parsed };
      data.memories = Array.isArray(parsed.memories) ? [...new Set(parsed.memories)] : [];
      data.achievements = Array.isArray(parsed.achievements) ? [...new Set(parsed.achievements)] : [];
      data.unlockedPowers = Array.isArray(parsed.unlockedPowers) ? [...new Set(parsed.unlockedPowers)] : [];
      data.settings = { ...gameState.settings, ...(parsed.settings || {}) };
      return data;
    } catch (error) {
      console.warn('No se pudo cargar la partida:', error);
      localStorage.removeItem(this.key);
      return this.defaults();
    }
  }

  static save(data = gameState) {
    try { localStorage.setItem(this.key, JSON.stringify({ ...data, saved: true })); } catch (error) { console.warn('No se pudo guardar:', error); }
  }

  static clear() {
    localStorage.removeItem(this.key);
  }

  static defaults() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }

  static newGame() {
    const settings = this.load().settings;
    this.clear();
    Object.assign(gameState, this.defaults(), { settings });
    return gameState;
  }

  static update(patch = {}) { Object.assign(gameState, patch); this.save(gameState); return gameState; }

  static addUnique(field, value) {
    const list = Array.isArray(gameState[field]) ? gameState[field] : [];
    if (!list.includes(value)) list.push(value);
    gameState[field] = list;
    this.save(gameState);
  }
}
