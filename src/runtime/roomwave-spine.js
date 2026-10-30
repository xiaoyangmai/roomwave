/*
 * Small, model-agnostic Spine adapter for Roomwave.
 *
 * The room sends semantic actions. This module owns the model-specific names,
 * generated target paths, transparent rendering, and a compact trace that can
 * be fed into the automated review pipeline.
 */
export class SpineCharacterAdapter {
  constructor({ canvas, manifest, onTrace = null, debug = false } = {}) {
    if (!canvas) throw new Error('SpineCharacterAdapter requires a canvas.');
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.manifest = manifest;
    this.onTrace = onTrace;
    this.debug = Boolean(debug);
    this.data = null;
    this.skeleton = null;
    this.animationState = null;
    this.renderer = null;
    this.binding = null;
    this.audit = null;
    this.patch = null;
    this.patchStatus = 'not-configured';
    this.handIk = null;
    this.loaded = false;
    this.width = 1;
    this.height = 1;
    this.dpr = 1;
    this.camera = { scale: 1, cx: 0, cy: 0 };
    this.fit = { scaleMultiplier: 1, offsetX: 0, offsetY: 0, ...(manifest?.fit || {}) };
    this.animation = 'idle';
    this.generated = null;
    this.trace = [];
    this.elapsed = 0;
    this.lastStatus = '';
    this.restPose = null;
  }

  async load() {
    if (!globalThis.spine) throw new Error('Spine Canvas runtime is not loaded.');
    const [atlasText, skeletonPayload, binding, audit, patch] = await Promise.all([
      fetch(this.manifest.atlas).then(assertResponse).then((response) => response.text()),
      fetch(this.manifest.skeleton).then(assertResponse).then((response) => this.manifest.format === 'json' ? response.json() : response.arrayBuffer()),
      fetch(this.manifest.binding).then(assertResponse).then((response) => response.json()),
      fetch(this.manifest.audit).then(assertResponse).then((response) => response.json()),
      this.manifest.patch ? fetch(this.manifest.patch).then(assertResponse).then((response) => response.json()) : Promise.resolve(null)
    ]);
    const texturePaths = this.manifest.textures || [this.manifest.texture];
    const images = await Promise.all(texturePaths.filter(Boolean).map(async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      return image;
    }));
    const atlas = new spine.TextureAtlas(atlasText);
    atlas.pages.forEach((page, index) => page.setTexture(new spine.CanvasTexture(images[index] || images[0])));
    const loader = new spine.AtlasAttachmentLoader(atlas);
    if (this.manifest.format === 'json') {
      const json = new spine.SkeletonJson(loader);
      json.scale = 1;
      this.data = json.readSkeletonData(skeletonPayload);
    } else {
      const binary = new spine.SkeletonBinary(loader);
      binary.scale = 1;
      this.data = binary.readSkeletonData(new Uint8Array(skeletonPayload));
    }
    this.skeleton = new spine.Skeleton(this.data);
    this.animationState = new spine.AnimationState(new spine.AnimationStateData(this.data));
    this.renderer = new spine.SkeletonRenderer(this.ctx);
    this.renderer.triangleRendering = true;
    this.binding = binding;
    this.audit = audit;
    this.patch = patch;
    this.applyRuntimePatch();
    if (this.manifest.skin && this.data.findSkin(this.manifest.skin)) this.skeleton.setSkinByName(this.manifest.skin);
    this.loaded = true;
    this.animation = this.data.findAnimation('idle') ? 'idle' : this.data.animations[0]?.name;
    this.resize(this.width, this.height, this.dpr);
    this.setAnimation(this.animation, true);
    this.captureRestPose();
    return this;
  }

  captureRestPose() {
    if (!this.skeleton) return;
    updateWorldTransform(this.skeleton);
    this.restPose = {};
    for (const role of ['handTarget', 'faceTarget']) {
      const bone = this.semanticBone(role);
      if (!bone) continue;
      const pose = localPose(bone);
      this.restPose[role] = { x: pose.x, y: pose.y, rotation: pose.rotation };
    }
  }

  restoreRestPose() {
    if (!this.skeleton || !this.restPose) return;
    for (const [role, value] of Object.entries(this.restPose)) {
      const bone = this.semanticBone(role);
      if (!bone) continue;
      const pose = localPose(bone);
      pose.x = value.x;
      pose.y = value.y;
      pose.rotation = value.rotation;
    }
    updateWorldTransform(this.skeleton);
  }

  applyRuntimePatch() {
    if (!this.patch) return;
    if (this.patch.model && this.patch.model !== this.manifest.model) throw new Error(`Runtime patch model mismatch: ${this.patch.model}`);
    const constraints = this.skeleton.constraints || [];
    const transformConstraints = this.skeleton.transformConstraints || constraints.filter((item) => item instanceof spine.TransformConstraint);
    const ikConstraints = this.skeleton.ikConstraints || constraints.filter((item) => item instanceof spine.IkConstraint);
    for (const [name, config] of Object.entries(this.patch.constraints || {})) {
      const constraint = transformConstraints.find((item) => item.data.name === name);
      if (!constraint) throw new Error(`Runtime patch constraint is missing: ${name}`);
      const pose = constraint.pose || constraint;
      if (Number.isFinite(config.mixRotate)) pose.mixRotate = config.mixRotate;
      if (Number.isFinite(config.mixX)) pose.mixX = config.mixX;
      if (Number.isFinite(config.mixY)) pose.mixY = config.mixY;
    }
    const handIk = this.patch.handIk;
    if (handIk) {
      const constraint = ikConstraints.find((item) => item.data.name === handIk.constraint);
      const parent = this.skeleton.findBone(handIk.parentBone);
      const child = this.skeleton.findBone(handIk.childBone);
      const visualEnd = this.skeleton.findBone(handIk.visualEndBone);
      if (!constraint || !parent || !child || !visualEnd) {
        throw new Error(`Runtime hand IK patch is missing bones or constraint: ${JSON.stringify(handIk)}`);
      }
      // Disable the exported one-bone IK. The fallback applies the same target
      // to the actual visual chain after the normal skeleton update.
      (constraint.pose || constraint).mix = 0;
      this.handIk = {
        constraint,
        parent,
        child,
        visualEnd,
        bendDirection: Number(handIk.bendDirection) < 0 ? -1 : 1,
        mix: Math.max(0, Math.min(1, Number(handIk.mix) || 1)),
      };
      this.patchStatus = `${this.patchStatus}+${handIk.mode || 'hand-ik'}`;
    }
    this.patchStatus = this.patch.mode || 'applied';
    if (this.handIk) this.patchStatus = `${this.patchStatus}+${this.patch.handIk?.mode || 'hand-ik'}`;
  }

  enforceRuntimePatchMixes() {
    if (!this.patch || !this.skeleton) return;
    const constraints = this.skeleton.constraints || [];
    for (const [name, config] of Object.entries(this.patch.constraints || {})) {
      const constraint = constraints.find((item) => item.data?.name === name);
      const pose = constraint?.pose || constraint;
      if (!pose) continue;
      if (Number.isFinite(config.mixRotate)) pose.mixRotate = config.mixRotate;
      if (Number.isFinite(config.mixX)) pose.mixX = config.mixX;
      if (Number.isFinite(config.mixY)) pose.mixY = config.mixY;
    }
    if (this.handIk) (this.handIk.constraint.pose || this.handIk.constraint).mix = 0;
  }

  resize(width, height, dpr = 1) {
    this.width = Math.max(1, Number(width) || 1);
    this.height = Math.max(1, Number(height) || 1);
    this.dpr = Math.min(2, Math.max(1, Number(dpr) || 1));
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this.data) return;
    const dataWidth = Math.max(1, this.data.width || 1);
    const dataHeight = Math.max(1, this.data.height || 1);
    this.camera.scale = Math.min(this.width / (dataWidth * 1.16), this.height / (dataHeight * 1.16)) * Math.max(.25, Number(this.fit.scaleMultiplier) || 1);
    this.camera.cx = this.data.x + dataWidth / 2;
    this.camera.cy = this.data.y + dataHeight / 2;
  }

  setAnimation(name, loop = true) {
    if (!this.animationState || !this.data?.findAnimation(name)) return false;
    this.animation = name;
    this.animationState.setAnimation(0, name, loop);
    return true;
  }

  playSemantic(action, options = {}) {
    const type = typeof action === 'string' ? action : action?.type;
    if (!type || !this.skeleton) return false;
    const duration = Math.max(0.35, Number(options.duration || action?.duration || (type === 'foam_wipe' ? 2.4 : 1.25)));
    this.generated = {
      type,
      elapsed: 0,
      duration,
      intensity: Math.max(0, Math.min(1, Number(options.intensity ?? action?.intensity ?? 0.8))),
      seed: Number(options.seed ?? action?.seed ?? 17)
    };
    this.elapsed = 0;
    this.setAnimation('idle', true);
    return true;
  }

  resetToIdle() {
    this.generated = null;
    this.restoreRestPose();
    this.elapsed = 0;
    this.setAnimation('idle', true);
    this.clearTrace();
  }

  setTarget(name, worldX, worldY) {
    const bone = this.skeleton?.findBone(name);
    if (!bone || !bone.parent) return false;
    const local = new spine.Vector2();
    worldToLocal(bone.parent, local.set(Number(worldX) || 0, Number(worldY) || 0));
    localPose(bone).x = local.x;
    localPose(bone).y = local.y;
    updateWorldTransform(this.skeleton);
    return true;
  }

  getAnchor(roleOrBone) {
    const role = this.binding?.semantics?.roles?.[roleOrBone];
    const aliases = { strapTarget: 'string_2' };
    const boneName = role?.resolved || aliases[roleOrBone] || roleOrBone;
    const bone = this.skeleton?.findBone(boneName);
    if (!bone) return null;
    const point = this.worldToScreen(worldXOf(bone), worldYOf(bone));
    return { x: point.x, y: point.y, worldX: worldXOf(bone), worldY: worldYOf(bone), bone: boneName };
  }

  captureTrace() {
    return {
      model: this.manifest.model,
      animation: this.animation,
      action: this.generated?.type || null,
      patch: this.patchStatus,
      elapsed: this.elapsed,
      frames: this.trace.slice(-120)
    };
  }

  clearTrace() { this.trace.length = 0; }

  update(deltaSeconds) {
    if (!this.loaded || !this.skeleton || !this.animationState) return null;
    const dt = Math.max(0, Math.min(0.05, Number(deltaSeconds) || 0));
    this.elapsed += dt;
    this.animationState.update(dt);
    this.animationState.apply(this.skeleton);
    this.enforceRuntimePatchMixes();
    updateWorldTransform(this.skeleton);
    const action = this.applyGeneratedAction(dt);
    updateWorldTransform(this.skeleton);
    this.applyRuntimeHandIk(action);
    this.draw(action);
    const hand = this.getAnchor('handTarget');
    const handVisual = this.getAnchor('handVisual');
    const face = this.getAnchor('faceTarget');
    const strap = this.getAnchor('strapTarget');
    const sample = { t: this.elapsed, phase: action.phase, hand, handVisual, face, strap, foam: action.foam, type: action.type };
    this.trace.push(sample);
    if (this.trace.length > 240) this.trace.shift();
    if (this.onTrace) this.onTrace(sample, this);
    return action;
  }

  applyGeneratedAction(dt) {
    const handTarget = this.semanticBone('handTarget');
    const faceTarget = this.semanticBone('faceTarget');
    if (!this.generated || !handTarget || !faceTarget) return { type: null, phase: 'idle', progress: 0, foam: 0, water: 0 };
    this.generated.elapsed = Math.min(this.generated.duration, this.generated.elapsed + dt);
    this.elapsed = this.generated.elapsed;
    const t = this.generated.elapsed / this.generated.duration;
    const type = this.generated.type;
    const phase = t < 0.22 ? 'notice' : t < 0.55 ? 'reach' : t < 0.84 ? 'contact' : 'recover';
    const rest = this.generated.rest || (this.generated.rest = { x: worldXOf(handTarget), y: worldYOf(handTarget) });
    const face = { x: worldXOf(faceTarget), y: worldYOf(faceTarget) };
    const face2 = { x: worldXOf(faceTarget) + 42, y: worldYOf(faceTarget) + 12 };
    let targetWorld = rest;
    const handAction = type === 'foam_wipe' || type === 'water_splash' || type === 'fan_hold';
    if (handAction && phase === 'reach') {
      const u = smooth((t - 0.22) / 0.33);
      targetWorld = { x: mix(rest.x, face.x, u), y: mix(rest.y, face.y, u) };
    } else if (handAction && phase === 'contact') {
      const u = smooth((t - 0.55) / 0.29);
      const sweep = 0.5 - 0.5 * Math.cos(u * Math.PI * 2);
      targetWorld = { x: mix(face.x, face2.x, sweep), y: mix(face.y, face2.y, sweep) };
    } else if (handAction && phase === 'recover') {
      const u = smooth((t - 0.84) / 0.16);
      targetWorld = { x: mix(face2.x, rest.x, u), y: mix(face2.y, rest.y, u) };
    }
    if (handAction) {
      const local = new spine.Vector2();
      worldToLocal(handTarget.parent, local.set(targetWorld.x, targetWorld.y));
      localPose(handTarget).x = local.x;
      localPose(handTarget).y = local.y;
    }
    localPose(faceTarget).rotation = type === 'foam_wipe' ? Math.sin(t * Math.PI * 2) * 2 : 0;
    if (this.generated.elapsed >= this.generated.duration) this.generated = null;
    return {
      type,
      phase,
      progress: t,
      foam: type === 'foam_wipe' ? (phase === 'reach' ? 0.35 : phase === 'contact' ? 0.85 : phase === 'recover' ? 0.35 : 0) * this.generatedIntensity(type) : 0,
      water: type === 'water_splash' ? (phase === 'contact' ? this.generatedIntensity(type) : 0) : 0
    };
  }

  applyRuntimeHandIk(action) {
    if (!this.handIk || !this.generated || !action || action.phase === 'idle') return;
    if (!['foam_wipe', 'water_splash', 'fan_hold'].includes(action.type)) return;
    const target = this.semanticBone('handTarget');
    if (!target) return;
    const { parent, child, visualEnd, bendDirection, mix } = this.handIk;
    const parentRotation = (bone) => bone.parent ? Math.atan2(matrix(bone.parent).c, matrix(bone.parent).a) * spine.MathUtils.radDeg : 0;
    const shoulderX = worldXOf(parent);
    const shoulderY = worldYOf(parent);
    const targetX = worldXOf(target);
    const targetY = worldYOf(target);
    const handLocal = new spine.Vector2();
    worldToLocal(child, handLocal.set(worldXOf(visualEnd), worldYOf(visualEnd)));
    const l1 = Math.max(0.001, Math.abs(parent.data.length * (localPose(parent).scaleX ?? 1)));
    const l2 = Math.max(0.001, Math.hypot(handLocal.x, handLocal.y));
    const dx = targetX - shoulderX;
    const dy = targetY - shoulderY;
    const distance = Math.max(0.001, Math.hypot(dx, dy));
    const base = Math.atan2(dy, dx);
    const cosine = (l1 * l1 + distance * distance - l2 * l2) / (2 * l1 * distance);
    const bend = Math.acos(Math.max(-1, Math.min(1, cosine)));
    const firstAngle = base - bendDirection * bend;
    const originalParentRotation = parentRotation(parent);
    localPose(parent).rotation = firstAngle * spine.MathUtils.radDeg - originalParentRotation;
    updateWorldTransform(this.skeleton);
    this._ikDebug = { l1, l2, distance, base, bend, firstAngle, originalParentRotation, parentRotation: localPose(parent).rotation, afterParent: { a: matrix(parent).a, c: matrix(parent).c, x: worldXOf(parent), y: worldYOf(parent) } };
    const handOffsetAngle = Math.atan2(handLocal.y, handLocal.x);
    const secondAngle = Math.atan2(targetY - worldYOf(child), targetX - worldXOf(child)) - handOffsetAngle;
    localPose(child).rotation = secondAngle * spine.MathUtils.radDeg - parentRotation(child);
    updateWorldTransform(this.skeleton);
    this._ikDebug.afterChild = { secondAngle, handOffsetAngle, childRotation: localPose(child).rotation, parent: { a: matrix(parent).a, c: matrix(parent).c }, child: { a: matrix(child).a, c: matrix(child).c, x: worldXOf(child), y: worldYOf(child) } };
    // A small final correction keeps the actual visible hand, rather than the
    // nominal IK endpoint, on the semantic target despite the zero-length
    // intermediary r_arm_3 bone in this export.
    const errorX = targetX - worldXOf(visualEnd);
    const errorY = targetY - worldYOf(visualEnd);
    if (Math.hypot(errorX, errorY) > 1.5) {
      const correction = Math.atan2(errorY, errorX) - Math.atan2(worldYOf(visualEnd) - worldYOf(child), worldXOf(visualEnd) - worldXOf(child));
      // The water target reaches farther than the foam/fan contact pose. A
      // stronger bounded correction keeps the visible endpoint on the target
      // without changing the authored Spine project.
      localPose(child).rotation += correction * spine.MathUtils.radDeg * 0.4 * mix;
      updateWorldTransform(this.skeleton);
      this._ikDebug.afterCorrection = { errorX, errorY, correction, childRotation: localPose(child).rotation, parent: { a: matrix(parent).a, c: matrix(parent).c }, child: { a: matrix(child).a, c: matrix(child).c, x: worldXOf(child), y: worldYOf(child) } };
    }
    // The water reach can exceed the stable angular solution because this
    // export has a zero-length intermediary bone. Apply a bounded positional
    // correction to the derived runtime chain so the visible endpoint lands
    // on the semantic target without changing the authored Spine project.
    const finalErrorX = targetX - worldXOf(visualEnd);
    const finalErrorY = targetY - worldYOf(visualEnd);
    if (Math.hypot(finalErrorX, finalErrorY) > 1.5 && child.parent) {
      const shifted = new spine.Vector2();
      worldToLocal(child.parent, shifted.set(worldXOf(child) + finalErrorX, worldYOf(child) + finalErrorY));
      localPose(child).x = shifted.x;
      localPose(child).y = shifted.y;
      updateWorldTransform(this.skeleton);
      this._ikDebug.afterTranslation = {
        errorX: finalErrorX,
        errorY: finalErrorY,
        child: { x: worldXOf(child), y: worldYOf(child) },
        visualEnd: { x: worldXOf(visualEnd), y: worldYOf(visualEnd) }
      };
    }
  }

  generatedIntensity(type) { return this.generated?.intensity ?? (type === 'foam_wipe' ? 0.8 : 1); }

  draw(action) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (!this.skeleton || !this.renderer) return;
    this.ctx.save();
    this.ctx.translate(this.width / 2 + (Number(this.fit.offsetX) || 0), this.height * 0.9 + (Number(this.fit.offsetY) || 0));
    this.ctx.scale(this.camera.scale, -this.camera.scale);
    this.ctx.translate(-this.camera.cx, -this.camera.cy);
    this.renderer.draw(this.skeleton);
    this.ctx.restore();
    this.drawEffects(action);
    if (this.debug) this.drawDebugMarkers();
  }

  drawDebugMarkers() {
    const markers = [['handTarget', '#7dd9ff', 8], ['handVisual', '#7dffb2', 6], ['faceTarget', '#ff96d2', 11], ['strapTarget', '#ffd487', 7]];
    this.ctx.save();
    for (const [role, color, radius] of markers) {
      const point = this.getAnchor(role);
      if (!point) continue;
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath(); this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); this.ctx.stroke();
      this.ctx.beginPath(); this.ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2); this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawEffects(action) {
    if (!action) return;
    if (action.foam > 0) {
      const face = this.getAnchor('faceTarget');
      const head = this.getAnchor('head');
      if (face) this.paintFoam(face.x + 4, face.y - 4, 22, action.foam * 0.72, 0);
      if (head) this.paintFoam(head.x - 16, head.y - 20, 16, action.foam * 0.48, 1);
    }
    if (action.water > 0) {
      const hand = this.getAnchor('handVisual') || this.getAnchor('handTarget');
      if (!hand) return;
      this.ctx.save();
      this.ctx.strokeStyle = `rgba(164,235,255,${0.9 * action.water})`;
      this.ctx.fillStyle = `rgba(205,247,255,${0.82 * action.water})`;
      this.ctx.lineWidth = 3;
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(hand.x + 6, hand.y - 2);
      this.ctx.quadraticCurveTo(hand.x + 34, hand.y - 18, hand.x + 70, hand.y - 30);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(hand.x + 8, hand.y + 5);
      this.ctx.quadraticCurveTo(hand.x + 38, hand.y - 2, hand.x + 74, hand.y - 10);
      this.ctx.stroke();
      this.ctx.lineWidth = 3;
      for (let index = 0; index < 12; index += 1) {
        const x = hand.x + 12 + index * 6;
        const y = hand.y - 8 - (index % 4) * 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 18, y - 8);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y - 9, 2.8 + (index % 2), 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  paintFoam(x, y, size, alpha, seed) {
    this.ctx.save();
    this.ctx.globalAlpha = Math.min(1, alpha * 0.8);
    this.ctx.fillStyle = '#f5f8ff';
    this.ctx.beginPath(); this.ctx.arc(x, y, size, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.fillStyle = '#dbe7fb';
    this.ctx.beginPath(); this.ctx.arc(x - size * 0.24, y - size * 0.22, size * 0.26, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.beginPath(); this.ctx.arc(x + size * 0.28, y - size * 0.05, size * 0.18, 0, Math.PI * 2); this.ctx.fill();
    this.ctx.restore();
  }

  semanticBone(role) {
    const aliases = { strapTarget: 'string_2' };
    const name = this.binding?.semantics?.roles?.[role]?.resolved || aliases[role] || role;
    return this.skeleton?.findBone(name) || null;
  }

  worldToScreen(worldX, worldY) {
    return { x: this.width / 2 + (Number(this.fit.offsetX) || 0) + (worldX - this.camera.cx) * this.camera.scale, y: this.height * 0.9 + (Number(this.fit.offsetY) || 0) - (worldY - this.camera.cy) * this.camera.scale };
  }
}

function mix(a, b, t) { return a + (b - a) * t; }
function clamp(value, low = 0, high = 1) { return Math.max(low, Math.min(high, value)); }
function smooth(value) { const t = clamp(value); return t * t * (3 - 2 * t); }
function localPose(bone) { return bone?.pose || bone; }
function appliedPose(bone) { return bone?.appliedPose || bone; }
function matrix(bone) { return appliedPose(bone); }
function worldXOf(bone) { return Number(appliedPose(bone)?.worldX) || 0; }
function worldYOf(bone) { return Number(appliedPose(bone)?.worldY) || 0; }
function worldToLocal(bone, vector) {
  const pose = appliedPose(bone);
  if (typeof pose?.worldToLocal === 'function') return pose.worldToLocal(vector);
  const det = pose.a * pose.d - pose.b * pose.c;
  if (Math.abs(det) < 1e-8) return vector.set(0, 0);
  const x = vector.x - pose.worldX;
  const y = vector.y - pose.worldY;
  return vector.set((x * pose.d - y * pose.b) / det, (y * pose.a - x * pose.c) / det);
}
function updateWorldTransform(skeleton) {
  if (globalThis.spine?.Physics && globalThis.spine.Physics.none !== undefined) skeleton.updateWorldTransform(globalThis.spine.Physics.none);
  else skeleton.updateWorldTransform();
}
function assertResponse(response) { if (!response.ok) throw new Error(`Could not load ${response.url} (${response.status})`); return response; }

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (globalThis.spine) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load Spine runtime: ${src}`));
    document.head.appendChild(script);
  });
}
