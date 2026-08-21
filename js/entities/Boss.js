export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');
    this.scene = scene;
    this.health = 12;
    this.maxHealth = 12;
    this.phase = 1;
    this.setScale(1.6);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setDepth(12);
    this.setTint(0xff9fd3);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setBounce(0.2);
  }

  update() {
    if (!this.active) return;
    if (this.health <= 8) this.phase = 2;
    if (this.health <= 4) this.phase = 3;
    this.y = 120 + Math.sin(this.scene.time.now / 500) * 30;
  }

  hit() {
    this.health -= 1;
    this.scene.audioManager?.playSfx('bossHit');
    this.scene.cameras.main.shake(80, 0.006);
    if (this.health <= 0) {
      this.scene.events.emit('boss-defeated');
      this.destroy();
    }
  }
}
