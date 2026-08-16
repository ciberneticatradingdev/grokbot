// grokbot-model.js — grokbot: an obsidian streamer android.
// Deliberately NOT the soft clay mascot shape: hard chamfered volumes, a single
// wide glowing visor instead of eyes, a techwear jacket with one diagonal slash,
// two heavy boots, gunmetal headphones and a boom mic that lights up when it
// talks, plus a slowly spinning diamond antenna above the head.
// Returns { group, update(t,{speaking}) } via createGrokbot(), or a full staged
// scene via mountScene(canvas).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const PALETTE = {
  obsidian: 0x14161b,   // head / shell
  graphite: 0x1f232c,   // jacket
  steel: 0x767f8f,      // hardware, gloves
  gunmetal: 0x0c0e12,   // headphones
  glass: 0x05070a,      // visor pane
  glow: 0xdff3ff,       // visor / mic light (cold white)
  ink: 0x0a0b0e,
  bg: 0x0a0b0e,
};

function shellMat(color, rough = 0.42, metal = 0.25) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
function rbox(w, h, d, r, mat) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function createGrokbot() {
  const group = new THREE.Group();

  const matShell = shellMat(PALETTE.obsidian, 0.38, 0.3);
  const matJacket = shellMat(PALETTE.graphite, 0.72, 0.1);
  const matSteel = shellMat(PALETTE.steel, 0.3, 0.65);
  const matHP = shellMat(PALETTE.gunmetal, 0.35, 0.55);
  const matGlass = new THREE.MeshStandardMaterial({ color: PALETTE.glass, roughness: 0.12, metalness: 0.5 });
  const matGlow = new THREE.MeshStandardMaterial({
    color: PALETTE.glow, emissive: PALETTE.glow, emissiveIntensity: 1.5, roughness: 0.3,
  });
  const matMic = new THREE.MeshStandardMaterial({ color: PALETTE.gunmetal, roughness: 0.35, metalness: 0.4 });

  // ---------- HEAD — hard chamfered shell ----------
  const head = new THREE.Group();
  group.add(head);

  const skull = rbox(2.42, 1.72, 1.66, 0.13, matShell);
  skull.position.y = 1.92;
  head.add(skull);

  // brow plate — a thin lip above the visor, catches the key light
  const brow = rbox(2.3, 0.16, 0.2, 0.05, matSteel);
  brow.position.set(0, 2.36, 0.79);
  head.add(brow);

  // visor: one dark pane, two glowing bars behind it
  const pane = rbox(2.06, 0.72, 0.12, 0.09, matGlass);
  pane.position.set(0, 1.92, 0.83);
  head.add(pane);

  const bars = [];
  for (const sx of [-1, 1]) {
    const bar = rbox(0.62, 0.16, 0.08, 0.05, matGlow);
    bar.position.set(sx * 0.44, 1.94, 0.88);
    head.add(bar);
    bars.push(bar);
  }

  // jaw vent under the visor
  for (let i = -1; i <= 1; i++) {
    const slot = rbox(0.5, 0.07, 0.1, 0.03, matSteel);
    slot.position.set(i * 0.56, 1.36, 0.8);
    head.add(slot);
  }

  // side tabs the headphones clamp onto
  for (const sx of [-1, 1]) {
    const tab = rbox(0.3, 0.54, 0.66, 0.08, matShell);
    tab.position.set(sx * 1.3, 1.98, 0.02);
    head.add(tab);
  }

  // antenna — rises from the crown, behind the headphone band, so the spinning
  // diamond reads as attached hardware instead of a stray floating shape
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 8), matSteel);
  stalk.position.set(0, 3.2, -0.42);
  head.add(stalk);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.17), matGlow);
  gem.position.set(0, 3.72, -0.42);
  head.add(gem);

  // ---------- TORSO — techwear jacket ----------
  const torso = new THREE.Group();
  group.add(torso);

  const chest = rbox(2.2, 1.8, 1.5, 0.24, matJacket);
  chest.position.y = 0.15;
  torso.add(chest);

  // raised collar
  const collar = rbox(1.36, 0.34, 1.1, 0.14, matShell);
  collar.position.set(0, 1.03, 0.04);
  torso.add(collar);

  // the one graphic element: a diagonal slash across the chest
  const slash = rbox(0.17, 1.5, 0.08, 0.05, matSteel);
  slash.position.set(0.1, 0.2, 0.77);
  slash.rotation.z = 0.62;
  torso.add(slash);

  // sleeves with steel gloves
  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    const sleeve = rbox(0.54, 1.32, 0.7, 0.16, matJacket);
    arm.add(sleeve);
    const cuff = rbox(0.5, 0.14, 0.66, 0.06, matShell);
    cuff.position.y = -0.6;
    arm.add(cuff);
    const hand = rbox(0.38, 0.36, 0.46, 0.12, matSteel);
    hand.position.y = -0.84;
    arm.add(hand);
    arm.position.set(sx * 1.3, 0.2, 0.02);
    arm.rotation.z = sx * 0.04;
    torso.add(arm);
    arms.push(arm);
  }

  // ---------- LEGS — two heavy boots ----------
  for (const sx of [-1, 1]) {
    const leg = rbox(0.66, 1.0, 0.66, 0.12, matShell);
    leg.position.set(sx * 0.56, -1.02, 0.02);
    torso.add(leg);
    const boot = rbox(0.74, 0.26, 0.9, 0.1, matSteel);
    boot.position.set(sx * 0.56, -1.5, 0.1);
    torso.add(boot);
  }

  // ---------- HEADPHONES ----------
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.46, 0.09, 14, 44, Math.PI), matHP);
  band.position.set(0, 1.98, 0.02);
  band.castShadow = true;
  head.add(band);
  for (const sx of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.36, 26), matHP);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(sx * 1.52, 1.98, 0.02);
    cup.castShadow = true;
    head.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 26), matGlow);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(sx * 1.71, 1.98, 0.02);
    head.add(ring);
  }
  // boom mic from the left cup to just under the face
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.52, 1.74, 0.24),
    new THREE.Vector3(-1.38, 1.3, 0.76),
    new THREE.Vector3(-0.82, 1.14, 1.0),
    new THREE.Vector3(-0.3, 1.2, 1.04),
  ]);
  const boom = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.045, 10, false), matHP);
  boom.castShadow = true;
  head.add(boom);
  const micBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), matMic);
  micBall.position.set(-0.26, 1.2, 1.06);
  head.add(micBall);

  // ---------- animation ----------
  let blinkT = 2.0, blinking = 0;

  function update(t, opts = {}) {
    const speaking = !!opts.speaking;
    // idle float
    group.position.y = Math.sin(t * 1.15) * 0.04;
    // head tracks around slowly; nods harder while talking
    head.rotation.x = Math.sin(t * (speaking ? 4.0 : 0.9)) * (speaking ? 0.055 : 0.018);
    head.rotation.y = Math.sin(t * 0.4) * 0.1;
    torso.rotation.y = Math.sin(t * 0.4) * 0.045;
    // sleeves swing slightly
    arms[0].rotation.x = Math.sin(t * 1.2 + 1) * 0.045;
    arms[1].rotation.x = Math.sin(t * 1.2) * 0.045;
    // antenna spin + slow strobe
    gem.rotation.y = t * 1.4;
    gem.rotation.x = Math.sin(t * 0.8) * 0.4;
    // visor "blink": the bars snap thin for a beat
    blinkT -= 0.016;
    if (blinkT <= 0) { blinking = 1; blinkT = 2.5 + Math.random() * 3.5; }
    if (blinking > 0) {
      blinking -= 0.14;
      const sy = Math.max(0.14, Math.abs(Math.cos(blinking * Math.PI)));
      bars.forEach(b => (b.scale.y = sy));
      if (blinking <= 0) bars.forEach(b => (b.scale.y = 1));
    }
    // speaking: visor brightens, the mic lights up
    matGlow.emissiveIntensity = speaking ? 2.1 + Math.sin(t * 11) * 0.7 : 1.35 + Math.sin(t * 1.6) * 0.15;
    matMic.emissive.setHex(speaking ? PALETTE.glow : 0x000000);
    matMic.emissiveIntensity = speaking ? 0.7 + Math.sin(t * 12) * 0.3 : 0;
    // the visor bars widen a touch as it talks — reads as a voice meter
    const w = speaking ? 1 + Math.abs(Math.sin(t * 9)) * 0.12 : 1;
    bars.forEach(b => (b.scale.x = w));
  }

  return { group, update, bars };
}

// Full ready-to-render scene (lights + shadow ground + framing).
export function mountScene(canvas, { transparent = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (!transparent) renderer.setClearColor(PALETTE.bg, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 1.5, 15.2);
  camera.lookAt(0, 0.78, 0);

  // cold studio light: strong key, cool rim, so the black shell keeps its edges
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a1d24, 0.7));
  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 40;
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0004; key.shadow.radius = 6;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9dcff, 0.5); fill.position.set(-7, 3, 5); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xa8d8ff, 0.85); rim.position.set(-2, 4, -8); scene.add(rim);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.63;
  ground.receiveShadow = true;
  scene.add(ground);

  const bot = createGrokbot();
  scene.add(bot.group);

  function resize() {
    const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const clock = new THREE.Clock();
  let speaking = false;
  function loop() {
    requestAnimationFrame(loop);
    bot.update(clock.getElapsedTime(), { speaking });
    renderer.render(scene, camera);
  }
  resize(); addEventListener("resize", resize); loop();

  return { setSpeaking: (v) => { speaking = v; }, resize, scene, camera, renderer, bot };
}
