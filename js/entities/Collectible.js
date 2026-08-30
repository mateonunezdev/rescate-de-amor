export default class Collectible extends Phaser.GameObjects.Container {
  constructor(scene, x, y, type = 'rose') {
    super(scene, x, y);
    this.scene = scene;
    this.type = type;
    this.value = 1;
    this.collected = false;
    this.kind = type;

    const palette = {
      heart: { color: 0xff6d9d, glow: 0xffbfd7 },
      star: { color: 0xf8d974, glow: 0xfff4b7 },
      rose: { color: 0xff7eb8, glow: 0xffd5ea },
      letter: { color: 0xf4d1a4, glow: 0xfff5cc },
      diamond: { color: 0x87d3ff, glow: 0xc0ebff },
      checkpoint: { color: 0xa5f0ff, glow: 0xd9fbff },
    };

    const colors = palette[type] || palette.rose;
    const key = `collectible-${type}`;
    this.sprite = scene.textures.exists(key) ? scene.add.image(0, 0, key).setScale(1.5) : scene.add.circle(0, 0, 12, colors.color, 0.9).setStrokeStyle(2, colors.glow, 1);
    this.glow = scene.add.circle(0, 0, 19, colors.glow, 0.16);
    this.add([this.glow, this.sprite]);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.pickupWidth=type.startsWith('card')?92:64;this.pickupHeight=type.startsWith('card')?110:78;this.pickupRange=type.startsWith('card')?104:72;this.magnetizing=false;
    this.body.setSize(this.pickupWidth, this.pickupHeight);
    this.body.setOffset(-this.pickupWidth/2, -this.pickupHeight/2);
    this.setDepth(10);

    this.scene.tweens.add({
      targets: [this.sprite,this.glow],
      y: -6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.scene.tweens.add({ targets: this.glow, scale: 1.35, alpha: 0.04, duration: 650, yoyo: true, repeat: -1 });
  }

  magnetTo(player,onComplete){if(this.collected||this.magnetizing)return;this.magnetizing=true;if(this.body)this.body.enable=false;this.scene.tweens.killTweensOf([this.sprite,this.glow]);const dx=Phaser.Math.Clamp(player.x-this.x,-48,48),dy=Phaser.Math.Clamp(player.y-this.y,-55,55);this.scene.tweens.add({targets:[this.sprite,this.glow],x:dx,y:dy,scale:1.18,duration:130,ease:'Sine.easeIn',onComplete});}

  collect() {
    if (this.collected) return;
    this.collected = true;
    if (this.body) this.body.enable = false;
    this.scene.particleManager?.roseBurst(this.x, this.y);
    this.scene.audioManager?.playSfx(this.type === 'heart' ? 'heart' : this.type === 'diamond' ? 'diamond' : 'rose');
    this.scene.events.emit('collectible-collected', this.type, this.x, this.y);
    this.scene.tweens.killTweensOf([this,this.sprite,this.glow]);
    this.scene.tweens.add({targets:this.sprite,y:this.sprite.y-45,scale:1.8,alpha:0,duration:260,ease:'Back.easeIn'});this.scene.tweens.add({targets:this.glow,scale:2,alpha:0,duration:220,onComplete:()=>this.destroy()});
  }
}
