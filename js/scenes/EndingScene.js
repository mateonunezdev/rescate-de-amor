import { FINAL_LETTER } from '../data/finalLetter.js?v=20260821-picnic-letter-25';
import { TextureFactory } from '../utils/TextureFactory.js?v=20260825-level-design-34';
import AudioManager from '../systems/AudioManager.js';
import { gameState } from '../config.js';
import UIManager from '../ui/UIManager.js?v=20260823-professional-polish-29';

export default class EndingScene extends Phaser.Scene {
  constructor(){super('EndingScene');}
  init(data){this.letterOnly=!!data?.letterOnly;}
  create(){
    this.audioManager=new AudioManager(this);this.audioManager.playMusic('endingMusic');
    this.uiManager=new UIManager(this,{hud:false});
    TextureFactory.createPlayerTexture(this);TextureFactory.createMateoTexture(this);TextureFactory.createGothicCageTexture(this);
    this.cameras.main.fadeIn(650,12,6,22);this.makeBackdrop();if(this.letterOnly){this.rescueOverlay={destroy(){}};this.showLetter();}else this.makeRescue();
    const collected=gameState.memories||[],cards=['card1','card2','card3'];gameState.finalLetterUnlocked=cards.every(c=>collected.includes(c));gameState.secretUnlocked=collected.filter(x=>!cards.includes(x)).length>=5;gameState.achievements=[...new Set([...(gameState.achievements||[]),'Nuestra historia','Amor verdadero'])];
  }
  makeBackdrop(){this.add.image(640,360,'bg-romantic').setDisplaySize(1280,720).setTint(0xffd6c2);this.add.rectangle(640,360,1280,720,0x491b3a,.22);for(let i=0;i<42;i++){const p=this.add.ellipse(Math.random()*1280,Math.random()*650,3,7,i%2?0xff7eae:0xffd0dc,.65);this.tweens.add({targets:p,y:p.y+90,x:p.x+(Math.random()-.5)*100,angle:180,duration:2200+Math.random()*2200,repeat:-1});}}
  makeRescue(){
    const finalMateo=true;
    this.villain=this.add.image(1080,535,'pecho-final',7).setScale(.88).setDepth(7);
    this.time.delayedCall(100,()=>this.assertUniqueCinematicCharacters());
    this.paola=this.add.image(390,555,'paola-final',9).setScale(.9).setDepth(10);this.mateo=this.add.image(880,555,'mateo-final',1).setScale(.88).setDepth(8);
    this.bars=this.add.image(880,510,'gothic-cage').setScale(.82).setDepth(12);
    const crown=this.add.text(1080,585,'♛',{fontSize:'42px',color:'#e5bb5d'}).setAngle(28).setOrigin(.5);this.add.text(1080,630,'PECHO PALOMA: “No... no puede ser.”',{fontFamily:'monospace',fontSize:'14px',color:'#df9abc'}).setOrigin(.5);
    this.dialog=this.add.text(640,115,'PAOLA: “El amor no se roba.”',{fontFamily:'monospace',fontSize:'25px',color:'#fff0d2',align:'center',stroke:'#32172f',strokeThickness:5}).setOrigin(.5);
    this.time.delayedCall(1100,()=>{this.tweens.add({targets:this.bars,y:300,alpha:0,duration:900,ease:'Cubic.easeIn'});this.dialog.setText('La celda se abre...');for(let i=0;i<7;i++){const bird=this.add.text(830+i*28,390+(i%2)*30,'🕊',{fontSize:'22px'});this.tweens.add({targets:bird,x:1350,y:100-i*15,alpha:0,duration:1500+i*90,onComplete:()=>bird.destroy()});}});
    this.time.delayedCall(2300,()=>{this.dialog.setText('MATEO: “Sabía que vendrías.”');if(finalMateo)this.mateo.setFrame(2);this.tweens.add({targets:this.mateo,x:670,duration:1000,ease:'Sine.easeInOut'});});
    this.time.delayedCall(3500,()=>{this.dialog.setText('PAOLA: “Siempre.”');this.tweens.add({targets:this.paola,x:590,duration:700,ease:'Sine.easeInOut'});});
    this.time.delayedCall(4300,()=>{this.dialog.setText('Por nosotros.');this.paola.setFlipX(false).setFrame(8).setX(605);this.mateo.setFlipX(true).setX(670);if(finalMateo)this.mateo.setFrame(3);for(let i=0;i<22;i++){const h=this.add.text(630+(Math.random()-.5)*150,500+Math.random()*80,Math.random()>.4?'♥':'🌹',{fontSize:`${14+Math.random()*18}px`,color:'#ff6fa8'}).setOrigin(.5).setDepth(20);this.tweens.add({targets:h,y:h.y-180,x:h.x+(Math.random()-.5)*80,alpha:0,duration:1300+Math.random()*800,onComplete:()=>h.destroy()});}this.assertUniqueCinematicCharacters();this.time.delayedCall(1300,()=>this.showEnvelope());});
  }
  countVisibleCharacter(textureKey){return this.children.list.filter(o=>o.visible&&o.texture?.key===textureKey).length;}
  assertUniqueCinematicCharacters(){const expected=[['paola-final','Paola'],['mateo-final','Mateo']];expected.forEach(([key,name])=>{const count=this.countVisibleCharacter(key);if(count!==1)console.error(`[ENDING QA] ${name}: se esperaba 1 sprite visible y hay ${count}`);});}
  showEnvelope(){
    this.rescueOverlay=this.add.container(0,0).setDepth(100);
    const shade=this.add.rectangle(640,360,1280,720,0x090510,.9).setInteractive({useHandCursor:true});
    const title=this.add.text(640,100,'CARTA FINAL DESBLOQUEADA ❤️',{fontFamily:'monospace',fontSize:'28px',color:'#ffe6aa',align:'center',stroke:'#4e1c42',strokeThickness:5}).setOrigin(.5);
    const cards=this.add.text(640,150,'💌  💌  💌',{fontSize:'25px'}).setOrigin(.5);
    const envelope=this.add.container(640,390).setScale(.3).setAlpha(0);
    const body=this.add.rectangle(0,0,380,225,0xf1d6aa).setStrokeStyle(8,0xbf6b72);const flap=this.add.triangle(0,-5,-184,-105,184,-105,0,75,0xe4bd8c).setStrokeStyle(4,0xbf6b72);const seal=this.add.text(0,45,'♥',{fontFamily:'monospace',fontSize:'48px',color:'#bd3b67'}).setOrigin(.5);const hint=this.add.text(0,155,'ABRIR',{fontFamily:'monospace',fontSize:'18px',color:'#fff',backgroundColor:'#79335e',padding:{x:22,y:10}}).setOrigin(.5).setInteractive({useHandCursor:true});envelope.add([body,flap,seal,hint]);this.rescueOverlay.add([shade,title,cards,envelope]);this.tweens.add({targets:envelope,scale:1,alpha:1,duration:600,ease:'Back.easeOut'});
    let opened=false;const cleanup=()=>{this.input.keyboard.off('keydown-ENTER',open);this.input.keyboard.off('keydown-SPACE',open);shade.removeInteractive();hint.removeInteractive();};const open=()=>{if(opened)return;opened=true;cleanup();this.tweens.add({targets:flap,scaleY:-.25,y:-105,duration:380,onComplete:()=>this.showLetter()});};shade.once('pointerdown',open);hint.once('pointerdown',open);this.input.keyboard.once('keydown-ENTER',open);this.input.keyboard.once('keydown-SPACE',open);this.events.once('shutdown',cleanup);
  }
  showLetter(){
    this.rescueOverlay.destroy();const layer=this.add.container(0,0).setDepth(110);this.letterLayer=layer;
    const shade=this.add.rectangle(640,360,1280,720,0x090510,.91);
    const warm=this.add.ellipse(640,350,900,620,0xffb06f,.08);
    const shadow=this.add.rectangle(650,370,760,560,0x000000,.38);
    const paper=this.add.rectangle(640,350,760,560,0xfff1d7).setStrokeStyle(8,0xd18a8b);
    const inner=this.add.rectangle(640,350,720,520,0,0).setStrokeStyle(3,0xe0b47d);
    const deco=this.add.text(640,94,'🌹  💌  🌹',{fontSize:'30px'}).setOrigin(.5);
    const viewport={x:292,y:125,w:696,h:438};
    const content=this.add.container(0,0);
    const letter=this.add.text(640,viewport.y+10,FINAL_LETTER,{fontFamily:'monospace',fontSize:'18px',color:'#51223b',align:'left',lineSpacing:9,wordWrap:{width:620}}).setOrigin(.5,0);
    const anniversary=this.add.text(640,letter.y+letter.height+34,'❤️ FELIZ ANIVERSARIO ❤️',{fontFamily:'monospace',fontSize:'20px',color:'#b93268',fontStyle:'bold'}).setOrigin(.5,0);
    const next=this.add.text(640,anniversary.y+58,'CONTINUAR ❤️',{fontFamily:'monospace',fontSize:'17px',color:'#fff',backgroundColor:'#78305d',padding:{x:20,y:10}}).setOrigin(.5,0).setInteractive({useHandCursor:true});
    content.add([letter,anniversary,next]);
    const maskShape=this.make.graphics({add:false});maskShape.fillStyle(0xffffff).fillRect(viewport.x,viewport.y,viewport.w,viewport.h);content.setMask(maskShape.createGeometryMask());
    const hint=this.add.text(640,592,'↕  RUEDA / ↑ ↓ / ARRASTRA PARA LEER',{fontFamily:'monospace',fontSize:'14px',color:'#8d5368'}).setOrigin(.5);
    const track=this.add.rectangle(1004,344,10,430,0x9a6175,.25).setStrokeStyle(1,0x8d5368,.6);
    const handle=this.add.rectangle(1004,160,14,70,0xb94e78,.9).setInteractive({useHandCursor:true,draggable:true});
    layer.add([shade,warm,shadow,paper,inner,deco,content,hint,track,handle]);layer.setScale(.85).setAlpha(0);this.tweens.add({targets:layer,scale:1,alpha:1,duration:420,ease:'Back.easeOut'});
    let scrollY=0,finished=false,dragStartY=0,dragStartScroll=0;
    const contentBottom=next.y+next.height+18,maxScroll=Math.max(0,contentBottom-(viewport.y+viewport.h));this.letterMaxScroll=maxScroll;
    const render=()=>{scrollY=Phaser.Math.Clamp(scrollY,0,maxScroll);this.letterScrollY=scrollY;content.y=-scrollY;const range=viewport.h-handle.height;handle.y=viewport.y+handle.height/2+(maxScroll?scrollY/maxScroll:0)*range;};
    const finish=()=>{if(finished)return;finished=true;cleanup();this.tweens.add({targets:layer,alpha:0,duration:300,onComplete:()=>{layer.destroy();this.showCompleted();}});};
    const move=amount=>{scrollY+=amount;render();};const onWheel=(pointer,objects,dx,dy)=>move(dy*.7);const onUp=()=>move(-48),onDown=()=>move(48),onPageUp=()=>move(-260),onPageDown=()=>move(260);
    const onDragStart=pointer=>{dragStartY=pointer.y;dragStartScroll=scrollY;};const onDrag=pointer=>{const range=viewport.h-handle.height;scrollY=dragStartScroll+(pointer.y-dragStartY)*(maxScroll/range);render();};
    const cleanup=()=>{this.input.off('wheel',onWheel);this.input.keyboard.off('keydown-UP',onUp);this.input.keyboard.off('keydown-DOWN',onDown);this.input.keyboard.off('keydown-PAGE_UP',onPageUp);this.input.keyboard.off('keydown-PAGE_DOWN',onPageDown);handle.off('dragstart',onDragStart);handle.off('drag',onDrag);next.removeAllListeners();maskShape.destroy();};
    next.once('pointerdown',finish);this.input.on('wheel',onWheel);this.input.keyboard.on('keydown-UP',onUp);this.input.keyboard.on('keydown-DOWN',onDown);this.input.keyboard.on('keydown-PAGE_UP',onPageUp);this.input.keyboard.on('keydown-PAGE_DOWN',onPageDown);handle.on('dragstart',onDragStart);handle.on('drag',onDrag);this.events.once('shutdown',cleanup);render();
  }
  showCompleted(){
    const shade=this.add.rectangle(640,360,1280,720,0x13091d,.38).setDepth(120);const continuation=this.add.text(640,205,'“Nuestra historia continúa…”',{fontFamily:'monospace',fontSize:'31px',color:'#ffe5af',stroke:'#71254f',strokeThickness:6}).setOrigin(.5).setDepth(122).setAlpha(0);for(let i=0;i<45;i++){const p=this.add.text(Math.random()*1280,-30-Math.random()*500,['♥','🌹','★','✦'][i%4],{fontSize:`${12+Math.random()*18}px`,color:i%2?'#ff82b4':'#ffe39a'}).setDepth(121);this.tweens.add({targets:p,y:760,x:p.x+(Math.random()-.5)*170,angle:(Math.random()-.5)*240,duration:2800+Math.random()*2500,repeat:1,delay:Math.random()*900,onComplete:()=>p.destroy()});}this.uiManager.showDialogueBubble('MATEO','Feliz aniversario, amor.',{x:820,y:430,tail:'right',duration:2200,width:500});this.time.delayedCall(2200,()=>this.uiManager.showDialogueBubble('PAOLA','❤️',{x:440,y:430,duration:1700,width:300}));this.time.delayedCall(3800,()=>this.tweens.add({targets:continuation,alpha:1,duration:800}));this.cameras.main.zoomTo(.9,6200,'Sine.easeInOut');this.time.delayedCall(6200,()=>{gameState.endingUnlocked=true;gameState.currentScene='SecretScene';localStorage.setItem('rescate-de-amor-save',JSON.stringify(gameState));this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start('SecretScene'));this.cameras.main.fadeOut(700,8,4,18);});
  }
}
