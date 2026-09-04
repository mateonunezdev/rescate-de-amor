import Player from '../entities/Player.js?v=20260904-final-qa-01';
import Enemy from '../entities/Enemy.js?v=20260904-final-qa-01';
import Collectible from '../entities/Collectible.js?v=20260902-level1-gold-01';
import UIManager from '../ui/UIManager.js?v=20260902-professional-polish-13';
import AudioManager from '../systems/AudioManager.js';
import ParticleManager from '../systems/ParticleManager.js';
import SaveManager from '../systems/SaveManager.js';
import { gameState } from '../config.js';
import { TextureFactory } from '../utils/TextureFactory.js?v=20260830-structural-real-05';
import WorldBuilder from '../world/WorldBuilder.js?v=20260904-final-qa-01';
import { createMateoCageRig } from '../utils/CageRig.js?v=20260903-intro-cage-fix-04';

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
const DEBUG_DAMAGE=false;
const GATE_FOOT_Y={forest:402,garden:298,fortress:385,tower:439,palace:419};

export default class BaseLevelScene extends Phaser.Scene {
  constructor(key, data) { super(key); this.levelData = data; }

  create() {
    const debugQuery=new URLSearchParams(location.search);this.exitCreated=false;this.finishing=false;this.paused=false;this.gameOver=false;this.cardPickupInProgress=false;this.debugDamage=DEBUG_DAMAGE||debugQuery.has('debugDamage')||debugQuery.has('debugHazards');this.debugHazards=this.debugDamage;
    if(this.scene.key==='Level1Scene')this.time.delayedCall(0,()=>this.puzzlePrompt?.setY(300));
    Object.assign(gameState, SaveManager.load());if(this.scene.key==='Level1Scene'){gameState.unlockedPowers=[...new Set([...(gameState.unlockedPowers||[]),'heart'])];if(gameState.power==='none')gameState.power='corazón';}
    this.dataDef = this.levelData;
    this.audioManager = new AudioManager(this); this.audioManager.playMusic(this.dataDef.music);
    this.particleManager = new ParticleManager(this);
    this.makeTextures();this.solids=this.physics.add.staticGroup();this.worldBuilder=new WorldBuilder(this,this.dataDef);this.worldBuilder.build();this.validateRoute();
    const requestedDebugX=Number(debugQuery.get('xDebug')),defaultSpawn=this.dataDef.spawn||{x:100,y:565},debugX=Phaser.Math.Clamp(requestedDebugX,80,this.dataDef.width-80),debugSurface=Number.isFinite(requestedDebugX)?[...this.worldBuilder.surfaces.values()].filter(surface=>debugX>=surface.left&&debugX<=surface.right).sort((a,b)=>a.top-b.top)[0]:null,spawn=Number.isFinite(requestedDebugX)&&requestedDebugX>0?{x:debugX,y:(debugSurface?.top??defaultSpawn.y)-70}:gameState.checkpoint?.scene===this.scene.key?gameState.checkpoint:defaultSpawn;
    this.player = new Player(this, spawn.x, spawn.y);
    this.spawnProtectionUntil=this.time.now+5200;
    this.entrySafeX=spawn.x+300;
    this.entryGraceUntil=this.time.now+7000;
    this.player.canChargeLove=!!gameState.chargedUnlocked||(gameState.memories||[]).includes('card3');
    this.player.maxHealth = gameState.maxHealth || 5; this.player.health = Math.min(gameState.health || 5, this.player.maxHealth);
    if (gameState.power === 'super salto') this.player.jumpVelocity = -570;
    this.physics.add.collider(this.player, this.solids);
    this.makeHazards();
    this.cameras.main.setBounds(0, 0, this.dataDef.width, this.dataDef.height||720).startFollow(this.player, true, 0.09, 0.09).setDeadzone(180, 100).centerOn(spawn.x,spawn.y);
    this.uiManager = new UIManager(this);if(this.scene.key==='Level1Scene'){this.uiManager.container?.setScale(.74);this.uiManager.rosesText?.setAlpha(.58).setScale(.82);this.uiManager.lettersText?.setAlpha(.58).setScale(.82);}this.refreshHud();this.makeNarrativeMoment();if(this.scene.key==='Level1Scene')this.makeLevel1Reactivity();
    this.projectiles = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group();
    this.dataDef.enemies.forEach(e => { const enemy=new Enemy(this,e.x,e.y,e);this.spawnEnemyOnSurface(enemy,e.surface);this.enemies.add(enemy); });
    this.general=this.enemies.getChildren().find(e=>e.miniBoss||e.type==='general');if(this.general){this.generalMaxHealth=this.general.health;this.generalHud=this.add.container(640,128).setScrollFactor(0).setDepth(950).setVisible(false);const gb=this.add.rectangle(0,0,410,46,0x1a1025,.94).setStrokeStyle(3,0xe4b75d);this.generalFill=this.add.rectangle(-190,12,380,10,0xc24983).setOrigin(0,.5);const gt=this.add.text(0,-9,`⚔ ${this.general.displayName||'GENERAL PALOMO'} ⚔`,{fontFamily:'monospace',fontSize:'17px',color:'#ffe6ad'}).setOrigin(.5);this.generalHud.add([gb,this.generalFill,gt]);}
    this.setupEncounterDialogues();
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.overlap(this.player,this.enemies,(p,e)=>p.takeDamage(e.damage,e),(_,e)=>!!(this.time.now>=this.spawnProtectionUntil&&e.active&&e.damageActive&&e.visible&&e.alpha>=.45&&e.body?.enable),this);
    this.physics.add.overlap(this.projectiles,this.enemies,(shot,enemy)=>{shot.hitTargets=shot.hitTargets||new Set();if(shot.hitTargets.has(enemy))return;shot.hitTargets.add(enemy);const frontal=enemy.type==='knight'&&Math.sign(shot.x-enemy.x)===enemy.direction;if(frontal&&!shot.piercing){shot.destroy();enemy.setTint(0xffe39a);enemy.showCombatText?.('BLOQUEO','#ffe39a');this.time.delayedCall(90,()=>{if(!enemy.active)return;enemy.clearTint();if(enemy.roleTint!==0xffffff)enemy.setTint(enemy.roleTint);});return;}const damage=Math.ceil((shot.damage||1)*(gameState.attackBoost||1));if(!shot.piercing)shot.destroy();enemy.hit(damage,(shot.travelDir||1)*150);});
    this.makeCollectibles(); this.makeCheckpoint(); this.makeLevelPuzzle(); this.makeCombatArenas(); this.makeExit(); this.makePause(); this.makeMobileControls();this.validateDamageSources();this.makeQaPanel(debugQuery);
    this.events.on('player-hit', () => { gameState.health = this.player.health; this.refreshHud(); });
    this.events.on('game-over', () => this.showGameOver());
    this.presentationReady=false;this.time.delayedCall(3200,()=>{this.presentationReady=true;});const levelTitle=this.add.text(640,205,`${this.dataDef.title}\n\n${this.dataDef.objective}`,{fontFamily:'monospace',fontSize:'20px',color:'#ffe4ac',align:'center',lineSpacing:7,stroke:'#28152f',strokeThickness:5,backgroundColor:'#160d24',padding:{x:22,y:14}}).setOrigin(.5).setScrollFactor(0).setDepth(1200);this.tweens.add({targets:levelTitle,alpha:0,y:185,duration:600,delay:2600,onComplete:()=>levelTitle.destroy()});
    this.sectionMarkers=(this.dataDef.sections||[]).map(s=>({...s,shown:false}));
    if(this.scene.key==='Level1Scene')this.level1Tutorial={attack:false,flight:false};
  }

  setupEncounterDialogues(){
    const target=this.general||this.enemies.getChildren().find(e=>e.type==='soldier'||e.type==='mage');
    if(!target)return;
    const lines=this.scene.key==='Level1Scene'?[['CAPITÁN PICOTAZO','¡Nadie atraviesa el bosque por orden de la Reina!','right'],['PAOLA','Entonces dile que voy para allá.','left']]:this.scene.key==='Level2Scene'?[['ARCHIMAGO PALOMA','La reina sabía que vendrías.','right'],['PAOLA','Entonces también sabe que no voy a detenerme.','left'],['ARCHIMAGO PALOMA','Eso lo veremos.','right']]:[['GENERAL PALOMO','Has llegado demasiado lejos.','right'],['PAOLA','No lo suficiente.','left'],['GENERAL PALOMO','Tu viaje termina aquí.','right'],['PAOLA','¿Eso lo decides tú?','left']];
    this.encounterDialogue={target,lines,shown:false};
  }

  makeNarrativeMoment(){if(this.scene.key==='Level3Scene'){this.mateoMoment={triggerX:6000,played:false,rig:createMateoCageRig(this,6320,520,{frame:1,mateoScale:.72,cageScale:.58,depth:19,locked:true}),villain:this.add.image(6450,430,'pecho-final',2).setScale(.62).setDepth(20)};}else if(this.scene.key==='Level5Scene'){this.mateoMoment={triggerX:5600,played:false,rig:createMateoCageRig(this,5950,520,{frame:1,mateoScale:.72,cageScale:.58,depth:19,locked:true})};}}

  makeLevel1Reactivity(){this.level1Halo=this.add.image(this.player.x,this.player.y,'collectible-heart').setScale(3.2).setTint(0xffd38a).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(8);this.caveVeil=this.add.rectangle(640,360,1280,720,0x160b2b,0).setScrollFactor(0).setDepth(7);this.guidingLights=[];for(let i=0;i<18;i++){const f=this.add.image(5650+i*28,580-(i%5)*35,'collectible-star').setScale(.2+(i%3)*.07).setTint(i%2?0xffe790:0xff8fc8).setAlpha(.03).setDepth(19);this.guidingLights.push(f);}this.level1Story={tunnelShown:false,caveShown:false,treeShown:false,crystals:0};}

  updateLevel1Reactivity(){if(!this.level1Story)return;const x=this.player.x,inTunnel=x>3000&&x<3750,inCave=x>5200&&x<5650;this.level1Halo.setPosition(this.player.x,this.player.y+5).setAlpha(inCave ? .58 : inTunnel ? .25 : 0);this.caveVeil.setAlpha(Phaser.Math.Linear(this.caveVeil.alpha,inCave ? .38 : 0,.08));if(inTunnel&&!this.level1Story.tunnelShown){this.level1Story.tunnelShown=true;this.uiManager.showMessage('PASADIZO DE LAS RAÍCES','#ffe4a6',1800);}if(inCave&&!this.level1Story.caveShown){this.level1Story.caveShown=true;this.uiManager.showDialogueBubble('PAOLA','Este lugar... late como un corazón.',{width:440,duration:1900,variant:'thought'});}const crystalIndex=Math.min(3,Math.max(0,Math.floor((x-5230)/105)+1));while(inCave&&this.level1Story.crystals<crystalIndex){const crystal=this.worldBuilder.heartCrystals?.[this.level1Story.crystals++];if(crystal){this.tweens.add({targets:crystal,alpha:1,scale:crystal.scale*1.35,duration:420,ease:'Back.easeOut'});this.particleManager.sparkles(crystal.x,crystal.y,0x8fdcff,9);}}if(x>5680&&!this.level1Story.treeShown&&!this.general?.active){this.level1Story.treeShown=true;this.cameras.main.zoomTo(1.08,1300,'Sine.easeInOut');this.tweens.add({targets:this.worldBuilder.memoryTree,alpha:1,duration:1800,ease:'Sine.easeInOut'});this.guidingLights.forEach((f,i)=>this.tweens.add({targets:f,y:f.y-24,x:f.x+12,alpha:.85,duration:800+i*45,yoyo:true,repeat:-1}));const card=this.collectibles?.find(c=>c.type==='card1');if(card)this.tweens.add({targets:card,alpha:1,scale:1.25,duration:1200,ease:'Back.easeOut'});this.uiManager.showDialogueBubble('PAOLA','Las luciérnagas... quieren mostrarme algo.',{width:410,duration:2200,variant:'thought'});this.time.delayedCall(2400,()=>this.cameras.main.zoomTo(1,900,'Sine.easeInOut'));}}

  updateNarrativeMoment(){const m=this.mateoMoment;if(!m||m.played||this.player.x<m.triggerX)return;m.played=true;this.uiManager.showDialogueBubble('PAOLA','¡Mateo!',{x:390,y:420,duration:1300,width:350});this.time.delayedCall(900,()=>this.uiManager.showDialogueBubble('MATEO',this.scene.key==='Level3Scene'?'¡Sabía que vendrías!':'Ya estás cerca. ❤️',{x:850,y:380,tail:'right',duration:1800,width:470}));if(m.villain){this.time.delayedCall(2100,()=>this.uiManager.showDialogueBubble('PECHO PALOMA','Todavía no.',{x:900,y:250,tail:'right',duration:1400,width:390}));this.time.delayedCall(2600,()=>{this.particleManager.burst(m.rig.x,m.rig.y,0xff55b2,30,240);this.tweens.add({targets:[m.rig,m.villain],x:'+=520',y:'-=330',alpha:.15,duration:1700,ease:'Sine.easeIn'});});}}

  spawnEnemyOnSurface(enemy,surfaceId){if(!enemy.humanoid)return;const surfaces=[...this.worldBuilder.surfaces.values()],surface=this.worldBuilder.getSurface(surfaceId)||surfaces.filter(s=>enemy.x>=s.left&&enemy.x<=s.right).sort((a,b)=>Math.abs(a.top-enemy.y)-Math.abs(b.top-enemy.y))[0];if(!surface){console.error(`[QA ${this.scene.key}] Enemigo sin superficie declarada`,enemy.type,surfaceId);enemy.disableBody(true,true);return;}const x=Phaser.Math.Clamp(enemy.x,surface.left+28,surface.right-28),connected=surface.kind==='ground'?surfaces.filter(s=>s.kind==='ground'&&Math.abs(s.top-surface.top)<=36&&s.right>=x-720&&s.left<=x+720):[surface],surfaceMin=Math.max(28,Math.min(...connected.map(s=>s.left))+28,x-700),surfaceMax=Math.min(this.dataDef.width-28,Math.max(...connected.map(s=>s.right))-28,x+700);enemy.setPosition(x,surface.top-44);enemy.body.updateFromGameObject();enemy.y+=surface.top-enemy.body.bottom;enemy.body.updateFromGameObject();enemy.safeSpawn={x:enemy.x,y:enemy.y};enemy.spawnX=enemy.x;enemy.minX=surfaceMin;enemy.maxX=surfaceMax;enemy.patrolMinX=Phaser.Math.Clamp(enemy.requestedMinX??x-190,surfaceMin,surfaceMax);enemy.patrolMaxX=Phaser.Math.Clamp(enemy.requestedMaxX??x+190,surfaceMin,surfaceMax);if(enemy.patrolMinX>enemy.patrolMaxX)[enemy.patrolMinX,enemy.patrolMaxX]=[enemy.patrolMaxX,enemy.patrolMinX];enemy.body.setAllowGravity(true);}

  keepEnemyGrounded(enemy){
    if(!enemy.active||!enemy.visible||!enemy.humanoid||!enemy.safeSpawn||!enemy.body)return;
    const surface=[...this.worldBuilder.surfaces.values()]
      .filter(candidate=>enemy.x>=candidate.left+2&&enemy.x<=candidate.right-2)
      .sort((a,b)=>Math.abs(a.top-enemy.body.bottom)-Math.abs(b.top-enemy.body.bottom))[0];
    if(surface&&enemy.body.velocity.y>=0&&enemy.body.bottom>surface.top+10){
      enemy.y-=enemy.body.bottom-surface.top;
      enemy.setVelocityY(0);enemy.body.enable=true;enemy.body.updateFromGameObject();
      return;
    }
    if(!surface&&enemy.y>enemy.safeSpawn.y+100){
      enemy.setPosition(enemy.safeSpawn.x,enemy.safeSpawn.y);enemy.setVelocity(0);
      enemy.body.enable=true;enemy.body.updateFromGameObject();
    }
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

  makeHazards(){const defs=this.dataDef.hazards||[],themeKeys={forest:'hazard-root-thorns',garden:'hazard-thorns',fortress:'hazard-blade',tower:'hazard-magic',palace:'hazard-magic'},frameKeys={8:'hazard-root-thorns',9:'hazard-flame',10:'hazard-blade',11:'hazard-magic'};this.hazards=[];defs.forEach((def,i)=>{const surfaces=[...this.worldBuilder.surfaces.values()],surface=def.surface?this.worldBuilder.getSurface(def.surface):surfaces.filter(s=>def.x>=s.left-12&&def.x<=s.right+12).sort((a,b)=>Math.abs(a.top-def.y)-Math.abs(b.top-def.y))[0]||surfaces.sort((a,b)=>Math.min(Math.abs(def.x-a.left),Math.abs(def.x-a.right))-Math.min(Math.abs(def.x-b.left),Math.abs(def.x-b.right)))[0],key=def.texture||themeKeys[this.dataDef.theme]||frameKeys[def.frame]||'hazard-thorns',x=surface?Phaser.Math.Clamp(def.x,surface.left+24,surface.right-24):def.x,h=this.add.image(x,def.y,key).setName(`${this.dataDef.theme}:${key}`).setDepth(12).setScale(def.frame===10?1.05:1.2);if(surface)h.setY(surface.top-h.displayHeight*.28);h.baseScaleX=h.scaleX;h.baseScaleY=h.scaleY;h.supportSurface=surface?.id;this.physics.add.existing(h,true);h.body.setSize(Math.min(58,h.displayWidth*.72),Math.min(30,h.displayHeight*.42)).setOffset((h.width-Math.min(58,h.displayWidth*.72))/2,h.height-Math.min(30,h.displayHeight*.42));h.phase=i*430;h.warning=this.add.ellipse(h.x,surface?.top??h.y+14,74,20,this.dataDef.accent,.08).setStrokeStyle(2,this.dataDef.accent,.65).setDepth(11);this.hazards.push(h);this.physics.add.overlap(this.player,h,()=>{if(h.dangerous)this.player.takeDamage(1,h);});});}

  makePuzzleDoor(x,label){const floor=[...this.worldBuilder.surfaces.values()].filter(s=>x>=s.left&&x<=s.right).sort((a,b)=>b.top-a.top)[0],door=this.worldBuilder.createDoor({id:'puzzle-door',kind:'puzzle',x,y:floor?.top??648,width:118,height:238});door.rune=this.add.text(x,(floor?.top??648)-170,this.dataDef.theme==='forest'?'♥':this.dataDef.theme==='garden'?'🌹':this.dataDef.theme==='tower'?'♥':'ᚱ',{fontFamily:'monospace',fontSize:'28px',color:'#ff91c4'}).setOrigin(.5).setDepth(29);door.nameText=this.add.text(x,(floor?.top??648)-18,label,{fontFamily:'monospace',fontSize:'12px',color:'#ffe8c2',align:'center',backgroundColor:'#211328',padding:{x:6,y:3}}).setOrigin(.5).setDepth(29);return door;}

  openPuzzleDoor(message){if(this.puzzleSolved)return;this.puzzleSolved=true;const door=this.puzzleDoor;this.worldBuilder.openDoor(door);if(door?.rune)this.tweens.add({targets:[door.rune,door.nameText],alpha:0,y:'-=130',duration:850});this.audioManager.playSfx('checkpoint');this.particleManager.burst(door.x,door.y-100,0xff73b6,34,260);this.uiManager.showDialogueBubble('PAOLA',message,{x:640,y:430,duration:1900,width:590});}

  makeCombatArenas(){
    const configs=this.dataDef.arenas||(this.dataDef.arena?[this.dataDef.arena]:[]);
    if(!configs.length)return;

    const makeGate=(x,id)=>{
      const floor=[...this.worldBuilder.surfaces.values()]
        .filter(s=>x>=s.left&&x<=s.right).sort((a,b)=>b.top-a.top)[0],
        gate=this.worldBuilder.createDoor({id,kind:'arena',x,y:floor?.top??648,width:76,height:210});
      gate.visualParts=[gate.frame,gate.leaf||gate.art].filter(Boolean);
      gate.visualParts.forEach(part=>part.setVisible(false));
      gate.body.body.enable=false;
      return gate;
    };

    this.combatArenas=configs.map((cfg,i)=>({
      ...cfg,started:false,cleared:false,
      left:makeGate(cfg.start,`arena-${i}-left`),
      right:makeGate(cfg.end,`arena-${i}-right`)
    }));

    this.arenaHud=this.add.text(this.scale.width-34,78,'',{
      fontFamily:'monospace',fontSize:'13px',color:'#fff1c1',
      backgroundColor:'#24152ce8',padding:{x:9,y:5},
      stroke:'#1b0919',strokeThickness:2
    }).setOrigin(1,.5).setScrollFactor(0).setDepth(1150).setVisible(false);
  }

  startCombatArena(a){
    if(!a||a.started)return;
    a.started=true;
    [a.left,a.right].forEach(g=>{
      g.visualParts.forEach(part=>part.setVisible(true).setAlpha(.92));
      g.body.body.enable=true;g.body.body.updateFromGameObject();
      g.projectileCollider=this.physics.add.collider(this.projectiles,g.body,(first,second)=>{
        const shot=first===g.body?second:first;
        if(shot&&shot!==g.body)shot.destroy();
      });
    });
    this.cameras.main.shake(100,.002);
    this.uiManager.showMessage(a.message||'EL CAMINO SE HA CERRADO','#ffe2a0',1350);
    this.updateCombatArena(a);
  }

  updateCombatArena(a){
    if(!a?.started||a.cleared)return;
    const remaining=this.enemies.getChildren().filter(e=>e.active&&e.x>a.start&&e.x<a.end);
    this.arenaHud.setVisible(true).setText(`⚔ GUARDIANES · ${remaining.length}`);
    if(remaining.length)return;

    a.cleared=true;
    this.arenaHud.setText('✦ CAMINO LIBRE').setColor('#bfffc9');
    [a.left,a.right].forEach((g,i)=>{
      g.body.body.enable=false;
      this.tweens.add({
        targets:g.visualParts,alpha:0,y:'-=45',duration:650,delay:i*90,
        onComplete:()=>g.visualParts.forEach(part=>part.setVisible(false))
      });
    });
    this.time.delayedCall(1050,()=>this.arenaHud.setVisible(false).setColor('#fff1c1'));
    this.audioManager.playSfx('checkpoint');
  }

  makeLevelPuzzle(){this.puzzleSolved=false;this.puzzlePrompt=this.scene.key==='Level1Scene'?this.makeMemoryPuzzlePanel():this.add.text(640,590,'',{fontFamily:'monospace',fontSize:'16px',color:'#fff2d6',backgroundColor:'#29162d',padding:{x:14,y:8},align:'center'}).setOrigin(.5).setScrollFactor(0).setDepth(1100).setVisible(false);
    if(this.scene.key==='Level1Scene'){this.puzzleX=this.dataDef.puzzleX??1480;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PUERTA DEL\nRECUERDO');this.input.keyboard.on('keydown',event=>this.answerMemoryPuzzle(event.key));}
    else if(this.scene.key==='Level2Scene'){this.puzzleX=1910;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PÉRGOLA DE\nLOS RECUERDOS');this.puzzleSymbols=[{x:1280,key:'ROSA',texture:'collectible-rose'},{x:1500,key:'CORAZÓN',texture:'collectible-heart'},{x:1720,key:'ESTRELLA',texture:'collectible-star'}].map(s=>{const surface=[...this.worldBuilder.surfaces.values()].filter(v=>s.x>=v.left&&s.x<=v.right).sort((a,b)=>a.top-b.top)[0],y=(surface?.top??648)-42,c=this.add.container(s.x,y).setDepth(20),pedestal=this.add.image(0,21,'world-support-garden').setDisplaySize(34,42),icon=this.add.image(0,-13,s.texture).setScale(.78).setTint(0xff80b7);c.add([pedestal,icon]);return {...s,y,node:c,icon,active:false};});this.input.keyboard.on('keydown-E',()=>this.activateGardenSymbol());}
    else if(this.scene.key==='Level3Scene'){this.puzzleX=this.dataDef.puzzleX??3820;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,'PUERTA DE\nLAS TRES RUNAS');this.runesCollected=0;this.runeSlots=[-28,0,28].map(dx=>this.add.text(this.puzzleX+dx,430,'◇',{fontFamily:'monospace',fontSize:'24px',color:'#b66caa'}).setOrigin(.5).setDepth(30));}
    else{const hearts=this.dataDef.puzzleType==='hearts';this.puzzleX=this.dataDef.puzzleX;this.puzzleDoor=this.makePuzzleDoor(this.puzzleX,hearts?'PUERTA DEL\nFARO':'PASADIZO\nDE LA BIBLIOTECA');const defs=hearts?[{x:980,y:1130},{x:2070,y:730},{x:3000,y:430}]:[{x:900,y:575},{x:2250,y:575},{x:2500,y:575}];this.puzzleSymbols=defs.map(def=>{const node=this.add.image(def.x,def.y,hearts?'collectible-heart':'collectible-letter').setScale(hearts?1.05:.9).setTint(hearts?0xff72b1:0xf3c66f).setDepth(22);this.tweens.add({targets:node,scale:node.scale*1.12,alpha:.72,duration:700,yoyo:true,repeat:-1});return{...def,node,active:false};});this.input.keyboard.on('keydown-E',()=>this.activateWorldSymbol());}
  }

  makeMemoryPuzzlePanel(){const layer=this.add.container(640,300).setScrollFactor(0).setDepth(1100).setVisible(false),g=this.add.graphics();g.fillStyle(0x120a18,.92).fillRect(-270,-112,540,224).fillStyle(0xe2b76e,1).fillRect(-262,-104,524,4).fillRect(-262,100,524,4).fillStyle(0x30182d,1).fillRect(-262,-96,524,188);const title=this.add.text(0,-78,'🌹 PREGUNTA DEL RECUERDO 🌹',{fontFamily:'monospace',fontSize:'16px',color:'#ffe4a7'}).setOrigin(.5),question=this.add.text(0,-43,'¿Qué es lo que más te gusta de Mateo?',{fontFamily:'monospace',fontSize:'16px',color:'#fff1df'}).setOrigin(.5);const defs=[['1','Su risa'],['2','Cómo me cuida'],['3','Su forma de ser'],['4','Todo ❤️']];const options=defs.map(([key,label],i)=>{const col=i%2,row=Math.floor(i/2);return this.add.text(col?-2:-246,-2+row*50,`${key}) ${label}`,{fontFamily:'monospace',fontSize:'15px',color:key==='4'?'#ffd1e3':'#efe1d4',backgroundColor:'#211225',padding:{x:8,y:7}}).setInteractive({useHandCursor:true}).on('pointerover',function(){this.setText(`♥ ${key}) ${label}`).setColor('#fff0a5');}).on('pointerout',function(){this.setText(`${key}) ${label}`).setColor(key==='4'?'#ffd1e3':'#efe1d4');}).on('pointerdown',()=>this.answerMemoryPuzzle(key));});layer.add([g,title,question,...options]);layer.setText=()=>layer;return layer;}

  answerMemoryPuzzle(answer){if(!this.puzzleActive||this.puzzleSolved||!['1','2','3','4'].includes(answer))return;if(answer==='4'){this.puzzleActive=false;this.puzzlePrompt.setVisible(false);this.openPuzzleDoor('Todo ❤️. Siempre fue todo.');}else this.uiManager.showDialogueBubble('PUERTA DEL RECUERDO','También cuenta... pero ambos sabemos la respuesta 😏',{x:640,y:500,duration:1700,width:470,variant:'thought'});}

  activateGardenSymbol(){if(this.puzzleSolved)return;const symbol=this.puzzleSymbols?.find(s=>!s.active&&Math.abs(this.player.x-s.x)<80);if(!symbol)return;symbol.active=true;symbol.icon.setTint(0xfff0a8);this.particleManager.burst(symbol.x,symbol.y,0xff7db6,16,150);const count=this.puzzleSymbols.filter(s=>s.active).length;this.uiManager.showDialogueBubble('JARDÍN',count===3?'Los recuerdos correctos harán florecer el camino.':'Un recuerdo florece...',{x:640,y:420,duration:1300,width:570});if(count===3){this.openPuzzleDoor('Rosa, corazón y estrella. El camino florece.');const initials=this.add.text(1910,410,'P + M ❤️',{fontFamily:'monospace',fontSize:'28px',color:'#fff0b8',stroke:'#6b2453',strokeThickness:6}).setOrigin(.5).setDepth(28).setAlpha(0);this.tweens.add({targets:initials,alpha:1,y:370,duration:900,ease:'Back.easeOut'});for(let i=0;i<24;i++){const bloom=this.add.image(1740+i*15,610-(i%3)*8,'collectible-rose').setScale(.45).setDepth(17).setAlpha(0);this.tweens.add({targets:bloom,alpha:1,scale:.8,duration:500,delay:i*45,ease:'Back.easeOut'});}}}

  activateWorldSymbol(){if(this.puzzleSolved)return;const symbol=this.puzzleSymbols?.find(s=>!s.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,s.x,s.y)<105);if(!symbol)return;symbol.active=true;symbol.node.setTint(0xfff2a6).setAlpha(1);this.tweens.killTweensOf(symbol.node);this.particleManager.burst(symbol.x,symbol.y,0xff65b0,20,180);const count=this.puzzleSymbols.filter(s=>s.active).length;if(count===3){if(this.dataDef.puzzleType==='hearts'){this.openPuzzleDoor('Los tres corazones despiertan el Faro del Amor.');this.cameras.main.shake(260,.008);for(let i=0;i<16;i++){const ray=this.add.image(3180,125+i*72,'collectible-star').setScale(1.1).setTint(0xff72c7).setDepth(6).setAlpha(.18);this.tweens.add({targets:ray,alpha:.95,scale:2,duration:650,delay:i*30,yoyo:true,repeat:2,onComplete:()=>ray.destroy()});}this.uiManager.showDialogueBubble('MATEO','Paola...',{x:880,y:350,tail:'right',duration:1800,width:300});}else this.openPuzzleDoor('Los tres tomos revelan el pasadizo secreto.');}else this.uiManager.showMessage(`${this.dataDef.puzzleType==='hearts'?'CORAZONES':'TOMOS'} · ${count}/3`,'#ffe3a5',1100);}

  onRuneGuardianDefeated(enemy){if(this.scene.key!=='Level3Scene'||!enemy.runeGuardian||enemy.runeAwarded)return;enemy.runeAwarded=true;this.runesCollected=Math.min(3,(this.runesCollected||0)+1);const slot=this.runeSlots?.[this.runesCollected-1];slot?.setText('ᚱ').setColor('#ffd078');this.particleManager.burst(enemy.x,enemy.y,0xd87bff,22,200);this.uiManager.showDialogueBubble('PAOLA',`Runa recuperada · ${this.runesCollected}/3`,{x:640,y:430,duration:1400,width:460});if(this.runesCollected===3)this.openPuzzleDoor('Las tres runas responden. La puerta está abierta.');}

  validateDamageSources(){const bad=[];(this.hazards||[]).forEach((h,i)=>{if(!h.visible||!h.texture?.key||!h.warning?.visible)bad.push(`hazard-${i}`);});this.enemies?.getChildren().forEach((e,i)=>{if(e.damage>0&&(!e.visible||!e.texture?.key))bad.push(`enemy-${i}`);});if(bad.length)console.error(`[QA ${this.scene.key}] Damage hitboxes sin representación visible`,bad);else console.info(`[QA ${this.scene.key}] CERO damage hitboxes invisibles`);if(this.debugHazards){this.damageDebug=this.add.graphics().setDepth(1200);this.damageDebugLabels=[...(this.hazards||[]),...this.enemies.getChildren()].map(o=>({source:o,label:this.add.text(o.x,o.y-45,o.name||o.type||'DAMAGE',{fontFamily:'monospace',fontSize:'10px',color:'#ffffff',backgroundColor:'#a00000',padding:{x:3,y:2}}).setOrigin(.5).setDepth(1201)}));}}

  makeQaPanel(query){
    if(!query.has('qaPanel'))return;
    this.qaPanel=this.add.text(this.scale.width-18,18,'',{
      fontFamily:'monospace',fontSize:'11px',color:'#dff8ff',align:'right',
      backgroundColor:'#08131ddd',padding:{x:8,y:6},stroke:'#062738',strokeThickness:2,
    }).setOrigin(1,0).setScrollFactor(0).setDepth(1400);
    this.updateQaPanel();
  }

  updateQaPanel(){
    if(!this.qaPanel||!this.player?.body)return;
    const active=this.enemies?.getChildren().filter(enemy=>enemy.active&&enemy.visible)||[];
    const engaged=active.filter(enemy=>enemy.aggroUntil>0||['CHASE','TELEGRAPH','ATTACK'].includes(enemy.state)).length;
    const nearest=[...active].sort((a,b)=>Math.abs(a.x-this.player.x)-Math.abs(b.x-this.player.x))[0];
    const surfaces=[...this.worldBuilder.surfaces.values()].filter(surface=>this.player.x>=surface.left&&this.player.x<=surface.right);
    const surface=surfaces.sort((a,b)=>Math.abs(a.top-this.player.body.bottom)-Math.abs(b.top-this.player.body.bottom))[0];
    this.qaPanel.setText(`${this.scene.key} · QA\nX ${Math.round(this.player.x)}  Y ${Math.round(this.player.y)}\nSUELO ${surface?.id||'NINGUNO'}\nENEMIGOS ${active.length} · ACTIVOS ${engaged}${nearest?`\n${nearest.type.toUpperCase()} · HP ${nearest.health}/${nearest.maxHealth} · ${nearest.state}`:''}\nSALIDA ${this.exitAvailable?'LISTA':'BLOQUEADA'}`);
  }

  validateRoute(){const gravity=900,jump=450,run=350,maxRise=jump*jump/(2*gravity),route=(this.dataDef.route||[]).map(id=>this.dataDef.surfaces.find(s=>s.id===id)).filter(Boolean).map(s=>({x:s.x??((s.left+s.right)/2),y:s.top,w:s.width})),report=[];for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],verticalGap=Math.max(0,a.y-b.y),horizontalGap=Math.max(0,Math.abs(b.x-a.x)-(a.w+b.w)/2),disc=jump*jump-2*gravity*verticalGap,flight=disc>=0?(jump+Math.sqrt(disc))/gravity:0,maxHorizontal=run*flight;report.push({jump:i,verticalGap,horizontalGap,maxHorizontal:Math.round(maxHorizontal),valid:verticalGap<=maxRise-8&&horizontalGap<=maxHorizontal*.88});}const invalid=report.filter(x=>!x.valid);if(invalid.length)console.error(`[QA ${this.scene.key}] Saltos fuera de rango`,invalid);else console.info(`[QA ${this.scene.key}] Ruta nueva validada: ${report.length} saltos`);}

  makeCollectibles() {
    this.collectibles=[];
    this.dataDef.collectibles.forEach(c=>{const persistentId=c.memoryId||c.type;if(c.memory&&gameState.memories.includes(persistentId))return;const item=new Collectible(this,c.x,c.y,c.type);item.isMemory=!!c.memory;item.memoryId=persistentId;item.collectibleData=c;if(this.scene.key==='Level1Scene'&&c.type==='card1')item.setAlpha(.12);this.collectibles.push(item);this.physics.add.overlap(this.player,item,()=>this.attemptPickup(item));});
  }

  attemptPickup(item){if(!item?.active||item.collected||item.magnetizing)return;const guardian=this.enemies.getChildren().find(e=>e.active&&e.miniBoss&&e.health>0);if(item.type.startsWith('card')&&guardian){if(!this.guardMessageAt||this.time.now-this.guardMessageAt>1100){this.guardMessageAt=this.time.now;this.uiManager.showMessage(`${guardian.displayName||'GUARDIÁN'} · Derrótalo para recuperar la carta`,'#ffe0ef',1000);}return;}item.magnetTo(this.player,()=>item.active&&this.collect(item));}

  collect(item) {
    if(item.collected||(item.type.startsWith('card')&&this.cardPickupInProgress))return; const type=item.type;if(type.startsWith('card'))this.cardPickupInProgress=true;item.collect();
    if(item.isMemory){ SaveManager.addUnique('memories',item.memoryId||type); if(type==='heart'){ gameState.maxHealth=Math.max(6,gameState.maxHealth); this.player.maxHealth=gameState.maxHealth; this.player.heal(2); } if(type==='rose')this.player.heal(2); if(type==='diamond'){this.player.jumpVelocity=-570; gameState.power='super salto';}if(type==='card1'){gameState.maxHealth=Math.max(6,gameState.maxHealth);this.player.maxHealth=gameState.maxHealth;this.player.heal(3);}if(type==='card2')gameState.attackBoost=1.25;if(type==='card3'){gameState.chargedUnlocked=true;this.player.canChargeLove=true;}
      SaveManager.addUnique('achievements',type.startsWith('card')?`Carta ${type.slice(-1)} conseguida`:type==='heart'?'Primer recuerdo':type==='diamond'?'Más alto que mis sueños':'Recuerdo encontrado');
    } else this.addRose(1);if(this.scene.key==='Level1Scene'&&type==='rose'){for(let i=0;i<7;i++){const bloom=this.add.image(item.x-35+i*12,item.y+35,'collectible-rose').setScale(.18).setDepth(16);this.tweens.add({targets:bloom,scale:.48,y:bloom.y-18,duration:420+i*35,ease:'Back.easeOut'});}}if(this.scene.key==='Level1Scene'&&type==='card1'){this.cameras.main.flash(450,255,140,190,false);this.worldBuilder.memoryTree?.setTint(0xffd5dd);this.guidingLights?.forEach(f=>f.setAlpha(1));}this.refreshHud(); SaveManager.save(gameState);type.startsWith('card')?this.showCard(type):item.isMemory&&this.showMemory(type);
  }

  showCard(type){
    const [name,msg]=MEMORY[type];
    this.physics.pause();this.paused=true;this.uiManager.container.setVisible(false);this.player.setVelocity(0);
    const layer=this.add.container(0,0).setScrollFactor(0).setDepth(1300);this.cardOverlay=layer;
    const shade=this.add.rectangle(640,360,1280,720,0x17091f,.75).setInteractive({useHandCursor:true});
    const glow=this.add.ellipse(640,350,700,390,0xff5fae,.12);
    const paper=this.add.rectangle(640,345,620,300,0xffefd5,.99).setStrokeStyle(8,0xd45586);
    const title=this.add.text(640,245,'💌  CARTA ENCONTRADA  ❤️',{fontFamily:'monospace',fontSize:'28px',color:'#72264f',fontStyle:'bold'}).setOrigin(.5);
    const line=this.add.text(640,355,`${name}\n\n“${msg}”${type==='card1'?'\n\nNo te rindas, amor.':''}`,{fontFamily:'monospace',fontSize:'21px',color:'#51203e',align:'center',lineSpacing:8,wordWrap:{width:540}}).setOrigin(.5);
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

  showMemory(type){const [name,msg]=MEMORY[type];this.interactionLocked=true;this.physics.pause();this.player.setVelocity(0);this.audioManager?.duck?.(.45);const shade=this.add.rectangle(640,360,1280,720,0x080510,.84).setScrollFactor(0).setDepth(1300).setInteractive({useHandCursor:true}),card=this.add.container(640,360).setScrollFactor(0).setDepth(1301).setScale(.8).setAlpha(0),paper=this.add.rectangle(0,0,700,390,0x24152f,.98).setStrokeStyle(7,0xe6b967),paola=this.add.image(-105,-35,'paola-final',0).setScale(1.05),mateo=this.add.image(105,-35,'mateo-final',0).setScale(1.05).setFlipX(true),heart=this.add.text(0,-50,'♥',{fontFamily:'monospace',fontSize:'38px',color:'#ff86b9'}).setOrigin(.5),title=this.add.text(0,-155,'RECUERDO RECUPERADO ❤️',{fontFamily:'monospace',fontSize:'23px',color:'#ffe7ad'}).setOrigin(.5),text=this.add.text(0,92,`${name} · “${msg}”`,{fontFamily:'monospace',fontSize:'19px',color:'#fff0e5',align:'center',wordWrap:{width:590}}).setOrigin(.5),button=this.add.text(0,155,'CONTINUAR',{fontFamily:'monospace',fontSize:'17px',color:'#fff',backgroundColor:'#7b315f',padding:{x:20,y:9}}).setOrigin(.5).setInteractive({useHandCursor:true});card.add([paper,paola,mateo,heart,title,text,button]);this.tweens.add({targets:card,scale:1,alpha:1,duration:360,ease:'Back.easeOut'});this.tweens.add({targets:heart,scale:1.2,alpha:.6,duration:600,yoyo:true,repeat:-1});for(let i=0;i<10;i++)this.time.delayedCall(i*45,()=>this.particleManager.sparkles(640+(Math.random()-.5)*420,260+Math.random()*210,0xff9dca,2));let closing=false;const close=()=>{if(closing)return;closing=true;this.tweens.add({targets:[card,shade],alpha:0,duration:240,onComplete:()=>{shade.destroy();card.destroy();this.interactionLocked=false;this.physics.resume();this.audioManager?.duck?.(1);}});};this.input.keyboard.once('keydown-ENTER',close);this.input.keyboard.once('keydown-SPACE',close);button.once('pointerdown',close);shade.once('pointerdown',close);}

  fireLove(x,y,dir){y+=18;const s=this.add.image(x,y,'love-shot').setScale(1.05);this.physics.add.existing(s);this.projectiles.add(s);s.body.setSize(36,48);s.body.setAllowGravity(false);s.travelDir=dir;s.travelSpeed=520;s.trailTimer=0;this.audioManager.playSfx('attack');this.particleManager.sparkles(x,y,0xff8ac4,8);this.tweens.add({targets:this.player,x:this.player.x-dir*5,duration:55,yoyo:true});this.time.delayedCall(1200,()=>s.active&&s.destroy());}
  fireChargedLove(x,y,dir){y+=18;const s=this.add.image(x,y,'love-shot').setScale(2.25).setTint(0xffd3ee);this.physics.add.existing(s);this.projectiles.add(s);s.body.setSize(42,50);s.damage=3;s.piercing=true;s.body.setAllowGravity(false);s.travelDir=dir;s.travelSpeed=430;this.audioManager.playSfx('bossHit');this.cameras.main.shake(130,.004);this.particleManager.burst(x,y,0xff58ac,24,220);this.tweens.add({targets:s,scale:2.7,alpha:.82,duration:130,yoyo:true,repeat:-1});this.time.delayedCall(1800,()=>s.active&&s.destroy());}
  meleeAttack(x,y,dir,step){const reach=step===3?88:60,damage=step===3?2:1,duration=step===3?230:165;this.player.playCombatPose(step===1?7:step===2?8:9,duration,dir*(step===3?8:4));const arc=this.add.ellipse(x+dir*42,y+8,reach,step===3?82:58,0xff69ad,.18).setStrokeStyle(4,0xffd4eb,.9).setDepth(24),spark=this.add.text(x+dir*60,y-4,step===3?'♥':'✦',{fontSize:step===3?'28px':'18px',color:'#fff0fa'}).setOrigin(.5).setDepth(25);this.time.delayedCall(35,()=>{const hitbox=this.add.zone(x+dir*(step===3?52:40),y+6,reach,68);this.physics.add.existing(hitbox,true);const touched=new Set(),overlap=this.physics.add.overlap(hitbox,this.enemies,(_,e)=>{if(touched.has(e))return;touched.add(e);e.hit(damage,dir*(step===3?240:170));this.combatHitstop(step===3?65:48);if(step===3)this.cameras.main.shake(70,.0035);});this.time.delayedCall(step===3?105:80,()=>{overlap.destroy();hitbox.destroy();});});this.tweens.add({targets:[arc,spark],scale:1.35,alpha:0,duration,onComplete:()=>{arc.destroy();spark.destroy();}});this.audioManager.playSfx('attack');}
  combatHitstop(duration){if(this.hitstopActive)return;this.hitstopActive=true;this.physics.pause();this.time.delayedCall(duration,()=>{this.hitstopActive=false;if(!this.paused&&!this.interactionLocked&&!this.gameOver)this.physics.resume();});}
  startAirSlam(x,y){this.player.playCombatPose(4,450,12*this.player.facing);this.particleManager.sparkles(x,y,0xff83be,10);}
  airSlamImpact(x,y){const wave=this.add.ellipse(x,y+35,190,45,0xff4fa4,.22).setStrokeStyle(5,0xffd1e8).setDepth(22);this.tweens.add({targets:wave,scaleX:1.7,alpha:0,duration:260,onComplete:()=>wave.destroy()});this.enemies.getChildren().filter(e=>e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<135).forEach(e=>e.hit(2,(e.x-x)*1.3));this.particleManager.burst(x,y+30,0xff75b3,22,190);this.cameras.main.shake(110,.005);}
  useSpecial(x,y){const cards=(gameState.memories||[]).filter(v=>/^card[123]$/.test(v)).length;if(cards<3){this.uiManager.showMessage('LATIDO VERDADERO · Requiere las 3 cartas','#ffd5e8');return false;}const ring=this.add.circle(x,y,35,0xff5cab,.22).setStrokeStyle(8,0xffeff8).setDepth(25);this.tweens.add({targets:ring,scale:7,alpha:0,duration:520,onComplete:()=>ring.destroy()});this.enemies.getChildren().filter(e=>e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<270).forEach(e=>{for(let i=0;i<3;i++)e.active&&e.hit();});this.particleManager.burst(x,y,0xff4fa8,45,350);this.cameras.main.shake(180,.008);this.audioManager.playSfx('victory');return true;}
  addRose(n){ gameState.roses=(gameState.roses||0)+n; this.refreshHud(); }
  refreshHud(){const cards=(gameState.memories||[]).filter(x=>/^card[123]$/.test(x)).length;this.uiManager?.updateHud({health:this.player?.health??gameState.health,roses:gameState.roses,cards,power:gameState.power}); }
  makeCheckpoint(){(this.dataDef.checkpoints||[this.dataDef.checkpoint]).filter(Number.isFinite).forEach(x=>{const surface=[...this.worldBuilder.surfaces.values()].filter(s=>x>=s.left&&x<=s.right).sort((a,b)=>Math.abs(a.top-this.player.y)-Math.abs(b.top-this.player.y))[0],y=(surface?.top??648)-38,c=this.add.image(x,y,'collectible-heart').setScale(1.5).setTint(0x8feaff).setDepth(18);this.physics.add.existing(c,true);this.physics.add.overlap(this.player,c,()=>{if(gameState.checkpoint?.scene===this.scene.key&&gameState.checkpoint.x===x)return;gameState.checkpoint={scene:this.scene.key,x,y:(surface?.top??648)-80};gameState.health=this.player.health;SaveManager.save(gameState);const lines={Level1Scene:['PAOLA','Cada paso me acerca a ti.'],Level2Scene:['PAOLA','Ni las espinas van a detenerme.'],Level3Scene:['MATEO','Sé que estás cerca, amor.']};const [speaker,line]=lines[this.scene.key]||['PAOLA','Debo seguir adelante.'];this.uiManager.showDialogueBubble(speaker,`❤️ RECUERDO GUARDADO · ${line}`,{y:this.scene.key==='Level1Scene'?590:490,duration:2100});this.player.heal(2);this.audioManager.playSfx('checkpoint');});});}
  makeExit(){
    if(this.exitCreated){console.error(`[QA ${this.scene.key}] Se intentó crear más de una salida`);return;}
    this.exitCreated=true;
    const x=this.dataDef.width-125,finalSurface=[...this.worldBuilder.surfaces.values()].filter(s=>x>=s.left&&x<=s.right).sort((a,b)=>b.top-a.top)[0],surfaceTop=finalSurface?.top??648,y=surfaceTop-70;this.exitPoint={x,y:surfaceTop-45};
    const group=this.add.container(x,y).setDepth(15);this.exitGroup=group;
    const glow=this.add.ellipse(0,-30,158,216,this.dataDef.accent,.2).setBlendMode(Phaser.BlendModes.ADD);this.exitGlow=glow;
    const forestExit=this.dataDef.theme==='forest',arch=this.add.image(0,70,forestExit?'forest-remaster-atlas':`architecture-${this.dataDef.theme}`,forestExit?'gardenPortal':'gate').setOrigin(.5,forestExit?305/334:GATE_FOOT_Y[this.dataDef.theme]/512).setScale(forestExit?.56:.4);this.exitArch=arch;
    const label=this.add.text(0,-78,this.dataDef.exitLabel,{fontFamily:'monospace',fontSize:'12px',color:'#ffe7af',align:'center',backgroundColor:'#3a2a26e8',padding:{x:7,y:4},stroke:'#32162e',strokeThickness:2}).setOrigin(.5);
    group.add([glow,arch,label]);
    this.tweens.add({targets:[glow,arch],alpha:{from:this.dataDef.theme==='forest'?.72:.65,to:1},duration:850,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.exitPrompt=this.add.text(x,y-190,'E / ↑  CONTINUAR',{fontFamily:'monospace',fontSize:'17px',color:'#fff7cf',backgroundColor:'#481b49',padding:{x:12,y:7},stroke:'#210f28',strokeThickness:2}).setOrigin(.5).setDepth(60).setVisible(false);
    this.exitLockedText=this.add.text(x,surfaceTop-155,'🔒 CARTA DEL NIVEL NECESARIA\nAlgo importante quedó atrás…',{fontFamily:'monospace',fontSize:'12px',color:'#e6b4cc',align:'center',backgroundColor:'#211328',padding:{x:8,y:5}}).setOrigin(.5).setDepth(31).setVisible(false);
    const tryExit=()=>{if(this.exitNearby&&this.exitAvailable)this.finishLevel();};
    this.input.keyboard.on('keydown-E',tryExit);this.input.keyboard.on('keydown-UP',tryExit);
    this.events.once('shutdown',()=>{this.input.keyboard.off('keydown-E',tryExit);this.input.keyboard.off('keydown-UP',tryExit);});
    this.updateExitState();
  }
  updateExitState(){
    if(!this.exitPoint||!this.player)return;
    const missing=this.dataDef.required.filter(m=>!gameState.memories.includes(m));this.exitAvailable=missing.length===0;
    this.exitGroup.setVisible(true).setAlpha(1);this.exitGlow?.setAlpha(this.exitAvailable?.82:.18);if(this.exitArch){this.exitAvailable?this.exitArch.clearTint():this.exitArch.setTint(0x81758e);}this.exitLockedText.setVisible(!this.exitAvailable&&this.player.x>this.dataDef.width-420);
    this.exitNearby=this.exitAvailable&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.exitPoint.x,this.exitPoint.y)<105;
    this.exitPrompt.setVisible(this.exitNearby&&!this.finishing);
  }
  finishLevel(){if(this.finishing||!this.exitNearby||!this.exitAvailable)return;this.finishing=true;if(this.cardOverlay?.active)this.cardOverlay.destroy();this.cardOverlay=null;this.exitPrompt.setVisible(false);gameState.unlockedLevel=Math.max(gameState.unlockedLevel,this.dataDef.unlock);gameState.currentScene=this.dataDef.next;gameState.health=this.player.health;gameState.checkpoint=null;SaveManager.save(gameState);this.physics.pause();const interlude=this.scene.key==='Level1Scene'?'PECHO PALOMA: “Tu novia sigue avanzando.”\nMATEO: “Te dije que vendría.”\nPECHO PALOMA: “Ya veremos cuánto dura.”\nMATEO: “No la conoces.”\n\nCAPÍTULO II · JARDÍN DE ROSAS':this.scene.key==='Level2Scene'?'PECHO PALOMA: “¿Por qué sigue viniendo?”\nMATEO: “Porque me ama.”\nPECHO PALOMA: “Eso no significa que llegará.”\nMATEO: “Entonces sigue mirando.”\n\nCAPÍTULO III · EL CASTILLO DE PECHO PALOMA':'';if(interlude){this.add.rectangle(640,360,1280,720,0x090512,.87).setScrollFactor(0).setDepth(500);this.add.text(640,360,interlude,{fontFamily:'monospace',fontSize:'25px',color:'#ffe9cf',align:'center',lineSpacing:10}).setOrigin(.5).setScrollFactor(0).setDepth(501);this.time.delayedCall(3100,()=>{this.cameras.main.fadeOut(650,12,6,22);this.time.delayedCall(680,()=>this.scene.start(this.dataDef.next));});}else{this.cameras.main.fadeOut(650,12,6,22);this.time.delayedCall(680,()=>this.scene.start(this.dataDef.next));}}
  makePause(){ this.input.keyboard.on('keydown-ESC',()=>this.togglePause()); }
  togglePause(){ if(this.gameOver||this.finishing||this.interactionLocked||this.cardPickupInProgress)return; this.paused=!this.paused; if(this.paused){this.physics.pause();this.pauseUi=this.add.container(0,0).setScrollFactor(0).setDepth(500);const bg=this.add.rectangle(640,360,520,390,0x180d25,.97).setStrokeStyle(5,0xf3c66b);const title=this.add.text(640,220,'PAUSA',{fontFamily:'monospace',fontSize:'40px',color:'#ffe4a5'}).setOrigin(.5);this.pauseUi.add([bg,title]);[['CONTINUAR',290,()=>this.togglePause()],['REINICIAR CHECKPOINT',350,()=>this.scene.restart()],['CONTROLES',410,()=>this.uiManager.showMessage('A/D mover · SPACE saltar · Z combo · X energía · V escudo · ESC pausa','white',2400)],['MENÚ PRINCIPAL',470,()=>this.scene.start('MenuScene')]].forEach(([t,y,fn])=>{const b=this.add.text(640,y,t,{fontFamily:'monospace',fontSize:'20px',color:'#ffeaf6',backgroundColor:'#472746',padding:{x:18,y:10}}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',fn);this.pauseUi.add(b);});}else{this.pauseUi?.destroy();this.pauseUi=null;this.physics.resume();} }
  showGameOver(){ if(this.gameOver)return;this.gameOver=true;this.physics.pause();this.add.rectangle(640,360,1280,720,0x090612,.84).setScrollFactor(0).setDepth(600);this.add.text(640,290,'Todavía no puedo rendirme.',{fontFamily:'monospace',fontSize:'29px',color:'#ffe0ef'}).setOrigin(.5).setScrollFactor(0).setDepth(601);[['REINTENTAR DESDE CHECKPOINT',390,()=>this.scene.restart()],['MENÚ',455,()=>this.scene.start('MenuScene')]].forEach(([t,y,f])=>this.add.text(640,y,t,{fontFamily:'monospace',fontSize:'22px',color:'#fff',backgroundColor:'#6d2d58',padding:{x:20,y:12}}).setOrigin(.5).setScrollFactor(0).setDepth(602).setInteractive().on('pointerdown',f)); }
  makeMobileControls(){if(!this.sys.game.device.input.touch)return;this.input.addPointer(6);const bind=(label,x,key)=>{const button=this.add.text(x,640,label,{fontFamily:'monospace',fontSize:'28px',color:'#fff',backgroundColor:'#55294f',padding:{x:11,y:10}}).setOrigin(.5).setScrollFactor(0).setDepth(1250).setAlpha(.82).setInteractive();const down=()=>{key.isDown=true;key._justDown=true;button.setAlpha(1);},up=()=>{key.isDown=false;key._justUp=true;button.setAlpha(.82);};button.on('pointerdown',down).on('pointerup',up).on('pointerout',up).on('pointerupoutside',up);return button;};bind('◀',62,this.player.keys.A);bind('▶',138,this.player.keys.D);bind('↑',930,this.player.keys.SPACE);bind('⚔',1005,this.player.keys.Z);bind('♥',1080,this.player.keys.X);bind('➜',1155,this.player.keys.Q);bind('◯',1230,this.player.keys.V);}
  update(time,delta){
    if(!this.player||this.paused||this.interactionLocked||this.gameOver)return;this.player.update(time,delta);this.updateNarrativeMoment();if(this.scene.key==='Level1Scene'){this.updateLevel1Reactivity();if(this.presentationReady&&!this.level1Tutorial.attack&&this.player.x>430){this.level1Tutorial.attack=true;this.uiManager.showMessage('Z / J · ATAQUE','#ffe7ad',1500);}if(this.presentationReady&&!this.level1Tutorial.flight&&this.player.x>900){this.level1Tutorial.flight=true;this.uiManager.showMessage('X / K · CORAZÓN   ·   SHIFT · ESQUIVAR/CORRER','#ffd6e8',1900);}}
    if(this.scene.key==='Level1Scene'&&!this.level1Story.colorRestored&&(gameState.memories||[]).includes('l1-first-date')){this.level1Story.colorRestored=true;this.cameras.main.flash(420,115,175,135,false);this.cameras.main.setBackgroundColor('#152445');}
    if(this.presentationReady)this.sectionMarkers?.forEach(section=>{if(!section.shown&&this.player.x>=section.x){section.shown=true;this.uiManager.showMessage(section.label,'#ffe6af',1500);}});
    if(!this.puzzleSolved){if(this.scene.key==='Level1Scene'){this.puzzleActive=Math.abs(this.player.x-this.puzzleX)<150;this.puzzlePrompt.setVisible(this.puzzleActive);}else if(this.scene.key==='Level2Scene'){const near=this.puzzleSymbols?.some(s=>!s.active&&Math.abs(this.player.x-s.x)<90);this.puzzlePrompt.setVisible(!!near).setText('E · ACTIVAR RECUERDO');}else if(this.scene.key==='Level3Scene'){this.puzzlePrompt.setVisible(Math.abs(this.player.x-this.puzzleX)<170).setText(`RUNAS RECUPERADAS · ${this.runesCollected}/3`);}else{const near=this.puzzleSymbols?.some(s=>!s.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,s.x,s.y)<105);this.puzzlePrompt.setVisible(!!near).setText(`E · ACTIVAR ${this.dataDef.puzzleType==='hearts'?'CORAZÓN':'TOMO'}`);}}else this.puzzlePrompt?.setVisible(false);
    if(this.encounterDialogue&&!this.encounterDialogue.shown&&Math.abs(this.player.x-this.encounterDialogue.target.x)<390)this.startEncounterDialogue();
    this.combatArenas?.forEach(a=>{if(!a.started&&this.player.x>a.start+70&&this.player.x<a.end)this.startCombatArena(a);this.updateCombatArena(a);});
    this.cameras.main.setFollowOffset(Phaser.Math.Linear(this.cameras.main.followOffset.x,-this.player.body.velocity.x*.12,.035),Phaser.Math.Linear(this.cameras.main.followOffset.y,this.player.body.velocity.y<0?28:0,.035));this.updateExitState();this.enemies?.getChildren().forEach(e=>{const entryGrace=this.time.now<this.entryGraceUntil&&this.player.x<this.entrySafeX;if(this.presentationReady&&!entryGrace)e.update(delta);else{e.setVelocityX(0);e.damageActive=false;e.releaseAttackSlot?.();e.aggroUntil=0;}this.keepEnemyGrounded(e);e.syncHealthHud?.();e.safetyTimer=(e.safetyTimer||0)-delta;if(e.safetyTimer<=0){e.safetyTimer=500;if(e.active&&e.visible&&e.y>(this.dataDef.height||720)+80&&e.safeSpawn){e.setPosition(e.safeSpawn.x,e.safeSpawn.y);e.setVelocity(0);e.body.enable=true;e.body.updateFromGameObject();}}});
    this.collectibles?.forEach(item=>{if(item.active&&!item.collected&&!item.magnetizing&&Phaser.Math.Distance.Between(this.player.x,this.player.y,item.x,item.y)<=item.pickupRange)this.attemptPickup(item);});
    if(this.generalHud){const alive=this.general?.active&&this.general.health>0;this.generalHud.setVisible(alive&&Math.abs(this.player.x-this.general.x)<620);this.generalFill.displayWidth=380*Math.max(0,this.general.health/this.generalMaxHealth);}
    this.projectiles?.getChildren().forEach(s=>{s.x+=s.travelDir*s.travelSpeed*delta/1000;s.body.updateFromGameObject();const targets=this.enemies.getChildren().filter(e=>e.active&&Math.abs(e.x-s.x)<360&&Math.sign(e.x-s.x)===s.travelDir);if(targets.length){targets.sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x));s.y=Phaser.Math.Linear(s.y,targets[0].y,this.dataDef.projectileHoming??.1);s.body.updateFromGameObject();}s.trailTimer=(s.trailTimer||0)-delta;if(s.active&&s.trailTimer<=0){s.trailTimer=70;const h=this.add.text(s.x,s.y,'♥',{fontSize:'9px',color:'#ff86bd'}).setOrigin(.5).setDepth(10);this.tweens.add({targets:h,x:h.x-s.travelDir*14,alpha:0,scale:.3,duration:260,onComplete:()=>h.destroy()});}});
    this.hazards?.forEach(h=>{h.phase=(h.phase+delta)%2400;h.dangerous=h.phase>850&&h.phase<1550;h.body.enable=h.dangerous;const warning=h.phase>500&&h.phase<850,factor=h.dangerous?1:(warning ? .82 : .58);h.setAlpha(h.dangerous?1:(warning?0.72:0.42)).setScale(h.baseScaleX,h.baseScaleY*factor);h.warning.setAlpha(warning?0.9:(h.dangerous?0.18:0.05)).setScale(warning?1.25:1);});
    if(this.damageDebug){this.damageDebug.clear().fillStyle(0xff0000,.28).lineStyle(2,0xff3030,.95);this.damageDebugLabels.forEach(({source,label})=>{const enabled=source.active&&source.visible&&source.body?.enable;label.setVisible(enabled);if(!enabled)return;this.damageDebug.fillRect(source.body.x,source.body.y,source.body.width,source.body.height).strokeRect(source.body.x,source.body.y,source.body.width,source.body.height);label.setPosition(source.body.center.x,source.body.y-10).setText(source.name||source.type||'DAMAGE');});}
    this.updateQaPanel();
    if(this.player.invulnerable>0){this.player.invulnerable-=delta;this.player.setAlpha(this.player.invulnerable%100<50?.35:1);}else this.player.setAlpha(1);if(this.player.y>(this.dataDef.height||720)+80)this.showGameOver();
  }
}
