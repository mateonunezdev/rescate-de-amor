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
    this.setScale(this.type === 'guard' ? 1.55 : 1.35);
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
    this.body.setVelocityX(this.speed * this.direction);
    if (this.x < this.minX) {
      this.x = this.minX;
      this.direction = 1;
    }
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.direction = -1;
    }
    this.setFlipX(this.direction < 0);
    if (this.flying) {this.y = this.startY + Math.sin(this.scene.time.now / 260 + this.x) * 8;this.setScale(this.scaleX,1.25+Math.sin(this.scene.time.now/75)*.13);this.telegraph=(this.telegraph||0)+delta;if(this.type==='dive'&&this.telegraph>1900){this.telegraph=0;this.setTint(0xff8fc8);this.scene.tweens.add({targets:this,y:this.y+28,duration:150,yoyo:true,onComplete:()=>this.active&&this.clearTint()});}} else if(this.type==='broken') this.setScale(1.2+Math.sin(this.scene.time.now/170)*.05);else if(this.type==='slime')this.setScale(1.25+Math.sin(this.scene.time.now/135)*.12,1.25-Math.sin(this.scene.time.now/135)*.09);
  }

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
