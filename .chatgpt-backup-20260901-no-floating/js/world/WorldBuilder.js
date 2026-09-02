const THEMES={
  forest:{top:0x78b85c,light:0xa6d76c,base:0x493426,dark:0x241d24,detail:0x72503a,accent:0xff76ad},
  garden:{top:0xa8cf75,light:0xf1d7a2,base:0xb49a75,dark:0x5a4c59,detail:0xe9c98f,accent:0xe84e88},
  fortress:{top:0x75808d,light:0x8f98a3,base:0x3b3d49,dark:0x171821,detail:0x5c4655,accent:0xff765f},
  tower:{top:0xb875d0,light:0xe0a5f0,base:0x4b365e,dark:0x1d1728,detail:0x77608c,accent:0xff5bab},
  palace:{top:0xf0cf91,light:0xffe8bb,base:0xb08369,dark:0x3b2734,detail:0x7b4556,accent:0xd83f78},
};

const ARCHITECTURE={
  forest:{groundY:300,platformAY:220,platformBY:220,bridgeY:165},
  garden:{groundY:395,platformAY:450,platformBY:350,bridgeY:188},
  fortress:{groundY:310,platformAY:205,platformBY:410,bridgeY:300},
  tower:{groundY:270,platformAY:315,platformBY:290,bridgeY:288},
  palace:{groundY:410,platformAY:405,platformBY:390,bridgeY:368},
};

/** A single declarative definition creates both visible tiles and its collider. */
export default class WorldBuilder{
  constructor(scene,data){this.scene=scene;this.data=data;this.theme=THEMES[data.theme]||THEMES.forest;this.surfaces=new Map();this.doors=new Map();}

  build(){this.createThemeTextures();this.createBackground();this.data.surfaces.forEach(def=>this.createSurface(this.normalizeSurface(def)));(this.data.decorations||[]).filter(def=>def.type==='light').forEach(def=>this.createDecoration(def));if(this.isLevel1Forest())this.createForestArchitecture();this.createAtmosphere();}

  normalizeSurface(def){
    const id=def.id.toLowerCase(),bridge=/bridge|glasswalk|log/.test(id),balcony=/balcony|ledge|walk|shelf/.test(id);
    const left=def.left??(def.x??0)-def.width/2,right=def.right??(def.x??0)+def.width/2;
    return {...def,visual:def.visual||(bridge?'bridge':def.kind==='ground'?'terrain':balcony?'balcony':'platform'),walkableTop:def.top,colliderWidth:def.colliderWidth||def.width,colliderOffset:def.colliderOffset||0,supportType:def.supportType||(def.kind==='ground'?'filled':bridge?'bridge':this.data.theme==='tower'?'wall-anchor':this.data.theme==='forest'?'roots':'columns'),connection:def.connection||{left,right},hazard:def.hazard||null};
  }

  isLevel1Forest(){return this.data.theme==='forest'&&this.scene.scene.key==='Level1Scene';}

  createThemeTextures(){
    const s=this.scene,c=this.theme;if(s.textures.exists(`world-tile-${this.data.theme}-0`))return;
    for(let variant=0;variant<4;variant++){const key=`world-tile-${this.data.theme}-${variant}`,g=s.add.graphics();g.fillStyle(c.dark,1).fillRect(0,0,64,64);g.fillStyle(Phaser.Display.Color.ValueToColor(c.base).brighten(variant*3).color,1).fillRect(2,8,60,54);g.fillStyle(c.top,1).fillRect(0,0,64,10);g.fillStyle(c.light,1).fillRect(0,0,64,3);
      if(this.data.theme==='forest'){g.fillStyle(c.detail,1);g.fillRect(7+variant*3,17,7,27);g.fillRect(44-variant*2,13,6,32);g.fillTriangle(3,63,17+variant*2,31,28,63);g.fillTriangle(34,63,47,34-variant*2,62,63);g.fillStyle(0x31503a,1);for(let x=2+variant;x<64;x+=9)g.fillTriangle(x,10,x+4,2+(x%3),x+8,10);g.fillStyle(variant%2?0xff7eb2:0x9ad86c,1).fillCircle(18+variant*10,8,2);}
      if(this.data.theme==='garden'){g.lineStyle(2,c.detail,1);for(let y=16;y<64;y+=16)g.lineBetween(2,y,62,y);for(let x=10+variant*5;x<64;x+=24)g.lineBetween(x,16,x,62);g.fillStyle(c.accent,1).fillCircle(8+variant*7,7,3).fillCircle(50-variant*5,6,3);g.fillStyle(0x4f8a58,1).fillRect(0,9,64,3);}
      if(this.data.theme==='fortress'){g.lineStyle(2,0x20232d,1);for(let y=14+variant;y<64;y+=15)g.lineBetween(2,y,62,y);for(let y=15;y<64;y+=30)for(let x=10+variant*6;x<64;x+=30)g.lineBetween(x,y,x,y+15);g.fillStyle(0xb68154,1).fillRect(5+variant*4,6,4,4).fillRect(54-variant*3,6,4,4);if(variant===3)g.lineStyle(2,0x8c5063,1).lineBetween(22,20,34,34).lineBetween(34,34,27,51);}
      if(this.data.theme==='tower'){g.lineStyle(2,c.detail,1).strokeCircle(32,35,13+variant);g.fillStyle(c.accent,.85).fillCircle(26,31,6).fillCircle(38,31,6).fillTriangle(20,34,44,34,32,49);g.fillStyle(0xd9b85f,1).fillRect(4,7,56,3);if(variant%2)g.fillStyle(0xf4b9ff,.8).fillRect(8,20,4,27);}
      if(this.data.theme==='palace'){g.lineStyle(2,c.detail,1).lineBetween(2,18,62,18).lineBetween(2,43,62,43).lineBetween(14+variant*7,18,14+variant*7,43);g.fillStyle(0xd39a43,1).fillRect(0,5,64,4).fillRect(27+variant,9,5,45);if(variant===2)g.fillStyle(0xa52e61,1).fillRect(4,13,18,38);}
      g.generateTexture(key,64,64);g.destroy();}
    const support=`world-support-${this.data.theme}`,p=s.add.graphics();p.fillStyle(c.dark,1).fillRect(4,0,16,64);p.fillStyle(c.base,1).fillRect(7,0,10,57);p.fillStyle(c.light,1).fillRect(7,0,3,57);p.fillStyle(c.detail,1).fillRect(1,54,22,10);p.generateTexture(support,24,64);p.destroy();
    const bridge=`world-bridge-${this.data.theme}`,b=s.add.graphics();b.fillStyle(c.dark,1).fillRect(0,18,64,18);b.fillStyle(c.detail,1).fillRect(0,15,64,14);b.fillStyle(c.light,1);for(let x=2;x<64;x+=16)b.fillRect(x,13,12,4);b.lineStyle(3,c.accent,.8).lineBetween(0,8,64,8);b.fillStyle(c.dark,1).fillRect(2,0,4,34).fillRect(58,0,4,34);b.generateTexture(bridge,64,38);b.destroy();
    const bracket=`world-bracket-${this.data.theme}`,a=s.add.graphics();a.fillStyle(c.dark,1).fillRect(0,0,64,12).fillRect(48,0,16,64);a.fillStyle(c.base,1).fillTriangle(6,12,48,12,48,54);a.lineStyle(3,c.light,1).lineBetween(10,14,47,48);a.generateTexture(bracket,64,64);a.destroy();
    const banner=`world-banner-${this.data.theme}`,n=s.add.graphics();n.fillStyle(0xd5b25a,1).fillRect(29,0,6,24).fillRect(9,20,46,5);n.fillStyle(c.dark,1).fillRect(12,25,40,105);n.fillStyle(c.accent,1).fillRect(16,29,32,88);n.fillStyle(c.light,.85).fillRect(20,38,24,5);n.fillStyle(c.dark,1).fillTriangle(12,130,32,112,52,130);n.generateTexture(banner,64,132);n.destroy();
    for(let variant=0;variant<3;variant++){const key=`world-arena-${this.data.theme}-${variant}`,r=s.add.graphics();r.fillStyle(c.dark,1).fillRect(0,0,64,64);r.fillStyle(c.base,1).fillRect(0,8,64,56);r.fillStyle(c.top,1).fillRect(0,0,64,10);r.fillStyle(c.light,.9).fillRect(0,0,64,3);if(this.data.theme==='forest'){r.fillStyle(0x31503a,1).fillTriangle(0,11,12+variant*5,2,27,11).fillTriangle(28,11,46,1+variant*2,64,11);r.fillStyle(0x84664d,1).fillCircle(14+variant*17,18,5).fillCircle(48-variant*9,23,3);r.fillStyle(0xff7eb2,1).fillCircle(35+variant*4,7,2);}else if(this.data.theme==='garden'){r.fillStyle(0xdac596,1).fillRect(0,10,64,7);r.fillStyle(0x568755,1);for(let x=4+variant*6;x<64;x+=18)r.fillCircle(x,9,5);r.fillStyle(0xe84e88,1).fillCircle(13+variant*12,7,3);}else if(this.data.theme==='fortress'){r.lineStyle(2,0x222530,1).lineBetween(0,21,64,21).lineBetween(18+variant*8,9,18+variant*8,64);r.lineStyle(2,0x986757,.7).lineBetween(42,22,35,39).lineBetween(35,39,49,53);}else if(this.data.theme==='tower'){r.fillStyle(0xd7a3ec,.75).fillRect(0,7,64,4);r.fillStyle(0xff5bab,.8).fillCircle(14+variant*18,25,5);r.lineStyle(2,0xe7c1f5,.7).lineBetween(0,40+variant*4,64,30+variant*5);}else{r.fillStyle(0xd39a43,1).fillRect(0,6,64,5);r.fillStyle(0x7b4556,1).fillRect(5,17,54,5).fillRect(5,48,54,5);r.fillStyle(0xa52e61,.75).fillRect(26+variant*4,12,12,43);}r.generateTexture(key,64,64);r.destroy();}
  }

  createBackground(){
    const s=this.scene,d=this.data,theme=d.theme;
    s.physics.world.setBounds(0,0,d.width,d.height||720);
    s.cameras.main.setBackgroundColor(d.sky);

    const key=`world-depth-${theme}`;
    if(!s.textures.exists(key)){
      const g=s.add.graphics(),night=theme==='forest'||theme==='fortress'||theme==='tower';
      const top=night?0x10152d:0x3d1f39;
      const mid=night?0x1d2544:0x59304b;
      const low=night?0x2b3554:0x72405d;

      g.fillStyle(top,1).fillRect(0,0,1280,720);
      g.fillStyle(mid,.55).fillRect(0,220,1280,500);
      g.fillStyle(low,.28).fillRect(0,390,1280,330);

      g.fillStyle(night?0x33405f:0x87516f,.32);
      for(let x=-80;x<1360;x+=230){
        const peak=300+(x%310);
        g.fillTriangle(x,650,x+120,peak,x+280,650);
      }
      g.generateTexture(key,1280,720);
      g.destroy();
    }

    s.add.image(640,360,key)
      .setDisplaySize(1280,720)
      .setScrollFactor(0)
      .setDepth(-42);

    const scenic={
      garden:['bg-garden',0x8b6784,.30],
      fortress:['bg-castle',0x59627a,.27],
      tower:['bg-boss',0x55456d,.25],
      palace:['bg-castle',0x8b6473,.27],
    }[theme];

    if(scenic&&s.textures.exists(scenic[0])){
      s.add.image(640,360,scenic[0])
        .setDisplaySize(1280,720)
        .setScrollFactor(0)
        .setDepth(-40)
        .setTint(scenic[1])
        .setAlpha(scenic[2]);
    }

    if(this.isLevel1Forest()){
      const frames=['treeTall','treeWide','treeTwisted','treeRoots'];
      for(let x=120;x<d.width;x+=430){
        s.add.image(x,610,'forest-remaster-atlas',frames[Math.floor(x/430)%frames.length])
          .setOrigin(.5,1).setScale(.78).setTint(0x202f48).setAlpha(.38)
          .setScrollFactor(.16).setDepth(-20);
      }
    }
  }

  createSurface(def){
    const s=this.scene,top=def.walkableTop,width=def.width,x=def.x??0,
      left=def.left??x-width/2,right=def.right??x+width/2,center=(left+right)/2,
      art=[],spec=ARCHITECTURE[this.data.theme],texture=`architecture-${this.data.theme}`;

    if(def.kind==='ground'){
      const visualStep=this.data.theme==='forest'?390:420;
      const count=Math.max(1,Math.ceil(width/visualStep));
      const scale=this.data.theme==='forest'?.86:.82;
      const span=width/count;

      for(let i=0;i<count;i++){
        const px=left+span*(i+.5);
        const piece=s.add.image(px,top,texture,'ground')
          .setOrigin(.5,spec.groundY/512)
          .setScale(scale)
          .setDepth(10)
          .setFlipX(i%2===1);
        art.push(piece);
      }
    }else{
      const isBridge=def.visual==='bridge';
      const frame=isBridge?'bridge':def.supportType==='wall-anchor'?'platformB':'platformA';
      const surfaceY=spec[`${frame}Y`]??spec.platformAY;
      const scale=Phaser.Math.Clamp(width/410,.46,.82);

      const piece=s.add.image(center,top,texture,frame)
        .setOrigin(.5,surfaceY/512)
        .setScale(scale)
        .setDepth(12)
        .setFlipX((def.id.length%2)===0);
      art.push(piece);

      this.createStructuralSupports(def,{left,right,center,top,width,art,texture});
    }

    const colliderWidth=def.colliderWidth,
      body=this.createStaticSurfaceBody(center+def.colliderOffset,top,colliderWidth,def.id),
      record={...def,left,right,x:center,top,width,body,bodies:[body],art,structuralArt:true};

    this.surfaces.set(def.id,record);
    return record;
  }

  createStructuralSupports(def,ctx){
    const s=this.scene,theme=this.data.theme,{left,right,center,top,width,art,texture}=ctx;
    const floorY=this.findStructuralFloor(top,center);
    const gap=Math.max(0,floorY-top);

    if(gap<70)return;

    const isBridge=def.visual==='bridge'||/bridge|log|walk/i.test(def.id);
    const points=isBridge&&width>150
      ? [left+Math.min(52,width*.24),right-Math.min(52,width*.24)]
      : [center];

    for(const px of points){
      if(theme==='forest'){
        const usable=Math.min(gap+30,420);
        const scale=Phaser.Math.Clamp(usable/480,.42,.86);
        const support=s.add.image(px,floorY+12,'architecture-forest','landmark')
          .setOrigin(.5,1).setScale(scale).setDepth(9).setAlpha(.90);
        if(Math.floor(px/80)%2)support.setFlipX(true);
        art.push(support);
      }else if(theme==='garden'){
        const segments=Math.max(1,Math.ceil(gap/250));
        for(let i=0;i<segments;i++){
          const sy=floorY-i*205;
          const support=s.add.image(px,sy,texture,'landmark')
            .setOrigin(.5,1).setScale(.45).setDepth(8).setAlpha(.82);
          if((i+Math.floor(px/100))%2)support.setFlipX(true);
          art.push(support);
        }
      }else if(theme==='fortress'){
        const segments=Math.max(1,Math.ceil(gap/230));
        for(let i=0;i<segments;i++){
          const sy=floorY-i*205;
          const support=s.add.image(px,sy,texture,'landmark')
            .setOrigin(.5,1).setScale(.50).setDepth(8).setAlpha(.88);
          art.push(support);
        }
      }else if(theme==='tower'){
        const wall=s.add.image(px,floorY+18,texture,'landmark')
          .setOrigin(.5,1)
          .setScale(Phaser.Math.Clamp(gap/500,.48,.92))
          .setDepth(7).setAlpha(.84);
        art.push(wall);

        const bracket=s.add.image(center,top+10,texture,'platformB')
          .setOrigin(.5,.15).setScale(Phaser.Math.Clamp(width/600,.34,.58))
          .setDepth(10).setAlpha(.88);
        art.push(bracket);
      }else if(theme==='palace'){
        const segments=Math.max(1,Math.ceil(gap/250));
        for(let i=0;i<segments;i++){
          const sy=floorY-i*210;
          const support=s.add.image(px,sy,texture,'landmark')
            .setOrigin(.5,1).setScale(.50).setDepth(8).setAlpha(.88);
          if((i+Math.floor(px/120))%2)support.setFlipX(true);
          art.push(support);
        }
      }
    }
  }

  findStructuralFloor(top,x){const below=this.data.surfaces.filter(s=>s.kind==='ground'&&x>=(s.left??0)&&x<=(s.right??this.data.width)&&s.top>top).sort((a,b)=>a.top-b.top)[0];return below?.top??Math.min(this.data.height||720,top+230);}
  isArenaPoint(x){const arenas=this.data.arenas||(this.data.arena?[this.data.arena]:[]);return arenas.some(arena=>x>=arena.start&&x<=arena.end);}

  createStaticSurfaceBody(x,top,width,id){const body=this.scene.add.rectangle(x,top+12,width,24,0,0).setVisible(false).setName(`surface:${id}`);this.scene.physics.add.existing(body,true);this.scene.solids.add(body);return body;}

  createDoor(def){
    const s=this.scene,c=this.theme,w=def.width||104,h=def.height||230,arena=def.kind==='arena',key=`world-door-${this.data.theme}-${def.kind||'puzzle'}`,frameKey=`world-door-frame-${this.data.theme}-${w}-${h}`;
    if(!s.textures.exists(key)){const g=s.add.graphics();if(arena){if(this.data.theme==='garden'){g.fillStyle(0x315a3f,1).fillRect(7,0,w-14,h);g.fillStyle(0x65965b,1);for(let y=8;y<h;y+=22)for(let x=12;x<w-8;x+=20)g.fillCircle(x,y,12);g.fillStyle(0xe84e88,1);for(let y=18;y<h;y+=38)g.fillCircle(w/2+(y%3-1)*20,y,5);}else if(this.data.theme==='fortress'){g.fillStyle(0x252733,1).fillRect(0,0,w,16);for(let x=8;x<w;x+=15)g.fillRect(x,0,8,h);g.fillStyle(0x8f98a3,1).fillRect(0,22,w,7).fillRect(0,h-30,w,7);}else if(this.data.theme==='tower'){g.fillStyle(0x4b365e,.82).fillRect(5,0,w-10,h);g.lineStyle(5,0xff5bab,.95);for(let y=4;y<h;y+=20)g.lineBetween(3,y,w-3,y+10);g.fillStyle(0xe0a5f0,1).fillCircle(w/2,20,10).fillCircle(w/2,h-20,10);}else{g.fillStyle(0x3b2734,1).fillRect(0,0,w,h);g.fillStyle(0xb08369,1).fillRect(7,7,w-14,h-7);g.fillStyle(0xd39a43,1).fillRect(w/2-4,8,8,h-16).fillRect(9,35,w-18,6).fillRect(9,h-45,w-18,6);}}else{g.fillStyle(c.dark,1).fillRect(0,0,w,h);g.fillStyle(c.base,1).fillRect(8,8,w-16,h-8);g.fillStyle(c.detail,1);for(let y=28;y<h-20;y+=28)g.fillRect(16,y,w-32,7);g.fillStyle(c.accent,1).fillCircle(w/2,52,14);g.fillStyle(0xffe1a0,1).fillCircle(w/2,52,5);}g.generateTexture(key,w,h);g.destroy();}
    if(!arena&&!s.textures.exists(frameKey)){const f=s.add.graphics(),fw=w+82;f.fillStyle(c.dark,1).fillRect(0,0,24,h).fillRect(fw-24,0,24,h).fillRect(0,0,fw,28);f.fillStyle(c.base,1).fillRect(5,0,14,h).fillRect(fw-19,0,14,h).fillRect(5,5,fw-10,15);f.fillStyle(c.light,1).fillRect(7,0,4,h).fillRect(fw-11,0,4,h);f.fillStyle(c.accent,.7).fillRect(0,24,fw,5);f.generateTexture(frameKey,fw,h);f.destroy();}
    const forestPuzzle=this.isLevel1Forest()&&def.kind==='puzzle';let art,leaf,frame=null;if(arena){leaf=s.add.image(def.x,def.y,`architecture-${this.data.theme}`,'gate').setOrigin(.5,1).setScale(.58).setDepth(26);art=leaf;}else if(forestPuzzle){frame=s.add.image(def.x,def.y,'forest-remaster-atlas','memoryGate').setOrigin(.5,1).setScale(.86).setDepth(25);leaf=s.add.image(def.x,def.y-5,'forest-remaster-atlas','memoryDoorLeaf').setOrigin(.5,1).setScale(.86).setDepth(26);art=frame;}else{frame=s.add.image(def.x,def.y,`architecture-${this.data.theme}`,'landmark').setOrigin(.5,1).setScale(.72).setDepth(24);leaf=s.add.image(def.x,def.y,key).setOrigin(.5,1).setDepth(26);art=leaf;}const body=s.add.rectangle(def.x,def.y-h/2,w-26,h,0,0).setVisible(false);s.physics.add.existing(body,true);s.solids.add(body);const door={...def,art,leaf,frame,body,x:def.x,y:def.y,forestPuzzle};this.doors.set(def.id,door);return door;
  }

  createDecoration(def){const s=this.scene;if(def.type==='light'){const mote=s.add.image(def.x,def.y,'collectible-star').setScale(.35).setTint(this.theme.accent).setAlpha(.55).setDepth(def.front?18:4);s.tweens.add({targets:mote,y:def.y-18,x:def.x+12,alpha:.15,duration:1300+(def.x%700),yoyo:true,repeat:-1});}else if(def.type==='column'){if(this.isLevel1Forest())return;for(let y=def.y;y<def.bottom;y+=64)s.add.image(def.x,y,`world-support-${this.data.theme}`).setDepth(def.front?18:5).setAlpha(def.front?.9:.55);}else if(def.type==='banner'){s.add.image(def.x,def.y,`world-banner-${this.data.theme}`).setOrigin(.5,0).setDepth(5).setAlpha(.72);}}

  createAmbientDecor(){
    const s=this.scene,theme=this.data.theme;

    if(this.isLevel1Forest()){
      const variants=['treeTall','treeWide','treeTwisted','treeFlowers','treeRoots','treeLights'];
      let i=0;
      for(const surface of this.surfaces.values()){
        if(surface.kind!=='ground')continue;
        for(let x=surface.left+170;x<surface.right-90;x+=345){
          const frame=variants[i++%variants.length];
          const art=s.add.image(x,surface.top+8,'forest-remaster-atlas',frame)
            .setOrigin(.5,1).setDepth(i%4===0?16:4).setScale(.60+(i%2)*.07);
          if(i%2)art.setFlipX(true);
        }
      }
      return;
    }

    const texture=`architecture-${theme}`;
    const spacing={garden:760,fortress:720,tower:620,palace:780}[theme]||760;
    let n=0;
    for(const surface of this.surfaces.values()){
      if(surface.kind!=='ground')continue;
      for(let x=surface.left+spacing*.45;x<surface.right-spacing*.2;x+=spacing){
        const frame=n++%3===0?'gate':'landmark';
        const scale=theme==='garden'?.52:theme==='fortress'?.58:theme==='palace'?.58:.55;
        const art=s.add.image(x,surface.top+8,texture,frame)
          .setOrigin(.5,1).setScale(scale).setDepth(4).setAlpha(.68);
        if(n%2)art.setFlipX(true);
      }
    }

    // Los soportes de plataformas se generan en createStructuralSupports(); no duplicarlos aquí.
  }

  createForestArchitecture(){
    const s=this.scene;
    s.add.image(640,360,'forest-sky-parallax')
      .setDisplaySize(1280,720).setScrollFactor(0).setDepth(-29)
      .setTint(0x767694).setAlpha(.30);

    const caveTop=405,left=3240,right=4320;

    s.add.image(left+95,648,'forest-remaster-atlas','rootArch')
      .setOrigin(.5,1).setScale(.92).setDepth(17);
    s.add.image(right-95,648,'forest-remaster-atlas','rootArch')
      .setOrigin(.5,1).setScale(.92).setFlipX(true).setDepth(17);

    for(const x of [3440,3820,4200]){
      s.add.image(x,648,'forest-remaster-atlas','rootTunnel')
        .setOrigin(.5,1).setScale(.92).setDepth(15);
    }

    this.tunnelCeiling=this.createStaticSurfaceBody((left+right)/2,caveTop,right-left,'tunnel-ceiling');
    this.tunnelStructure={left,right,top:caveTop,ceiling:this.tunnelCeiling};

    s.add.image(2870,648,'architecture-forest','bridge')
      .setOrigin(.5,1).setScale(.78).setDepth(13);

    this.memoryTree=s.add.image(6700,648,'forest-remaster-atlas','memoryTree')
      .setOrigin(.5,1).setScale(1.2).setAlpha(.24).setDepth(14);
  }

  createAtmosphere(){const s=this.scene,count=s.sys.game.device.os.desktop?28:12,theme=this.data.theme;for(let i=0;i<count;i++){const symbol=theme==='fortress'?'│':theme==='garden'?'•':theme==='forest'?'✦':theme==='tower'?'◆':'·',p=s.add.text((i+.5)*this.data.width/count,(i*83)%620,symbol,{fontFamily:'monospace',fontSize:theme==='fortress'?'18px':'11px',color:theme==='fortress'?'#9dc7e8':theme==='garden'?'#ff9fbd':this.theme===THEMES.forest?'#f6dc78':'#f3a3dc'}).setAlpha(.25+(i%3)*.12).setDepth(6);s.tweens.add({targets:p,x:p.x+(theme==='fortress'?-150:80),y:p.y+(theme==='fortress'?240:-35),alpha:.05,duration:2600+(i%5)*430,repeat:-1});}}

  getSurface(id){return this.surfaces.get(id);}
  openDoor(door){if(!door)return;door.body.body.enable=false;if(door.forestPuzzle){this.scene.tweens.add({targets:door.leaf,y:door.y-205,alpha:.08,duration:900,ease:'Cubic.easeIn'});for(let i=0;i<18;i++){const p=this.scene.add.image(door.x+(Math.random()-.5)*180,door.y-80-Math.random()*150,'collectible-rose').setScale(.35).setDepth(30);this.scene.tweens.add({targets:p,x:p.x+(Math.random()-.5)*140,y:p.y-90,alpha:0,duration:900,onComplete:()=>p.destroy()});}}else this.scene.tweens.add({targets:door.leaf||door.art,y:door.y-180,alpha:.08,duration:850,ease:'Cubic.easeIn'});}
}
