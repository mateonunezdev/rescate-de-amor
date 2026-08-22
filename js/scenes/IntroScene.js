export default class IntroScene extends Phaser.Scene {
  constructor(){super('IntroScene');}

  create(){
    this.step=0;this.locked=false;this.birds=[];this.cameras.main.fadeIn(650,8,5,20);
    this.makeBirdTexture();this.makePark();
    this.paola=this.add.image(515,570,'paola-final',4).setScale(1.08).setDepth(20);
    this.mateo=this.add.image(665,568,'mateo-final',2).setScale(1.06).setFlipX(true).setAngle(-3).setDepth(20);
    this.tweens.add({targets:this.paola,scaleY:1.095,scaleX:1.073,duration:1150,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});this.tweens.add({targets:this.mateo,scaleY:1.075,scaleX:1.045,duration:1320,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.villain=this.add.image(1030,370,'pecho-final',0).setScale(1.32).setAlpha(0).setDepth(27);
    this.aura=this.add.circle(1030,370,110,0xd93b9a,.16).setAlpha(0).setDepth(26);
    this.dialogPanel=this.add.rectangle(640,126,1000,150,0x160d26,.92).setStrokeStyle(5,0xc45b87).setDepth(90);
    this.text=this.add.text(640,126,'',{fontFamily:'monospace',fontSize:'24px',color:'#fff0d0',align:'center',lineSpacing:8,wordWrap:{width:910},stroke:'#35162f',strokeThickness:4}).setOrigin(.5).setDepth(91);
    this.prompt=this.add.text(640,686,'ENTER · ESPACIO · CLIC',{fontFamily:'monospace',fontSize:'14px',color:'#ead0e2'}).setOrigin(.5).setDepth(95);
    this.skip=this.add.text(1165,34,'SALTAR INTRO',{fontFamily:'monospace',fontSize:'14px',color:'#e3c8db'}).setOrigin(.5).setDepth(96).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showTitle());
    this.advance();const next=()=>this.advance();this.input.keyboard.on('keydown-ENTER',next);this.input.keyboard.on('keydown-SPACE',next);this.input.on('pointerdown',(p,targets)=>{if(!targets.includes(this.skip))next();});
  }

  makeBirdTexture(){const g=this.add.graphics();g.fillStyle(0xf8f3f5,1);g.fillEllipse(15,12,20,12);g.fillCircle(22,8,7);g.fillTriangle(27,8,35,11,27,13);g.fillTriangle(14,10,2,1,6,14);g.fillStyle(0x252136,1);g.fillRect(23,6,2,2);g.generateTexture('intro-pigeon',36,20);g.destroy();}

  makePark(){
    this.add.image(640,360,'bg-picnic').setDisplaySize(1280,720).setDepth(-20);
    const sky=this.add.rectangle(640,360,1280,720,0x7f2940,.06).setDepth(-19);
    this.castle=this.add.container(1130,350).setDepth(5).setAlpha(.52);this.castle.add([this.add.rectangle(0,65,180,300,0x20182f).setStrokeStyle(5,0x50344e),this.add.rectangle(-105,95,80,240,0x241a34),this.add.rectangle(105,95,80,240,0x241a34),this.add.triangle(0,-125,-90,0,90,0,0,-150,0x321e3d),this.add.triangle(-105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.triangle(105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.rectangle(0,35,48,70,0xb53e83,.48).setStrokeStyle(4,0xe1a16e)]);
    for(let i=0;i<26;i++){const f=this.add.circle(Math.random()*1280,350+Math.random()*270,2,0xffe477,.8).setDepth(12);this.tweens.add({targets:f,y:f.y-35,x:f.x+(Math.random()-.5)*24,alpha:.18,duration:1200+Math.random()*1100,yoyo:true,repeat:-1});}for(let i=0;i<18;i++){const p=this.add.ellipse(Math.random()*1280,120+Math.random()*430,3,7,i%2?0xff9cbd:0xffdf9d,.55).setDepth(13).setAngle(Math.random()*180);this.tweens.add({targets:p,x:p.x-70-Math.random()*80,y:p.y+35,angle:p.angle+180,duration:2600+Math.random()*2200,repeat:-1});}
  }

  makeCage(){
    const cage=this.add.container(this.mateo.x,this.mateo.y-28).setDepth(40).setAlpha(0);const glow=this.add.ellipse(0,5,205,220,0xff3fa9,.14).setStrokeStyle(5,0xff70bd,.28);const back=this.add.rectangle(0,4,142,172,0x170c20,.24).setStrokeStyle(7,0xb93d8c);const top=this.add.ellipse(0,-82,142,38,0x5a244f,.95).setStrokeStyle(7,0xf1bd62);const base=this.add.rectangle(0,87,154,20,0x6f285d).setStrokeStyle(6,0xf1bd62);const lock=this.add.container(0,24).setDepth(4);lock.add([this.add.rectangle(0,8,34,30,0x7a285c).setStrokeStyle(4,0xf4c65e),this.add.arc(0,-7,14,200,340,false,0x000000,0).setStrokeStyle(5,0xf4c65e),this.add.text(0,8,'💔',{fontSize:'16px'}).setOrigin(.5)]);this.cageBars=[];for(let i=-2;i<=2;i++){const bar=this.add.rectangle(i*27,-82,8,166,0xe7b653).setOrigin(.5,0).setStrokeStyle(2,0xffe09b);bar.scaleY=.02;this.cageBars.push(bar);}cage.add([glow,back,top,base,...this.cageBars,lock]);this.cage=cage;return cage;
  }

  spawnBirds(count,target=null){for(let i=0;i<count;i++){const b=this.add.image(1320+i*35,260+(i%5)*48,'intro-pigeon').setScale(1.1).setDepth(44);this.birds.push(b);if(target){const a=i/count*Math.PI*2;b.setPosition(target.x+Math.cos(a)*115,target.y+Math.sin(a)*85);this.tweens.add({targets:b,angle:360,duration:520+i*18,repeat:-1});}else this.tweens.add({targets:b,x:-70,y:b.y+(i%2?70:-30),duration:2300+i*80,ease:'Linear'});}}
  say(line,action){this.text.setAlpha(0).setText(line);action?.();this.tweens.add({targets:this.text,alpha:1,duration:220});}
  playCue(type){try{const c=this.sound.context,o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=type==='hit'?'sawtooth':'sine';o.frequency.setValueAtTime(type==='magic'?190:430,c.currentTime);o.frequency.exponentialRampToValueAtTime(type==='magic'?70:160,c.currentTime+.35);g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4);o.start();o.stop(c.currentTime+.42);}catch(e){}}

  closeCage(){
    this.makeCage().setAlpha(1).setScale(.2);this.playCue('magic');this.cameras.main.shake(260,.006);this.tweens.add({targets:this.cage,scale:1,duration:520,ease:'Back.easeOut'});this.cageBars.forEach((bar,i)=>this.tweens.add({targets:bar,scaleY:1,duration:520,delay:250+i*65,ease:'Bounce.easeOut'}));const ring=this.add.ellipse(this.mateo.x,this.mateo.y+45,190,58,0xff4faf,.18).setStrokeStyle(6,0xff77c0).setDepth(18);this.tweens.add({targets:ring,scale:1.5,alpha:0,duration:850,repeat:1,onComplete:()=>ring.destroy()});this.mateo.setFrame(1).setDepth(39);this.spawnBirds(12,this.cage);
  }
  magicPush(){const wave=this.add.circle(this.cage.x,this.cage.y,45,0xff5ab0,.12).setStrokeStyle(7,0xffa0d1,.75).setDepth(48);this.tweens.add({targets:wave,scale:5,alpha:0,duration:600,onComplete:()=>wave.destroy()});this.paola.setFrame(8);this.tweens.add({targets:this.paola,x:520,angle:-8,duration:260,yoyo:true});this.cameras.main.shake(180,.005);this.playCue('hit');}

  flyToCastle(){
    this.locked=true;this.prompt.setText('LA JAULA VUELA HACIA EL CASTILLO…');this.villain.setFrame(1);this.paola.setFrame(5);this.tweens.add({targets:this.paola,x:790,duration:2700,ease:'Sine.easeInOut'});this.tweens.add({targets:[this.cage,this.mateo],x:1080,y:245,duration:3100,ease:'Sine.easeInOut'});this.tweens.add({targets:[this.villain,this.aura],x:1160,y:225,duration:3000,ease:'Sine.easeInOut'});this.birds.forEach((b,i)=>this.tweens.add({targets:b,x:1030+(i%5)*35,y:180+(i%4)*40,duration:2400+i*45,ease:'Sine.easeInOut'}));this.cameras.main.pan(760,330,2500,'Sine.easeInOut');this.cameras.main.zoomTo(1.08,2500,'Sine.easeInOut');this.text.setText('MATEO: “¡Paola!”\nPAOLA: “¡Mateo, espérame!”');this.time.delayedCall(3300,()=>{this.locked=false;this.prompt.setText('ENTER · ESPACIO · CLIC');this.showCastleInterior();});
  }

  showCastleInterior(){
    this.step=12;this.castleLayer=this.add.container(0,0).setScrollFactor(0).setDepth(80);this.castleLayer.add(this.add.rectangle(640,360,1280,720,0x171021));for(let x=70;x<1280;x+=150)this.castleLayer.add(this.add.rectangle(x,390,90,520,0x271b34).setStrokeStyle(3,0x5b3b55));this.castleLayer.add(this.add.rectangle(640,625,1280,170,0x30233b).setStrokeStyle(7,0x76506c));this.innerMateo=this.add.image(500,530,'mateo-final',1).setScale(1.15).setScrollFactor(0).setDepth(84);this.innerVillain=this.add.image(760,490,'pecho-final',0).setScale(1.35).setScrollFactor(0).setDepth(84);this.innerBars=this.add.container(500,495).setScrollFactor(0).setDepth(85);this.innerBars.add(this.add.rectangle(0,0,165,205,0x130d19,.18).setStrokeStyle(9,0xc48a4e));for(let i=-2;i<=2;i++)this.innerBars.add(this.add.rectangle(i*31,0,8,195,0xd3a653).setStrokeStyle(2,0xffdd8b));this.cameras.main.setZoom(1).centerOn(640,360);this.text.setScrollFactor(0).setDepth(91).setText('PECHO PALOMA: “Bienvenido a mi reino.”');this.dialogPanel.setScrollFactor(0).setDepth(90);this.prompt.setScrollFactor(0).setDepth(95);this.skip.setScrollFactor(0).setDepth(96);
    this.step=14;
  }

  showGardenResolve(){
    this.locked=true;this.cameras.main.fadeOut(360,8,4,18);this.time.delayedCall(390,()=>{[this.castleLayer,this.innerMateo,this.innerVillain,this.innerBars].forEach(o=>o?.destroy());this.mateo.setVisible(false);this.villain.setVisible(false);this.aura.setVisible(false);this.cage?.setVisible(false);this.birds.forEach(b=>b.setVisible(false));this.paola.setVisible(true).setPosition(640,535).setAngle(0).setFrame(9);this.castle.setAlpha(.82);this.text.setText('PAOLA: “Voy a encontrarte.”\n\n“Y voy a traerte de vuelta.”');const h=this.add.text(640,440,'♥',{fontSize:'36px',color:'#ff6fae'}).setOrigin(.5).setDepth(50);this.tweens.add({targets:h,y:405,scale:1.3,duration:700,yoyo:true,repeat:1});this.cameras.main.fadeIn(500,8,4,18);this.locked=false;});
  }

  advance(){
    if(this.locked)return;const steps=[
      ()=>this.say('MATEO: “Llevaba días queriendo traerte aquí.”\nPAOLA: “¿Y tanto misterio era por esto?”'),
      ()=>this.say('MATEO: “Por esto… y por estar contigo.”\nPAOLA: “Qué cursi.”\nMATEO: “Pero estás sonriendo.”\nPAOLA: “No dije que no me gustara.”',()=>{const h=this.add.text(590,455,'♥',{fontSize:'40px',color:'#ff6fae'}).setOrigin(.5).setDepth(30);this.tweens.add({targets:h,y:420,scale:1.35,duration:650,yoyo:true,repeat:1});}),
      ()=>this.say('Una paloma los observa desde la oscuridad…',()=>{this.spawnBirds(2);const omen=this.add.circle(1050,260,12,0xff49b0,.7).setDepth(46);this.tweens.add({targets:omen,alpha:.1,scale:1.8,duration:500,yoyo:true,repeat:2,onComplete:()=>omen.destroy()});}),
      ()=>this.say('MATEO: “Eso ya no parece coincidencia.”\nPAOLA: “Quédate cerca.”',()=>{this.tweens.killTweensOf([this.paola,this.mateo]);this.paola.setFrame(0).setPosition(500,538).setScale(1.35);this.mateo.setFrame(0).setPosition(680,538).setScale(1.3).setAngle(0);this.spawnBirds(12);this.add.rectangle(640,360,1280,720,0x090512,.2).setDepth(23);this.cameras.main.shake(120,.002);}),
      ()=>this.say('PECHO PALOMA: “Al fin.”\nMATEO: “¿Al fin qué?”',()=>{this.villain.setAlpha(1);this.aura.setAlpha(1);this.spawnBirds(8,this.villain);for(let i=0;i<14;i++){const p=this.add.ellipse(900+Math.random()*330,420+Math.random()*180,4,9,0xff8fb9,.7).setDepth(25);this.tweens.add({targets:p,x:p.x-240,y:p.y-80,angle:220,alpha:0,duration:650+Math.random()*350,onComplete:()=>p.destroy()});}this.cameras.main.zoomTo(1.04,650,'Sine.easeOut');this.tweens.add({targets:[this.villain,this.aura],y:'-=35',duration:700,ease:'Back.easeOut'});this.playCue('magic');}),
      ()=>this.say('PECHO PALOMA: “Al fin te encuentro sin tanta gente alrededor.”\nPAOLA: “¿Lo conoces?”\nMATEO: “No.”'),
      ()=>this.say('PECHO PALOMA: “Pero yo sí lo conozco. Mateo… llevo mucho tiempo observándote.”\n“He visto cómo sonríes… y cómo siempre eliges estar con ella.”'),
      ()=>this.say('PAOLA: “Eso no es amor.”\nPECHO PALOMA: “Tú no decides lo que siento.”\nMATEO: “Y tú tampoco decides por mí.”'),
      ()=>this.say('PECHO PALOMA: “Entonces tendré que darte tiempo para entenderlo.”'),
      ()=>this.say('MATEO: “¡Paola!”\nPAOLA: “¡Mateo!”',()=>{this.paola.setFrame(5);this.tweens.add({targets:this.paola,x:610,duration:500});this.closeCage();}),
      ()=>this.say('CLANG.\nMATEO: “¡No la toques!”\nPECHO PALOMA: “Algún día me mirarás así a mí.”\nMATEO: “No.”',()=>{this.mateo.setFrame(3);this.tweens.add({targets:this.mateo,x:'+=7',duration:90,yoyo:true,repeat:5});}),
      ()=>this.say('Paola intenta alcanzarlo…',()=>this.magicPush()),
      ()=>this.say('PECHO PALOMA: “Entonces ven al castillo.”\nPAOLA: “¡NO TE VOY A DEJAR!”',()=>this.flyToCastle()),
      ()=>{},
      ()=>this.say('MATEO: “Paola va a venir.”\nPECHO PALOMA: “Eso espero.”'),
      ()=>this.showGardenResolve(),
      ()=>this.showTitle(),
    ];if(this.step<steps.length)steps[this.step++]();
  }

  showTitle(){if(this.locked)return;this.locked=true;this.dialogPanel.setVisible(false);[this.paola,this.mateo,this.villain,this.cage].filter(Boolean).forEach(o=>o.setVisible(false));this.text.setScrollFactor(0).setText('♥ RESCATE DE AMOR ♥\n\nUna aventura hecha con amor.\n\nATRAVIESA EL REINO\nENCUENTRA LAS 3 CARTAS\nRESCATA A MATEO\n\n[ COMENZAR RESCATE ]').setFontSize(29).setAlpha(1).setPosition(640,335).setDepth(110);this.text.setInteractive({useHandCursor:true}).once('pointerdown',()=>this.finish());this.input.keyboard.once('keydown-ENTER',()=>this.finish());this.input.keyboard.once('keydown-SPACE',()=>this.finish());}
  finish(){this.cameras.main.fadeOut(650,7,4,18);this.time.delayedCall(670,()=>this.scene.start('Level1Scene'));}
}
