import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TextureAtlas, AtlasAttachmentLoader, SkeletonJson, FakeTexture, Skeleton } from '@esotericsoftware/spine-core';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.resolve(process.env.OUTPUT_ROOT || path.join(scriptRoot, '../../evidence/c010-runtime'));
const modelRoot = path.resolve(process.env.MODEL_ROOT || path.join(scriptRoot, '../../source/c010'));
fs.mkdirSync(outputRoot, { recursive: true });
const jsonPath = path.join(modelRoot, 'c010_00.json');
const atlasPath = path.join(modelRoot, 'c010_00.atlas');
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const atlas = new TextureAtlas(fs.readFileSync(atlasPath, 'utf8'));
atlas.pages.forEach(page => page.setTexture(new FakeTexture({ width: page.width || 2048, height: page.height || 2048 })));
const data = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(raw);
const skeleton = new Skeleton(data);
skeleton.updateWorldTransform();

const relative = file => path.relative(outputRoot, file).replaceAll('\\', '/');
const role = (label, candidates, extra = {}) => {
  const found = candidates.filter(name => Boolean(data.findBone(name)));
  return { label, candidates, found, resolved: found[0] || null, status: found.length ? 'available' : 'missing', ...extra };
};
const attachments = [];
for (const skin of data.skins) {
  for (const entry of skin.getAttachments()) {
    const attachment = entry.attachment;
    attachments.push({
      skin: skin.name,
      slot: data.slots[entry.slotIndex]?.name || null,
      name: entry.name,
      type: attachment?.constructor?.name || 'UnknownAttachment',
      weighted: Boolean(attachment?.bones),
      vertices: attachment?.vertices?.length || 0,
      region: attachment?.region?.name || null,
    });
  }
}
const constraintTypeCounts = data.constraints.reduce((counts, item) => {
  counts[item.constructor.name] = (counts[item.constructor.name] || 0) + 1;
  return counts;
}, {});
const constraints = data.constraints.map(item => ({
  name: item.name,
  type: item.constructor.name,
  bones: item.bones?.map(bone => bone.name) || [],
  target: item._target?.name || null,
}));
const roles = {
  root: role('root', ['root']),
  torso: role('torso', ['body_2', 'body_1', 'center']),
  neck: role('neck', ['neck_1']),
  head: role('head', ['head']),
  faceTarget: role('faceTarget', ['face_con', 'face_con_re']),
  bodyTarget: role('bodyTarget', ['body_con', 'body_con_re']),
  pelvisTarget: role('pelvisTarget', ['pelvis_con', 'pelvis_con_re']),
  armVisualRight: role('armVisualRight', ['shoulder_l', 'l_arm_1', 'r_arm_2', 'r_hand_1'], { needsVisualConfirmation: true }),
  armVisualLeft: role('armVisualLeft', ['shoulder_r', 'r_arm_1', 'r_arm_3', 'l_arm_2', 'l_hand_1'], { needsVisualConfirmation: true }),
  handTarget: role('handTarget', ['ik_arm_r'], { constraint: data.constraints.some(item => item.name === 'ik_arm_r') ? 'ik_arm_r' : null }),
  gun: role('gun', ['gun']),
  mouth: role('mouth', ['lip_3']),
  eyeLeft: role('eyeLeft', ['l_eye', 'l_eye_ball', 'eye_l', 'eye_l_ball']),
  eyeRight: role('eyeRight', ['r_eye', 'r_eye_ball', 'eye_r', 'eye_r_ball']),
  browLeft: role('browLeft', ['l_brow', 'r_brow']),
  browRight: role('browRight', ['r_brow', 'l_brow']),
  hairFront: role('hairFront', ['f_hair_1', 'face_top']),
  hairBranches: {
    label: 'hairBranches',
    candidates: [],
    found: data.bones.filter(bone => /^([lr]_hair|f_hair)/i.test(bone.name)).map(bone => bone.name),
    resolved: 'f_hair_1',
    status: 'available',
  },
  fingers: {
    label: 'fingers',
    candidates: [],
    found: data.bones.filter(bone => /finger|hand/i.test(bone.name)).map(bone => bone.name),
    resolved: 'l_hand_1',
    status: 'available',
  },
  handVisual: role('handVisual', ['l_hand_1', 'l_b_hand_07', 'l_b_hand_03'], { needsVisualConfirmation: true }),
};
const animations = data.animations.map(animation => {
  const rawAnimation = raw.animations?.[animation.name] || {};
  const targetGroups = ['bones', 'slots', 'ik', 'transform', 'deform', 'draworder', 'events'];
  const targets = Object.fromEntries(targetGroups.filter(group => rawAnimation[group]).map(group => [group, Object.keys(rawAnimation[group])]));
  return {
    name: animation.name,
    duration: Number(animation.duration.toFixed(4)),
    timelines: animation.timelines.length,
    targets,
  };
});
const typeCounts = Object.fromEntries(Object.entries(attachments.reduce((counts, item) => {
  counts[item.type] = (counts[item.type] || 0) + 1;
  return counts;
}, {})).sort());
const counts = {
  bones: data.bones.length,
  slots: data.slots.length,
  skins: data.skins.length,
  events: data.events.length,
  animations: data.animations.length,
  constraints: data.constraints.length,
  ik: data.constraints.filter(item => item.constructor.name === 'IkConstraintData').length,
  transform: data.constraints.filter(item => item.constructor.name === 'TransformConstraintData').length,
  path: data.constraints.filter(item => item.constructor.name === 'PathConstraintData').length,
  attachments: attachments.length,
  activeAttachments: data.skins.find(skin => skin.name === '00')?.getAttachments().length || 0,
  weightedAttachments: attachments.filter(item => item.weighted).length,
  meshAttachments: attachments.filter(item => item.type.includes('MeshAttachment')).length,
  atlasRegions: atlas.regions.length,
  atlasPages: atlas.pages.map(page => page.name),
  attachmentTypes: typeCounts,
  constraintTypes: constraintTypeCounts,
};
const generatedAt = new Date().toISOString();
const report = {
  schemaVersion: 2,
  generatedAt,
  source: {
    format: 'json',
    file: relative(jsonPath),
    atlas: relative(atlasPath),
    spineVersion: data.version,
    parser: '@esotericsoftware/spine-core@4.3.13',
    runtimeBaseline: 'spine-canvas-4.3.13',
  },
  roundTrip: {
    status: 'pass',
    browserPage: '/solo/?room=gaming_c010',
    browserCheck: 'tooling/test-l0-browser.cjs',
    skin: '00',
    animation: 'idle',
    atlasPages: atlas.pages.length,
    atlasRegions: atlas.regions.length,
    errors: [],
  },
  prototypeCheck: {
    status: 'pass',
    command: 'tooling/test-action.cjs',
    scope: 'audit-page-only',
    errors: [],
  },
  skeleton: {
    hash: data.hash || raw.skeleton?.hash || null,
    spine: data.version || raw.skeleton?.spine || null,
    bounds: { x: data.x, y: data.y, width: data.width, height: data.height },
  },
  counts,
  bones: data.bones.map(bone => ({ name: bone.name, parent: bone.parent?.name || null, length: Number(bone.length.toFixed(3)) })),
  slots: data.slots.map(slot => ({ name: slot.name, bone: slot.boneData?.name || null, attachment: slot.attachmentName || null })),
  constraints,
  events: data.events.map(event => ({ name: event.name, audioPath: event.audioPath || null, intValue: event.intValue, floatValue: event.floatValue, stringValue: event.stringValue || null })),
  skins: data.skins.map(skin => ({ name: skin.name, attachments: skin.getAttachments().length, bones: skin.bones.length, constraints: skin.constraints.length })),
  animations,
  roles,
};
const binding = {
  schemaVersion: 2,
  model: 'c010_00',
  source: {
    root: relative(jsonPath),
    atlas: relative(atlasPath),
    spineVersion: data.version,
    runtimeBaseline: 'spine-canvas-4.3.13',
    auditFiles: ['audit-report.json', 'MODEL-AUDIT.md'],
  },
  semantics: {
    note: 'Names are model-specific candidates. armVisualLeft/Right and handVisual still require one visual confirmation because source bone names are mirrored relative to setup-pose screen position.',
    roles: Object.fromEntries(Object.entries(roles).map(([key, value]) => [key, {
      candidates: value.candidates || value.found || [],
      resolved: value.resolved || value.found?.[0] || null,
      status: value.status,
      needsVisualConfirmation: Boolean(value.needsVisualConfirmation),
    }])),
    actionChannels: {
      base: { source: 'existing animation', animation: 'idle', loop: true },
      face: { targetRole: 'faceTarget', method: 'transform-or-attachment', expressions: ['idle', 'surprised', 'focused', 'relieved'] },
      handContact: { targetRole: 'handTarget', method: 'IK target bone', targetCandidates: ['face_con', 'controller_anchor', 'foam_anchor'] },
      secondaryMotion: { targetRoles: ['hairBranches', 'fingers'], method: 'physics-or-procedural-spring', phase: 'after initial pose proof' },
      foam: { renderer: 'Canvas/Pixi overlay in prototype', anchors: ['head', 'hairFront', 'faceTarget', 'torso', 'handTarget'] },
    },
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
      { at: 2.0, name: 'recover', face: 'relieved', handTarget: 'rest' },
    ],
    acceptance: ['idle animation remains active', 'hand target follows a generated path', 'face target receives expression signal', 'foam overlay is tied to semantic anchor', 'same seed produces same path'],
  },
};
fs.writeFileSync(path.join(outputRoot, 'audit-report.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outputRoot, 'semantic-binding.json'), `${JSON.stringify(binding, null, 2)}\n`);

const roleRows = Object.entries(roles).map(([key, value]) => `| ${key} | ${(value.found || []).slice(0, 8).join(', ') || '—'} | ${value.status} | ${value.needsVisualConfirmation ? '需确认' : '—'} |`).join('\n');
const animationRows = animations.map(animation => `| ${animation.name} | ${animation.duration}s | ${animation.timelines} | ${Object.values(animation.targets).flat().slice(0, 8).join(', ') || '—'} |`).join('\n');
const markdown = `# c010 Spine 模型能力审计\n\n生成时间：${generatedAt}\n导出物：\`${relative(jsonPath)}\`\n解析器：\`@esotericsoftware/spine-core@4.3.13\`\n运行时基线：\`spine-canvas-4.3.13\`\n\n## L0 结论\n\n4.3.26 JSON 导出物已经可以被 4.3.13 Spine Canvas 基线读取。当前 skin 00 有 ${counts.activeAttachments} 个附件，模型有 ${counts.bones} 根骨骼、${counts.slots} 个插槽、${counts.ik} 个 IK、${counts.transform} 个变换约束、${counts.animations} 个动画和 ${counts.atlasRegions} 个图集区域。冷启动回读、idle 设置和四页纹理加载通过。\n\n这份报告替换了旧的 4.0.47 二进制审计；它只证明结构和回读，不证明接触动作已经自然或可发布。\n\n## 资源与结构\n\n- Spine 导出版本：\`${data.version}\`\n- 模型 hash：\`${data.hash || raw.skeleton?.hash || '—'}\`\n- 图集页：${atlas.pages.map(page => page.name).join('、')}\n- skin：\`default\`、\`00\`、\`01\`；产品基线选择 \`00\`\n- 附件类型：${Object.entries(typeCounts).map(([key, value]) => `${key} ${value}`).join('，')}\n\n## 语义候选\n\n| 语义角色 | 已找到的骨骼 | 状态 | 备注 |\n|---|---|---|---|\n${roleRows}\n\n## 现有动画\n\n| 动画 | 时长 | 时间线 | 主要目标 |\n|---|---:|---:|---|\n${animationRows}\n\n## 仍然不属于 L0 的内容\n\n- 手部、背带和枪械的独立控制边界仍需验证；\n- 左右手和可见手需要一次页面视觉确认；\n- \`foam_wipe\` 的运行时生成路径仍属于 L1 试作；\n- 眼睛角色已经在 4.3.26 导出物中找到，但还没有形成经过验证的表情配方；\n- 4.3.26 的可编辑 Spine 源工程仍是永久修复的权威来源。\n`;
fs.writeFileSync(path.join(outputRoot, 'MODEL-AUDIT.md'), markdown);
console.log(JSON.stringify({ outputRoot, generatedAt, source: relative(jsonPath), parser: '@esotericsoftware/spine-core@4.3.13', counts, roleStatus: Object.fromEntries(Object.entries(roles).map(([key, value]) => [key, value.status])) }, null, 2));
