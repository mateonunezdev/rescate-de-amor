import BaseLevelScene from './BaseLevelScene.js?v=20260829-world-remaster-01';

export default class Level2Scene extends BaseLevelScene {
  constructor(){super('Level2Scene',{
    title:'NIVEL 2 · JARDÍN DE ROSAS',objective:'Activa los tres símbolos y recupera la Carta II.',theme:'garden',background:'bg-garden-clean',width:6600,music:'gardenMusic',sky:'#281438',skyTop:0x17132f,skyBottom:0x623052,ground:0x271f2c,platform:0x39323a,trim:0xe0b46c,accent:0xe64a83,cleanArchitecture:true,
    groundSegments:[{start:0,end:1200,top:648},{start:1950,end:6600,top:648}],
    sections:[{x:150,label:'PASEO DE LAS FUENTES'},{x:1080,label:'PÉRGOLAS ROTAS'},{x:2050,label:'LABERINTO DE ROSAS'},{x:2600,label:'SÍMBOLOS DEL RECUERDO'},{x:3400,label:'PÉRGOLA SELLADA'},{x:3820,label:'ARENA DE LOS JARDINEROS'},{x:5100,label:'ARCHIMAGO PALOMA'},{x:5950,label:'CARTA II'}],
    platforms:[{x:1320,y:580,w:200},{x:1535,y:525,w:190},{x:1745,y:470,w:185},{x:1910,y:560,w:150},{x:4210,y:558,w:190},{x:4540,y:475,w:175}],
    jumpRoute:[{x:1200,y:648,w:20},{x:1320,y:580,w:276},{x:1535,y:525,w:236},{x:1745,y:470,w:229},{x:1910,y:560,w:195},{x:1950,y:648,w:20}],
    hazards:[{x:1290,y:674,frame:8},{x:1510,y:674,frame:8},{x:1730,y:674,frame:8},{x:1900,y:674,frame:8}],
    enemies:[{x:560,y:610,type:'soldier',minX:380,maxX:760,speed:68,health:3},{x:1660,y:390,type:'winged',minX:1460,maxX:1820,speed:96,health:2},{x:2250,y:610,type:'soldier',minX:2070,maxX:2440,speed:72,health:3},{x:4050,y:610,type:'soldier',minX:3910,maxX:4300,speed:76,health:4},{x:4210,y:510,type:'archer',platformIndex:4,speed:54,health:2},{x:4540,y:425,type:'mage',platformIndex:5,speed:48,health:3},{x:4740,y:610,type:'knight',minX:4580,maxX:4910,speed:58,health:6},{x:5480,y:610,type:'mage',name:'ARCHIMAGO PALOMA',miniBoss:true,minX:5250,maxX:5700,speed:64,health:11}],
    collectibles:[{x:760,y:590,type:'rose'},{x:1580,y:500,type:'fragment3',memory:true},{x:2390,y:590,type:'star',memory:true},{x:3650,y:590,type:'rose'},{x:4580,y:590,type:'fragment4',memory:true},{x:6060,y:590,type:'card2',memory:true}],
    puzzleX:3300,puzzleSymbols:[{x:2700,key:'ROSA',icon:'🌹'},{x:2890,key:'CORAZÓN',icon:'♥'},{x:3080,key:'ESTRELLA',icon:'★'}],
    arenas:[{start:3820,end:4920,message:'LIBERA EL JARDÍN INTERIOR'}],projectileHoming:.18,checkpoints:[1080,1980,3420,5020,5800],required:['card2'],unlock:3,next:'Level3Scene',exitLabel:'FORTALEZA\nREAL',
  });}
}
