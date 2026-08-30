export default class UIManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.container = null;
    this.hud = null;
    this.healthText = null;
    this.rosesText = null;
    this.lettersText = null;
    this.powerText = null;
    if(options.hud !== false)this.createHud();
  }

  createHud() {
    this.container = this.scene.add.container(24, 18).setScrollFactor(0).setDepth(1000);
    this.container.setName('player-hud');

    const bg = this.scene.add.rectangle(0, 0, 395, 136, 0x160d24, 0.96).setStrokeStyle(3, 0xf2c46f, 0.9);
    bg.setOrigin(0, 0);
    this.container.add(bg);

    const lifeLabel = this.scene.add.text(16, 12, '♥ VIDA', { fontFamily: 'monospace', fontSize: '15px', color: '#ffb8d3' });
    const rosesLabel = this.scene.add.text(132, 12, '🌹 ROSAS', { fontFamily: 'monospace', fontSize: '13px', color: '#ffb8d3' });
    const lettersLabel = this.scene.add.text(230, 12, '💌 CARTAS', { fontFamily: 'monospace', fontSize: '13px', color: '#ffb8d3' });
    const powerLabel = this.scene.add.text(230, 61, '★', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe39a' });

    this.healthText = this.scene.add.text(16, 37, '♥♥♥♥♥', { fontFamily: 'monospace', fontSize: '20px', color: '#ff5f99' });
    this.rosesText = this.scene.add.text(158, 37, '0', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' });
    this.lettersText = this.scene.add.text(270, 37, '0 / 3', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' });
    this.powerText = this.scene.add.text(246, 61, '—', { fontFamily: 'monospace', fontSize: '10px', color: '#9de5ff' });
    this.shieldText = this.scene.add.text(16, 87, '🛡 ESCUDO · LISTO [V]', { fontFamily: 'monospace', fontSize: '13px', color: '#ffd9ef' });
    this.fragmentsText=this.scene.add.text(16,112,'◆ FRAGMENTOS · 0/12',{fontFamily:'monospace',fontSize:'13px',color:'#c8e8ff'});

    this.container.add([lifeLabel, rosesLabel, lettersLabel, powerLabel, this.healthText, this.rosesText, this.lettersText, this.powerText,this.shieldText,this.fragmentsText]);
  }

  updateShield(active,cooldown,maxCooldown=6500){if(!this.shieldText)return;if(active>0)this.shieldText.setText(`🛡 ESCUDO · ACTIVO ${(active/1000).toFixed(1)}s`).setColor('#ffffff');else if(cooldown>0)this.shieldText.setText(`🛡 ESCUDO · RECARGANDO ${Math.ceil(cooldown/1000)}s`).setColor('#c99db8');else this.shieldText.setText('🛡 ESCUDO · LISTO [V]').setColor('#ffd9ef');}

  updateHud({ health, roses, letters, cards, fragments, power }) {
    if (this.healthText) this.healthText.setText('♥'.repeat(Math.max(0, health)));
    if (this.rosesText) this.rosesText.setText(String(roses));
    if (this.lettersText) this.lettersText.setText(`${cards ?? letters ?? 0}/3`);
    if (this.powerText) this.powerText.setText(power === 'super salto' ? '◆ SUPER SALTO' : power && power !== 'none' ? String(power).toUpperCase() : '—');
    if(this.fragmentsText)this.fragmentsText.setText(`◆ FRAGMENTOS · ${fragments??0}/12`);
  }

  showMessage(text, color = '#f8d9af', duration = 1200) {
    const msg = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2 - 40, text, {
      fontFamily: 'monospace',
      fontSize: '22px',
      color,
      backgroundColor: 'rgba(18, 12, 28, 0.7)',
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100);

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 30,
      duration,
      onComplete: () => msg.destroy(),
    });
  }

  showAchievement(name){const badge=this.scene.add.container(1045,88).setScrollFactor(0).setDepth(1400).setAlpha(0),bg=this.scene.add.rectangle(0,0,410,72,0x1d1028,.97).setStrokeStyle(4,0xf1c66f),icon=this.scene.add.text(-178,0,'★',{fontFamily:'monospace',fontSize:'28px',color:'#ffe08a'}).setOrigin(.5),text=this.scene.add.text(-145,-18,`LOGRO DESBLOQUEADO\n${name}`,{fontFamily:'monospace',fontSize:'14px',color:'#ffe9cf',lineSpacing:5}).setOrigin(0,.5);badge.add([bg,icon,text]);this.scene.tweens.add({targets:badge,alpha:1,x:1030,duration:260,ease:'Back.easeOut',hold:1800,yoyo:true,onComplete:()=>badge.destroy()});}

  showDialogueBubble(speaker, text, options = {}) {
    const x = options.x ?? this.scene.scale.width / 2;
    const y = options.y ?? 485;
    const width = options.width ?? 610;
    const duration = options.duration ?? 2500;
    const layer = this.scene.add.container(x, y).setScrollFactor(0).setDepth(1120).setAlpha(0);
    const shadow = this.scene.add.rectangle(5, 6, width, 104, 0x08050d, .35).setOrigin(.5);
    const panel = this.scene.add.rectangle(0, 0, width, 104, 0xfff0d8, .98).setStrokeStyle(5, 0x422039, 1);
    const tailX = options.tail === 'right' ? width / 2 - 54 : -width / 2 + 54;
    const tail = this.scene.add.triangle(tailX, 66, -18, -18, 22, -18, options.tail === 'right' ? 18 : -18, 22, 0xfff0d8).setStrokeStyle(4, 0x422039, 1);
    const name = this.scene.add.text(-width / 2 + 22, -37, String(speaker).toUpperCase(), { fontFamily: 'monospace', fontSize: '16px', color: options.nameColor ?? '#b02f68', fontStyle: 'bold' });
    const line = this.scene.add.text(-width / 2 + 22, -10, text, { fontFamily: 'monospace', fontSize: '18px', color: '#3d2030', wordWrap: { width: width - 44 }, lineSpacing: 4 });
    layer.add([shadow, tail, panel, name, line]);
    this.scene.tweens.add({ targets: layer, alpha: 1, y: y - 8, duration: 180, ease: 'Back.easeOut' });
    const close = () => { if (!layer.active) return; this.scene.tweens.add({ targets: layer, alpha: 0, y: layer.y - 12, duration: 220, onComplete: () => layer.destroy() }); };
    this.scene.time.delayedCall(duration, close);
    return layer;
  }
}
