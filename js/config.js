export const GAME_CONFIG = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game',
  backgroundColor: '#090b19',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false,
    },
  },
  render: {
    antialias: false,
    roundPixels: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
};

export const gameState = {
  version: 2,
  unlockedLevel: 1,
  currentScene: 'Level1Scene',
  roses: 0,
  health: 5,
  maxHealth: 5,
  memories: [],
  achievements: [],
  checkpoint: null,
  power: 'none',
  saved: false,
  finalLetterUnlocked: false,
  secretUnlocked: false,
  settings: { music: 0.35, sfx: 0.55, muted: false },
};
