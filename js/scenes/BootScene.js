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
    this.load.image('bg-garden','backgrounds/rose-garden.png?v=20260819-final-world-12');
    this.load.image('bg-castle','backgrounds/castle-interior.png?v=20260819-final-world-12');
    this.load.image('bg-boss','backgrounds/boss-tower.png?v=20260819-final-world-12');
    this.load.image('gothic-cage','props/gothic-cage.png?v=20260826-cage-rig-35');
    this.load.spritesheet('environment-atlas','props/environment-atlas.png?v=20260826-world-art-37',{frameWidth:314,frameHeight:314});
    this.load.image('forest-remaster-atlas','world/forest-remaster/forest-props-atlas.png?v=20260830-intro-level1-01');
    this.load.image('forest-sky-parallax','world/forest-remaster/forest-sky-parallax.png?v=20260830-intro-level1-02');
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
    const required=['paola-final','mateo-final','pecho-final','pigeon-enemies-v2','bg-romantic','bg-picnic','bg-forest','bg-garden','bg-castle','bg-boss','gothic-cage','environment-atlas','forest-remaster-atlas','forest-sky-parallax'];
    const missing=required.filter(key=>!this.textures.exists(key));
    if(missing.length)throw new Error(`Assets visuales obligatorios ausentes: ${missing.join(', ')}`);
    const forest=this.textures.get('forest-remaster-atlas'),frames={treeTall:[0,0,220,330],treeWide:[220,0,285,330],treeTwisted:[500,0,210,330],treeFlowers:[700,0,205,330],treeRoots:[900,0,205,330],treeMemory:[1085,0,250,330],treeLights:[1320,0,216,330],rootTunnel:[0,325,470,215],rootArch:[470,325,310,215],fallenLog:[1180,330,356,210],rootPlatform:[0,535,365,195],rockPlatform:[365,535,375,195],ruinPlatform:[740,535,390,195],brokenBridge:[1115,535,421,195],rootArena:[0,720,420,304],memoryGate:[420,700,350,324],memoryTree:[760,690,350,334],gardenPortal:[1100,690,436,334]};Object.entries(frames).forEach(([name,[x,y,w,h]])=>{if(!forest.has(name))forest.add(name,0,x,y,w,h);});
    console.info('[ARTE FINAL ACTIVO]',required.map(key=>`${key}:${this.textures.get(key).frameTotal} frames`).join(' · '));
    const level=Number(new URLSearchParams(location.search).get('levelDebug'));this.scene.start(level>=1&&level<=5?`Level${level}Scene`:'MenuScene');
  }
}
