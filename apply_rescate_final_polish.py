#!/usr/bin/env python3
from pathlib import Path
import shutil
import sys

ROOT = Path.cwd()
STAMP = "20260901-final-visual-polish-01"
backup = ROOT / ".chatgpt-backup-20260901"

required = [
    ROOT / "js/world/WorldBuilder.js",
    ROOT / "js/scenes/BaseLevelScene.js",
    ROOT / "js/scenes/Level1Scene.js",
    ROOT / "js/scenes/Level2Scene.js",
    ROOT / "js/scenes/Level3Scene.js",
    ROOT / "js/scenes/Level4Scene.js",
    ROOT / "js/scenes/Level5Scene.js",
    ROOT / "js/main.js",
]

missing = [str(p) for p in required if not p.exists()]
if missing:
    print("ERROR: ejecuta este script desde la carpeta raíz de rescate-de-amor.")
    print("Faltan:", *missing, sep="\n- ")
    sys.exit(1)

backup.mkdir(exist_ok=True)
for p in required:
    dest = backup / p.relative_to(ROOT)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(p, dest)

def replace_between(text, start_marker, end_marker, replacement):
    a = text.find(start_marker)
    if a < 0:
        raise RuntimeError(f"No encontré inicio: {start_marker}")
    b = text.find(end_marker, a)
    if b < 0:
        raise RuntimeError(f"No encontré final: {end_marker}")
    return text[:a] + replacement + text[b:]

p = ROOT / "js/world/WorldBuilder.js"
text = p.read_text(encoding="utf-8")

new_background = '''  createBackground(){
    const s=this.scene,d=this.data,theme=d.theme;
    s.physics.world.setBounds(0,0,d.width,d.height||720);
    s.cameras.main.setBackgroundColor(d.sky);

    const key=`world-depth-${theme}`;
    if(!s.textures.exists(key)){
      const g=s.add.graphics(),night=theme==='forest'||theme==='fortress'||theme==='tower';
      g.fillStyle(night?0x10152d:0x3d1f39,1).fillRect(0,0,1280,720);
      g.fillStyle(night?0x273052:0x71405d,1).fillRect(0,330,1280,390);
      g.fillStyle(night?0x354060:0x8e5270,.55);
      for(let x=0;x<1280;x+=210)g.fillTriangle(x,590,x+115,330+(x%260),x+260,590);
      g.generateTexture(key,1280,720);g.destroy();
    }
    s.add.image(640,360,key).setDisplaySize(1280,720).setScrollFactor(0).setDepth(-42);

    const scenic={
      garden:['bg-garden',0x8b6784,.42],
      fortress:['bg-castle',0x59627a,.38],
      tower:['bg-boss',0x55456d,.36],
      palace:['bg-castle',0x8b6473,.38],
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
          .setOrigin(.5,1).setScale(.78).setTint(0x202f48).setAlpha(.42)
          .setScrollFactor(.16).setDepth(-20);
      }
    }
  }

'''
text = replace_between(text, "  createBackground(){", "  createSurface(def){", new_background)

new_surface = '''  createSurface(def){
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

      if(!isBridge){
        const floorY=this.findStructuralFloor(top,center),gap=floorY-top;
        if(gap>95&&gap<390){
          const anchorFrame=this.data.theme==='forest'?'platformB':'landmark';
          const anchorScale=Phaser.Math.Clamp(Math.min(width/500,gap/520),.34,.66);
          const anchor=s.add.image(center,floorY+6,texture,anchorFrame)
            .setOrigin(.5,1).setScale(anchorScale).setDepth(9).setAlpha(.72);
          if((def.id.length%3)===0)anchor.setFlipX(true);
          art.push(anchor);
        }
      }
    }

    const colliderWidth=def.colliderWidth,
      body=this.createStaticSurfaceBody(center+def.colliderOffset,top,colliderWidth,def.id),
      record={...def,left,right,x:center,top,width,body,bodies:[body],art,structuralArt:true};
    this.surfaces.set(def.id,record);
    return record;
  }

'''
text = replace_between(text, "  createSurface(def){", "  findStructuralFloor(", new_surface)

new_ambient = '''  createAmbientDecor(){
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

    if(theme==='tower'){
      for(const surface of this.surfaces.values()){
        if(surface.kind==='ground')continue;
        const floorY=this.findStructuralFloor(surface.top,surface.x);
        const art=s.add.image(surface.x,floorY+20,texture,'landmark')
          .setOrigin(.5,1).setScale(.58).setDepth(3).setAlpha(.58);
        if((Math.floor(surface.x/200)%2))art.setFlipX(true);
      }
    }
  }

'''
text = replace_between(text, "  createAmbientDecor(){", "  createForestArchitecture(){", new_ambient)

a = text.find("  createForestArchitecture(){")
b = text.find("\n\n  createAtmosphere(){", a)
if a < 0 or b < 0:
    raise RuntimeError("No encontré createForestArchitecture")

new_forest_arch = '''  createForestArchitecture(){
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
  }'''
text = text[:a] + new_forest_arch + text[b:]
p.write_text(text, encoding="utf-8")

p = ROOT / "js/scenes/BaseLevelScene.js"
text = p.read_text(encoding="utf-8")
text = text.replace(
    "import WorldBuilder from '../world/WorldBuilder.js?v=20260831-architecture-remaster-05';",
    f"import WorldBuilder from '../world/WorldBuilder.js?v={STAMP}';"
)

a = text.find("  makeCombatArenas(){")
b = text.find("\n  makeLevelPuzzle(){", a)
if a < 0 or b < 0:
    raise RuntimeError("No encontré makeCombatArenas/makeLevelPuzzle")

new_arena = '''  makeCombatArenas(){
    const configs=this.dataDef.arenas||(this.dataDef.arena?[this.dataDef.arena]:[]);
    if(!configs.length)return;

    const makeGate=(x,id)=>{
      const floor=[...this.worldBuilder.surfaces.values()]
        .filter(s=>x>=s.left&&x<=s.right).sort((a,b)=>b.top-a.top)[0],
        gate=this.worldBuilder.createDoor({id,kind:'arena',x,y:floor?.top??648,width:76,height:210});
      gate.visualParts=[gate.frame,gate.leaf||gate.art].filter(Boolean);
      gate.visualParts.forEach(part=>part.setVisible(false));
      gate.body.body.enable=false;
      return gate;
    };

    this.combatArenas=configs.map((cfg,i)=>({
      ...cfg,started:false,cleared:false,
      left:makeGate(cfg.start,`arena-${i}-left`),
      right:makeGate(cfg.end,`arena-${i}-right`)
    }));

    this.arenaHud=this.add.text(this.scale.width-34,78,'',{
      fontFamily:'monospace',fontSize:'13px',color:'#fff1c1',
      backgroundColor:'#24152ce8',padding:{x:9,y:5},
      stroke:'#1b0919',strokeThickness:2
    }).setOrigin(1,.5).setScrollFactor(0).setDepth(1150).setVisible(false);
  }

  startCombatArena(a){
    if(!a||a.started)return;
    a.started=true;
    [a.left,a.right].forEach(g=>{
      g.visualParts.forEach(part=>part.setVisible(true).setAlpha(.92));
      g.body.body.enable=true;g.body.body.updateFromGameObject();
      g.projectileCollider=this.physics.add.collider(this.projectiles,g.body,(first,second)=>{
        const shot=first===g.body?second:first;
        if(shot&&shot!==g.body)shot.destroy();
      });
    });
    this.cameras.main.shake(100,.002);
    this.uiManager.showMessage(a.message||'EL CAMINO SE HA CERRADO','#ffe2a0',1350);
    this.updateCombatArena(a);
  }

  updateCombatArena(a){
    if(!a?.started||a.cleared)return;
    const remaining=this.enemies.getChildren().filter(e=>e.active&&e.x>a.start&&e.x<a.end);
    this.arenaHud.setVisible(true).setText(`⚔ GUARDIANES · ${remaining.length}`);
    if(remaining.length)return;

    a.cleared=true;
    this.arenaHud.setText('✦ CAMINO LIBRE').setColor('#bfffc9');
    [a.left,a.right].forEach((g,i)=>{
      g.body.body.enable=false;
      this.tweens.add({
        targets:g.visualParts,alpha:0,y:'-=45',duration:650,delay:i*90,
        onComplete:()=>g.visualParts.forEach(part=>part.setVisible(false))
      });
    });
    this.time.delayedCall(1050,()=>this.arenaHud.setVisible(false).setColor('#fff1c1'));
    this.audioManager.playSfx('checkpoint');
  }
'''
text = text[:a] + new_arena + text[b:]
p.write_text(text, encoding="utf-8")

p = ROOT / "js/scenes/Level1Scene.js"
text = p.read_text(encoding="utf-8")
text = text.replace("BaseLevelScene.js?v=20260831-architecture-remaster-05", f"BaseLevelScene.js?v={STAMP}")
text = text.replace(
    "{id:'trail',kind:'ground',left:0,right:1080,width:1080,top:648},{id:'log1'",
    "{id:'trail',kind:'ground',left:0,right:1080,width:1080,top:648},{id:'forestUnderstory',kind:'ground',left:1080,right:1980,width:900,top:648},{id:'log1'"
)
text = text.replace(
    "{x:1135,y:625,frame:8},{x:1260,y:625,frame:8},{x:1540,y:625,frame:8},{x:1810,y:625,frame:8}",
    "{x:1135,y:625,frame:8,surface:'forestUnderstory'},{x:1260,y:625,frame:8,surface:'forestUnderstory'},{x:1540,y:625,frame:8,surface:'forestUnderstory'},{x:1810,y:625,frame:8,surface:'forestUnderstory'}"
)
text = text.replace("message:'PATIO DE LOS GUARDIANES'", "message:'LAS RAÍCES CIERRAN EL CLARO'")
text = text.replace("message:'LIBERA LA SALA DE LOS ECOS'", "message:'LIBERA EL CLARO DE LOS ECOS'")
p.write_text(text, encoding="utf-8")

replacements = {
    "Level2Scene.js": [
        ("BaseLevelScene.js?v=20260831-architecture-remaster-05", f"BaseLevelScene.js?v={STAMP}"),
        ("{x:4450,label:'ARENA FLORAL'}", "{x:4450,label:'PATIO DE LAS ROSAS'}"),
        ("message:'ARENA DEL INVERNADERO'", "message:'LOS SETOS CIERRAN EL JARDÍN'"),
    ],
    "Level3Scene.js": [
        ("BaseLevelScene.js?v=20260831-architecture-remaster-05", f"BaseLevelScene.js?v={STAMP}"),
        ("{x:5300,label:'GRAN ARENA'}", "{x:5300,label:'PATIO DE LA GUARDIA'}"),
        ("message:'GRAN ARENA DE LA FORTALEZA'", "message:'LAS REJAS CIERRAN EL PATIO'"),
    ],
    "Level4Scene.js": [
        ("BaseLevelScene.js?v=20260831-architecture-remaster-05", f"BaseLevelScene.js?v={STAMP}"),
        ("message:'CÁMARA DEL CORAZÓN'", "message:'EL CORAZÓN SELLA LA CÁMARA'"),
    ],
    "Level5Scene.js": [
        ("BaseLevelScene.js?v=20260831-architecture-remaster-05", f"BaseLevelScene.js?v={STAMP}"),
        ("message:'ÚLTIMA GUARDIA DEL PALACIO'", "message:'LAS PUERTAS DEL PALACIO SE CIERRAN'"),
    ],
}
for filename, reps in replacements.items():
    p = ROOT / "js/scenes" / filename
    t = p.read_text(encoding="utf-8")
    for old,new in reps:
        t = t.replace(old,new)
    p.write_text(t, encoding="utf-8")

p = ROOT / "js/main.js"
text = p.read_text(encoding="utf-8")
for scene in ["BootScene","Level1Scene","Level2Scene","Level3Scene","Level4Scene","Level5Scene"]:
    prefix = f"import {scene} from './scenes/{scene}.js?v="
    a = text.find(prefix)
    if a >= 0:
        b = text.find("';", a)
        text = text[:a] + prefix + STAMP + text[b:]
p.write_text(text, encoding="utf-8")

print("✅ PARCHE VISUAL APLICADO")
print("Backup:", backup)
print("Ahora ejecuta: git diff --check")
print("Después prueba levelDebug=1,2,3,4,5 antes del push.")
