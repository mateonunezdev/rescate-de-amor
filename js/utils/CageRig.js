export function createMateoCageRig(scene,x,y,options={}){
  const rig=scene.add.container(x,y).setDepth(options.depth??20);
  const glow=scene.add.ellipse(0,6,190,245,0xff4faf,.12).setStrokeStyle(4,0xff82c4,.26);
  const mateo=options.mateo||scene.add.image(0,22,'mateo-final',options.frame??1);
  mateo.setPosition(0,options.mateoY??24).setScale(options.mateoScale??.82).setDepth(1);
  const cage=scene.add.image(0,0,'gothic-cage').setScale(options.cageScale??.7).setDepth(2);
  const lock=scene.add.text(0,32,'♥',{fontFamily:'monospace',fontSize:'16px',color:'#ffd372',stroke:'#6f244f',strokeThickness:3}).setOrigin(.5).setDepth(3).setVisible(options.locked!==false);
  rig.add([glow,mateo,cage,lock]);rig.glow=glow;rig.mateo=mateo;rig.cage=cage;rig.lock=lock;rig.setLocked=value=>{lock.setVisible(value);return rig;};
  return rig;
}
