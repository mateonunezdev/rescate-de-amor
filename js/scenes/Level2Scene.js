import BaseLevelScene from './BaseLevelScene.js?v=20260823-professional-polish-29';
export default class Level2Scene extends BaseLevelScene {
  constructor(){ super('Level2Scene',{
    title:'NIVEL 2 · JARDÍN DE ROSAS',objective:'Encuentra la estrella y la rosa entre fuentes y setos.',theme:'garden',background:'bg-garden',width:3200,music:'gardenMusic',sky:'#281438',skyTop:0x17132f,skyBottom:0x623052,ground:0x271f2c,platform:0x39323a,trim:0xe0b46c,accent:0xe64a83,
    platforms:[{x:360,y:560,w:190},{x:650,y:490,w:185},{x:920,y:420,w:195},{x:1240,y:520,w:230},{x:1560,y:450,w:195},{x:1880,y:380,w:205},{x:2180,y:500,w:230},{x:2500,y:430,w:195},{x:2800,y:510,w:230}],
    enemies:[{x:530,y:610,type:'soldier',minX:430,maxX:730,speed:88,health:3},{x:1100,y:610,type:'knight',minX:980,maxX:1350,speed:58,health:5},{x:1740,y:330,type:'mage',minX:1600,maxX:2000,speed:52,health:3},{x:2390,y:610,type:'archer',minX:2200,maxX:2650,speed:60,health:3}],
    collectibles:[{x:400,y:510,type:'rose'},{x:700,y:435,type:'star',memory:true},{x:1280,y:470,type:'rose'},{x:1600,y:395,type:'rose',memory:true},{x:2220,y:450,type:'rose'},{x:2540,y:375,type:'card2',memory:true}],
    checkpoint:1700,checkpoints:[700,1450,2200,2750],required:['card2'],unlock:3,next:'Level3Scene',exitLabel:'CASTILLO\nDE LA REINA'
  }); }
}
