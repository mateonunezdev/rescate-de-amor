export default class UIManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.container = null;
    this.hud = null;
    this.healthText = null;
    this.rosesText = null;
    this.lettersText = null;
    this.powerText = null;
    this.messageQueue = [];
    this.activeMessage = null;
    if(options.hud !== false)this.createHud();
  }

  createHud() {
    this.container = this.scene.add.container(24, 18).setScrollFactor(0).setDepth(1000);
    this.container.setName('player-hud');
    this.container.setScale(0.9);

    const bg = this.scene.add.rectangle(0, 0, 370, 112, 0x160d24, 0.96).setStrokeStyle(3, 0xf2c46f, 0.9);
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

    this.container.add([lifeLabel, rosesLabel, lettersLabel, powerLabel, this.healthText, this.rosesText, this.lettersText, this.powerText,this.shieldText]);
  }

  updateShield(active,cooldown,maxCooldown=6500){if(!this.shieldText)return;if(active>0)this.shieldText.setText(`🛡 ESCUDO · ACTIVO ${(active/1000).toFixed(1)}s`).setColor('#ffffff');else if(cooldown>0)this.shieldText.setText(`🛡 ESCUDO · RECARGANDO ${Math.ceil(cooldown/1000)}s`).setColor('#c99db8');else this.shieldText.setText('🛡 ESCUDO · LISTO [V]').setColor('#ffd9ef');}

  updateHud({ health, roses, letters, cards, power }) {
    if (this.healthText) this.healthText.setText('♥'.repeat(Math.max(0, health)));
    if (this.rosesText) this.rosesText.setText(String(roses));
    if (this.lettersText) this.lettersText.setText(`${cards ?? letters ?? 0}/3`);
    if (this.powerText) this.powerText.setText(power === 'super salto' ? '◆ SUPER SALTO' : power && power !== 'none' ? String(power).toUpperCase() : '—');
  }

  showMessage(text, color = '#f8d9af', duration = 1200) {
    this.messageQueue.push({ text, color, duration });
    this.showNextMessage();
  }

  showNextMessage() {
    if (this.activeMessage?.active || !this.messageQueue.length) return;
    const { text, color, duration } = this.messageQueue.shift();
    const msg = this.scene.add.text(this.scene.scale.width / 2, 112, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color,
      backgroundColor: 'rgba(18, 12, 28, 0.9)',
      padding: { left: 14, right: 14, top: 7, bottom: 7 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1100);
    this.activeMessage = msg;

    this.scene.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 16,
      duration,
      onComplete: () => {
        msg.destroy();
        if (this.activeMessage === msg) this.activeMessage = null;
        this.showNextMessage();
      },
    });
  }

  getDialogueSafeZone(object,margin=28){
    if(!object?.visible||!object.getBounds)return null;const b=object.getBounds(),camera=this.scene.cameras.main,zoom=camera.zoom||1,world=object.scrollFactorX===0?{x:b.x,y:b.y,width:b.width,height:b.height}:{x:(b.x-camera.worldView.x)*zoom+camera.x,y:(b.y-camera.worldView.y)*zoom+camera.y,width:b.width*zoom,height:b.height*zoom};return{x:world.x-margin,y:world.y-margin,width:world.width+margin*2,height:world.height+margin*2,right:world.x+world.width+margin,bottom:world.y+world.height+margin};
  }

  layoutDialogueBubble(width,height,options){
    const viewportW=this.scene.scale.width,viewportH=this.scene.scale.height,margin=40,speakerZone=this.getDialogueSafeZone(options.speakerObject),safeZones=[speakerZone,...(options.safeObjects||[]).map(o=>this.getDialogueSafeZone(o))].filter(Boolean),speakerX=speakerZone?speakerZone.x+speakerZone.width/2:(options.x??viewportW/2),speakerY=speakerZone?speakerZone.y+speakerZone.height/2:(options.y??viewportH*.67),gap=18;
    const above={x:speakerX,y:(speakerZone?.y??speakerY)-height/2-gap},below={x:speakerX,y:(speakerZone?.bottom??speakerY)+height/2+gap},left={x:(speakerZone?.x??speakerX)-width/2-gap,y:speakerY},right={x:(speakerZone?.right??speakerX)+width/2+gap,y:speakerY},side=options.preferredSide;
    const preferred=options.preferredPosition?{x:options.preferredPosition.x,y:options.preferredPosition.y}:Number.isFinite(options.x)&&Number.isFinite(options.y)?{x:options.x,y:options.y}:null,candidates=[preferred,above,side==='left'?{...above,x:above.x-width*.34}:side==='right'?{...above,x:above.x+width*.34}:speakerX<viewportW/2?{...above,x:above.x-width*.3}:{...above,x:above.x+width*.3},left,right,below].filter(Boolean);
    const clamp=p=>({x:Phaser.Math.Clamp(p.x,width/2+margin,viewportW-width/2-margin),y:Phaser.Math.Clamp(p.y,height/2+margin,viewportH-height/2-margin)}),overlaps=(p,z)=>p.x-width/2<z.right&&p.x+width/2>z.x&&p.y-height/2<z.bottom&&p.y+height/2>z.y;let chosen=clamp(candidates[0]);for(const candidate of candidates){const p=clamp(candidate);if(!safeZones.some(z=>overlaps(p,z))){chosen=p;break;}}
    return{...chosen,speakerX,speakerY,safeZones,bubbleBounds:{x:chosen.x-width/2,y:chosen.y-height/2,width,height,right:chosen.x+width/2,bottom:chosen.y+height/2}};
  }

  showDialogueBubble(speaker, text, options = {}) {
    if(options.replace!==false)this.activeDialogue?.dismiss?.(true);
    const speakerKey=String(speaker).toUpperCase(),narrator=speakerKey==='NARRADOR',inferredActor=narrator?null:options.speakerObject??(speakerKey==='PAOLA'?(this.scene.paola||this.scene.player):speakerKey==='MATEO'?this.scene.mateo:speakerKey.includes('PECHO')?(this.scene.pecho||this.scene.villain||this.scene.boss||this.scene.innerVillain):null),inferredSafe=options.safeObjects??[this.scene.paola,this.scene.player,this.scene.mateo,this.scene.pecho,this.scene.villain,this.scene.boss,this.scene.cageRig,this.scene.innerCageRig].filter((o,i,a)=>o&&o!==inferredActor&&a.indexOf(o)===i);options={...options,speakerObject:inferredActor,safeObjects:inferredSafe,...(narrator?{preferredPosition:options.preferredPosition||{x:this.scene.scale.width/2,y:105}}:{})};
    const villain=options.variant==='pecho'||speakerKey.includes('PECHO'),love=options.variant==='love'||['PAOLA','MATEO'].includes(speakerKey),thought=options.variant==='thought'&&!narrator;
    const viewportW=this.scene.scale.width,viewportH=this.scene.scale.height,maxW=Math.min(options.width??520,viewportW*(viewportW<800?.62:.43)),minW=Math.min(210,maxW),fontSize=viewportW<800?16:18;
    const estimated=Math.max(minW,Math.min(maxW,Math.sqrt(String(text).length)*48));
    const line=this.scene.add.text(0,0,'',{fontFamily:'monospace',fontSize:`${fontSize}px`,color:villain?'#fff1dc':'#38202b',wordWrap:{width:estimated-34},lineSpacing:4}).setOrigin(0,0);
    line.setText(text);const width=Math.ceil(Math.max(minW,line.width+34)/4)*4,height=Math.ceil(Math.max(76,line.height+50)/4)*4;line.setPosition(-width/2+17,-height/2+31);
    const layout=this.layoutDialogueBubble(width,height,options),x=layout.x,y=layout.y,tailRight=layout.speakerX>=x,tailX=Phaser.Math.Clamp(layout.speakerX-x,-width/2+34,width/2-34),bg=villain?0x28122f:0xfff1d8,border=villain?0xdb4f9f:0x3a222e,accent=villain?0xf1bf67:String(speaker).toUpperCase()==='MATEO'?0x315d91:0xa92f67;
    const layer=this.scene.add.container(x,y).setScrollFactor(0).setDepth(options.depth??1120).setAlpha(0).setScale(.92),g=this.scene.add.graphics();
    const pixelBox=(ox,oy,w,h,fill,stroke)=>{g.fillStyle(0x09050d,.32).fillRect(ox+6,oy+7,w,h);g.fillStyle(stroke,1).fillRect(ox+4,oy,w-8,h).fillRect(ox,oy+4,w,h-8);g.fillStyle(fill,1).fillRect(ox+8,oy+4,w-16,h-8).fillRect(ox+4,oy+8,w-8,h-16);};pixelBox(-width/2,-height/2,width,height,bg,border);
    if(!narrator){g.fillStyle(border,1);if(tailRight){g.fillRect(tailX-4,height/2-4,28,8);g.fillRect(tailX+4,height/2+4,20,8);g.fillRect(tailX+12,height/2+12,12,8);}else{g.fillRect(tailX-24,height/2-4,28,8);g.fillRect(tailX-24,height/2+4,20,8);g.fillRect(tailX-24,height/2+12,12,8);}g.fillStyle(bg,1);g.fillRect(tailRight?tailX:tailX-20,height/2-4,20,8);g.fillRect(tailRight?tailX+8:tailX-20,height/2+4,12,8);}
    const labelW=Math.min(width-24,Math.max(92,String(speaker).length*11+24)),label=this.scene.add.graphics();label.fillStyle(border,1).fillRect(-width/2+10,-height/2-13,labelW,25);label.fillStyle(accent,1).fillRect(-width/2+14,-height/2-9,labelW-8,17);
    const name=this.scene.add.text(-width/2+20,-height/2-7,String(speaker).toUpperCase(),{fontFamily:'monospace',fontSize:'13px',color:'#fff8e8',fontStyle:'bold'}),heart=love?this.scene.add.text(width/2-23,-height/2+12,'♥',{fontFamily:'monospace',fontSize:'15px',color:'#c53c72'}).setOrigin(.5):null;
    if(thought){for(let i=0;i<3;i++)g.fillStyle(bg,1).fillCircle(tailRight?tailX+20+i*9:tailX-20-i*9,height/2+12+i*7,7-i);}
    const hit=this.scene.add.zone(0,0,width,height+30).setName('dialogue-hit').setInteractive({useHandCursor:true});layer.add([g,label,line,name]);if(heart)layer.add(heart);layer.add(hit);
    const full=String(text),typewriter=options.typewriter!==false;let shown=typewriter?0:full.length,typing=typewriter,closed=false,timer=null;line.setText(typewriter?'':full);
    if(typewriter)timer=this.scene.time.addEvent({delay:Math.max(12,options.typeSpeed??24),repeat:full.length-1,callback:()=>{shown++;line.setText(full.slice(0,shown));if(shown>=full.length)typing=false;}});
    const cleanup=()=>{timer?.remove(false);hit.removeAllListeners();if(options.keyboard!==false){this.scene.input.keyboard.off('keydown-ENTER',advance);this.scene.input.keyboard.off('keydown-SPACE',advance);}if(this.activeDialogue===layer)this.activeDialogue=null;};
    const close=instant=>{if(closed)return;closed=true;cleanup();if(instant){layer.destroy();return;}this.scene.tweens.add({targets:layer,alpha:0,y:layer.y-8,duration:130,onComplete:()=>layer.destroy()});};
    const advance=()=>{if(closed)return;if(typing){timer?.remove(false);typing=false;shown=full.length;line.setText(full);return;}if(options.onAdvance){close();options.onAdvance();}else close();};
    layer.dismiss=close;layer.advance=advance;layer.dialogueLayout=layout;hit.on('pointerdown',advance);if(options.keyboard!==false){this.scene.input.keyboard.on('keydown-ENTER',advance);this.scene.input.keyboard.on('keydown-SPACE',advance);}this.scene.events.once('shutdown',()=>close(true));
    this.scene.tweens.add({targets:layer,alpha:1,scale:1,duration:150,ease:'Back.easeOut'});if(options.duration!==0)this.scene.time.delayedCall(options.duration??2800,()=>close());this.activeDialogue=layer;return layer;
  }
}
