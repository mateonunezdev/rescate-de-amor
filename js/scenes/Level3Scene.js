import BaseLevelScene from './BaseLevelScene.js?v=20260823-professional-polish-29';
export default class Level3Scene extends BaseLevelScene {
  constructor(){ super('Level3Scene',{
    title:'NIVEL 3 · CASTILLO DE PECHO PALOMA',objective:'Libera el camino a la torre. Mateo te espera.',theme:'castle',background:'bg-castle',width:3400,music:'castleMusic',sky:'#090715',skyTop:0x080611,skyBottom:0x312039,ground:0x17131d,platform:0x30283a,trim:0xc98b59,accent:0xff6b87,
    platforms:[{x:370,y:560,w:190},{x:680,y:495,w:190},{x:980,y:430,w:200},{x:1300,y:525,w:215},{x:1620,y:455,w:195},{x:1910,y:385,w:205},{x:2220,y:505,w:230},{x:2530,y:435,w:195},{x:2820,y:365,w:205},{x:3120,y:465,w:215}],
    enemies:[{x:550,y:610,type:'soldier',minX:450,maxX:780,speed:82,health:3},{x:1160,y:610,type:'knight',minX:1020,maxX:1410,speed:64,health:5},{x:1780,y:330,type:'mage',minX:1650,maxX:2060,speed:65,health:4},{x:2380,y:610,type:'archer',minX:2250,maxX:2640,speed:70,health:3},{x:2820,y:300,type:'general',minX:2740,maxX:2940,speed:92,health:10}],
    collectibles:[{x:410,y:510,type:'rose'},{x:1020,y:375,type:'letter',memory:true},{x:1660,y:400,type:'rose'},{x:2570,y:380,type:'diamond',memory:true},{x:2860,y:310,type:'card3',memory:true}],
    checkpoint:2100,checkpoints:[850,1750,2450,3000],required:['card3'],unlock:4,next:'BossScene',exitLabel:'TORRE DE\nPECHO PALOMA'
  }); }
}
