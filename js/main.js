import { GAME_CONFIG } from './config.js?v=20260820-professional-final-22';
import BootScene from './scenes/BootScene.js?v=20260819-final-world-12';
import MenuScene from './scenes/MenuScene.js?v=20260819-final-art-4';
import IntroScene from './scenes/IntroScene.js?v=20260820-professional-final-22';
import Level1Scene from './scenes/Level1Scene.js?v=20260820-pickup-combat-24';
import Level2Scene from './scenes/Level2Scene.js?v=20260820-pickup-combat-24';
import Level3Scene from './scenes/Level3Scene.js?v=20260820-pickup-combat-24';
import BossScene from './scenes/BossScene.js?v=20260820-pickup-combat-24';
import EndingScene from './scenes/EndingScene.js?v=20260820-professional-final-22';
import SecretScene from './scenes/SecretScene.js?v=20260819-final-art-4';

const showDebugError = () => {
  let panel = document.getElementById('rescate-debug-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'rescate-debug-panel';
    panel.style.position = 'fixed';
    panel.style.left = '16px';
    panel.style.bottom = '16px';
    panel.style.maxWidth = '420px';
    panel.style.padding = '12px 14px';
    panel.style.background = 'rgba(96, 12, 12, 0.94)';
    panel.style.border = '2px solid #ff7e7e';
    panel.style.borderRadius = '8px';
    panel.style.boxShadow = '0 0 18px rgba(255, 80, 80, 0.5)';
    panel.style.color = '#fff';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.lineHeight = '1.5';
    panel.style.zIndex = '99999';
    panel.style.pointerEvents = 'auto';
    document.body.appendChild(panel);
  }
  panel.innerHTML = '<strong>Algo interrumpió la aventura.</strong><br>Recarga la página para volver al último recuerdo guardado.';
};

window.addEventListener('error', (event) => {
  console.error('[RESCATE DEBUG]', event.error || event.message || event);
  showDebugError((event.error && event.error.stack) ? event.error.stack : event.message || 'Error desconocido');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[RESCATE DEBUG REJECTION]', event.reason);
  showDebugError(event.reason && event.reason.stack ? event.reason.stack : String(event.reason));
});

const config = {
  ...GAME_CONFIG,
  scene: [BootScene, MenuScene, IntroScene, Level1Scene, Level2Scene, Level3Scene, BossScene, EndingScene, SecretScene],
};

window.game = new Phaser.Game(config);
