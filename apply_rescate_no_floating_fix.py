#!/usr/bin/env python3
from pathlib import Path
import shutil, sys, re

ROOT = Path.cwd()
STAMP = "20260901-no-floating-structures-03"
backup = ROOT / ".chatgpt-backup-20260901-no-floating"

paths = [
    ROOT/"js/world/WorldBuilder.js",
    ROOT/"js/scenes/BaseLevelScene.js",
    ROOT/"js/scenes/Level1Scene.js",
    ROOT/"js/scenes/Level2Scene.js",
    ROOT/"js/scenes/Level3Scene.js",
    ROOT/"js/scenes/Level4Scene.js",
    ROOT/"js/scenes/Level5Scene.js",
    ROOT/"js/main.js",
]
if any(not p.exists() for p in paths):
    print("ERROR: ejecuta esto desde la raíz de rescate-de-amor")
    sys.exit(1)

backup.mkdir(exist_ok=True)
for p in paths:
    d=backup/p.relative_to(ROOT)
    d.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(p,d)

def between(t,a,b,r):
    i=t.find(a); j=t.find(b,i)
    if i<0 or j<0: raise RuntimeError(f"No encontré bloque {a}")
    return t[:i]+r+t[j:]

p=ROOT/"js/world/WorldBuilder.js"
t=p.read_text(encoding="utf-8")

background = """  createBackground(){
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

"""
t=between(t,"  createBackground(){","  createSurface(def){",background)

surface = """  createSurface(def){
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
      const isBridge=def.visual==='bridge';
      const frame=isBridge?'bridge':def.supportType==='wall-anchor'?'platformB':'platformA';
      const surfaceY=spec[`${frame}Y`]??spec.platformAY;
      const scale=Phaser.Math.Clamp(width/410,.46,.82);
      const piece=s.add.image(center,top,texture,frame)
        .setOrigin(.5,surfaceY/512).setScale(scale)
        .setDepth(12).setFlipX((def.id.length%2)===0);
      art.push(piece);
      this.createGroundedSupports(def,{left,right,center,top,width,art});
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

"""
t=between(t,"  createSurface(def){","  findStructuralFloor(",surface)

start=t.find("  createDoor(def){")
end=t.find("\n  createDecoration(def){",start)
if start<0 or end<0: raise RuntimeError("No encontré createDoor")

door = """  createDoor(def){
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
      leaf=s.add.image(def.x,def.y+4,key).setOrigin(.5,1).setDepth(26);
      art=leaf;
    }else if(forestPuzzle){
      frame=s.add.image(def.x,def.y+18,'forest-remaster-atlas','memoryGate')
        .setOrigin(.5,1).setScale(.86).setDepth(25);
      leaf=s.add.image(def.x,def.y+13,'forest-remaster-atlas','memoryDoorLeaf')
        .setOrigin(.5,1).setScale(.86).setDepth(26);
      art=frame;
    }else{
      frame=s.add.image(def.x,def.y+70,`architecture-${this.data.theme}`,'landmark')
        .setOrigin(.5,1).setScale(.72).setDepth(24);
      leaf=s.add.image(def.x,def.y+4,key).setOrigin(.5,1).setDepth(26);
      art=leaf;
    }

    const body=s.add.rectangle(def.x,def.y-h/2,w-26,h,0,0).setVisible(false);
    s.physics.add.existing(body,true);s.solids.add(body);
    const door={...def,art,leaf,frame,body,x:def.x,y:def.y,forestPuzzle};
    this.doors.set(def.id,door);
    return door;
  }
"""
t=t[:start]+door+t[end:]

ambient_start=t.find("  createAmbientDecor(){")
ambient_end=t.find("\n  createForestArchitecture(){",ambient_start)
if ambient_start<0 or ambient_end<0: raise RuntimeError("No encontré ambient decor")
ambient = """  createAmbientDecor(){
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
"""
t=t[:ambient_start]+ambient+t[ambient_end:]
p.write_text(t,encoding="utf-8")

p=ROOT/"js/scenes/BaseLevelScene.js"
t=p.read_text(encoding="utf-8")
t=re.sub(r"import WorldBuilder from '../world/WorldBuilder\.js\?v=[^']+';",
         f"import WorldBuilder from '../world/WorldBuilder.js?v={STAMP}';",t)
p.write_text(t,encoding="utf-8")

for name in ["Level1Scene.js","Level2Scene.js","Level3Scene.js","Level4Scene.js","Level5Scene.js"]:
    p=ROOT/"js/scenes"/name
    t=p.read_text(encoding="utf-8")
    t=re.sub(r"BaseLevelScene\.js\?v=[^']+",f"BaseLevelScene.js?v={STAMP}",t)
    p.write_text(t,encoding="utf-8")

p=ROOT/"js/main.js"
t=p.read_text(encoding="utf-8")
for scene in ["BootScene","Level1Scene","Level2Scene","Level3Scene","Level4Scene","Level5Scene"]:
    t=re.sub(rf"(import {scene} from '\./scenes/{scene}\.js\?v=)[^']+",
             rf"\g<1>{STAMP}",t)
p.write_text(t,encoding="utf-8")

print("✅ NO-FLOATING FIX APLICADO")
print("Backup:",backup)
print("1) git diff --check")
print("2) Ctrl+Shift+R")
print("3) prueba L1 y L2 antes de commit/push")
