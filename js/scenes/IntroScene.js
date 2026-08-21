export default class IntroScene extends Phaser.Scene {
  constructor(){super('IntroScene');}

  create(){
    this.step=0;this.locked=false;this.birds=[];this.cameras.main.fadeIn(650,8,5,20);
    this.makeBirdTexture();this.makePark();
    this.paola=this.add.image(500,538,'paola-final',0).setScale(1.35).setDepth(20);
    this.mateo=this.add.image(680,538,'mateo-final',0).setScale(1.3).setFlipX(true).setDepth(20);
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
    this.add.image(640,360,'bg-romantic').setDisplaySize(1280,720).setDepth(-20);
    const sky=this.add.rectangle(640,360,1280,720,0x120920,.1).setDepth(-19);
    this.castle=this.add.container(1130,350).setDepth(5).setAlpha(.52);this.castle.add([this.add.rectangle(0,65,180,300,0x20182f).setStrokeStyle(5,0x50344e),this.add.rectangle(-105,95,80,240,0x241a34),this.add.rectangle(105,95,80,240,0x241a34),this.add.triangle(0,-125,-90,0,90,0,0,-150,0x321e3d),this.add.triangle(-105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.triangle(105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.rectangle(0,35,48,70,0xb53e83,.48).setStrokeStyle(4,0xe1a16e)]);
    const bench=this.add.container(590,580).setDepth(10);bench.add([this.add.rectangle(0,0,235,18,0x754936).setStrokeStyle(3,0xc58a5c),this.add.rectangle(0,-55,235,16,0x754936).setStrokeStyle(3,0xc58a5c),this.add.rectangle(-90,35,12,70,0x3b2930),this.add.rectangle(90,35,12,70,0x3b2930)]);for(let i=0;i<22;i++){const f=this.add.circle(Math.random()*1280,370+Math.random()*250,2,0xffe477,.8);this.tweens.add({targets:f,y:f.y-35,alpha:.18,duration:1200+Math.random()*1100,yoyo:true,repeat:-1});}
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
  }

  showGardenResolve(){
    this.locked=true;this.cameras.main.fadeOut(360,8,4,18);this.time.delayedCall(390,()=>{[this.castleLayer,this.innerMateo,this.innerVillain,this.innerBars].forEach(o=>o?.destroy());this.mateo.setVisible(false);this.villain.setVisible(false);this.aura.setVisible(false);this.cage?.setVisible(false);this.birds.forEach(b=>b.setVisible(false));this.paola.setVisible(true).setPosition(640,535).setAngle(0).setFrame(9);this.castle.setAlpha(.82);this.text.setText('PAOLA: “Voy a encontrarte.”\n\n“Y voy a traerte de vuelta.”');const h=this.add.text(640,440,'♥',{fontSize:'36px',color:'#ff6fae'}).setOrigin(.5).setDepth(50);this.tweens.add({targets:h,y:405,scale:1.3,duration:700,yoyo:true,repeat:1});this.cameras.main.fadeIn(500,8,4,18);this.locked=false;});
  }

  advance(){
    if(this.locked)return;const steps=[
      ()=>this.say('MATEO: “Me gustan estos momentos contigo.”\nPAOLA: “A mí también.”'),
      ()=>this.say('MATEO: “Contigo todo se siente diferente.”',()=>{const h=this.add.text(590,455,'♥',{fontSize:'40px',color:'#ff6fae'}).setOrigin(.5).setDepth(30);this.tweens.add({targets:h,y:420,scale:1.35,duration:650,yoyo:true,repeat:1});}),
      ()=>this.say('MATEO: “¿Desde cuándo hay tantas palomas aquí?”',()=>this.spawnBirds(3)),
      ()=>this.say('PAOLA: “No sé… pero esto no me gusta.”',()=>{this.spawnBirds(11);this.add.rectangle(640,360,1280,720,0x090512,.2).setDepth(23);this.cameras.main.shake(120,.002);}),
      ()=>this.say('PECHO PALOMA: “Qué escena tan adorable…”',()=>{this.villain.setAlpha(1);this.aura.setAlpha(1);this.spawnBirds(8,this.villain);this.tweens.add({targets:[this.villain,this.aura],y:'-=35',duration:700,ease:'Back.easeOut'});this.playCue('magic');}),
      ()=>this.say('PAOLA: “¿Quién eres?”\nPECHO PALOMA: “Pecho Paloma. Reina de las palomas.”'),
      ()=>this.say('PECHO PALOMA: “Y acabo de encontrar algo que quiero.”\nMATEO: “¿Qué?”'),
      ()=>this.say('MATEO: “¡Paola!”\nPAOLA: “¡Mateo!”',()=>{this.paola.setFrame(5);this.tweens.add({targets:this.paola,x:610,duration:500});this.closeCage();}),
      ()=>this.say('La jaula mágica se cierra.\nMATEO: “¡Paola!”',()=>{this.mateo.setFrame(3);this.tweens.add({targets:this.mateo,x:'+=7',duration:90,yoyo:true,repeat:5});}),
      ()=>this.say('Paola intenta alcanzarlo…',()=>this.magicPush()),
      ()=>this.say('PECHO PALOMA: “Si de verdad lo amas… ven por él.”',()=>this.flyToCastle()),
      ()=>{},
      ()=>this.say('MATEO: “Paola va a venir.”\nPECHO PALOMA: “Eso está por verse.”'),
      ()=>this.showGardenResolve(),
      ()=>this.showTitle(),
    ];if(this.step<steps.length)steps[this.step++]();
  }

  showTitle(){if(this.locked)return;this.locked=true;this.dialogPanel.setVisible(false);[this.paola,this.mateo,this.villain,this.cage].filter(Boolean).forEach(o=>o.setVisible(false));this.text.setScrollFactor(0).setText('♥ RESCATE DE AMOR ♥\n\nUna aventura hecha con amor.\n\nATRAVIESA EL REINO\nREÚNE LOS 5 RECUERDOS\nRESCATA A MATEO\n\n[ COMENZAR RESCATE ]').setFontSize(29).setAlpha(1).setPosition(640,335).setDepth(110);this.text.setInteractive({useHandCursor:true}).once('pointerdown',()=>this.finish());this.input.keyboard.once('keydown-ENTER',()=>this.finish());this.input.keyboard.once('keydown-SPACE',()=>this.finish());}
  finish(){this.cameras.main.fadeOut(650,7,4,18);this.time.delayedCall(670,()=>this.scene.start('Level1Scene'));}
}
