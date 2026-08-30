export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.setPath('assets');
    this.load.spritesheet('paola-final','characters/paola/paola-sheet.png?v=20260819-final-art-4',{frameWidth:80,frameHeight:96});
    this.load.spritesheet('mateo-final','characters/mateo/mateo-sheet.png?v=20260819-final-art-4',{frameWidth:80,frameHeight:96});
    this.load.spritesheet('pecho-final','characters/pecho-paloma/pecho-paloma-sheet.png?v=20260819-final-art-4',{frameWidth:112,frameHeight:120});
    this.load.spritesheet('pigeon-enemies-v2','sprites/pigeon-enemies-v2-clean.png?v=20260823-professional-polish-29',{frameWidth:128,frameHeight:128});
    this.load.image('bg-romantic','backgrounds/romantic-overlook.png?v=20260819-final-world-12');
    this.load.image('bg-picnic','backgrounds/romantic-picnic.png?v=20260821-picnic-final-25');
    this.load.image('bg-forest','backgrounds/enchanted-forest.png?v=20260819-final-world-12');
    this.load.image('bg-forest-clean','backgrounds/enchanted-forest-clean.png?v=20260829-world-remaster-01');
    this.load.image('bg-garden','backgrounds/rose-garden.png?v=20260819-final-world-12');
    this.load.image('bg-garden-clean','backgrounds/rose-garden-clean.png?v=20260829-world-remaster-01');
    this.load.image('bg-castle','backgrounds/castle-interior.png?v=20260819-final-world-12');
    this.load.image('bg-fortress-clean','backgrounds/fortress-storm-clean.png?v=20260829-world-remaster-01');
    this.load.image('bg-boss','backgrounds/boss-tower.png?v=20260819-final-world-12');
    this.load.image('bg-tower-clean','backgrounds/heart-tower-clean.png?v=20260829-world-remaster-01');
    this.load.image('bg-palace-clean','backgrounds/palace-depth-clean.png?v=20260829-world-remaster-01');
    this.load.image('gothic-cage','props/gothic-cage.png?v=20260826-cage-rig-35');
    this.load.spritesheet('environment-atlas','props/environment-atlas.png?v=20260826-world-art-37',{frameWidth:314,frameHeight:314});
    this.load.on('loaderror',file=>console.error('[ASSET FINAL NO CARGADO]',file?.src||file?.key));
    this.graphics = this.add.graphics();
    this.graphics.fillStyle(0x0a0a16, 1);
    this.graphics.fillRect(0, 0, this.scale.width, this.scale.height);
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'RESCATE DE AMOR', {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: '#ffd8a8',
      stroke: '#3b1533',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'Cargando...', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f4d3ec',
    }).setOrigin(0.5);

    this.add.rectangle(0, 0, 0, 0);
  }

  create() {
    const required=['paola-final','mateo-final','pecho-final','pigeon-enemies-v2','bg-romantic','bg-picnic','bg-forest','bg-forest-clean','bg-garden','bg-garden-clean','bg-castle','bg-fortress-clean','bg-boss','bg-tower-clean','bg-palace-clean','gothic-cage','environment-atlas'];
    const missing=required.filter(key=>!this.textures.exists(key));
    if(missing.length)throw new Error(`Assets visuales obligatorios ausentes: ${missing.join(', ')}`);
    console.info('[ARTE FINAL ACTIVO]',required.map(key=>`${key}:${this.textures.get(key).frameTotal} frames`).join(' · '));
    const debugQuery=new URLSearchParams(location.search),debugLevel=Number(debugQuery.get('levelDebug')||(debugQuery.has('level1Debug')?1:0));
    this.scene.start(debugLevel>=1&&debugLevel<=5?`Level${debugLevel}Scene`:'MenuScene');
  }
}
