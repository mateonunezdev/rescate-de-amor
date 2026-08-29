import BaseLevelScene from './BaseLevelScene.js?v=20260828-level1-rebuild-44';

export default class Level1Scene extends BaseLevelScene {
  constructor(){super('Level1Scene',{
    title:'NIVEL 1 · BOSQUE DE LOS RECUERDOS',objective:'Sigue el sendero, atraviesa las ruinas y recupera la Carta I.',theme:'forest',background:'bg-forest',width:7200,music:'forestMusic',sky:'#0b1630',skyTop:0x08152b,skyBottom:0x34234c,ground:0x162724,platform:0x263d32,trim:0x88b967,accent:0xff6ea9,
    groundSegments:[{start:0,end:1120,top:648},{start:1950,end:7200,top:648}],
    visualSections:[{start:3200,end:4350,background:'bg-castle',tint:0x5d5578,arches:true},{start:4350,end:5700,background:'bg-castle',tint:0x7a5577}],
    sections:[{x:160,label:'SENDERO DEL PICNIC'},{x:1080,label:'RUINAS Y PUENTE ROTO'},{x:1980,label:'PATIO DE LOS GUARDIANES'},{x:2940,label:'PUERTA DEL RECUERDO'},{x:3220,label:'PASADIZO DE LAS RAÍCES'},{x:4380,label:'SALA DE LOS ECOS'},{x:5800,label:'CAPITÁN PALOMA'},{x:6520,label:'CARTA I'}],
    platforms:[{x:1250,y:580,w:200},{x:1500,y:525,w:190},{x:1740,y:470,w:190},{x:1900,y:560,w:150},{x:2500,y:560,w:185},{x:3720,y:558,w:180},{x:4860,y:558,w:190},{x:5220,y:475,w:175}],
    jumpRoute:[{x:1120,y:648,w:20},{x:1250,y:580,w:248},{x:1500,y:525,w:236},{x:1740,y:470,w:236},{x:1900,y:560,w:186},{x:1950,y:648,w:20}],
    hazards:[{x:1220,y:674,frame:8},{x:1470,y:674,frame:8},{x:1720,y:674,frame:8},{x:1900,y:674,frame:8}],
    enemies:[{x:560,y:610,type:'soldier',minX:380,maxX:720,speed:62,health:3},{x:1660,y:380,type:'winged',minX:1460,maxX:1840,speed:90,health:2},{x:2180,y:610,type:'soldier',minX:2040,maxX:2380,speed:68,health:3},{x:2700,y:610,type:'mage',minX:2580,maxX:2840,speed:46,health:2},{x:3680,y:450,type:'assassin',platformIndex:5,speed:78,health:3},{x:4600,y:610,type:'soldier',minX:4450,maxX:4780,speed:72,health:4},{x:4880,y:425,type:'mage',platformIndex:6,speed:50,health:2},{x:5480,y:610,type:'knight',minX:5320,maxX:5620,speed:55,health:6},{x:6200,y:610,type:'general',name:'CAPITÁN PALOMA',miniBoss:true,minX:5920,maxX:6420,speed:76,health:10}],
    collectibles:[{x:760,y:590,type:'rose'},{x:1680,y:380,type:'heart',memory:true},{x:3820,y:450,type:'rose'},{x:5350,y:590,type:'rose'},{x:6600,y:590,type:'card1',memory:true}],
    arenas:[{start:1980,end:2860,message:'DERROTA A LOS GUARDIANES DEL PATIO'},{start:4420,end:5650,message:'LIBERA LA SALA DE LOS ECOS'}],projectileHoming:.2,puzzleX:3100,checkpoints:[1040,1940,2920,4380,5800,6500],required:['card1'],unlock:2,next:'Level2Scene',exitLabel:'JARDÍN\nDE ROSAS',
  });}
}
