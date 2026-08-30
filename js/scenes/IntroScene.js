import { createMateoCageRig } from '../utils/CageRig.js?v=20260826-cage-rig-35';
import UIManager from '../ui/UIManager.js?v=20260830-intro-level1-02';

export default class IntroScene extends Phaser.Scene {
  constructor(){super('IntroScene');}

  create(){
    this.step=0;this.locked=false;this.birds=[];this.cameras.main.fadeIn(650,8,5,20);this.cameras.main.setZoom(.96);this.cameras.main.zoomTo(1.03,4800,'Sine.easeInOut');this.cameras.main.pan(600,400,4800,'Sine.easeInOut');
    this.cinematicUi=new UIManager(this,{hud:false});
    this.makeBirdTexture();this.makePark();
    this.paola=this.add.image(515,570,'paola-final',4).setScale(1.08).setDepth(20);
    this.mateo=this.add.image(665,568,'mateo-final',2).setScale(1.06).setFlipX(true).setAngle(-3).setDepth(20);
    this.tweens.add({targets:this.paola,scaleY:1.095,scaleX:1.073,duration:1150,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});this.tweens.add({targets:this.mateo,scaleY:1.075,scaleX:1.045,duration:1320,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
    this.villain=this.add.image(1370,370,'pecho-final',0).setScale(1.32).setAlpha(0).setDepth(27);
    this.aura=this.add.circle(1370,370,110,0xd93b9a,.16).setAlpha(0).setDepth(26);
    this.prompt=this.add.text(640,686,'ENTER · ESPACIO · CLIC',{fontFamily:'monospace',fontSize:'14px',color:'#ead0e2'}).setOrigin(.5).setDepth(95);
    this.skip=this.add.text(1165,34,'SALTAR INTRO',{fontFamily:'monospace',fontSize:'14px',color:'#e3c8db'}).setOrigin(.5).setDepth(96).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.showTitle());
    this.showOpening();const next=()=>this.cinematicUi.activeDialogue?.active?this.cinematicUi.activeDialogue.advance():this.advance();this.input.keyboard.on('keydown-ENTER',next);this.input.keyboard.on('keydown-SPACE',next);this.input.on('pointerdown',(p,targets)=>{if(!targets.includes(this.skip)&&!targets.some(t=>t.name==='dialogue-hit'))next();});
  }

  showOpening(){this.locked=true;this.prompt.setVisible(false);const layer=this.add.container(0,0).setDepth(200),black=this.add.rectangle(640,360,1280,720,0x050309,1),card=this.add.graphics(),date=this.add.text(640,310,'19 • 09 • 2025',{fontFamily:'monospace',fontSize:'29px',color:'#ffe5b4',letterSpacing:4}).setOrigin(.5).setAlpha(0),copy=this.add.text(640,390,'“Hay historias que comienzan\nsin saber hasta dónde llegarán...”',{fontFamily:'monospace',fontSize:'22px',color:'#f7dce8',align:'center',lineSpacing:10}).setOrigin(.5).setAlpha(0);card.fillStyle(0x291628,.94).fillRect(345,260,590,190).fillStyle(0xe3af70,1).fillRect(355,270,570,4).fillRect(355,436,570,4);layer.add([black,card,date,copy]);card.setAlpha(0);this.tweens.add({targets:[card,date],alpha:1,duration:700});this.tweens.add({targets:copy,alpha:1,duration:900,delay:750});this.time.delayedCall(3400,()=>this.tweens.add({targets:layer,alpha:0,duration:900,onComplete:()=>{layer.destroy();this.prompt.setVisible(true);this.locked=false;this.advance();}}));}

  makeBirdTexture(){const g=this.add.graphics();g.fillStyle(0xf8f3f5,1);g.fillEllipse(15,12,20,12);g.fillCircle(22,8,7);g.fillTriangle(27,8,35,11,27,13);g.fillTriangle(14,10,2,1,6,14);g.fillStyle(0x252136,1);g.fillRect(23,6,2,2);g.generateTexture('intro-pigeon',36,20);g.destroy();}

  makePark(){
    this.add.image(640,360,'bg-picnic').setDisplaySize(1280,720).setDepth(-20);
    const sky=this.add.rectangle(640,360,1280,720,0x7f2940,.06).setDepth(-19);
    this.castle=this.add.container(1130,350).setDepth(5).setAlpha(.52);this.castle.add([this.add.rectangle(0,65,180,300,0x20182f).setStrokeStyle(5,0x50344e),this.add.rectangle(-105,95,80,240,0x241a34),this.add.rectangle(105,95,80,240,0x241a34),this.add.triangle(0,-125,-90,0,90,0,0,-150,0x321e3d),this.add.triangle(-105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.triangle(105,-45,-48,10,48,10,0,-80,0x321e3d),this.add.rectangle(0,35,48,70,0xb53e83,.48).setStrokeStyle(4,0xe1a16e)]);
    for(let i=0;i<26;i++){const f=this.add.circle(Math.random()*1280,350+Math.random()*270,2,0xffe477,.8).setDepth(12);this.tweens.add({targets:f,y:f.y-35,x:f.x+(Math.random()-.5)*24,alpha:.18,duration:1200+Math.random()*1100,yoyo:true,repeat:-1});}for(let i=0;i<18;i++){const p=this.add.ellipse(Math.random()*1280,120+Math.random()*430,3,7,i%2?0xff9cbd:0xffdf9d,.55).setDepth(13).setAngle(Math.random()*180);this.tweens.add({targets:p,x:p.x-70-Math.random()*80,y:p.y+35,angle:p.angle+180,duration:2600+Math.random()*2200,repeat:-1});}
  }

  spawnBirds(count,target=null){for(let i=0;i<count;i++){const b=this.add.image(1320+i*35,260+(i%5)*48,'intro-pigeon').setScale(1.1).setDepth(44);this.birds.push(b);if(target){const a=i/count*Math.PI*2;b.setPosition(target.x+Math.cos(a)*115,target.y+Math.sin(a)*85);this.tweens.add({targets:b,angle:360,duration:520+i*18,repeat:-1});}else this.tweens.add({targets:b,x:-70,y:b.y+(i%2?70:-30),duration:2300+i*80,ease:'Linear'});}}
  say(copy,action){action?.();const lines=String(copy).split('\n').map(s=>s.trim()).filter(Boolean);this.locked=true;const nextLine=()=>{const raw=lines.shift();if(!raw){this.locked=false;return;}const match=raw.match(/^([^:]+):\s*[“\"]?(.*?)[”\"]?$/),speaker=match?match[1]:'NARRADOR',line=match?match[2]:raw,isPecho=speaker.includes('PECHO'),isMateo=speaker==='MATEO',x=isPecho?920:isMateo?735:speaker==='PAOLA'?455:640,y=isPecho?315:isMateo?430:speaker==='PAOLA'?435:205;this.cinematicUi.showDialogueBubble(speaker,line,{x,y,width:speaker==='NARRADOR'?430:390,tail:isPecho||isMateo?'right':'left',variant:isPecho?'pecho':speaker==='NARRADOR'?'thought':'love',duration:0,keyboard:false,onAdvance:nextLine});};nextLine();}
  bubble(speaker,line,x,y,tail='left',duration=1050){return this.cinematicUi.showDialogueBubble(speaker,line,{x,y,width:360,tail,duration,variant:speaker==='PECHO PALOMA'?'pecho':'love',keyboard:false});}
  magicSpark(x,y,delay=0){
    const spark=this.add.text(x,y,Math.random()>.45?'♥':'✦',{fontFamily:'monospace',fontSize:`${14+Math.floor(Math.random()*10)}px`,color:Math.random()>.5?'#ff79c5':'#c681ff',stroke:'#4b164d',strokeThickness:2}).setOrigin(.5).setDepth(49).setAlpha(0);
    this.tweens.add({targets:spark,alpha:{from:0,to:1},x:x+(Math.random()-.5)*90,y:y-55-Math.random()*55,angle:(Math.random()-.5)*90,scale:{from:.45,to:1.15},duration:650,delay,yoyo:true,onComplete:()=>spark.destroy()});
  }
  playCue(type){try{const c=this.sound.context,o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=type==='hit'?'sawtooth':'sine';o.frequency.setValueAtTime(type==='magic'?190:430,c.currentTime);o.frequency.exponentialRampToValueAtTime(type==='magic'?70:160,c.currentTime+.35);g.gain.setValueAtTime(.035,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4);o.start();o.stop(c.currentTime+.42);}catch(e){}}

  closeCage(){
    this.tweens.killTweensOf(this.mateo);this.cageRig=createMateoCageRig(this,this.mateo.x,this.mateo.y-28,{mateo:this.mateo,frame:1,depth:40,locked:true}).setScale(.2);this.mateo=this.cageRig.mateo.setFrame(1);this.cageRig.cage.scaleY=.02;this.playCue('magic');this.cameras.main.shake(260,.006);this.tweens.add({targets:this.cageRig,scale:1,duration:520,ease:'Back.easeOut'});this.tweens.add({targets:this.cageRig.cage,scaleY:.7,duration:520,delay:250,ease:'Bounce.easeOut'});const ring=this.add.ellipse(this.cageRig.x,this.cageRig.y+45,190,58,0xff4faf,.18).setStrokeStyle(6,0xff77c0).setDepth(18);this.tweens.add({targets:ring,scale:1.5,alpha:0,duration:850,repeat:1,onComplete:()=>ring.destroy()});this.spawnBirds(12,this.cageRig);
  }
  paolaAttemptsCage(){
    this.locked=true;this.prompt.setText('PAOLA CORRE HACIA MATEO…');this.paola.setFrame(2).setFlipX(false);
    this.time.delayedCall(3300,()=>{this.locked=false;this.prompt.setText('ENTER · ESPACIO · CLIC');});
    this.bubble('PAOLA','¡Mateo!',470,435,'right',900);
    this.time.delayedCall(420,()=>this.bubble('MATEO','¡Paola!',740,405,'left',900));
    this.tweens.add({targets:this.paola,x:this.cageRig.x-105,y:538,duration:560,ease:'Sine.easeOut',onComplete:()=>{
      this.paola.setFrame(7);this.bubble('PAOLA','¡Voy a sacarte de ahí!',450,430,'right',1200);
      this.time.delayedCall(520,()=>this.bubble('MATEO','¡Cuidado!',745,410,'left',900));
      [0,520,1040].forEach((delay,index)=>this.time.delayedCall(delay,()=>{
        this.paola.setFrame(index%2?8:7);this.tweens.add({targets:this.paola,x:this.cageRig.x-89,duration:115,yoyo:true,ease:'Sine.easeInOut'});
        this.tweens.add({targets:this.cageRig,x:this.cageRig.x+(index%2?-6:6),angle:index%2?-1.1:1.1,duration:70,yoyo:true,repeat:2,onComplete:()=>this.cageRig.setAngle(0)});
        this.tweens.add({targets:this.cageRig.glow,alpha:.66,scale:1.12,duration:120,yoyo:true});
        this.cameras.main.shake(90,.0018);this.playCue('hit');
      }));
      this.time.delayedCall(1570,()=>{this.paola.setFrame(5);this.bubble('PAOLA','¡No se abre!',455,430,'right',1250);});
    }});
  }
  magicPush(){
    this.locked=true;this.prompt.setText('LA MAGIA RODEA LA JAULA…');this.villain.setVisible(true).setAlpha(1);this.aura.setVisible(true).setAlpha(1);
    this.tweens.add({targets:[this.villain,this.aura],x:this.cageRig.x+205,y:this.cageRig.y-115,duration:520,ease:'Sine.easeOut'});
    this.bubble('PECHO PALOMA','Es inútil. Ahora viene conmigo.',885,390,'left',1500);
    this.time.delayedCall(600,()=>this.bubble('PAOLA','¡Déjalo!',455,430,'right',1050));
    for(let i=0;i<20;i++)this.magicSpark(this.cageRig.x+(Math.random()-.5)*150,this.cageRig.y+80+Math.random()*80,i*65);
    const wave=this.add.circle(this.cageRig.x,this.cageRig.y,45,0xff5ab0,.12).setStrokeStyle(7,0xffa0d1,.75).setDepth(48);this.tweens.add({targets:wave,scale:4,alpha:0,duration:900,onComplete:()=>wave.destroy()});
    this.tweens.add({targets:this.cageRig.glow,alpha:.78,scale:1.3,duration:350,yoyo:true,repeat:2});
    this.tweens.add({targets:this.cageRig,angle:1.2,duration:80,yoyo:true,repeat:5,onComplete:()=>this.cageRig.setAngle(0)});
    this.time.delayedCall(650,()=>{this.playCue('magic');this.cameras.main.shake(220,.003);this.tweens.add({targets:this.cageRig,y:this.cageRig.y-105,x:this.cageRig.x+25,duration:1250,ease:'Sine.easeInOut'});this.paola.setFrame(2);this.tweens.add({targets:this.paola,x:this.cageRig.x-85,duration:1050,ease:'Sine.easeInOut'});});
    this.time.delayedCall(2250,()=>{this.paola.setFrame(5);this.locked=false;this.prompt.setText('ENTER · ESPACIO · CLIC');});
  }

  flyToCastle(){
    this.locked=true;this.prompt.setText('LA JAULA VUELA HACIA EL CASTILLO…');this.villain.setVisible(true).setAlpha(1).setFrame(1);this.aura.setVisible(true).setAlpha(1);this.paola.setFrame(2);this.bubble('PAOLA','¡MATEO!',510,420,'right',1350);this.time.delayedCall(450,()=>this.bubble('MATEO','¡PAOLA!',790,345,'left',1350));this.tweens.add({targets:this.paola,x:820,duration:2300,ease:'Sine.easeInOut',onComplete:()=>this.paola.setFrame(5)});this.tweens.add({targets:this.cageRig,x:1080,y:215,duration:3100,ease:'Sine.easeInOut'});this.tweens.add({targets:[this.villain,this.aura],x:1160,y:195,duration:3000,ease:'Sine.easeInOut'});for(let i=0;i<18;i++)this.time.delayedCall(i*150,()=>this.magicSpark(this.cageRig.x-20,this.cageRig.y+90));this.birds.forEach((b,i)=>this.tweens.add({targets:b,x:1030+(i%5)*35,y:150+(i%4)*40,duration:2400+i*45,ease:'Sine.easeInOut'}));this.cameras.main.pan(760,330,2500,'Sine.easeInOut');this.cameras.main.zoomTo(1.08,2500,'Sine.easeInOut');this.time.delayedCall(3100,()=>this.cameras.main.fadeOut(240,8,4,18));this.time.delayedCall(3400,()=>{this.cameras.main.fadeIn(380,8,4,18);this.locked=false;this.prompt.setText('ENTER · ESPACIO · CLIC');this.showCastleInterior();});
  }

  showCastleInterior(){
    this.step=12;this.castleLayer=this.add.container(0,0).setScrollFactor(0).setDepth(80);this.castleLayer.add(this.add.rectangle(640,360,1280,720,0x171021));for(let x=70;x<1280;x+=150)this.castleLayer.add(this.add.rectangle(x,390,90,520,0x271b34).setStrokeStyle(3,0x5b3b55));this.castleLayer.add(this.add.rectangle(640,625,1280,170,0x30233b).setStrokeStyle(7,0x76506c));this.innerCageRig=createMateoCageRig(this,500,495,{frame:1,mateoScale:1.02,cageScale:.72,depth:85,locked:true}).setScrollFactor(0);this.innerVillain=this.add.image(760,490,'pecho-final',0).setScale(1.35).setScrollFactor(0).setDepth(84);this.cameras.main.setZoom(1).centerOn(640,360);this.prompt.setScrollFactor(0).setDepth(95);this.skip.setScrollFactor(0).setDepth(96);this.bubble('PECHO PALOMA','Bienvenido a mi reino.',850,360,'right',2100);
    this.step=14;
  }

  showGardenResolve(){
    this.locked=true;this.cameras.main.fadeOut(360,8,4,18);this.time.delayedCall(390,()=>{[this.castleLayer,this.innerCageRig,this.innerVillain].forEach(o=>o?.destroy());this.cageRig?.setVisible(false);this.villain.setVisible(false);this.aura.setVisible(false);this.birds.forEach(b=>b.setVisible(false));this.paola.setVisible(true).setPosition(640,535).setAngle(0).setFrame(9);this.castle.setAlpha(.82);const h=this.add.text(640,440,'♥',{fontSize:'36px',color:'#ff6fae'}).setOrigin(.5).setDepth(50);this.tweens.add({targets:h,y:405,scale:1.3,duration:700,yoyo:true,repeat:1});this.cameras.main.fadeIn(500,8,4,18);this.locked=false;this.say('PAOLA: “Voy a encontrarte.”\nPAOLA: “Y voy a traerte de vuelta.”');});
  }

  advance(){
    if(this.locked)return;const steps=[
      ()=>this.say('MATEO: “Llevaba días queriendo traerte aquí.”\nPAOLA: “¿Y tanto misterio era por esto?”'),
      ()=>this.say('MATEO: “Por esto… y por estar contigo.”\nPAOLA: “Qué cursi.”\nMATEO: “Pero estás sonriendo.”\nPAOLA: “No dije que no me gustara.”',()=>{const h=this.add.text(590,455,'♥',{fontSize:'40px',color:'#ff6fae'}).setOrigin(.5).setDepth(30);this.tweens.add({targets:h,y:420,scale:1.35,duration:650,yoyo:true,repeat:1});}),
      ()=>this.say('Una paloma los observa desde la oscuridad…',()=>{this.spawnBirds(2);const omen=this.add.circle(1050,260,12,0xff49b0,.7).setDepth(46);this.tweens.add({targets:omen,alpha:.1,scale:1.8,duration:500,yoyo:true,repeat:2,onComplete:()=>omen.destroy()});}),
      ()=>this.say('MATEO: “Eso ya no parece coincidencia.”\nPAOLA: “Quédate cerca.”',()=>{this.tweens.killTweensOf([this.paola,this.mateo]);this.paola.setFrame(0).setPosition(500,538).setScale(1.35);this.mateo.setFrame(0).setPosition(680,538).setScale(1.3).setAngle(0);this.spawnBirds(12);this.add.rectangle(640,360,1280,720,0x090512,.2).setDepth(23);this.cameras.main.shake(120,.002);}),
      ()=>this.say('PECHO PALOMA: “Al fin.”\nMATEO: “¿Al fin qué?”',()=>{this.villain.setAlpha(1);this.aura.setAlpha(1);this.spawnBirds(8);for(let i=0;i<14;i++){const p=this.add.ellipse(900+Math.random()*330,420+Math.random()*180,4,9,0xff8fb9,.7).setDepth(25);this.tweens.add({targets:p,x:p.x-240,y:p.y-80,angle:220,alpha:0,duration:650+Math.random()*350,onComplete:()=>p.destroy()});}this.cameras.main.zoomTo(1.04,650,'Sine.easeOut');this.tweens.add({targets:[this.villain,this.aura],x:1030,y:335,duration:900,ease:'Back.easeOut',onComplete:()=>{this.cameras.main.shake(110,.0025);this.spawnBirds(8,this.villain);}});this.playCue('magic');}),
      ()=>this.say('PECHO PALOMA: “Al fin te encuentro sin tanta gente alrededor.”\nPAOLA: “¿Lo conoces?”\nMATEO: “No.”'),
      ()=>this.say('PECHO PALOMA: “Pero yo sí lo conozco. Mateo… llevo mucho tiempo observándote.”\n“He visto cómo sonríes… y cómo siempre eliges estar con ella.”'),
      ()=>this.say('PAOLA: “Eso no es amor.”\nPECHO PALOMA: “Tú no decides lo que siento.”\nMATEO: “Y tú tampoco decides por mí.”'),
      ()=>this.say('PECHO PALOMA: “Entonces tendré que darte tiempo para entenderlo.”'),
      ()=>this.say('MATEO: “¡Paola!”\nPAOLA: “¡Mateo!”',()=>{this.paola.setFrame(5);this.tweens.add({targets:this.paola,x:610,duration:500});this.closeCage();}),
      ()=>this.say('CLANG.\nMATEO: “¡No la toques!”\nPECHO PALOMA: “Algún día me mirarás así a mí.”\nMATEO: “No.”',()=>{this.mateo.setFrame(3);this.tweens.add({targets:this.mateo,x:'+=7',duration:90,yoyo:true,repeat:5});this.paolaAttemptsCage();}),
      ()=>this.say('Paola intenta alcanzarlo…',()=>this.magicPush()),
      ()=>this.say('PECHO PALOMA: “Entonces ven al castillo.”\nPAOLA: “¡NO TE VOY A DEJAR!”',()=>this.flyToCastle()),
      ()=>{},
      ()=>this.say('MATEO: “Paola va a venir.”\nPECHO PALOMA: “Eso espero.”'),
      ()=>this.showGardenResolve(),
      ()=>this.showTitle(),
    ];if(this.step<steps.length)steps[this.step++]();
  }

  showTitle(){if(this.locked)return;this.locked=true;this.cinematicUi.activeDialogue?.dismiss?.(true);[this.paola,this.villain,this.cageRig].filter(Boolean).forEach(o=>o.setVisible(false));const title=this.add.text(640,315,'RESCATE DE AMOR ❤️\n\nPor ti, hasta el final.',{fontFamily:'monospace',fontSize:'35px',color:'#fff0cd',align:'center',lineSpacing:12,stroke:'#5b1e49',strokeThickness:7}).setOrigin(.5).setDepth(110).setAlpha(0),start=this.add.text(640,465,'[ COMENZAR RESCATE ]',{fontFamily:'monospace',fontSize:'20px',color:'#fff',backgroundColor:'#722752',padding:{x:18,y:10}}).setOrigin(.5).setDepth(111).setAlpha(0).setInteractive({useHandCursor:true}).once('pointerdown',()=>this.finish());this.tweens.add({targets:[title,start],alpha:1,duration:800});this.input.keyboard.once('keydown-ENTER',()=>this.finish());this.input.keyboard.once('keydown-SPACE',()=>this.finish());}
  finish(){this.cameras.main.fadeOut(650,7,4,18);this.time.delayedCall(670,()=>this.scene.start('Level1Scene'));}
}
