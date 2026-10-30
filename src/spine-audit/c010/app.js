const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d');
const auditEl = document.querySelector('#audit');
const stateEl = document.querySelector('#state');
const animationButtons = document.querySelector('#animationButtons');
const wipeButton = document.querySelector('#wipeButton');
const resetButton = document.querySelector('#resetButton');

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, t) => a + (b - a) * t;
const v2 = (x = 0, y = 0) => new spine.Vector2(x, y);

let skeleton, animationState, renderer, data;
let currentAnimation = 'idle';
let generated = null;
let last = performance.now();
let camera = { scale: 1, cx: 0, cy: 0 };
let seed = 3812;
let lastStatus = '';

function pickBone(name) { return skeleton?.findBone(name) || null; }
function setText(el, value) { el.textContent = value; }
function format(n) { return Number.isFinite(n) ? n.toFixed(1) : '—'; }
function worldToScreen(worldX, worldY) {
  return { x: canvas.width / 2 + (worldX - camera.cx) * camera.scale, y: canvas.height * .90 - (worldY - camera.cy) * camera.scale };
}
function setAnimation(name) {
  if (!animationState || !data.findAnimation(name)) return;
  currentAnimation = name;
  generated = null;
  animationState.setAnimation(0, name, true);
  document.querySelectorAll('[data-animation]').forEach(button => button.classList.toggle('active', button.dataset.animation === name));
}
function startGeneratedAction() {
  if (!skeleton || !animationState) return;
  if (!data.findAnimation('idle')) return;
  animationState.setAnimation(0, 'idle', true);
  currentAnimation = 'idle';
  generated = { name: 'foam_wipe', elapsed: 0, duration: 2.4, seed };
  document.querySelectorAll('[data-animation]').forEach(button => button.classList.toggle('active', button.dataset.animation === 'idle'));
}
function resetGeneratedAction() { generated = null; setAnimation('idle'); }
function captureRestTarget() {
  const target = pickBone('ik_arm_r');
  return target ? { x: target.worldX, y: target.worldY } : { x: 0, y: 0 };
}
function applyGeneratedAction(dt) {
  const handTarget = pickBone('ik_arm_r');
  const faceTarget = pickBone('face_con');
  if (!generated || !handTarget || !faceTarget) return { phase: 'idle', progress: 0, foam: 0 };
  generated.elapsed = Math.min(generated.duration, generated.elapsed + dt);
  const t = generated.elapsed / generated.duration;
  const phase = t < .22 ? 'notice' : t < .55 ? 'reach' : t < .84 ? 'wipe' : 'recover';
  const rest = generated.rest || (generated.rest = captureRestTarget());
  const face = { x: faceTarget.worldX + 30, y: faceTarget.worldY + 10 };
  const face2 = { x: faceTarget.worldX + 70, y: faceTarget.worldY + 22 };
  const local = new spine.Vector2();
  let targetWorld = rest;
  let faceRotation = 0;
  if (phase === 'notice') {
    faceRotation = -4 * smooth(t / .22);
  } else if (phase === 'reach') {
    const u = smooth((t - .22) / .33);
    targetWorld = { x: lerp(rest.x, face.x, u), y: lerp(rest.y, face.y, u) };
    faceRotation = lerp(-4, 2, u);
  } else if (phase === 'wipe') {
    const u = smooth((t - .55) / .29);
    targetWorld = { x: lerp(face.x, face2.x, .5 - .5 * Math.cos(u * Math.PI * 2)), y: lerp(face.y, face2.y, .5 - .5 * Math.cos(u * Math.PI * 2)) };
    faceRotation = 2 + Math.sin(u * Math.PI * 2) * 2;
  } else {
    const u = smooth((t - .84) / .16);
    targetWorld = { x: lerp(face2.x, rest.x, u), y: lerp(face2.y, rest.y, u) };
    faceRotation = lerp(2, 0, u);
  }
  handTarget.parent.worldToLocal(local.set(targetWorld.x, targetWorld.y));
  handTarget.x = local.x;
  handTarget.y = local.y;
  faceTarget.rotation = faceRotation;
  skeleton.updateWorldTransform(spine.Physics?.none ?? 0);
  if (generated.elapsed >= generated.duration) generated = null;
  return { phase, progress: t, foam: phase === 'reach' ? .35 : phase === 'wipe' ? .85 : phase === 'recover' ? .35 : 0 };
}
function drawFoam(action) {
  if (!action.foam || !skeleton) return;
  const face = pickBone('face_con');
  const head = pickBone('head');
  if (!face || !head) return;
  const points = [{ bone: face, x: 0, y: 0, r: 28 }, { bone: head, x: -18, y: 70, r: 22 }, { bone: head, x: 28, y: 88, r: 20 }];
  ctx.save();
  for (const [index, item] of points.entries()) {
    const p = worldToScreen(item.bone.worldX + item.x, item.bone.worldY + item.y);
    const alpha = action.foam * (.72 - index * .12);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#f5f8ff';
    ctx.beginPath(); ctx.arc(p.x, p.y, item.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dbe7fb';
    ctx.beginPath(); ctx.arc(p.x - item.r * .24, p.y - item.r * .22, item.r * .26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + item.r * .28, p.y - item.r * .05, item.r * .18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function drawDebug(action) {
  const target = pickBone('ik_arm_r');
  const face = pickBone('face_con');
  ctx.save();
  if (target) { const p = worldToScreen(target.worldX, target.worldY); ctx.fillStyle = '#7dd9ff'; ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill(); }
  if (face) { const p = worldToScreen(face.worldX, face.worldY); ctx.strokeStyle = '#ff96d2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function draw(dt) {
  if (!skeleton || !animationState) return;
  animationState.update(dt);
  animationState.apply(skeleton);
  skeleton.updateWorldTransform(spine.Physics?.none ?? 0);
  const action = applyGeneratedAction(dt);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0e0a16'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height * .90);
  ctx.scale(camera.scale, -camera.scale);
  ctx.translate(-camera.cx, -camera.cy);
  renderer.draw(skeleton);
  ctx.restore();
  drawFoam(action);
  drawDebug(action);
  const target = pickBone('ik_arm_r');
  const face = pickBone('face_con');
  const status = `${generated ? generated.name + ' / ' + action.phase : currentAnimation} | hand=${target ? `${format(target.worldX)},${format(target.worldY)}` : '—'} | face=${face ? `${format(face.worldX)},${format(face.worldY)}` : '—'}`;
  if (status !== lastStatus) { lastStatus = status; setText(stateEl, `动作：${generated ? generated.name : currentAnimation}\n阶段：${generated ? action.phase : 'idle'}\n进度：${generated ? Math.round(action.progress * 100) : 0}%\n手部目标：${target ? target.data.name : '—'}\n脸部目标：${face ? face.data.name : '—'}\n泡沫覆盖：${Math.round(action.foam * 100)}%`); }
}
function frame(now) { const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; draw(dt); requestAnimationFrame(frame); }
async function load() {
  const [atlasText, skeletonJson] = await Promise.all([
    fetch('model-4.3.26/c010_00.atlas').then(r => r.text()),
    fetch('model-4.3.26/c010_00.json').then(r => r.json())
  ]);
  const images = [];
  for (const source of ['model-4.3.26/c010_00.png', 'model-4.3.26/c010_00_2.png', 'model-4.3.26/c010_00_3.png', 'model-4.3.26/c010_00_4.png']) {
    const image = new Image();
    image.src = source;
    await image.decode();
    images.push(image);
  }
  const atlas = new spine.TextureAtlas(atlasText);
  atlas.pages.forEach((page, index) => page.setTexture(new spine.CanvasTexture(images[index] || images[0])));
  const loader = new spine.AtlasAttachmentLoader(atlas);
  const json = new spine.SkeletonJson(loader); json.scale = 1;
  data = json.readSkeletonData(skeletonJson);
  skeleton = new spine.Skeleton(data);
  if (data.findSkin('00')) skeleton.setSkinByName('00');
  animationState = new spine.AnimationState(new spine.AnimationStateData(data));
  renderer = new spine.SkeletonRenderer(ctx);
  renderer.triangleRendering = true;
  const maxDim = Math.max(data.width, data.height);
  camera.scale = Math.min(canvas.width / (data.width * 1.16), canvas.height / (data.height * 1.16));
  camera.cx = data.x + data.width / 2;
  camera.cy = data.y + data.height / 2;
  const constraints = Array.isArray(skeletonJson.constraints) ? skeletonJson.constraints : [];
  const ikCount = data.ikConstraints?.length ?? constraints.filter((item) => item.type === 'ik').length;
  const transformCount = data.transformConstraints?.length ?? constraints.filter((item) => item.type === 'transform').length;
  setText(auditEl, `导出模型：Spine ${data.version}\n骨骼：${data.bones.length}\n插槽：${data.slots.length}\nIK：${ikCount}\nTransform：${transformCount}\n动画：${data.animations.length}\n图集页：${atlas.pages.length}\n图集区域：${atlas.regions.length}\n脸部目标：${pickBone('face_con') ? '可用' : '缺失'}\nIK 手部目标：${pickBone('ik_arm_r') ? '可用' : '缺失'}\n\n4.3.26 工程导出，4.3.13 runtime 回读。`);
  const names = ['idle', 'action', 'delight', 'angry', 'think', 'worry'];
  for (const name of names) if (data.findAnimation(name)) { const button = document.createElement('button'); button.textContent = name; button.dataset.animation = name; button.addEventListener('click', () => setAnimation(name)); animationButtons.append(button); }
  wipeButton.addEventListener('click', startGeneratedAction);
  resetButton.addEventListener('click', resetGeneratedAction);
  setAnimation('idle');
  requestAnimationFrame(frame);
}
load().catch(error => { console.error(error); setText(auditEl, `加载失败：${error.message}`); setText(stateEl, '请检查模型文件和 Spine 4.3 runtime。'); });
