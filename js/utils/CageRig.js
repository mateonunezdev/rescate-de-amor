export function createMateoCageRig(scene,x,y,options={}){
  const rig=scene.add.container(x,y).setDepth(options.depth??20);
  const cageScale=options.cageScale??.7,mateoScale=options.mateoScale??.82;
  const glow=scene.add.ellipse(0,6,190,245,0xff4faf,.12).setStrokeStyle(4,0xff82c4,.26);
  const mateo=options.mateo||scene.add.image(0,22,'mateo-final',options.frame??1);
  const mateoY=options.mateoY??Math.round(143.5*cageScale-48*mateoScale-7);
  mateo.setPosition(options.mateoX??-14,mateoY).setScale(mateoScale).setDepth(1);
  const cage=scene.add.image(0,0,'gothic-cage').setScale(cageScale).setDepth(2);
  const lock=scene.add.text(0,52,'♥',{fontFamily:'monospace',fontSize:'12px',color:'#ffd372',stroke:'#6f244f',strokeThickness:2}).setOrigin(.5).setDepth(3).setAlpha(.72).setVisible(options.locked!==false);
  rig.add([glow,mateo,cage,lock]);rig.glow=glow;rig.mateo=mateo;rig.cage=cage;rig.lock=lock;rig.cageScale=cageScale;rig.mateoScale=mateoScale;rig.capturedActor=mateo;rig.setLocked=value=>{lock.setVisible(value);return rig;};rig.setCapturedPose=frame=>{mateo.setFrame(frame);return rig;};
  return rig;
}
