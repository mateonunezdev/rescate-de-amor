import AudioManager from '../systems/AudioManager.js';
import { gameState } from '../config.js';

export default class SecretScene extends Phaser.Scene {
  constructor(){super('SecretScene');}

  create(){
    this.audioManager=new AudioManager(this);this.audioManager.playMusic('endingMusic');this.cameras.main.fadeIn(900,8,3,15);this.cameras.main.setBackgroundColor('#08040f');
    this.add.image(640,360,'bg-romantic').setDisplaySize(1280,720).setTint(0x8a3a68).setDepth(-20);this.add.rectangle(640,360,1280,720,0x120719,.68).setDepth(-19);
    this.makeLoveWall();this.makeFallingLove();this.makeCouple();this.makeCenterMessage();this.time.delayedCall(6500,()=>this.makeButtons());
    gameState.secretUnlocked=true;gameState.currentScene='SecretScene';localStorage.setItem('rescate-de-amor-save',JSON.stringify(gameState));
  }

  makeLoveWall(){
    const colors=['#ff8fbd','#ffd0df','#f3b4ff','#ffd98c','#ffffff'];this.loveTexts=[];
    for(let i=0;i<58;i++){const x=35+(i%10)*132+(i%2)*22,y=34+Math.floor(i/10)*112+(i%3)*10,text=i%5===0?['❤️','💕','💗','🌹'][i%4]:'TE AMO';const item=this.add.text(x,y,text,{fontFamily:'monospace',fontSize:`${text==='TE AMO'?15+(i%4)*3:18+(i%3)*5}px`,color:colors[i%colors.length],fontStyle:'bold',stroke:'#3b102d',strokeThickness:3}).setOrigin(.5).setDepth(2).setAlpha(0).setAngle((i%5-2)*2);this.loveTexts.push(item);this.tweens.add({targets:item,alpha:{from:0,to:.38+(i%3)*.13},scale:{from:.65,to:1},y:item.y-8-(i%4)*2,duration:650,delay:80*i,ease:'Back.easeOut',onComplete:()=>this.tweens.add({targets:item,alpha:{from:item.alpha,to:Math.max(.22,item.alpha-.2)},scale:1.06,duration:1800+(i%5)*260,yoyo:true,repeat:-1,ease:'Sine.easeInOut'})});}
  }

  makeFallingLove(){
    this.fallers=[];for(let i=0;i<18;i++){const symbol=this.add.text(Math.random()*1280,-40-Math.random()*720,['♥','🌹','✦'][i%3],{fontFamily:'monospace',fontSize:`${12+i%4*4}px`,color:i%3===1?'#ffadc8':'#ff75ad'}).setOrigin(.5).setDepth(i%2?5:1).setAlpha(.35+.3*Math.random());this.fallers.push(symbol);this.tweens.add({targets:symbol,y:770,x:symbol.x+(Math.random()-.5)*180,angle:(Math.random()-.5)*220,duration:4300+Math.random()*2600,delay:Math.random()*1800,repeat:-1});}
  }

  makeCouple(){
    this.paola=this.add.image(585,555,'paola-final',8).setScale(1.05).setDepth(25);this.mateo=this.add.image(690,555,'mateo-final',3).setScale(1.03).setFlipX(true).setDepth(24);this.assertUniqueCouple();
    this.tweens.add({targets:[this.paola,this.mateo],y:'-=5',duration:1250,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});this.time.delayedCall(2600,()=>{this.paola.setX(610).setFrame(8);this.mateo.setX(667).setFrame(3);for(let i=0;i<16;i++){const h=this.add.text(638+(Math.random()-.5)*130,520+Math.random()*70,'♥',{fontSize:`${12+Math.random()*18}px`,color:'#ff78ae'}).setOrigin(.5).setDepth(28);this.tweens.add({targets:h,y:h.y-160,x:h.x+(Math.random()-.5)*80,alpha:0,duration:1200+Math.random()*600,onComplete:()=>h.destroy()});}this.assertUniqueCouple();});
  }

  assertUniqueCouple(){for(const [key,name] of [['paola-final','Paola'],['mateo-final','Mateo']]){const count=this.children.list.filter(o=>o.visible&&o.texture?.key===key).length;if(count!==1)console.error(`[FINAL QA] ${name}: ${count} sprites visibles`);}}

  makeCenterMessage(){
    const glow=this.add.rectangle(640,290,940,285,0x100713,.76).setStrokeStyle(4,0xa7487b,.45).setDepth(30).setAlpha(0);const roses=this.add.text(640,175,'🌹  ❤️  🌹',{fontSize:'34px'}).setOrigin(.5).setDepth(33).setAlpha(0);const title=this.add.text(640,260,'❤️ FELIZ ANIVERSARIO MI AMOR ❤️',{fontFamily:'monospace',fontSize:'38px',color:'#fff0cc',fontStyle:'bold',align:'center',stroke:'#6d174d',strokeThickness:8}).setOrigin(.5).setDepth(33).setScale(.7).setAlpha(0);const subtitle=this.add.text(640,325,'Por nosotros.\n\n19 • 09 • 2025',{fontFamily:'monospace',fontSize:'23px',color:'#ffd3e3',align:'center',lineSpacing:5,stroke:'#4a173b',strokeThickness:5}).setOrigin(.5).setDepth(33).setAlpha(0);
    this.time.delayedCall(3300,()=>{this.tweens.add({targets:glow,alpha:.82,duration:700});this.tweens.add({targets:[roses,subtitle],alpha:1,duration:900});this.tweens.add({targets:title,alpha:1,scale:1.05,duration:850,ease:'Back.easeOut',onComplete:()=>this.tweens.add({targets:title,scale:1,duration:280})});for(let i=0;i<14;i++){const h=this.add.text(640,260,'♥',{fontSize:`${12+i%4*4}px`,color:'#ff8fbd'}).setOrigin(.5).setDepth(32);const angle=i/14*Math.PI*2;this.tweens.add({targets:h,x:640+Math.cos(angle)*(330+i%3*40),y:260+Math.sin(angle)*(120+i%2*35),alpha:0,duration:1100+i*35,onComplete:()=>h.destroy()});}});
    this.cameras.main.zoomTo(.96,8500,'Sine.easeInOut');
  }

  makeButtons(){
    const make=(x,label,action)=>this.add.text(x,665,label,{fontFamily:'monospace',fontSize:'15px',color:'#fff5dd',backgroundColor:'#5d234b',padding:{x:18,y:10},stroke:'#28101f',strokeThickness:2}).setOrigin(.5).setDepth(40).setAlpha(0).setInteractive({useHandCursor:true}).on('pointerdown',action);
    const replay=make(430,'❤️ VOLVER A VER NUESTRA HISTORIA',()=>this.leaveTo('IntroScene'));const letter=make(850,'CARTA ❤️',()=>this.leaveTo('EndingScene',{letterOnly:true}));this.tweens.add({targets:[replay,letter],alpha:1,y:650,duration:600,ease:'Back.easeOut'});
  }

  leaveTo(sceneKey,data){if(this.leaving)return;this.leaving=true;this.cameras.main.once('camerafadeoutcomplete',()=>this.scene.start(sceneKey,data));this.cameras.main.fadeOut(650,8,3,15);}
}
