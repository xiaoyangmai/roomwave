/* Semantic anchor resolution and coordinate sampling for a Spine scene. */
export class AnchorSampler {
  constructor({ skeleton = null, binding = null, width = 1, height = 1, camera = null, fit = null } = {}) {
    this.skeleton = skeleton;
    this.binding = binding;
    this.width = width;
    this.height = height;
    this.camera = camera || { scale: 1, cx: 0, cy: 0 };
    this.fit = fit || { offsetX: 0, offsetY: 0 };
  }

  setScene(skeleton, binding) {
    this.skeleton = skeleton;
    this.binding = binding;
  }

  setViewport({ width, height, camera, fit } = {}) {
    this.width = Math.max(1, Number(width) || 1);
    this.height = Math.max(1, Number(height) || 1);
    if (camera) this.camera = camera;
    if (fit) this.fit = fit;
  }

  semanticBone(roleOrBone) {
    const role = this.binding?.semantics?.roles?.[roleOrBone];
    const aliases = {
      strapTarget: 'string_2',
      strapVisual: 'string_2',
      strapControlTarget: 'strap_target_r',
    };
    const boneName = role?.resolved || aliases[roleOrBone] || roleOrBone;
    return this.skeleton?.findBone(boneName) || null;
  }

  getAnchor(roleOrBone) {
    const role = this.binding?.semantics?.roles?.[roleOrBone];
    const aliases = {
      strapTarget: 'string_2',
      strapVisual: 'string_2',
      strapControlTarget: 'strap_target_r',
    };
    const boneName = role?.resolved || aliases[roleOrBone] || roleOrBone;
    const bone = this.skeleton?.findBone(boneName);
    if (!bone) return null;
    const worldX = worldXOf(bone);
    const worldY = worldYOf(bone);
    const point = this.worldToScreen(worldX, worldY);
    return { x: point.x, y: point.y, worldX, worldY, bone: boneName };
  }

  sample(roles = []) {
    return Object.fromEntries(roles.map((role) => [role, this.getAnchor(role)]));
  }

  worldToScreen(worldX, worldY) {
    return {
      x: this.width / 2 + (Number(this.fit.offsetX) || 0) + (worldX - this.camera.cx) * this.camera.scale,
      y: this.height * 0.9 + (Number(this.fit.offsetY) || 0) - (worldY - this.camera.cy) * this.camera.scale,
    };
  }
}

function appliedPose(bone) { return bone?.appliedPose || bone; }
function worldXOf(bone) { return Number(appliedPose(bone)?.worldX) || 0; }
function worldYOf(bone) { return Number(appliedPose(bone)?.worldY) || 0; }
