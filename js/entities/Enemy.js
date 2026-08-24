export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, `enemy-${config.type || 'pigeon'}`);
    this.scene = scene;
    this.type = config.type || 'pigeon';
    this.speed = config.speed || 80;
    this.direction = config.direction || 1;
    this.health = config.health || 3;
    this.minX = config.minX ?? x - 100;
    this.maxX = config.maxX ?? x + 100;
    this.damage = config.damage || 1;
    this.miniBoss=!!config.miniBoss;this.displayName=config.name||null;
    this.spawnX=x;this.safeSpawn={x,y};this.attackCooldown=400+Math.random()*500;
    this.flying = ['pigeon', 'dive', 'magic'].includes(this.type);
    this.humanoid=['guard','soldier','archer','knight','mage','general'].includes(this.type);this.rangedCooldown=900+Math.random()*700;
    this.setScale(this.type === 'general' ? 1.25 : this.humanoid ? 1.05 : 1.35);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spriteRow={soldier:0,mage:1,knight:2,general:3}[this.type];
    this.hasEnemySheet=this.spriteRow!==undefined&&scene.textures.exists('pigeon-enemies-v2');
    if(this.hasEnemySheet)this.setTexture('pigeon-enemies-v2',this.spriteRow*6);
    if(this.humanoid){this.body.setSize(this.hasEnemySheet?42:34,this.hasEnemySheet?70:58);this.body.setOffset(this.hasEnemySheet?43:8,this.hasEnemySheet?43:10);}
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    if (this.body) {
      this.body.setAllowGravity(!this.flying);
    }
    this.setDepth(8);
    this.startY = y;
  }

  update(delta=16) {
    if (!this.active || !this.body) return;
    const player=this.scene.player,dist=player?player.x-this.x:9999,absDist=Math.abs(dist);this.attackCooldown=Math.max(0,this.attackCooldown-delta);
    if(this.humanoid&&player){const ranged=this.type==='archer'||this.type==='mage',detect=this.type==='general'?520:350,idealMin=this.type==='mage'?250:this.type==='archer'?220:60,idealMax=this.type==='mage'?400:this.type==='archer'?350:idealMin;if(absDist<detect){this.direction=Math.sign(dist)||this.direction;if(ranged){this.body.setVelocityX(absDist<idealMin?-this.direction*this.speed*.7:absDist>idealMax?this.direction*this.speed*.75:0);this.rangedCooldown-=delta;if(this.rangedCooldown<=0){this.rangedCooldown=this.type==='mage'?1900:1450;this.rangedAttack(player);}}else if(absDist>65)this.body.setVelocityX(this.speed*this.direction*(this.type==='general'?1.65:this.type==='knight'?.82:1.25));else{this.body.setVelocityX(0);if(this.attackCooldown<=0){this.attackCooldown=this.type==='general'?700:950;this.meleeStrike(player);}}}else{const home=this.spawnX-this.x;if(Math.abs(home)>18){this.direction=Math.sign(home);this.body.setVelocityX(this.speed*.55*this.direction);}else this.body.setVelocityX(0);}}else this.body.setVelocityX(this.speed*this.direction);
    if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }
    this.setFlipX(this.direction < 0);
    if (this.flying) {this.y = this.startY + Math.sin(this.scene.time.now / 260 + this.x) * 8;this.setScale(this.scaleX,1.25+Math.sin(this.scene.time.now/75)*.13);this.telegraph=(this.telegraph||0)+delta;if(this.type==='dive'&&this.telegraph>1900){this.telegraph=0;this.setTint(0xff8fc8);this.scene.tweens.add({targets:this,y:this.y+28,duration:150,yoyo:true,onComplete:()=>this.active&&this.clearTint()});}} else if(this.humanoid){const base=this.hasEnemySheet?(this.type==='general'?.82:.66):(this.type==='general'?1.25:1.05),bob=Math.sin(this.scene.time.now/(Math.abs(this.body.velocity.x)>10?85:220));this.setScale(base*(1+bob*.025),base*(1-bob*.02));this.setAngle(bob*(this.type==='general'?1:2));if(this.hasEnemySheet&&!this.inAction)this.setFrame(this.spriteRow*6+(Math.abs(this.body.velocity.x)>10?1+Math.floor(this.scene.time.now/210)%2:0));}else if(this.type==='broken') this.setScale(1.2+Math.sin(this.scene.time.now/170)*.05);else if(this.type==='slime')this.setScale(1.25+Math.sin(this.scene.time.now/135)*.12,1.25-Math.sin(this.scene.time.now/135)*.09);
  }

  meleeStrike(player){if(!this.active||!player)return;this.inAction=true;if(this.hasEnemySheet)this.setFrame(this.spriteRow*6+3);this.scene.tweens.add({targets:this,x:this.x+this.direction*18,duration:100,yoyo:true});this.scene.time.delayedCall(110,()=>{if(this.active&&player.active&&Phaser.Math.Distance.Between(this.x,this.y,player.x,player.y)<92){const damaged=player.takeDamage(this.damage);if(damaged===false)this.setVelocityX(-this.direction*150);}this.inAction=false;});}

  rangedAttack(player){this.inAction=true;if(this.hasEnemySheet)this.setFrame(this.spriteRow*6+2);else this.setTint(this.type==='mage'?0xc774ff:0xffd277);const rune=this.scene.add.circle(this.x,this.y-12,this.type==='mage'?24:14,0x9c43c5,.12).setStrokeStyle(3,this.type==='mage'?0xe798ff:0xffd3e7,.8).setDepth(18);this.scene.tweens.add({targets:rune,angle:180,scale:1.25,duration:420});this.scene.time.delayedCall(420,()=>{if(!this.active){rune.destroy();return;}rune.destroy();this.clearTint();if(this.hasEnemySheet)this.setFrame(this.spriteRow*6+3);const orb=this.scene.add.image(this.x,this.y-12,this.type==='mage'?'enemy-magic-orb':'enemy-feather-shot').setDepth(19);this.scene.physics.add.existing(orb);orb.body.setAllowGravity(false);const angle=Phaser.Math.Angle.Between(this.x,this.y,player.x,player.y);orb.setRotation(angle);orb.body.setVelocity(Math.cos(angle)*260,Math.sin(angle)*260);const hit=this.scene.physics.add.overlap(player,orb,()=>{player.takeDamage(1);hit.destroy();orb.destroy();});this.scene.time.delayedCall(2200,()=>{hit.active&&hit.destroy();orb.active&&orb.destroy();});this.scene.time.delayedCall(260,()=>this.active&&(this.inAction=false));});}

  hit() {
    this.health -= 1;
    this.inAction=true;if(this.hasEnemySheet)this.setFrame(this.spriteRow*6+4);
    this.scene.audioManager?.playSfx('enemyDown');
    this.setTintFill(0xffffff);
    this.scene.cameras.main.shake(45,.0025);this.scene.particleManager?.sparkles(this.x,this.y,0xff8fc8,6);this.scene.tweens.add({targets:this,x:this.x-this.direction*9,duration:55,yoyo:true});
    this.scene.time.delayedCall(120, () => {if(this.active){this.clearTint();this.inAction=false;}});
    if (this.health <= 0) {
      this.scene.particleManager?.burst(this.x, this.y, 0xffd7f6, 18, 200);
      this.body.enable=false;if(this.hasEnemySheet)this.setFrame(this.spriteRow*6+5);this.scene.tweens.add({targets:this,y:this.y+18,angle:this.hasEnemySheet?0:90,alpha:0,duration:520,delay:180,onComplete:()=>this.disableBody(true,true)});
      this.scene.addRose?.(1);
    }
  }
}
