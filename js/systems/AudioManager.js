export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem('rescate-de-amor-save') || '{}').settings || {}; } catch (_) {}
    this.enabled = !settings.muted;
    this.sfxVolume = settings.sfx ?? 0.55;
    this.music = {};
    this.sfx = {};
    this._lock = false;
  }

  setEnabled(value) {
    this.enabled = value;
    if (!value) {
      this.stopMusic();
    }
  }

  createTone(key, frequency = 440, duration = 0.12, type = 'sine', volume = 0.05) {
    if (!this.enabled || !this.scene.sound || !this.scene.sound.context) return;
    const ctx = this.scene.sound.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume * this.sfxVolume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    const endTime = ctx.currentTime + duration;
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
    osc.stop(endTime);
  }

  playMusic(name) {
    if (!this.enabled) return;
    const valid = ['menuMusic', 'forestMusic', 'gardenMusic', 'castleMusic', 'bossMusic', 'endingMusic'];
    if (!valid.includes(name)) return;
    if (this.currentMusic === name) return;
    this.currentMusic = name;
    const palette = {
      menuMusic: 220,
      forestMusic: 262,
      gardenMusic: 330,
      castleMusic: 196,
      bossMusic: 160,
      endingMusic: 392,
    };
    this.createTone(name, palette[name], 0.18, 'triangle', 0.02);
  }

  stopMusic() {
    this.currentMusic = null;
  }

  playSfx(name) {
    if (!this.enabled) return;
    const map = {
      jump: [440, 0.09, 'triangle', 0.04],
      rose: [740, 0.12, 'sine', 0.05],
      heart: [520, 0.1, 'sine', 0.05],
      letter: [660, 0.18, 'triangle', 0.05],
      diamond: [860, 0.15, 'triangle', 0.06],
      hit: [180, 0.12, 'square', 0.04],
      attack: [360, 0.09, 'sawtooth', 0.04],
      checkpoint: [510, 0.14, 'triangle', 0.06],
      bossHit: [110, 0.1, 'square', 0.05],
      victory: [660, 0.16, 'triangle', 0.08],
      enemyDown: [250, 0.08, 'triangle', 0.045],
      menu: [520, 0.06, 'sine', 0.04],
    };
    const preset = map[name];
    if (!preset) return;
    this.createTone(name, preset[0], preset[1], preset[2], preset[3]);
  }
}
