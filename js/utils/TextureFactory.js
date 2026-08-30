export class TextureFactory {
  static createCombatTextures(scene){
    if(!scene.textures.exists('love-shot')){const g=scene.add.graphics();g.fillStyle(0x9b286f,1);g.fillRect(3,12,8,8);g.fillRect(9,7,24,20);g.fillRect(33,11,8,12);g.fillStyle(0xff55a4,1);g.fillRect(8,11,27,14);g.fillStyle(0xff9dce,1);g.fillCircle(20,13,8);g.fillCircle(29,13,8);g.fillTriangle(12,15,37,15,24,28);g.fillStyle(0xffffff,1);g.fillRect(17,9,6,5);g.fillRect(9,15,5,4);g.fillStyle(0xffd8ee,.8);g.fillRect(0,15,8,3);g.generateTexture('love-shot',44,32);g.destroy();}
    if(!scene.textures.exists('kiss-shot')){const g=scene.add.graphics();g.fillStyle(0xff86c1,.25);g.fillCircle(18,12,17);g.fillStyle(0xee3e8c,1);g.fillEllipse(18,12,25,11);g.fillStyle(0xffc2dc,1);g.fillEllipse(18,10,14,4);g.generateTexture('kiss-shot',36,25);g.destroy();}
    if(!scene.textures.exists('enemy-feather-shot')){const g=scene.add.graphics();g.fillStyle(0x2a1838,.35);g.fillEllipse(15,11,25,13);g.fillStyle(0xf2d9ed,1);g.fillEllipse(15,9,22,8);g.fillStyle(0xca72b1,1);g.fillTriangle(5,10,0,18,13,12);g.lineStyle(2,0xffffff,.8);g.lineBetween(8,9,27,7);g.generateTexture('enemy-feather-shot',32,20);g.destroy();}
    if(!scene.textures.exists('enemy-magic-orb')){const g=scene.add.graphics();g.fillStyle(0x6c238d,.25);g.fillCircle(18,18,17);g.lineStyle(3,0xe281ff,.9);g.strokeCircle(18,18,13);g.fillStyle(0xa945d0,1);g.fillCircle(18,18,9);g.fillStyle(0xffffff,1);g.fillCircle(15,14,4);g.generateTexture('enemy-magic-orb',36,36);g.destroy();}
    if(!scene.textures.exists('empty-heart-shot')){const g=scene.add.graphics();g.fillStyle(0x130c1d,.45);g.fillCircle(27,24,25);g.fillStyle(0x4d214f,1);g.fillCircle(19,17,12);g.fillCircle(35,17,12);g.fillTriangle(8,20,46,20,27,50);g.lineStyle(5,0xe05296,1);g.beginPath();g.moveTo(28,5);g.lineTo(22,20);g.lineTo(31,27);g.lineTo(24,46);g.strokePath();g.lineStyle(2,0xff9bcb,.8);g.strokeCircle(27,24,24);g.generateTexture('empty-heart-shot',54,54);g.destroy();}
  }
  static createHazardTextures(scene){
    if(!scene.textures.exists('hazard-thorns')){const g=scene.add.graphics();g.fillStyle(0x244c32,1);g.fillRect(0,19,54,8);g.fillStyle(0x8bd061,1);for(let x=2;x<54;x+=9)g.fillTriangle(x,20,x+5,2+(x%3)*3,x+10,20);g.fillStyle(0xff659e,1);for(let x=8;x<52;x+=18)g.fillCircle(x,17,3);g.generateTexture('hazard-thorns',54,28);g.destroy();}
    if(!scene.textures.exists('hazard-puddle')){const g=scene.add.graphics();g.fillStyle(0x51266e,.9);g.fillEllipse(34,12,66,18);g.fillStyle(0xd05fbd,.75);g.fillEllipse(30,9,42,8);g.fillStyle(0xffb5df,1);g.fillRect(15,6,9,2);g.generateTexture('hazard-puddle',68,24);g.destroy();}
    if(!scene.textures.exists('hazard-flame')){const g=scene.add.graphics();g.fillStyle(0x9a285e,1);g.fillTriangle(2,34,12,7,20,34);g.fillTriangle(14,34,27,0,38,34);g.fillTriangle(31,34,44,9,52,34);g.fillStyle(0xffa34d,1);g.fillTriangle(12,34,26,12,39,34);g.fillStyle(0xffe181,1);g.fillTriangle(20,34,27,21,33,34);g.generateTexture('hazard-flame',54,36);g.destroy();}
    if(!scene.textures.exists('hazard-root')){const g=scene.add.graphics();g.fillStyle(0x2a1d22,1);g.fillRect(0,20,64,8);g.fillStyle(0x70452f,1);for(let x=2;x<62;x+=13){g.fillTriangle(x,22,x+7,1+(x%4),x+14,22);g.fillStyle(0x9a6741,1);g.fillRect(x+6,9,3,11);}g.generateTexture('hazard-root',64,30);g.destroy();}
    if(!scene.textures.exists('hazard-water')){const g=scene.add.graphics();g.fillStyle(0x8ee8ff,.22);g.fillEllipse(28,27,54,10);g.fillStyle(0xd7fbff,.9);g.fillRect(25,4,6,24);g.fillTriangle(18,11,28,0,38,11);g.lineStyle(3,0x75cfe8,.8);g.strokeCircle(28,15,12);g.generateTexture('hazard-water',56,34);g.destroy();}
    if(!scene.textures.exists('hazard-blade')){const g=scene.add.graphics();g.fillStyle(0x241b2d,.7);g.fillCircle(28,28,27);g.fillStyle(0xc7b6d0,1);for(let a=0;a<8;a++){const r=a*Math.PI/4,x=28+Math.cos(r)*21,y=28+Math.sin(r)*21;g.fillTriangle(28,28,x+Math.cos(r-.5)*15,y+Math.sin(r-.5)*15,x+Math.cos(r+.5)*15,y+Math.sin(r+.5)*15);}g.fillStyle(0xe0aa58,1);g.fillCircle(28,28,7);g.generateTexture('hazard-blade',56,56);g.destroy();}
    if(!scene.textures.exists('hazard-magic')){const g=scene.add.graphics();g.lineStyle(4,0xff67b4,.9);g.strokeCircle(30,22,18);g.strokeTriangle(30,1,10,38,50,38);g.fillStyle(0x7d2a77,.45);g.fillCircle(30,22,13);g.fillStyle(0xffffff,1);g.fillCircle(30,22,4);g.generateTexture('hazard-magic',60,44);g.destroy();}
  }
  static createPlayerTexture(scene) {
    if (scene.textures.exists('player-paola')) return;
    const gfx = scene.add.graphics();
    const w = 32, h = 52;
    // Cabello largo castaño, silueta y mechones
    gfx.fillStyle(0x302016, 1); gfx.fillRoundedRect(5, 3, 23, 29, 6);
    gfx.fillStyle(0x593522, 1); gfx.fillRoundedRect(7, 2, 20, 11, 5); gfx.fillRect(5, 13, 5, 20); gfx.fillRect(25, 12, 4, 22);
    gfx.fillStyle(0x7a4b2d, 1); gfx.fillRect(8, 6, 3, 20); gfx.fillRect(26, 15, 2, 17);
    // Rostro y gafas negras claramente legibles
    gfx.fillStyle(0xf1c8a8, 1); gfx.fillRoundedRect(9, 10, 16, 15, 4);
    gfx.lineStyle(2, 0x17151c, 1); gfx.strokeRect(10, 14, 6, 5); gfx.strokeRect(19, 14, 6, 5); gfx.lineBetween(16,16,19,16);
    gfx.fillStyle(0x3a2021, 1); gfx.fillRect(13,16,2,2); gfx.fillRect(21,16,2,2);
    gfx.fillStyle(0xd46f79, 1); gfx.fillRect(16,22,4,1);
    // Chaqueta varsity blanca/negra, mangas y parche corazón
    gfx.fillStyle(0x191b27, 1); gfx.fillRoundedRect(6,26,22,15,3);
    gfx.fillStyle(0xf1eef0, 1); gfx.fillRect(10,27,12,13); gfx.fillRect(4,28,5,11); gfx.fillRect(27,28,4,11);
    gfx.fillStyle(0xff5e93, 1); gfx.fillCircle(14,32,2); gfx.fillCircle(17,32,2); gfx.fillTriangle(12,33,19,33,15.5,37);
    gfx.fillStyle(0xd9b45e, 1); gfx.fillRect(21,28,2,11);
    // Shorts azules, piernas, medias y zapatillas
    gfx.fillStyle(0x3567a9, 1); gfx.fillRoundedRect(8,40,18,6,2); gfx.fillStyle(0xe9bea1,1);gfx.fillRect(9,45,6,4);gfx.fillRect(20,45,6,4);
    gfx.fillStyle(0xf4edf1,1);gfx.fillRect(9,48,6,2);gfx.fillRect(20,48,6,2);gfx.fillStyle(0x202331,1);gfx.fillRect(7,50,9,2);gfx.fillRect(19,50,9,2);
    
    gfx.generateTexture('player-paola', w, h);
    gfx.destroy();
  }

  static createEnemyTexture(scene, type = 'pigeon') {
    const key = `enemy-${type}`;
    if (scene.textures.exists(key)) return;
    
    const gfx = scene.add.graphics();
    
    if (type === 'pigeon') {
      const w = 20, h = 18;
      // Cuerpo
      gfx.fillStyle(0xc8b8d8, 1);
      gfx.fillCircle(10, 10, 7);
      
      // Cabeza
      gfx.fillStyle(0xb8a8c8, 1);
      gfx.fillCircle(12, 6, 5);
      
      // Ojo
      gfx.fillStyle(0x000000, 1);
      gfx.fillRect(14, 4, 2, 2);
      
      // Pico
      gfx.fillStyle(0xff8c42, 1);
      gfx.fillTriangle(16, 6, 20, 6, 17, 8);
      
      gfx.generateTexture(key, w, h);
    } else if (type === 'slime') {
      const w = 20, h = 16;
      gfx.fillStyle(0xff6d9d, 1);
      gfx.fillEllipse(10, 10, 8, 6);
      gfx.fillStyle(0xffb5d8, 1);
      gfx.fillEllipse(6, 8, 3, 3);
      gfx.fillEllipse(14, 8, 3, 3);
      gfx.generateTexture(key, w, h);
    } else if (type === 'spike') {
      const w = 16, h = 20;
      gfx.fillStyle(0xd44d4d, 1);
      gfx.fillTriangle(8, 2, 14, 18, 2, 18);
      gfx.fillStyle(0xff7b7b, 1);
      gfx.fillTriangle(8, 6, 12, 14, 4, 14);
      gfx.generateTexture(key, w, h);
    } else if (type === 'broken') {
      gfx.fillStyle(0x632b62,1);gfx.fillCircle(6,6,6);gfx.fillCircle(14,6,6);gfx.fillTriangle(1,7,19,7,10,20);gfx.fillStyle(0x1d1729,1);gfx.fillTriangle(9,2,13,8,9,11);gfx.fillTriangle(9,11,13,14,10,20);gfx.lineStyle(2,0xcf65ba,1);gfx.strokeCircle(10,9,10);gfx.generateTexture(key,22,22);
    } else if (type === 'guard') {
      gfx.fillStyle(0x2a2038, 1); gfx.fillRoundedRect(3, 8, 18, 30, 3);
      gfx.fillStyle(0xd7bddf, 1); gfx.fillCircle(12, 7, 7);
      gfx.fillStyle(0xf0c66b, 1); gfx.fillTriangle(5, 3, 8, 0, 10, 3); gfx.fillTriangle(13, 3, 16, 0, 19, 3);
      gfx.fillStyle(0xff5f9f, 1); gfx.fillRect(9, 20, 6, 5);
      gfx.generateTexture(key, 24, 40);
    } else if (type==='assassin'||type==='guardian') {
      const guardian=type==='guardian';gfx.fillStyle(0x16121d,.45);gfx.fillEllipse(30,68,27,5);gfx.fillStyle(guardian?0x343b50:0x35233e,1);gfx.fillRoundedRect(10,19,36,47,guardian?8:4);gfx.fillStyle(0xe2d8e5,1);gfx.fillEllipse(28,15,16,13);gfx.fillStyle(0xf6edf5,1);gfx.fillTriangle(10,25,0,10,8,45);gfx.fillTriangle(45,25,58,10,49,45);gfx.fillStyle(0x272031,1);gfx.fillCircle(34,13,2);gfx.fillStyle(0xe6ad55,1);gfx.fillTriangle(42,16,57,20,42,23);if(guardian){gfx.fillStyle(0xc7af67,1);gfx.fillRoundedRect(0,25,22,38,7);gfx.fillStyle(0x8e315f,1);gfx.fillCircle(11,44,8);gfx.fillStyle(0xd0c4b4,1);gfx.fillRect(45,20,5,47);}else{gfx.fillStyle(0x16131f,1);gfx.fillTriangle(8,25,28,2,48,25);gfx.fillStyle(0xe45d9b,1);gfx.fillRect(13,34,30,4);gfx.fillStyle(0xdad3df,1);gfx.fillTriangle(45,28,62,20,48,36);gfx.fillTriangle(8,34,-6,26,7,43);}gfx.fillStyle(0x211d29,1);gfx.fillRect(13,60,12,10);gfx.fillRect(33,60,12,10);gfx.generateTexture(key,64,72);
    } else if (['soldier','archer','knight','mage','general'].includes(type)) {
      const heavy=type==='knight'||type==='general',robe=type==='mage';
      gfx.fillStyle(0x120f19,.45);gfx.fillEllipse(25,67,21,4);
      gfx.fillStyle(0x211b2b,1);gfx.fillRoundedRect(7,18,34,46,6);
      gfx.fillStyle(robe?0x743d8f:heavy?0x39445d:0x51405c,1);gfx.fillRoundedRect(8,20,30,42,5);
      gfx.fillStyle(0xb9a6c8,1);gfx.fillTriangle(11,29,0,20,5,46);gfx.fillTriangle(36,29,48,20,42,46);gfx.fillStyle(0xe3d8e7,1);gfx.fillTriangle(7,29,2,25,5,37);gfx.fillTriangle(40,29,46,25,43,37);
      gfx.fillStyle(0xd9cfda,1);gfx.fillEllipse(23,15,15,13);gfx.fillStyle(0xf3eaf3,1);gfx.fillEllipse(19,12,7,6);gfx.fillStyle(0x2c2437,1);gfx.fillCircle(28,12,2);gfx.fillStyle(0xe6ad55,1);gfx.fillTriangle(36,15,48,19,36,22);
      gfx.fillStyle(robe?0xa85dcc:heavy?0xbcae91:0x84687e,1);gfx.fillRect(12,27,22,5);gfx.fillStyle(type==='general'?0xe7bf55:0xd9d5df,1);gfx.fillRect(10,36,26,3);
      if(type==='archer'){gfx.lineStyle(3,0xe1b86a,1);gfx.strokeCircle(43,38,12);}
      else if(type==='mage'){gfx.fillStyle(0xb860dc,1);gfx.fillCircle(42,35,6);gfx.fillRect(40,38,4,25);}
      else{gfx.fillStyle(0xd8ad58,1);gfx.fillRect(41,24,3,39);gfx.fillTriangle(37,25,48,25,43,15);}
      if(heavy){gfx.fillStyle(type==='general'?0xe2af45:0xc9b46d,1);gfx.fillRoundedRect(1,29,15,27,5);gfx.fillStyle(0x8d3869,1);gfx.fillCircle(8,42,5);}
      if(type==='general'){gfx.fillStyle(0x9e295f,1);gfx.fillTriangle(10,29,0,66,18,58);gfx.fillStyle(0xf2c75e,1);gfx.fillTriangle(15,4,20,0,24,5);gfx.fillTriangle(24,5,29,0,34,6);}
      if(type==='mage'){gfx.fillStyle(0x3c2457,1);gfx.fillTriangle(8,21,24,0,40,21);gfx.fillStyle(0xff75d0,.8);gfx.fillCircle(23,8,3);}
      gfx.fillStyle(0x242231,1);gfx.fillRect(11,59,10,10);gfx.fillRect(27,59,10,10);gfx.fillStyle(0xc5a7c9,1);gfx.fillRect(13,59,6,3);gfx.fillRect(29,59,6,3);gfx.generateTexture(key,50,70);
    } else if (type === 'magic' || type === 'dive'||type==='winged') {
      gfx.fillStyle(type === 'magic' ? 0xb879e8 : type==='winged'?0x8d789e:0xd8d0e5, 1); gfx.fillEllipse(12, 11, 17, 11);
      gfx.fillStyle(0xf5eef8, 1); gfx.fillTriangle(7, 9, 0, 2, 3, 13); gfx.fillTriangle(16, 9, 24, 2, 21, 13);
      gfx.fillStyle(0xffbd55, 1); gfx.fillTriangle(19, 9, 24, 11, 19, 13);
      gfx.fillStyle(0x181323, 1); gfx.fillRect(15, 7, 2, 2);if(type==='winged'){gfx.fillStyle(0xd8cce2,1);gfx.fillTriangle(5,11,-10,-2,0,17);gfx.fillTriangle(19,11,34,-2,24,17);gfx.fillStyle(0xc55c95,1);gfx.fillTriangle(9,14,15,14,12,26);}
      gfx.generateTexture(key,type==='winged'?36:24,type==='winged'?28:18);
    }
    
    gfx.destroy();
  }

  static createBossTexture(scene) {
    if (scene.textures.exists('boss-chest-pigeon')) return;
    const gfx = scene.add.graphics();
    const w = 80, h = 100;
    
    // Cabello rubio largo detrás del rostro
    gfx.fillStyle(0xd89d3d,1);gfx.fillRoundedRect(20,15,40,63,14);gfx.fillStyle(0xffd66d,1);gfx.fillRoundedRect(24,13,32,50,13);gfx.fillRect(20,28,9,50);gfx.fillRect(52,27,9,52);gfx.fillStyle(0xffec9a,1);gfx.fillRect(26,19,5,48);gfx.fillRect(54,25,4,44);
    // Corona dorada con gemas
    gfx.fillStyle(0xf7d35f, 1);gfx.fillRect(19,8,43,9);gfx.fillTriangle(19,8,24,0,29,8);gfx.fillTriangle(35,8,40,0,45,8);gfx.fillTriangle(52,8,58,0,62,8);gfx.fillStyle(0xff5f9d,1);gfx.fillRect(38,9,5,5);
    // Rostro humano
    gfx.fillStyle(0xf3ceb1,1);gfx.fillRoundedRect(29,19,23,25,8);gfx.fillStyle(0x3c2432,1);gfx.fillRect(33,29,3,3);gfx.fillRect(45,29,3,3);gfx.fillStyle(0xb63861,1);gfx.fillRect(38,38,6,2);
    // Vestido magenta/violeta, brazos y corpiño real
    gfx.fillStyle(0x7f235f,1);gfx.fillRoundedRect(24,44,33,24,7);gfx.fillStyle(0xe2478d,1);gfx.fillTriangle(17,94,29,62,52,62);gfx.fillTriangle(63,94,52,62,29,62);gfx.fillRect(18,88,44,8);
    gfx.fillStyle(0xf3ceb1,1);gfx.fillRoundedRect(14,48,10,28,4);gfx.fillRoundedRect(57,48,10,28,4);
    gfx.fillStyle(0xf4cf63,1);gfx.fillRect(27,48,27,4);gfx.fillRect(25,62,31,4);gfx.fillCircle(40,56,5);gfx.fillStyle(0xffa5cd,1);gfx.fillCircle(38,55,3);gfx.fillCircle(42,55,3);
    // Capa real
    gfx.fillStyle(0x4b205f,.9);gfx.fillTriangle(24,48,5,68,18,94);gfx.fillTriangle(57,48,75,68,63,94);
    
    gfx.generateTexture('boss-chest-pigeon', w, h);
    gfx.destroy();
  }

  static createMateoTexture(scene) {
    if (scene.textures.exists('mateo-chibi')) return;
    const g=scene.add.graphics();
    g.fillStyle(0x171722,1);g.fillRoundedRect(6,2,22,15,6);g.fillStyle(0x302538,1);g.fillRect(7,4,4,10);
    g.fillStyle(0xe9bd9c,1);g.fillRoundedRect(8,11,18,16,5);g.fillStyle(0x2c2025,1);g.fillRect(12,18,2,2);g.fillRect(21,18,2,2);g.fillStyle(0xb75c61,1);g.fillRect(16,24,4,1);
    g.fillStyle(0x171b27,1);g.fillRoundedRect(5,28,25,16,3);g.fillStyle(0xf1eef0,1);g.fillRect(10,29,14,14);g.fillRect(3,30,6,12);g.fillRect(29,30,4,12);
    g.fillStyle(0xc43e50,1);g.fillRect(14,32,6,5);g.fillStyle(0xe1b45a,1);g.fillRect(22,30,2,12);
    g.fillStyle(0x252a3a,1);g.fillRect(8,44,8,7);g.fillRect(20,44,8,7);g.fillStyle(0xf1f0e8,1);g.fillRect(6,50,11,2);g.fillRect(19,50,11,2);
    g.generateTexture('mateo-chibi',36,52);g.destroy();
  }

  static createCollectibleTexture(scene, type) {
    const key = `collectible-${type}`;
    if (scene.textures.exists(key)) return;
    const gfx = scene.add.graphics();
    
    const palettes = {
      heart: { main: 0xff6d9d, light: 0xffbfd7 },
      star: { main: 0xf8d974, light: 0xfff4b7 },
      rose: { main: 0xff7eb8, light: 0xffd5ea },
      letter: { main: 0xf4d1a4, light: 0xfff5cc },
      diamond: { main: 0x87d3ff, light: 0xc0ebff },
      checkpoint: { main: 0xa5f0ff, light: 0xd9fbff },
    };
    
    const colors = palettes[type] || palettes.rose;
    
    if (type === 'heart') {
      const s = 8;
      gfx.fillStyle(colors.main, 1);
      gfx.fillCircle(6, 4, 4);
      gfx.fillCircle(14, 4, 4);
      gfx.fillTriangle(4, 6, 16, 6, 10, 13);
      gfx.generateTexture(key, 20, 16);
    } else if (type === 'star') {
      gfx.fillStyle(colors.main, 1);
      gfx.fillTriangle(10, 0, 13, 8, 21, 8);
      gfx.fillTriangle(13, 8, 16, 16, 10, 12);
      gfx.fillTriangle(10, 12, 4, 16, 7, 8);
      gfx.fillTriangle(7, 8, 0, 8, 10, 0);
      gfx.generateTexture(key, 20, 18);
    } else if (type === 'rose') {
      gfx.fillStyle(0x2d5a2d, 1);
      gfx.fillRect(9, 8, 2, 10);
      gfx.fillStyle(colors.main, 1);
      gfx.fillCircle(10, 4, 4);
      gfx.fillCircle(8, 6, 3);
      gfx.fillCircle(12, 6, 3);
      gfx.generateTexture(key, 20, 20);
    } else if (type === 'letter') {
      gfx.fillStyle(colors.main, 1);
      gfx.fillRoundedRect(2, 3, 16, 12, 2);
      gfx.fillStyle(0xffe0b2, 1);
      gfx.fillTriangle(3, 4, 18, 4, 10.5, 10);
      gfx.generateTexture(key, 20, 16);
    } else if (type === 'diamond') {
      gfx.fillStyle(colors.main, 1);
      gfx.fillTriangle(10, 2, 18, 10, 10, 18);
      gfx.fillTriangle(10, 2, 2, 10, 10, 18);
      gfx.generateTexture(key, 20, 20);
    } else if (type.startsWith('card')) {
      gfx.fillStyle(0x8f315f,.35);gfx.fillRoundedRect(1,3,30,23,3);gfx.fillStyle(0xffedcf,1);gfx.fillRoundedRect(3,1,26,22,3);gfx.lineStyle(2,0xd25b84,1);gfx.strokeRoundedRect(3,1,26,22,3);gfx.fillStyle(0xd63f76,1);gfx.fillCircle(13,10,4);gfx.fillCircle(19,10,4);gfx.fillTriangle(9,11,23,11,16,19);gfx.fillStyle(0xf0b85a,1);gfx.fillRect(7,4,18,2);gfx.generateTexture(key,32,28);
    } else if(type.startsWith('fragment')){
      gfx.fillStyle(0x6d2f86,.32);gfx.fillCircle(14,14,13);gfx.lineStyle(2,0xffb8e4,.85);gfx.strokeCircle(14,14,11);gfx.fillStyle(0x9ee8ff,1);gfx.fillTriangle(14,1,25,11,17,26);gfx.fillTriangle(14,1,4,12,17,26);gfx.fillStyle(0xffffff,.82);gfx.fillTriangle(14,3,17,12,11,12);gfx.fillStyle(0xff82c4,.7);gfx.fillTriangle(5,13,14,15,16,25);gfx.generateTexture(key,28,28);
    }
    
    gfx.destroy();
  }

  static createPlatformTexture(scene, w = 100, h = 20) {
    if (scene.textures.exists('platform')) return;
    const gfx = scene.add.graphics();
    
    // Base
    gfx.fillStyle(0x4a5d68, 1);
    gfx.fillRoundedRect(0, 0, w, h, 3);
    
    // Tierra/rocas
    gfx.fillStyle(0x2a3548, 1);
    gfx.fillRect(2, 2, w-4, 6);
    
    // Pasto
    gfx.fillStyle(0x5ac96f, 1);
    for (let i = 2; i < w-2; i += 8) {
      gfx.fillTriangle(i, 8, i+2, 4, i+4, 8);
      gfx.fillTriangle(i+3, 8, i+5, 4, i+7, 8);
    }
    
    // Flores
    gfx.fillStyle(0xff7eb8, 1);
    for (let i = 5; i < w; i += 15) {
      gfx.fillCircle(i, 5, 2);
    }
    
    gfx.generateTexture('platform', w, h);
    gfx.destroy();
  }

  static createBackgroundLayers(scene) {
    if (scene.textures.exists('sky-night')) return;
    
    const gfx = scene.add.graphics();
    const w = 1280, h = 720;
    
    // Sky gradient effect with graphics
    gfx.fillStyle(0x0d1631, 1);
    gfx.fillRect(0, 0, w, h/2);
    gfx.fillStyle(0x2f2149, 1);
    gfx.fillRect(0, h/2, w, h/2);
    
    gfx.generateTexture('sky-night', w, h);
    gfx.destroy();
  }
}
