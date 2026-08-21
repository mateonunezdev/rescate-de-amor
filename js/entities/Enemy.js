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
    this.flying = ['pigeon', 'dive', 'magic'].includes(this.type);
    this.humanoid=['guard','soldier','archer','knight','mage','general'].includes(this.type);this.rangedCooldown=900+Math.random()*700;
    this.setScale(this.type === 'general' ? 1.25 : this.humanoid ? 1.05 : 1.35);
    scene.add.existing(this);
    scene.physics.add.existing(this);
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
    const player=this.scene.player,dist=player?player.x-this.x:9999;
    if(this.humanoid&&Math.abs(dist)<330&&this.type!=='archer'&&this.type!=='mage')this.direction=Math.sign(dist)||this.direction;
    this.body.setVelocityX(this.speed*this.direction*(this.humanoid&&Math.abs(dist)<260?1.35:1));
    if((this.type==='archer'||this.type==='mage')&&player&&Math.abs(dist)<520){this.body.setVelocityX(Math.abs(dist)<220?-Math.sign(dist)*this.speed*.7:0);this.direction=Math.sign(dist)||this.direction;this.rangedCooldown-=delta;if(this.rangedCooldown<=0){this.rangedCooldown=this.type==='mage'?1900:1450;this.rangedAttack(player);}}
    if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }
    this.setFlipX(this.direction < 0);
    if (this.flying) {this.y = this.startY + Math.sin(this.scene.time.now / 260 + this.x) * 8;this.setScale(this.scaleX,1.25+Math.sin(this.scene.time.now/75)*.13);this.telegraph=(this.telegraph||0)+delta;if(this.type==='dive'&&this.telegraph>1900){this.telegraph=0;this.setTint(0xff8fc8);this.scene.tweens.add({targets:this,y:this.y+28,duration:150,yoyo:true,onComplete:()=>this.active&&this.clearTint()});}} else if(this.humanoid){const base=this.type==='general'?1.25:1.05,bob=Math.sin(this.scene.time.now/(Math.abs(this.body.velocity.x)>10?85:220));this.setScale(base*(1+bob*.025),base*(1-bob*.02));this.setAngle(bob*(this.type==='general'?1:2));}else if(this.type==='broken') this.setScale(1.2+Math.sin(this.scene.time.now/170)*.05);else if(this.type==='slime')this.setScale(1.25+Math.sin(this.scene.time.now/135)*.12,1.25-Math.sin(this.scene.time.now/135)*.09);
  }

  rangedAttack(player){this.setTint(this.type==='mage'?0xc774ff:0xffd277);const rune=this.scene.add.circle(this.x,this.y-12,this.type==='mage'?24:14,0x9c43c5,.12).setStrokeStyle(3,this.type==='mage'?0xe798ff:0xffd3e7,.8).setDepth(18);this.scene.tweens.add({targets:rune,angle:180,scale:1.25,duration:420});this.scene.time.delayedCall(420,()=>{if(!this.active){rune.destroy();return;}rune.destroy();this.clearTint();const orb=this.scene.add.image(this.x,this.y-12,this.type==='mage'?'enemy-magic-orb':'enemy-feather-shot').setDepth(19);this.scene.physics.add.existing(orb);orb.body.setAllowGravity(false);const angle=Phaser.Math.Angle.Between(this.x,this.y,player.x,player.y);orb.setRotation(angle);orb.body.setVelocity(Math.cos(angle)*260,Math.sin(angle)*260);const hit=this.scene.physics.add.overlap(player,orb,()=>{player.takeDamage(1);hit.destroy();orb.destroy();});this.scene.time.delayedCall(2200,()=>{hit.active&&hit.destroy();orb.active&&orb.destroy();});});}

  hit() {
    this.health -= 1;
    this.scene.audioManager?.playSfx('enemyDown');
    this.setTintFill(0xffffff);
    this.scene.cameras.main.shake(45,.0025);this.scene.particleManager?.sparkles(this.x,this.y,0xff8fc8,6);this.scene.tweens.add({targets:this,x:this.x-this.direction*9,duration:55,yoyo:true});
    this.scene.time.delayedCall(70, () => this.active && this.clearTint());
    if (this.health <= 0) {
      this.scene.particleManager?.burst(this.x, this.y, 0xffd7f6, 18, 200);
      this.body.enable=false;this.scene.tweens.add({targets:this,y:this.y-24,angle:90,scale:0,alpha:0,duration:260,onComplete:()=>this.disableBody(true,true)});
      this.scene.addRose?.(1);
    }
  }
}
