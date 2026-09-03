import SaveManager from '../systems/SaveManager.js';
import { gameState } from '../config.js';
import AudioManager from '../systems/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.audioManager = new AudioManager(this);this.audioManager.playMusic('menuMusic');
    this.cameras.main.setBackgroundColor('#120d1f');
    this.cameras.main.fadeIn(500, 12, 10, 23);

    this.sceneObjects = this.add.container(0, 0);
    this.createSky();
    this.createParallaxScene();
    this.createCastleForefront();
    this.createCharacters();
    this.createTitle();
    this.createButtons();
    this.createFooter();

    this.input.keyboard.on('keydown-ENTER', () => { if (!this.modal && !this.transitioning) this.triggerNewGame(); });
    this.input.keyboard.on('keydown-SPACE', () => { if (!this.modal && !this.transitioning) this.triggerNewGame(); });
  }

  createSky() {
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x0b0d1d, 1);

    const skyGlow = this.add.graphics();
    skyGlow.fillGradientStyle(0x0d1631, 0x0d1631, 0x2f2149, 0x241b38, 1);
    skyGlow.fillRect(0, 0, this.scale.width, this.scale.height);
    skyGlow.setDepth(0);

    const moon = this.add.circle(this.scale.width * 0.76, 120, 62, 0xfbf1bf, 1);
    moon.setBlendMode(Phaser.BlendModes.SCREEN);
    moon.setDepth(1);
    const moonHalo = this.add.circle(this.scale.width * 0.76, 120, 102, 0xf4d98e, 0.16);
    moonHalo.setDepth(1);

    this.stars = this.add.group();
    for (let i = 0; i < 90; i++) {
      const star = this.add.circle(Math.random() * this.scale.width, Math.random() * 260, 1 + Math.random() * 2.5, 0xf9f4d7, 0.9);
      star.setDepth(2);
      star.alpha = 0.35 + Math.random() * 0.65;
      this.tweens.add({
        targets: star,
        alpha: 0.2 + Math.random() * 0.7,
        duration: 1200 + Math.random() * 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.stars.add(star);
    }

    this.createClouds();
  }

  createClouds() {
    const cloudColors = [0x8d9cc7, 0x5c678f];
    for (let i = 0; i < 12; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(cloudColors[i % cloudColors.length], 0.08);
      cloud.fillRoundedRect(0, 0, 80, 18, 10);
      cloud.generateTexture(`cloud-${i}`, 80, 18);
      cloud.destroy();
      const sprite = this.add.image(this.scale.width * (0.12 + i * 0.08), 80 + (i % 4) * 34, `cloud-${i}`);
      sprite.setBlendMode(Phaser.BlendModes.SCREEN);
      sprite.setAlpha(0.35);
      sprite.setDepth(2);
      this.tweens.add({
        targets: sprite,
        x: sprite.x + 14,
        duration: 7000 + i * 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createParallaxScene() {
    const mountains = [
      { color: 0x1d1c35, height: 170, y: 420, factor: 0.2 },
      { color: 0x242a47, height: 150, y: 470, factor: 0.35 },
      { color: 0x2e2547, height: 110, y: 530, factor: 0.6 },
    ];

    mountains.forEach((layer, index) => {
      const g = this.add.graphics();
      g.fillStyle(layer.color, 1);
      g.beginPath();
      g.moveTo(0, 720);
      for (let x = 0; x <= this.scale.width + 60; x += 110) {
        const peak = x + (index % 2 ? 55 : 0);
        const height = Math.max(30, layer.height + ((x / 110) % 2) * 50);
        g.lineTo(peak, 720 - height);
      }
      g.lineTo(this.scale.width, 720);
      g.closePath();
      g.fillPath();
      g.generateTexture(`mountains-${index}`, this.scale.width, 720);
      const sprite = this.add.image(0, 0, `mountains-${index}`);
      sprite.setOrigin(0, 0);
      sprite.setDepth(4 + index);
      sprite.setScrollFactor(0);
      sprite.setAlpha(0.9);
    });

    const forest = this.add.graphics();
    forest.fillStyle(0x101825, 1);
    for (let x = 0; x < this.scale.width; x += 26) {
      const h = 40 + ((x / 26) % 3) * 16;
      forest.fillTriangle(x, 720, x + 12, 720 - h, x + 24, 720);
    }
    forest.generateTexture('forest-back', this.scale.width, 720);
    this.add.image(this.scale.width / 2, 720, 'forest-back').setOrigin(0.5, 1).setDepth(10);
  }

  createCastleForefront() {
    const castleBase = this.add.graphics();
    castleBase.fillStyle(0x261b31, 1);
    castleBase.fillRoundedRect(this.scale.width * 0.7, 260, 210, 200, 8);
    castleBase.fillStyle(0x412f4d, 1);
    castleBase.fillRoundedRect(this.scale.width * 0.74, 300, 140, 150, 8);
    castleBase.fillStyle(0xf5d38a, 0.8);
    castleBase.fillCircle(this.scale.width * 0.79 + 8, 350, 7);
    castleBase.fillCircle(this.scale.width * 0.79 + 60, 350, 7);
    castleBase.fillStyle(0x6d3658, 1);
    castleBase.fillRect(this.scale.width * 0.74 + 32, 328, 26, 54);
    castleBase.fillRect(this.scale.width * 0.74 + 82, 328, 26, 54);
    castleBase.fillStyle(0x1a1326, 1);
    castleBase.fillRect(this.scale.width * 0.77, 450, 70, 120);
    castleBase.generateTexture('castle-main', 260, 220);
    const castle = this.add.image(this.scale.width * 0.85, 470, 'castle-main');
    castle.setOrigin(0.5, 1);
    castle.setDepth(12);

    const castleWindow = this.add.rectangle(this.scale.width * 0.81, 390, 46, 62, 0x443255, 1);
    castleWindow.setStrokeStyle(2, 0xf7d98a, 1);
    castleWindow.setDepth(13);
    const windowGlow = this.add.rectangle(this.scale.width * 0.81, 390, 18, 18, 0xf1d26d, 0.9);
    windowGlow.setDepth(14);

    const mateoSilhouette = this.add.graphics();
    mateoSilhouette.fillStyle(0x1b1c2a, 1);
    mateoSilhouette.fillCircle(this.scale.width * 0.81, 410, 9);
    mateoSilhouette.fillRect(this.scale.width * 0.81 - 8, 420, 16, 24);
    mateoSilhouette.generateTexture('mateo-window', 30, 40);
    this.add.image(this.scale.width * 0.81, 400, 'mateo-window').setDepth(15);

    this.add.particles(0, 0, undefined, {
      x: { min: this.scale.width * 0.74, max: this.scale.width * 0.9 },
      y: { min: 320, max: 430 },
      lifespan: 2200,
      speedX: { min: -18, max: 18 },
      speedY: { min: -25, max: 25 },
      scale: { start: 1.2, end: 0.1 },
      quantity: 12,
      tint: [0xf7d98a, 0xff9bc0],
      emitting: false,
      gravityY: -10,
    }).emitParticleAt(this.scale.width * 0.8, 390, 12);

    const pigeonGroup = this.add.group();
    for (let i = 0; i < 5; i++) {
      const pigeon = this.add.graphics();
      pigeon.fillStyle(0xefebef, 1);
      pigeon.fillTriangle(0, 6, 18, 4, 12, 10);
      pigeon.fillTriangle(18, 6, 30, 4, 24, 10);
      pigeon.generateTexture(`pigeon-${i}`, 30, 16);
      pigeon.destroy();
      const bird = this.add.image(this.scale.width * (0.68 + i * 0.04), 260 + i * 18, `pigeon-${i}`);
      bird.setScale(0.9);
      bird.setDepth(16);
      pigeonGroup.add(bird);
      this.tweens.add({
        targets: bird,
        x: bird.x + (i % 2 === 0 ? 60 : -60),
        y: bird.y + 10,
        duration: 3600 + i * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createCharacters() {
    const paola = this.add.graphics();
    paola.fillStyle(0xf7d7b7, 1);
    paola.fillCircle(0, 0, 16);
    paola.fillStyle(0x5d3a2d, 1);
    paola.fillRoundedRect(-18, -20, 36, 12, 5);
    paola.fillStyle(0x2d2f54, 1);
    paola.fillRoundedRect(-16, -4, 30, 7, 3);
    paola.fillStyle(0xf7f5ff, 1);
    paola.fillRoundedRect(-16, 18, 34, 20, 6);
    paola.fillStyle(0x4d82ff, 1);
    paola.fillRoundedRect(-15, 36, 28, 18, 4);
    paola.fillStyle(0x201f2f, 1);
    paola.fillRoundedRect(-16, 52, 10, 12, 3);
    paola.fillRoundedRect(6, 52, 10, 12, 3);
    paola.destroy();
    const paolaSprite = this.add.image(200, 620, 'paola-final', 0);
    paolaSprite.setOrigin(0.5, 1);
    paolaSprite.setDepth(16);
    paolaSprite.setScale(0.92);

    const roses = this.add.graphics();
    for (let i = 0; i < 7; i++) {
      const x = 18 + i * 29;
      const y = 66 - (i % 2) * 11;
      roses.fillStyle(0x3f7d4d, 1).fillRect(x - 1, y + 3, 3, 16);
      roses.fillTriangle(x, y + 10, x - 8, y + 5, x - 2, y + 14);
      roses.fillStyle(i % 2 ? 0xff79ad : 0xd83e78, 1);
      roses.fillCircle(x - 4, y, 5).fillCircle(x + 4, y, 5).fillCircle(x, y - 4, 5);
      roses.fillStyle(0xffc0d8, 1).fillCircle(x, y, 2);
    }
    roses.generateTexture('rose-cluster', 220, 80);
    roses.destroy();
    this.add.image(260, 620, 'rose-cluster').setOrigin(0.5, 1).setDepth(18);
  }

  createTitle() {
    const group = this.add.container(this.scale.width / 2, 195);
    group.setDepth(30);

    const title1 = this.add.text(0, 0, 'RESCATE', {
      fontFamily: 'monospace',
      fontSize: '58px',
      color: '#f8dcea',
      stroke: '#6d255a',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#200b22', blur: 0, fill: true },
    }).setOrigin(0.5);

    const title2 = this.add.text(0, 64, 'DE AMOR', {
      fontFamily: 'monospace',
      fontSize: '60px',
      color: '#fbecc8',
      stroke: '#6e2a5b',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#200b22', blur: 0, fill: true },
    }).setOrigin(0.5);

    group.add([title1, title2]);

    for (let i = 0; i < 7; i++) {
      const heart = this.add.text((-220 + i * 75), (i % 2 === 0 ? -28 : 98), '♥', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ff7db8',
      });
      heart.setOrigin(0.5);
      heart.alpha = 0.7;
      group.add(heart);
    }

    this.tweens.add({
      targets: group,
      y: 188,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const tagline = this.add.text(this.scale.width / 2, 336, 'Una aventura hecha con amor.', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f3d9ed',
      letterSpacing: 2,
      stroke: '#311324',
      strokeThickness: 3,
    }).setOrigin(0.5);
    tagline.setDepth(30);

    this.titleGroup = group;
    this.tagline = tagline;
  }

  createButtons() {
    const buttonData = [
      { key: 'new', label: '♥ NUEVA PARTIDA', x: 640, y: 385, width: 360 },
      { key: 'continue', label: '▣ CONTINUAR', x: 640, y: 435, width: 360 },
      { key: 'controls', label: '◆ CONTROLES', x: 495, y: 495, width: 270 },
      { key: 'cards', label: '✉ CARTAS', x: 785, y: 495, width: 270 },
      { key: 'settings', label: '⚙ AJUSTES', x: 495, y: 545, width: 270 },
      { key: 'achievements', label: '★ LOGROS', x: 785, y: 545, width: 270 },
      { key: 'credits', label: '✦ CRÉDITOS', x: 640, y: 595, width: 360 },
    ];

    this.buttonGroup = this.add.container(0, 0).setDepth(30);
    const hasSave = !!localStorage.getItem('rescate-de-amor-save');

    this.buttonObjects = buttonData.map((entry, index) => {
      const panel = this.add.rectangle(entry.x, entry.y, entry.width, 44, 0x1e1227, 0.92);
      panel.setStrokeStyle(2, 0xf4d48a, 1);
      panel.setDepth(30);
      panel.setAlpha(entry.key === 'continue' && !hasSave ? 0.4 : 1);

      const text = this.add.text(entry.x, entry.y, entry.label, {
        fontFamily: 'monospace',
        fontSize: '19px',
        color: '#f9f0ff',
        letterSpacing: 1.2,
      }).setOrigin(0.5);
      text.setDepth(31);
      text.setAlpha(entry.key === 'continue' && !hasSave ? 0.44 : 1);

      const interactive = entry.key === 'continue' && !hasSave ? null : panel;
      if (interactive) {
        panel.setInteractive({ useHandCursor: true });
        panel.on('pointerover', () => {
          this.audioManager.playSfx('menu');
          this.tweens.add({ targets: panel, scaleX: 1.04, scaleY: 1.04, duration: 120 });
          this.tweens.add({ targets: text, y: entry.y - 1, duration: 120 });
        });
        panel.on('pointerout', () => {
          this.tweens.add({ targets: panel, scaleX: 1, scaleY: 1, duration: 120 });
          this.tweens.add({ targets: text, y: entry.y, duration: 120 });
        });
      }

      const actionMap = {
        new: () => this.triggerNewGame(),
        continue: () => this.loadSave(),
        controls: () => this.showControls(),
        cards: () => this.showCards(),
        settings: () => this.showSettings(),
        achievements: () => this.showAchievements(),
        credits: () => this.showCredits(),
      };

      if (interactive) {
        panel.on('pointerdown', actionMap[entry.key]);
      }

      this.buttonGroup.add([panel, text]);
      return { panel, text, key: entry.key, action: actionMap[entry.key] };
    });

    this.input.keyboard.on('keydown', (event) => {
      if (this.modal || this.transitioning) return;
      if (event.code === 'KeyN') this.triggerNewGame();
      if (event.code === 'KeyC') this.loadSave();
    });
  }

  createFooter() {
    const footer = this.add.text(this.scale.width / 2, this.scale.height - 32, 'HECHO CON ♥ PARA TI', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#f5d7e8',
      letterSpacing: 2,
      stroke: '#2e1732',
      strokeThickness: 2,
    }).setOrigin(0.5);
    footer.setDepth(30);
  }

  triggerNewGame() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.closeModal();
    SaveManager.newGame();
    this.time.delayedCall(150, () => {
      this.cameras.main.fadeOut(700, 0, 0, 0);
      this.tweens.add({
        targets: this.titleGroup,
        y: 140,
        alpha: 0.2,
        duration: 700,
        ease: 'Sine.easeInOut',
      });
      this.tagline.setAlpha(0.1);
      const buttons = this.buttonGroup ? this.buttonGroup.list || [] : [];
      buttons.forEach((obj) => {
        if (obj && obj instanceof Phaser.GameObjects.Rectangle) {
          this.tweens.add({ targets: obj, alpha: 0, y: obj.y + 24, duration: 500, ease: 'Cubic.easeIn' });
        }
      });
      this.time.delayedCall(700, () => this.scene.start('IntroScene'));
    });
  }

  loadSave() {
    if (this.transitioning || !localStorage.getItem('rescate-de-amor-save')) return;
    this.transitioning = true;
    this.closeModal();
    const data = SaveManager.load();
    Object.assign(gameState, data);
    this.scene.start(data.currentScene && this.scene.manager.keys[data.currentScene] ? data.currentScene : 'Level1Scene');
  }

  showControls() {
    this.showModal('CONTROLES', 'A/D o flechas  ·  Mover\nSHIFT o Q  ·  Dash / correr\nSPACE, W o ↑  ·  Saltar\nZ o J  ·  Combo cuerpo a cuerpo\nX o K  ·  Energía de amor\n↓ + Z  ·  Golpe aéreo\nC o L  ·  Ataque especial\nV  ·  Escudo de Amor\nESC  ·  Pausa');
  }

  showCredits() {
    this.showModal('CRÉDITOS', 'RESCATE DE AMOR\n\nUna aventura original para Paola y Mateo\nArte pixel generado localmente\nMúsica y efectos sintetizados');
  }

  showCards() {
    const data=SaveManager.load(); const all=[['heart','♥','Contigo, cada latido es especial.'],['star','★','Eres mi lugar favorito en el universo.'],['rose','🌹','Gracias por hacer mis días más bonitos.'],['letter','✉','Contigo escribo mi historia favorita.'],['diamond','◆','Contigo llego más alto que mis sueños.']];
    this.showModal('NUESTROS RECUERDOS',all.map(([k,i,t])=>data.memories.includes(k)?`${i} ${t}`:'🔒 ???').join('\n\n')+(data.memories.length===5?'\n\n💌 CARTA FINAL DESBLOQUEADA':''));
  }
  showAchievements(){ const a=SaveManager.load().achievements||[]; this.showModal('LOGROS',a.length?a.map(x=>`★ ${x}`).join('\n\n'):'🔒 La aventura aún no ha comenzado.'); }
  showSettings(){ const data=SaveManager.load(); const muted=!data.settings.muted; data.settings.muted=muted; Object.assign(gameState,data);SaveManager.save(data);this.showModal('AJUSTES',`Audio: ${muted?'SILENCIADO':'ACTIVO'}\n\nLa preferencia quedó guardada.`); }
  closeModal(){if(!this.modal)return;this.modal.destroy(true);this.modal=null;}
  showModal(title,body){this.closeModal();this.modal=this.add.container(0,0).setDepth(80);const shade=this.add.rectangle(640,360,1280,720,0x080511,.84).setInteractive();const panel=this.add.rectangle(640,360,720,520,0x21122c,.99).setStrokeStyle(5,0xf2c86f);const h=this.add.text(640,155,title,{fontFamily:'monospace',fontSize:'31px',color:'#ffe4a1'}).setOrigin(.5);const t=this.add.text(640,350,body,{fontFamily:'monospace',fontSize:'17px',color:'#ffeaf5',align:'center',lineSpacing:5,wordWrap:{width:620}}).setOrigin(.5);const close=this.add.text(640,570,'VOLVER  [ESC]',{fontFamily:'monospace',fontSize:'20px',color:'#fff',backgroundColor:'#6b3159',padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:true});this.modal.add([shade,panel,h,t,close]);close.once('pointerdown',()=>this.closeModal());this.input.keyboard.once('keydown-ESC',()=>this.closeModal());this.tweens.add({targets:this.modal,alpha:{from:0,to:1},duration:160});}
}
