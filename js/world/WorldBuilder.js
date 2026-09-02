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

const GROUNDED_SURFACE_Y={forest:160,garden:166,fortress:168,tower:196,palace:174};

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
      const base=night?0x12162f:0x48243e;
      g.fillStyle(base,1).fillRect(0,0,1280,720);

      g.fillStyle(night?0x252f4d:0x68405a,.42);
      for(let x=-180;x<1450;x+=250){
        const peak=260+Math.abs((x*7)%210);
        g.fillTriangle(x,760,x+135,peak,x+315,760);
      }

      g.fillStyle(night?0x1a2139:0x553249,.38);
      for(let x=-120;x<1450;x+=190){
        const h=120+Math.abs((x*3)%110);
        g.fillTriangle(x,760,x+95,760-h,x+220,760);
      }

      g.generateTexture(key,1280,720);
      g.destroy();
    }

    s.add.image(640,360,key)
      .setDisplaySize(1280,720).setScrollFactor(0).setDepth(-42);

    const scenic={
      garden:['bg-garden',0x7c6079,.24],
      fortress:['bg-castle',0x505a70,.22],
      tower:['bg-boss',0x514264,.21],
      palace:['bg-castle',0x765466,.22],
    }[theme];

    if(scenic&&s.textures.exists(scenic[0])){
      s.add.image(640,360,scenic[0])
        .setDisplaySize(1280,720).setScrollFactor(0).setDepth(-40)
        .setTint(scenic[1]).setAlpha(scenic[2]);
    }

    if(this.isLevel1Forest()){
      const frames=['treeTall','treeWide','treeTwisted','treeRoots'];
      for(let x=120;x<d.width;x+=430){
        s.add.image(x,610,'forest-remaster-atlas',frames[Math.floor(x/430)%frames.length])
          .setOrigin(.5,1).setScale(.78).setTint(0x202f48)
          .setAlpha(.34).setScrollFactor(.16).setDepth(-20);
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
          .setOrigin(.5,spec.groundY/512).setScale(scale)
          .setDepth(10).setFlipX(i%2===1);
        art.push(piece);
      }
    }else{
      const surfaceY=GROUNDED_SURFACE_Y[this.data.theme],scale=Phaser.Math.Clamp((width+36)/341,.58,.92);
      const piece=s.add.image(center,top,`grounded-${this.data.theme}`)
        .setOrigin(.5,surfaceY/768).setScale(scale)
        .setDepth(11).setFlipX((def.id.length%2)===0);
      art.push(piece);
    }

    const colliderWidth=def.colliderWidth,
      body=this.createStaticSurfaceBody(center+def.colliderOffset,top,colliderWidth,def.id),
      record={...def,left,right,x:center,top,width,body,bodies:[body],art,structuralArt:true};
    this.surfaces.set(def.id,record);
    return record;
  }

  createGroundedSupports(def,ctx){
    const s=this.scene,theme=this.data.theme,{left,right,center,top,width,art}=ctx;
    const floorY=this.findStructuralFloor(top,center);
    const gap=floorY-top;
    if(gap<58)return;

    const bridge=def.visual==='bridge'||/bridge|log|walk/i.test(def.id);
    const supportXs=bridge&&width>145
      ? [left+Math.min(45,width*.22),right-Math.min(45,width*.22)]
      : width>260?[center-width*.27,center+width*.27]:[center];

    if(theme==='forest'){
      for(const sx of supportXs){
        const frame=(Math.floor(sx/100)%2)?'rootPlatform':'rockPlatform';
        const rawH=195;
        const targetH=Math.min(Math.max(gap+55,150),360);
        const scale=targetH/rawH;
        const root=s.add.image(sx,floorY+42,'forest-remaster-atlas',frame)
          .setOrigin(.5,1).setScale(scale).setDepth(9).setAlpha(.98);
        if(Math.floor(sx/70)%2)root.setFlipX(true);
        art.push(root);
      }
      return;
    }

    const key=`world-support-${theme}`;
    for(const sx of supportXs){
      const step=54;
      const start=top+18;
      const end=floorY+34;
      for(let y=start;y<end;y+=step){
        const remaining=end-y;
        const sy=y+Math.min(step,remaining)/2;
        const seg=s.add.image(sx,sy,key).setDepth(9).setAlpha(.96);
        seg.displayHeight=Math.min(step+10,remaining+10);
        seg.displayWidth=theme==='fortress'?30:theme==='palace'?28:24;
        art.push(seg);
      }
    }
  }

  findStructuralFloor(top,x){const below=this.data.surfaces.filter(s=>s.kind==='ground'&&x>=(s.left??0)&&x<=(s.right??this.data.width)&&s.top>top).sort((a,b)=>a.top-b.top)[0];return below?.top??Math.min(this.data.height||720,top+230);}
  isArenaPoint(x){const arenas=this.data.arenas||(this.data.arena?[this.data.arena]:[]);return arenas.some(arena=>x>=arena.start&&x<=arena.end);}

  createStaticSurfaceBody(x,top,width,id){const body=this.scene.add.rectangle(x,top+12,width,24,0,0).setVisible(false).setName(`surface:${id}`);this.scene.physics.add.existing(body,true);this.scene.solids.add(body);return body;}

  createDoor(def){
    const s=this.scene,c=this.theme,w=def.width||104,h=def.height||230,
      arena=def.kind==='arena',
      key=`world-door-${this.data.theme}-${def.kind||'puzzle'}`,
      frameKey=`world-door-frame-${this.data.theme}-${w}-${h}`;

    if(!s.textures.exists(key)){
      const g=s.add.graphics();
      if(arena){
        if(this.data.theme==='forest'){
          g.fillStyle(0x291a2a,1).fillRect(10,0,w-20,h);
          g.lineStyle(8,0x5a3d32,1);
          for(let y=10;y<h;y+=30){
            g.lineBetween(4,y,w-4,Math.min(h,y+26));
            g.lineBetween(w-4,y,4,Math.min(h,y+26));
          }
          g.fillStyle(0x31503a,1);
          for(let y=12;y<h;y+=25){
            g.fillCircle(8,y,7);g.fillCircle(w-8,y+8,7);
          }
          g.fillStyle(0xff6ea9,1);
          for(let y=24;y<h-20;y+=48)g.fillCircle(w/2,y,4);
        }else if(this.data.theme==='garden'){
          g.fillStyle(0x315a3f,1).fillRect(7,0,w-14,h);
          g.fillStyle(0x65965b,1);
          for(let y=8;y<h;y+=22)for(let x=12;x<w-8;x+=20)g.fillCircle(x,y,11);
          g.fillStyle(0xe84e88,1);
          for(let y=18;y<h;y+=38)g.fillCircle(w/2,y,5);
        }else if(this.data.theme==='fortress'){
          g.fillStyle(0x252733,1).fillRect(0,0,w,h);
          g.fillStyle(0x8f98a3,1);
          for(let x=8;x<w;x+=15)g.fillRect(x,0,8,h);
          g.fillRect(0,20,w,7).fillRect(0,h-28,w,7);
        }else if(this.data.theme==='tower'){
          g.fillStyle(0x342743,.92).fillRect(5,0,w-10,h);
          g.lineStyle(5,0xff5bab,.95);
          for(let y=4;y<h;y+=20)g.lineBetween(3,y,w-3,y+10);
          g.fillStyle(0xe0a5f0,1).fillCircle(w/2,20,9).fillCircle(w/2,h-20,9);
        }else{
          g.fillStyle(0x3b2734,1).fillRect(0,0,w,h);
          g.fillStyle(0xb08369,1).fillRect(7,7,w-14,h-7);
          g.fillStyle(0xd39a43,1)
            .fillRect(w/2-4,8,8,h-16)
            .fillRect(9,35,w-18,6)
            .fillRect(9,h-45,w-18,6);
        }
      }else{
        g.fillStyle(c.dark,1).fillRect(0,0,w,h);
        g.fillStyle(c.base,1).fillRect(8,8,w-16,h-8);
        g.fillStyle(c.detail,1);
        for(let y=28;y<h-20;y+=28)g.fillRect(16,y,w-32,7);
        g.fillStyle(c.accent,1).fillCircle(w/2,52,14);
        g.fillStyle(0xffe1a0,1).fillCircle(w/2,52,5);
      }
      g.generateTexture(key,w,h);g.destroy();
    }

    if(!arena&&!s.textures.exists(frameKey)){
      const f=s.add.graphics(),fw=w+82;
      f.fillStyle(c.dark,1).fillRect(0,0,24,h).fillRect(fw-24,0,24,h).fillRect(0,0,fw,28);
      f.fillStyle(c.base,1).fillRect(5,0,14,h).fillRect(fw-19,0,14,h).fillRect(5,5,fw-10,15);
      f.fillStyle(c.light,1).fillRect(7,0,4,h).fillRect(fw-11,0,4,h);
      f.fillStyle(c.accent,.7).fillRect(0,24,fw,5);
      f.generateTexture(frameKey,fw,h);f.destroy();
    }

    const forestPuzzle=this.isLevel1Forest()&&def.kind==='puzzle';
    let art,leaf,frame=null;

    if(arena){
      leaf=s.add.image(def.x,def.y+8,`architecture-${this.data.theme}`,'gate')
        .setOrigin(.5,1).setScale(.48).setDepth(26);
      art=leaf;
    }else if(forestPuzzle){
      frame=s.add.image(def.x,def.y+18,'forest-remaster-atlas','memoryGate')
        .setOrigin(.5,1).setScale(.86).setDepth(25);
      leaf=s.add.image(def.x,def.y+13,'forest-remaster-atlas','memoryDoorLeaf')
        .setOrigin(.5,1).setScale(.86).setDepth(26);
      art=frame;
    }else{
      leaf=s.add.image(def.x,def.y+8,`architecture-${this.data.theme}`,'gate')
        .setOrigin(.5,1).setScale(.58).setDepth(26);
      art=leaf;
    }

    const body=s.add.rectangle(def.x,def.y-h/2,w-26,h,0,0).setVisible(false);
    s.physics.add.existing(body,true);s.solids.add(body);
    const door={...def,art,leaf,frame,body,x:def.x,y:def.y,forestPuzzle};
    this.doors.set(def.id,door);
    return door;
  }

  createDecoration(def){const s=this.scene;if(def.type==='light'){const mote=s.add.image(def.x,def.y,'collectible-star').setScale(.35).setTint(this.theme.accent).setAlpha(.55).setDepth(def.front?18:4);s.tweens.add({targets:mote,y:def.y-18,x:def.x+12,alpha:.15,duration:1300+(def.x%700),yoyo:true,repeat:-1});}else if(def.type==='column'){if(this.isLevel1Forest())return;for(let y=def.y;y<def.bottom;y+=64)s.add.image(def.x,y,`world-support-${this.data.theme}`).setDepth(def.front?18:5).setAlpha(def.front?.9:.55);}else if(def.type==='banner'){s.add.image(def.x,def.y,`world-banner-${this.data.theme}`).setOrigin(.5,0).setDepth(5).setAlpha(.72);}}

  createAmbientDecor(){
    const s=this.scene,theme=this.data.theme;

    if(this.isLevel1Forest()){
      const variants=['treeTall','treeWide','treeTwisted','treeFlowers','treeRoots','treeLights'];
      let i=0;
      for(const surface of this.surfaces.values()){
        if(surface.kind!=='ground')continue;
        for(let x=surface.left+210;x<surface.right-120;x+=520){
          const frame=variants[i++%variants.length];
          const art=s.add.image(x,surface.top+16,'forest-remaster-atlas',frame)
            .setOrigin(.5,1).setDepth(i%4===0?16:4).setScale(.54+(i%2)*.05);
          if(i%2)art.setFlipX(true);
        }
      }
      return;
    }

    const texture=`architecture-${theme}`;
    const grounds=[...this.surfaces.values()].filter(x=>x.kind==='ground');
    grounds.forEach((surface,i)=>{
      const x=(surface.left+surface.right)/2;
      if(surface.width<700)return;
      const art=s.add.image(x,surface.top+55,texture,'landmark')
        .setOrigin(.5,1)
        .setScale(theme==='fortress'?.34:theme==='palace'?.36:.32)
        .setDepth(3).setAlpha(.28);
      if(i%2)art.setFlipX(true);
    });
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

    s.add.image((left+right)/2,648,'grounded-tunnel')
      .setOrigin(.5,1).setScale(1.34).setDepth(15);
    s.add.image(left+370,648,'forest-remaster-atlas','rootTunnel')
      .setOrigin(.5,1).setScale(.86).setDepth(14);
    s.add.image(right-370,648,'forest-remaster-atlas','rootTunnel')
      .setOrigin(.5,1).setScale(.82).setFlipX(true).setDepth(14);

    this.tunnelCeiling=this.createStaticSurfaceBody((left+right)/2,caveTop,right-left,'tunnel-ceiling');
    this.tunnelStructure={left,right,top:caveTop,ceiling:this.tunnelCeiling};

    this.memoryTree=s.add.image(6700,648,'forest-remaster-atlas','memoryTree')
      .setOrigin(.5,1).setScale(1.2).setAlpha(.24).setDepth(14);
  }

  createAtmosphere(){const s=this.scene,count=s.sys.game.device.os.desktop?28:12,theme=this.data.theme;for(let i=0;i<count;i++){const symbol=theme==='fortress'?'│':theme==='garden'?'•':theme==='forest'?'✦':theme==='tower'?'◆':'·',p=s.add.text((i+.5)*this.data.width/count,(i*83)%620,symbol,{fontFamily:'monospace',fontSize:theme==='fortress'?'18px':'11px',color:theme==='fortress'?'#9dc7e8':theme==='garden'?'#ff9fbd':this.theme===THEMES.forest?'#f6dc78':'#f3a3dc'}).setAlpha(.25+(i%3)*.12).setDepth(6);s.tweens.add({targets:p,x:p.x+(theme==='fortress'?-150:80),y:p.y+(theme==='fortress'?240:-35),alpha:.05,duration:2600+(i%5)*430,repeat:-1});}}

  getSurface(id){return this.surfaces.get(id);}
  openDoor(door){if(!door)return;door.body.body.enable=false;if(door.forestPuzzle){this.scene.tweens.add({targets:door.leaf,y:door.y-205,alpha:.08,duration:900,ease:'Cubic.easeIn'});for(let i=0;i<18;i++){const p=this.scene.add.image(door.x+(Math.random()-.5)*180,door.y-80-Math.random()*150,'collectible-rose').setScale(.35).setDepth(30);this.scene.tweens.add({targets:p,x:p.x+(Math.random()-.5)*140,y:p.y-90,alpha:0,duration:900,onComplete:()=>p.destroy()});}}else this.scene.tweens.add({targets:door.leaf||door.art,y:door.y-180,alpha:.08,duration:850,ease:'Cubic.easeIn'});}
}
