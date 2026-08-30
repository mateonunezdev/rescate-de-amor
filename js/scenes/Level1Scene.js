import BaseLevelScene from './BaseLevelScene.js?v=20260829-world-remaster-01';

export default class Level1Scene extends BaseLevelScene {
  constructor(){super('Level1Scene',{
    title:'NIVEL 1 · BOSQUE DE LOS RECUERDOS',objective:'Sigue el sendero, atraviesa las ruinas y recupera la Carta I.',theme:'forest',background:'bg-forest-clean',width:7200,music:'forestMusic',sky:'#0b1630',skyTop:0x08152b,skyBottom:0x34234c,ground:0x162724,platform:0x263d32,trim:0x88b967,accent:0xff6ea9,
    cleanArchitecture:true,ambientParticles:14,
    groundSegments:[{start:0,end:1120,top:648},{start:1950,end:7200,top:648}],
    sections:[{x:160,label:'SENDERO'},{x:980,label:'RUINAS'},{x:1160,label:'PUENTE'},{x:1980,label:'PATIO DE GUARDIANES'},{x:2940,label:'PUERTA DEL RECUERDO'},{x:3260,label:'PASADIZO'},{x:4380,label:'SALA DE LOS ECOS'},{x:5800,label:'CAPITÁN PALOMA'},{x:6520,label:'CARTA I'}],
    platforms:[{x:1200,y:610,w:220},{x:1435,y:565,w:210},{x:1660,y:520,w:210},{x:1880,y:590,w:190},{x:4750,y:550,w:190},{x:5100,y:490,w:180}],
    jumpRoute:[{x:1120,y:648,w:20},{x:1200,y:610,w:240},{x:1440,y:565,w:240},{x:1680,y:520,w:240},{x:1900,y:590,w:240},{x:1950,y:648,w:20}],
    hazards:[],
    enemies:[{x:560,y:610,type:'soldier',minX:380,maxX:720,speed:62,health:3},{x:1680,y:420,type:'winged',minX:1420,maxX:1900,speed:90,health:2},{x:2180,y:610,type:'soldier',minX:2040,maxX:2380,speed:68,health:3},{x:2700,y:610,type:'mage',minX:2580,maxX:2840,speed:46,health:2},{x:3660,y:610,type:'assassin',minX:3440,maxX:3900,speed:78,health:3},{x:4600,y:610,type:'soldier',minX:4450,maxX:4780,speed:72,health:4},{x:4750,y:500,type:'mage',platformIndex:4,speed:50,health:2},{x:5480,y:610,type:'knight',minX:5320,maxX:5620,speed:55,health:6},{x:6200,y:610,type:'general',name:'CAPITÁN PALOMA',miniBoss:true,minX:5920,maxX:6420,speed:76,health:10}],
    collectibles:[{x:760,y:590,type:'rose'},{x:1680,y:380,type:'heart',memory:true},{x:2050,y:590,type:'fragment1',memory:true},{x:3820,y:450,type:'rose'},{x:4720,y:590,type:'fragment2',memory:true},{x:5350,y:590,type:'rose'},{x:6600,y:590,type:'card1',memory:true}],
    arenas:[{start:1980,end:2860,message:'DERROTA A LOS GUARDIANES DEL PATIO'},{start:4420,end:5650,message:'LIBERA LA SALA DE LOS ECOS'}],projectileHoming:.2,puzzleX:3100,checkpoints:[1040,1940,2920,4380,5800,6500],required:['card1'],unlock:2,next:'Level2Scene',exitLabel:'JARDÍN\nDE ROSAS',
  });}
}
