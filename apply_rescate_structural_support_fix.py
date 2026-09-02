#!/usr/bin/env python3
from pathlib import Path
import shutil
import sys
import re

ROOT = Path.cwd()
STAMP = "20260901-structural-support-fix-02"
backup = ROOT / ".chatgpt-backup-20260901-supports"

files = [
    ROOT / "js/world/WorldBuilder.js",
    ROOT / "js/scenes/BaseLevelScene.js",
    ROOT / "js/scenes/Level1Scene.js",
    ROOT / "js/scenes/Level2Scene.js",
    ROOT / "js/scenes/Level3Scene.js",
    ROOT / "js/scenes/Level4Scene.js",
    ROOT / "js/scenes/Level5Scene.js",
    ROOT / "js/main.js",
]

missing = [p for p in files if not p.exists()]
if missing:
    print("ERROR: ejecuta este script desde la raíz de rescate-de-amor.")
    for p in missing:
        print("-", p)
    sys.exit(1)

backup.mkdir(exist_ok=True)
for p in files:
    dst = backup / p.relative_to(ROOT)
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, dst)

def replace_between(text, start, end, replacement):
    a = text.find(start)
    if a < 0:
        raise RuntimeError(f"No encontré {start}")
    b = text.find(end, a)
    if b < 0:
        raise RuntimeError(f"No encontré {end}")
    return text[:a] + replacement + text[b:]

p = ROOT / "js/world/WorldBuilder.js"
text = p.read_text(encoding="utf-8")

new_background = """  createBackground(){
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

"""

text = replace_between(text, "  createBackground(){", "  createSurface(def){", new_background)

new_surface = """  createSurface(def){
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

"""

text = replace_between(text, "  createSurface(def){", "  findStructuralFloor(", new_surface)

old_tower_ambient = """    if(theme==='tower'){
      for(const surface of this.surfaces.values()){
        if(surface.kind==='ground')continue;
        const floorY=this.findStructuralFloor(surface.top,surface.x);
        const art=s.add.image(surface.x,floorY+20,texture,'landmark')
          .setOrigin(.5,1).setScale(.58).setDepth(3).setAlpha(.58);
        if((Math.floor(surface.x/200)%2))art.setFlipX(true);
      }
    }
"""
text = text.replace(
    old_tower_ambient,
    "    // Los soportes de plataformas se generan en createStructuralSupports(); no duplicarlos aquí.\n"
)

p.write_text(text, encoding="utf-8")

p = ROOT / "js/scenes/BaseLevelScene.js"
text = p.read_text(encoding="utf-8")
text = re.sub(
    r"import WorldBuilder from '../world/WorldBuilder\.js\?v=[^']+';",
    f"import WorldBuilder from '../world/WorldBuilder.js?v={STAMP}';",
    text
)
p.write_text(text, encoding="utf-8")

for name in ["Level1Scene.js","Level2Scene.js","Level3Scene.js","Level4Scene.js","Level5Scene.js"]:
    p = ROOT / "js/scenes" / name
    text = p.read_text(encoding="utf-8")
    text = re.sub(r"BaseLevelScene\.js\?v=[^']+", f"BaseLevelScene.js?v={STAMP}", text)
    p.write_text(text, encoding="utf-8")

p = ROOT / "js/main.js"
text = p.read_text(encoding="utf-8")
for scene in ["BootScene","Level1Scene","Level2Scene","Level3Scene","Level4Scene","Level5Scene"]:
    text = re.sub(
        rf"(import {scene} from '\./scenes/{scene}\.js\?v=)[^']+",
        rf"\g<1>{STAMP}",
        text
    )
p.write_text(text, encoding="utf-8")

print("✅ CORRECCIÓN ESTRUCTURAL APLICADA")
print("Backup:", backup)
print("")
print("Corregido:")
print("- corte/franja horizontal del fondo")
print("- soportes reales en plataformas elevadas L1-L5")
print("- puentes con soportes en ambos extremos")
print("- raíces bajo estructuras del bosque")
print("- pérgolas/terrazas del jardín conectadas")
print("- murallas/balcones de fortaleza conectados")
print("- plataformas de torre ancladas al cuerpo de la torre")
print("- balcones/pasillos del palacio conectados")
print("- soportes decorativos duplicados eliminados")
print("")
print("AHORA: git diff --check")
print("Luego recarga fuerte con Ctrl+Shift+R.")
