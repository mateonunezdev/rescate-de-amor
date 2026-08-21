import BaseLevelScene from './BaseLevelScene.js?v=20260819-story-cards-21';
export default class Level1Scene extends BaseLevelScene {
  constructor(){ super('Level1Scene',{
    title:'NIVEL 1 · BOSQUE DE LOS RECUERDOS', objective:'Encuentra el primer recuerdo.  A/D mover · SPACE saltar · X atacar',
    theme:'forest',background:'bg-forest',width:3000,music:'forestMusic',sky:'#0b1630',skyTop:0x08152b,skyBottom:0x34234c,ground:0x162724,platform:0x263d32,trim:0x88b967,accent:0xff6ea9,
    platforms:[{x:390,y:560,w:190},{x:700,y:495,w:190},{x:1010,y:430,w:220},{x:1330,y:520,w:200},{x:1640,y:450,w:230},{x:1970,y:535,w:200},{x:2270,y:465,w:230},{x:2580,y:395,w:210}],
    enemies:[{x:620,y:620,type:'slime',minX:520,maxX:780,speed:65,health:2},{x:1190,y:350,type:'dive',minX:1080,maxX:1400,speed:95,health:2},{x:1840,y:580,type:'pigeon',minX:1720,maxX:2050,speed:100,health:2}],
    collectibles:[{x:430,y:510,type:'rose'},{x:760,y:440,type:'rose'},{x:1050,y:375,type:'heart',memory:true},{x:1680,y:400,type:'rose'},{x:2310,y:405,type:'card1',memory:true}],
    checkpoint:1500,checkpoints:[1050,2050],required:['card1'],unlock:2,next:'Level2Scene',exitLabel:'JARDÍN\nDE ROSAS'
  }); }
}
