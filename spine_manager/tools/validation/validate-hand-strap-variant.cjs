const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { TextureAtlas, AtlasAttachmentLoader, SkeletonJson, FakeTexture, Skeleton } = require('@esotericsoftware/spine-core');

const root = path.resolve(__dirname, '../../..');
const modelRoot = path.join(root, 'resources/characters/c010_00/model');
const sourcePath = path.join(root, 'spine_manager/source/c010/c010_00.json');
const variantPath = path.join(modelRoot, 'c010_00.hand-strap-isolated.json');
const atlasPath = path.join(modelRoot, 'c010_00.atlas');
const manifestPath = path.join(modelRoot, 'c010_00.hand-strap-isolated.manifest.json');
const raw = JSON.parse(fs.readFileSync(variantPath, 'utf8'));
const atlas = new TextureAtlas(fs.readFileSync(atlasPath, 'utf8'));
atlas.pages.forEach(page => page.setTexture(new FakeTexture({ width: page.width || 2048, height: page.height || 2048 })));
const data = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(raw);
const skeleton = new Skeleton(data);
skeleton.setSkinByName('00');
skeleton.updateWorldTransform();
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const variantConstraint = Object.values(raw.constraints || {}).find(constraint => constraint.name === 'string_2');
const checks = {
  spineVersion: data.version,
  variantLoads: true,
  strapTarget: Boolean(data.findBone('strap_target_r')),
  handTarget: Boolean(data.findBone('ik_arm_r')),
  strapBone: Boolean(data.findBone('string_2')),
  string2Source: variantConstraint?.source || null,
  sourceUnchanged: manifest.sourceSha256 === crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'),
  atlasPages: atlas.pages.length,
  skin: '00',
};
console.log(JSON.stringify(checks, null, 2));
if (checks.spineVersion !== '4.3.26' || !checks.variantLoads || !checks.strapTarget || !checks.handTarget || !checks.strapBone || checks.string2Source !== 'strap_target_r' || !checks.sourceUnchanged) process.exit(1);
