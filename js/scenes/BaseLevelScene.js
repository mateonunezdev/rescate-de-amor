import Player from '../entities/Player.js?v=20260826-cage-rig-35';
import Enemy from '../entities/Enemy.js?v=20260826-cage-rig-35';
import Collectible from '../entities/Collectible.js?v=20260823-master-final-30';
import UIManager from '../ui/UIManager.js?v=20260823-ai-shield-polish-31';
import AudioManager from '../systems/AudioManager.js';
import ParticleManager from '../systems/ParticleManager.js';
import SaveManager from '../systems/SaveManager.js';
import { gameState } from '../config.js';
import { TextureFactory } from '../utils/TextureFactory.js?v=20260826-cage-rig-35';

const MEMORY = {
  heart: ['CORAZÓN', 'Contigo, cada latido es especial.'],
  star: ['ESTRELLA', 'Eres mi lugar favorito en todo el universo.'],
  rose: ['ROSA', 'Gracias por hacer mis días más bonitos.'],
  letter: ['CARTA', 'Contigo escribo mi historia favorita.'],
  diamond: ['DIAMANTE', 'Contigo llego más alto que mis sueños.'],
  card1: ['CARTA I', 'Contigo, cada latido es especial.'],
  card2: ['CARTA II', 'Gracias por hacer mis días más bonitos.'],
  card3: ['CARTA III', 'Contigo escribo mi historia favorita.'],
};
const DEBUG_HAZARDS=false;

export default class BaseLevelScene extends Phaser.Scene {
  constructor(key, data) { super(key); this.levelData = data; }

  create() {
    this.exitCreated=false;this.finishing=false;this.paused=false;this.gameOver=false;this.cardPickupInProgress=false;this.debugHazards=DEBUG_HAZARDS||new URLSearchParams(location.search).has('debugHazards');
    Object.assign(gameState, SaveManager.load());
    this.dataDef = this.levelData;
    this.audioManager = new AudioManager(this); this.audioManager.playMusic(this.dataDef.music);
    this.particleManager = new ParticleManager(this);
    this.makeTextures(); this.makeWorld(); this.makeDecor(); this.makePlatforms(); this.validateRoute();
    const spawn = gameState.checkpoint?.scene === this.scene.key ? gameState.checkpoint : { x: 100, y: 565 };
    this.player = new Player(this, spawn.x, spawn.y);
    this.player.canChargeLove=!!gameState.chargedUnlocked||(gameState.memories||[]).includes('card3');
    this.player.maxHealth = gameState.maxHealth || 5; this.player.health = Math.min(gameState.health || 5, this.player.maxHealth);
    if (gameState.power === 'super salto') this.player.jumpVelocity = -570;
    this.physics.add.collider(this.player, this.solids);
    this.makeHazards();
    this.cameras.main.setBounds(0, 0, this.dataDef.width, 720).startFollow(this.player, true, 0.09, 0.09).setDeadzone(180, 100);
    this.uiManager = new UIManager(this); this.refreshHud();
    this.projectiles = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group();
    this.dataDef.enemies.forEach(e => { const enemy=new Enemy(this,e.x,e.y,e);e.platformIndex!==undefined?this.spawnEnemyOnPlatform(enemy,this.dataDef.platforms[e.platformIndex]):this.spawnEnemyOnGround(enemy,e.x,e.y);this.enemies.add(enemy); });
    this.general=this.enemies.getChildren().find(e=>e.miniBoss||e.type==='general');if(this.general){this.generalMaxHealth=this.general.health;this.generalHud=this.add.container(640,128).setScrollFactor(0).setDepth(950).setVisible(false);const gb=this.add.rectangle(0,0,410,46,0x1a1025,.94).setStrokeStyle(3,0xe4b75d);this.generalFill=this.add.rectangle(-190,12,380,10,0xc24983).setOrigin(0,.5);const gt=this.add.text(0,-9,`⚔ ${this.general.displayName||'GENERAL PALOMO'} ⚔`,{fontFamily:'monospace',fontSize:'17px',color:'#ffe6ad'}).setOrigin(.5);this.generalHud.add([gb,this.generalFill,gt]);}
    this.setupEncounterDialogues();
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.overlap(this.player,this.enemies,(p,e)=>p.takeDamage(e.damage,e),(_,e)=>!!(e.active&&e.visible&&e.alpha>=.45&&e.body?.enable),this);
    this.physics.add.overlap(this.projectiles,this.enemies,(shot,enemy)=>{shot.hitTargets=shot.hitTargets||new Set();if(shot.hitTargets.has(enemy))return;shot.hitTargets.add(enemy);const frontal=enemy.type==='knight'&&Math.sign(shot.x-enemy.x)!==enemy.direction;if(frontal&&!shot.piercing){shot.destroy();enemy.setTint(0xffe39a);this.time.delayedCall(90,()=>enemy.active&&enemy.clearTint());return;}const damage=Math.ceil((shot.damage||1)*(gameState.attackBoost||1));if(!shot.piercing)shot.destroy();for(let i=0;i<damage;i++)enemy.active&&enemy.hit();});
    this.makeCollectibles(); this.makeCheckpoint(); this.makeLevelPuzzle(); this.makeCombatArena(); this.makeExit(); this.makePause(); this.makeMobileControls();this.validateDamageSources();
    this.events.on('player-hit', () => { gameState.health = this.player.health; this.refreshHud(); });
    this.events.on('game-over', () => this.showGameOver());
    this.add.text(32, 148, `${this.dataDef.title}\n${this.dataDef.objective}`, { fontFamily:'monospace', fontSize:'17px', color:'#ffe4ac', lineSpacing:7, stroke:'#28152f', strokeThickness:4 }).setScrollFactor(0).setDepth(200);
    if(this.scene.key==='Level1Scene'){const controls=this.add.text(640,625,'A/D MOVER · SPACE SALTAR · SHIFT CORRER · V ESCUDO\nZ/J COMBO · X/K ENERGÍA/CARGA · ↓+Z GOLPE AÉREO · C/L ESPECIAL · E INTERACTUAR',{fontFamily:'monospace',fontSize:'13px',color:'#fff0cf',align:'center',lineSpacing:5,backgroundColor:'#21132b',padding:{x:14,y:8}}).setOrigin(.5).setScrollFactor(0).setDepth(1050);this.tweens.add({targets:controls,alpha:0,y:605,duration:700,delay:9000,onComplete:()=>controls.destroy()});}
  }

  setupEncounterDialogues(){
    const target=this.general||this.enemies.getChildren().find(e=>e.type==='soldier'||e.type==='mage');
    if(!target)return;
    const lines=this.scene.key==='Level1Scene'?[['CAPITÁN PALOMA','Hasta aquí llegaste.','right'],['PAOLA','Solo dime dónde está Mateo.','left'],['CAPITÁN PALOMA','En un lugar al que nunca llegarás.','right'],['PAOLA','Entonces tendré que demostrarte lo contrario.','left']]:this.scene.key==='Level2Scene'?[['ARCHIMAGO PALOMA','La reina sabía que vendrías.','right'],['PAOLA','Entonces también sabe que no voy a detenerme.','left'],['ARCHIMAGO PALOMA','Eso lo veremos.','right']]:[['GENERAL PALOMO','Has llegado demasiado lejos.','right'],['PAOLA','No lo suficiente.','left'],['GENERAL PALOMO','Tu viaje termina aquí.','right'],['PAOLA','¿Eso lo decides tú?','left']];
    this.encounterDialogue={target,lines,shown:false};
  }

  spawnEnemyOnGround(enemy,x,intendedY){
    if(!enemy.humanoid)return;const feetTarget=intendedY+36,candidates=[{y:648,min:0,max:this.dataDef.width}];this.dataDef.platforms.forEach(p=>{const width=p.renderWidth||Math.round(p.w*1.28);if(x>=p.x-width/2&&x<=p.x+width/2)candidates.push({y:p.y-13,min:p.x-width/2+18,max:p.x+width/2-18});});candidates.sort((a,b)=>Math.abs(a.y-feetTarget)-Math.abs(b.y-feetTarget));const surface=candidates[0];enemy.setPosition(x,surface.y-36);enemy.safeSpawn={x,y:surface.y-36};enemy.spawnX=x;enemy.minX=Math.max(enemy.minX,surface.min);enemy.maxX=Math.min(enemy.maxX,surface.max);if(enemy.minX>enemy.maxX){enemy.minX=surface.min;enemy.maxX=surface.max;}enemy.patrolMinX=enemy.minX;enemy.patrolMaxX=enemy.maxX;enemy.body.setAllowGravity(true);enemy.body.updateFromGameObject();
  }

  spawnEnemyOnPlatform(enemy,platform){
    if(!enemy?.humanoid||!platform)return;const width=platform.renderWidth||Math.round(platform.w*1.28),surfaceTop=platform.y-13,bodyHeight=enemy.body?.height||60,bodyOffset=enemy.body?.offset?.y||0,spriteHeight=enemy.displayHeight||bodyHeight;const feetOffset=Math.min(spriteHeight/2,bodyOffset+bodyHeight-spriteHeight/2),enemyY=surfaceTop-feetOffset;
    enemy.setPosition(Phaser.Math.Clamp(enemy.x,platform.x-width/2+22,platform.x+width/2-22),enemyY);enemy.safeSpawn={x:enemy.x,y:enemyY};enemy.spawnX=enemy.x;enemy.minX=platform.x-width/2+22;enemy.maxX=platform.x+width/2-22;enemy.patrolMinX=enemy.minX;enemy.patrolMaxX=enemy.maxX;enemy.body.setAllowGravity(true);enemy.body.updateFromGameObject();
  }

  startEncounterDialogue(){
    const encounter=this.encounterDialogue;if(!encounter||encounter.shown)return;encounter.shown=true;encounter.target.setVelocityX(0);encounter.target.inAction=true;
    if(this.scene.key==='Level3Scene'){const shade=this.add.rectangle(640,360,1280,720,0x090612,.34).setScrollFactor(0).setDepth(1080);this.tweens.add({targets:shade,alpha:0,duration:600,delay:4300,onComplete:()=>shade.destroy()});}
    encounter.lines.forEach(([speaker,line,tail],i)=>this.time.delayedCall(i*1250,()=>this.uiManager.showDialogueBubble(speaker,line,{x:speaker==='PAOLA'?360:900,y:speaker==='PAOLA'?430:250,tail,duration:1150,width:520})));
    this.time.delayedCall(encounter.lines.length*1250,()=>encounter.target.active&&(encounter.target.inAction=false));
  }

  makeTextures() {
    TextureFactory.createCombatTextures(this);
    TextureFactory.createHazardTextures(this);
    TextureFactory.createPlayerTexture(this);
    ['pigeon','dive','magic','winged','broken','guard','guardian','assassin','slime','soldier','archer','knight','mage','general'].forEach(t => TextureFactory.createEnemyTexture(this,t));
    Object.keys(MEMORY).forEach(t => TextureFactory.createCollectibleTexture(this,t));
  }

  makeWorld() {
    this.physics.world.setBounds(0,0,this.dataDef.width,720); this.cameras.main.setBackgroundColor(this.dataDef.sky);
    if(this.dataDef.background)this.add.image(640,360,this.dataDef.background).setDisplaySize(1280,720).setScrollFactor(0).setDepth(-20);
    const g=this.add.graphics(); g.fillGradientStyle(this.dataDef.skyTop,this.dataDef.skyTop,this.dataDef.skyBottom,this.dataDef.skyBottom,this.dataDef.background?.08:1); g.fillRect(0,0,this.dataDef.width,720);
    if(!this.dataDef.background){for(let i=0;i<75;i++) this.add.circle(Math.random()*this.dataDef.width,30+Math.random()*300,1+Math.random()*1.4,0xfff1bd,.35+Math.random()*.55).setScrollFactor(.2);this.add.circle(980,125,64,0xffefb0,.9).setScrollFactor(.12);this.add.circle(980,125,92,0xffd581,.12).setScrollFactor(.12);}
    this.solids=this.physics.add.staticGroup(); const ground=this.add.rectangle(this.dataDef.width/2,684,this.dataDef.width,72,0x000000,0).setVisible(false); this.physics.add.existing(ground,true); this.solids.add(ground);
  }

  makeDecor() {
    if(this.dataDef.background){for(let i=0;i<46;i++){const p=this.add.circle(Math.random()*this.dataDef.width,350+Math.random()*300,1+Math.random()*3,this.dataDef.accent,.5).setDepth(4);this.tweens.add({targets:p,y:p.y-45,x:p.x+(Math.random()-.5)*35,alpha:.08,duration:1700+Math.random()*1900,yoyo:true,repeat:-1});}return;}
    const mountains=this.add.graphics().setDepth(1); mountains.fillStyle(this.dataDef.theme==='castle'?0x191426:0x171d39,.75); mountains.beginPath(); mountains.moveTo(0,530); for(let x=0;x<=this.dataDef.width;x+=180)mountains.lineTo(x,310+(x/180%3)*55); mountains.lineTo(this.dataDef.width,530);mountains.closePath();mountains.fillPath();mountains.setScrollFactor(.28);
    for(let x=80;x<this.dataDef.width;x+=170){
      if(this.dataDef.theme==='forest'){ const trunk=this.add.rectangle(x,565,30,205,0x35243a).setStrokeStyle(4,0x201a2e); const crown=this.add.circle(x,440,76,0x173c38); this.add.circle(x-42,457,48,0x245346);this.add.circle(x+38,463,52,0x1e493e); trunk.setDepth(2); crown.setDepth(2); if(x%340<100)this.add.rectangle(x+55,600,38,65,0x62566d).setStrokeStyle(3,0xa391a4); }
      if(this.dataDef.theme==='garden'){ this.add.rectangle(x,590,135,88,0x234b3e).setStrokeStyle(3,0x4e8054); for(let j=0;j<5;j++) this.add.circle(x-50+j*25,548+(j%2)*13,8,0xd83e7e); if(x%510<100){const fountain=this.add.circle(x,560,42,0x5e7892).setStrokeStyle(5,0x9bc5ce);this.add.rectangle(x,607,105,15,0x6b697b);this.add.rectangle(x,505,8,60,0xb2dce0,.7);fountain.setDepth(3);}else{this.add.rectangle(x,490,8,135,0x3f3b45);this.add.circle(x,430,13,0xffcc78,.8);this.add.circle(x,430,27,0xffb55d,.13);} }
      if(this.dataDef.theme==='castle'){ this.add.rectangle(x,470,108,335,0x2c2544).setStrokeStyle(4,0x685278); const window=this.add.rectangle(x,425,32,78,0x9b2b82,.72).setStrokeStyle(3,0xd9a060);this.add.rectangle(x,395,3,65,0xf2bd85,.55); if(x%340<100){for(let c=0;c<5;c++)this.add.circle(x+55,320+c*38,7,0x17131e).setStrokeStyle(2,0x7d7280);this.add.triangle(x-45,300,0,0,75,18,0,36,0x8e295f);} window.setDepth(3); }
    }
    if(this.dataDef.theme==='garden'){const castle=this.add.graphics().setScrollFactor(.18).setDepth(2);castle.fillStyle(0x302442,.8);castle.fillRect(this.dataDef.width-720,230,260,300);castle.fillRect(this.dataDef.width-780,180,70,350);castle.fillRect(this.dataDef.width-470,170,75,360);castle.fillTriangle(this.dataDef.width-790,180,this.dataDef.width-745,110,this.dataDef.width-700,180);castle.fillTriangle(this.dataDef.width-480,170,this.dataDef.width-432,95,this.dataDef.width-385,170);}
    if(this.dataDef.theme==='castle'){for(let i=0;i<5;i++){const fire=this.add.circle(420+i*620,535,10,0xff8b46,.9);this.add.circle(fire.x,fire.y,24,0xba4b9b,.16);this.tweens.add({targets:fire,scaleY:1.5,alpha:.55,duration:180,yoyo:true,repeat:-1});}this.add.rectangle(1500,650,260,25,0xe34b55,.7).setStrokeStyle(4,0xffa049);}
    for(let i=0;i<36;i++){ const p=this.add.circle(Math.random()*this.dataDef.width,400+Math.random()*250,2+Math.random()*3,this.dataDef.accent,.65); this.tweens.add({targets:p,y:p.y-35,alpha:.15,duration:1800+Math.random()*1800,yoyo:true,repeat:-1}); }
  }

  makePlatforms(){this.dataDef.platforms.forEach((p,i)=>{const pw=Math.round(p.w*(i%5===0?1.38:i%3===0?1.3:1.24));p.renderWidth=pw;const collider=this.add.rectangle(p.x,p.y,pw,26,0x000000,0).setVisible(false);this.physics.add.existing(collider,true);this.solids.add(collider);const frame={forest:0,garden:1,castle:2,tower:3,palace:2}[this.dataDef.theme]??2;this.add.image(p.x,p.y+25,'environment-atlas',frame).setDisplaySize(pw+18,94).setDepth(10);});}

  makeHazards(){const layouts={forest:[880,1430,2240,2760,3220],garden:[830,1610,2400,3190,3840],castle:[820,1590,2370,3150,3900],tower:[1050,1880,2760,3660,4070],palace:[1120,2010,2920,3780]},styles={forest:[8,8,11],garden:[8,9,8],castle:[9,10,11],tower:[10,9,11],palace:[11,10,9]};this.hazards=[];(layouts[this.dataDef.theme]||[]).forEach((x,i)=>{const frame=styles[this.dataDef.theme][i%3],key=['','','','','','','','','hazard-thorns','hazard-flame','hazard-blade','hazard-magic'][frame],h=this.add.image(x,625,'environment-atlas',frame).setName(key).setDepth(12).setDisplaySize(frame===10?72:frame===8?86:78,frame===10?72:62);h.baseScaleX=h.scaleX;h.baseScaleY=h.scaleY;this.physics.add.existing(h,true);h.body.setSize(Math.min(58,h.displayWidth*.72),Math.min(30,h.displayHeight*.42));h.phase=i*430;h.warning=this.add.ellipse(x,646,74,24,this.dataDef.accent,.08).setStrokeStyle(2,this.dataDef.accent,.65).setDepth(11);this.hazards.push(h);this.physics.add.overlap(this.player,h,()=>{if(h.dangerous)this.player.takeDamage(1,h);});});}

  makePuzzleDoor(x,label){const door=this.add.container(x,430).setDepth(25),frame={forest:4,garden:5,castle:6,tower:7,palace:15}[this.dataDef.theme]??6,art=this.add.image(0,0,'environment-atlas',frame).setDisplaySize(245,330),rune=this.add.text(0,-18,this.dataDef.theme==='forest'?'♥':this.dataDef.theme==='garden'?'🌹':'ᚱ',{fontFamily:'monospace',fontSize:'28px',color:'#ff91c4'}).setOrigin(.5),name=this.add.text(0,135,label,{fontFamily:'monospace',fontSize:'12px',color:'#ffe8c2',align:'center',backgroundColor:'#211328',padding:{x:6,y:3}}).setOrigin(.5),blocker=this.add.rectangle(x,430,92,330,0x000000,0);door.add([art,rune,name]);this.physics.add.existing(blocker,true);this.solids.add(blocker);door.blocker=blocker;door.rune=rune;return door;}

  openPuzzleDoor(message){if(this.puzzleSolved)return;this.puzzleSolved=true;const door=this.puzzleDoor;if(door?.blocker?.body){this.solids.remove(door.blocker);door.blocker.body.enable=false;}this.audioManager.playSfx('checkpoint');this.particleManager.burst(door.x,430,0xff73b6,34,260);this.tweens.add({targets:door,y:-40,alpha:.15,duration:1150,ease:'Cubic.easeIn'});this.uiManager.showDialogueBubble('PAOLA',message,{x:640,y:430,duration:1900,width:590});}

  makeCombatArena(){const cfg=this.dataDef.arena;if(!cfg)return;const makeGate=x=>{const art=this.add.image(x,470,'environment-atlas',7).setDisplaySize(105,230).setDepth(28).setVisible(false),body=this.add.rectangle(x,500,70,280,0x000000,0).setVisible(false);this.physics.add.existing(body,true);body.body.enable=false;this.solids.add(body);return{art,body};};this.combatArena={...cfg,started:false,cleared:false,left:makeGate(cfg.start),right:makeGate(cfg.end)};this.arenaHud=this.add.text(640,155,'',{fontFamily:'monospace',fontSize:'18px',color:'#fff1c1',backgroundColor:'#481739',padding:{x:14,y:8},stroke:'#1b0919',strokeThickness:3}).setOrigin(.5).setScrollFactor(0).setDepth(1150).setVisible(false);}
  startCombatArena(){const a=this.combatArena;if(!a||a.started)return;a.started=true;[a.left,a.right].forEach(g=>{g.art.setVisible(true);g.body.body.enable=true;g.body.body.updateFromGameObject();});this.cameras.main.shake(120,.003);this.uiManager.showMessage('DERROTA A LOS GUARDIANES','#ffe2a0',1500);this.updateCombatArena();}
  updateCombatArena(){const a=this.combatArena;if(!a?.started||a.cleared)return;const remaining=this.enemies.getChildren().filter(e=>e.active&&e.x>a.start&&e.x<a.end);this.arenaHud.setVisible(true).setText(`ENEMIGOS RESTANTES: ${remaining.length}`);if(remaining.length)return;a.cleared=true;this.arenaHud.setText('ARENA SUPERADA').setColor('#bfffc9');[a.left,a.right].forEach((g,i)=>{g.body.body.enable=false;this.tweens.add({targets:g.art,y:g.art.y-170,alpha:0,duration:700,delay:i*100,onComplete:()=>g.art.setVisible(false)});});this.time.delayedCall(1200,()=>this.arenaHud.setVisible(false));this.audioManager.playSfx('checkpoint');}

  makeLevelPuzzle(){this.puzzleSolved=false;this.puzzlePrompt=this.add.text(640,590,'',{fontFamily:'monospace',fontSize:'16px',color:'#fff2d6',backgroundColor:'#29162d',padding:{x:14,y:8},align:'center'}).setOrigin(.5).setScrollFactor(0).setDepth(1100).setVisible(false);
    if(this.scene.key==='Level1Scene'){this.puzzleX=1480;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PUERTA DEL\nRECUERDO');const tunnel=this.add.rectangle(1840,390,690,500,0x080914,.42).setDepth(3);for(let x=1570;x<2170;x+=120){const torch=this.add.circle(x,515,7,0xff6faf,.9).setDepth(10);this.add.line(0,0,x,520,x,550,0x6f4938,1).setOrigin(0,0).setDepth(9);this.tweens.add({targets:torch,scale:1.5,alpha:.45,duration:260,yoyo:true,repeat:-1});}for(let i=0;i<16;i++)this.add.circle(1540+Math.random()*620,260+Math.random()*330,2,0xff75bd,.5).setDepth(6);tunnel.setStrokeStyle(4,0x5e3659,.35);this.input.keyboard.on('keydown',event=>{if(!this.puzzleActive||this.puzzleSolved)return;const answer=event.key?.toUpperCase();if(answer==='D'){this.puzzleActive=false;this.puzzlePrompt.setVisible(false);this.openPuzzleDoor('Todo ❤️. Siempre fue todo.');}else if(['A','B','C'].includes(answer))this.uiManager.showDialogueBubble('PUERTA DEL RECUERDO','También cuenta... pero ambos sabemos la respuesta 😏',{x:640,y:390,duration:1700,width:650});});}
    else if(this.scene.key==='Level2Scene'){this.puzzleX=1910;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PÉRGOLA DE\nLOS RECUERDOS');this.puzzleSymbols=[{x:1280,key:'ROSA',icon:'🌹'},{x:1500,key:'CORAZÓN',icon:'♥'},{x:1720,key:'ESTRELLA',icon:'★'}].map(s=>{const c=this.add.container(s.x,585).setDepth(20),stone=this.add.circle(0,0,34,0x8b7f86).setStrokeStyle(4,0xd2b783),icon=this.add.text(0,0,s.icon,{fontSize:'27px',color:'#ff80b7'}).setOrigin(.5);c.add([stone,icon]);return {...s,node:c,active:false};});this.input.keyboard.on('keydown-E',()=>this.activateGardenSymbol());}
    else{this.puzzleX=3820;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PUERTA DE\nLAS TRES RUNAS');this.runesCollected=0;this.runeSlots=[-28,0,28].map(dx=>this.add.text(this.puzzleX+dx,430,'◇',{fontFamily:'monospace',fontSize:'24px',color:'#b66caa'}).setOrigin(.5).setDepth(30));}
  }

  activateGardenSymbol(){if(this.puzzleSolved)return;const symbol=this.puzzleSymbols?.find(s=>!s.active&&Math.abs(this.player.x-s.x)<80);if(!symbol)return;symbol.active=true;symbol.node.list[1].setColor('#fff0a8');this.particleManager.burst(symbol.x,570,0xff7db6,16,150);const count=this.puzzleSymbols.filter(s=>s.active).length;this.uiManager.showDialogueBubble('JARDÍN',count===3?'Los recuerdos correctos harán florecer el camino.':'Un recuerdo florece...',{x:640,y:420,duration:1300,width:570});if(count===3)this.openPuzzleDoor('Rosa, corazón y estrella. El camino florece.');}

  onRuneGuardianDefeated(enemy){if(this.scene.key!=='Level3Scene'||!enemy.runeGuardian||enemy.runeAwarded)return;enemy.runeAwarded=true;this.runesCollected=Math.min(3,(this.runesCollected||0)+1);const slot=this.runeSlots?.[this.runesCollected-1];slot?.setText('ᚱ').setColor('#ffd078');this.particleManager.burst(enemy.x,enemy.y,0xd87bff,22,200);this.uiManager.showDialogueBubble('PAOLA',`Runa recuperada · ${this.runesCollected}/3`,{x:640,y:430,duration:1400,width:460});if(this.runesCollected===3)this.openPuzzleDoor('Las tres runas responden. La puerta está abierta.');}

  validateDamageSources(){const bad=[];(this.hazards||[]).forEach((h,i)=>{if(!h.visible||!h.texture?.key||!h.warning?.visible)bad.push(`hazard-${i}`);});this.enemies?.getChildren().forEach((e,i)=>{if(e.damage>0&&(!e.visible||!e.texture?.key))bad.push(`enemy-${i}`);});if(bad.length)console.error(`[QA ${this.scene.key}] Damage hitboxes sin representación visible`,bad);else console.info(`[QA ${this.scene.key}] CERO damage hitboxes invisibles`);if(this.debugHazards){this.damageDebug=this.add.graphics().setDepth(1200);this.damageDebugLabels=[...(this.hazards||[]),...this.enemies.getChildren()].map(o=>({source:o,label:this.add.text(o.x,o.y-45,o.name||o.type||'DAMAGE',{fontFamily:'monospace',fontSize:'10px',color:'#ffffff',backgroundColor:'#a00000',padding:{x:3,y:2}}).setOrigin(.5).setDepth(1201)}));}}

  validateRoute(){const gravity=900,jump=450,run=350,maxRise=jump*jump/(2*gravity),route=[{x:100,y:648,w:20},...this.dataDef.platforms];const report=[];for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],verticalGap=Math.max(0,a.y-b.y),horizontalGap=Math.max(0,Math.abs(b.x-a.x)-(a.w+b.w)/2);const disc=jump*jump-2*gravity*verticalGap;const flight=disc>=0?(jump+Math.sqrt(disc))/gravity:0;const maxHorizontal=run*flight;report.push({jump:i,verticalGap,horizontalGap,maxHorizontal:Math.round(maxHorizontal),valid:verticalGap<=maxRise-8&&horizontalGap<=maxHorizontal*.88});}const invalid=report.filter(x=>!x.valid);console.table(report);if(invalid.length)console.error(`[QA ${this.scene.key}] Saltos fuera de rango`,invalid);else console.info(`[QA ${this.scene.key}] Ruta principal validada: ${report.length} saltos`);}

  makeCollectibles() {
    this.collectibles=[];
    this.dataDef.collectibles.forEach(c=>{if(c.memory&&gameState.memories.includes(c.type))return;const item=new Collectible(this,c.x,c.y,c.type);item.isMemory=!!c.memory;item.collectibleData=c;this.collectibles.push(item);this.physics.add.overlap(this.player,item,()=>this.attemptPickup(item));});
  }

  attemptPickup(item){if(!item?.active||item.collected||item.magnetizing)return;const guardian=this.enemies.getChildren().find(e=>e.active&&e.miniBoss&&e.health>0);if(item.type.startsWith('card')&&guardian){if(!this.guardMessageAt||this.time.now-this.guardMessageAt>1100){this.guardMessageAt=this.time.now;this.uiManager.showMessage(`${guardian.displayName||'GUARDIÁN'} · Derrótalo para recuperar la carta`,'#ffe0ef',1000);}return;}item.magnetTo(this.player,()=>item.active&&this.collect(item));}

  collect(item) {
    if(item.collected||(item.type.startsWith('card')&&this.cardPickupInProgress))return; const type=item.type;if(type.startsWith('card'))this.cardPickupInProgress=true;item.collect();
    if(item.isMemory){ SaveManager.addUnique('memories',type); if(type==='heart'){ gameState.maxHealth=Math.max(6,gameState.maxHealth); this.player.maxHealth=gameState.maxHealth; this.player.heal(2); } if(type==='rose')this.player.heal(2); if(type==='diamond'){this.player.jumpVelocity=-570; gameState.power='super salto';}if(type==='card1'){gameState.maxHealth=Math.max(6,gameState.maxHealth);this.player.maxHealth=gameState.maxHealth;this.player.heal(3);}if(type==='card2')gameState.attackBoost=1.25;if(type==='card3'){gameState.chargedUnlocked=true;this.player.canChargeLove=true;}
      SaveManager.addUnique('achievements',type.startsWith('card')?`Carta ${type.slice(-1)} conseguida`:type==='heart'?'Primer recuerdo':type==='diamond'?'Más alto que mis sueños':'Recuerdo encontrado');
    } else this.addRose(1); this.refreshHud(); SaveManager.save(gameState);type.startsWith('card')?this.showCard(type):item.isMemory&&this.showMemory(type);
  }

  showCard(type){
    const [name,msg]=MEMORY[type];
    this.physics.pause();this.paused=true;this.uiManager.container.setVisible(false);this.player.setVelocity(0);
    const layer=this.add.container(0,0).setScrollFactor(0).setDepth(1300);this.cardOverlay=layer;
    const shade=this.add.rectangle(640,360,1280,720,0x17091f,.75).setInteractive({useHandCursor:true});
    const glow=this.add.ellipse(640,350,700,390,0xff5fae,.12);
    const paper=this.add.rectangle(640,345,620,300,0xffefd5,.99).setStrokeStyle(8,0xd45586);
    const title=this.add.text(640,245,'💌  CARTA ENCONTRADA  ❤️',{fontFamily:'monospace',fontSize:'28px',color:'#72264f',fontStyle:'bold'}).setOrigin(.5);
    const line=this.add.text(640,355,`${name}\n\n“${msg}”`,{fontFamily:'monospace',fontSize:'23px',color:'#51203e',align:'center',lineSpacing:10}).setOrigin(.5);
    const button=this.add.text(640,465,'CONTINUAR',{fontFamily:'monospace',fontSize:'18px',color:'#fff',backgroundColor:'#7b315f',padding:{x:20,y:10}}).setOrigin(.5).setInteractive({useHandCursor:true});
    layer.add([shade,glow,paper,title,line,button]);layer.setScale(.68).setAlpha(0);
    const continueZone=this.add.zone(640,465,240,80).setScrollFactor(0).setDepth(1500).setInteractive({useHandCursor:true});this.cardContinueZone=continueZone;
    this.tweens.add({targets:layer,scale:1,alpha:1,duration:380,ease:'Back.easeOut'});this.tweens.add({targets:glow,scale:1.12,alpha:.25,duration:650,yoyo:true,repeat:-1});
    this.particleManager.burst(640,345,0xff6eac,32,280);this.audioManager.playSfx('checkpoint');
    let closing=false,cardCanClose=false,enableCloseTimer=null,close,keyboardClose,cleaned=false;
    const cleanup=()=>{if(cleaned)return;cleaned=true;if(enableCloseTimer?.active)enableCloseTimer.remove(false);if(shade?.scene){shade.off('pointerdown',close);shade.removeInteractive();}if(button?.scene){button.off('pointerdown',close);button.removeInteractive();}if(continueZone?.scene&&continueZone.active){continueZone.off('pointerdown',close);continueZone.destroy();}this.cardContinueZone=null;this.input.keyboard?.off('keydown-ENTER',keyboardClose);this.input.keyboard?.off('keydown-SPACE',keyboardClose);};
    close=()=>{if(!cardCanClose||closing||!layer.active)return;closing=true;cleanup();this.tweens.killTweensOf([layer,glow]);this.tweens.add({targets:layer,alpha:0,scale:.9,duration:220,onComplete:()=>{if(layer.active)layer.destroy();this.cardOverlay=null;this.cardPickupInProgress=false;this.paused=false;this.physics.resume();this.uiManager.container.setVisible(true).setAlpha(1);this.refreshHud();this.uiManager.showMessage('SALIDA DESBLOQUEADA','#ffe7a8',1500);}});};
    keyboardClose=()=>{cardCanClose=true;close();};this.input.keyboard.once('keydown-ENTER',keyboardClose);this.input.keyboard.once('keydown-SPACE',keyboardClose);
    enableCloseTimer=this.time.delayedCall(300,()=>{if(!layer.active)return;cardCanClose=true;continueZone.once('pointerdown',close);button.once('pointerdown',close);shade.once('pointerdown',close);});
    this.events.once('shutdown',cleanup);
  }

  showMemory(type){const [name,msg]=MEMORY[type];this.physics.pause();const icon={heart:'♥',star:'★',rose:'🌹',letter:'✉',diamond:'◆'}[type];const shade=this.add.rectangle(640,360,1280,720,0x080510,.76).setScrollFactor(0).setDepth(300).setInteractive();const card=this.add.container(640,410).setScrollFactor(0).setDepth(301).setScale(.72).setAlpha(0);const paper=this.add.rectangle(0,0,690,330,0xfff0dc,.99).setStrokeStyle(9,0xc95884);const inner=this.add.rectangle(0,0,650,292,0,0).setStrokeStyle(3,0xe2b467);const roseL=this.add.text(-300,-130,'🌹',{fontSize:'30px'}).setOrigin(.5);const roseR=this.add.text(300,-130,'🌹',{fontSize:'30px'}).setOrigin(.5);const big=this.add.text(0,-96,icon,{fontFamily:'monospace',fontSize:'58px',color:'#d63e78'}).setOrigin(.5);const text=this.add.text(0,25,`${name}\n\n“${msg}”`,{fontFamily:'monospace',fontSize:'24px',color:'#521f45',align:'center',lineSpacing:8,wordWrap:{width:570}}).setOrigin(.5);const button=this.add.text(0,125,'CONTINUAR',{fontFamily:'monospace',fontSize:'17px',color:'#fff',backgroundColor:'#7b315f',padding:{x:18,y:9}}).setOrigin(.5);card.add([paper,inner,roseL,roseR,big,text,button]);this.tweens.add({targets:card,y:360,scale:1,alpha:1,duration:360,ease:'Back.easeOut'});for(let i=0;i<10;i++)this.time.delayedCall(i*35,()=>this.particleManager.sparkles(640+(Math.random()-.5)*500,300+Math.random()*220,0xff9dca,2));let closing=false;const close=()=>{if(closing)return;closing=true;this.tweens.add({targets:card,y:420,scale:.8,alpha:0,duration:220,onComplete:()=>{shade.destroy();card.destroy();this.physics.resume();}});};this.input.keyboard.once('keydown-ENTER',close);this.input.keyboard.once('keydown-SPACE',close);shade.once('pointerdown',close);}

  fireLove(x,y,dir){y+=18;const s=this.add.image(x,y,'love-shot').setScale(1.05);this.physics.add.existing(s);this.projectiles.add(s);s.body.setSize(36,48);s.body.setAllowGravity(false);s.travelDir=dir;s.travelSpeed=520;s.trailTimer=0;this.audioManager.playSfx('attack');this.particleManager.sparkles(x,y,0xff8ac4,8);this.tweens.add({targets:this.player,x:this.player.x-dir*5,duration:55,yoyo:true});this.time.delayedCall(1200,()=>s.active&&s.destroy());}
  fireChargedLove(x,y,dir){y+=18;const s=this.add.image(x,y,'love-shot').setScale(2.25).setTint(0xffd3ee);this.physics.add.existing(s);this.projectiles.add(s);s.body.setSize(42,50);s.damage=3;s.piercing=true;s.body.setAllowGravity(false);s.travelDir=dir;s.travelSpeed=430;this.audioManager.playSfx('bossHit');this.cameras.main.shake(130,.004);this.particleManager.burst(x,y,0xff58ac,24,220);this.tweens.add({targets:s,scale:2.7,alpha:.82,duration:130,yoyo:true,repeat:-1});this.time.delayedCall(1800,()=>s.active&&s.destroy());}
  meleeAttack(x,y,dir,step){const reach=step===3?88:56,damage=step===3?2:1,duration=step===3?220:150;this.player.playCombatPose(step===1?6:step===2?7:9,duration,dir*(step===3?8:4));const hitbox=this.add.zone(x+dir*(step===3?52:38),y+6,reach,68);this.physics.add.existing(hitbox,true);const touched=new Set();const overlap=this.physics.add.overlap(hitbox,this.enemies,(_,e)=>{if(touched.has(e))return;touched.add(e);for(let i=0;i<damage;i++)e.active&&e.hit();if(e.body)e.setVelocityX(dir*(e.type==='guard'||e.type==='general'?90:190));});const arc=this.add.ellipse(x+dir*42,y+8,reach,step===3?82:54,0xff69ad,.18).setStrokeStyle(4,0xffd4eb,.9).setDepth(24);const spark=this.add.text(x+dir*60,y-4,step===3?'♥':'✦',{fontSize:step===3?'28px':'18px',color:'#fff0fa'}).setOrigin(.5).setDepth(25);this.tweens.add({targets:[arc,spark],scale:1.35,alpha:0,duration,onComplete:()=>{overlap.destroy();hitbox.destroy();arc.destroy();spark.destroy();}});this.cameras.main.shake(45,.002);this.audioManager.playSfx('attack');}
  startAirSlam(x,y){this.player.playCombatPose(5,450,12*this.player.facing);this.particleManager.sparkles(x,y,0xff83be,10);}
  airSlamImpact(x,y){const wave=this.add.ellipse(x,y+35,190,45,0xff4fa4,.22).setStrokeStyle(5,0xffd1e8).setDepth(22);this.tweens.add({targets:wave,scaleX:1.7,alpha:0,duration:260,onComplete:()=>wave.destroy()});this.enemies.getChildren().filter(e=>e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<135).forEach(e=>{e.hit();e.hit();});this.particleManager.burst(x,y+30,0xff75b3,22,190);this.cameras.main.shake(110,.005);}
  useSpecial(x,y){const cards=(gameState.memories||[]).filter(v=>/^card[123]$/.test(v)).length;if(cards<3){this.uiManager.showMessage('LATIDO VERDADERO · Requiere las 3 cartas','#ffd5e8');return false;}const ring=this.add.circle(x,y,35,0xff5cab,.22).setStrokeStyle(8,0xffeff8).setDepth(25);this.tweens.add({targets:ring,scale:7,alpha:0,duration:520,onComplete:()=>ring.destroy()});this.enemies.getChildren().filter(e=>e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<270).forEach(e=>{for(let i=0;i<3;i++)e.active&&e.hit();});this.particleManager.burst(x,y,0xff4fa8,45,350);this.cameras.main.shake(180,.008);this.audioManager.playSfx('victory');return true;}
  addRose(n){ gameState.roses=(gameState.roses||0)+n; this.refreshHud(); }
  refreshHud(){const cards=(gameState.memories||[]).filter(x=>/^card[123]$/.test(x)).length;this.uiManager?.updateHud({health:this.player?.health??gameState.health,roses:gameState.roses,cards,power:gameState.power}); }
  makeCheckpoint(){(this.dataDef.checkpoints||[this.dataDef.checkpoint]).forEach(x=>{const c=this.add.image(x,610,'collectible-heart').setScale(1.5).setTint(0x8feaff).setDepth(18);this.physics.add.existing(c,true);this.physics.add.overlap(this.player,c,()=>{if(gameState.checkpoint?.scene===this.scene.key&&gameState.checkpoint.x===x)return;gameState.checkpoint={scene:this.scene.key,x,y:560};gameState.health=this.player.health;SaveManager.save(gameState);const lines={Level1Scene:['PAOLA','Cada paso me acerca a ti.'],Level2Scene:['PAOLA','Ni las espinas van a detenerme.'],Level3Scene:['MATEO','Sé que estás cerca, amor.']};const [speaker,line]=lines[this.scene.key]||['PAOLA','Debo seguir adelante.'];this.uiManager.showDialogueBubble(speaker,`❤️ RECUERDO GUARDADO · ${line}`,{y:490,duration:2100});this.player.heal(2);this.audioManager.playSfx('checkpoint');});});}
  makeExit(){
    if(this.exitCreated){console.error(`[QA ${this.scene.key}] Se intentó crear más de una salida`);return;}
    this.exitCreated=true;
    const x=this.dataDef.width-125,y=570;this.exitPoint={x,y};
    const group=this.add.container(x,y).setDepth(30);this.exitGroup=group;
    const dais=this.add.rectangle(0,70,150,18,this.dataDef.platform).setStrokeStyle(4,this.dataDef.trim);
    const glow=this.add.ellipse(0,0,112,178,this.dataDef.accent,.18);
    const arch=this.add.graphics();
    if(this.dataDef.theme==='forest'){
      arch.lineStyle(12,0x704876,1);arch.strokeRoundedRect(-48,-72,96,142,42);arch.lineStyle(5,0xff8fc7,1);arch.strokeRoundedRect(-36,-61,72,128,34);arch.fillStyle(0x7d4cd6,.46);arch.fillRoundedRect(-31,-55,62,120,28);
    }else if(this.dataDef.theme==='garden'){
      arch.lineStyle(13,0x496747,1);arch.strokeRoundedRect(-51,-75,102,145,44);arch.lineStyle(5,0xf0c873,1);arch.strokeRoundedRect(-38,-62,76,130,35);arch.fillStyle(0xd3478e,.38);arch.fillRoundedRect(-33,-57,66,122,30);for(let i=0;i<7;i++){arch.fillStyle(i%2?0xffa0c8:0xd83e7e,1);arch.fillCircle(-48+i*16,-54-Math.sin(i*.8)*22,6);}
    }else{
      arch.fillStyle(0x33263f,1);arch.fillRect(-56,-76,112,146);arch.fillStyle(0x5e3970,1);arch.fillTriangle(-62,-76,0,-122,62,-76);arch.lineStyle(6,0xe2a85f,1);arch.strokeRoundedRect(-38,-59,76,128,26);arch.fillStyle(0x9c327f,.46);arch.fillRoundedRect(-32,-53,64,120,22);
    }
    const label=this.add.text(0,-112,this.dataDef.exitLabel,{fontFamily:'monospace',fontSize:'16px',color:'#ffe7af',align:'center',stroke:'#32162e',strokeThickness:4}).setOrigin(.5);
    group.add([glow,arch,dais,label]);
    this.tweens.add({targets:[glow,arch],alpha:{from:.65,to:1},duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.exitPrompt=this.add.text(x,y-145,'E / ↑  CONTINUAR',{fontFamily:'monospace',fontSize:'17px',color:'#fff7cf',backgroundColor:'#481b49',padding:{x:12,y:7},stroke:'#210f28',strokeThickness:2}).setOrigin(.5).setDepth(60).setVisible(false);
    this.exitLockedText=this.add.text(x,y+102,'🔒 CARTA DEL NIVEL NECESARIA\nAlgo importante quedó atrás…',{fontFamily:'monospace',fontSize:'12px',color:'#e6b4cc',align:'center',backgroundColor:'#211328',padding:{x:8,y:5}}).setOrigin(.5).setDepth(31).setVisible(false);
    const tryExit=()=>{if(this.exitNearby&&this.exitAvailable)this.finishLevel();};
    this.input.keyboard.on('keydown-E',tryExit);this.input.keyboard.on('keydown-UP',tryExit);
    this.events.once('shutdown',()=>{this.input.keyboard.off('keydown-E',tryExit);this.input.keyboard.off('keydown-UP',tryExit);});
    this.updateExitState();
  }
  updateExitState(){
    if(!this.exitPoint||!this.player)return;
    const missing=this.dataDef.required.filter(m=>!gameState.memories.includes(m));this.exitAvailable=missing.length===0;
    this.exitGroup.setVisible(true).setAlpha(this.exitAvailable?1:.3);this.exitLockedText.setVisible(!this.exitAvailable&&this.player.x>this.dataDef.width-420);
    this.exitNearby=this.exitAvailable&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.exitPoint.x,this.exitPoint.y)<105;
    this.exitPrompt.setVisible(this.exitNearby&&!this.finishing);
  }
  finishLevel(){if(this.finishing||!this.exitNearby||!this.exitAvailable)return;this.finishing=true;if(this.cardOverlay?.active)this.cardOverlay.destroy();this.cardOverlay=null;this.exitPrompt.setVisible(false);gameState.unlockedLevel=Math.max(gameState.unlockedLevel,this.dataDef.unlock);gameState.currentScene=this.dataDef.next;gameState.health=this.player.health;gameState.checkpoint=null;SaveManager.save(gameState);this.physics.pause();const interlude=this.scene.key==='Level1Scene'?'PECHO PALOMA: “Tu novia sigue avanzando.”\nMATEO: “Te dije que vendría.”\nPECHO PALOMA: “Ya veremos cuánto dura.”\nMATEO: “No la conoces.”\n\nCAPÍTULO II · JARDÍN DE ROSAS':this.scene.key==='Level2Scene'?'PECHO PALOMA: “¿Por qué sigue viniendo?”\nMATEO: “Porque me ama.”\nPECHO PALOMA: “Eso no significa que llegará.”\nMATEO: “Entonces sigue mirando.”\n\nCAPÍTULO III · EL CASTILLO DE PECHO PALOMA':'';if(interlude){this.add.rectangle(640,360,1280,720,0x090512,.87).setScrollFactor(0).setDepth(500);this.add.text(640,360,interlude,{fontFamily:'monospace',fontSize:'25px',color:'#ffe9cf',align:'center',lineSpacing:10}).setOrigin(.5).setScrollFactor(0).setDepth(501);this.time.delayedCall(3100,()=>{this.cameras.main.fadeOut(650,12,6,22);this.time.delayedCall(680,()=>this.scene.start(this.dataDef.next));});}else{this.cameras.main.fadeOut(650,12,6,22);this.time.delayedCall(680,()=>this.scene.start(this.dataDef.next));}}
  makePause(){ this.input.keyboard.on('keydown-ESC',()=>this.togglePause()); }
  togglePause(){ if(this.gameOver)return; this.paused=!this.paused; if(this.paused){this.physics.pause();this.pauseUi=this.add.container(0,0).setScrollFactor(0).setDepth(500);const bg=this.add.rectangle(640,360,520,390,0x180d25,.97).setStrokeStyle(5,0xf3c66b);const title=this.add.text(640,220,'PAUSA',{fontFamily:'monospace',fontSize:'40px',color:'#ffe4a5'}).setOrigin(.5);this.pauseUi.add([bg,title]);[['CONTINUAR',290,()=>this.togglePause()],['REINICIAR CHECKPOINT',350,()=>this.scene.restart()],['CONTROLES',410,()=>this.uiManager.showMessage('A/D mover · SPACE saltar · Z combo · X energía · V escudo · ESC pausa','white',2400)],['MENÚ PRINCIPAL',470,()=>this.scene.start('MenuScene')]].forEach(([t,y,fn])=>{const b=this.add.text(640,y,t,{fontFamily:'monospace',fontSize:'20px',color:'#ffeaf6',backgroundColor:'#472746',padding:{x:18,y:10}}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',fn);this.pauseUi.add(b);});}else{this.pauseUi?.destroy();this.physics.resume();} }
  showGameOver(){ if(this.gameOver)return;this.gameOver=true;this.physics.pause();this.add.rectangle(640,360,1280,720,0x090612,.84).setScrollFactor(0).setDepth(600);this.add.text(640,290,'Todavía no puedo rendirme.',{fontFamily:'monospace',fontSize:'29px',color:'#ffe0ef'}).setOrigin(.5).setScrollFactor(0).setDepth(601);[['REINTENTAR DESDE CHECKPOINT',390,()=>this.scene.restart()],['MENÚ',455,()=>this.scene.start('MenuScene')]].forEach(([t,y,f])=>this.add.text(640,y,t,{fontFamily:'monospace',fontSize:'22px',color:'#fff',backgroundColor:'#6d2d58',padding:{x:20,y:12}}).setOrigin(.5).setScrollFactor(0).setDepth(602).setInteractive().on('pointerdown',f)); }
  makeMobileControls(){ if(!this.sys.game.device.input.touch)return; [['◀',70],['▶',150],['↑',1080],['X',1180]].forEach(([t,x])=>this.add.text(x,640,t,{fontFamily:'monospace',fontSize:'34px',color:'#fff',backgroundColor:'#55294f',padding:10}).setScrollFactor(0).setDepth(250).setInteractive()); }
  update(time,delta){
    if(!this.player||this.paused||this.gameOver)return;this.player.update(time,delta);
    if(!this.puzzleSolved){if(this.scene.key==='Level1Scene'){this.puzzleActive=Math.abs(this.player.x-this.puzzleX)<150;this.puzzlePrompt.setVisible(this.puzzleActive).setText('“Solo quien conoce su corazón puede continuar...”\n¿Qué es lo que más te gusta de Mateo?\nA) Su risa  B) Cómo me cuida  C) Su forma de ser  D) Todo ❤️');}else if(this.scene.key==='Level2Scene'){const near=this.puzzleSymbols?.some(s=>!s.active&&Math.abs(this.player.x-s.x)<90);this.puzzlePrompt.setVisible(!!near).setText('E · ACTIVAR RECUERDO');}else if(Math.abs(this.player.x-this.puzzleX)<170)this.puzzlePrompt.setVisible(true).setText(`RUNAS RECUPERADAS · ${this.runesCollected}/3`);else this.puzzlePrompt.setVisible(false);}else this.puzzlePrompt?.setVisible(false);
    if(this.encounterDialogue&&!this.encounterDialogue.shown&&Math.abs(this.player.x-this.encounterDialogue.target.x)<390)this.startEncounterDialogue();
    if(this.combatArena){if(!this.combatArena.started&&this.player.x>this.combatArena.start+70&&this.player.x<this.combatArena.end)this.startCombatArena();this.updateCombatArena();}
    this.cameras.main.setFollowOffset(Phaser.Math.Linear(this.cameras.main.followOffset.x,-this.player.body.velocity.x*.12,.035),Phaser.Math.Linear(this.cameras.main.followOffset.y,this.player.body.velocity.y<0?28:0,.035));this.updateExitState();this.enemies?.getChildren().forEach(e=>{e.update(delta);if(e.humanoid&&e.safeSpawn&&e.y>e.safeSpawn.y+8){e.setPosition(Phaser.Math.Clamp(e.x,e.minX,e.maxX),e.safeSpawn.y);e.setVelocityY(0);e.body.enable=true;e.body.updateFromGameObject();}e.safetyTimer=(e.safetyTimer||0)-delta;if(e.safetyTimer<=0){e.safetyTimer=500;if(e.y>760&&e.safeSpawn){e.setPosition(e.safeSpawn.x,e.safeSpawn.y);e.setVelocity(0);e.body.enable=true;e.body.updateFromGameObject();}}});
    this.collectibles?.forEach(item=>{if(item.active&&!item.collected&&!item.magnetizing&&Phaser.Math.Distance.Between(this.player.x,this.player.y,item.x,item.y)<=item.pickupRange)this.attemptPickup(item);});
    if(this.generalHud){const alive=this.general?.active&&this.general.health>0;this.generalHud.setVisible(alive&&Math.abs(this.player.x-this.general.x)<620);this.generalFill.displayWidth=380*Math.max(0,this.general.health/this.generalMaxHealth);}
    this.projectiles?.getChildren().forEach(s=>{s.x+=s.travelDir*s.travelSpeed*delta/1000;s.body.updateFromGameObject();const targets=this.enemies.getChildren().filter(e=>e.active&&Math.abs(e.x-s.x)<360&&Math.sign(e.x-s.x)===s.travelDir);if(targets.length){targets.sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));s.y=Phaser.Math.Linear(s.y,targets[0].y,.1);s.body.updateFromGameObject();}s.trailTimer=(s.trailTimer||0)-delta;if(s.active&&s.trailTimer<=0){s.trailTimer=70;const h=this.add.text(s.x,s.y,'♥',{fontSize:'9px',color:'#ff86bd'}).setOrigin(.5).setDepth(10);this.tweens.add({targets:h,x:h.x-s.travelDir*14,alpha:0,scale:.3,duration:260,onComplete:()=>h.destroy()});}});
    this.hazards?.forEach(h=>{h.phase=(h.phase+delta)%2400;h.dangerous=h.phase>850&&h.phase<1550;h.body.enable=h.dangerous;const warning=h.phase>500&&h.phase<850,factor=h.dangerous?1:(warning ? .82 : .58);h.setAlpha(h.dangerous?1:(warning?0.72:0.42)).setScale(h.baseScaleX,h.baseScaleY*factor);h.warning.setAlpha(warning?0.9:(h.dangerous?0.18:0.05)).setScale(warning?1.25:1);});
    if(this.damageDebug){this.damageDebug.clear().fillStyle(0xff0000,.28).lineStyle(2,0xff3030,.95);this.damageDebugLabels.forEach(({source,label})=>{const enabled=source.active&&source.visible&&source.body?.enable;label.setVisible(enabled);if(!enabled)return;this.damageDebug.fillRect(source.body.x,source.body.y,source.body.width,source.body.height).strokeRect(source.body.x,source.body.y,source.body.width,source.body.height);label.setPosition(source.body.center.x,source.body.y-10).setText(source.name||source.type||'DAMAGE');});}
    if(this.player.invulnerable>0){this.player.invulnerable-=delta;this.player.setAlpha(this.player.invulnerable%100<50?.35:1);}else this.player.setAlpha(1);if(this.player.y>760)this.showGameOver();
  }
}
