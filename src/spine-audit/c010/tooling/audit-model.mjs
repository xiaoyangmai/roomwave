import fs from 'node:fs';
import path from 'node:path';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonBinary, FakeTexture, Skeleton } from '@esotericsoftware/spine-core';

const sourceRoot = process.env.SOURCE_ROOT || 'C:/Users/mi/Desktop/NIKKE_Spine_10/c010';
const outputRoot = process.env.OUTPUT_ROOT || path.resolve(process.cwd(), '..');
const modelRoot = path.join(outputRoot, 'model');
fs.mkdirSync(modelRoot, { recursive: true });

function rel(p) { return path.relative(outputRoot, p).replaceAll('\\', '/'); }
function readSkeleton(skelPath) {
  const atlasPath = skelPath.replace(/\.skel$/i, '.atlas');
  const atlasText = fs.readFileSync(atlasPath, 'utf8');
  const atlas = new TextureAtlas(atlasText);
  atlas.pages.forEach(page => page.setTexture(new FakeTexture({ width: page.width || 2048, height: page.height || 2048 })));
  const loader = new AtlasAttachmentLoader(atlas);
  const data = new SkeletonBinary(loader).readSkeletonData(new Uint8Array(fs.readFileSync(skelPath)));
  const skeleton = new Skeleton(data);
  skeleton.updateWorldTransform();
  return { atlas, data, skeleton, atlasPath };
}
function typeName(attachment) { return attachment?.constructor?.name || 'UnknownAttachment'; }
function containsAny(value, words) { const lower = value.toLowerCase(); return words.some(word => lower.includes(word)); }
function pick(data, names) { return names.find(name => Boolean(data.findBone(name))); }
function role(data, label, candidates, description, extra = {}) {
  const found = candidates.filter(name => Boolean(data.findBone(name)));
  return { label, description, candidates, found, status: found.length ? 'available' : 'missing', ...extra };
}
function attachmentSummary(data) {
  const out = [];
  for (const skin of data.skins) {
    for (const entry of skin.getAttachments()) {
      const attachment = entry.attachment;
      const vertices = attachment?.vertices?.length || 0;
      out.push({
        skin: skin.name,
        slotIndex: entry.slotIndex,
        slot: data.slots[entry.slotIndex]?.name || null,
        name: entry.name,
        type: typeName(attachment),
        weighted: Boolean(attachment?.bones),
        vertices,
        region: attachment?.region?.name || null
      });
    }
  }
  return out;
}
function timelineSummary(data, animation) {
  const properties = new Set();
  const targets = new Set();
  for (const timeline of animation.timelines) {
    for (const id of timeline.propertyIds || []) properties.add(id);
    if (Number.isInteger(timeline.boneIndex)) targets.add(data.bones[timeline.boneIndex]?.name);
    if (Number.isInteger(timeline.slotIndex)) targets.add(data.slots[timeline.slotIndex]?.name);
    if (Number.isInteger(timeline.ikConstraintIndex)) targets.add(data.ikConstraints[timeline.ikConstraintIndex]?.name);
    if (Number.isInteger(timeline.transformConstraintIndex)) targets.add(data.transformConstraints[timeline.transformConstraintIndex]?.name);
  }
  return { name: animation.name, duration: Number(animation.duration.toFixed(4)), timelines: animation.timelines.length, properties: [...properties], targets: [...targets].filter(Boolean) };
}
function auditFile(skelPath) {
  const { atlas, data, skeleton, atlasPath } = readSkeleton(skelPath);
  const attachments = attachmentSummary(data);
  const typeCounts = Object.fromEntries(Object.entries(attachments.reduce((acc, item) => { acc[item.type] = (acc[item.type] || 0) + 1; return acc; }, {})).sort());
  const weighted = attachments.filter(item => item.weighted).length;
  const meshCount = attachments.filter(item => item.type.includes('MeshAttachment')).length;
  const namedBones = data.bones.map((bone, index) => {
    const runtime = skeleton.bones[index];
    return { index, name: bone.name, parent: bone.parent?.name || null, length: Number(bone.length.toFixed(3)), x: Number(bone.x.toFixed(3)), y: Number(bone.y.toFixed(3)), worldX: Number(runtime.worldX.toFixed(3)), worldY: Number(runtime.worldY.toFixed(3)) };
  });
  const slots = data.slots.map(slot => ({ index: slot.index, name: slot.name, bone: slot.boneData?.name || null, attachment: slot.attachmentName || null }));
  const constraints = {
    ik: data.ikConstraints.map(c => ({ name: c.name, bones: c.bones.map(b => b.name), target: c.target?.name || null, mix: c.mix, order: c.order })),
    transform: data.transformConstraints.map(c => ({ name: c.name, bones: c.bones?.map(b => b.name) || (c.bone ? [c.bone.name] : []), target: c.target?.name || null, mixRotate: c.mixRotate, mixX: c.mixX, mixY: c.mixY, order: c.order }))
  };
  const roles = {
    root: role(data, 'root', ['root'], 'Skeleton root'),
    torso: role(data, 'torso', ['body_2', 'body_1', 'center'], '主躯干和坐姿重心'),
    neck: role(data, 'neck', ['neck_1'], '颈部'),
    head: role(data, 'head', ['head'], '头部'),
    faceTarget: role(data, 'faceTarget', ['face_con', 'face_con_re'], '面部统一控制目标'),
    bodyTarget: role(data, 'bodyTarget', ['body_con', 'body_con_re'], '身体统一控制目标'),
    pelvisTarget: role(data, 'pelvisTarget', ['pelvis_con', 'pelvis_con_re'], '骨盆统一控制目标'),
    armVisualRight: role(data, 'armVisualRight', ['shoulder_l', 'l_arm_1', 'r_arm_2', 'r_hand_1'], '根据当前 setup pose 的正 X 侧推断的手臂链', {needsVisualConfirmation: true}),
    armVisualLeft: role(data, 'armVisualLeft', ['shoulder_r', 'r_arm_1', 'r_arm_3', 'l_arm_2', 'l_hand_1'], '根据当前 setup pose 的负 X 侧推断的手臂链', {needsVisualConfirmation: true}),
    handTarget: role(data, 'handTarget', ['ik_arm_r'], '现有 IK 手部目标；可用于生成擦拭、触摸和道具接触动作', {constraint: data.findIkConstraint('ik_arm_r') ? 'ik_arm_r' : null}),
    gun: role(data, 'gun', ['gun'], '武器/控制器道具骨骼'),
    mouth: role(data, 'mouth', ['lip_3'], '嘴部控制骨骼'),
    eyeLeft: role(data, 'eyeLeft', ['eye_l', 'eye_l_ball'], '左眼控制'),
    eyeRight: role(data, 'eyeRight', ['eye_r', 'eye_r_ball'], '右眼控制'),
    browLeft: role(data, 'browLeft', ['l_brow', 'r_brow'], '眉毛控制之一'),
    browRight: role(data, 'browRight', ['r_brow', 'l_brow'], '眉毛控制之二'),
    hairFront: role(data, 'hairFront', ['f_hair_1', 'face_top'], '前发和脸前遮挡'),
    hairBranches: { label: 'hairBranches', description: '头发链', found: data.bones.filter(b => /^([lr]_hair|f_hair)/i.test(b.name)).map(b => b.name), status: data.bones.some(b => /^([lr]_hair|f_hair)/i.test(b.name)) ? 'available' : 'missing' },
    fingers: { label: 'fingers', description: '手指链', found: data.bones.filter(b => /finger|hand/i.test(b.name)).map(b => b.name), status: data.bones.some(b => /finger|hand/i.test(b.name)) ? 'available' : 'missing' }
  };
  const actions = data.animations.map(animation => timelineSummary(data, animation));
  const visibleSkin = data.skins.find(s => s.name === 'default') || data.skins[0];
  const activeAttachments = visibleSkin ? visibleSkin.getAttachments().filter(e => data.slots[e.slotIndex]?.attachmentName === e.name).length : 0;
  const relative = path.relative(sourceRoot, skelPath).replaceAll('\\', '/');
  return {
    file: relative,
    source: { skel: rel(skelPath), atlas: rel(atlasPath), atlasPages: atlas.pages.map(p => p.name), atlasRegions: atlas.regions.length },
    skeleton: { version: data.version, hash: data.hash || null, bounds: [data.x, data.y, data.width, data.height], fps: data.fps || null },
    counts: { bones: data.bones.length, slots: data.slots.length, skins: data.skins.length, events: data.events.length, animations: data.animations.length, ik: data.ikConstraints.length, transform: data.transformConstraints.length, path: data.pathConstraints.length, attachments: attachments.length, activeAttachments, weightedAttachments: weighted, meshAttachments: meshCount, atlasRegions: atlas.regions.length, attachmentTypes: typeCounts },
    bones: namedBones,
    slots,
    constraints,
    events: data.events.map(event => ({ name: event.name, audioPath: event.audioPath || null, intValue: event.intValue, floatValue: event.floatValue, stringValue: event.stringValue || null })),
    skins: data.skins.map(skin => ({ name: skin.name, attachments: skin.getAttachments().length, bones: skin.bones.length, constraints: skin.constraints.length })),
    attachments,
    animations: actions,
    roles
  };
}

const skels = [];
function collect(dir) { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) collect(full); else if (entry.name.toLowerCase().endsWith('.skel')) skels.push(full); } }
collect(sourceRoot);
const audits = skels.map(file => { try { return auditFile(file); } catch (error) { return { file: path.relative(sourceRoot, file).replaceAll('\\', '/'), error: String(error?.message || error) }; } });
const main = audits.find(a => a.file === 'c010_00.skel' && !a.error) || audits.find(a => !a.error) || audits[0];
if (!main || main.error) { console.error(JSON.stringify(audits, null, 2)); process.exit(1); }
const generated = {
  schemaVersion: 1,
  model: 'c010_00',
  source: { root: sourceRoot, spineVersion: main.skeleton.version, auditFiles: audits.map(a => a.file) },
  semantics: {
    note: 'Names are model-specific candidates. armVisualLeft/Right require one visual confirmation because source bone names are mirrored relative to setup-pose screen position.',
    roles: Object.fromEntries(Object.entries(main.roles).map(([key, value]) => [key, { candidates: value.candidates || value.found || [], resolved: value.found?.[0] || null, status: value.status, needsVisualConfirmation: Boolean(value.needsVisualConfirmation) }])),
    actionChannels: {
      base: { source: 'existing animation', animation: 'idle', loop: true },
      face: { targetRole: 'faceTarget', method: 'transform-or-attachment', expressions: ['idle', 'surprised', 'focused', 'relieved'] },
      handContact: { targetRole: 'handTarget', method: 'IK target bone', targetCandidates: ['face_con', 'controller_anchor', 'foam_anchor'] },
      secondaryMotion: { targetRoles: ['hairBranches', 'fingers'], method: 'physics-or-procedural-spring', phase: 'after initial pose proof' },
      foam: { renderer: 'Canvas/Pixi overlay in prototype', anchors: ['head', 'hairFront', 'faceTarget', 'torso', 'handTarget'] }
    }
  },
  prototype: {
    baseAnimation: 'idle',
    generatedAction: 'foam_wipe',
    duration: 2.4,
    driver: 'runtime IK target + face target + overlay effect',
    phases: [
      { at: 0, name: 'notice', face: 'surprised', handTarget: 'rest' },
      { at: 0.55, name: 'reach', face: 'focused', handTarget: 'face' },
      { at: 1.25, name: 'wipe', face: 'focused', handTarget: 'face' },
      { at: 2.0, name: 'recover', face: 'relieved', handTarget: 'rest' }
    ],
    acceptance: ['idle animation remains active', 'hand target follows a generated path', 'face target receives expression signal', 'foam overlay is tied to semantic anchor', 'same seed produces same path']
  }
};

for (const src of [
  path.join(sourceRoot, 'c010_00.skel'), path.join(sourceRoot, 'c010_00.atlas'), path.join(sourceRoot, 'c010_00.png')
]) fs.copyFileSync(src, path.join(modelRoot, path.basename(src)));
fs.writeFileSync(path.join(outputRoot, 'audit-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), sourceRoot, audits }, null, 2));
fs.writeFileSync(path.join(outputRoot, 'semantic-binding.json'), JSON.stringify(generated, null, 2));

const summary = audits.map(a => a.error ? `| ${a.file} | — | — | — | — | — | — | — | 解析失败：${a.error.replaceAll('|', '/')}` : `| ${a.file} | ${a.skeleton.version} | ${a.counts.bones} | ${a.counts.slots} | ${a.counts.animations} | ${a.counts.ik} | ${a.counts.transform} | ${a.counts.meshAttachments} |`).join('\n');
const roleRows = Object.entries(main.roles).map(([key, value]) => `| ${key} | ${(value.found || []).slice(0, 8).join(', ') || '—'} | ${value.status} | ${value.needsVisualConfirmation ? '需确认' : '—'} |`).join('\n');
const animationRows = main.animations.map(a => `| ${a.name} | ${a.duration}s | ${a.timelines} | ${(a.targets || []).slice(0, 8).join(', ') || '—'} |`).join('\n');
const report = `# c010 Spine 模型能力审计\n\n生成时间：${new Date().toISOString()}\n原始目录：\`${sourceRoot}\`\n\n## 结论\n\n主模型是 Spine ${main.skeleton.version} 导出的二进制骨架，不是只包含一张图片的简单模型。它有 ${main.counts.bones} 根骨骼、${main.counts.slots} 个插槽、${main.counts.ik} 个 IK、${main.counts.transform} 个变换约束、${main.counts.animations} 个现有动画和 ${main.counts.meshAttachments} 个网格附件。模型已经具备面部控制、头发链、双臂、手指、道具和统一身体/脸部控制目标，适合接入语义动作生成器。\n\n当前原始目录没有 \`.spine\` 工程和 JSON，只有导出的 \`.skel/.atlas/.png\`。因此本轮可以做运行时审计和动作试作，但不能直接回写原始 Spine 编辑工程。\n\n## 文件清单\n\n| 文件 | 版本 | 骨骼 | 插槽 | 动画 | IK | Transform | 网格 |\n|---|---:|---:|---:|---:|---:|---:|---:|\n${summary}\n\n## 主模型语义候选\n\n| 语义角色 | 候选骨骼 | 状态 | 备注 |\n|---|---|---|---|\n${roleRows}\n\n## 主模型现有动画\n\n| 动画 | 时长 | 时间线 | 主要目标 |\n|---|---:|---:|---|\n${animationRows}\n\n## 本轮最小试作\n\n- 基础轨道使用现有的 \`idle\` 动画。\n- 生成一个 \`foam_wipe\` 语义动作，不修改原始骨架文件。\n- 通过现有 \`ik_arm_r\` 目标骨骼生成手部路径。\n- 通过 \`face_con\` 生成面部反应信号。\n- 泡沫在试作中先作为 Canvas 覆盖层，验证动作与语义锚点的连接。\n- 左右手的视觉方向需要在页面中确认一次，因为模型的骨骼命名和屏幕左右不是完全一致。\n\n## 需要保留的验证证据\n\n- \`audit-report.json\`：完整骨骼、插槽、约束、附件和动画清单。\n- \`semantic-binding.json\`：语义角色、动作通道和试作阶段。\n- 页面中的结构调试信息和动作阶段状态。\n- 原始模型文件保持不变，试作只在运行时驱动目标骨骼。\n`;
fs.writeFileSync(path.join(outputRoot, 'MODEL-AUDIT.md'), report);
console.log(JSON.stringify({ outputRoot, files: ['audit-report.json', 'semantic-binding.json', 'MODEL-AUDIT.md'], main: main.counts, version: main.skeleton.version }, null, 2));







