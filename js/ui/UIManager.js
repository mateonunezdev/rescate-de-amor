export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.hud = null;
    this.healthText = null;
    this.rosesText = null;
    this.lettersText = null;
    this.powerText = null;
    this.createHud();
  }

  createHud() {
    this.container = this.scene.add.container(30, 20);
    this.container.setDepth(200);

    const bg = this.scene.add.rectangle(0, 0, 350, 76, 0x160d24, 0.94).setStrokeStyle(3, 0xf2c46f, 0.9);
    bg.setOrigin(0, 0);
    this.container.add(bg);

    const lifeLabel = this.scene.add.text(16, 12, '♥ VIDA', { fontFamily: 'monospace', fontSize: '15px', color: '#ffb8d3' });
    const rosesLabel = this.scene.add.text(132, 12, '🌹 ROSAS', { fontFamily: 'monospace', fontSize: '13px', color: '#ffb8d3' });
    const lettersLabel = this.scene.add.text(230, 12, '✉ RECUERDOS', { fontFamily: 'monospace', fontSize: '13px', color: '#ffb8d3' });
    const powerLabel = this.scene.add.text(230, 56, '★', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe39a' });

    this.healthText = this.scene.add.text(16, 37, '♥♥♥♥♥', { fontFamily: 'monospace', fontSize: '20px', color: '#ff5f99' });
    this.rosesText = this.scene.add.text(158, 37, '0', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' });
    this.lettersText = this.scene.add.text(270, 37, '0 / 5', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' });
    this.powerText = this.scene.add.text(246, 56, '—', { fontFamily: 'monospace', fontSize: '10px', color: '#9de5ff' });

    this.container.add([lifeLabel, rosesLabel, lettersLabel, powerLabel, this.healthText, this.rosesText, this.lettersText, this.powerText]);
  }

  updateHud({ health, roses, letters, power }) {
    if (this.healthText) this.healthText.setText('♥'.repeat(Math.max(0, health)));
    if (this.rosesText) this.rosesText.setText(String(roses));
    if (this.lettersText) this.lettersText.setText(`${letters}/5`);
    if (this.powerText) this.powerText.setText(power === 'super salto' ? '◆ SUPER SALTO' : power && power !== 'none' ? String(power).toUpperCase() : '—');
  }

  showMessage(text, color = '#f8d9af', duration = 1200) {
    const msg = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 - 40, text, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color,
      backgroundColor: 'rgba(18, 12, 28, 0.7)',
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 30,
      duration,
      onComplete: () => msg.destroy(),
    });
  }
}
