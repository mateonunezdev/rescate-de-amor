export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'paola-final');
    this.scene = scene;
    this.speed = 220;
    this.runSpeed = 350;
    this.jumpVelocity = -450;
    this.coyoteTime = 120;
    this.jumpBufferWindow = 130;
    this.jumpBufferTimer = 0;
    this.maxHealth = 5;
    this.health = this.maxHealth;
    this.invulnerable = 0;
    this.facing = 1;
    this.isGrounded = false;
    this.groundedTimer = 0;
    this.jumpQueued = false;
    this.crouching = false;
    this.wasGrounded = false;
    this.stepDustTimer = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hasFinalArt=true;this.baseScale=.85;
    this.setTexture('paola-final',0);
    this.setScale(this.baseScale);
    this.setCollideWorldBounds(true);
    this.setDepth(20);
    this.body.setSize(32,70);
    this.body.setOffset(24,18);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('A,D,S,W,SHIFT,SPACE,X,K,Z,J,C,L,E');
    this.attackCooldown = 0;
    this.loveCharge=0;this.chargeFxTimer=0;this.comboStep=0;this.comboTimer=0;this.airSlamming=false;this.specialCooldown=0;this.combatPoseUntil=0;this.combatPoseFrame=6;
  }

  update(time, delta) {
    if (!this.active || !this.body) return;

    const left = this.keys.A.isDown || this.cursors.left.isDown;
    const right = this.keys.D.isDown || this.cursors.right.isDown;
    const run = this.keys.SHIFT.isDown;
    const crouch = this.keys.S.isDown || this.cursors.down.isDown;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.X)||Phaser.Input.Keyboard.JustDown(this.keys.K);
    const attackReleased = Phaser.Input.Keyboard.JustUp(this.keys.X)||Phaser.Input.Keyboard.JustUp(this.keys.K);
    const meleePressed = Phaser.Input.Keyboard.JustDown(this.keys.Z)||Phaser.Input.Keyboard.JustDown(this.keys.J);
    const specialPressed = Phaser.Input.Keyboard.JustDown(this.keys.C)||Phaser.Input.Keyboard.JustDown(this.keys.L);

    if (jumpPressed) {
      this.jumpBufferTimer = this.jumpBufferWindow;
    }
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.comboTimer=Math.max(0,this.comboTimer-delta);this.specialCooldown=Math.max(0,this.specialCooldown-delta);if(this.comboTimer===0)this.comboStep=0;

    this.isGrounded = this.body.blocked.down || this.body.touching.down;
    if (this.isGrounded && !this.wasGrounded && this.body.velocity.y >= 0) {
      this.scene.particleManager?.burst(this.x, this.y + 23, 0xd9c0aa, 5, 45);
      this.scene.tweens.add({ targets: this, scaleX: this.baseScale*1.08, scaleY: this.baseScale*.93, duration: 70, yoyo: true });
    }
    this.wasGrounded = this.isGrounded;
    if (this.isGrounded) {
      this.groundedTimer = this.coyoteTime;
    } else {
      this.groundedTimer = Math.max(0, this.groundedTimer - delta);
    }

    if (this.jumpBufferTimer > 0 && (this.isGrounded || this.groundedTimer > 0)) {
      this.jump();
    }

    if (left && !right) {
      this.facing = -1;
      this.setAccelerationX(-1100); this.setDragX(1500); this.setMaxVelocity(run ? this.runSpeed : this.speed, 700);
    } else if (right && !left) {
      this.facing = 1;
      this.setAccelerationX(1100); this.setDragX(1500); this.setMaxVelocity(run ? this.runSpeed : this.speed, 700);
    } else {
      this.setAccelerationX(0); this.setDragX(this.isGrounded ? 1500 : 420);
    }

    this.crouching = crouch && this.isGrounded;
    if (this.crouching) {
      this.setVelocityY(Math.min(this.body.velocity.y, 0));
    }

    this.stepDustTimer -= delta;
    if (this.isGrounded && Math.abs(this.body.velocity.x) > 260 && this.stepDustTimer <= 0) {
      this.stepDustTimer = 150;
      this.scene.particleManager?.burst(this.x - this.facing * 12, this.y + 22, 0xb99f91, 2, 28);
    }

    if(meleePressed&&crouch&&!this.isGrounded&&!this.airSlamming){this.airSlamming=true;this.setVelocityY(760);this.scene.startAirSlam?.(this.x,this.y);}
    else if(meleePressed&&this.attackCooldown<=0){this.comboStep=this.comboTimer>0?(this.comboStep%3)+1:1;this.comboTimer=520;this.attackCooldown=this.comboStep===3?300:150;this.scene.meleeAttack?.(this.x,this.y,this.facing,this.comboStep);}
    if (attackPressed && this.attackCooldown <= 0) { this.attackCooldown = 330; this.scene.fireLove?.(this.x + this.facing * 31, this.y + 10, this.facing); }
    if((this.keys.X.isDown||this.keys.K.isDown)&&this.canChargeLove){this.loveCharge=Math.min(1100,this.loveCharge+delta);this.chargeFxTimer-=delta;if(this.chargeFxTimer<=0){this.chargeFxTimer=120;this.scene.particleManager?.sparkles(this.x,this.y,0xff72b8,3);if(this.loveCharge>650)this.setTint(0xff8fc8);}}
    if(attackReleased){if(this.canChargeLove&&this.loveCharge>=900){this.attackCooldown=700;this.scene.fireChargedLove?.(this.x+this.facing*26,this.y-5,this.facing);}this.loveCharge=0;}
    if(specialPressed&&this.specialCooldown<=0&&this.scene.useSpecial?.(this.x,this.y)){this.specialCooldown=9000;}
    if(this.airSlamming&&this.isGrounded){this.airSlamming=false;this.scene.airSlamImpact?.(this.x,this.y);}

    if (!this.isGrounded && this.body.velocity.y > 0) {
      this.setTint(0xffb5d8);
    } else {
      this.clearTint();
    }

    if(this.hasFinalArt){let frame=0;if(time<this.combatPoseUntil)frame=this.combatPoseFrame;else if(this.crouching)frame=5;else if(this.attackCooldown>235)frame=6;else if(!this.isGrounded)frame=this.body.velocity.y<0?3:4;else if(Math.abs(this.body.velocity.x)>280)frame=2;else if(Math.abs(this.body.velocity.x)>20)frame=1;this.setFrame(frame);}
    if (this.isGrounded && Math.abs(this.body.velocity.x) < 15 && !this.crouching) {
      this.setScale(this.baseScale, this.baseScale + Math.sin(time / 280) * this.baseScale*.018);
    } else if (this.isGrounded) {
      this.setScale(this.baseScale, this.baseScale + Math.sin(time / (run ? 65 : 100)) * this.baseScale*.032);
    }

    this.setFlipX(this.facing < 0);
  }

  jump() {
    if (this.isGrounded || this.groundedTimer > 0) {
      this.setVelocityY(this.jumpVelocity);
      this.isGrounded = false;
      this.groundedTimer = 0;
      this.jumpBufferTimer = 0;
      this.scene.audioManager?.playSfx('jump');
    }
  }

  playCombatPose(frame,duration=180,angle=0){this.combatPoseFrame=frame;this.combatPoseUntil=this.scene.time.now+duration;this.scene.tweens.killTweensOf(this);this.setAngle(-angle*.35);this.scene.tweens.add({targets:this,angle,scaleX:this.baseScale*(frame===9?1.1:1.04),scaleY:this.baseScale*(frame===9?.94:1),duration:duration*.45,yoyo:true,ease:'Sine.easeOut'});}

  takeDamage(amount = 1) {
    if (this.invulnerable > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invulnerable = 900;
    if(this.hasFinalArt)this.setFrame(8);
    this.setVelocity(this.facing * -180, -220);
    this.scene.cameras.main.shake(120, 0.008);
    this.scene.audioManager?.playSfx('hit');
    this.scene.events.emit('player-hit', this.health);
    if (this.health <= 0) {
      this.scene.events.emit('game-over');
    }
  }

  heal(amount = 1) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.events.emit('player-heal', this.health);
  }

  setCheckpoint() {
    this.scene.events.emit('checkpoint-reached');
  }
}
