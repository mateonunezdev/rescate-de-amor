export default class ParticleManager {
  constructor(scene) {
    this.scene = scene;
  }

  burst(x, y, color = 0xffa3d8, count = 12, speed = 120) {
    const particles = this.scene.add.particles(x, y, undefined, {
      speed: { min: 40, max: speed },
      angle: { min: 0, max: 360 },
      scale: { start: 0.18, end: 0 },
      lifespan: 600,
      quantity: count,
      tint: color,
      gravityY: 120,
      emitting: false,
    });

    particles.explode(count, x, y);
    this.scene.time.delayedCall(700, () => particles.destroy());
  }

  heartBurst(x, y) {
    this.burst(x, y, 0xff6ab0, 16, 180);
  }

  roseBurst(x, y) {
    this.burst(x, y, 0xff8bc8, 14, 150);
  }

  sparkles(x, y, color = 0xf6d98a, count = 12) {
    this.burst(x, y, color, count, 90);
  }
}
