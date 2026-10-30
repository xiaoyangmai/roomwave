const statusEl = document.querySelector('#status');
const canvas = document.querySelector('#stage');
const ctx = canvas.getContext('2d');
const root = '/spine-audit/c010/model-4.3.26/';
const pages = ['c010_00.png', 'c010_00_2.png', 'c010_00_3.png', 'c010_00_4.png'];

function status(value) { statusEl.textContent = value; }
function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`纹理加载失败：${path}`));
    image.src = root + path;
  });
}

async function main() {
  const [atlasText, json, ...images] = await Promise.all([
    fetch(root + 'c010_00.atlas').then(r => { if (!r.ok) throw new Error(`atlas ${r.status}`); return r.text(); }),
    fetch(root + 'c010_00.json').then(r => { if (!r.ok) throw new Error(`json ${r.status}`); return r.json(); }),
    ...pages.map(loadImage)
  ]);
  const atlas = new spine.TextureAtlas(atlasText);
  atlas.pages.forEach((page, index) => page.setTexture(new spine.CanvasTexture(images[index])));
  const loader = new spine.AtlasAttachmentLoader(atlas);
  const jsonLoader = new spine.SkeletonJson(loader);
  jsonLoader.scale = 1;
  const data = jsonLoader.readSkeletonData(json);
  const skeleton = new spine.Skeleton(data);
  skeleton.setSkinByName('00');
  const state = new spine.AnimationState(new spine.AnimationStateData(data));
  state.setAnimation(0, 'idle', true);
  state.update(0);
  state.apply(skeleton);
  skeleton.updateWorldTransform(spine.Physics?.none ?? 0);
  const renderer = new spine.SkeletonRenderer(ctx);
  renderer.triangleRendering = true;
  const scale = Math.min(canvas.width / (data.width * 1.16), canvas.height / (data.height * 1.16));
  const cx = data.x + data.width / 2;
  const cy = data.y + data.height / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#171120'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height * .9);
  ctx.scale(scale, -scale);
  ctx.translate(-cx, -cy);
  renderer.draw(skeleton);
  ctx.restore();
  const result = {
    status: 'pass',
    runtime: '4.3.13',
    exportedSkeleton: data.version,
    skeleton: data.name,
    bones: data.bones.length,
    slots: data.slots.length,
    skins: data.skins.map(skin => skin.name),
    animations: data.animations.map(animation => animation.name),
    atlasPages: atlas.pages.length,
    atlasRegions: atlas.regions.length,
    renderedSkin: '00',
    renderedAnimation: 'idle'
  };
  window.__migrationProbe = result;
  status(JSON.stringify(result, null, 2));
}

main().catch(error => {
  const result = { status: 'fail', error: error.message };
  window.__migrationProbe = result;
  status(JSON.stringify(result, null, 2));
  console.error(error);
});
