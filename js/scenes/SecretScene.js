import ParticleManager from '../systems/ParticleManager.js';
import AudioManager from '../systems/AudioManager.js';
import { gameState } from '../config.js';

export default class SecretScene extends Phaser.Scene {
  constructor() {
    super('SecretScene');
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.audioManager.playMusic('endingMusic');
    this.cameras.main.setBackgroundColor('#0a0512');
    this.particleManager = new ParticleManager(this);

    // Background with romantic lighting
    const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x0a0512, 1);

    // Decorative string lights
    const lightsBg = this.add.graphics();
    lightsBg.fillStyle(0x1a0f25, 1);
    lightsBg.fillRect(0, 0, this.scale.width, this.scale.height);
    lightsBg.generateTexture('night-sky', this.scale.width, this.scale.height);
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'night-sky').setOrigin(0.5);
    lightsBg.destroy();

    // Fairy lights animation
    for (let i = 0; i < 20; i++) {
      const x = (i % 5) * (this.scale.width / 5) + 50;
      const y = Math.floor(i / 5) * 80 + 100;
      const light = this.add.circle(x, y, 4, 0xffd7a8, 0.8);
      
      this.tweens.add({
        targets: light,
        alpha: 0.3,
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
      });
    }

    // Title
    const title = this.add.text(this.scale.width / 2, 80, 'NUESTRA HISTORIA', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#f8e9ff',
      stroke: '#5a2a5a',
      strokeThickness: 3,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const subtitle = this.add.text(this.scale.width / 2, 130, 'apenas comienza...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffd7ef',
    }).setOrigin(0.5);

    // Photo panels
    this.createPhotoPanel(this.scale.width / 2 - 200, this.scale.height / 2 - 30, 'NUESTRO RECUERDO', 1);
    this.createPhotoPanel(this.scale.width / 2 + 200, this.scale.height / 2 - 30, '19 • 09 • 2025', 2);

    // Bottom message
    const message = this.add.text(this.scale.width / 2, this.scale.height - 150, 'Hecho con ❤️ para ti 💕', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#fef5ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Floating petals
    for (let i = 0; i < 40; i++) {
      const petal = this.add.text(
        Math.random() * this.scale.width,
        Math.random() * this.scale.height,
        Math.random() > 0.5 ? '🌹' : '🌸',
        { fontSize: '16px' }
      );
      petal.setAlpha(0.2 + Math.random() * 0.3);
      
      this.tweens.add({
        targets: petal,
        y: petal.y + 400,
        x: petal.x + (Math.random() - 0.5) * 200,
        alpha: 0,
        duration: 4000 + Math.random() * 3000,
        delay: Math.random() * 1000,
        onComplete: () => petal.destroy(),
      });
    }

    // Interactive elements
    const continueBtn = this.add.rectangle(this.scale.width / 2, this.scale.height - 50, 240, 48, 0x2f2238, 1)
      .setStrokeStyle(3, 0xf7d98a, 1)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(this.scale.width / 2, this.scale.height - 50, 'CONTINUARÁ...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#fff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    continueBtn.on('pointerover', () => {
      this.tweens.add({ targets: continueBtn, scaleX: 1.08, scaleY: 1.08, duration: 100 });
      continueBtn.setFillStyle(0x4a3350);
    });

    continueBtn.on('pointerout', () => {
      this.tweens.add({ targets: continueBtn, scaleX: 1, scaleY: 1, duration: 100 });
      continueBtn.setFillStyle(0x2f2238);
    });

    const goToMenu = () => {
      this.cameras.main.fadeOut(800);
      this.time.delayedCall(800, () => {
        gameState.secretUnlocked = true;
        gameState.currentScene = 'SecretScene';
        localStorage.setItem('rescate-de-amor-save', JSON.stringify(gameState));
        this.scene.start('MenuScene');
      });
    };

    continueBtn.on('pointerdown', goToMenu);
    this.input.keyboard.once('keydown-SPACE', goToMenu);
    this.input.keyboard.once('keydown-ENTER', goToMenu);
  }

  createPhotoPanel(x, y, label, index) {
    // Frame
    const frame = this.add.rectangle(x, y, 280, 240, 0x3c2c54, 0.9);
    frame.setStrokeStyle(4, 0xf7d98a, 1);

    // Decorative corners
    const cornerSize = 8;
    const corners = this.add.graphics();
    corners.fillStyle(0xf7d98a, 0.5);
    for (let i = 0; i < 4; i++) {
      const cx = i % 2 === 0 ? x - 140 : x + 140;
      const cy = i < 2 ? y - 120 : y + 120;
      corners.fillRect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
    }
    corners.setDepth(3);

    // Content inside - Paola and Mateo scene
    const contentGfx = this.add.graphics();
    
    if (index === 1) {
      // Paola
      contentGfx.fillStyle(0xf7d7b7, 1);
      contentGfx.fillCircle(28, 22, 15);
      contentGfx.fillStyle(0x5d3a2d, 1);
      contentGfx.fillRoundedRect(12, 5, 31, 13, 3);
      contentGfx.fillStyle(0x2d2f54, 1);
      contentGfx.fillRect(14, 36, 28, 22);
      contentGfx.fillStyle(0xf6f1ff, 1);
      contentGfx.fillRect(17, 39, 22, 13);
    } else {
      // Mateo and Paola together
      contentGfx.fillStyle(0xf7d7b7, 1);
      contentGfx.fillCircle(22, 24, 15);
      contentGfx.fillCircle(58, 24, 15);
      
      // Heart between them
      contentGfx.fillStyle(0xff69b4, 1);
      contentGfx.fillCircle(36, 42, 6);
      contentGfx.fillCircle(44, 42, 6);
      contentGfx.fillTriangle(32, 44, 48, 44, 40, 54);
    }
    
    const key=`secret-photo-${index}`; contentGfx.generateTexture(key, 80, 65);
    this.add.image(x, y - 30, key).setScale(2.5);
    contentGfx.destroy();
    this.add.image(x-34,y-28,'paola-final',index===1?9:7).setScale(.62).setDepth(8);
    this.add.image(x+34,y-28,'mateo-final',index===1?3:4).setScale(.61).setDepth(8).setFlipX(true);

    // Label
    this.add.text(x, y + 100, label, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffd7ef',
    }).setOrigin(0.5);

    // Decorative hearts
    this.add.text(x - 120, y + 50, '❤️', { fontSize: '20px' }).setOrigin(0.5);
    this.add.text(x + 120, y + 50, '❤️', { fontSize: '20px' }).setOrigin(0.5);
  }
}
