import { FINAL_LETTER } from '../data/finalLetter.js?v=20260821-picnic-letter-25';
import { TextureFactory } from '../utils/TextureFactory.js?v=20260826-cage-rig-35';
import AudioManager from '../systems/AudioManager.js';
import { gameState } from '../config.js';
import UIManager from '../ui/UIManager.js?v=20260830-dialogue-layout-04';
import { createMateoCageRig } from '../utils/CageRig.js?v=20260826-cage-rig-35';
import Player from '../entities/Player.js?v=20260829-definitive-polish-01';

export default class EndingScene extends Phaser.Scene {
  constructor(){super('EndingScene');}
  init(data){this.letterOnly=!!data?.letterOnly;}
  create(){
    this.audioManager=new AudioManager(this);this.audioManager.playMusic('endingMusic');
    this.uiManager=new UIManager(this,{hud:false});
    TextureFactory.createPlayerTexture(this);TextureFactory.createMateoTexture(this);
    this.cameras.main.fadeIn(650,12,6,22);this.makeBackdrop();if(this.letterOnly){this.rescueOverlay={destroy(){}};this.showLetter();}else this.makeRescue();
    const collected=gameState.memories||[],cards=['card1','card2','card3'];gameState.finalLetterUnlocked=cards.every(c=>collected.includes(c));gameState.secretUnlocked=collected.filter(x=>!cards.includes(x)).length>=5;gameState.achievements=[...new Set([...(gameState.achievements||[]),'Nuestra historia','Amor verdadero'])];
  }
  makeBackdrop(){this.add.image(640,360,'bg-romantic').setDisplaySize(1280,720).setTint(0xffd6c2);this.add.rectangle(640,360,1280,720,0x491b3a,.22);for(let i=0;i<42;i++){const p=this.add.ellipse(Math.random()*1280,Math.random()*650,3,7,i%2?0xff7eae:0xffd0dc,.65);this.tweens.add({targets:p,y:p.y+90,x:p.x+(Math.random()-.5)*100,angle:180,duration:2200+Math.random()*2200,repeat:-1});}}
  makeRescue(){
    this.rescuePlayable=true;const ground=this.add.rectangle(640,625,1280,90,0x000000,0);this.physics.add.existing(ground,true);this.player=new Player(this,150,535);this.player.health=5;this.player.maxHealth=5;this.player.setDepth(15);this.physics.add.collider(this.player,ground);this.paola=this.player;
    this.mateoCageRig=createMateoCageRig(this,965,500,{frame:1,mateoScale:.88,cageScale:.68,depth:18,locked:true});this.mateo=this.mateoCageRig.mateo;this.bars=this.mateoCageRig.cage;
    this.dialog=this.add.text(640,100,'ROMPE LAS TRES CADENAS MÁGICAS',{fontFamily:'monospace',fontSize:'25px',color:'#fff0d2',align:'center',stroke:'#32172f',strokeThickness:5}).setOrigin(.5).setDepth(50);
    this.chains=[['RECUERDOS',500,0x78bfff],['CONFIANZA',660,0xc889ff],['AMOR ❤️',820,0xff5fa8]].map(([name,x,color])=>{const link=this.add.image(x,540,'environment-atlas',16).setDisplaySize(72,150).setTint(color).setDepth(19).setInteractive({useHandCursor:true}),label=this.add.text(x,445,name,{fontFamily:'monospace',fontSize:'14px',color:'#ffe9c9',backgroundColor:'#32172f',padding:{x:7,y:4}}).setOrigin(.5).setDepth(20),chain={name,x,link,label,broken:false};link.on('pointerdown',()=>this.breakChain(chain,true));return chain;});
    this.prompt=this.add.text(640,675,'E · ROMPER CADENA',{fontFamily:'monospace',fontSize:'17px',color:'#fff',backgroundColor:'#702553',padding:{x:14,y:8}}).setOrigin(.5).setDepth(50).setVisible(false);this.input.keyboard.on('keydown-E',()=>this.breakNearbyChain());this.uiManager.showDialogueBubble('MATEO','¡Paola! Las cadenas reaccionan a ti.',{x:900,y:365,tail:'right',duration:2300,width:500});this.time.delayedCall(80,()=>this.assertUniqueCinematicCharacters());
  }
  breakNearbyChain(){const chain=this.chains?.find(c=>!c.broken&&Math.abs(this.player.x-c.x)<105);if(chain)this.breakChain(chain);}
  breakChain(chain,fromTouch=false){if(!this.rescuePlayable||chain.broken)return;if(fromTouch&&Math.abs(this.player.x-chain.x)>=150)return;chain.broken=true;chain.link.disableInteractive();this.cameras.main.shake(100,.004);this.tweens.add({targets:[chain.link,chain.label],alpha:0,y:'+=50',angle:18,duration:420,onComplete:()=>{chain.link.destroy();chain.label.destroy();}});this.uiManager.showDialogueBubble('PAOLA',chain.name,{x:520,y:410,duration:1100,width:340});if(this.chains.every(c=>c.broken))this.openCage();}
  openCage(){this.rescuePlayable=false;this.prompt.setVisible(false);this.mateoCageRig.setLocked(false);this.tweens.add({targets:this.bars,x:100,alpha:.24,duration:850});this.dialog.setText('LA JAULA ESTÁ ABIERTA');this.time.delayedCall(900,()=>{const world=this.mateoCageRig.getWorldTransformMatrix();this.mateoCageRig.remove(this.mateo);this.add.existing(this.mateo);this.mateo.setPosition(world.tx,world.ty+24).setFrame(2).setDepth(20);this.tweens.add({targets:this.mateo,x:690,duration:900});this.tweens.add({targets:this.player,x:610,duration:900,onComplete:()=>{this.player.setFrame(8);this.mateo.setFrame(3).setFlipX(true);this.dialog.setText('MATEO: “Sabía que vendrías.”\nPAOLA: “Siempre.”');for(let i=0;i<25;i++){const h=this.add.text(650+(Math.random()-.5)*160,520+Math.random()*70,i%3?'♥':'🌹',{fontSize:'20px',color:'#ff72ad'}).setDepth(25);this.tweens.add({targets:h,y:h.y-190,alpha:0,duration:1400+Math.random()*500,onComplete:()=>h.destroy()});}this.time.delayedCall(2400,()=>this.showEnvelope());}});});}
  update(time,delta){if(this.rescuePlayable&&this.player){this.player.update(time,delta);const near=this.chains?.some(c=>!c.broken&&Math.abs(this.player.x-c.x)<105);this.prompt?.setVisible(!!near);}}
  countVisibleCharacter(textureKey){let count=0;const visit=o=>{if(o.visible&&o.texture?.key===textureKey)count++;o.list?.forEach(visit);};this.children.list.forEach(visit);return count;}
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
    const handle=this.add.rectangle(1004,160,14,70,0xb94e78,.9).setInteractive({useHandCursor:true,draggable:true});this.input.setDraggable(handle);
    const touchZone=this.add.zone(viewport.x+viewport.w/2,viewport.y+viewport.h/2,viewport.w,viewport.h).setInteractive({useHandCursor:true});
    layer.add([shade,warm,shadow,paper,inner,deco,content,touchZone,hint,track,handle]);layer.setScale(.85).setAlpha(0);this.tweens.add({targets:layer,scale:1,alpha:1,duration:420,ease:'Back.easeOut'});
    let scrollY=0,finished=false,dragStartY=0,dragStartScroll=0,touchDragging=false;
    const contentBottom=next.y+next.height+18,maxScroll=Math.max(0,contentBottom-(viewport.y+viewport.h));this.letterMaxScroll=maxScroll;
    const render=()=>{scrollY=Phaser.Math.Clamp(scrollY,0,maxScroll);this.letterScrollY=scrollY;content.y=-scrollY;const range=viewport.h-handle.height;handle.y=viewport.y+handle.height/2+(maxScroll?scrollY/maxScroll:0)*range;};
    const finish=()=>{if(finished)return;finished=true;cleanup();this.tweens.add({targets:layer,alpha:0,duration:300,onComplete:()=>{layer.destroy();this.showCompleted();}});};
    const move=amount=>{scrollY+=amount;render();};const onWheel=(pointer,objects,dx,dy)=>move(dy*.7);const onUp=()=>move(-48),onDown=()=>move(48),onPageUp=()=>move(-260),onPageDown=()=>move(260);
    const onDragStart=pointer=>{dragStartY=pointer.y;dragStartScroll=scrollY;};const onDrag=pointer=>{const range=viewport.h-handle.height;scrollY=dragStartScroll+(pointer.y-dragStartY)*(maxScroll/range);render();};
    const onTouchDown=pointer=>{touchDragging=true;dragStartY=pointer.y;dragStartScroll=scrollY;};const onTouchMove=pointer=>{if(touchDragging&&pointer.isDown){scrollY=dragStartScroll-(pointer.y-dragStartY);render();}};const onTouchUp=()=>{touchDragging=false;};
    const cleanup=()=>{this.input.off('wheel',onWheel);this.input.off('pointermove',onTouchMove);this.input.off('pointerup',onTouchUp);this.input.keyboard.off('keydown-UP',onUp);this.input.keyboard.off('keydown-DOWN',onDown);this.input.keyboard.off('keydown-PAGE_UP',onPageUp);this.input.keyboard.off('keydown-PAGE_DOWN',onPageDown);handle.off('dragstart',onDragStart);handle.off('drag',onDrag);touchZone.off('pointerdown',onTouchDown);next.removeAllListeners();maskShape.destroy();};
    next.once('pointerdown',finish);touchZone.on('pointerdown',onTouchDown);this.input.on('pointermove',onTouchMove);this.input.on('pointerup',onTouchUp);this.input.on('wheel',onWheel);this.input.keyboard.on('keydown-UP',onUp);this.input.keyboard.on('keydown-DOWN',onDown);this.input.keyboard.on('keydown-PAGE_UP',onPageUp);this.input.keyboard.on('keydown-PAGE_DOWN',onPageDown);handle.on('dragstart',onDragStart);handle.on('drag',onDrag);this.events.once('shutdown',cleanup);render();
  }
  showCompleted(){
    const shade=this.add.rectangle(640,360,1280,720,0x13091d,.48).setDepth(120),center=this.add.text(640,230,'',{fontFamily:'monospace',fontSize:'42px',color:'#fff0cf',align:'center',stroke:'#71254f',strokeThickness:7}).setOrigin(.5).setDepth(123).setAlpha(0),credits=this.add.text(640,370,'',{fontFamily:'monospace',fontSize:'18px',color:'#ffe1bc',align:'center',lineSpacing:9}).setOrigin(.5).setDepth(123).setAlpha(0);
    const petal=()=>{const p=this.add.text(Math.random()*1280,-30,['♥','🌹','★','✦'][Math.floor(Math.random()*4)],{fontSize:`${12+Math.random()*18}px`,color:Math.random()>.5?'#ff82b4':'#ffe39a'}).setDepth(121);this.tweens.add({targets:p,y:760,x:p.x+(Math.random()-.5)*170,angle:(Math.random()-.5)*240,duration:2800+Math.random()*2200,onComplete:()=>p.destroy()});};petal();this.time.delayedCall(850,()=>{for(let i=0;i<54;i++)this.time.delayedCall(i*55,petal);});
    const show=(text,size,duration=1550)=>{center.setText(text).setFontSize(size).setAlpha(0).setScale(.78);this.tweens.add({targets:center,alpha:1,scale:1,duration:450,ease:'Back.easeOut'});this.time.delayedCall(duration-350,()=>this.tweens.add({targets:center,alpha:0,duration:350}));};
    this.time.delayedCall(1000,()=>show('FELIZ ANIVERSARIO\nMI AMOR ❤️','42px',2000));this.time.delayedCall(3100,()=>show('TE AMO','64px',1600));this.time.delayedCall(4800,()=>show('PAOLA ❤️ MATEO\n\n19 • 09 • 2025\n∞','35px',2200));
    this.time.delayedCall(7100,()=>{credits.setText('RESCATE DE AMOR\n\nUna historia para Paola ❤️\n\nProtagonizada por\nPAOLA GODOY\n\nRescatado por\nMATEO NÚÑEZ\n\nVillana dramática\nPECHO PALOMA\n\nHistoria\nMateo & Paola\n\nBasado en una historia de amor real.\n\n19 • 09 • 2025\n\nHECHO CON ❤️ PARA TI');this.tweens.add({targets:credits,alpha:1,duration:700});});
    this.time.delayedCall(13200,()=>{gameState.endingUnlocked=true;const nextScene=gameState.secretUnlocked?'SecretScene':'MenuScene';gameState.currentScene=nextScene;localStorage.setItem('rescate-de-amor-save',JSON.stringify(gameState));this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start(nextScene));this.cameras.main.fadeOut(700,8,4,18);});
  }
}
