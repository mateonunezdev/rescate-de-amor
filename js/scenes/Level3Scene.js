import BaseLevelScene from './BaseLevelScene.js?v=20260829-world-remaster-01';

export default class Level3Scene extends BaseLevelScene {
  constructor(){super('Level3Scene',{
    title:'NIVEL 3 · FORTALEZA DE PECHO PALOMA',objective:'Reúne las tres runas y alcanza al General Palomo.',theme:'castle',background:'bg-fortress-clean',width:7200,music:'castleMusic',sky:'#090715',skyTop:0x080611,skyBottom:0x312039,ground:0x17131d,platform:0x30283a,trim:0xc98b59,accent:0xff6b87,cleanArchitecture:true,
    groundSegments:[{start:0,end:1180,top:648},{start:1940,end:7200,top:648}],
    sections:[{x:140,label:'ENTRADA BAJO LA LLUVIA'},{x:1980,label:'PATIO MILITAR'},{x:2780,label:'CALABOZOS'},{x:3250,label:'MATEO AL OTRO LADO'},{x:3680,label:'RUNAS DE LA FORTALEZA'},{x:5000,label:'PUERTA DE TRES RUNAS'},{x:5200,label:'ASCENSOR MECÁNICO'},{x:5550,label:'ARENA FUERTE'},{x:6000,label:'GENERAL PALOMO'},{x:6600,label:'CARTA III'}],
    platforms:[{x:1300,y:580,w:200},{x:1515,y:525,w:190},{x:1725,y:470,w:185},{x:1900,y:560,w:150},{x:2350,y:558,w:190},{x:3650,y:558,w:190},{x:4450,y:558,w:190},{x:5300,y:510,w:210,movingY:105,moveSpeed:.00105},{x:5750,y:558,w:190}],
    jumpRoute:[{x:1180,y:648,w:20},{x:1300,y:580,w:276},{x:1515,y:525,w:236},{x:1725,y:470,w:229},{x:1900,y:560,w:195},{x:1940,y:648,w:20}],
    hazards:[{x:1270,y:674,frame:9},{x:1490,y:674,frame:9},{x:1710,y:674,frame:9},{x:1890,y:674,frame:9}],
    enemies:[{x:520,y:610,type:'soldier',minX:340,maxX:760,speed:78,health:4},{x:1650,y:390,type:'winged',minX:1450,maxX:1820,speed:104,health:3},{x:2150,y:610,type:'soldier',minX:2020,maxX:2320,speed:82,health:4},{x:2350,y:510,type:'guardian',platformIndex:4,runeGuardian:true,speed:54,health:6},{x:2600,y:610,type:'archer',minX:2460,maxX:2750,speed:64,health:3},{x:3650,y:510,type:'guardian',platformIndex:5,runeGuardian:true,speed:56,health:7},{x:4200,y:610,type:'soldier',minX:4040,maxX:4360,speed:86,health:4},{x:4450,y:510,type:'guardian',platformIndex:6,runeGuardian:true,speed:58,health:7},{x:4680,y:610,type:'mage',minX:4520,maxX:4860,speed:58,health:4},{x:5650,y:610,type:'knight',minX:5480,maxX:5820,speed:62,health:7},{x:6100,y:610,type:'general',name:'GENERAL PALOMO',miniBoss:true,minX:5880,maxX:6350,speed:88,health:14}],
    collectibles:[{x:760,y:590,type:'rose'},{x:1040,y:590,type:'fragment5',memory:true},{x:3000,y:590,type:'letter',memory:true},{x:3470,y:590,type:'fragment6',memory:true},{x:5350,y:500,type:'diamond',memory:true},{x:5900,y:590,type:'fragment7',memory:true},{x:6660,y:590,type:'card3',memory:true}],
    arenas:[{start:1980,end:2750,message:'DESPEJA EL PATIO MILITAR'},{start:3420,end:3900,message:'RECUPERA LA SEGUNDA RUNA'},{start:4050,end:4860,message:'ROMPE LA DEFENSA DE LA FORTALEZA'}],puzzleX:5000,mateoEncounterX:3250,projectileHoming:.18,checkpoints:[1080,1940,2850,3950,5100,5850,6450],required:['card3'],unlock:4,next:'Level4Scene',exitLabel:'TORRE DEL\nCORAZÓN',
  });}
}
