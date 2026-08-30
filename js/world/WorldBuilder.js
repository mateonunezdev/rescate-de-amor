const THEMES={
  forest:{top:0x78b85c,light:0xa6d76c,base:0x493426,dark:0x241d24,detail:0x72503a,accent:0xff76ad},
  garden:{top:0xa8cf75,light:0xf1d7a2,base:0xb49a75,dark:0x5a4c59,detail:0xe9c98f,accent:0xe84e88},
  fortress:{top:0x75808d,light:0x8f98a3,base:0x3b3d49,dark:0x171821,detail:0x5c4655,accent:0xff765f},
  tower:{top:0xb875d0,light:0xe0a5f0,base:0x4b365e,dark:0x1d1728,detail:0x77608c,accent:0xff5bab},
  palace:{top:0xf0cf91,light:0xffe8bb,base:0xb08369,dark:0x3b2734,detail:0x7b4556,accent:0xd83f78},
};

/** A single declarative definition creates both visible tiles and its collider. */
export default class WorldBuilder{
  constructor(scene,data){this.scene=scene;this.data=data;this.theme=THEMES[data.theme]||THEMES.forest;this.surfaces=new Map();this.doors=new Map();}

  build(){this.createThemeTextures();this.createBackground();this.data.surfaces.forEach(def=>this.createSurface(def));(this.data.decorations||[]).forEach(def=>this.createDecoration(def));}

  createThemeTextures(){
    const s=this.scene,key=`world-tile-${this.data.theme}`;if(s.textures.exists(key))return;
    const g=s.add.graphics(),c=this.theme;
    g.fillStyle(c.dark,1).fillRect(0,0,64,64);g.fillStyle(c.base,1).fillRect(2,8,60,54);g.fillStyle(c.top,1).fillRect(0,0,64,10);g.fillStyle(c.light,1).fillRect(0,0,64,3);
    if(this.data.theme==='forest'){g.fillStyle(c.detail,1);g.fillRect(8,18,8,25);g.fillRect(42,14,7,31);g.fillTriangle(5,63,18,30,27,63);g.fillTriangle(35,63,47,32,60,63);g.fillStyle(0x31503a,1);for(let x=3;x<64;x+=9)g.fillTriangle(x,10,x+4,3,x+8,10);}
    if(this.data.theme==='garden'){g.lineStyle(2,c.detail,1);for(let y=16;y<64;y+=16)g.lineBetween(2,y,62,y);for(let x=14;x<64;x+=24)g.lineBetween(x,16,x,62);g.fillStyle(c.accent,1);g.fillCircle(10,7,3);g.fillCircle(48,6,3);}
    if(this.data.theme==='fortress'){g.lineStyle(2,0x20232d,1);for(let y=15;y<64;y+=15)g.lineBetween(2,y,62,y);for(let y=15;y<64;y+=30)for(let x=15;x<64;x+=30)g.lineBetween(x,y,x,y+15);g.fillStyle(0xb68154,1);g.fillRect(6,6,4,4);g.fillRect(54,6,4,4);}
    if(this.data.theme==='tower'){g.lineStyle(2,c.detail,1);g.strokeCircle(32,35,15);g.fillStyle(c.accent,.85);g.fillCircle(26,31,6);g.fillCircle(38,31,6);g.fillTriangle(20,34,44,34,32,49);g.fillStyle(0xd9b85f,1);g.fillRect(4,7,56,3);}
    if(this.data.theme==='palace'){g.lineStyle(2,c.detail,1);g.lineBetween(2,18,62,18);g.lineBetween(2,43,62,43);g.lineBetween(20,18,20,43);g.lineBetween(45,18,45,43);g.fillStyle(0xd39a43,1);g.fillRect(0,5,64,4);g.fillRect(29,9,6,45);}
    g.generateTexture(key,64,64);g.destroy();
    const support=`world-support-${this.data.theme}`,p=s.add.graphics();p.fillStyle(c.dark,1).fillRect(4,0,16,64);p.fillStyle(c.base,1).fillRect(7,0,10,57);p.fillStyle(c.light,1).fillRect(7,0,3,57);p.fillStyle(c.detail,1).fillRect(1,54,22,10);p.generateTexture(support,24,64);p.destroy();
  }

  createBackground(){const s=this.scene,d=this.data,key=`world-depth-${d.theme}`;s.physics.world.setBounds(0,0,d.width,d.height||720);s.cameras.main.setBackgroundColor(d.sky);if(!s.textures.exists(key)){const g=s.add.graphics(),night=d.theme==='forest'||d.theme==='fortress'||d.theme==='tower';g.fillStyle(night?0x181b42:0x6b3154,1).fillRect(0,0,1280,720);g.fillStyle(night?0x40345f:0xb35b7d,1).fillRect(0,300,1280,420);g.fillStyle(night?0x57466f:0xd47b98,.9);for(let x=0;x<1280;x+=160)g.fillTriangle(x,520,x+90,250+(x%320),x+210,520);g.fillStyle(d.theme==='garden'?0x496d58:d.theme==='palace'?0x684158:0x252945,.95);for(let x=0;x<1280;x+=110){const h=95+(x%4)*22;g.fillRect(x,520-h,76,h);if(d.theme==='forest')g.fillCircle(x+38,520-h,55);else{g.fillRect(x+13,500-h,50,20);g.fillTriangle(x+8,500-h,x+38,455-h,x+68,500-h);}}g.fillStyle(night?0xffe5a3:0xffb8d4,.95).fillCircle(1030,115,52);g.fillStyle(night?0x181b42:0x6b3154,1).fillCircle(1050,100,48);g.generateTexture(key,1280,720);g.destroy();}s.add.image(640,360,key).setDisplaySize(1280,720).setScrollFactor(0).setDepth(-30);s.add.image(640,390,key).setDisplaySize(1380,760).setScrollFactor(.08).setAlpha(.08).setTint(d.midTint||0x8e78a8).setDepth(-25);}

  createSurface(def){const s=this.scene,top=def.top,width=def.width,x=def.x??0,left=def.left??x-width/2,right=def.right??x+width/2,center=(left+right)/2,tileKey=`world-tile-${this.data.theme}`;for(let px=left;px<right;px+=64){const visible=Math.min(64,right-px);s.add.image(px+visible/2,top+32,tileKey).setCrop(0,0,visible,64).setDisplaySize(visible,64).setDepth(10);}
    if(def.kind!=='ground'){const supportCount=Math.max(1,Math.floor(width/150));for(let i=0;i<supportCount;i++){const sx=supportCount===1?center:left+36+i*(width-72)/(supportCount-1);s.add.image(sx,top+92,`world-support-${this.data.theme}`).setDepth(8);}}
    const body=s.add.rectangle(center,top+12,width,24,0,0).setVisible(false).setName(`surface:${def.id}`);s.physics.add.existing(body,true);s.solids.add(body);const record={...def,left,right,x:center,top,width,body};this.surfaces.set(def.id,record);return record;}

  createDoor(def){const s=this.scene,c=this.theme,w=def.width||104,h=def.height||230,key=`world-door-${this.data.theme}-${def.kind||'puzzle'}`;if(!s.textures.exists(key)){const g=s.add.graphics();g.fillStyle(c.dark,1).fillRoundedRect(0,0,w,h,12);g.fillStyle(c.base,1).fillRoundedRect(9,9,w-18,h-9,9);g.lineStyle(5,c.light,1).strokeRoundedRect(6,6,w-12,h-6,10);g.fillStyle(c.detail,1);for(let y=30;y<h-20;y+=28)g.fillRect(18,y,w-36,8);g.fillStyle(c.accent,1);g.fillCircle(w/2,55,15);g.fillStyle(0xffe1a0,1);g.fillCircle(w/2,55,5);g.generateTexture(key,w,h);g.destroy();}const art=s.add.image(def.x,def.y,key).setOrigin(.5,1).setDepth(26),body=s.add.rectangle(def.x,def.y-h/2,w-26,h,0,0).setVisible(false);s.physics.add.existing(body,true);s.solids.add(body);const door={...def,art,body,x:def.x,y:def.y};this.doors.set(def.id,door);return door;}

  createDecoration(def){const s=this.scene;if(def.type==='light'){const mote=s.add.image(def.x,def.y,'collectible-star').setScale(.35).setTint(this.theme.accent).setAlpha(.55).setDepth(def.front?18:4);s.tweens.add({targets:mote,y:def.y-18,x:def.x+12,alpha:.15,duration:1300+(def.x%700),yoyo:true,repeat:-1});}else if(def.type==='column'){for(let y=def.y;y<def.bottom;y+=64)s.add.image(def.x,y,`world-support-${this.data.theme}`).setDepth(def.front?18:5).setAlpha(def.front?.9:.55);}else if(def.type==='banner'){s.add.image(def.x,def.y,'environment-atlas',13).setDisplaySize(80,150).setTint(this.theme.accent).setDepth(5).setAlpha(.75);}}

  getSurface(id){return this.surfaces.get(id);}
  openDoor(door){if(!door)return;door.body.body.enable=false;this.scene.tweens.add({targets:door.art,y:door.art.y-180,alpha:.12,duration:850,ease:'Cubic.easeIn'});}
}
