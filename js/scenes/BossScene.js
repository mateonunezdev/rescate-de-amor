import Player from '../entities/Player.js?v=20260820-pickup-combat-24';
import UIManager from '../ui/UIManager.js?v=20260823-professional-polish-29';
import AudioManager from '../systems/AudioManager.js';
import ParticleManager from '../systems/ParticleManager.js';
import { gameState } from '../config.js';
import { TextureFactory } from '../utils/TextureFactory.js?v=20260823-professional-polish-29';

export default class BossScene extends Phaser.Scene {
  constructor() {
    super('BossScene');
  }

  create() {
    this.audioManager = new AudioManager(this);
    this.audioManager.playMusic('bossMusic');
    this.cameras.main.setBackgroundColor('#0a0509');

    // Create textures
    TextureFactory.createPlayerTexture(this);
    TextureFactory.createBossTexture(this);
    TextureFactory.createMateoTexture(this);
    TextureFactory.createEnemyTexture(this,'pigeon');TextureFactory.createCombatTextures(this);

    this.createBossArena();

    // Ground
    const ground = this.add.rectangle(this.scale.width / 2, this.scale.height - 60, this.scale.width, 50, 0x3b2a4a, 1);
    this.physics.add.existing(ground, true);

    // Player
    this.player = new Player(this, 150, 540);
    this.player.canChargeLove=(gameState.memories||[]).includes('card3')||!!gameState.chargedUnlocked;
    this.physics.add.collider(this.player, ground);
    this.player.body.setCollideWorldBounds(true);
    this.player.maxHealth = 7;
    this.player.health = 7;
    this.player.setDepth(20);
    this.player.maxHealth = gameState.maxHealth || 6;
    this.player.health = this.player.maxHealth;
    this.loveShots = this.physics.add.group({ allowGravity: false });

    // Boss setup
    this.bossHomeX=925;this.bossHomeY=315;this.boss = this.add.image(this.bossHomeX,this.bossHomeY,'pecho-final',0).setScale(1.58);
    this.bossHasFinalArt=true;
    this.physics.add.existing(this.boss, false);
    this.boss.body.setAllowGravity(false);
    this.boss.body.setImmovable(true);
    this.boss.setDepth(15);
    this.bossAura = this.add.ellipse(this.boss.x,this.boss.y,225,285,0xd33c9c,.14).setStrokeStyle(4,0xff83c5,.28).setDepth(14);
    this.bossBirds = [];
    for (let i=0;i<3;i++) { const bird=this.add.image(this.boss.x,this.boss.y,'enemy-pigeon').setScale(1.5).setDepth(16);this.bossBirds.push(bird); }

    this.bossHealth = 36;
    this.bossMaxHealth = 36;
    this.displayedBossHealth = 36;
    this.phase = 1;
    this.phaseThreshold1 = 24;
    this.phaseThreshold2 = 12;
    this.lastAnnouncedPhase = 1;

    // UI & Audio
    this.uiManager = new UIManager(this);
    this.particleManager = new ParticleManager(this);
    this.uiManager.updateHud({health:this.player.health,roses:gameState.roses||0,cards:(gameState.memories||[]).filter(x=>/^card[123]$/.test(x)).length,power:this.player.canChargeLove?'corazón imparable':'impulso de amor'});
    this.events.on('player-hit',health=>this.uiManager.updateHud({health,roses:gameState.roses||0,cards:(gameState.memories||[]).filter(x=>/^card[123]$/.test(x)).length,power:this.player.canChargeLove?'corazón imparable':'impulso de amor'}));

    // Boss health bar
    this.createHealthBar();

    // Boss title
    this.add.text(this.scale.width / 2, 116, 'REINA DE LAS PALOMAS', {
      fontFamily: 'monospace',
      fontSize: '17px',
      color: '#ff69b4',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.mateo=this.add.image(1160,475,'mateo-final',1).setScale(.8).setDepth(12);
    this.cell=this.add.container(1160,470).setDepth(18);this.cell.add(this.add.rectangle(0,0,130,175,0x11101a,.16).setStrokeStyle(9,0x595265));for(let i=-2;i<=2;i++)this.cell.add(this.add.rectangle(i*25,0,6,165,0x272532).setStrokeStyle(2,0x777080));this.add.text(1160,575,'MATEO',{fontFamily:'monospace',fontSize:'13px',color:'#ffe8c4',backgroundColor:'#211327',padding:{x:6,y:3}}).setOrigin(.5).setDepth(20);

    // Attack patterns
    this.attackTimer = 0;this.bossInvulnerable=0;this.bossState='IDLE';this.stateUntil=0;this.mateoCueTimer=4200;
    this.attackCooldown = 1200;
    this.bossMoving = false;
    this.projectiles = [];
    this.physics.add.overlap(this.loveShots, this.boss, (shot) => { const damage=shot.damage||1;shot.destroy();for(let i=0;i<damage;i++){this.bossInvulnerable=0;this.handlePlayerAttack();} });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D,SPACE,X');
    this.add.text(640,655,'X — IMPULSO DE AMOR',{fontFamily:'monospace',fontSize:'18px',color:'#fff0c4',backgroundColor:'#682453',padding:{x:14,y:8}}).setOrigin(.5).setDepth(110).setAlpha(.95);
    this.showBossIntro();

  }

  showBossIntro(){
    this.combatStarted=false;
    this.bossIntroElapsed=0;
    this.bossIntroStep=0;
    this.bossIntroPanel=this.add.rectangle(640,360,900,190,0x140b20,.94).setStrokeStyle(5,0xd09a60).setDepth(180);
    this.bossIntroText=this.add.text(640,360,'MATEO: “¡Paola!”\nPAOLA: “¡Mateo!”',{fontFamily:'monospace',fontSize:'25px',color:'#ffe9ce',align:'center',lineSpacing:9}).setOrigin(.5).setDepth(181);
    this.bossIntroLines=[
      'PECHO PALOMA: “No des otro paso. He esperado demasiado tiempo por él.”\nPAOLA: “Él nunca fue tuyo.”',
      'MATEO: “Ella tiene razón. Yo amo a Paola.”\nPECHO PALOMA: “Entonces… tendré que derrotarla.”',
      'JEFE FINAL\n♛ PECHO PALOMA ♛\nREINA DE LAS PALOMAS\n\n3 · 2 · 1 · COMBATE',
    ];
  }

  updateBossIntro(delta){
    this.bossIntroElapsed+=delta;
    const elapsed=this.bossIntroElapsed;
    const nextStep=Math.min(3,Math.floor(elapsed/950));
    if(nextStep>this.bossIntroStep){this.bossIntroStep=nextStep;this.bossIntroText.setText(this.bossIntroLines[nextStep-1]);}
    if(elapsed>=3900){this.bossIntroPanel.destroy();this.bossIntroText.destroy();this.combatStarted=true;this.attackTimer=0;}
  }

  createHealthBar() {
    const bg = this.add.rectangle(690, 72, 460, 28, 0x34172f, .96);
    bg.setScrollFactor(0).setDepth(99);
    bg.setStrokeStyle(2, 0xff69b4, 1);

    this.healthBarBg = bg;
    this.healthFill = this.add.rectangle(465, 72, 450, 18, 0xd8478c, 1);
    this.healthFill.setOrigin(0,0.5);
    this.healthFill.setScrollFactor(0).setDepth(99);

    const label = this.add.text(690, 38, '♛  PECHO PALOMA  ♛\nREINA DE LAS PALOMAS', {
      fontFamily: 'monospace',
      fontSize: '19px',
      color: '#ffe3a1',
      align:'center',lineSpacing:3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(99);
  }

  updateHealthBar() {
    const percent = Math.max(0, this.displayedBossHealth / this.bossMaxHealth);
    this.healthFill.displayWidth = 450 * percent;
    this.healthFill.x = 465;

    // Change color based on health
    if (percent > 0.66) {
      this.healthFill.setFillStyle(0x69ff69);
    } else if (percent > 0.33) {
      this.healthFill.setFillStyle(0xffff69);
    } else {
      this.healthFill.setFillStyle(0xff6969);
    }
  }

  createBossArena() {
    this.add.image(640,360,'bg-boss').setDisplaySize(1280,720).setDepth(-20);
    this.add.rectangle(640,360,1280,720,0x100818,.12).setDepth(-19);
    for(let i=0;i<34;i++){const petal=this.add.ellipse(Math.random()*1280,120+Math.random()*520,3,7,i%2?0xff85b4:0xffd0df,.55).setDepth(7).setAngle(Math.random()*180);this.tweens.add({targets:petal,x:petal.x-100-Math.random()*180,y:petal.y+35,angle:petal.angle+180,duration:2600+Math.random()*2400,repeat:-1});}
    this.add.rectangle(640,625,1280,90,0x130f19,.3).setDepth(2);
  }

  updateBossPhase() {
    if (this.bossHealth <= this.phaseThreshold2) {
      this.phase = 3;
    } else if (this.bossHealth <= this.phaseThreshold1) {
      this.phase = 2;
    } else {
      this.phase = 1;
    }
    if (this.phase !== this.lastAnnouncedPhase) {
      this.lastAnnouncedPhase = this.phase;
      if (this.phase === 2) this.uiManager.showDialogueBubble('PECHO PALOMA', '¿Por qué ella?  —  MATEO: Porque la amo.', { x: 690, y: 500, tail: 'right', duration: 2700 });
      else this.uiManager.showDialogueBubble('PAOLA', 'Nunca lo tuviste. El amor no se obliga.', { x: 600, y: 500, duration: 2700 });
    }
  }

  bossPhasedMovement(delta) {
    if(!this.boss?.active||['DASH','MELEE','RETREAT','HURT','DEFEAT'].includes(this.bossState))return;
    const distance=this.boss.x-this.player.x,preferred=this.phase===1?440:this.phase===2?390:340;
    this.bossState=Math.abs(distance-preferred)>80?'CHASE':'IDLE';
    const targetX=Phaser.Math.Clamp(this.player.x+preferred,650,1010);const targetY=Phaser.Math.Clamp(320+(this.player.y-500)*.22+Math.sin(this.time.now/(520-this.phase*70))*55,220,440);
    const follow=.018+this.phase*.006;this.boss.x=Phaser.Math.Linear(this.boss.x,targetX,follow);this.boss.y=Phaser.Math.Linear(this.boss.y,targetY,follow*1.15);
    this.bossHomeX=targetX;this.bossHomeY=targetY;
    this.bossAura.setPosition(this.boss.x,this.boss.y).setScale(1+Math.sin(this.time.now/240)*.08);
    this.bossBirds.forEach((b,i)=>b.setPosition(this.boss.x+Math.cos(this.time.now/500+i*2.1)*88,this.boss.y+Math.sin(this.time.now/500+i*2.1)*55));
  }

  performBossAttack() {
    const warning=this.add.text(this.boss.x-120,this.boss.y+105,this.phase===1?'¡BANDADA!':this.phase===2?'¡BESO HIPNÓTICO!':'¡CORAZÓN VACÍO!',{fontFamily:'monospace',fontSize:'15px',color:'#fff0a8',backgroundColor:'#621c56',padding:{x:8,y:5}}).setOrigin(.5).setDepth(80);
    this.tweens.add({targets:warning,alpha:0,duration:650,onComplete:()=>warning.destroy()});
    const phase=this.phase;this.attackCycle=(this.attackCycle||0)+1;this.bossState='CAST';
    if(phase===1){this.attackCycle%3===0?this.attackDive():this.attackPattern1();}else if(phase===2){const attacks=[()=>this.attackPattern2(),()=>this.attackPatternFeathers(),()=>this.attackDash()];attacks[this.attackCycle%attacks.length]();}else{const attacks=[()=>this.attackPattern3(),()=>this.attackPatternEmptyHeart(),()=>this.attackMelee(),()=>this.attackPatternFeathers()];attacks[this.attackCycle%attacks.length]();}
    this.bossFrameResetIn=520;
  }

  attackPattern1() {
    if(this.bossHasFinalArt)this.boss.setFrame(2);
    // Pigeon flock attack
    const pigeonCount = 4;
    for (let i = 0; i < pigeonCount; i++) {
      const projectile = this.add.image(this.boss.x-60,this.boss.y+(i-pigeonCount/2)*48,'enemy-pigeon').setScale(1.65);
      this.physics.add.existing(projectile, false);
      projectile.body.setAllowGravity(false);
      projectile.body.setVelocityX(-300 - i * 20);

      this.physics.add.overlap(this.player, projectile, () => {
        this.onBossDamagePlayer(projectile);
      });

      this.projectiles.push(projectile);
    }

    this.audioManager.playSfx('attack');
  }

  attackPattern2() {
    if(this.bossHasFinalArt)this.boss.setFrame(3);
    // Heart projectiles (phase 2)
    const heartCount = 6;
    for (let i = 0; i < heartCount; i++) {
      const angle = (i / heartCount) * Math.PI - Math.PI / 2;
      const projectile = this.add.image(this.boss.x-40,this.boss.y,'kiss-shot').setScale(1.2);
      this.physics.add.existing(projectile, false);
      projectile.body.setAllowGravity(false);
      const speed = 200;
      projectile.body.setVelocity(
        Math.cos(angle) * speed - 150,
        Math.sin(angle) * speed
      );

      this.physics.add.overlap(this.player, projectile, () => {
        this.onBossDamagePlayer(projectile);
      });

      this.projectiles.push(projectile);
    }

    this.audioManager.playSfx('bossHit');
  }

  attackPattern3() {
    if(this.bossHasFinalArt)this.boss.setFrame(this.phase===3?5:4);
    // Beam attack + pigeon swarm (phase 3)
    this.cameras.main.shake(150, 0.01);

    // Pigeon projectiles
    for (let i = 0; i < 5; i++) {
      const projectile = this.add.image(this.boss.x-40,this.boss.y+(i-2)*38,'enemy-pigeon').setScale(1.45).setTint(0xff9dcc);
      this.physics.add.existing(projectile, false);
      projectile.body.setAllowGravity(false);
      projectile.body.setVelocityX(-350);

      this.physics.add.overlap(this.player, projectile, () => {
        this.onBossDamagePlayer(projectile);
      });

      this.projectiles.push(projectile);
    }
    const warning=this.add.rectangle(470,555,820,8,0xffd06b,.65).setOrigin(0,.5).setDepth(70);this.tweens.add({targets:warning,alpha:.15,duration:180,yoyo:true,repeat:2,onComplete:()=>{warning.destroy();if(this.defeated)return;const beam=this.add.rectangle(470,555,820,25,0xff4fa8,.78).setOrigin(0,.5).setDepth(70);this.physics.add.existing(beam,true);const hit=this.physics.add.overlap(this.player,beam,()=>this.player.takeDamage(1));this.cameras.main.shake(160,.006);this.tweens.add({targets:beam,alpha:0,scaleY:1.8,duration:320,onComplete:()=>{hit.destroy();beam.destroy();}});}});
  }

  attackPatternEmptyHeart(){
    if(this.bossHasFinalArt)this.boss.setFrame(5);this.bossAura.setFillStyle(0x6b174f,.34).setStrokeStyle(7,0xff4d9d,.68);
    const heart=this.add.image(this.boss.x-58,this.boss.y+12,'empty-heart-shot').setScale(.35).setDepth(74);this.physics.add.existing(heart);heart.body.setAllowGravity(false);
    this.tweens.add({targets:heart,scale:1.45,duration:480,ease:'Back.easeOut',onComplete:()=>{if(!heart.active||this.defeated)return;const angle=Phaser.Math.Angle.Between(heart.x,heart.y,this.player.x,this.player.y);heart.body.setVelocity(Math.cos(angle)*255,Math.sin(angle)*255);}});
    this.physics.add.overlap(this.player,heart,()=>this.onBossDamagePlayer(heart));this.projectiles.push(heart);this.time.delayedCall(700,()=>this.bossAura?.active&&this.bossAura.setFillStyle(0xd33c9c,.14).setStrokeStyle(4,0xff83c5,.28));
  }

  attackDive(){
    this.bossState='DASH';if(this.bossHasFinalArt)this.boss.setFrame(4);const mark=this.add.circle(this.player.x,585,55,0xff3f91,.1).setStrokeStyle(5,0xffd16f,.9).setDepth(70);
    this.tweens.add({targets:mark,scale:1.35,alpha:.85,duration:430,yoyo:true,onComplete:()=>{mark.destroy();if(this.defeated||!this.boss?.active)return;const tx=Phaser.Math.Clamp(this.player.x,170,930),ty=500;this.tweens.add({targets:this.boss,x:tx,y:ty,duration:320,ease:'Cubic.easeIn',onUpdate:()=>{if(Phaser.Math.Distance.Between(this.boss.x,this.boss.y,this.player.x,this.player.y)<85)this.player.takeDamage(1);},onComplete:()=>this.retreatBoss()});}});
  }

  attackDash(){
    this.bossState='DASH';if(this.bossHasFinalArt)this.boss.setFrame(2);const lane=Phaser.Math.Clamp(this.player.y,300,520),warning=this.add.rectangle(640,lane,1180,12,0xffd16f,.5).setDepth(70);
    this.tweens.add({targets:warning,alpha:.1,duration:180,yoyo:true,repeat:2,onComplete:()=>{warning.destroy();if(this.defeated||!this.boss?.active)return;this.boss.setPosition(1080,lane);this.tweens.add({targets:this.boss,x:170,duration:520,ease:'Cubic.easeInOut',onUpdate:()=>{if(Phaser.Math.Distance.Between(this.boss.x,this.boss.y,this.player.x,this.player.y)<90)this.player.takeDamage(1);},onComplete:()=>this.retreatBoss()});}});
  }

  attackMelee(){
    this.bossState='MELEE';if(this.bossHasFinalArt)this.boss.setFrame(2);const tx=Phaser.Math.Clamp(this.player.x+110,180,980),ty=Phaser.Math.Clamp(this.player.y-40,280,500);
    this.tweens.add({targets:this.boss,x:tx,y:ty,duration:380,ease:'Sine.easeIn',onComplete:()=>{if(this.defeated)return;const fan=this.add.arc(this.boss.x-65,this.boss.y,88,120,240,false,0xff6db1,.28).setStrokeStyle(8,0xffd1e8).setDepth(72);if(Phaser.Math.Distance.Between(this.boss.x,this.boss.y,this.player.x,this.player.y)<180)this.player.takeDamage(1);this.tweens.add({targets:fan,scale:1.4,alpha:0,duration:260,onComplete:()=>fan.destroy()});this.retreatBoss();}});
  }

  retreatBoss(){if(this.defeated||!this.boss?.active)return;this.bossState='RETREAT';this.tweens.add({targets:this.boss,x:Phaser.Math.Clamp(this.player.x+410,680,1010),y:Phaser.Math.Clamp(300+Math.random()*100,240,420),duration:520,ease:'Sine.easeOut',onComplete:()=>this.boss?.active&&(this.bossState='IDLE')});}

  attackPatternFeathers(){if(this.bossHasFinalArt)this.boss.setFrame(4);const lanes=[250,430,610,790,970];lanes.forEach((x,i)=>{if(i===this.attackCycle%lanes.length)return;const mark=this.add.ellipse(x,610,92,24,0xff5fae,.12).setStrokeStyle(3,0xffd0e6,.8).setDepth(69);this.tweens.add({targets:mark,alpha:1,scaleX:1.2,duration:420,yoyo:true,onComplete:()=>{mark.destroy();if(this.defeated)return;const feather=this.add.image(x,-20,'enemy-feather-shot').setScale(1.25).setAngle(90).setDepth(72);this.physics.add.existing(feather);feather.body.setAllowGravity(false);feather.body.setVelocityY(370);this.physics.add.overlap(this.player,feather,()=>this.onBossDamagePlayer(feather));this.projectiles.push(feather);}});});this.uiManager.showMessage('LLUVIA DE PLUMAS · ¡BUSCA EL ESPACIO SEGURO!','#ffe4f2',1300);}

  onBossDamagePlayer(projectile) {
    const x=projectile.x,y=projectile.y;
    this.player.takeDamage(1);
    projectile.destroy();
    this.particleManager.burst(x, y, 0xff69b4, 10, 150);
    this.projectiles = this.projectiles.filter(p => p !== projectile);
  }

  handlePlayerAttack() {
      if(this.bossInvulnerable>0||this.defeated)return;this.bossInvulnerable=150;
      this.bossHealth -= 1;
      this.audioManager.playSfx('bossHit');
      this.cameras.main.shake(100, 0.008);
      this.particleManager.burst(this.boss.x, this.boss.y, 0xff69b4, 16, 200);
      this.bossState='HURT';this.boss.setVisible(true).setActive(true).setAlpha(0.7);
      if(this.bossHasFinalArt)this.boss.setFrame(6);
      this.boss.x += 7;
      this.time.delayedCall(130,()=>{if(!this.boss?.active)return;this.boss.setVisible(true).setAlpha(1);this.bossState='RETREAT';if(this.bossHasFinalArt)this.boss.setFrame(this.phase===3?5:0);this.retreatBoss();});

      this.updateHealthBar();

      if (this.bossHealth <= 0) {
        this.defeatBoss();
      }
  }

  fireLove(x, y, direction) {
    const shot = this.add.image(x,y,'love-shot').setScale(1.15);
    shot.damage=(gameState.memories||[]).includes('card2')?2:1;
    this.physics.add.existing(shot);this.loveShots.add(shot);shot.body.setAllowGravity(false);
    // In the arena Pecho Paloma flies above Paola. Aim the visible heart at her
    // current position so the advertised attack can actually reach the boss.
    const angle = Phaser.Math.Angle.Between(x, y, this.boss.x, this.boss.y);
    shot.body.setVelocity(Math.cos(angle) * 560, Math.sin(angle) * 560);
    shot.life=2200;
    this.audioManager.playSfx('attack');
  }

  fireChargedLove(x,y,direction){const shot=this.add.image(x,y,'love-shot').setScale(2.35).setTint(0xffd4ef);this.physics.add.existing(shot);this.loveShots.add(shot);shot.damage=3;shot.life=2500;shot.body.setAllowGravity(false);const angle=Phaser.Math.Angle.Between(x,y,this.boss.x,this.boss.y);shot.body.setVelocity(Math.cos(angle)*470,Math.sin(angle)*470);this.particleManager.burst(x,y,0xff5bad,28,240);this.cameras.main.shake(140,.005);this.audioManager.playSfx('bossHit');}
  meleeAttack(x,y,dir,step){const arc=this.add.ellipse(x+dir*42,y+8,step===3?96:66,step===3?82:54,0xff69ad,.2).setStrokeStyle(4,0xffd4eb,.9).setDepth(35);this.tweens.add({targets:arc,scale:1.3,alpha:0,duration:120,onComplete:()=>arc.destroy()});if(Phaser.Math.Distance.Between(x,y,this.boss.x,this.boss.y)<135){for(let i=0;i<(step===3?2:1);i++){this.bossInvulnerable=0;this.handlePlayerAttack();}}this.cameras.main.shake(45,.002);this.audioManager.playSfx('attack');}
  startAirSlam(x,y){this.particleManager.sparkles(x,y,0xff83be,10);}
  airSlamImpact(x,y){const wave=this.add.ellipse(x,y+35,200,48,0xff4fa4,.24).setStrokeStyle(5,0xffd1e8).setDepth(35);this.tweens.add({targets:wave,scaleX:1.7,alpha:0,duration:260,onComplete:()=>wave.destroy()});this.particleManager.burst(x,y+30,0xff75b3,24,200);this.cameras.main.shake(110,.005);}
  useSpecial(x,y){const cards=(gameState.memories||[]).filter(v=>/^card[123]$/.test(v)).length;if(cards<3){this.uiManager.showMessage('LATIDO VERDADERO · Requiere las 3 cartas','#ffd5e8');return false;}const ring=this.add.circle(x,y,38,0xff5cab,.25).setStrokeStyle(9,0xffeff8).setDepth(90);this.tweens.add({targets:ring,scale:12,alpha:0,duration:620,onComplete:()=>ring.destroy()});this.particleManager.burst(x,y,0xff4fa8,55,420);for(let i=0;i<5;i++){this.bossInvulnerable=0;this.handlePlayerAttack();}this.cameras.main.shake(220,.009);this.audioManager.playSfx('victory');return true;}

  defeatBoss() {
    if (this.defeated) return;
    this.defeated = true;
    this.bossState='DEFEAT';this.boss.setVisible(true).setActive(true).setAlpha(1);
    if(this.bossHasFinalArt)this.boss.setFrame(7);
    this.bossHealth = 0;
    this.updateHealthBar();

    // Boss defeated animation
    this.tweens.add({
      targets: this.boss,
      angle: 8,
      y: 455,
      duration: 1100,
      ease: 'Cubic.easeIn',
    });
    const crown=this.add.text(this.boss.x,this.boss.y-75,'♛',{fontSize:'44px',color:'#f1c454'}).setOrigin(.5).setDepth(40);this.tweens.add({targets:crown,x:900,y:555,angle:160,duration:1100,ease:'Bounce.easeOut'});
    this.uiManager.showDialogueBubble('PECHO PALOMA','Solo quería que me miraras como la miras a ella…',{x:880,y:260,tail:'right',duration:3000});
    this.time.delayedCall(3000,()=>this.uiManager.showDialogueBubble('MATEO','Eso no se puede obligar.',{x:925,y:455,tail:'right',duration:2500,width:500}));

    // Victory particle burst
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        this.particleManager.burst(
          this.boss.x,
          this.boss.y,
          0xff69b4 + Math.random() * 0x100000,
          20,
          280
        );
      });
    }

    this.audioManager.playSfx('victory');
    gameState.bossDefeated = true;
    gameState.unlockedLevel = 5;
    gameState.currentScene = 'EndingScene';
    gameState.achievements = [...new Set([...(gameState.achievements || []), 'Reina derrotada', 'Sin miedo a las palomas'])];
    localStorage.setItem('rescate-de-amor-save', JSON.stringify(gameState));
    this.time.delayedCall(5200,()=>this.uiManager.showDialogueBubble('PAOLA','Entonces abre la jaula.',{x:380,y:430,duration:2100,width:460}));
    this.time.delayedCall(5700,()=>{this.cell?.setAlpha(.35);this.uiManager.showMessage('El candado pierde su magia. Pecho Paloma lo deja libre.','#ffe9b0',1900);});
    this.victoryTransitionIn=7600;
  }

  update(time, delta) {
    if(this.defeated){this.victoryTransitionIn-=delta;if(!this.victoryFadeStarted&&this.victoryTransitionIn<=0){this.victoryFadeStarted=true;this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start('EndingScene'));this.cameras.main.fadeOut(800);}return;}
    if (this.bossHealth <= 0) return;
    if(!this.combatStarted){this.updateBossIntro(delta);return;}

    this.player.update(time, delta);
    this.bossInvulnerable=Math.max(0,this.bossInvulnerable-delta);
    this.displayedBossHealth=Phaser.Math.Linear(this.displayedBossHealth,this.bossHealth,.12);this.updateHealthBar();

    // Boss phase and movement
    this.updateBossPhase();
    this.boss.setVisible(true).setActive(true).setAlpha(this.bossState==='HURT'?.7:1);this.boss.y=Phaser.Math.Clamp(this.boss.y,210,520);this.bossPhasedMovement(delta);
    if(this.bossFrameResetIn){this.bossFrameResetIn-=delta;if(this.bossFrameResetIn<=0){this.bossFrameResetIn=0;if(this.bossHasFinalArt)this.boss.setFrame(0);}}

    // Explicit proximity check avoids tunnelling and guarantees the readable
    // heart projectile damages the airborne boss at its rendered position.
    this.loveShots.getChildren().forEach(shot=>{
      if(!shot.active)return;
      shot.life-=delta;
      if(shot.x>=this.boss.x-90||Phaser.Math.Distance.Between(shot.x,shot.y,this.boss.x,this.boss.y)<82){const damage=shot.damage||1;shot.destroy();for(let i=0;i<damage;i++){this.bossInvulnerable=0;this.handlePlayerAttack();}}
      else if(shot.life<=0||shot.x>1380||shot.y<-80)shot.destroy();
    });

    // Boss attack timing
    this.attackTimer += delta;
    if (this.attackTimer >= this.attackCooldown) {
      this.performBossAttack();
      this.attackTimer = 0;
      // Increase difficulty
      this.attackCooldown = Math.max(600, this.attackCooldown - 50);
    }
    this.mateoCueTimer-=delta;if(this.mateoCueTimer<=0){this.mateoCueTimer=5200+Math.random()*2200;const cue=['¡Paola!','¡Cuidado!','¡Tú puedes!'][Math.floor(Math.random()*3)];this.uiManager.showDialogueBubble('MATEO',cue,{x:980,y:430,tail:'right',width:300,duration:1200});this.mateo.setFrame(2);this.time.delayedCall(700,()=>this.mateo?.active&&this.mateo.setFrame(1));}

    // Invulnerability flash
    if (this.player.invulnerable > 0) {
      this.player.invulnerable -= delta;
      this.player.setAlpha(this.player.invulnerable % 100 < 50 ? 0.5 : 1);
    } else {
      this.player.setAlpha(1);
    }

    // Cleanup off-screen projectiles
    this.projectiles=this.projectiles.filter(p=>{if(!p?.active)return false;if(p.x < -100||p.x>1380||p.y>820||p.y<-140){p.destroy();return false;}return true;});

    // Player death
    if (this.player.health <= 0) {
      this.cameras.main.fadeOut(600);
      this.time.delayedCall(600, () => {
        this.scene.restart();
      });
    }

    // Fallback restart
    if (this.player.y > this.scale.height + 100) {
      this.scene.restart();
    }
  }
}
