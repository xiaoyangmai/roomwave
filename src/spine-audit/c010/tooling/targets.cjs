var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// targets.mjs
var import_node_fs = __toESM(require("node:fs"), 1);

// node_modules/@esotericsoftware/spine-core/dist/Utils.js
var StringSet = class {
  constructor() {
    this.entries = {};
    this.size = 0;
  }
  add(value) {
    let contains = this.entries[value];
    this.entries[value] = true;
    if (!contains) {
      this.size++;
      return true;
    }
    return false;
  }
  addAll(values) {
    let oldSize = this.size;
    for (var i = 0, n = values.length; i < n; i++)
      this.add(values[i]);
    return oldSize != this.size;
  }
  contains(value) {
    return this.entries[value];
  }
  clear() {
    this.entries = {};
    this.size = 0;
  }
};
var Color = class _Color {
  constructor(r = 0, g = 0, b = 0, a = 0) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  set(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    return this.clamp();
  }
  setFromColor(c) {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;
    this.a = c.a;
    return this;
  }
  setFromString(hex) {
    hex = hex.charAt(0) == "#" ? hex.substr(1) : hex;
    this.r = parseInt(hex.substr(0, 2), 16) / 255;
    this.g = parseInt(hex.substr(2, 2), 16) / 255;
    this.b = parseInt(hex.substr(4, 2), 16) / 255;
    this.a = hex.length != 8 ? 1 : parseInt(hex.substr(6, 2), 16) / 255;
    return this;
  }
  add(r, g, b, a) {
    this.r += r;
    this.g += g;
    this.b += b;
    this.a += a;
    return this.clamp();
  }
  clamp() {
    if (this.r < 0)
      this.r = 0;
    else if (this.r > 1)
      this.r = 1;
    if (this.g < 0)
      this.g = 0;
    else if (this.g > 1)
      this.g = 1;
    if (this.b < 0)
      this.b = 0;
    else if (this.b > 1)
      this.b = 1;
    if (this.a < 0)
      this.a = 0;
    else if (this.a > 1)
      this.a = 1;
    return this;
  }
  static rgba8888ToColor(color, value) {
    color.r = ((value & 4278190080) >>> 24) / 255;
    color.g = ((value & 16711680) >>> 16) / 255;
    color.b = ((value & 65280) >>> 8) / 255;
    color.a = (value & 255) / 255;
  }
  static rgb888ToColor(color, value) {
    color.r = ((value & 16711680) >>> 16) / 255;
    color.g = ((value & 65280) >>> 8) / 255;
    color.b = (value & 255) / 255;
  }
  static fromString(hex) {
    return new _Color().setFromString(hex);
  }
};
Color.WHITE = new Color(1, 1, 1, 1);
Color.RED = new Color(1, 0, 0, 1);
Color.GREEN = new Color(0, 1, 0, 1);
Color.BLUE = new Color(0, 0, 1, 1);
Color.MAGENTA = new Color(1, 0, 1, 1);
var MathUtils = class _MathUtils {
  static clamp(value, min, max) {
    if (value < min)
      return min;
    if (value > max)
      return max;
    return value;
  }
  static cosDeg(degrees) {
    return Math.cos(degrees * _MathUtils.degRad);
  }
  static sinDeg(degrees) {
    return Math.sin(degrees * _MathUtils.degRad);
  }
  static signum(value) {
    return value > 0 ? 1 : value < 0 ? -1 : 0;
  }
  static toInt(x) {
    return x > 0 ? Math.floor(x) : Math.ceil(x);
  }
  static cbrt(x) {
    let y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  }
  static randomTriangular(min, max) {
    return _MathUtils.randomTriangularWith(min, max, (min + max) * 0.5);
  }
  static randomTriangularWith(min, max, mode) {
    let u = Math.random();
    let d = max - min;
    if (u <= (mode - min) / d)
      return min + Math.sqrt(u * d * (mode - min));
    return max - Math.sqrt((1 - u) * d * (max - mode));
  }
  static isPowerOfTwo(value) {
    return value && (value & value - 1) === 0;
  }
};
MathUtils.PI = 3.1415927;
MathUtils.PI2 = MathUtils.PI * 2;
MathUtils.radiansToDegrees = 180 / MathUtils.PI;
MathUtils.radDeg = MathUtils.radiansToDegrees;
MathUtils.degreesToRadians = MathUtils.PI / 180;
MathUtils.degRad = MathUtils.degreesToRadians;
var Interpolation = class {
  apply(start, end, a) {
    return start + (end - start) * this.applyInternal(a);
  }
};
var Pow = class extends Interpolation {
  constructor(power) {
    super();
    this.power = 2;
    this.power = power;
  }
  applyInternal(a) {
    if (a <= 0.5)
      return Math.pow(a * 2, this.power) / 2;
    return Math.pow((a - 1) * 2, this.power) / (this.power % 2 == 0 ? -2 : 2) + 1;
  }
};
var PowOut = class extends Pow {
  constructor(power) {
    super(power);
  }
  applyInternal(a) {
    return Math.pow(a - 1, this.power) * (this.power % 2 == 0 ? -1 : 1) + 1;
  }
};
var Utils = class _Utils {
  static arrayCopy(source, sourceStart, dest, destStart, numElements) {
    for (let i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
      dest[j] = source[i];
    }
  }
  static arrayFill(array, fromIndex, toIndex, value) {
    for (let i = fromIndex; i < toIndex; i++)
      array[i] = value;
  }
  static setArraySize(array, size, value = 0) {
    let oldSize = array.length;
    if (oldSize == size)
      return array;
    array.length = size;
    if (oldSize < size) {
      for (let i = oldSize; i < size; i++)
        array[i] = value;
    }
    return array;
  }
  static ensureArrayCapacity(array, size, value = 0) {
    if (array.length >= size)
      return array;
    return _Utils.setArraySize(array, size, value);
  }
  static newArray(size, defaultValue) {
    let array = new Array(size);
    for (let i = 0; i < size; i++)
      array[i] = defaultValue;
    return array;
  }
  static newFloatArray(size) {
    if (_Utils.SUPPORTS_TYPED_ARRAYS)
      return new Float32Array(size);
    else {
      let array = new Array(size);
      for (let i = 0; i < array.length; i++)
        array[i] = 0;
      return array;
    }
  }
  static newShortArray(size) {
    if (_Utils.SUPPORTS_TYPED_ARRAYS)
      return new Int16Array(size);
    else {
      let array = new Array(size);
      for (let i = 0; i < array.length; i++)
        array[i] = 0;
      return array;
    }
  }
  static toFloatArray(array) {
    return _Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
  }
  static toSinglePrecision(value) {
    return _Utils.SUPPORTS_TYPED_ARRAYS ? Math.fround(value) : value;
  }
  // This function is used to fix WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
  static webkit602BugfixHelper(alpha, blend) {
  }
  static contains(array, element, identity = true) {
    for (var i = 0; i < array.length; i++)
      if (array[i] == element)
        return true;
    return false;
  }
  static enumValue(type, name) {
    return type[name[0].toUpperCase() + name.slice(1)];
  }
};
Utils.SUPPORTS_TYPED_ARRAYS = typeof Float32Array !== "undefined";
var Vector2 = class {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  length() {
    let x = this.x;
    let y = this.y;
    return Math.sqrt(x * x + y * y);
  }
  normalize() {
    let len = this.length();
    if (len != 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/Attachment.js
var Attachment = class {
  constructor(name) {
    if (!name)
      throw new Error("name cannot be null.");
    this.name = name;
  }
};
var VertexAttachment = class _VertexAttachment extends Attachment {
  constructor(name) {
    super(name);
    this.id = _VertexAttachment.nextID++;
    this.bones = null;
    this.vertices = null;
    this.worldVerticesLength = 0;
    this.deformAttachment = this;
  }
  /** Transforms the attachment's local {@link #vertices} to world coordinates. If the slot's {@link Slot#deform} is
   * not empty, it is used to deform the vertices.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide.
   * @param start The index of the first {@link #vertices} value to transform. Each vertex has 2 values, x and y.
   * @param count The number of world vertex values to output. Must be <= {@link #worldVerticesLength} - `start`.
   * @param worldVertices The output world vertices. Must have a length >= `offset` + `count` *
   *           `stride` / 2.
   * @param offset The `worldVertices` index to begin writing values.
   * @param stride The number of `worldVertices` entries between the value pairs written. */
  computeWorldVertices(slot, start, count, worldVertices, offset, stride) {
    count = offset + (count >> 1) * stride;
    let skeleton = slot.bone.skeleton;
    let deformArray = slot.deform;
    let vertices = this.vertices;
    let bones = this.bones;
    if (!bones) {
      if (deformArray.length > 0)
        vertices = deformArray;
      let bone = slot.bone;
      let x = bone.worldX;
      let y = bone.worldY;
      let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
      for (let v2 = start, w = offset; w < count; v2 += 2, w += stride) {
        let vx = vertices[v2], vy = vertices[v2 + 1];
        worldVertices[w] = vx * a + vy * b + x;
        worldVertices[w + 1] = vx * c + vy * d + y;
      }
      return;
    }
    let v = 0, skip = 0;
    for (let i = 0; i < start; i += 2) {
      let n = bones[v];
      v += n + 1;
      skip += n;
    }
    let skeletonBones = skeleton.bones;
    if (deformArray.length == 0) {
      for (let w = offset, b = skip * 3; w < count; w += stride) {
        let wx = 0, wy = 0;
        let n = bones[v++];
        n += v;
        for (; v < n; v++, b += 3) {
          let bone = skeletonBones[bones[v]];
          let vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
          wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
          wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    } else {
      let deform = deformArray;
      for (let w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
        let wx = 0, wy = 0;
        let n = bones[v++];
        n += v;
        for (; v < n; v++, b += 3, f += 2) {
          let bone = skeletonBones[bones[v]];
          let vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
          wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
          wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
        }
        worldVertices[w] = wx;
        worldVertices[w + 1] = wy;
      }
    }
  }
  /** Does not copy id (generated) or name (set on construction). **/
  copyTo(attachment) {
    if (this.bones) {
      attachment.bones = new Array(this.bones.length);
      Utils.arrayCopy(this.bones, 0, attachment.bones, 0, this.bones.length);
    } else
      attachment.bones = null;
    if (this.vertices) {
      attachment.vertices = Utils.newFloatArray(this.vertices.length);
      Utils.arrayCopy(this.vertices, 0, attachment.vertices, 0, this.vertices.length);
    } else
      attachment.vertices = null;
    attachment.worldVerticesLength = this.worldVerticesLength;
    attachment.deformAttachment = this.deformAttachment;
  }
};
VertexAttachment.nextID = 0;

// node_modules/@esotericsoftware/spine-core/dist/Animation.js
var Animation = class {
  constructor(name, timelines, duration) {
    this.timelines = null;
    this.timelineIds = null;
    if (!name)
      throw new Error("name cannot be null.");
    this.name = name;
    this.setTimelines(timelines);
    this.duration = duration;
  }
  setTimelines(timelines) {
    if (!timelines)
      throw new Error("timelines cannot be null.");
    this.timelines = timelines;
    this.timelineIds = new StringSet();
    for (var i = 0; i < timelines.length; i++)
      this.timelineIds.addAll(timelines[i].getPropertyIds());
  }
  hasTimeline(ids) {
    for (let i = 0; i < ids.length; i++)
      if (this.timelineIds.contains(ids[i]))
        return true;
    return false;
  }
  /** Applies all the animation's timelines to the specified skeleton.
   *
   * See Timeline {@link Timeline#apply(Skeleton, float, float, Array, float, MixBlend, MixDirection)}.
   * @param loop If true, the animation repeats after {@link #getDuration()}.
   * @param events May be null to ignore fired events. */
  apply(skeleton, lastTime, time, loop, events, alpha, blend, direction) {
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    if (loop && this.duration != 0) {
      time %= this.duration;
      if (lastTime > 0)
        lastTime %= this.duration;
    }
    let timelines = this.timelines;
    for (let i = 0, n = timelines.length; i < n; i++)
      timelines[i].apply(skeleton, lastTime, time, events, alpha, blend, direction);
  }
};
var MixBlend;
(function(MixBlend2) {
  MixBlend2[MixBlend2["setup"] = 0] = "setup";
  MixBlend2[MixBlend2["first"] = 1] = "first";
  MixBlend2[MixBlend2["replace"] = 2] = "replace";
  MixBlend2[MixBlend2["add"] = 3] = "add";
})(MixBlend || (MixBlend = {}));
var MixDirection;
(function(MixDirection2) {
  MixDirection2[MixDirection2["mixIn"] = 0] = "mixIn";
  MixDirection2[MixDirection2["mixOut"] = 1] = "mixOut";
})(MixDirection || (MixDirection = {}));
var Property = {
  rotate: 0,
  x: 1,
  y: 2,
  scaleX: 3,
  scaleY: 4,
  shearX: 5,
  shearY: 6,
  rgb: 7,
  alpha: 8,
  rgb2: 9,
  attachment: 10,
  deform: 11,
  event: 12,
  drawOrder: 13,
  ikConstraint: 14,
  transformConstraint: 15,
  pathConstraintPosition: 16,
  pathConstraintSpacing: 17,
  pathConstraintMix: 18
};
var Timeline = class {
  constructor(frameCount, propertyIds) {
    this.propertyIds = null;
    this.frames = null;
    this.propertyIds = propertyIds;
    this.frames = Utils.newFloatArray(frameCount * this.getFrameEntries());
  }
  getPropertyIds() {
    return this.propertyIds;
  }
  getFrameEntries() {
    return 1;
  }
  getFrameCount() {
    return this.frames.length / this.getFrameEntries();
  }
  getDuration() {
    return this.frames[this.frames.length - this.getFrameEntries()];
  }
  static search1(frames, time) {
    let n = frames.length;
    for (let i = 1; i < n; i++)
      if (frames[i] > time)
        return i - 1;
    return n - 1;
  }
  static search(frames, time, step) {
    let n = frames.length;
    for (let i = step; i < n; i += step)
      if (frames[i] > time)
        return i - step;
    return n - step;
  }
};
var CurveTimeline = class extends Timeline {
  constructor(frameCount, bezierCount, propertyIds) {
    super(frameCount, propertyIds);
    this.curves = null;
    this.curves = Utils.newFloatArray(
      frameCount + bezierCount * 18
      /*BEZIER_SIZE*/
    );
    this.curves[frameCount - 1] = 1;
  }
  /** Sets the specified key frame to linear interpolation. */
  setLinear(frame) {
    this.curves[frame] = 0;
  }
  /** Sets the specified key frame to stepped interpolation. */
  setStepped(frame) {
    this.curves[frame] = 1;
  }
  /** Shrinks the storage for Bezier curves, for use when <code>bezierCount</code> (specified in the constructor) was larger
   * than the actual number of Bezier curves. */
  shrink(bezierCount) {
    let size = this.getFrameCount() + bezierCount * 18;
    if (this.curves.length > size) {
      let newCurves = Utils.newFloatArray(size);
      Utils.arrayCopy(this.curves, 0, newCurves, 0, size);
      this.curves = newCurves;
    }
  }
  /** Stores the segments for the specified Bezier curve. For timelines that modify multiple values, there may be more than
   * one curve per frame.
   * @param bezier The ordinal of this Bezier curve for this timeline, between 0 and <code>bezierCount - 1</code> (specified
   *           in the constructor), inclusive.
   * @param frame Between 0 and <code>frameCount - 1</code>, inclusive.
   * @param value The index of the value for this frame that this curve is used for.
   * @param time1 The time for the first key.
   * @param value1 The value for the first key.
   * @param cx1 The time for the first Bezier handle.
   * @param cy1 The value for the first Bezier handle.
   * @param cx2 The time of the second Bezier handle.
   * @param cy2 The value for the second Bezier handle.
   * @param time2 The time for the second key.
   * @param value2 The value for the second key. */
  setBezier(bezier, frame, value, time1, value1, cx1, cy1, cx2, cy2, time2, value2) {
    let curves = this.curves;
    let i = this.getFrameCount() + bezier * 18;
    if (value == 0)
      curves[frame] = 2 + i;
    let tmpx = (time1 - cx1 * 2 + cx2) * 0.03, tmpy = (value1 - cy1 * 2 + cy2) * 0.03;
    let dddx = ((cx1 - cx2) * 3 - time1 + time2) * 6e-3, dddy = ((cy1 - cy2) * 3 - value1 + value2) * 6e-3;
    let ddx = tmpx * 2 + dddx, ddy = tmpy * 2 + dddy;
    let dx = (cx1 - time1) * 0.3 + tmpx + dddx * 0.16666667, dy = (cy1 - value1) * 0.3 + tmpy + dddy * 0.16666667;
    let x = time1 + dx, y = value1 + dy;
    for (let n = i + 18; i < n; i += 2) {
      curves[i] = x;
      curves[i + 1] = y;
      dx += ddx;
      dy += ddy;
      ddx += dddx;
      ddy += dddy;
      x += dx;
      y += dy;
    }
  }
  /** Returns the Bezier interpolated value for the specified time.
   * @param frameIndex The index into {@link #getFrames()} for the values of the frame before <code>time</code>.
   * @param valueOffset The offset from <code>frameIndex</code> to the value this curve is used for.
   * @param i The index of the Bezier segments. See {@link #getCurveType(int)}. */
  getBezierValue(time, frameIndex, valueOffset, i) {
    let curves = this.curves;
    if (curves[i] > time) {
      let x2 = this.frames[frameIndex], y2 = this.frames[frameIndex + valueOffset];
      return y2 + (time - x2) / (curves[i] - x2) * (curves[i + 1] - y2);
    }
    let n = i + 18;
    for (i += 2; i < n; i += 2) {
      if (curves[i] >= time) {
        let x2 = curves[i - 2], y2 = curves[i - 1];
        return y2 + (time - x2) / (curves[i] - x2) * (curves[i + 1] - y2);
      }
    }
    frameIndex += this.getFrameEntries();
    let x = curves[n - 2], y = curves[n - 1];
    return y + (time - x) / (this.frames[frameIndex] - x) * (this.frames[frameIndex + valueOffset] - y);
  }
};
var CurveTimeline1 = class extends CurveTimeline {
  constructor(frameCount, bezierCount, propertyId) {
    super(frameCount, bezierCount, [propertyId]);
  }
  getFrameEntries() {
    return 2;
  }
  /** Sets the time and value for the specified frame.
   * @param frame Between 0 and <code>frameCount</code>, inclusive.
   * @param time The frame time in seconds. */
  setFrame(frame, time, value) {
    frame <<= 1;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*VALUE*/
    ] = value;
  }
  /** Returns the interpolated value for the specified time. */
  getCurveValue(time) {
    let frames = this.frames;
    let i = frames.length - 2;
    for (let ii = 2; ii <= i; ii += 2) {
      if (frames[ii] > time) {
        i = ii - 2;
        break;
      }
    }
    let curveType = this.curves[i >> 1];
    switch (curveType) {
      case 0:
        let before = frames[i], value = frames[
          i + 1
          /*VALUE*/
        ];
        return value + (time - before) / (frames[
          i + 2
          /*ENTRIES*/
        ] - before) * (frames[
          i + 2 + 1
          /*VALUE*/
        ] - value);
      case 1:
        return frames[
          i + 1
          /*VALUE*/
        ];
    }
    return this.getBezierValue(
      time,
      i,
      1,
      curveType - 2
      /*BEZIER*/
    );
  }
};
var CurveTimeline2 = class extends CurveTimeline {
  /** @param bezierCount The maximum number of Bezier curves. See {@link #shrink(int)}.
   * @param propertyIds Unique identifiers for the properties the timeline modifies. */
  constructor(frameCount, bezierCount, propertyId1, propertyId2) {
    super(frameCount, bezierCount, [propertyId1, propertyId2]);
  }
  getFrameEntries() {
    return 3;
  }
  /** Sets the time and values for the specified frame.
   * @param frame Between 0 and <code>frameCount</code>, inclusive.
   * @param time The frame time in seconds. */
  setFrame(frame, time, value1, value2) {
    frame *= 3;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*VALUE1*/
    ] = value1;
    this.frames[
      frame + 2
      /*VALUE2*/
    ] = value2;
  }
};
var RotateTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.rotate + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.rotation = bone.data.rotation;
          return;
        case MixBlend.first:
          bone.rotation += (bone.data.rotation - bone.rotation) * alpha;
      }
      return;
    }
    let r = this.getCurveValue(time);
    switch (blend) {
      case MixBlend.setup:
        bone.rotation = bone.data.rotation + r * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        r += bone.data.rotation - bone.rotation;
      case MixBlend.add:
        bone.rotation += r * alpha;
    }
  }
};
var TranslateTimeline = class extends CurveTimeline2 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.x + "|" + boneIndex, Property.y + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.x = bone.data.x;
          bone.y = bone.data.y;
          return;
        case MixBlend.first:
          bone.x += (bone.data.x - bone.x) * alpha;
          bone.y += (bone.data.y - bone.y) * alpha;
      }
      return;
    }
    let x = 0, y = 0;
    let i = Timeline.search(
      frames,
      time,
      3
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 3
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        let t = (time - before) / (frames[
          i + 3
          /*ENTRIES*/
        ] - before);
        x += (frames[
          i + 3 + 1
          /*VALUE1*/
        ] - x) * t;
        y += (frames[
          i + 3 + 2
          /*VALUE2*/
        ] - y) * t;
        break;
      case 1:
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        break;
      default:
        x = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        y = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
    }
    switch (blend) {
      case MixBlend.setup:
        bone.x = bone.data.x + x * alpha;
        bone.y = bone.data.y + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.x += (bone.data.x + x - bone.x) * alpha;
        bone.y += (bone.data.y + y - bone.y) * alpha;
        break;
      case MixBlend.add:
        bone.x += x * alpha;
        bone.y += y * alpha;
    }
  }
};
var TranslateXTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.x + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.x = bone.data.x;
          return;
        case MixBlend.first:
          bone.x += (bone.data.x - bone.x) * alpha;
      }
      return;
    }
    let x = this.getCurveValue(time);
    switch (blend) {
      case MixBlend.setup:
        bone.x = bone.data.x + x * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.x += (bone.data.x + x - bone.x) * alpha;
        break;
      case MixBlend.add:
        bone.x += x * alpha;
    }
  }
};
var TranslateYTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.y + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.y = bone.data.y;
          return;
        case MixBlend.first:
          bone.y += (bone.data.y - bone.y) * alpha;
      }
      return;
    }
    let y = this.getCurveValue(time);
    switch (blend) {
      case MixBlend.setup:
        bone.y = bone.data.y + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.y += (bone.data.y + y - bone.y) * alpha;
        break;
      case MixBlend.add:
        bone.y += y * alpha;
    }
  }
};
var ScaleTimeline = class extends CurveTimeline2 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.scaleX + "|" + boneIndex, Property.scaleY + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.scaleX = bone.data.scaleX;
          bone.scaleY = bone.data.scaleY;
          return;
        case MixBlend.first:
          bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
          bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
      }
      return;
    }
    let x, y;
    let i = Timeline.search(
      frames,
      time,
      3
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 3
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        let t = (time - before) / (frames[
          i + 3
          /*ENTRIES*/
        ] - before);
        x += (frames[
          i + 3 + 1
          /*VALUE1*/
        ] - x) * t;
        y += (frames[
          i + 3 + 2
          /*VALUE2*/
        ] - y) * t;
        break;
      case 1:
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        break;
      default:
        x = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        y = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
    }
    x *= bone.data.scaleX;
    y *= bone.data.scaleY;
    if (alpha == 1) {
      if (blend == MixBlend.add) {
        bone.scaleX += x - bone.data.scaleX;
        bone.scaleY += y - bone.data.scaleY;
      } else {
        bone.scaleX = x;
        bone.scaleY = y;
      }
    } else {
      let bx = 0, by = 0;
      if (direction == MixDirection.mixOut) {
        switch (blend) {
          case MixBlend.setup:
            bx = bone.data.scaleX;
            by = bone.data.scaleY;
            bone.scaleX = bx + (Math.abs(x) * MathUtils.signum(bx) - bx) * alpha;
            bone.scaleY = by + (Math.abs(y) * MathUtils.signum(by) - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = bone.scaleX;
            by = bone.scaleY;
            bone.scaleX = bx + (Math.abs(x) * MathUtils.signum(bx) - bx) * alpha;
            bone.scaleY = by + (Math.abs(y) * MathUtils.signum(by) - by) * alpha;
            break;
          case MixBlend.add:
            bone.scaleX += (x - bone.data.scaleX) * alpha;
            bone.scaleY += (y - bone.data.scaleY) * alpha;
        }
      } else {
        switch (blend) {
          case MixBlend.setup:
            bx = Math.abs(bone.data.scaleX) * MathUtils.signum(x);
            by = Math.abs(bone.data.scaleY) * MathUtils.signum(y);
            bone.scaleX = bx + (x - bx) * alpha;
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = Math.abs(bone.scaleX) * MathUtils.signum(x);
            by = Math.abs(bone.scaleY) * MathUtils.signum(y);
            bone.scaleX = bx + (x - bx) * alpha;
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.add:
            bone.scaleX += (x - bone.data.scaleX) * alpha;
            bone.scaleY += (y - bone.data.scaleY) * alpha;
        }
      }
    }
  }
};
var ScaleXTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.scaleX + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.scaleX = bone.data.scaleX;
          return;
        case MixBlend.first:
          bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
      }
      return;
    }
    let x = this.getCurveValue(time) * bone.data.scaleX;
    if (alpha == 1) {
      if (blend == MixBlend.add)
        bone.scaleX += x - bone.data.scaleX;
      else
        bone.scaleX = x;
    } else {
      let bx = 0;
      if (direction == MixDirection.mixOut) {
        switch (blend) {
          case MixBlend.setup:
            bx = bone.data.scaleX;
            bone.scaleX = bx + (Math.abs(x) * MathUtils.signum(bx) - bx) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = bone.scaleX;
            bone.scaleX = bx + (Math.abs(x) * MathUtils.signum(bx) - bx) * alpha;
            break;
          case MixBlend.add:
            bone.scaleX += (x - bone.data.scaleX) * alpha;
        }
      } else {
        switch (blend) {
          case MixBlend.setup:
            bx = Math.abs(bone.data.scaleX) * MathUtils.signum(x);
            bone.scaleX = bx + (x - bx) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            bx = Math.abs(bone.scaleX) * MathUtils.signum(x);
            bone.scaleX = bx + (x - bx) * alpha;
            break;
          case MixBlend.add:
            bone.scaleX += (x - bone.data.scaleX) * alpha;
        }
      }
    }
  }
};
var ScaleYTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.scaleY + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.scaleY = bone.data.scaleY;
          return;
        case MixBlend.first:
          bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
      }
      return;
    }
    let y = this.getCurveValue(time) * bone.data.scaleY;
    if (alpha == 1) {
      if (blend == MixBlend.add)
        bone.scaleY += y - bone.data.scaleY;
      else
        bone.scaleY = y;
    } else {
      let by = 0;
      if (direction == MixDirection.mixOut) {
        switch (blend) {
          case MixBlend.setup:
            by = bone.data.scaleY;
            bone.scaleY = by + (Math.abs(y) * MathUtils.signum(by) - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            by = bone.scaleY;
            bone.scaleY = by + (Math.abs(y) * MathUtils.signum(by) - by) * alpha;
            break;
          case MixBlend.add:
            bone.scaleY += (y - bone.data.scaleY) * alpha;
        }
      } else {
        switch (blend) {
          case MixBlend.setup:
            by = Math.abs(bone.data.scaleY) * MathUtils.signum(y);
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.first:
          case MixBlend.replace:
            by = Math.abs(bone.scaleY) * MathUtils.signum(y);
            bone.scaleY = by + (y - by) * alpha;
            break;
          case MixBlend.add:
            bone.scaleY += (y - bone.data.scaleY) * alpha;
        }
      }
    }
  }
};
var ShearTimeline = class extends CurveTimeline2 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.shearX + "|" + boneIndex, Property.shearY + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.shearX = bone.data.shearX;
          bone.shearY = bone.data.shearY;
          return;
        case MixBlend.first:
          bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
          bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
      }
      return;
    }
    let x = 0, y = 0;
    let i = Timeline.search(
      frames,
      time,
      3
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 3
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        let t = (time - before) / (frames[
          i + 3
          /*ENTRIES*/
        ] - before);
        x += (frames[
          i + 3 + 1
          /*VALUE1*/
        ] - x) * t;
        y += (frames[
          i + 3 + 2
          /*VALUE2*/
        ] - y) * t;
        break;
      case 1:
        x = frames[
          i + 1
          /*VALUE1*/
        ];
        y = frames[
          i + 2
          /*VALUE2*/
        ];
        break;
      default:
        x = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        y = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
    }
    switch (blend) {
      case MixBlend.setup:
        bone.shearX = bone.data.shearX + x * alpha;
        bone.shearY = bone.data.shearY + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
        bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
        break;
      case MixBlend.add:
        bone.shearX += x * alpha;
        bone.shearY += y * alpha;
    }
  }
};
var ShearXTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.shearX + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.shearX = bone.data.shearX;
          return;
        case MixBlend.first:
          bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
      }
      return;
    }
    let x = this.getCurveValue(time);
    switch (blend) {
      case MixBlend.setup:
        bone.shearX = bone.data.shearX + x * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
        break;
      case MixBlend.add:
        bone.shearX += x * alpha;
    }
  }
};
var ShearYTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, boneIndex) {
    super(frameCount, bezierCount, Property.shearY + "|" + boneIndex);
    this.boneIndex = 0;
    this.boneIndex = boneIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let bone = skeleton.bones[this.boneIndex];
    if (!bone.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          bone.shearY = bone.data.shearY;
          return;
        case MixBlend.first:
          bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
      }
      return;
    }
    let y = this.getCurveValue(time);
    switch (blend) {
      case MixBlend.setup:
        bone.shearY = bone.data.shearY + y * alpha;
        break;
      case MixBlend.first:
      case MixBlend.replace:
        bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
        break;
      case MixBlend.add:
        bone.shearY += y * alpha;
    }
  }
};
var RGBATimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, slotIndex) {
    super(frameCount, bezierCount, [
      Property.rgb + "|" + slotIndex,
      Property.alpha + "|" + slotIndex
    ]);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
  }
  getFrameEntries() {
    return 5;
  }
  /** Sets the time in seconds, red, green, blue, and alpha for the specified key frame. */
  setFrame(frame, time, r, g, b, a) {
    frame *= 5;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*R*/
    ] = r;
    this.frames[
      frame + 2
      /*G*/
    ] = g;
    this.frames[
      frame + 3
      /*B*/
    ] = b;
    this.frames[
      frame + 4
      /*A*/
    ] = a;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let frames = this.frames;
    let color = slot.color;
    if (time < frames[0]) {
      let setup = slot.data.color;
      switch (blend) {
        case MixBlend.setup:
          color.setFromColor(setup);
          return;
        case MixBlend.first:
          color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
      }
      return;
    }
    let r = 0, g = 0, b = 0, a = 0;
    let i = Timeline.search(
      frames,
      time,
      5
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 5
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        a = frames[
          i + 4
          /*A*/
        ];
        let t = (time - before) / (frames[
          i + 5
          /*ENTRIES*/
        ] - before);
        r += (frames[
          i + 5 + 1
          /*R*/
        ] - r) * t;
        g += (frames[
          i + 5 + 2
          /*G*/
        ] - g) * t;
        b += (frames[
          i + 5 + 3
          /*B*/
        ] - b) * t;
        a += (frames[
          i + 5 + 4
          /*A*/
        ] - a) * t;
        break;
      case 1:
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        a = frames[
          i + 4
          /*A*/
        ];
        break;
      default:
        r = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        g = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        b = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
        a = this.getBezierValue(
          time,
          i,
          4,
          curveType + 18 * 3 - 2
          /*BEZIER*/
        );
    }
    if (alpha == 1)
      color.set(r, g, b, a);
    else {
      if (blend == MixBlend.setup)
        color.setFromColor(slot.data.color);
      color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
    }
  }
};
var RGBTimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, slotIndex) {
    super(frameCount, bezierCount, [
      Property.rgb + "|" + slotIndex
    ]);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
  }
  getFrameEntries() {
    return 4;
  }
  /** Sets the time in seconds, red, green, blue, and alpha for the specified key frame. */
  setFrame(frame, time, r, g, b) {
    frame <<= 2;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*R*/
    ] = r;
    this.frames[
      frame + 2
      /*G*/
    ] = g;
    this.frames[
      frame + 3
      /*B*/
    ] = b;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let frames = this.frames;
    let color = slot.color;
    if (time < frames[0]) {
      let setup = slot.data.color;
      switch (blend) {
        case MixBlend.setup:
          color.r = setup.r;
          color.g = setup.g;
          color.b = setup.b;
          return;
        case MixBlend.first:
          color.r += (setup.r - color.r) * alpha;
          color.g += (setup.g - color.g) * alpha;
          color.b += (setup.b - color.b) * alpha;
      }
      return;
    }
    let r = 0, g = 0, b = 0;
    let i = Timeline.search(
      frames,
      time,
      4
      /*ENTRIES*/
    );
    let curveType = this.curves[i >> 2];
    switch (curveType) {
      case 0:
        let before = frames[i];
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        let t = (time - before) / (frames[
          i + 4
          /*ENTRIES*/
        ] - before);
        r += (frames[
          i + 4 + 1
          /*R*/
        ] - r) * t;
        g += (frames[
          i + 4 + 2
          /*G*/
        ] - g) * t;
        b += (frames[
          i + 4 + 3
          /*B*/
        ] - b) * t;
        break;
      case 1:
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        break;
      default:
        r = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        g = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        b = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
    }
    if (alpha == 1) {
      color.r = r;
      color.g = g;
      color.b = b;
    } else {
      if (blend == MixBlend.setup) {
        let setup = slot.data.color;
        color.r = setup.r;
        color.g = setup.g;
        color.b = setup.b;
      }
      color.r += (r - color.r) * alpha;
      color.g += (g - color.g) * alpha;
      color.b += (b - color.b) * alpha;
    }
  }
};
var AlphaTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, slotIndex) {
    super(frameCount, bezierCount, Property.alpha + "|" + slotIndex);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let color = slot.color;
    if (time < this.frames[0]) {
      let setup = slot.data.color;
      switch (blend) {
        case MixBlend.setup:
          color.a = setup.a;
          return;
        case MixBlend.first:
          color.a += (setup.a - color.a) * alpha;
      }
      return;
    }
    let a = this.getCurveValue(time);
    if (alpha == 1)
      color.a = a;
    else {
      if (blend == MixBlend.setup)
        color.a = slot.data.color.a;
      color.a += (a - color.a) * alpha;
    }
  }
};
var RGBA2Timeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, slotIndex) {
    super(frameCount, bezierCount, [
      Property.rgb + "|" + slotIndex,
      Property.alpha + "|" + slotIndex,
      Property.rgb2 + "|" + slotIndex
    ]);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
  }
  getFrameEntries() {
    return 8;
  }
  /** Sets the time in seconds, light, and dark colors for the specified key frame. */
  setFrame(frame, time, r, g, b, a, r2, g2, b2) {
    frame <<= 3;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*R*/
    ] = r;
    this.frames[
      frame + 2
      /*G*/
    ] = g;
    this.frames[
      frame + 3
      /*B*/
    ] = b;
    this.frames[
      frame + 4
      /*A*/
    ] = a;
    this.frames[
      frame + 5
      /*R2*/
    ] = r2;
    this.frames[
      frame + 6
      /*G2*/
    ] = g2;
    this.frames[
      frame + 7
      /*B2*/
    ] = b2;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let frames = this.frames;
    let light = slot.color, dark = slot.darkColor;
    if (time < frames[0]) {
      let setupLight = slot.data.color, setupDark = slot.data.darkColor;
      switch (blend) {
        case MixBlend.setup:
          light.setFromColor(setupLight);
          dark.r = setupDark.r;
          dark.g = setupDark.g;
          dark.b = setupDark.b;
          return;
        case MixBlend.first:
          light.add((setupLight.r - light.r) * alpha, (setupLight.g - light.g) * alpha, (setupLight.b - light.b) * alpha, (setupLight.a - light.a) * alpha);
          dark.r += (setupDark.r - dark.r) * alpha;
          dark.g += (setupDark.g - dark.g) * alpha;
          dark.b += (setupDark.b - dark.b) * alpha;
      }
      return;
    }
    let r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
    let i = Timeline.search(
      frames,
      time,
      8
      /*ENTRIES*/
    );
    let curveType = this.curves[i >> 3];
    switch (curveType) {
      case 0:
        let before = frames[i];
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        a = frames[
          i + 4
          /*A*/
        ];
        r2 = frames[
          i + 5
          /*R2*/
        ];
        g2 = frames[
          i + 6
          /*G2*/
        ];
        b2 = frames[
          i + 7
          /*B2*/
        ];
        let t = (time - before) / (frames[
          i + 8
          /*ENTRIES*/
        ] - before);
        r += (frames[
          i + 8 + 1
          /*R*/
        ] - r) * t;
        g += (frames[
          i + 8 + 2
          /*G*/
        ] - g) * t;
        b += (frames[
          i + 8 + 3
          /*B*/
        ] - b) * t;
        a += (frames[
          i + 8 + 4
          /*A*/
        ] - a) * t;
        r2 += (frames[
          i + 8 + 5
          /*R2*/
        ] - r2) * t;
        g2 += (frames[
          i + 8 + 6
          /*G2*/
        ] - g2) * t;
        b2 += (frames[
          i + 8 + 7
          /*B2*/
        ] - b2) * t;
        break;
      case 1:
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        a = frames[
          i + 4
          /*A*/
        ];
        r2 = frames[
          i + 5
          /*R2*/
        ];
        g2 = frames[
          i + 6
          /*G2*/
        ];
        b2 = frames[
          i + 7
          /*B2*/
        ];
        break;
      default:
        r = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        g = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        b = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
        a = this.getBezierValue(
          time,
          i,
          4,
          curveType + 18 * 3 - 2
          /*BEZIER*/
        );
        r2 = this.getBezierValue(
          time,
          i,
          5,
          curveType + 18 * 4 - 2
          /*BEZIER*/
        );
        g2 = this.getBezierValue(
          time,
          i,
          6,
          curveType + 18 * 5 - 2
          /*BEZIER*/
        );
        b2 = this.getBezierValue(
          time,
          i,
          7,
          curveType + 18 * 6 - 2
          /*BEZIER*/
        );
    }
    if (alpha == 1) {
      light.set(r, g, b, a);
      dark.r = r2;
      dark.g = g2;
      dark.b = b2;
    } else {
      if (blend == MixBlend.setup) {
        light.setFromColor(slot.data.color);
        let setupDark = slot.data.darkColor;
        dark.r = setupDark.r;
        dark.g = setupDark.g;
        dark.b = setupDark.b;
      }
      light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
      dark.r += (r2 - dark.r) * alpha;
      dark.g += (g2 - dark.g) * alpha;
      dark.b += (b2 - dark.b) * alpha;
    }
  }
};
var RGB2Timeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, slotIndex) {
    super(frameCount, bezierCount, [
      Property.rgb + "|" + slotIndex,
      Property.rgb2 + "|" + slotIndex
    ]);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
  }
  getFrameEntries() {
    return 7;
  }
  /** Sets the time in seconds, light, and dark colors for the specified key frame. */
  setFrame(frame, time, r, g, b, r2, g2, b2) {
    frame *= 7;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*R*/
    ] = r;
    this.frames[
      frame + 2
      /*G*/
    ] = g;
    this.frames[
      frame + 3
      /*B*/
    ] = b;
    this.frames[
      frame + 4
      /*R2*/
    ] = r2;
    this.frames[
      frame + 5
      /*G2*/
    ] = g2;
    this.frames[
      frame + 6
      /*B2*/
    ] = b2;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let frames = this.frames;
    let light = slot.color, dark = slot.darkColor;
    if (time < frames[0]) {
      let setupLight = slot.data.color, setupDark = slot.data.darkColor;
      switch (blend) {
        case MixBlend.setup:
          light.r = setupLight.r;
          light.g = setupLight.g;
          light.b = setupLight.b;
          dark.r = setupDark.r;
          dark.g = setupDark.g;
          dark.b = setupDark.b;
          return;
        case MixBlend.first:
          light.r += (setupLight.r - light.r) * alpha;
          light.g += (setupLight.g - light.g) * alpha;
          light.b += (setupLight.b - light.b) * alpha;
          dark.r += (setupDark.r - dark.r) * alpha;
          dark.g += (setupDark.g - dark.g) * alpha;
          dark.b += (setupDark.b - dark.b) * alpha;
      }
      return;
    }
    let r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
    let i = Timeline.search(
      frames,
      time,
      7
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 7
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        r2 = frames[
          i + 4
          /*R2*/
        ];
        g2 = frames[
          i + 5
          /*G2*/
        ];
        b2 = frames[
          i + 6
          /*B2*/
        ];
        let t = (time - before) / (frames[
          i + 7
          /*ENTRIES*/
        ] - before);
        r += (frames[
          i + 7 + 1
          /*R*/
        ] - r) * t;
        g += (frames[
          i + 7 + 2
          /*G*/
        ] - g) * t;
        b += (frames[
          i + 7 + 3
          /*B*/
        ] - b) * t;
        r2 += (frames[
          i + 7 + 4
          /*R2*/
        ] - r2) * t;
        g2 += (frames[
          i + 7 + 5
          /*G2*/
        ] - g2) * t;
        b2 += (frames[
          i + 7 + 6
          /*B2*/
        ] - b2) * t;
        break;
      case 1:
        r = frames[
          i + 1
          /*R*/
        ];
        g = frames[
          i + 2
          /*G*/
        ];
        b = frames[
          i + 3
          /*B*/
        ];
        r2 = frames[
          i + 4
          /*R2*/
        ];
        g2 = frames[
          i + 5
          /*G2*/
        ];
        b2 = frames[
          i + 6
          /*B2*/
        ];
        break;
      default:
        r = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        g = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        b = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
        r2 = this.getBezierValue(
          time,
          i,
          4,
          curveType + 18 * 3 - 2
          /*BEZIER*/
        );
        g2 = this.getBezierValue(
          time,
          i,
          5,
          curveType + 18 * 4 - 2
          /*BEZIER*/
        );
        b2 = this.getBezierValue(
          time,
          i,
          6,
          curveType + 18 * 5 - 2
          /*BEZIER*/
        );
    }
    if (alpha == 1) {
      light.r = r;
      light.g = g;
      light.b = b;
      dark.r = r2;
      dark.g = g2;
      dark.b = b2;
    } else {
      if (blend == MixBlend.setup) {
        let setupLight = slot.data.color, setupDark = slot.data.darkColor;
        light.r = setupLight.r;
        light.g = setupLight.g;
        light.b = setupLight.b;
        dark.r = setupDark.r;
        dark.g = setupDark.g;
        dark.b = setupDark.b;
      }
      light.r += (r - light.r) * alpha;
      light.g += (g - light.g) * alpha;
      light.b += (b - light.b) * alpha;
      dark.r += (r2 - dark.r) * alpha;
      dark.g += (g2 - dark.g) * alpha;
      dark.b += (b2 - dark.b) * alpha;
    }
  }
};
var AttachmentTimeline = class extends Timeline {
  constructor(frameCount, slotIndex) {
    super(frameCount, [
      Property.attachment + "|" + slotIndex
    ]);
    this.slotIndex = 0;
    this.slotIndex = slotIndex;
    this.attachmentNames = new Array(frameCount);
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time in seconds and the attachment name for the specified key frame. */
  setFrame(frame, time, attachmentName) {
    this.frames[frame] = time;
    this.attachmentNames[frame] = attachmentName;
  }
  apply(skeleton, lastTime, time, events, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    if (direction == MixDirection.mixOut) {
      if (blend == MixBlend.setup)
        this.setAttachment(skeleton, slot, slot.data.attachmentName);
      return;
    }
    if (time < this.frames[0]) {
      if (blend == MixBlend.setup || blend == MixBlend.first)
        this.setAttachment(skeleton, slot, slot.data.attachmentName);
      return;
    }
    this.setAttachment(skeleton, slot, this.attachmentNames[Timeline.search1(this.frames, time)]);
  }
  setAttachment(skeleton, slot, attachmentName) {
    slot.setAttachment(!attachmentName ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
  }
};
var DeformTimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, slotIndex, attachment) {
    super(frameCount, bezierCount, [
      Property.deform + "|" + slotIndex + "|" + attachment.id
    ]);
    this.slotIndex = 0;
    this.attachment = null;
    this.vertices = null;
    this.slotIndex = slotIndex;
    this.attachment = attachment;
    this.vertices = new Array(frameCount);
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time in seconds and the vertices for the specified key frame.
   * @param vertices Vertex positions for an unweighted VertexAttachment, or deform offsets if it has weights. */
  setFrame(frame, time, vertices) {
    this.frames[frame] = time;
    this.vertices[frame] = vertices;
  }
  /** @param value1 Ignored (0 is used for a deform timeline).
   * @param value2 Ignored (1 is used for a deform timeline). */
  setBezier(bezier, frame, value, time1, value1, cx1, cy1, cx2, cy2, time2, value2) {
    let curves = this.curves;
    let i = this.getFrameCount() + bezier * 18;
    if (value == 0)
      curves[frame] = 2 + i;
    let tmpx = (time1 - cx1 * 2 + cx2) * 0.03, tmpy = cy2 * 0.03 - cy1 * 0.06;
    let dddx = ((cx1 - cx2) * 3 - time1 + time2) * 6e-3, dddy = (cy1 - cy2 + 0.33333333) * 0.018;
    let ddx = tmpx * 2 + dddx, ddy = tmpy * 2 + dddy;
    let dx = (cx1 - time1) * 0.3 + tmpx + dddx * 0.16666667, dy = cy1 * 0.3 + tmpy + dddy * 0.16666667;
    let x = time1 + dx, y = dy;
    for (let n = i + 18; i < n; i += 2) {
      curves[i] = x;
      curves[i + 1] = y;
      dx += ddx;
      dy += ddy;
      ddx += dddx;
      ddy += dddy;
      x += dx;
      y += dy;
    }
  }
  getCurvePercent(time, frame) {
    let curves = this.curves;
    let i = curves[frame];
    switch (i) {
      case 0:
        let x2 = this.frames[frame];
        return (time - x2) / (this.frames[frame + this.getFrameEntries()] - x2);
      case 1:
        return 0;
    }
    i -= 2;
    if (curves[i] > time) {
      let x2 = this.frames[frame];
      return curves[i + 1] * (time - x2) / (curves[i] - x2);
    }
    let n = i + 18;
    for (i += 2; i < n; i += 2) {
      if (curves[i] >= time) {
        let x2 = curves[i - 2], y2 = curves[i - 1];
        return y2 + (time - x2) / (curves[i] - x2) * (curves[i + 1] - y2);
      }
    }
    let x = curves[n - 2], y = curves[n - 1];
    return y + (1 - y) * (time - x) / (this.frames[frame + this.getFrameEntries()] - x);
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let slot = skeleton.slots[this.slotIndex];
    if (!slot.bone.active)
      return;
    let slotAttachment = slot.getAttachment();
    if (!(slotAttachment instanceof VertexAttachment) || slotAttachment.deformAttachment != this.attachment)
      return;
    let deform = slot.deform;
    if (deform.length == 0)
      blend = MixBlend.setup;
    let vertices = this.vertices;
    let vertexCount = vertices[0].length;
    let frames = this.frames;
    if (time < frames[0]) {
      let vertexAttachment = slotAttachment;
      switch (blend) {
        case MixBlend.setup:
          deform.length = 0;
          return;
        case MixBlend.first:
          if (alpha == 1) {
            deform.length = 0;
            return;
          }
          deform.length = vertexCount;
          if (!vertexAttachment.bones) {
            let setupVertices = vertexAttachment.vertices;
            for (var i = 0; i < vertexCount; i++)
              deform[i] += (setupVertices[i] - deform[i]) * alpha;
          } else {
            alpha = 1 - alpha;
            for (var i = 0; i < vertexCount; i++)
              deform[i] *= alpha;
          }
      }
      return;
    }
    deform.length = vertexCount;
    if (time >= frames[frames.length - 1]) {
      let lastVertices = vertices[frames.length - 1];
      if (alpha == 1) {
        if (blend == MixBlend.add) {
          let vertexAttachment = slotAttachment;
          if (!vertexAttachment.bones) {
            let setupVertices = vertexAttachment.vertices;
            for (let i2 = 0; i2 < vertexCount; i2++)
              deform[i2] += lastVertices[i2] - setupVertices[i2];
          } else {
            for (let i2 = 0; i2 < vertexCount; i2++)
              deform[i2] += lastVertices[i2];
          }
        } else
          Utils.arrayCopy(lastVertices, 0, deform, 0, vertexCount);
      } else {
        switch (blend) {
          case MixBlend.setup: {
            let vertexAttachment2 = slotAttachment;
            if (!vertexAttachment2.bones) {
              let setupVertices = vertexAttachment2.vertices;
              for (let i2 = 0; i2 < vertexCount; i2++) {
                let setup = setupVertices[i2];
                deform[i2] = setup + (lastVertices[i2] - setup) * alpha;
              }
            } else {
              for (let i2 = 0; i2 < vertexCount; i2++)
                deform[i2] = lastVertices[i2] * alpha;
            }
            break;
          }
          case MixBlend.first:
          case MixBlend.replace:
            for (let i2 = 0; i2 < vertexCount; i2++)
              deform[i2] += (lastVertices[i2] - deform[i2]) * alpha;
            break;
          case MixBlend.add:
            let vertexAttachment = slotAttachment;
            if (!vertexAttachment.bones) {
              let setupVertices = vertexAttachment.vertices;
              for (let i2 = 0; i2 < vertexCount; i2++)
                deform[i2] += (lastVertices[i2] - setupVertices[i2]) * alpha;
            } else {
              for (let i2 = 0; i2 < vertexCount; i2++)
                deform[i2] += lastVertices[i2] * alpha;
            }
        }
      }
      return;
    }
    let frame = Timeline.search1(frames, time);
    let percent = this.getCurvePercent(time, frame);
    let prevVertices = vertices[frame];
    let nextVertices = vertices[frame + 1];
    if (alpha == 1) {
      if (blend == MixBlend.add) {
        let vertexAttachment = slotAttachment;
        if (!vertexAttachment.bones) {
          let setupVertices = vertexAttachment.vertices;
          for (let i2 = 0; i2 < vertexCount; i2++) {
            let prev = prevVertices[i2];
            deform[i2] += prev + (nextVertices[i2] - prev) * percent - setupVertices[i2];
          }
        } else {
          for (let i2 = 0; i2 < vertexCount; i2++) {
            let prev = prevVertices[i2];
            deform[i2] += prev + (nextVertices[i2] - prev) * percent;
          }
        }
      } else {
        for (let i2 = 0; i2 < vertexCount; i2++) {
          let prev = prevVertices[i2];
          deform[i2] = prev + (nextVertices[i2] - prev) * percent;
        }
      }
    } else {
      switch (blend) {
        case MixBlend.setup: {
          let vertexAttachment2 = slotAttachment;
          if (!vertexAttachment2.bones) {
            let setupVertices = vertexAttachment2.vertices;
            for (let i2 = 0; i2 < vertexCount; i2++) {
              let prev = prevVertices[i2], setup = setupVertices[i2];
              deform[i2] = setup + (prev + (nextVertices[i2] - prev) * percent - setup) * alpha;
            }
          } else {
            for (let i2 = 0; i2 < vertexCount; i2++) {
              let prev = prevVertices[i2];
              deform[i2] = (prev + (nextVertices[i2] - prev) * percent) * alpha;
            }
          }
          break;
        }
        case MixBlend.first:
        case MixBlend.replace:
          for (let i2 = 0; i2 < vertexCount; i2++) {
            let prev = prevVertices[i2];
            deform[i2] += (prev + (nextVertices[i2] - prev) * percent - deform[i2]) * alpha;
          }
          break;
        case MixBlend.add:
          let vertexAttachment = slotAttachment;
          if (!vertexAttachment.bones) {
            let setupVertices = vertexAttachment.vertices;
            for (let i2 = 0; i2 < vertexCount; i2++) {
              let prev = prevVertices[i2];
              deform[i2] += (prev + (nextVertices[i2] - prev) * percent - setupVertices[i2]) * alpha;
            }
          } else {
            for (let i2 = 0; i2 < vertexCount; i2++) {
              let prev = prevVertices[i2];
              deform[i2] += (prev + (nextVertices[i2] - prev) * percent) * alpha;
            }
          }
      }
    }
  }
};
var EventTimeline = class _EventTimeline extends Timeline {
  constructor(frameCount) {
    super(frameCount, _EventTimeline.propertyIds);
    this.events = null;
    this.events = new Array(frameCount);
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time in seconds and the event for the specified key frame. */
  setFrame(frame, event) {
    this.frames[frame] = event.time;
    this.events[frame] = event;
  }
  /** Fires events for frames > `lastTime` and <= `time`. */
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    if (!firedEvents)
      return;
    let frames = this.frames;
    let frameCount = this.frames.length;
    if (lastTime > time) {
      this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, blend, direction);
      lastTime = -1;
    } else if (lastTime >= frames[frameCount - 1])
      return;
    if (time < frames[0])
      return;
    let i = 0;
    if (lastTime < frames[0])
      i = 0;
    else {
      i = Timeline.search1(frames, lastTime) + 1;
      let frameTime = frames[i];
      while (i > 0) {
        if (frames[i - 1] != frameTime)
          break;
        i--;
      }
    }
    for (; i < frameCount && time >= frames[i]; i++)
      firedEvents.push(this.events[i]);
  }
};
EventTimeline.propertyIds = ["" + Property.event];
var DrawOrderTimeline = class _DrawOrderTimeline extends Timeline {
  constructor(frameCount) {
    super(frameCount, _DrawOrderTimeline.propertyIds);
    this.drawOrders = null;
    this.drawOrders = new Array(frameCount);
  }
  getFrameCount() {
    return this.frames.length;
  }
  /** Sets the time in seconds and the draw order for the specified key frame.
   * @param drawOrder For each slot in {@link Skeleton#slots}, the index of the new draw order. May be null to use setup pose
   *           draw order. */
  setFrame(frame, time, drawOrder) {
    this.frames[frame] = time;
    this.drawOrders[frame] = drawOrder;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    if (direction == MixDirection.mixOut) {
      if (blend == MixBlend.setup)
        Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      return;
    }
    if (time < this.frames[0]) {
      if (blend == MixBlend.setup || blend == MixBlend.first)
        Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
      return;
    }
    let drawOrderToSetupIndex = this.drawOrders[Timeline.search1(this.frames, time)];
    if (!drawOrderToSetupIndex)
      Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
    else {
      let drawOrder = skeleton.drawOrder;
      let slots = skeleton.slots;
      for (let i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
        drawOrder[i] = slots[drawOrderToSetupIndex[i]];
    }
  }
};
DrawOrderTimeline.propertyIds = ["" + Property.drawOrder];
var IkConstraintTimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, ikConstraintIndex) {
    super(frameCount, bezierCount, [
      Property.ikConstraint + "|" + ikConstraintIndex
    ]);
    this.ikConstraintIndex = 0;
    this.ikConstraintIndex = ikConstraintIndex;
  }
  getFrameEntries() {
    return 6;
  }
  /** Sets the time in seconds, mix, softness, bend direction, compress, and stretch for the specified key frame. */
  setFrame(frame, time, mix, softness, bendDirection, compress, stretch) {
    frame *= 6;
    this.frames[frame] = time;
    this.frames[
      frame + 1
      /*MIX*/
    ] = mix;
    this.frames[
      frame + 2
      /*SOFTNESS*/
    ] = softness;
    this.frames[
      frame + 3
      /*BEND_DIRECTION*/
    ] = bendDirection;
    this.frames[
      frame + 4
      /*COMPRESS*/
    ] = compress ? 1 : 0;
    this.frames[
      frame + 5
      /*STRETCH*/
    ] = stretch ? 1 : 0;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let constraint = skeleton.ikConstraints[this.ikConstraintIndex];
    if (!constraint.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.mix = constraint.data.mix;
          constraint.softness = constraint.data.softness;
          constraint.bendDirection = constraint.data.bendDirection;
          constraint.compress = constraint.data.compress;
          constraint.stretch = constraint.data.stretch;
          return;
        case MixBlend.first:
          constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
          constraint.softness += (constraint.data.softness - constraint.softness) * alpha;
          constraint.bendDirection = constraint.data.bendDirection;
          constraint.compress = constraint.data.compress;
          constraint.stretch = constraint.data.stretch;
      }
      return;
    }
    let mix = 0, softness = 0;
    let i = Timeline.search(
      frames,
      time,
      6
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 6
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        mix = frames[
          i + 1
          /*MIX*/
        ];
        softness = frames[
          i + 2
          /*SOFTNESS*/
        ];
        let t = (time - before) / (frames[
          i + 6
          /*ENTRIES*/
        ] - before);
        mix += (frames[
          i + 6 + 1
          /*MIX*/
        ] - mix) * t;
        softness += (frames[
          i + 6 + 2
          /*SOFTNESS*/
        ] - softness) * t;
        break;
      case 1:
        mix = frames[
          i + 1
          /*MIX*/
        ];
        softness = frames[
          i + 2
          /*SOFTNESS*/
        ];
        break;
      default:
        mix = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        softness = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
    }
    if (blend == MixBlend.setup) {
      constraint.mix = constraint.data.mix + (mix - constraint.data.mix) * alpha;
      constraint.softness = constraint.data.softness + (softness - constraint.data.softness) * alpha;
      if (direction == MixDirection.mixOut) {
        constraint.bendDirection = constraint.data.bendDirection;
        constraint.compress = constraint.data.compress;
        constraint.stretch = constraint.data.stretch;
      } else {
        constraint.bendDirection = frames[
          i + 3
          /*BEND_DIRECTION*/
        ];
        constraint.compress = frames[
          i + 4
          /*COMPRESS*/
        ] != 0;
        constraint.stretch = frames[
          i + 5
          /*STRETCH*/
        ] != 0;
      }
    } else {
      constraint.mix += (mix - constraint.mix) * alpha;
      constraint.softness += (softness - constraint.softness) * alpha;
      if (direction == MixDirection.mixIn) {
        constraint.bendDirection = frames[
          i + 3
          /*BEND_DIRECTION*/
        ];
        constraint.compress = frames[
          i + 4
          /*COMPRESS*/
        ] != 0;
        constraint.stretch = frames[
          i + 5
          /*STRETCH*/
        ] != 0;
      }
    }
  }
};
var TransformConstraintTimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, transformConstraintIndex) {
    super(frameCount, bezierCount, [
      Property.transformConstraint + "|" + transformConstraintIndex
    ]);
    this.transformConstraintIndex = 0;
    this.transformConstraintIndex = transformConstraintIndex;
  }
  getFrameEntries() {
    return 7;
  }
  /** The time in seconds, rotate mix, translate mix, scale mix, and shear mix for the specified key frame. */
  setFrame(frame, time, mixRotate, mixX, mixY, mixScaleX, mixScaleY, mixShearY) {
    let frames = this.frames;
    frame *= 7;
    frames[frame] = time;
    frames[
      frame + 1
      /*ROTATE*/
    ] = mixRotate;
    frames[
      frame + 2
      /*X*/
    ] = mixX;
    frames[
      frame + 3
      /*Y*/
    ] = mixY;
    frames[
      frame + 4
      /*SCALEX*/
    ] = mixScaleX;
    frames[
      frame + 5
      /*SCALEY*/
    ] = mixScaleY;
    frames[
      frame + 6
      /*SHEARY*/
    ] = mixShearY;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let constraint = skeleton.transformConstraints[this.transformConstraintIndex];
    if (!constraint.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      let data2 = constraint.data;
      switch (blend) {
        case MixBlend.setup:
          constraint.mixRotate = data2.mixRotate;
          constraint.mixX = data2.mixX;
          constraint.mixY = data2.mixY;
          constraint.mixScaleX = data2.mixScaleX;
          constraint.mixScaleY = data2.mixScaleY;
          constraint.mixShearY = data2.mixShearY;
          return;
        case MixBlend.first:
          constraint.mixRotate += (data2.mixRotate - constraint.mixRotate) * alpha;
          constraint.mixX += (data2.mixX - constraint.mixX) * alpha;
          constraint.mixY += (data2.mixY - constraint.mixY) * alpha;
          constraint.mixScaleX += (data2.mixScaleX - constraint.mixScaleX) * alpha;
          constraint.mixScaleY += (data2.mixScaleY - constraint.mixScaleY) * alpha;
          constraint.mixShearY += (data2.mixShearY - constraint.mixShearY) * alpha;
      }
      return;
    }
    let rotate, x, y, scaleX, scaleY, shearY;
    let i = Timeline.search(
      frames,
      time,
      7
      /*ENTRIES*/
    );
    let curveType = this.curves[
      i / 7
      /*ENTRIES*/
    ];
    switch (curveType) {
      case 0:
        let before = frames[i];
        rotate = frames[
          i + 1
          /*ROTATE*/
        ];
        x = frames[
          i + 2
          /*X*/
        ];
        y = frames[
          i + 3
          /*Y*/
        ];
        scaleX = frames[
          i + 4
          /*SCALEX*/
        ];
        scaleY = frames[
          i + 5
          /*SCALEY*/
        ];
        shearY = frames[
          i + 6
          /*SHEARY*/
        ];
        let t = (time - before) / (frames[
          i + 7
          /*ENTRIES*/
        ] - before);
        rotate += (frames[
          i + 7 + 1
          /*ROTATE*/
        ] - rotate) * t;
        x += (frames[
          i + 7 + 2
          /*X*/
        ] - x) * t;
        y += (frames[
          i + 7 + 3
          /*Y*/
        ] - y) * t;
        scaleX += (frames[
          i + 7 + 4
          /*SCALEX*/
        ] - scaleX) * t;
        scaleY += (frames[
          i + 7 + 5
          /*SCALEY*/
        ] - scaleY) * t;
        shearY += (frames[
          i + 7 + 6
          /*SHEARY*/
        ] - shearY) * t;
        break;
      case 1:
        rotate = frames[
          i + 1
          /*ROTATE*/
        ];
        x = frames[
          i + 2
          /*X*/
        ];
        y = frames[
          i + 3
          /*Y*/
        ];
        scaleX = frames[
          i + 4
          /*SCALEX*/
        ];
        scaleY = frames[
          i + 5
          /*SCALEY*/
        ];
        shearY = frames[
          i + 6
          /*SHEARY*/
        ];
        break;
      default:
        rotate = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        x = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        y = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
        scaleX = this.getBezierValue(
          time,
          i,
          4,
          curveType + 18 * 3 - 2
          /*BEZIER*/
        );
        scaleY = this.getBezierValue(
          time,
          i,
          5,
          curveType + 18 * 4 - 2
          /*BEZIER*/
        );
        shearY = this.getBezierValue(
          time,
          i,
          6,
          curveType + 18 * 5 - 2
          /*BEZIER*/
        );
    }
    if (blend == MixBlend.setup) {
      let data2 = constraint.data;
      constraint.mixRotate = data2.mixRotate + (rotate - data2.mixRotate) * alpha;
      constraint.mixX = data2.mixX + (x - data2.mixX) * alpha;
      constraint.mixY = data2.mixY + (y - data2.mixY) * alpha;
      constraint.mixScaleX = data2.mixScaleX + (scaleX - data2.mixScaleX) * alpha;
      constraint.mixScaleY = data2.mixScaleY + (scaleY - data2.mixScaleY) * alpha;
      constraint.mixShearY = data2.mixShearY + (shearY - data2.mixShearY) * alpha;
    } else {
      constraint.mixRotate += (rotate - constraint.mixRotate) * alpha;
      constraint.mixX += (x - constraint.mixX) * alpha;
      constraint.mixY += (y - constraint.mixY) * alpha;
      constraint.mixScaleX += (scaleX - constraint.mixScaleX) * alpha;
      constraint.mixScaleY += (scaleY - constraint.mixScaleY) * alpha;
      constraint.mixShearY += (shearY - constraint.mixShearY) * alpha;
    }
  }
};
var PathConstraintPositionTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, pathConstraintIndex) {
    super(frameCount, bezierCount, Property.pathConstraintPosition + "|" + pathConstraintIndex);
    this.pathConstraintIndex = 0;
    this.pathConstraintIndex = pathConstraintIndex;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (!constraint.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.position = constraint.data.position;
          return;
        case MixBlend.first:
          constraint.position += (constraint.data.position - constraint.position) * alpha;
      }
      return;
    }
    let position = this.getCurveValue(time);
    if (blend == MixBlend.setup)
      constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
    else
      constraint.position += (position - constraint.position) * alpha;
  }
};
var PathConstraintSpacingTimeline = class extends CurveTimeline1 {
  constructor(frameCount, bezierCount, pathConstraintIndex) {
    super(frameCount, bezierCount, Property.pathConstraintSpacing + "|" + pathConstraintIndex);
    this.pathConstraintIndex = 0;
    this.pathConstraintIndex = pathConstraintIndex;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (!constraint.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.spacing = constraint.data.spacing;
          return;
        case MixBlend.first:
          constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
      }
      return;
    }
    let spacing = this.getCurveValue(time);
    if (blend == MixBlend.setup)
      constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
    else
      constraint.spacing += (spacing - constraint.spacing) * alpha;
  }
};
var PathConstraintMixTimeline = class extends CurveTimeline {
  constructor(frameCount, bezierCount, pathConstraintIndex) {
    super(frameCount, bezierCount, [
      Property.pathConstraintMix + "|" + pathConstraintIndex
    ]);
    this.pathConstraintIndex = 0;
    this.pathConstraintIndex = pathConstraintIndex;
  }
  getFrameEntries() {
    return 4;
  }
  setFrame(frame, time, mixRotate, mixX, mixY) {
    let frames = this.frames;
    frame <<= 2;
    frames[frame] = time;
    frames[
      frame + 1
      /*ROTATE*/
    ] = mixRotate;
    frames[
      frame + 2
      /*X*/
    ] = mixX;
    frames[
      frame + 3
      /*Y*/
    ] = mixY;
  }
  apply(skeleton, lastTime, time, firedEvents, alpha, blend, direction) {
    let constraint = skeleton.pathConstraints[this.pathConstraintIndex];
    if (!constraint.active)
      return;
    let frames = this.frames;
    if (time < frames[0]) {
      switch (blend) {
        case MixBlend.setup:
          constraint.mixRotate = constraint.data.mixRotate;
          constraint.mixX = constraint.data.mixX;
          constraint.mixY = constraint.data.mixY;
          return;
        case MixBlend.first:
          constraint.mixRotate += (constraint.data.mixRotate - constraint.mixRotate) * alpha;
          constraint.mixX += (constraint.data.mixX - constraint.mixX) * alpha;
          constraint.mixY += (constraint.data.mixY - constraint.mixY) * alpha;
      }
      return;
    }
    let rotate, x, y;
    let i = Timeline.search(
      frames,
      time,
      4
      /*ENTRIES*/
    );
    let curveType = this.curves[i >> 2];
    switch (curveType) {
      case 0:
        let before = frames[i];
        rotate = frames[
          i + 1
          /*ROTATE*/
        ];
        x = frames[
          i + 2
          /*X*/
        ];
        y = frames[
          i + 3
          /*Y*/
        ];
        let t = (time - before) / (frames[
          i + 4
          /*ENTRIES*/
        ] - before);
        rotate += (frames[
          i + 4 + 1
          /*ROTATE*/
        ] - rotate) * t;
        x += (frames[
          i + 4 + 2
          /*X*/
        ] - x) * t;
        y += (frames[
          i + 4 + 3
          /*Y*/
        ] - y) * t;
        break;
      case 1:
        rotate = frames[
          i + 1
          /*ROTATE*/
        ];
        x = frames[
          i + 2
          /*X*/
        ];
        y = frames[
          i + 3
          /*Y*/
        ];
        break;
      default:
        rotate = this.getBezierValue(
          time,
          i,
          1,
          curveType - 2
          /*BEZIER*/
        );
        x = this.getBezierValue(
          time,
          i,
          2,
          curveType + 18 - 2
          /*BEZIER*/
        );
        y = this.getBezierValue(
          time,
          i,
          3,
          curveType + 18 * 2 - 2
          /*BEZIER*/
        );
    }
    if (blend == MixBlend.setup) {
      let data2 = constraint.data;
      constraint.mixRotate = data2.mixRotate + (rotate - data2.mixRotate) * alpha;
      constraint.mixX = data2.mixX + (x - data2.mixX) * alpha;
      constraint.mixY = data2.mixY + (y - data2.mixY) * alpha;
    } else {
      constraint.mixRotate += (rotate - constraint.mixRotate) * alpha;
      constraint.mixX += (x - constraint.mixX) * alpha;
      constraint.mixY += (y - constraint.mixY) * alpha;
    }
  }
};

// node_modules/@esotericsoftware/spine-core/dist/AnimationState.js
var EventType;
(function(EventType2) {
  EventType2[EventType2["start"] = 0] = "start";
  EventType2[EventType2["interrupt"] = 1] = "interrupt";
  EventType2[EventType2["end"] = 2] = "end";
  EventType2[EventType2["dispose"] = 3] = "dispose";
  EventType2[EventType2["complete"] = 4] = "complete";
  EventType2[EventType2["event"] = 5] = "event";
})(EventType || (EventType = {}));

// node_modules/@esotericsoftware/spine-core/dist/attachments/BoundingBoxAttachment.js
var BoundingBoxAttachment = class _BoundingBoxAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    this.color = new Color(1, 1, 1, 1);
  }
  copy() {
    let copy = new _BoundingBoxAttachment(this.name);
    this.copyTo(copy);
    copy.color.setFromColor(this.color);
    return copy;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/ClippingAttachment.js
var ClippingAttachment = class _ClippingAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    this.endSlot = null;
    this.color = new Color(0.2275, 0.2275, 0.8078, 1);
  }
  copy() {
    let copy = new _ClippingAttachment(this.name);
    this.copyTo(copy);
    copy.endSlot = this.endSlot;
    copy.color.setFromColor(this.color);
    return copy;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/Texture.js
var Texture = class {
  constructor(image) {
    this._image = image;
  }
  getImage() {
    return this._image;
  }
};
var TextureFilter;
(function(TextureFilter2) {
  TextureFilter2[TextureFilter2["Nearest"] = 9728] = "Nearest";
  TextureFilter2[TextureFilter2["Linear"] = 9729] = "Linear";
  TextureFilter2[TextureFilter2["MipMap"] = 9987] = "MipMap";
  TextureFilter2[TextureFilter2["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
  TextureFilter2[TextureFilter2["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
  TextureFilter2[TextureFilter2["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
  TextureFilter2[TextureFilter2["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear";
})(TextureFilter || (TextureFilter = {}));
var TextureWrap;
(function(TextureWrap2) {
  TextureWrap2[TextureWrap2["MirroredRepeat"] = 33648] = "MirroredRepeat";
  TextureWrap2[TextureWrap2["ClampToEdge"] = 33071] = "ClampToEdge";
  TextureWrap2[TextureWrap2["Repeat"] = 10497] = "Repeat";
})(TextureWrap || (TextureWrap = {}));
var TextureRegion = class {
  constructor() {
    this.u = 0;
    this.v = 0;
    this.u2 = 0;
    this.v2 = 0;
    this.width = 0;
    this.height = 0;
    this.degrees = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.originalWidth = 0;
    this.originalHeight = 0;
  }
};
var FakeTexture = class extends Texture {
  setFilters(minFilter, magFilter) {
  }
  setWraps(uWrap, vWrap) {
  }
  dispose() {
  }
};

// node_modules/@esotericsoftware/spine-core/dist/TextureAtlas.js
var TextureAtlas = class {
  constructor(atlasText) {
    this.pages = new Array();
    this.regions = new Array();
    let reader = new TextureAtlasReader(atlasText);
    let entry = new Array(4);
    let page = null;
    let region = null;
    let pageFields = {};
    pageFields["size"] = () => {
      page.width = parseInt(entry[1]);
      page.height = parseInt(entry[2]);
    };
    pageFields["format"] = () => {
    };
    pageFields["filter"] = () => {
      page.minFilter = Utils.enumValue(TextureFilter, entry[1]);
      page.magFilter = Utils.enumValue(TextureFilter, entry[2]);
    };
    pageFields["repeat"] = () => {
      if (entry[1].indexOf("x") != -1)
        page.uWrap = TextureWrap.Repeat;
      if (entry[1].indexOf("y") != -1)
        page.vWrap = TextureWrap.Repeat;
    };
    pageFields["pma"] = () => {
      page.pma = entry[1] == "true";
    };
    var regionFields = {};
    regionFields["xy"] = () => {
      region.x = parseInt(entry[1]);
      region.y = parseInt(entry[2]);
    };
    regionFields["size"] = () => {
      region.width = parseInt(entry[1]);
      region.height = parseInt(entry[2]);
    };
    regionFields["bounds"] = () => {
      region.x = parseInt(entry[1]);
      region.y = parseInt(entry[2]);
      region.width = parseInt(entry[3]);
      region.height = parseInt(entry[4]);
    };
    regionFields["offset"] = () => {
      region.offsetX = parseInt(entry[1]);
      region.offsetY = parseInt(entry[2]);
    };
    regionFields["orig"] = () => {
      region.originalWidth = parseInt(entry[1]);
      region.originalHeight = parseInt(entry[2]);
    };
    regionFields["offsets"] = () => {
      region.offsetX = parseInt(entry[1]);
      region.offsetY = parseInt(entry[2]);
      region.originalWidth = parseInt(entry[3]);
      region.originalHeight = parseInt(entry[4]);
    };
    regionFields["rotate"] = () => {
      let value = entry[1];
      if (value == "true")
        region.degrees = 90;
      else if (value != "false")
        region.degrees = parseInt(value);
    };
    regionFields["index"] = () => {
      region.index = parseInt(entry[1]);
    };
    let line = reader.readLine();
    while (line && line.trim().length == 0)
      line = reader.readLine();
    while (true) {
      if (!line || line.trim().length == 0)
        break;
      if (reader.readEntry(entry, line) == 0)
        break;
      line = reader.readLine();
    }
    let names = null;
    let values = null;
    while (true) {
      if (line === null)
        break;
      if (line.trim().length == 0) {
        page = null;
        line = reader.readLine();
      } else if (!page) {
        page = new TextureAtlasPage();
        page.name = line.trim();
        while (true) {
          if (reader.readEntry(entry, line = reader.readLine()) == 0)
            break;
          let field = pageFields[entry[0]];
          if (field)
            field();
        }
        this.pages.push(page);
      } else {
        region = new TextureAtlasRegion();
        region.page = page;
        region.name = line;
        while (true) {
          let count = reader.readEntry(entry, line = reader.readLine());
          if (count == 0)
            break;
          let field = regionFields[entry[0]];
          if (field)
            field();
          else {
            if (!names) {
              names = [];
              values = [];
            }
            names.push(entry[0]);
            let entryValues = [];
            for (let i = 0; i < count; i++)
              entryValues.push(parseInt(entry[i + 1]));
            values.push(entryValues);
          }
        }
        if (region.originalWidth == 0 && region.originalHeight == 0) {
          region.originalWidth = region.width;
          region.originalHeight = region.height;
        }
        if (names && names.length > 0) {
          region.names = names;
          region.values = values;
          names = null;
          values = null;
        }
        region.u = region.x / page.width;
        region.v = region.y / page.height;
        if (region.degrees == 90) {
          region.u2 = (region.x + region.height) / page.width;
          region.v2 = (region.y + region.width) / page.height;
        } else {
          region.u2 = (region.x + region.width) / page.width;
          region.v2 = (region.y + region.height) / page.height;
        }
        this.regions.push(region);
      }
    }
  }
  findRegion(name) {
    for (let i = 0; i < this.regions.length; i++) {
      if (this.regions[i].name == name) {
        return this.regions[i];
      }
    }
    return null;
  }
  setTextures(assetManager, pathPrefix = "") {
    for (let page of this.pages)
      page.setTexture(assetManager.get(pathPrefix + page.name));
  }
  dispose() {
    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].texture.dispose();
    }
  }
};
var TextureAtlasReader = class {
  constructor(text) {
    this.lines = null;
    this.index = 0;
    this.lines = text.split(/\r\n|\r|\n/);
  }
  readLine() {
    if (this.index >= this.lines.length)
      return null;
    return this.lines[this.index++];
  }
  readEntry(entry, line) {
    if (!line)
      return 0;
    line = line.trim();
    if (line.length == 0)
      return 0;
    let colon = line.indexOf(":");
    if (colon == -1)
      return 0;
    entry[0] = line.substr(0, colon).trim();
    for (let i = 1, lastMatch = colon + 1; ; i++) {
      let comma = line.indexOf(",", lastMatch);
      if (comma == -1) {
        entry[i] = line.substr(lastMatch).trim();
        return i;
      }
      entry[i] = line.substr(lastMatch, comma - lastMatch).trim();
      lastMatch = comma + 1;
      if (i == 4)
        return 4;
    }
  }
};
var TextureAtlasPage = class {
  constructor() {
    this.name = null;
    this.minFilter = TextureFilter.Nearest;
    this.magFilter = TextureFilter.Nearest;
    this.uWrap = TextureWrap.ClampToEdge;
    this.vWrap = TextureWrap.ClampToEdge;
    this.texture = null;
    this.width = 0;
    this.height = 0;
    this.pma = false;
  }
  setTexture(texture) {
    this.texture = texture;
    texture.setFilters(this.minFilter, this.magFilter);
    texture.setWraps(this.uWrap, this.vWrap);
  }
};
var TextureAtlasRegion = class extends TextureRegion {
  constructor() {
    super(...arguments);
    this.page = null;
    this.name = null;
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.originalWidth = 0;
    this.originalHeight = 0;
    this.index = 0;
    this.degrees = 0;
    this.names = null;
    this.values = null;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/MeshAttachment.js
var MeshAttachment = class _MeshAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    this.region = null;
    this.path = null;
    this.regionUVs = null;
    this.uvs = null;
    this.triangles = null;
    this.color = new Color(1, 1, 1, 1);
    this.width = 0;
    this.height = 0;
    this.hullLength = 0;
    this.edges = null;
    this.parentMesh = null;
    this.tempColor = new Color(0, 0, 0, 0);
  }
  /** Calculates {@link #uvs} using {@link #regionUVs} and the {@link #region}. Must be called after changing the region UVs or
   * region. */
  updateUVs() {
    let regionUVs = this.regionUVs;
    if (!this.uvs || this.uvs.length != regionUVs.length)
      this.uvs = Utils.newFloatArray(regionUVs.length);
    let uvs = this.uvs;
    let n = this.uvs.length;
    let u = this.region.u, v = this.region.v, width = 0, height = 0;
    if (this.region instanceof TextureAtlasRegion) {
      let region = this.region, image = region.page.texture.getImage();
      let textureWidth = image.width, textureHeight = image.height;
      switch (region.degrees) {
        case 90:
          u -= (region.originalHeight - region.offsetY - region.height) / textureWidth;
          v -= (region.originalWidth - region.offsetX - region.width) / textureHeight;
          width = region.originalHeight / textureWidth;
          height = region.originalWidth / textureHeight;
          for (let i = 0; i < n; i += 2) {
            uvs[i] = u + regionUVs[i + 1] * width;
            uvs[i + 1] = v + (1 - regionUVs[i]) * height;
          }
          return;
        case 180:
          u -= (region.originalWidth - region.offsetX - region.width) / textureWidth;
          v -= region.offsetY / textureHeight;
          width = region.originalWidth / textureWidth;
          height = region.originalHeight / textureHeight;
          for (let i = 0; i < n; i += 2) {
            uvs[i] = u + (1 - regionUVs[i]) * width;
            uvs[i + 1] = v + (1 - regionUVs[i + 1]) * height;
          }
          return;
        case 270:
          u -= region.offsetY / textureWidth;
          v -= region.offsetX / textureHeight;
          width = region.originalHeight / textureWidth;
          height = region.originalWidth / textureHeight;
          for (let i = 0; i < n; i += 2) {
            uvs[i] = u + (1 - regionUVs[i + 1]) * width;
            uvs[i + 1] = v + regionUVs[i] * height;
          }
          return;
      }
      u -= region.offsetX / textureWidth;
      v -= (region.originalHeight - region.offsetY - region.height) / textureHeight;
      width = region.originalWidth / textureWidth;
      height = region.originalHeight / textureHeight;
    } else if (!this.region) {
      u = v = 0;
      width = height = 1;
    } else {
      width = this.region.u2 - u;
      height = this.region.v2 - v;
    }
    for (let i = 0; i < n; i += 2) {
      uvs[i] = u + regionUVs[i] * width;
      uvs[i + 1] = v + regionUVs[i + 1] * height;
    }
  }
  /** The parent mesh if this is a linked mesh, else null. A linked mesh shares the {@link #bones}, {@link #vertices},
   * {@link #regionUVs}, {@link #triangles}, {@link #hullLength}, {@link #edges}, {@link #width}, and {@link #height} with the
   * parent mesh, but may have a different {@link #name} or {@link #path} (and therefore a different texture). */
  getParentMesh() {
    return this.parentMesh;
  }
  /** @param parentMesh May be null. */
  setParentMesh(parentMesh) {
    this.parentMesh = parentMesh;
    if (parentMesh) {
      this.bones = parentMesh.bones;
      this.vertices = parentMesh.vertices;
      this.worldVerticesLength = parentMesh.worldVerticesLength;
      this.regionUVs = parentMesh.regionUVs;
      this.triangles = parentMesh.triangles;
      this.hullLength = parentMesh.hullLength;
      this.worldVerticesLength = parentMesh.worldVerticesLength;
    }
  }
  copy() {
    if (this.parentMesh)
      return this.newLinkedMesh();
    let copy = new _MeshAttachment(this.name);
    copy.region = this.region;
    copy.path = this.path;
    copy.color.setFromColor(this.color);
    this.copyTo(copy);
    copy.regionUVs = new Array(this.regionUVs.length);
    Utils.arrayCopy(this.regionUVs, 0, copy.regionUVs, 0, this.regionUVs.length);
    copy.uvs = new Array(this.uvs.length);
    Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, this.uvs.length);
    copy.triangles = new Array(this.triangles.length);
    Utils.arrayCopy(this.triangles, 0, copy.triangles, 0, this.triangles.length);
    copy.hullLength = this.hullLength;
    if (this.edges) {
      copy.edges = new Array(this.edges.length);
      Utils.arrayCopy(this.edges, 0, copy.edges, 0, this.edges.length);
    }
    copy.width = this.width;
    copy.height = this.height;
    return copy;
  }
  /** Returns a new mesh with the {@link #parentMesh} set to this mesh's parent mesh, if any, else to this mesh. **/
  newLinkedMesh() {
    let copy = new _MeshAttachment(this.name);
    copy.region = this.region;
    copy.path = this.path;
    copy.color.setFromColor(this.color);
    copy.deformAttachment = this.deformAttachment;
    copy.setParentMesh(this.parentMesh ? this.parentMesh : this);
    copy.updateUVs();
    return copy;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/PathAttachment.js
var PathAttachment = class _PathAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    this.lengths = null;
    this.closed = false;
    this.constantSpeed = false;
    this.color = new Color(1, 1, 1, 1);
  }
  copy() {
    let copy = new _PathAttachment(this.name);
    this.copyTo(copy);
    copy.lengths = new Array(this.lengths.length);
    Utils.arrayCopy(this.lengths, 0, copy.lengths, 0, this.lengths.length);
    copy.closed = closed;
    copy.constantSpeed = this.constantSpeed;
    copy.color.setFromColor(this.color);
    return copy;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/PointAttachment.js
var PointAttachment = class _PointAttachment extends VertexAttachment {
  constructor(name) {
    super(name);
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.color = new Color(0.38, 0.94, 0, 1);
  }
  computeWorldPosition(bone, point) {
    point.x = this.x * bone.a + this.y * bone.b + bone.worldX;
    point.y = this.x * bone.c + this.y * bone.d + bone.worldY;
    return point;
  }
  computeWorldRotation(bone) {
    let cos = MathUtils.cosDeg(this.rotation), sin = MathUtils.sinDeg(this.rotation);
    let x = cos * bone.a + sin * bone.b;
    let y = cos * bone.c + sin * bone.d;
    return Math.atan2(y, x) * MathUtils.radDeg;
  }
  copy() {
    let copy = new _PointAttachment(this.name);
    copy.x = this.x;
    copy.y = this.y;
    copy.rotation = this.rotation;
    copy.color.setFromColor(this.color);
    return copy;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/attachments/RegionAttachment.js
var RegionAttachment = class _RegionAttachment extends Attachment {
  constructor(name) {
    super(name);
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.width = 0;
    this.height = 0;
    this.color = new Color(1, 1, 1, 1);
    this.path = null;
    this.rendererObject = null;
    this.region = null;
    this.offset = Utils.newFloatArray(8);
    this.uvs = Utils.newFloatArray(8);
    this.tempColor = new Color(1, 1, 1, 1);
  }
  /** Calculates the {@link #offset} using the region settings. Must be called after changing region settings. */
  updateOffset() {
    let region = this.region;
    let regionScaleX = this.width / this.region.originalWidth * this.scaleX;
    let regionScaleY = this.height / this.region.originalHeight * this.scaleY;
    let localX = -this.width / 2 * this.scaleX + this.region.offsetX * regionScaleX;
    let localY = -this.height / 2 * this.scaleY + this.region.offsetY * regionScaleY;
    let localX2 = localX + this.region.width * regionScaleX;
    let localY2 = localY + this.region.height * regionScaleY;
    let radians = this.rotation * Math.PI / 180;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let x = this.x, y = this.y;
    let localXCos = localX * cos + x;
    let localXSin = localX * sin;
    let localYCos = localY * cos + y;
    let localYSin = localY * sin;
    let localX2Cos = localX2 * cos + x;
    let localX2Sin = localX2 * sin;
    let localY2Cos = localY2 * cos + y;
    let localY2Sin = localY2 * sin;
    let offset = this.offset;
    offset[0] = localXCos - localYSin;
    offset[1] = localYCos + localXSin;
    offset[2] = localXCos - localY2Sin;
    offset[3] = localY2Cos + localXSin;
    offset[4] = localX2Cos - localY2Sin;
    offset[5] = localY2Cos + localX2Sin;
    offset[6] = localX2Cos - localYSin;
    offset[7] = localYCos + localX2Sin;
  }
  setRegion(region) {
    this.region = region;
    let uvs = this.uvs;
    if (region.degrees == 90) {
      uvs[2] = region.u;
      uvs[3] = region.v2;
      uvs[4] = region.u;
      uvs[5] = region.v;
      uvs[6] = region.u2;
      uvs[7] = region.v;
      uvs[0] = region.u2;
      uvs[1] = region.v2;
    } else {
      uvs[0] = region.u;
      uvs[1] = region.v2;
      uvs[2] = region.u;
      uvs[3] = region.v;
      uvs[4] = region.u2;
      uvs[5] = region.v;
      uvs[6] = region.u2;
      uvs[7] = region.v2;
    }
  }
  /** Transforms the attachment's four vertices to world coordinates.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide.
   * @param worldVertices The output world vertices. Must have a length >= `offset` + 8.
   * @param offset The `worldVertices` index to begin writing values.
   * @param stride The number of `worldVertices` entries between the value pairs written. */
  computeWorldVertices(bone, worldVertices, offset, stride) {
    let vertexOffset = this.offset;
    let x = bone.worldX, y = bone.worldY;
    let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
    let offsetX = 0, offsetY = 0;
    offsetX = vertexOffset[0];
    offsetY = vertexOffset[1];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[2];
    offsetY = vertexOffset[3];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[4];
    offsetY = vertexOffset[5];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    offset += stride;
    offsetX = vertexOffset[6];
    offsetY = vertexOffset[7];
    worldVertices[offset] = offsetX * a + offsetY * b + x;
    worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
  }
  copy() {
    let copy = new _RegionAttachment(this.name);
    copy.region = this.region;
    copy.rendererObject = this.rendererObject;
    copy.path = this.path;
    copy.x = this.x;
    copy.y = this.y;
    copy.scaleX = this.scaleX;
    copy.scaleY = this.scaleY;
    copy.rotation = this.rotation;
    copy.width = this.width;
    copy.height = this.height;
    Utils.arrayCopy(this.uvs, 0, copy.uvs, 0, 8);
    Utils.arrayCopy(this.offset, 0, copy.offset, 0, 8);
    copy.color.setFromColor(this.color);
    return copy;
  }
};
RegionAttachment.X1 = 0;
RegionAttachment.Y1 = 1;
RegionAttachment.C1R = 2;
RegionAttachment.C1G = 3;
RegionAttachment.C1B = 4;
RegionAttachment.C1A = 5;
RegionAttachment.U1 = 6;
RegionAttachment.V1 = 7;
RegionAttachment.X2 = 8;
RegionAttachment.Y2 = 9;
RegionAttachment.C2R = 10;
RegionAttachment.C2G = 11;
RegionAttachment.C2B = 12;
RegionAttachment.C2A = 13;
RegionAttachment.U2 = 14;
RegionAttachment.V2 = 15;
RegionAttachment.X3 = 16;
RegionAttachment.Y3 = 17;
RegionAttachment.C3R = 18;
RegionAttachment.C3G = 19;
RegionAttachment.C3B = 20;
RegionAttachment.C3A = 21;
RegionAttachment.U3 = 22;
RegionAttachment.V3 = 23;
RegionAttachment.X4 = 24;
RegionAttachment.Y4 = 25;
RegionAttachment.C4R = 26;
RegionAttachment.C4G = 27;
RegionAttachment.C4B = 28;
RegionAttachment.C4A = 29;
RegionAttachment.U4 = 30;
RegionAttachment.V4 = 31;

// node_modules/@esotericsoftware/spine-core/dist/AtlasAttachmentLoader.js
var AtlasAttachmentLoader = class {
  constructor(atlas2) {
    this.atlas = null;
    this.atlas = atlas2;
  }
  newRegionAttachment(skin, name, path) {
    let region = this.atlas.findRegion(path);
    if (!region)
      throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
    region.renderObject = region;
    let attachment = new RegionAttachment(name);
    attachment.setRegion(region);
    return attachment;
  }
  newMeshAttachment(skin, name, path) {
    let region = this.atlas.findRegion(path);
    if (!region)
      throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
    region.renderObject = region;
    let attachment = new MeshAttachment(name);
    attachment.region = region;
    return attachment;
  }
  newBoundingBoxAttachment(skin, name) {
    return new BoundingBoxAttachment(name);
  }
  newPathAttachment(skin, name) {
    return new PathAttachment(name);
  }
  newPointAttachment(skin, name) {
    return new PointAttachment(name);
  }
  newClippingAttachment(skin, name) {
    return new ClippingAttachment(name);
  }
};

// node_modules/@esotericsoftware/spine-core/dist/BoneData.js
var BoneData = class {
  constructor(index, name, parent) {
    this.index = 0;
    this.name = null;
    this.parent = null;
    this.length = 0;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.shearX = 0;
    this.shearY = 0;
    this.transformMode = TransformMode.Normal;
    this.skinRequired = false;
    this.color = new Color();
    if (index < 0)
      throw new Error("index must be >= 0.");
    if (!name)
      throw new Error("name cannot be null.");
    this.index = index;
    this.name = name;
    this.parent = parent;
  }
};
var TransformMode;
(function(TransformMode2) {
  TransformMode2[TransformMode2["Normal"] = 0] = "Normal";
  TransformMode2[TransformMode2["OnlyTranslation"] = 1] = "OnlyTranslation";
  TransformMode2[TransformMode2["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
  TransformMode2[TransformMode2["NoScale"] = 3] = "NoScale";
  TransformMode2[TransformMode2["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
})(TransformMode || (TransformMode = {}));

// node_modules/@esotericsoftware/spine-core/dist/Bone.js
var Bone = class {
  /** @param parent May be null. */
  constructor(data2, skeleton, parent) {
    this.data = null;
    this.skeleton = null;
    this.parent = null;
    this.children = new Array();
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scaleX = 0;
    this.scaleY = 0;
    this.shearX = 0;
    this.shearY = 0;
    this.ax = 0;
    this.ay = 0;
    this.arotation = 0;
    this.ascaleX = 0;
    this.ascaleY = 0;
    this.ashearX = 0;
    this.ashearY = 0;
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.d = 0;
    this.worldY = 0;
    this.worldX = 0;
    this.sorted = false;
    this.active = false;
    if (!data2)
      throw new Error("data cannot be null.");
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    this.data = data2;
    this.skeleton = skeleton;
    this.parent = parent;
    this.setToSetupPose();
  }
  /** Returns false when the bone has not been computed because {@link BoneData#skinRequired} is true and the
    * {@link Skeleton#skin active skin} does not {@link Skin#bones contain} this bone. */
  isActive() {
    return this.active;
  }
  /** Computes the world transform using the parent bone and this bone's local applied transform. */
  update() {
    this.updateWorldTransformWith(this.ax, this.ay, this.arotation, this.ascaleX, this.ascaleY, this.ashearX, this.ashearY);
  }
  /** Computes the world transform using the parent bone and this bone's local transform.
   *
   * See {@link #updateWorldTransformWith()}. */
  updateWorldTransform() {
    this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
  }
  /** Computes the world transform using the parent bone and the specified local transform. The applied transform is set to the
   * specified local transform. Child bones are not updated.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide. */
  updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
    this.ax = x;
    this.ay = y;
    this.arotation = rotation;
    this.ascaleX = scaleX;
    this.ascaleY = scaleY;
    this.ashearX = shearX;
    this.ashearY = shearY;
    let parent = this.parent;
    if (!parent) {
      let skeleton = this.skeleton;
      let rotationY = rotation + 90 + shearY;
      let sx = skeleton.scaleX;
      let sy = skeleton.scaleY;
      this.a = MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
      this.b = MathUtils.cosDeg(rotationY) * scaleY * sx;
      this.c = MathUtils.sinDeg(rotation + shearX) * scaleX * sy;
      this.d = MathUtils.sinDeg(rotationY) * scaleY * sy;
      this.worldX = x * sx + skeleton.x;
      this.worldY = y * sy + skeleton.y;
      return;
    }
    let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
    this.worldX = pa * x + pb * y + parent.worldX;
    this.worldY = pc * x + pd * y + parent.worldY;
    switch (this.data.transformMode) {
      case TransformMode.Normal: {
        let rotationY = rotation + 90 + shearY;
        let la = MathUtils.cosDeg(rotation + shearX) * scaleX;
        let lb = MathUtils.cosDeg(rotationY) * scaleY;
        let lc = MathUtils.sinDeg(rotation + shearX) * scaleX;
        let ld = MathUtils.sinDeg(rotationY) * scaleY;
        this.a = pa * la + pb * lc;
        this.b = pa * lb + pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        return;
      }
      case TransformMode.OnlyTranslation: {
        let rotationY = rotation + 90 + shearY;
        this.a = MathUtils.cosDeg(rotation + shearX) * scaleX;
        this.b = MathUtils.cosDeg(rotationY) * scaleY;
        this.c = MathUtils.sinDeg(rotation + shearX) * scaleX;
        this.d = MathUtils.sinDeg(rotationY) * scaleY;
        break;
      }
      case TransformMode.NoRotationOrReflection: {
        let s = pa * pa + pc * pc;
        let prx = 0;
        if (s > 1e-4) {
          s = Math.abs(pa * pd - pb * pc) / s;
          pa /= this.skeleton.scaleX;
          pc /= this.skeleton.scaleY;
          pb = pc * s;
          pd = pa * s;
          prx = Math.atan2(pc, pa) * MathUtils.radDeg;
        } else {
          pa = 0;
          pc = 0;
          prx = 90 - Math.atan2(pd, pb) * MathUtils.radDeg;
        }
        let rx = rotation + shearX - prx;
        let ry = rotation + shearY - prx + 90;
        let la = MathUtils.cosDeg(rx) * scaleX;
        let lb = MathUtils.cosDeg(ry) * scaleY;
        let lc = MathUtils.sinDeg(rx) * scaleX;
        let ld = MathUtils.sinDeg(ry) * scaleY;
        this.a = pa * la - pb * lc;
        this.b = pa * lb - pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        break;
      }
      case TransformMode.NoScale:
      case TransformMode.NoScaleOrReflection: {
        let cos = MathUtils.cosDeg(rotation);
        let sin = MathUtils.sinDeg(rotation);
        let za = (pa * cos + pb * sin) / this.skeleton.scaleX;
        let zc = (pc * cos + pd * sin) / this.skeleton.scaleY;
        let s = Math.sqrt(za * za + zc * zc);
        if (s > 1e-5)
          s = 1 / s;
        za *= s;
        zc *= s;
        s = Math.sqrt(za * za + zc * zc);
        if (this.data.transformMode == TransformMode.NoScale && pa * pd - pb * pc < 0 != (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0))
          s = -s;
        let r = Math.PI / 2 + Math.atan2(zc, za);
        let zb = Math.cos(r) * s;
        let zd = Math.sin(r) * s;
        let la = MathUtils.cosDeg(shearX) * scaleX;
        let lb = MathUtils.cosDeg(90 + shearY) * scaleY;
        let lc = MathUtils.sinDeg(shearX) * scaleX;
        let ld = MathUtils.sinDeg(90 + shearY) * scaleY;
        this.a = za * la + zb * lc;
        this.b = za * lb + zb * ld;
        this.c = zc * la + zd * lc;
        this.d = zc * lb + zd * ld;
        break;
      }
    }
    this.a *= this.skeleton.scaleX;
    this.b *= this.skeleton.scaleX;
    this.c *= this.skeleton.scaleY;
    this.d *= this.skeleton.scaleY;
  }
  /** Sets this bone's local transform to the setup pose. */
  setToSetupPose() {
    let data2 = this.data;
    this.x = data2.x;
    this.y = data2.y;
    this.rotation = data2.rotation;
    this.scaleX = data2.scaleX;
    this.scaleY = data2.scaleY;
    this.shearX = data2.shearX;
    this.shearY = data2.shearY;
  }
  /** The world rotation for the X axis, calculated using {@link #a} and {@link #c}. */
  getWorldRotationX() {
    return Math.atan2(this.c, this.a) * MathUtils.radDeg;
  }
  /** The world rotation for the Y axis, calculated using {@link #b} and {@link #d}. */
  getWorldRotationY() {
    return Math.atan2(this.d, this.b) * MathUtils.radDeg;
  }
  /** The magnitude (always positive) of the world scale X, calculated using {@link #a} and {@link #c}. */
  getWorldScaleX() {
    return Math.sqrt(this.a * this.a + this.c * this.c);
  }
  /** The magnitude (always positive) of the world scale Y, calculated using {@link #b} and {@link #d}. */
  getWorldScaleY() {
    return Math.sqrt(this.b * this.b + this.d * this.d);
  }
  /** Computes the applied transform values from the world transform.
   *
   * If the world transform is modified (by a constraint, {@link #rotateWorld(float)}, etc) then this method should be called so
   * the applied transform matches the world transform. The applied transform may be needed by other code (eg to apply other
   * constraints).
   *
   * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. The applied transform after
   * calling this method is equivalent to the local transform used to compute the world transform, but may not be identical. */
  updateAppliedTransform() {
    let parent = this.parent;
    if (!parent) {
      this.ax = this.worldX - this.skeleton.x;
      this.ay = this.worldY - this.skeleton.y;
      this.arotation = Math.atan2(this.c, this.a) * MathUtils.radDeg;
      this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
      this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
      this.ashearX = 0;
      this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * MathUtils.radDeg;
      return;
    }
    let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
    let pid = 1 / (pa * pd - pb * pc);
    let dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
    this.ax = dx * pd * pid - dy * pb * pid;
    this.ay = dy * pa * pid - dx * pc * pid;
    let ia = pid * pd;
    let id = pid * pa;
    let ib = pid * pb;
    let ic = pid * pc;
    let ra = ia * this.a - ib * this.c;
    let rb = ia * this.b - ib * this.d;
    let rc = id * this.c - ic * this.a;
    let rd = id * this.d - ic * this.b;
    this.ashearX = 0;
    this.ascaleX = Math.sqrt(ra * ra + rc * rc);
    if (this.ascaleX > 1e-4) {
      let det = ra * rd - rb * rc;
      this.ascaleY = det / this.ascaleX;
      this.ashearY = Math.atan2(ra * rb + rc * rd, det) * MathUtils.radDeg;
      this.arotation = Math.atan2(rc, ra) * MathUtils.radDeg;
    } else {
      this.ascaleX = 0;
      this.ascaleY = Math.sqrt(rb * rb + rd * rd);
      this.ashearY = 0;
      this.arotation = 90 - Math.atan2(rd, rb) * MathUtils.radDeg;
    }
  }
  /** Transforms a point from world coordinates to the bone's local coordinates. */
  worldToLocal(world) {
    let invDet = 1 / (this.a * this.d - this.b * this.c);
    let x = world.x - this.worldX, y = world.y - this.worldY;
    world.x = x * this.d * invDet - y * this.b * invDet;
    world.y = y * this.a * invDet - x * this.c * invDet;
    return world;
  }
  /** Transforms a point from the bone's local coordinates to world coordinates. */
  localToWorld(local) {
    let x = local.x, y = local.y;
    local.x = x * this.a + y * this.b + this.worldX;
    local.y = x * this.c + y * this.d + this.worldY;
    return local;
  }
  /** Transforms a world rotation to a local rotation. */
  worldToLocalRotation(worldRotation) {
    let sin = MathUtils.sinDeg(worldRotation), cos = MathUtils.cosDeg(worldRotation);
    return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * MathUtils.radDeg + this.rotation - this.shearX;
  }
  /** Transforms a local rotation to a world rotation. */
  localToWorldRotation(localRotation) {
    localRotation -= this.rotation - this.shearX;
    let sin = MathUtils.sinDeg(localRotation), cos = MathUtils.cosDeg(localRotation);
    return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * MathUtils.radDeg;
  }
  /** Rotates the world transform the specified amount.
   * <p>
   * After changes are made to the world transform, {@link #updateAppliedTransform()} should be called and {@link #update()} will
   * need to be called on any child bones, recursively. */
  rotateWorld(degrees) {
    let a = this.a, b = this.b, c = this.c, d = this.d;
    let cos = MathUtils.cosDeg(degrees), sin = MathUtils.sinDeg(degrees);
    this.a = cos * a - sin * c;
    this.b = cos * b - sin * d;
    this.c = sin * a + cos * c;
    this.d = sin * b + cos * d;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/ConstraintData.js
var ConstraintData = class {
  constructor(name, order, skinRequired) {
    this.name = name;
    this.order = order;
    this.skinRequired = skinRequired;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/Event.js
var Event = class {
  constructor(time, data2) {
    this.data = null;
    this.intValue = 0;
    this.floatValue = 0;
    this.stringValue = null;
    this.time = 0;
    this.volume = 0;
    this.balance = 0;
    if (!data2)
      throw new Error("data cannot be null.");
    this.time = time;
    this.data = data2;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/EventData.js
var EventData = class {
  constructor(name) {
    this.name = null;
    this.intValue = 0;
    this.floatValue = 0;
    this.stringValue = null;
    this.audioPath = null;
    this.volume = 0;
    this.balance = 0;
    this.name = name;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/IkConstraint.js
var IkConstraint = class {
  constructor(data2, skeleton) {
    this.data = null;
    this.bones = null;
    this.target = null;
    this.bendDirection = 0;
    this.compress = false;
    this.stretch = false;
    this.mix = 1;
    this.softness = 0;
    this.active = false;
    if (!data2)
      throw new Error("data cannot be null.");
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    this.data = data2;
    this.mix = data2.mix;
    this.softness = data2.softness;
    this.bendDirection = data2.bendDirection;
    this.compress = data2.compress;
    this.stretch = data2.stretch;
    this.bones = new Array();
    for (let i = 0; i < data2.bones.length; i++)
      this.bones.push(skeleton.findBone(data2.bones[i].name));
    this.target = skeleton.findBone(data2.target.name);
  }
  isActive() {
    return this.active;
  }
  update() {
    if (this.mix == 0)
      return;
    let target = this.target;
    let bones = this.bones;
    switch (bones.length) {
      case 1:
        this.apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.data.uniform, this.mix);
        break;
      case 2:
        this.apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendDirection, this.stretch, this.data.uniform, this.softness, this.mix);
        break;
    }
  }
  /** Applies 1 bone IK. The target is specified in the world coordinate system. */
  apply1(bone, targetX, targetY, compress, stretch, uniform, alpha) {
    let p = bone.parent;
    let pa = p.a, pb = p.b, pc = p.c, pd = p.d;
    let rotationIK = -bone.ashearX - bone.arotation, tx = 0, ty = 0;
    switch (bone.data.transformMode) {
      case TransformMode.OnlyTranslation:
        tx = targetX - bone.worldX;
        ty = targetY - bone.worldY;
        break;
      case TransformMode.NoRotationOrReflection:
        let s = Math.abs(pa * pd - pb * pc) / (pa * pa + pc * pc);
        let sa = pa / bone.skeleton.scaleX;
        let sc = pc / bone.skeleton.scaleY;
        pb = -sc * s * bone.skeleton.scaleX;
        pd = sa * s * bone.skeleton.scaleY;
        rotationIK += Math.atan2(sc, sa) * MathUtils.radDeg;
      // Fall through
      default:
        let x = targetX - p.worldX, y = targetY - p.worldY;
        let d = pa * pd - pb * pc;
        tx = (x * pd - y * pb) / d - bone.ax;
        ty = (y * pa - x * pc) / d - bone.ay;
    }
    rotationIK += Math.atan2(ty, tx) * MathUtils.radDeg;
    if (bone.ascaleX < 0)
      rotationIK += 180;
    if (rotationIK > 180)
      rotationIK -= 360;
    else if (rotationIK < -180)
      rotationIK += 360;
    let sx = bone.ascaleX, sy = bone.ascaleY;
    if (compress || stretch) {
      switch (bone.data.transformMode) {
        case TransformMode.NoScale:
        case TransformMode.NoScaleOrReflection:
          tx = targetX - bone.worldX;
          ty = targetY - bone.worldY;
      }
      let b = bone.data.length * sx, dd = Math.sqrt(tx * tx + ty * ty);
      if (compress && dd < b || stretch && dd > b && b > 1e-4) {
        let s = (dd / b - 1) * alpha + 1;
        sx *= s;
        if (uniform)
          sy *= s;
      }
    }
    bone.updateWorldTransformWith(bone.ax, bone.ay, bone.arotation + rotationIK * alpha, sx, sy, bone.ashearX, bone.ashearY);
  }
  /** Applies 2 bone IK. The target is specified in the world coordinate system.
   * @param child A direct descendant of the parent bone. */
  apply2(parent, child, targetX, targetY, bendDir, stretch, uniform, softness, alpha) {
    let px = parent.ax, py = parent.ay, psx = parent.ascaleX, psy = parent.ascaleY, sx = psx, sy = psy, csx = child.ascaleX;
    let os1 = 0, os2 = 0, s2 = 0;
    if (psx < 0) {
      psx = -psx;
      os1 = 180;
      s2 = -1;
    } else {
      os1 = 0;
      s2 = 1;
    }
    if (psy < 0) {
      psy = -psy;
      s2 = -s2;
    }
    if (csx < 0) {
      csx = -csx;
      os2 = 180;
    } else
      os2 = 0;
    let cx = child.ax, cy = 0, cwx = 0, cwy = 0, a = parent.a, b = parent.b, c = parent.c, d = parent.d;
    let u = Math.abs(psx - psy) <= 1e-4;
    if (!u || stretch) {
      cy = 0;
      cwx = a * cx + parent.worldX;
      cwy = c * cx + parent.worldY;
    } else {
      cy = child.ay;
      cwx = a * cx + b * cy + parent.worldX;
      cwy = c * cx + d * cy + parent.worldY;
    }
    let pp = parent.parent;
    a = pp.a;
    b = pp.b;
    c = pp.c;
    d = pp.d;
    let id = 1 / (a * d - b * c), x = cwx - pp.worldX, y = cwy - pp.worldY;
    let dx = (x * d - y * b) * id - px, dy = (y * a - x * c) * id - py;
    let l1 = Math.sqrt(dx * dx + dy * dy), l2 = child.data.length * csx, a1, a2;
    if (l1 < 1e-4) {
      this.apply1(parent, targetX, targetY, false, stretch, false, alpha);
      child.updateWorldTransformWith(cx, cy, 0, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
      return;
    }
    x = targetX - pp.worldX;
    y = targetY - pp.worldY;
    let tx = (x * d - y * b) * id - px, ty = (y * a - x * c) * id - py;
    let dd = tx * tx + ty * ty;
    if (softness != 0) {
      softness *= psx * (csx + 1) * 0.5;
      let td = Math.sqrt(dd), sd = td - l1 - l2 * psx + softness;
      if (sd > 0) {
        let p = Math.min(1, sd / (softness * 2)) - 1;
        p = (sd - softness * (1 - p * p)) / td;
        tx -= p * tx;
        ty -= p * ty;
        dd = tx * tx + ty * ty;
      }
    }
    outer: if (u) {
      l2 *= psx;
      let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      if (cos < -1) {
        cos = -1;
        a2 = Math.PI * bendDir;
      } else if (cos > 1) {
        cos = 1;
        a2 = 0;
        if (stretch) {
          a = (Math.sqrt(dd) / (l1 + l2) - 1) * alpha + 1;
          sx *= a;
          if (uniform)
            sy *= a;
        }
      } else
        a2 = Math.acos(cos) * bendDir;
      a = l1 + l2 * cos;
      b = l2 * Math.sin(a2);
      a1 = Math.atan2(ty * a - tx * b, tx * a + ty * b);
    } else {
      a = psx * l2;
      b = psy * l2;
      let aa = a * a, bb = b * b, ta = Math.atan2(ty, tx);
      c = bb * l1 * l1 + aa * dd - aa * bb;
      let c1 = -2 * bb * l1, c2 = bb - aa;
      d = c1 * c1 - 4 * c2 * c;
      if (d >= 0) {
        let q = Math.sqrt(d);
        if (c1 < 0)
          q = -q;
        q = -(c1 + q) * 0.5;
        let r0 = q / c2, r1 = c / q;
        let r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
        if (r * r <= dd) {
          y = Math.sqrt(dd - r * r) * bendDir;
          a1 = ta - Math.atan2(y, r);
          a2 = Math.atan2(y / psy, (r - l1) / psx);
          break outer;
        }
      }
      let minAngle = MathUtils.PI, minX = l1 - a, minDist = minX * minX, minY = 0;
      let maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
      c = -a * l1 / (aa - bb);
      if (c >= -1 && c <= 1) {
        c = Math.acos(c);
        x = a * Math.cos(c) + l1;
        y = b * Math.sin(c);
        d = x * x + y * y;
        if (d < minDist) {
          minAngle = c;
          minDist = d;
          minX = x;
          minY = y;
        }
        if (d > maxDist) {
          maxAngle = c;
          maxDist = d;
          maxX = x;
          maxY = y;
        }
      }
      if (dd <= (minDist + maxDist) * 0.5) {
        a1 = ta - Math.atan2(minY * bendDir, minX);
        a2 = minAngle * bendDir;
      } else {
        a1 = ta - Math.atan2(maxY * bendDir, maxX);
        a2 = maxAngle * bendDir;
      }
    }
    let os = Math.atan2(cy, cx) * s2;
    let rotation = parent.arotation;
    a1 = (a1 - os) * MathUtils.radDeg + os1 - rotation;
    if (a1 > 180)
      a1 -= 360;
    else if (a1 < -180)
      a1 += 360;
    parent.updateWorldTransformWith(px, py, rotation + a1 * alpha, sx, sy, 0, 0);
    rotation = child.arotation;
    a2 = ((a2 + os) * MathUtils.radDeg - child.ashearX) * s2 + os2 - rotation;
    if (a2 > 180)
      a2 -= 360;
    else if (a2 < -180)
      a2 += 360;
    child.updateWorldTransformWith(cx, cy, rotation + a2 * alpha, child.ascaleX, child.ascaleY, child.ashearX, child.ashearY);
  }
};

// node_modules/@esotericsoftware/spine-core/dist/IkConstraintData.js
var IkConstraintData = class extends ConstraintData {
  constructor(name) {
    super(name, 0, false);
    this.bones = new Array();
    this.target = null;
    this.bendDirection = 1;
    this.compress = false;
    this.stretch = false;
    this.uniform = false;
    this.mix = 1;
    this.softness = 0;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/PathConstraintData.js
var PathConstraintData = class extends ConstraintData {
  constructor(name) {
    super(name, 0, false);
    this.bones = new Array();
    this.target = null;
    this.positionMode = null;
    this.spacingMode = null;
    this.rotateMode = null;
    this.offsetRotation = 0;
    this.position = 0;
    this.spacing = 0;
    this.mixRotate = 0;
    this.mixX = 0;
    this.mixY = 0;
  }
};
var PositionMode;
(function(PositionMode2) {
  PositionMode2[PositionMode2["Fixed"] = 0] = "Fixed";
  PositionMode2[PositionMode2["Percent"] = 1] = "Percent";
})(PositionMode || (PositionMode = {}));
var SpacingMode;
(function(SpacingMode2) {
  SpacingMode2[SpacingMode2["Length"] = 0] = "Length";
  SpacingMode2[SpacingMode2["Fixed"] = 1] = "Fixed";
  SpacingMode2[SpacingMode2["Percent"] = 2] = "Percent";
  SpacingMode2[SpacingMode2["Proportional"] = 3] = "Proportional";
})(SpacingMode || (SpacingMode = {}));
var RotateMode;
(function(RotateMode2) {
  RotateMode2[RotateMode2["Tangent"] = 0] = "Tangent";
  RotateMode2[RotateMode2["Chain"] = 1] = "Chain";
  RotateMode2[RotateMode2["ChainScale"] = 2] = "ChainScale";
})(RotateMode || (RotateMode = {}));

// node_modules/@esotericsoftware/spine-core/dist/PathConstraint.js
var PathConstraint = class _PathConstraint {
  constructor(data2, skeleton) {
    this.data = null;
    this.bones = null;
    this.target = null;
    this.position = 0;
    this.spacing = 0;
    this.mixRotate = 0;
    this.mixX = 0;
    this.mixY = 0;
    this.spaces = new Array();
    this.positions = new Array();
    this.world = new Array();
    this.curves = new Array();
    this.lengths = new Array();
    this.segments = new Array();
    this.active = false;
    if (!data2)
      throw new Error("data cannot be null.");
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    this.data = data2;
    this.bones = new Array();
    for (let i = 0, n = data2.bones.length; i < n; i++)
      this.bones.push(skeleton.findBone(data2.bones[i].name));
    this.target = skeleton.findSlot(data2.target.name);
    this.position = data2.position;
    this.spacing = data2.spacing;
    this.mixRotate = data2.mixRotate;
    this.mixX = data2.mixX;
    this.mixY = data2.mixY;
  }
  isActive() {
    return this.active;
  }
  update() {
    let attachment = this.target.getAttachment();
    if (!(attachment instanceof PathAttachment))
      return;
    let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY;
    if (mixRotate == 0 && mixX == 0 && mixY == 0)
      return;
    let data2 = this.data;
    let tangents = data2.rotateMode == RotateMode.Tangent, scale = data2.rotateMode == RotateMode.ChainScale;
    let bones = this.bones;
    let boneCount = bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
    let spaces = Utils.setArraySize(this.spaces, spacesCount), lengths = scale ? this.lengths = Utils.setArraySize(this.lengths, boneCount) : null;
    let spacing = this.spacing;
    switch (data2.spacingMode) {
      case SpacingMode.Percent:
        if (scale) {
          for (let i = 0, n = spacesCount - 1; i < n; i++) {
            let bone = bones[i];
            let setupLength = bone.data.length;
            if (setupLength < _PathConstraint.epsilon)
              lengths[i] = 0;
            else {
              let x = setupLength * bone.a, y = setupLength * bone.c;
              lengths[i] = Math.sqrt(x * x + y * y);
            }
          }
        }
        Utils.arrayFill(spaces, 1, spacesCount, spacing);
        break;
      case SpacingMode.Proportional:
        let sum = 0;
        for (let i = 0, n = spacesCount - 1; i < n; ) {
          let bone = bones[i];
          let setupLength = bone.data.length;
          if (setupLength < _PathConstraint.epsilon) {
            if (scale)
              lengths[i] = 0;
            spaces[++i] = spacing;
          } else {
            let x = setupLength * bone.a, y = setupLength * bone.c;
            let length = Math.sqrt(x * x + y * y);
            if (scale)
              lengths[i] = length;
            spaces[++i] = length;
            sum += length;
          }
        }
        if (sum > 0) {
          sum = spacesCount / sum * spacing;
          for (let i = 1; i < spacesCount; i++)
            spaces[i] *= sum;
        }
        break;
      default:
        let lengthSpacing = data2.spacingMode == SpacingMode.Length;
        for (let i = 0, n = spacesCount - 1; i < n; ) {
          let bone = bones[i];
          let setupLength = bone.data.length;
          if (setupLength < _PathConstraint.epsilon) {
            if (scale)
              lengths[i] = 0;
            spaces[++i] = spacing;
          } else {
            let x = setupLength * bone.a, y = setupLength * bone.c;
            let length = Math.sqrt(x * x + y * y);
            if (scale)
              lengths[i] = length;
            spaces[++i] = (lengthSpacing ? setupLength + spacing : spacing) * length / setupLength;
          }
        }
    }
    let positions = this.computeWorldPositions(attachment, spacesCount, tangents);
    let boneX = positions[0], boneY = positions[1], offsetRotation = data2.offsetRotation;
    let tip = false;
    if (offsetRotation == 0)
      tip = data2.rotateMode == RotateMode.Chain;
    else {
      tip = false;
      let p = this.target.bone;
      offsetRotation *= p.a * p.d - p.b * p.c > 0 ? MathUtils.degRad : -MathUtils.degRad;
    }
    for (let i = 0, p = 3; i < boneCount; i++, p += 3) {
      let bone = bones[i];
      bone.worldX += (boneX - bone.worldX) * mixX;
      bone.worldY += (boneY - bone.worldY) * mixY;
      let x = positions[p], y = positions[p + 1], dx = x - boneX, dy = y - boneY;
      if (scale) {
        let length = lengths[i];
        if (length != 0) {
          let s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * mixRotate + 1;
          bone.a *= s;
          bone.c *= s;
        }
      }
      boneX = x;
      boneY = y;
      if (mixRotate > 0) {
        let a = bone.a, b = bone.b, c = bone.c, d = bone.d, r = 0, cos = 0, sin = 0;
        if (tangents)
          r = positions[p - 1];
        else if (spaces[i + 1] == 0)
          r = positions[p + 2];
        else
          r = Math.atan2(dy, dx);
        r -= Math.atan2(c, a);
        if (tip) {
          cos = Math.cos(r);
          sin = Math.sin(r);
          let length = bone.data.length;
          boneX += (length * (cos * a - sin * c) - dx) * mixRotate;
          boneY += (length * (sin * a + cos * c) - dy) * mixRotate;
        } else {
          r += offsetRotation;
        }
        if (r > MathUtils.PI)
          r -= MathUtils.PI2;
        else if (r < -MathUtils.PI)
          r += MathUtils.PI2;
        r *= mixRotate;
        cos = Math.cos(r);
        sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
      }
      bone.updateAppliedTransform();
    }
  }
  computeWorldPositions(path, spacesCount, tangents) {
    let target = this.target;
    let position = this.position;
    let spaces = this.spaces, out = Utils.setArraySize(this.positions, spacesCount * 3 + 2), world = null;
    let closed2 = path.closed;
    let verticesLength = path.worldVerticesLength, curveCount = verticesLength / 6, prevCurve = _PathConstraint.NONE;
    if (!path.constantSpeed) {
      let lengths = path.lengths;
      curveCount -= closed2 ? 1 : 2;
      let pathLength2 = lengths[curveCount];
      if (this.data.positionMode == PositionMode.Percent)
        position *= pathLength2;
      let multiplier2;
      switch (this.data.spacingMode) {
        case SpacingMode.Percent:
          multiplier2 = pathLength2;
          break;
        case SpacingMode.Proportional:
          multiplier2 = pathLength2 / spacesCount;
          break;
        default:
          multiplier2 = 1;
      }
      world = Utils.setArraySize(this.world, 8);
      for (let i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
        let space = spaces[i] * multiplier2;
        position += space;
        let p = position;
        if (closed2) {
          p %= pathLength2;
          if (p < 0)
            p += pathLength2;
          curve = 0;
        } else if (p < 0) {
          if (prevCurve != _PathConstraint.BEFORE) {
            prevCurve = _PathConstraint.BEFORE;
            path.computeWorldVertices(target, 2, 4, world, 0, 2);
          }
          this.addBeforePosition(p, world, 0, out, o);
          continue;
        } else if (p > pathLength2) {
          if (prevCurve != _PathConstraint.AFTER) {
            prevCurve = _PathConstraint.AFTER;
            path.computeWorldVertices(target, verticesLength - 6, 4, world, 0, 2);
          }
          this.addAfterPosition(p - pathLength2, world, 0, out, o);
          continue;
        }
        for (; ; curve++) {
          let length = lengths[curve];
          if (p > length)
            continue;
          if (curve == 0)
            p /= length;
          else {
            let prev = lengths[curve - 1];
            p = (p - prev) / (length - prev);
          }
          break;
        }
        if (curve != prevCurve) {
          prevCurve = curve;
          if (closed2 && curve == curveCount) {
            path.computeWorldVertices(target, verticesLength - 4, 4, world, 0, 2);
            path.computeWorldVertices(target, 0, 4, world, 4, 2);
          } else
            path.computeWorldVertices(target, curve * 6 + 2, 8, world, 0, 2);
        }
        this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || i > 0 && space == 0);
      }
      return out;
    }
    if (closed2) {
      verticesLength += 2;
      world = Utils.setArraySize(this.world, verticesLength);
      path.computeWorldVertices(target, 2, verticesLength - 4, world, 0, 2);
      path.computeWorldVertices(target, 0, 2, world, verticesLength - 4, 2);
      world[verticesLength - 2] = world[0];
      world[verticesLength - 1] = world[1];
    } else {
      curveCount--;
      verticesLength -= 4;
      world = Utils.setArraySize(this.world, verticesLength);
      path.computeWorldVertices(target, 2, verticesLength, world, 0, 2);
    }
    let curves = Utils.setArraySize(this.curves, curveCount);
    let pathLength = 0;
    let x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
    let tmpx = 0, tmpy = 0, dddfx = 0, dddfy = 0, ddfx = 0, ddfy = 0, dfx = 0, dfy = 0;
    for (let i = 0, w = 2; i < curveCount; i++, w += 6) {
      cx1 = world[w];
      cy1 = world[w + 1];
      cx2 = world[w + 2];
      cy2 = world[w + 3];
      x2 = world[w + 4];
      y2 = world[w + 5];
      tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
      tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
      dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
      dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
      ddfx = tmpx * 2 + dddfx;
      ddfy = tmpy * 2 + dddfy;
      dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
      dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx;
      dfy += ddfy;
      ddfx += dddfx;
      ddfy += dddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx;
      dfy += ddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      dfx += ddfx + dddfx;
      dfy += ddfy + dddfy;
      pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
      curves[i] = pathLength;
      x1 = x2;
      y1 = y2;
    }
    if (this.data.positionMode == PositionMode.Percent)
      position *= pathLength;
    let multiplier;
    switch (this.data.spacingMode) {
      case SpacingMode.Percent:
        multiplier = pathLength;
        break;
      case SpacingMode.Proportional:
        multiplier = pathLength / spacesCount;
        break;
      default:
        multiplier = 1;
    }
    let segments = this.segments;
    let curveLength = 0;
    for (let i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
      let space = spaces[i] * multiplier;
      position += space;
      let p = position;
      if (closed2) {
        p %= pathLength;
        if (p < 0)
          p += pathLength;
        curve = 0;
      } else if (p < 0) {
        this.addBeforePosition(p, world, 0, out, o);
        continue;
      } else if (p > pathLength) {
        this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
        continue;
      }
      for (; ; curve++) {
        let length = curves[curve];
        if (p > length)
          continue;
        if (curve == 0)
          p /= length;
        else {
          let prev = curves[curve - 1];
          p = (p - prev) / (length - prev);
        }
        break;
      }
      if (curve != prevCurve) {
        prevCurve = curve;
        let ii = curve * 6;
        x1 = world[ii];
        y1 = world[ii + 1];
        cx1 = world[ii + 2];
        cy1 = world[ii + 3];
        cx2 = world[ii + 4];
        cy2 = world[ii + 5];
        x2 = world[ii + 6];
        y2 = world[ii + 7];
        tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
        tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
        dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 6e-3;
        dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 6e-3;
        ddfx = tmpx * 2 + dddfx;
        ddfy = tmpy * 2 + dddfy;
        dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
        dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
        curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
        segments[0] = curveLength;
        for (ii = 1; ii < 8; ii++) {
          dfx += ddfx;
          dfy += ddfy;
          ddfx += dddfx;
          ddfy += dddfy;
          curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
          segments[ii] = curveLength;
        }
        dfx += ddfx;
        dfy += ddfy;
        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
        segments[8] = curveLength;
        dfx += ddfx + dddfx;
        dfy += ddfy + dddfy;
        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
        segments[9] = curveLength;
        segment = 0;
      }
      p *= curveLength;
      for (; ; segment++) {
        let length = segments[segment];
        if (p > length)
          continue;
        if (segment == 0)
          p /= length;
        else {
          let prev = segments[segment - 1];
          p = segment + (p - prev) / (length - prev);
        }
        break;
      }
      this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || i > 0 && space == 0);
    }
    return out;
  }
  addBeforePosition(p, temp, i, out, o) {
    let x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
    out[o] = x1 + p * Math.cos(r);
    out[o + 1] = y1 + p * Math.sin(r);
    out[o + 2] = r;
  }
  addAfterPosition(p, temp, i, out, o) {
    let x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
    out[o] = x1 + p * Math.cos(r);
    out[o + 1] = y1 + p * Math.sin(r);
    out[o + 2] = r;
  }
  addCurvePosition(p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
    if (p == 0 || isNaN(p)) {
      out[o] = x1;
      out[o + 1] = y1;
      out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
      return;
    }
    let tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
    let ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
    let x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
    out[o] = x;
    out[o + 1] = y;
    if (tangents) {
      if (p < 1e-3)
        out[o + 2] = Math.atan2(cy1 - y1, cx1 - x1);
      else
        out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
    }
  }
};
PathConstraint.NONE = -1;
PathConstraint.BEFORE = -2;
PathConstraint.AFTER = -3;
PathConstraint.epsilon = 1e-5;

// node_modules/@esotericsoftware/spine-core/dist/Slot.js
var Slot = class {
  constructor(data2, bone) {
    this.data = null;
    this.bone = null;
    this.color = null;
    this.darkColor = null;
    this.attachment = null;
    this.attachmentTime = 0;
    this.attachmentState = 0;
    this.deform = new Array();
    if (!data2)
      throw new Error("data cannot be null.");
    if (!bone)
      throw new Error("bone cannot be null.");
    this.data = data2;
    this.bone = bone;
    this.color = new Color();
    this.darkColor = !data2.darkColor ? null : new Color();
    this.setToSetupPose();
  }
  /** The skeleton this slot belongs to. */
  getSkeleton() {
    return this.bone.skeleton;
  }
  /** The current attachment for the slot, or null if the slot has no attachment. */
  getAttachment() {
    return this.attachment;
  }
  /** Sets the slot's attachment and, if the attachment changed, resets {@link #attachmentTime} and clears the {@link #deform}.
   * The deform is not cleared if the old attachment has the same {@link VertexAttachment#getDeformAttachment()} as the specified
   * attachment.
   * @param attachment May be null. */
  setAttachment(attachment) {
    if (this.attachment == attachment)
      return;
    if (!(attachment instanceof VertexAttachment) || !(this.attachment instanceof VertexAttachment) || attachment.deformAttachment != this.attachment.deformAttachment) {
      this.deform.length = 0;
    }
    this.attachment = attachment;
    this.attachmentTime = this.bone.skeleton.time;
  }
  setAttachmentTime(time) {
    this.attachmentTime = this.bone.skeleton.time - time;
  }
  /** The time that has elapsed since the last time the attachment was set or cleared. Relies on Skeleton
   * {@link Skeleton#time}. */
  getAttachmentTime() {
    return this.bone.skeleton.time - this.attachmentTime;
  }
  /** Sets this slot to the setup pose. */
  setToSetupPose() {
    this.color.setFromColor(this.data.color);
    if (this.darkColor)
      this.darkColor.setFromColor(this.data.darkColor);
    if (!this.data.attachmentName)
      this.attachment = null;
    else {
      this.attachment = null;
      this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
    }
  }
};

// node_modules/@esotericsoftware/spine-core/dist/TransformConstraint.js
var TransformConstraint = class {
  constructor(data2, skeleton) {
    this.data = null;
    this.bones = null;
    this.target = null;
    this.mixRotate = 0;
    this.mixX = 0;
    this.mixY = 0;
    this.mixScaleX = 0;
    this.mixScaleY = 0;
    this.mixShearY = 0;
    this.temp = new Vector2();
    this.active = false;
    if (!data2)
      throw new Error("data cannot be null.");
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    this.data = data2;
    this.mixRotate = data2.mixRotate;
    this.mixX = data2.mixX;
    this.mixY = data2.mixY;
    this.mixScaleX = data2.mixScaleX;
    this.mixScaleY = data2.mixScaleY;
    this.mixShearY = data2.mixShearY;
    this.bones = new Array();
    for (let i = 0; i < data2.bones.length; i++)
      this.bones.push(skeleton.findBone(data2.bones[i].name));
    this.target = skeleton.findBone(data2.target.name);
  }
  isActive() {
    return this.active;
  }
  update() {
    if (this.mixRotate == 0 && this.mixX == 0 && this.mixY == 0 && this.mixScaleX == 0 && this.mixScaleX == 0 && this.mixShearY == 0)
      return;
    if (this.data.local) {
      if (this.data.relative)
        this.applyRelativeLocal();
      else
        this.applyAbsoluteLocal();
    } else {
      if (this.data.relative)
        this.applyRelativeWorld();
      else
        this.applyAbsoluteWorld();
    }
  }
  applyAbsoluteWorld() {
    let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
    let translate = mixX != 0 || mixY != 0;
    let target = this.target;
    let ta = target.a, tb = target.b, tc = target.c, td = target.d;
    let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
    let offsetRotation = this.data.offsetRotation * degRadReflect;
    let offsetShearY = this.data.offsetShearY * degRadReflect;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (mixRotate != 0) {
        let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
        let r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
        if (r > MathUtils.PI)
          r -= MathUtils.PI2;
        else if (r < -MathUtils.PI)
          r += MathUtils.PI2;
        r *= mixRotate;
        let cos = Math.cos(r), sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
      }
      if (translate) {
        let temp = this.temp;
        target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
        bone.worldX += (temp.x - bone.worldX) * mixX;
        bone.worldY += (temp.y - bone.worldY) * mixY;
      }
      if (mixScaleX != 0) {
        let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
        if (s != 0)
          s = (s + (Math.sqrt(ta * ta + tc * tc) - s + this.data.offsetScaleX) * mixScaleX) / s;
        bone.a *= s;
        bone.c *= s;
      }
      if (mixScaleY != 0) {
        let s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
        if (s != 0)
          s = (s + (Math.sqrt(tb * tb + td * td) - s + this.data.offsetScaleY) * mixScaleY) / s;
        bone.b *= s;
        bone.d *= s;
      }
      if (mixShearY > 0) {
        let b = bone.b, d = bone.d;
        let by = Math.atan2(d, b);
        let r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
        if (r > MathUtils.PI)
          r -= MathUtils.PI2;
        else if (r < -MathUtils.PI)
          r += MathUtils.PI2;
        r = by + (r + offsetShearY) * mixShearY;
        let s = Math.sqrt(b * b + d * d);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
      }
      bone.updateAppliedTransform();
    }
  }
  applyRelativeWorld() {
    let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
    let translate = mixX != 0 || mixY != 0;
    let target = this.target;
    let ta = target.a, tb = target.b, tc = target.c, td = target.d;
    let degRadReflect = ta * td - tb * tc > 0 ? MathUtils.degRad : -MathUtils.degRad;
    let offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (mixRotate != 0) {
        let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
        let r = Math.atan2(tc, ta) + offsetRotation;
        if (r > MathUtils.PI)
          r -= MathUtils.PI2;
        else if (r < -MathUtils.PI)
          r += MathUtils.PI2;
        r *= mixRotate;
        let cos = Math.cos(r), sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * d;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * d;
      }
      if (translate) {
        let temp = this.temp;
        target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
        bone.worldX += temp.x * mixX;
        bone.worldY += temp.y * mixY;
      }
      if (mixScaleX != 0) {
        let s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * mixScaleX + 1;
        bone.a *= s;
        bone.c *= s;
      }
      if (mixScaleY != 0) {
        let s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * mixScaleY + 1;
        bone.b *= s;
        bone.d *= s;
      }
      if (mixShearY > 0) {
        let r = Math.atan2(td, tb) - Math.atan2(tc, ta);
        if (r > MathUtils.PI)
          r -= MathUtils.PI2;
        else if (r < -MathUtils.PI)
          r += MathUtils.PI2;
        let b = bone.b, d = bone.d;
        r = Math.atan2(d, b) + (r - MathUtils.PI / 2 + offsetShearY) * mixShearY;
        let s = Math.sqrt(b * b + d * d);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
      }
      bone.updateAppliedTransform();
    }
  }
  applyAbsoluteLocal() {
    let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
    let target = this.target;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      let rotation = bone.arotation;
      if (mixRotate != 0) {
        let r = target.arotation - rotation + this.data.offsetRotation;
        r -= (16384 - (16384.499999999996 - r / 360 | 0)) * 360;
        rotation += r * mixRotate;
      }
      let x = bone.ax, y = bone.ay;
      x += (target.ax - x + this.data.offsetX) * mixX;
      y += (target.ay - y + this.data.offsetY) * mixY;
      let scaleX = bone.ascaleX, scaleY = bone.ascaleY;
      if (mixScaleX != 0 && scaleX != 0)
        scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * mixScaleX) / scaleX;
      if (mixScaleY != 0 && scaleY != 0)
        scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * mixScaleY) / scaleY;
      let shearY = bone.ashearY;
      if (mixShearY != 0) {
        let r = target.ashearY - shearY + this.data.offsetShearY;
        r -= (16384 - (16384.499999999996 - r / 360 | 0)) * 360;
        shearY += r * mixShearY;
      }
      bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
  }
  applyRelativeLocal() {
    let mixRotate = this.mixRotate, mixX = this.mixX, mixY = this.mixY, mixScaleX = this.mixScaleX, mixScaleY = this.mixScaleY, mixShearY = this.mixShearY;
    let target = this.target;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      let rotation = bone.arotation + (target.arotation + this.data.offsetRotation) * mixRotate;
      let x = bone.ax + (target.ax + this.data.offsetX) * mixX;
      let y = bone.ay + (target.ay + this.data.offsetY) * mixY;
      let scaleX = bone.ascaleX * ((target.ascaleX - 1 + this.data.offsetScaleX) * mixScaleX + 1);
      let scaleY = bone.ascaleY * ((target.ascaleY - 1 + this.data.offsetScaleY) * mixScaleY + 1);
      let shearY = bone.ashearY + (target.ashearY + this.data.offsetShearY) * mixShearY;
      bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
    }
  }
};

// node_modules/@esotericsoftware/spine-core/dist/Skeleton.js
var Skeleton = class {
  constructor(data2) {
    this.data = null;
    this.bones = null;
    this.slots = null;
    this.drawOrder = null;
    this.ikConstraints = null;
    this.transformConstraints = null;
    this.pathConstraints = null;
    this._updateCache = new Array();
    this.skin = null;
    this.color = null;
    this.time = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.x = 0;
    this.y = 0;
    if (!data2)
      throw new Error("data cannot be null.");
    this.data = data2;
    this.bones = new Array();
    for (let i = 0; i < data2.bones.length; i++) {
      let boneData = data2.bones[i];
      let bone;
      if (!boneData.parent)
        bone = new Bone(boneData, this, null);
      else {
        let parent = this.bones[boneData.parent.index];
        bone = new Bone(boneData, this, parent);
        parent.children.push(bone);
      }
      this.bones.push(bone);
    }
    this.slots = new Array();
    this.drawOrder = new Array();
    for (let i = 0; i < data2.slots.length; i++) {
      let slotData = data2.slots[i];
      let bone = this.bones[slotData.boneData.index];
      let slot = new Slot(slotData, bone);
      this.slots.push(slot);
      this.drawOrder.push(slot);
    }
    this.ikConstraints = new Array();
    for (let i = 0; i < data2.ikConstraints.length; i++) {
      let ikConstraintData = data2.ikConstraints[i];
      this.ikConstraints.push(new IkConstraint(ikConstraintData, this));
    }
    this.transformConstraints = new Array();
    for (let i = 0; i < data2.transformConstraints.length; i++) {
      let transformConstraintData = data2.transformConstraints[i];
      this.transformConstraints.push(new TransformConstraint(transformConstraintData, this));
    }
    this.pathConstraints = new Array();
    for (let i = 0; i < data2.pathConstraints.length; i++) {
      let pathConstraintData = data2.pathConstraints[i];
      this.pathConstraints.push(new PathConstraint(pathConstraintData, this));
    }
    this.color = new Color(1, 1, 1, 1);
    this.updateCache();
  }
  /** Caches information about bones and constraints. Must be called if the {@link #getSkin()} is modified or if bones,
   * constraints, or weighted path attachments are added or removed. */
  updateCache() {
    let updateCache = this._updateCache;
    updateCache.length = 0;
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      bone.sorted = bone.data.skinRequired;
      bone.active = !bone.sorted;
    }
    if (this.skin) {
      let skinBones = this.skin.bones;
      for (let i = 0, n = this.skin.bones.length; i < n; i++) {
        let bone = this.bones[skinBones[i].index];
        do {
          bone.sorted = false;
          bone.active = true;
          bone = bone.parent;
        } while (bone);
      }
    }
    let ikConstraints = this.ikConstraints;
    let transformConstraints = this.transformConstraints;
    let pathConstraints = this.pathConstraints;
    let ikCount = ikConstraints.length, transformCount = transformConstraints.length, pathCount = pathConstraints.length;
    let constraintCount = ikCount + transformCount + pathCount;
    outer: for (let i = 0; i < constraintCount; i++) {
      for (let ii = 0; ii < ikCount; ii++) {
        let constraint = ikConstraints[ii];
        if (constraint.data.order == i) {
          this.sortIkConstraint(constraint);
          continue outer;
        }
      }
      for (let ii = 0; ii < transformCount; ii++) {
        let constraint = transformConstraints[ii];
        if (constraint.data.order == i) {
          this.sortTransformConstraint(constraint);
          continue outer;
        }
      }
      for (let ii = 0; ii < pathCount; ii++) {
        let constraint = pathConstraints[ii];
        if (constraint.data.order == i) {
          this.sortPathConstraint(constraint);
          continue outer;
        }
      }
    }
    for (let i = 0, n = bones.length; i < n; i++)
      this.sortBone(bones[i]);
  }
  sortIkConstraint(constraint) {
    constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || this.skin && Utils.contains(this.skin.constraints, constraint.data, true));
    if (!constraint.active)
      return;
    let target = constraint.target;
    this.sortBone(target);
    let constrained = constraint.bones;
    let parent = constrained[0];
    this.sortBone(parent);
    if (constrained.length == 1) {
      this._updateCache.push(constraint);
      this.sortReset(parent.children);
    } else {
      let child = constrained[constrained.length - 1];
      this.sortBone(child);
      this._updateCache.push(constraint);
      this.sortReset(parent.children);
      child.sorted = true;
    }
  }
  sortPathConstraint(constraint) {
    constraint.active = constraint.target.bone.isActive() && (!constraint.data.skinRequired || this.skin && Utils.contains(this.skin.constraints, constraint.data, true));
    if (!constraint.active)
      return;
    let slot = constraint.target;
    let slotIndex = slot.data.index;
    let slotBone = slot.bone;
    if (this.skin)
      this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
    if (this.data.defaultSkin && this.data.defaultSkin != this.skin)
      this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
    for (let i = 0, n = this.data.skins.length; i < n; i++)
      this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);
    let attachment = slot.getAttachment();
    if (attachment instanceof PathAttachment)
      this.sortPathConstraintAttachmentWith(attachment, slotBone);
    let constrained = constraint.bones;
    let boneCount = constrained.length;
    for (let i = 0; i < boneCount; i++)
      this.sortBone(constrained[i]);
    this._updateCache.push(constraint);
    for (let i = 0; i < boneCount; i++)
      this.sortReset(constrained[i].children);
    for (let i = 0; i < boneCount; i++)
      constrained[i].sorted = true;
  }
  sortTransformConstraint(constraint) {
    constraint.active = constraint.target.isActive() && (!constraint.data.skinRequired || this.skin && Utils.contains(this.skin.constraints, constraint.data, true));
    if (!constraint.active)
      return;
    this.sortBone(constraint.target);
    let constrained = constraint.bones;
    let boneCount = constrained.length;
    if (constraint.data.local) {
      for (let i = 0; i < boneCount; i++) {
        let child = constrained[i];
        this.sortBone(child.parent);
        this.sortBone(child);
      }
    } else {
      for (let i = 0; i < boneCount; i++) {
        this.sortBone(constrained[i]);
      }
    }
    this._updateCache.push(constraint);
    for (let i = 0; i < boneCount; i++)
      this.sortReset(constrained[i].children);
    for (let i = 0; i < boneCount; i++)
      constrained[i].sorted = true;
  }
  sortPathConstraintAttachment(skin, slotIndex, slotBone) {
    let attachments = skin.attachments[slotIndex];
    if (!attachments)
      return;
    for (let key in attachments) {
      this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
    }
  }
  sortPathConstraintAttachmentWith(attachment, slotBone) {
    if (!(attachment instanceof PathAttachment))
      return;
    let pathBones = attachment.bones;
    if (!pathBones)
      this.sortBone(slotBone);
    else {
      let bones = this.bones;
      for (let i = 0, n = pathBones.length; i < n; ) {
        let nn = pathBones[i++];
        nn += i;
        while (i < nn)
          this.sortBone(bones[pathBones[i++]]);
      }
    }
  }
  sortBone(bone) {
    if (bone.sorted)
      return;
    let parent = bone.parent;
    if (parent)
      this.sortBone(parent);
    bone.sorted = true;
    this._updateCache.push(bone);
  }
  sortReset(bones) {
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (!bone.active)
        continue;
      if (bone.sorted)
        this.sortReset(bone.children);
      bone.sorted = false;
    }
  }
  /** Updates the world transform for each bone and applies all constraints.
   *
   * See [World transforms](http://esotericsoftware.com/spine-runtime-skeletons#World-transforms) in the Spine
   * Runtimes Guide. */
  updateWorldTransform() {
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      bone.ax = bone.x;
      bone.ay = bone.y;
      bone.arotation = bone.rotation;
      bone.ascaleX = bone.scaleX;
      bone.ascaleY = bone.scaleY;
      bone.ashearX = bone.shearX;
      bone.ashearY = bone.shearY;
    }
    let updateCache = this._updateCache;
    for (let i = 0, n = updateCache.length; i < n; i++)
      updateCache[i].update();
  }
  updateWorldTransformWith(parent) {
    let rootBone = this.getRootBone();
    let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
    rootBone.worldX = pa * this.x + pb * this.y + parent.worldX;
    rootBone.worldY = pc * this.x + pd * this.y + parent.worldY;
    let rotationY = rootBone.rotation + 90 + rootBone.shearY;
    let la = MathUtils.cosDeg(rootBone.rotation + rootBone.shearX) * rootBone.scaleX;
    let lb = MathUtils.cosDeg(rotationY) * rootBone.scaleY;
    let lc = MathUtils.sinDeg(rootBone.rotation + rootBone.shearX) * rootBone.scaleX;
    let ld = MathUtils.sinDeg(rotationY) * rootBone.scaleY;
    rootBone.a = (pa * la + pb * lc) * this.scaleX;
    rootBone.b = (pa * lb + pb * ld) * this.scaleX;
    rootBone.c = (pc * la + pd * lc) * this.scaleY;
    rootBone.d = (pc * lb + pd * ld) * this.scaleY;
    let updateCache = this._updateCache;
    for (let i = 0, n = updateCache.length; i < n; i++) {
      let updatable = updateCache[i];
      if (updatable != rootBone)
        updatable.update();
    }
  }
  /** Sets the bones, constraints, and slots to their setup pose values. */
  setToSetupPose() {
    this.setBonesToSetupPose();
    this.setSlotsToSetupPose();
  }
  /** Sets the bones and constraints to their setup pose values. */
  setBonesToSetupPose() {
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++)
      bones[i].setToSetupPose();
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let constraint = ikConstraints[i];
      constraint.mix = constraint.data.mix;
      constraint.softness = constraint.data.softness;
      constraint.bendDirection = constraint.data.bendDirection;
      constraint.compress = constraint.data.compress;
      constraint.stretch = constraint.data.stretch;
    }
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      let data2 = constraint.data;
      constraint.mixRotate = data2.mixRotate;
      constraint.mixX = data2.mixX;
      constraint.mixY = data2.mixY;
      constraint.mixScaleX = data2.mixScaleX;
      constraint.mixScaleY = data2.mixScaleY;
      constraint.mixShearY = data2.mixShearY;
    }
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      let data2 = constraint.data;
      constraint.position = data2.position;
      constraint.spacing = data2.spacing;
      constraint.mixRotate = data2.mixRotate;
      constraint.mixX = data2.mixX;
      constraint.mixY = data2.mixY;
    }
  }
  /** Sets the slots and draw order to their setup pose values. */
  setSlotsToSetupPose() {
    let slots = this.slots;
    Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
    for (let i = 0, n = slots.length; i < n; i++)
      slots[i].setToSetupPose();
  }
  /** @returns May return null. */
  getRootBone() {
    if (this.bones.length == 0)
      return null;
    return this.bones[0];
  }
  /** @returns May be null. */
  findBone(boneName) {
    if (!boneName)
      throw new Error("boneName cannot be null.");
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (bone.data.name == boneName)
        return bone;
    }
    return null;
  }
  /** Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
   * repeatedly.
   * @returns May be null. */
  findSlot(slotName) {
    if (!slotName)
      throw new Error("slotName cannot be null.");
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.data.name == slotName)
        return slot;
    }
    return null;
  }
  /** Sets a skin by name.
   *
   * See {@link #setSkin()}. */
  setSkinByName(skinName) {
    let skin = this.data.findSkin(skinName);
    if (!skin)
      throw new Error("Skin not found: " + skinName);
    this.setSkin(skin);
  }
  /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#defaultSkin default skin}. If the
   * skin is changed, {@link #updateCache()} is called.
   *
   * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
   * old skin, each slot's setup mode attachment is attached from the new skin.
   *
   * After changing the skin, the visible attachments can be reset to those attached in the setup pose by calling
   * {@link #setSlotsToSetupPose()}. Also, often {@link AnimationState#apply()} is called before the next time the
   * skeleton is rendered to allow any attachment keys in the current animation(s) to hide or show attachments from the new skin.
   * @param newSkin May be null. */
  setSkin(newSkin) {
    if (newSkin == this.skin)
      return;
    if (newSkin) {
      if (this.skin)
        newSkin.attachAll(this, this.skin);
      else {
        let slots = this.slots;
        for (let i = 0, n = slots.length; i < n; i++) {
          let slot = slots[i];
          let name = slot.data.attachmentName;
          if (name) {
            let attachment = newSkin.getAttachment(i, name);
            if (attachment)
              slot.setAttachment(attachment);
          }
        }
      }
    }
    this.skin = newSkin;
    this.updateCache();
  }
  /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot name and attachment
   * name.
   *
   * See {@link #getAttachment()}.
   * @returns May be null. */
  getAttachmentByName(slotName, attachmentName) {
    return this.getAttachment(this.data.findSlot(slotName).index, attachmentName);
  }
  /** Finds an attachment by looking in the {@link #skin} and {@link SkeletonData#defaultSkin} using the slot index and
   * attachment name. First the skin is checked and if the attachment was not found, the default skin is checked.
   *
   * See [Runtime skins](http://esotericsoftware.com/spine-runtime-skins) in the Spine Runtimes Guide.
   * @returns May be null. */
  getAttachment(slotIndex, attachmentName) {
    if (!attachmentName)
      throw new Error("attachmentName cannot be null.");
    if (this.skin) {
      let attachment = this.skin.getAttachment(slotIndex, attachmentName);
      if (attachment)
        return attachment;
    }
    if (this.data.defaultSkin)
      return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
    return null;
  }
  /** A convenience method to set an attachment by finding the slot with {@link #findSlot()}, finding the attachment with
   * {@link #getAttachment()}, then setting the slot's {@link Slot#attachment}.
   * @param attachmentName May be null to clear the slot's attachment. */
  setAttachment(slotName, attachmentName) {
    if (!slotName)
      throw new Error("slotName cannot be null.");
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.data.name == slotName) {
        let attachment = null;
        if (attachmentName) {
          attachment = this.getAttachment(i, attachmentName);
          if (!attachment)
            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
        }
        slot.setAttachment(attachment);
        return;
      }
    }
    throw new Error("Slot not found: " + slotName);
  }
  /** Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
   * than to call it repeatedly.
   * @return May be null. */
  findIkConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let ikConstraint = ikConstraints[i];
      if (ikConstraint.data.name == constraintName)
        return ikConstraint;
    }
    return null;
  }
  /** Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
   * this method than to call it repeatedly.
   * @return May be null. */
  findTransformConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      if (constraint.data.name == constraintName)
        return constraint;
    }
    return null;
  }
  /** Finds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
   * than to call it repeatedly.
   * @return May be null. */
  findPathConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      if (constraint.data.name == constraintName)
        return constraint;
    }
    return null;
  }
  /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose as `{ x: number, y: number, width: number, height: number }`.
   * Note that this method will create temporary objects which can add to garbage collection pressure. Use `getBounds()` if garbage collection is a concern. */
  getBoundsRect() {
    let offset = new Vector2();
    let size = new Vector2();
    this.getBounds(offset, size);
    return { x: offset.x, y: offset.y, width: size.x, height: size.y };
  }
  /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
   * @param offset An output value, the distance from the skeleton origin to the bottom left corner of the AABB.
   * @param size An output value, the width and height of the AABB.
   * @param temp Working memory to temporarily store attachments' computed world vertices. */
  getBounds(offset, size, temp = new Array(2)) {
    if (!offset)
      throw new Error("offset cannot be null.");
    if (!size)
      throw new Error("size cannot be null.");
    let drawOrder = this.drawOrder;
    let minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
    for (let i = 0, n = drawOrder.length; i < n; i++) {
      let slot = drawOrder[i];
      if (!slot.bone.active)
        continue;
      let verticesLength = 0;
      let vertices = null;
      let attachment = slot.getAttachment();
      if (attachment instanceof RegionAttachment) {
        verticesLength = 8;
        vertices = Utils.setArraySize(temp, verticesLength, 0);
        attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
      } else if (attachment instanceof MeshAttachment) {
        let mesh = attachment;
        verticesLength = mesh.worldVerticesLength;
        vertices = Utils.setArraySize(temp, verticesLength, 0);
        mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
      }
      if (vertices) {
        for (let ii = 0, nn = vertices.length; ii < nn; ii += 2) {
          let x = vertices[ii], y = vertices[ii + 1];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    offset.set(minX, minY);
    size.set(maxX - minX, maxY - minY);
  }
  /** Increments the skeleton's {@link #time}. */
  update(delta) {
    this.time += delta;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/SkeletonData.js
var SkeletonData = class {
  constructor() {
    this.name = null;
    this.bones = new Array();
    this.slots = new Array();
    this.skins = new Array();
    this.defaultSkin = null;
    this.events = new Array();
    this.animations = new Array();
    this.ikConstraints = new Array();
    this.transformConstraints = new Array();
    this.pathConstraints = new Array();
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.version = null;
    this.hash = null;
    this.fps = 0;
    this.imagesPath = null;
    this.audioPath = null;
  }
  /** Finds a bone by comparing each bone's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   * @returns May be null. */
  findBone(boneName) {
    if (!boneName)
      throw new Error("boneName cannot be null.");
    let bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      let bone = bones[i];
      if (bone.name == boneName)
        return bone;
    }
    return null;
  }
  /** Finds a slot by comparing each slot's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   * @returns May be null. */
  findSlot(slotName) {
    if (!slotName)
      throw new Error("slotName cannot be null.");
    let slots = this.slots;
    for (let i = 0, n = slots.length; i < n; i++) {
      let slot = slots[i];
      if (slot.name == slotName)
        return slot;
    }
    return null;
  }
  /** Finds a skin by comparing each skin's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   * @returns May be null. */
  findSkin(skinName) {
    if (!skinName)
      throw new Error("skinName cannot be null.");
    let skins = this.skins;
    for (let i = 0, n = skins.length; i < n; i++) {
      let skin = skins[i];
      if (skin.name == skinName)
        return skin;
    }
    return null;
  }
  /** Finds an event by comparing each events's name. It is more efficient to cache the results of this method than to call it
   * multiple times.
   * @returns May be null. */
  findEvent(eventDataName) {
    if (!eventDataName)
      throw new Error("eventDataName cannot be null.");
    let events = this.events;
    for (let i = 0, n = events.length; i < n; i++) {
      let event = events[i];
      if (event.name == eventDataName)
        return event;
    }
    return null;
  }
  /** Finds an animation by comparing each animation's name. It is more efficient to cache the results of this method than to
   * call it multiple times.
   * @returns May be null. */
  findAnimation(animationName) {
    if (!animationName)
      throw new Error("animationName cannot be null.");
    let animations = this.animations;
    for (let i = 0, n = animations.length; i < n; i++) {
      let animation = animations[i];
      if (animation.name == animationName)
        return animation;
    }
    return null;
  }
  /** Finds an IK constraint by comparing each IK constraint's name. It is more efficient to cache the results of this method
   * than to call it multiple times.
   * @return May be null. */
  findIkConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let ikConstraints = this.ikConstraints;
    for (let i = 0, n = ikConstraints.length; i < n; i++) {
      let constraint = ikConstraints[i];
      if (constraint.name == constraintName)
        return constraint;
    }
    return null;
  }
  /** Finds a transform constraint by comparing each transform constraint's name. It is more efficient to cache the results of
   * this method than to call it multiple times.
   * @return May be null. */
  findTransformConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let transformConstraints = this.transformConstraints;
    for (let i = 0, n = transformConstraints.length; i < n; i++) {
      let constraint = transformConstraints[i];
      if (constraint.name == constraintName)
        return constraint;
    }
    return null;
  }
  /** Finds a path constraint by comparing each path constraint's name. It is more efficient to cache the results of this method
   * than to call it multiple times.
   * @return May be null. */
  findPathConstraint(constraintName) {
    if (!constraintName)
      throw new Error("constraintName cannot be null.");
    let pathConstraints = this.pathConstraints;
    for (let i = 0, n = pathConstraints.length; i < n; i++) {
      let constraint = pathConstraints[i];
      if (constraint.name == constraintName)
        return constraint;
    }
    return null;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/Skin.js
var SkinEntry = class {
  constructor(slotIndex = 0, name = null, attachment = null) {
    this.slotIndex = slotIndex;
    this.name = name;
    this.attachment = attachment;
  }
};
var Skin = class {
  constructor(name) {
    this.name = null;
    this.attachments = new Array();
    this.bones = Array();
    this.constraints = new Array();
    if (!name)
      throw new Error("name cannot be null.");
    this.name = name;
  }
  /** Adds an attachment to the skin for the specified slot index and name. */
  setAttachment(slotIndex, name, attachment) {
    if (!attachment)
      throw new Error("attachment cannot be null.");
    let attachments = this.attachments;
    if (slotIndex >= attachments.length)
      attachments.length = slotIndex + 1;
    if (!attachments[slotIndex])
      attachments[slotIndex] = {};
    attachments[slotIndex][name] = attachment;
  }
  /** Adds all attachments, bones, and constraints from the specified skin to this skin. */
  addSkin(skin) {
    for (let i = 0; i < skin.bones.length; i++) {
      let bone = skin.bones[i];
      let contained = false;
      for (let ii = 0; ii < this.bones.length; ii++) {
        if (this.bones[ii] == bone) {
          contained = true;
          break;
        }
      }
      if (!contained)
        this.bones.push(bone);
    }
    for (let i = 0; i < skin.constraints.length; i++) {
      let constraint = skin.constraints[i];
      let contained = false;
      for (let ii = 0; ii < this.constraints.length; ii++) {
        if (this.constraints[ii] == constraint) {
          contained = true;
          break;
        }
      }
      if (!contained)
        this.constraints.push(constraint);
    }
    let attachments = skin.getAttachments();
    for (let i = 0; i < attachments.length; i++) {
      var attachment = attachments[i];
      this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
    }
  }
  /** Adds all bones and constraints and copies of all attachments from the specified skin to this skin. Mesh attachments are not
   * copied, instead a new linked mesh is created. The attachment copies can be modified without affecting the originals. */
  copySkin(skin) {
    for (let i = 0; i < skin.bones.length; i++) {
      let bone = skin.bones[i];
      let contained = false;
      for (let ii = 0; ii < this.bones.length; ii++) {
        if (this.bones[ii] == bone) {
          contained = true;
          break;
        }
      }
      if (!contained)
        this.bones.push(bone);
    }
    for (let i = 0; i < skin.constraints.length; i++) {
      let constraint = skin.constraints[i];
      let contained = false;
      for (let ii = 0; ii < this.constraints.length; ii++) {
        if (this.constraints[ii] == constraint) {
          contained = true;
          break;
        }
      }
      if (!contained)
        this.constraints.push(constraint);
    }
    let attachments = skin.getAttachments();
    for (let i = 0; i < attachments.length; i++) {
      var attachment = attachments[i];
      if (!attachment.attachment)
        continue;
      if (attachment.attachment instanceof MeshAttachment) {
        attachment.attachment = attachment.attachment.newLinkedMesh();
        this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
      } else {
        attachment.attachment = attachment.attachment.copy();
        this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
      }
    }
  }
  /** Returns the attachment for the specified slot index and name, or null. */
  getAttachment(slotIndex, name) {
    let dictionary = this.attachments[slotIndex];
    return dictionary ? dictionary[name] : null;
  }
  /** Removes the attachment in the skin for the specified slot index and name, if any. */
  removeAttachment(slotIndex, name) {
    let dictionary = this.attachments[slotIndex];
    if (dictionary)
      dictionary[name] = null;
  }
  /** Returns all attachments in this skin. */
  getAttachments() {
    let entries = new Array();
    for (var i = 0; i < this.attachments.length; i++) {
      let slotAttachments = this.attachments[i];
      if (slotAttachments) {
        for (let name in slotAttachments) {
          let attachment = slotAttachments[name];
          if (attachment)
            entries.push(new SkinEntry(i, name, attachment));
        }
      }
    }
    return entries;
  }
  /** Returns all attachments in this skin for the specified slot index. */
  getAttachmentsForSlot(slotIndex, attachments) {
    let slotAttachments = this.attachments[slotIndex];
    if (slotAttachments) {
      for (let name in slotAttachments) {
        let attachment = slotAttachments[name];
        if (attachment)
          attachments.push(new SkinEntry(slotIndex, name, attachment));
      }
    }
  }
  /** Clears all attachments, bones, and constraints. */
  clear() {
    this.attachments.length = 0;
    this.bones.length = 0;
    this.constraints.length = 0;
  }
  /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
  attachAll(skeleton, oldSkin) {
    let slotIndex = 0;
    for (let i = 0; i < skeleton.slots.length; i++) {
      let slot = skeleton.slots[i];
      let slotAttachment = slot.getAttachment();
      if (slotAttachment && slotIndex < oldSkin.attachments.length) {
        let dictionary = oldSkin.attachments[slotIndex];
        for (let key in dictionary) {
          let skinAttachment = dictionary[key];
          if (slotAttachment == skinAttachment) {
            let attachment = this.getAttachment(slotIndex, key);
            if (attachment)
              slot.setAttachment(attachment);
            break;
          }
        }
      }
      slotIndex++;
    }
  }
};

// node_modules/@esotericsoftware/spine-core/dist/SlotData.js
var SlotData = class {
  constructor(index, name, boneData) {
    this.index = 0;
    this.name = null;
    this.boneData = null;
    this.color = new Color(1, 1, 1, 1);
    this.darkColor = null;
    this.attachmentName = null;
    this.blendMode = null;
    if (index < 0)
      throw new Error("index must be >= 0.");
    if (!name)
      throw new Error("name cannot be null.");
    if (!boneData)
      throw new Error("boneData cannot be null.");
    this.index = index;
    this.name = name;
    this.boneData = boneData;
  }
};
var BlendMode;
(function(BlendMode2) {
  BlendMode2[BlendMode2["Normal"] = 0] = "Normal";
  BlendMode2[BlendMode2["Additive"] = 1] = "Additive";
  BlendMode2[BlendMode2["Multiply"] = 2] = "Multiply";
  BlendMode2[BlendMode2["Screen"] = 3] = "Screen";
})(BlendMode || (BlendMode = {}));

// node_modules/@esotericsoftware/spine-core/dist/TransformConstraintData.js
var TransformConstraintData = class extends ConstraintData {
  constructor(name) {
    super(name, 0, false);
    this.bones = new Array();
    this.target = null;
    this.mixRotate = 0;
    this.mixX = 0;
    this.mixY = 0;
    this.mixScaleX = 0;
    this.mixScaleY = 0;
    this.mixShearY = 0;
    this.offsetRotation = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetScaleX = 0;
    this.offsetScaleY = 0;
    this.offsetShearY = 0;
    this.relative = false;
    this.local = false;
  }
};

// node_modules/@esotericsoftware/spine-core/dist/SkeletonBinary.js
var SkeletonBinary = class {
  constructor(attachmentLoader) {
    this.scale = 1;
    this.attachmentLoader = null;
    this.linkedMeshes = new Array();
    this.attachmentLoader = attachmentLoader;
  }
  readSkeletonData(binary) {
    let scale = this.scale;
    let skeletonData = new SkeletonData();
    skeletonData.name = "";
    let input = new BinaryInput(binary);
    let lowHash = input.readInt32();
    let highHash = input.readInt32();
    skeletonData.hash = highHash == 0 && lowHash == 0 ? null : highHash.toString(16) + lowHash.toString(16);
    skeletonData.version = input.readString();
    skeletonData.x = input.readFloat();
    skeletonData.y = input.readFloat();
    skeletonData.width = input.readFloat();
    skeletonData.height = input.readFloat();
    let nonessential = input.readBoolean();
    if (nonessential) {
      skeletonData.fps = input.readFloat();
      skeletonData.imagesPath = input.readString();
      skeletonData.audioPath = input.readString();
    }
    let n = 0;
    n = input.readInt(true);
    for (let i = 0; i < n; i++)
      input.strings.push(input.readString());
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      let name = input.readString();
      let parent = i == 0 ? null : skeletonData.bones[input.readInt(true)];
      let data2 = new BoneData(i, name, parent);
      data2.rotation = input.readFloat();
      data2.x = input.readFloat() * scale;
      data2.y = input.readFloat() * scale;
      data2.scaleX = input.readFloat();
      data2.scaleY = input.readFloat();
      data2.shearX = input.readFloat();
      data2.shearY = input.readFloat();
      data2.length = input.readFloat() * scale;
      data2.transformMode = input.readInt(true);
      data2.skinRequired = input.readBoolean();
      if (nonessential)
        Color.rgba8888ToColor(data2.color, input.readInt32());
      skeletonData.bones.push(data2);
    }
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      let slotName = input.readString();
      let boneData = skeletonData.bones[input.readInt(true)];
      let data2 = new SlotData(i, slotName, boneData);
      Color.rgba8888ToColor(data2.color, input.readInt32());
      let darkColor = input.readInt32();
      if (darkColor != -1)
        Color.rgb888ToColor(data2.darkColor = new Color(), darkColor);
      data2.attachmentName = input.readStringRef();
      data2.blendMode = input.readInt(true);
      skeletonData.slots.push(data2);
    }
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      let data2 = new IkConstraintData(input.readString());
      data2.order = input.readInt(true);
      data2.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++)
        data2.bones.push(skeletonData.bones[input.readInt(true)]);
      data2.target = skeletonData.bones[input.readInt(true)];
      data2.mix = input.readFloat();
      data2.softness = input.readFloat() * scale;
      data2.bendDirection = input.readByte();
      data2.compress = input.readBoolean();
      data2.stretch = input.readBoolean();
      data2.uniform = input.readBoolean();
      skeletonData.ikConstraints.push(data2);
    }
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      let data2 = new TransformConstraintData(input.readString());
      data2.order = input.readInt(true);
      data2.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++)
        data2.bones.push(skeletonData.bones[input.readInt(true)]);
      data2.target = skeletonData.bones[input.readInt(true)];
      data2.local = input.readBoolean();
      data2.relative = input.readBoolean();
      data2.offsetRotation = input.readFloat();
      data2.offsetX = input.readFloat() * scale;
      data2.offsetY = input.readFloat() * scale;
      data2.offsetScaleX = input.readFloat();
      data2.offsetScaleY = input.readFloat();
      data2.offsetShearY = input.readFloat();
      data2.mixRotate = input.readFloat();
      data2.mixX = input.readFloat();
      data2.mixY = input.readFloat();
      data2.mixScaleX = input.readFloat();
      data2.mixScaleY = input.readFloat();
      data2.mixShearY = input.readFloat();
      skeletonData.transformConstraints.push(data2);
    }
    n = input.readInt(true);
    for (let i = 0, nn; i < n; i++) {
      let data2 = new PathConstraintData(input.readString());
      data2.order = input.readInt(true);
      data2.skinRequired = input.readBoolean();
      nn = input.readInt(true);
      for (let ii = 0; ii < nn; ii++)
        data2.bones.push(skeletonData.bones[input.readInt(true)]);
      data2.target = skeletonData.slots[input.readInt(true)];
      data2.positionMode = input.readInt(true);
      data2.spacingMode = input.readInt(true);
      data2.rotateMode = input.readInt(true);
      data2.offsetRotation = input.readFloat();
      data2.position = input.readFloat();
      if (data2.positionMode == PositionMode.Fixed)
        data2.position *= scale;
      data2.spacing = input.readFloat();
      if (data2.spacingMode == SpacingMode.Length || data2.spacingMode == SpacingMode.Fixed)
        data2.spacing *= scale;
      data2.mixRotate = input.readFloat();
      data2.mixX = input.readFloat();
      data2.mixY = input.readFloat();
      skeletonData.pathConstraints.push(data2);
    }
    let defaultSkin = this.readSkin(input, skeletonData, true, nonessential);
    if (defaultSkin) {
      skeletonData.defaultSkin = defaultSkin;
      skeletonData.skins.push(defaultSkin);
    }
    {
      let i = skeletonData.skins.length;
      Utils.setArraySize(skeletonData.skins, n = i + input.readInt(true));
      for (; i < n; i++)
        skeletonData.skins[i] = this.readSkin(input, skeletonData, false, nonessential);
    }
    n = this.linkedMeshes.length;
    for (let i = 0; i < n; i++) {
      let linkedMesh = this.linkedMeshes[i];
      let skin = !linkedMesh.skin ? skeletonData.defaultSkin : skeletonData.findSkin(linkedMesh.skin);
      let parent = skin.getAttachment(linkedMesh.slotIndex, linkedMesh.parent);
      linkedMesh.mesh.deformAttachment = linkedMesh.inheritDeform ? parent : linkedMesh.mesh;
      linkedMesh.mesh.setParentMesh(parent);
      linkedMesh.mesh.updateUVs();
    }
    this.linkedMeshes.length = 0;
    n = input.readInt(true);
    for (let i = 0; i < n; i++) {
      let data2 = new EventData(input.readStringRef());
      data2.intValue = input.readInt(false);
      data2.floatValue = input.readFloat();
      data2.stringValue = input.readString();
      data2.audioPath = input.readString();
      if (data2.audioPath) {
        data2.volume = input.readFloat();
        data2.balance = input.readFloat();
      }
      skeletonData.events.push(data2);
    }
    n = input.readInt(true);
    for (let i = 0; i < n; i++)
      skeletonData.animations.push(this.readAnimation(input, input.readString(), skeletonData));
    return skeletonData;
  }
  readSkin(input, skeletonData, defaultSkin, nonessential) {
    let skin = null;
    let slotCount = 0;
    if (defaultSkin) {
      slotCount = input.readInt(true);
      if (slotCount == 0)
        return null;
      skin = new Skin("default");
    } else {
      skin = new Skin(input.readStringRef());
      skin.bones.length = input.readInt(true);
      for (let i = 0, n = skin.bones.length; i < n; i++)
        skin.bones[i] = skeletonData.bones[input.readInt(true)];
      for (let i = 0, n = input.readInt(true); i < n; i++)
        skin.constraints.push(skeletonData.ikConstraints[input.readInt(true)]);
      for (let i = 0, n = input.readInt(true); i < n; i++)
        skin.constraints.push(skeletonData.transformConstraints[input.readInt(true)]);
      for (let i = 0, n = input.readInt(true); i < n; i++)
        skin.constraints.push(skeletonData.pathConstraints[input.readInt(true)]);
      slotCount = input.readInt(true);
    }
    for (let i = 0; i < slotCount; i++) {
      let slotIndex = input.readInt(true);
      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        let name = input.readStringRef();
        let attachment = this.readAttachment(input, skeletonData, skin, slotIndex, name, nonessential);
        if (attachment)
          skin.setAttachment(slotIndex, name, attachment);
      }
    }
    return skin;
  }
  readAttachment(input, skeletonData, skin, slotIndex, attachmentName, nonessential) {
    let scale = this.scale;
    let name = input.readStringRef();
    if (!name)
      name = attachmentName;
    switch (input.readByte()) {
      case AttachmentType.Region: {
        let path = input.readStringRef();
        let rotation = input.readFloat();
        let x = input.readFloat();
        let y = input.readFloat();
        let scaleX = input.readFloat();
        let scaleY = input.readFloat();
        let width = input.readFloat();
        let height = input.readFloat();
        let color = input.readInt32();
        if (!path)
          path = name;
        let region = this.attachmentLoader.newRegionAttachment(skin, name, path);
        if (!region)
          return null;
        region.path = path;
        region.x = x * scale;
        region.y = y * scale;
        region.scaleX = scaleX;
        region.scaleY = scaleY;
        region.rotation = rotation;
        region.width = width * scale;
        region.height = height * scale;
        Color.rgba8888ToColor(region.color, color);
        region.updateOffset();
        return region;
      }
      case AttachmentType.BoundingBox: {
        let vertexCount = input.readInt(true);
        let vertices = this.readVertices(input, vertexCount);
        let color = nonessential ? input.readInt32() : 0;
        let box = this.attachmentLoader.newBoundingBoxAttachment(skin, name);
        if (!box)
          return null;
        box.worldVerticesLength = vertexCount << 1;
        box.vertices = vertices.vertices;
        box.bones = vertices.bones;
        if (nonessential)
          Color.rgba8888ToColor(box.color, color);
        return box;
      }
      case AttachmentType.Mesh: {
        let path = input.readStringRef();
        let color = input.readInt32();
        let vertexCount = input.readInt(true);
        let uvs = this.readFloatArray(input, vertexCount << 1, 1);
        let triangles = this.readShortArray(input);
        let vertices = this.readVertices(input, vertexCount);
        let hullLength = input.readInt(true);
        let edges = null;
        let width = 0, height = 0;
        if (nonessential) {
          edges = this.readShortArray(input);
          width = input.readFloat();
          height = input.readFloat();
        }
        if (!path)
          path = name;
        let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
        if (!mesh)
          return null;
        mesh.path = path;
        Color.rgba8888ToColor(mesh.color, color);
        mesh.bones = vertices.bones;
        mesh.vertices = vertices.vertices;
        mesh.worldVerticesLength = vertexCount << 1;
        mesh.triangles = triangles;
        mesh.regionUVs = uvs;
        mesh.updateUVs();
        mesh.hullLength = hullLength << 1;
        if (nonessential) {
          mesh.edges = edges;
          mesh.width = width * scale;
          mesh.height = height * scale;
        }
        return mesh;
      }
      case AttachmentType.LinkedMesh: {
        let path = input.readStringRef();
        let color = input.readInt32();
        let skinName = input.readStringRef();
        let parent = input.readStringRef();
        let inheritDeform = input.readBoolean();
        let width = 0, height = 0;
        if (nonessential) {
          width = input.readFloat();
          height = input.readFloat();
        }
        if (!path)
          path = name;
        let mesh = this.attachmentLoader.newMeshAttachment(skin, name, path);
        if (!mesh)
          return null;
        mesh.path = path;
        Color.rgba8888ToColor(mesh.color, color);
        if (nonessential) {
          mesh.width = width * scale;
          mesh.height = height * scale;
        }
        this.linkedMeshes.push(new LinkedMesh(mesh, skinName, slotIndex, parent, inheritDeform));
        return mesh;
      }
      case AttachmentType.Path: {
        let closed2 = input.readBoolean();
        let constantSpeed = input.readBoolean();
        let vertexCount = input.readInt(true);
        let vertices = this.readVertices(input, vertexCount);
        let lengths = Utils.newArray(vertexCount / 3, 0);
        for (let i = 0, n = lengths.length; i < n; i++)
          lengths[i] = input.readFloat() * scale;
        let color = nonessential ? input.readInt32() : 0;
        let path = this.attachmentLoader.newPathAttachment(skin, name);
        if (!path)
          return null;
        path.closed = closed2;
        path.constantSpeed = constantSpeed;
        path.worldVerticesLength = vertexCount << 1;
        path.vertices = vertices.vertices;
        path.bones = vertices.bones;
        path.lengths = lengths;
        if (nonessential)
          Color.rgba8888ToColor(path.color, color);
        return path;
      }
      case AttachmentType.Point: {
        let rotation = input.readFloat();
        let x = input.readFloat();
        let y = input.readFloat();
        let color = nonessential ? input.readInt32() : 0;
        let point = this.attachmentLoader.newPointAttachment(skin, name);
        if (!point)
          return null;
        point.x = x * scale;
        point.y = y * scale;
        point.rotation = rotation;
        if (nonessential)
          Color.rgba8888ToColor(point.color, color);
        return point;
      }
      case AttachmentType.Clipping: {
        let endSlotIndex = input.readInt(true);
        let vertexCount = input.readInt(true);
        let vertices = this.readVertices(input, vertexCount);
        let color = nonessential ? input.readInt32() : 0;
        let clip = this.attachmentLoader.newClippingAttachment(skin, name);
        if (!clip)
          return null;
        clip.endSlot = skeletonData.slots[endSlotIndex];
        clip.worldVerticesLength = vertexCount << 1;
        clip.vertices = vertices.vertices;
        clip.bones = vertices.bones;
        if (nonessential)
          Color.rgba8888ToColor(clip.color, color);
        return clip;
      }
    }
    return null;
  }
  readVertices(input, vertexCount) {
    let scale = this.scale;
    let verticesLength = vertexCount << 1;
    let vertices = new Vertices();
    if (!input.readBoolean()) {
      vertices.vertices = this.readFloatArray(input, verticesLength, scale);
      return vertices;
    }
    let weights = new Array();
    let bonesArray = new Array();
    for (let i = 0; i < vertexCount; i++) {
      let boneCount = input.readInt(true);
      bonesArray.push(boneCount);
      for (let ii = 0; ii < boneCount; ii++) {
        bonesArray.push(input.readInt(true));
        weights.push(input.readFloat() * scale);
        weights.push(input.readFloat() * scale);
        weights.push(input.readFloat());
      }
    }
    vertices.vertices = Utils.toFloatArray(weights);
    vertices.bones = bonesArray;
    return vertices;
  }
  readFloatArray(input, n, scale) {
    let array = new Array(n);
    if (scale == 1) {
      for (let i = 0; i < n; i++)
        array[i] = input.readFloat();
    } else {
      for (let i = 0; i < n; i++)
        array[i] = input.readFloat() * scale;
    }
    return array;
  }
  readShortArray(input) {
    let n = input.readInt(true);
    let array = new Array(n);
    for (let i = 0; i < n; i++)
      array[i] = input.readShort();
    return array;
  }
  readAnimation(input, name, skeletonData) {
    input.readInt(true);
    let timelines = new Array();
    let scale = this.scale;
    let tempColor1 = new Color();
    let tempColor2 = new Color();
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let slotIndex = input.readInt(true);
      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        let timelineType = input.readByte();
        let frameCount = input.readInt(true);
        let frameLast = frameCount - 1;
        switch (timelineType) {
          case SLOT_ATTACHMENT: {
            let timeline = new AttachmentTimeline(frameCount, slotIndex);
            for (let frame = 0; frame < frameCount; frame++)
              timeline.setFrame(frame, input.readFloat(), input.readStringRef());
            timelines.push(timeline);
            break;
          }
          case SLOT_RGBA: {
            let bezierCount = input.readInt(true);
            let timeline = new RGBATimeline(frameCount, bezierCount, slotIndex);
            let time = input.readFloat();
            let r = input.readUnsignedByte() / 255;
            let g = input.readUnsignedByte() / 255;
            let b = input.readUnsignedByte() / 255;
            let a = input.readUnsignedByte() / 255;
            for (let frame = 0, bezier = 0; ; frame++) {
              timeline.setFrame(frame, time, r, g, b, a);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat();
              let r2 = input.readUnsignedByte() / 255;
              let g2 = input.readUnsignedByte() / 255;
              let b2 = input.readUnsignedByte() / 255;
              let a2 = input.readUnsignedByte() / 255;
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, r, r2, 1);
                  setBezier(input, timeline, bezier++, frame, 1, time, time2, g, g2, 1);
                  setBezier(input, timeline, bezier++, frame, 2, time, time2, b, b2, 1);
                  setBezier(input, timeline, bezier++, frame, 3, time, time2, a, a2, 1);
              }
              time = time2;
              r = r2;
              g = g2;
              b = b2;
              a = a2;
            }
            timelines.push(timeline);
            break;
          }
          case SLOT_RGB: {
            let bezierCount = input.readInt(true);
            let timeline = new RGBTimeline(frameCount, bezierCount, slotIndex);
            let time = input.readFloat();
            let r = input.readUnsignedByte() / 255;
            let g = input.readUnsignedByte() / 255;
            let b = input.readUnsignedByte() / 255;
            for (let frame = 0, bezier = 0; ; frame++) {
              timeline.setFrame(frame, time, r, g, b);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat();
              let r2 = input.readUnsignedByte() / 255;
              let g2 = input.readUnsignedByte() / 255;
              let b2 = input.readUnsignedByte() / 255;
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, r, r2, 1);
                  setBezier(input, timeline, bezier++, frame, 1, time, time2, g, g2, 1);
                  setBezier(input, timeline, bezier++, frame, 2, time, time2, b, b2, 1);
              }
              time = time2;
              r = r2;
              g = g2;
              b = b2;
            }
            timelines.push(timeline);
            break;
          }
          case SLOT_RGBA2: {
            let bezierCount = input.readInt(true);
            let timeline = new RGBA2Timeline(frameCount, bezierCount, slotIndex);
            let time = input.readFloat();
            let r = input.readUnsignedByte() / 255;
            let g = input.readUnsignedByte() / 255;
            let b = input.readUnsignedByte() / 255;
            let a = input.readUnsignedByte() / 255;
            let r2 = input.readUnsignedByte() / 255;
            let g2 = input.readUnsignedByte() / 255;
            let b2 = input.readUnsignedByte() / 255;
            for (let frame = 0, bezier = 0; ; frame++) {
              timeline.setFrame(frame, time, r, g, b, a, r2, g2, b2);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat();
              let nr = input.readUnsignedByte() / 255;
              let ng = input.readUnsignedByte() / 255;
              let nb = input.readUnsignedByte() / 255;
              let na = input.readUnsignedByte() / 255;
              let nr2 = input.readUnsignedByte() / 255;
              let ng2 = input.readUnsignedByte() / 255;
              let nb2 = input.readUnsignedByte() / 255;
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, r, nr, 1);
                  setBezier(input, timeline, bezier++, frame, 1, time, time2, g, ng, 1);
                  setBezier(input, timeline, bezier++, frame, 2, time, time2, b, nb, 1);
                  setBezier(input, timeline, bezier++, frame, 3, time, time2, a, na, 1);
                  setBezier(input, timeline, bezier++, frame, 4, time, time2, r2, nr2, 1);
                  setBezier(input, timeline, bezier++, frame, 5, time, time2, g2, ng2, 1);
                  setBezier(input, timeline, bezier++, frame, 6, time, time2, b2, nb2, 1);
              }
              time = time2;
              r = nr;
              g = ng;
              b = nb;
              a = na;
              r2 = nr2;
              g2 = ng2;
              b2 = nb2;
            }
            timelines.push(timeline);
            break;
          }
          case SLOT_RGB2: {
            let bezierCount = input.readInt(true);
            let timeline = new RGB2Timeline(frameCount, bezierCount, slotIndex);
            let time = input.readFloat();
            let r = input.readUnsignedByte() / 255;
            let g = input.readUnsignedByte() / 255;
            let b = input.readUnsignedByte() / 255;
            let r2 = input.readUnsignedByte() / 255;
            let g2 = input.readUnsignedByte() / 255;
            let b2 = input.readUnsignedByte() / 255;
            for (let frame = 0, bezier = 0; ; frame++) {
              timeline.setFrame(frame, time, r, g, b, r2, g2, b2);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat();
              let nr = input.readUnsignedByte() / 255;
              let ng = input.readUnsignedByte() / 255;
              let nb = input.readUnsignedByte() / 255;
              let nr2 = input.readUnsignedByte() / 255;
              let ng2 = input.readUnsignedByte() / 255;
              let nb2 = input.readUnsignedByte() / 255;
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, r, nr, 1);
                  setBezier(input, timeline, bezier++, frame, 1, time, time2, g, ng, 1);
                  setBezier(input, timeline, bezier++, frame, 2, time, time2, b, nb, 1);
                  setBezier(input, timeline, bezier++, frame, 3, time, time2, r2, nr2, 1);
                  setBezier(input, timeline, bezier++, frame, 4, time, time2, g2, ng2, 1);
                  setBezier(input, timeline, bezier++, frame, 5, time, time2, b2, nb2, 1);
              }
              time = time2;
              r = nr;
              g = ng;
              b = nb;
              r2 = nr2;
              g2 = ng2;
              b2 = nb2;
            }
            timelines.push(timeline);
            break;
          }
          case SLOT_ALPHA: {
            let timeline = new AlphaTimeline(frameCount, input.readInt(true), slotIndex);
            let time = input.readFloat(), a = input.readUnsignedByte() / 255;
            for (let frame = 0, bezier = 0; ; frame++) {
              timeline.setFrame(frame, time, a);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat();
              let a2 = input.readUnsignedByte() / 255;
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, a, a2, 1);
              }
              time = time2;
              a = a2;
            }
            timelines.push(timeline);
            break;
          }
        }
      }
    }
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let boneIndex = input.readInt(true);
      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        let type = input.readByte(), frameCount = input.readInt(true), bezierCount = input.readInt(true);
        switch (type) {
          case BONE_ROTATE:
            timelines.push(readTimeline1(input, new RotateTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_TRANSLATE:
            timelines.push(readTimeline2(input, new TranslateTimeline(frameCount, bezierCount, boneIndex), scale));
            break;
          case BONE_TRANSLATEX:
            timelines.push(readTimeline1(input, new TranslateXTimeline(frameCount, bezierCount, boneIndex), scale));
            break;
          case BONE_TRANSLATEY:
            timelines.push(readTimeline1(input, new TranslateYTimeline(frameCount, bezierCount, boneIndex), scale));
            break;
          case BONE_SCALE:
            timelines.push(readTimeline2(input, new ScaleTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_SCALEX:
            timelines.push(readTimeline1(input, new ScaleXTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_SCALEY:
            timelines.push(readTimeline1(input, new ScaleYTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_SHEAR:
            timelines.push(readTimeline2(input, new ShearTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_SHEARX:
            timelines.push(readTimeline1(input, new ShearXTimeline(frameCount, bezierCount, boneIndex), 1));
            break;
          case BONE_SHEARY:
            timelines.push(readTimeline1(input, new ShearYTimeline(frameCount, bezierCount, boneIndex), 1));
        }
      }
    }
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let index = input.readInt(true), frameCount = input.readInt(true), frameLast = frameCount - 1;
      let timeline = new IkConstraintTimeline(frameCount, input.readInt(true), index);
      let time = input.readFloat(), mix = input.readFloat(), softness = input.readFloat() * scale;
      for (let frame = 0, bezier = 0; ; frame++) {
        timeline.setFrame(frame, time, mix, softness, input.readByte(), input.readBoolean(), input.readBoolean());
        if (frame == frameLast)
          break;
        let time2 = input.readFloat(), mix2 = input.readFloat(), softness2 = input.readFloat() * scale;
        switch (input.readByte()) {
          case CURVE_STEPPED:
            timeline.setStepped(frame);
            break;
          case CURVE_BEZIER:
            setBezier(input, timeline, bezier++, frame, 0, time, time2, mix, mix2, 1);
            setBezier(input, timeline, bezier++, frame, 1, time, time2, softness, softness2, scale);
        }
        time = time2;
        mix = mix2;
        softness = softness2;
      }
      timelines.push(timeline);
    }
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let index = input.readInt(true), frameCount = input.readInt(true), frameLast = frameCount - 1;
      let timeline = new TransformConstraintTimeline(frameCount, input.readInt(true), index);
      let time = input.readFloat(), mixRotate = input.readFloat(), mixX = input.readFloat(), mixY = input.readFloat(), mixScaleX = input.readFloat(), mixScaleY = input.readFloat(), mixShearY = input.readFloat();
      for (let frame = 0, bezier = 0; ; frame++) {
        timeline.setFrame(frame, time, mixRotate, mixX, mixY, mixScaleX, mixScaleY, mixShearY);
        if (frame == frameLast)
          break;
        let time2 = input.readFloat(), mixRotate2 = input.readFloat(), mixX2 = input.readFloat(), mixY2 = input.readFloat(), mixScaleX2 = input.readFloat(), mixScaleY2 = input.readFloat(), mixShearY2 = input.readFloat();
        switch (input.readByte()) {
          case CURVE_STEPPED:
            timeline.setStepped(frame);
            break;
          case CURVE_BEZIER:
            setBezier(input, timeline, bezier++, frame, 0, time, time2, mixRotate, mixRotate2, 1);
            setBezier(input, timeline, bezier++, frame, 1, time, time2, mixX, mixX2, 1);
            setBezier(input, timeline, bezier++, frame, 2, time, time2, mixY, mixY2, 1);
            setBezier(input, timeline, bezier++, frame, 3, time, time2, mixScaleX, mixScaleX2, 1);
            setBezier(input, timeline, bezier++, frame, 4, time, time2, mixScaleY, mixScaleY2, 1);
            setBezier(input, timeline, bezier++, frame, 5, time, time2, mixShearY, mixShearY2, 1);
        }
        time = time2;
        mixRotate = mixRotate2;
        mixX = mixX2;
        mixY = mixY2;
        mixScaleX = mixScaleX2;
        mixScaleY = mixScaleY2;
        mixShearY = mixShearY2;
      }
      timelines.push(timeline);
    }
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let index = input.readInt(true);
      let data2 = skeletonData.pathConstraints[index];
      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        switch (input.readByte()) {
          case PATH_POSITION:
            timelines.push(readTimeline1(input, new PathConstraintPositionTimeline(input.readInt(true), input.readInt(true), index), data2.positionMode == PositionMode.Fixed ? scale : 1));
            break;
          case PATH_SPACING:
            timelines.push(readTimeline1(input, new PathConstraintSpacingTimeline(input.readInt(true), input.readInt(true), index), data2.spacingMode == SpacingMode.Length || data2.spacingMode == SpacingMode.Fixed ? scale : 1));
            break;
          case PATH_MIX:
            let timeline = new PathConstraintMixTimeline(input.readInt(true), input.readInt(true), index);
            let time = input.readFloat(), mixRotate = input.readFloat(), mixX = input.readFloat(), mixY = input.readFloat();
            for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1; ; frame++) {
              timeline.setFrame(frame, time, mixRotate, mixX, mixY);
              if (frame == frameLast)
                break;
              let time2 = input.readFloat(), mixRotate2 = input.readFloat(), mixX2 = input.readFloat(), mixY2 = input.readFloat();
              switch (input.readByte()) {
                case CURVE_STEPPED:
                  timeline.setStepped(frame);
                  break;
                case CURVE_BEZIER:
                  setBezier(input, timeline, bezier++, frame, 0, time, time2, mixRotate, mixRotate2, 1);
                  setBezier(input, timeline, bezier++, frame, 1, time, time2, mixX, mixX2, 1);
                  setBezier(input, timeline, bezier++, frame, 2, time, time2, mixY, mixY2, 1);
              }
              time = time2;
              mixRotate = mixRotate2;
              mixX = mixX2;
              mixY = mixY2;
            }
            timelines.push(timeline);
        }
      }
    }
    for (let i = 0, n = input.readInt(true); i < n; i++) {
      let skin = skeletonData.skins[input.readInt(true)];
      for (let ii = 0, nn = input.readInt(true); ii < nn; ii++) {
        let slotIndex = input.readInt(true);
        for (let iii = 0, nnn = input.readInt(true); iii < nnn; iii++) {
          let attachmentName = input.readStringRef();
          let attachment = skin.getAttachment(slotIndex, attachmentName);
          let weighted = attachment.bones;
          let vertices = attachment.vertices;
          let deformLength = weighted ? vertices.length / 3 * 2 : vertices.length;
          let frameCount = input.readInt(true);
          let frameLast = frameCount - 1;
          let bezierCount = input.readInt(true);
          let timeline = new DeformTimeline(frameCount, bezierCount, slotIndex, attachment);
          let time = input.readFloat();
          for (let frame = 0, bezier = 0; ; frame++) {
            let deform;
            let end = input.readInt(true);
            if (end == 0)
              deform = weighted ? Utils.newFloatArray(deformLength) : vertices;
            else {
              deform = Utils.newFloatArray(deformLength);
              let start = input.readInt(true);
              end += start;
              if (scale == 1) {
                for (let v = start; v < end; v++)
                  deform[v] = input.readFloat();
              } else {
                for (let v = start; v < end; v++)
                  deform[v] = input.readFloat() * scale;
              }
              if (!weighted) {
                for (let v = 0, vn = deform.length; v < vn; v++)
                  deform[v] += vertices[v];
              }
            }
            timeline.setFrame(frame, time, deform);
            if (frame == frameLast)
              break;
            let time2 = input.readFloat();
            switch (input.readByte()) {
              case CURVE_STEPPED:
                timeline.setStepped(frame);
                break;
              case CURVE_BEZIER:
                setBezier(input, timeline, bezier++, frame, 0, time, time2, 0, 1, 1);
            }
            time = time2;
          }
          timelines.push(timeline);
        }
      }
    }
    let drawOrderCount = input.readInt(true);
    if (drawOrderCount > 0) {
      let timeline = new DrawOrderTimeline(drawOrderCount);
      let slotCount = skeletonData.slots.length;
      for (let i = 0; i < drawOrderCount; i++) {
        let time = input.readFloat();
        let offsetCount = input.readInt(true);
        let drawOrder = Utils.newArray(slotCount, 0);
        for (let ii = slotCount - 1; ii >= 0; ii--)
          drawOrder[ii] = -1;
        let unchanged = Utils.newArray(slotCount - offsetCount, 0);
        let originalIndex = 0, unchangedIndex = 0;
        for (let ii = 0; ii < offsetCount; ii++) {
          let slotIndex = input.readInt(true);
          while (originalIndex != slotIndex)
            unchanged[unchangedIndex++] = originalIndex++;
          drawOrder[originalIndex + input.readInt(true)] = originalIndex++;
        }
        while (originalIndex < slotCount)
          unchanged[unchangedIndex++] = originalIndex++;
        for (let ii = slotCount - 1; ii >= 0; ii--)
          if (drawOrder[ii] == -1)
            drawOrder[ii] = unchanged[--unchangedIndex];
        timeline.setFrame(i, time, drawOrder);
      }
      timelines.push(timeline);
    }
    let eventCount = input.readInt(true);
    if (eventCount > 0) {
      let timeline = new EventTimeline(eventCount);
      for (let i = 0; i < eventCount; i++) {
        let time = input.readFloat();
        let eventData = skeletonData.events[input.readInt(true)];
        let event = new Event(time, eventData);
        event.intValue = input.readInt(false);
        event.floatValue = input.readFloat();
        event.stringValue = input.readBoolean() ? input.readString() : eventData.stringValue;
        if (event.data.audioPath) {
          event.volume = input.readFloat();
          event.balance = input.readFloat();
        }
        timeline.setFrame(i, event);
      }
      timelines.push(timeline);
    }
    let duration = 0;
    for (let i = 0, n = timelines.length; i < n; i++)
      duration = Math.max(duration, timelines[i].getDuration());
    return new Animation(name, timelines, duration);
  }
};
var BinaryInput = class {
  constructor(data2, strings = new Array(), index = 0, buffer = new DataView(data2.buffer)) {
    this.strings = strings;
    this.index = index;
    this.buffer = buffer;
  }
  readByte() {
    return this.buffer.getInt8(this.index++);
  }
  readUnsignedByte() {
    return this.buffer.getUint8(this.index++);
  }
  readShort() {
    let value = this.buffer.getInt16(this.index);
    this.index += 2;
    return value;
  }
  readInt32() {
    let value = this.buffer.getInt32(this.index);
    this.index += 4;
    return value;
  }
  readInt(optimizePositive) {
    let b = this.readByte();
    let result = b & 127;
    if ((b & 128) != 0) {
      b = this.readByte();
      result |= (b & 127) << 7;
      if ((b & 128) != 0) {
        b = this.readByte();
        result |= (b & 127) << 14;
        if ((b & 128) != 0) {
          b = this.readByte();
          result |= (b & 127) << 21;
          if ((b & 128) != 0) {
            b = this.readByte();
            result |= (b & 127) << 28;
          }
        }
      }
    }
    return optimizePositive ? result : result >>> 1 ^ -(result & 1);
  }
  readStringRef() {
    let index = this.readInt(true);
    return index == 0 ? null : this.strings[index - 1];
  }
  readString() {
    let byteCount = this.readInt(true);
    switch (byteCount) {
      case 0:
        return null;
      case 1:
        return "";
    }
    byteCount--;
    let chars = "";
    let charCount = 0;
    for (let i = 0; i < byteCount; ) {
      let b = this.readUnsignedByte();
      switch (b >> 4) {
        case 12:
        case 13:
          chars += String.fromCharCode((b & 31) << 6 | this.readByte() & 63);
          i += 2;
          break;
        case 14:
          chars += String.fromCharCode((b & 15) << 12 | (this.readByte() & 63) << 6 | this.readByte() & 63);
          i += 3;
          break;
        default:
          chars += String.fromCharCode(b);
          i++;
      }
    }
    return chars;
  }
  readFloat() {
    let value = this.buffer.getFloat32(this.index);
    this.index += 4;
    return value;
  }
  readBoolean() {
    return this.readByte() != 0;
  }
};
var LinkedMesh = class {
  constructor(mesh, skin, slotIndex, parent, inheritDeform) {
    this.mesh = mesh;
    this.skin = skin;
    this.slotIndex = slotIndex;
    this.parent = parent;
    this.inheritDeform = inheritDeform;
  }
};
var Vertices = class {
  constructor(bones = null, vertices = null) {
    this.bones = bones;
    this.vertices = vertices;
  }
};
var AttachmentType;
(function(AttachmentType2) {
  AttachmentType2[AttachmentType2["Region"] = 0] = "Region";
  AttachmentType2[AttachmentType2["BoundingBox"] = 1] = "BoundingBox";
  AttachmentType2[AttachmentType2["Mesh"] = 2] = "Mesh";
  AttachmentType2[AttachmentType2["LinkedMesh"] = 3] = "LinkedMesh";
  AttachmentType2[AttachmentType2["Path"] = 4] = "Path";
  AttachmentType2[AttachmentType2["Point"] = 5] = "Point";
  AttachmentType2[AttachmentType2["Clipping"] = 6] = "Clipping";
})(AttachmentType || (AttachmentType = {}));
function readTimeline1(input, timeline, scale) {
  let time = input.readFloat(), value = input.readFloat() * scale;
  for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1; ; frame++) {
    timeline.setFrame(frame, time, value);
    if (frame == frameLast)
      break;
    let time2 = input.readFloat(), value2 = input.readFloat() * scale;
    switch (input.readByte()) {
      case CURVE_STEPPED:
        timeline.setStepped(frame);
        break;
      case CURVE_BEZIER:
        setBezier(input, timeline, bezier++, frame, 0, time, time2, value, value2, scale);
    }
    time = time2;
    value = value2;
  }
  return timeline;
}
function readTimeline2(input, timeline, scale) {
  let time = input.readFloat(), value1 = input.readFloat() * scale, value2 = input.readFloat() * scale;
  for (let frame = 0, bezier = 0, frameLast = timeline.getFrameCount() - 1; ; frame++) {
    timeline.setFrame(frame, time, value1, value2);
    if (frame == frameLast)
      break;
    let time2 = input.readFloat(), nvalue1 = input.readFloat() * scale, nvalue2 = input.readFloat() * scale;
    switch (input.readByte()) {
      case CURVE_STEPPED:
        timeline.setStepped(frame);
        break;
      case CURVE_BEZIER:
        setBezier(input, timeline, bezier++, frame, 0, time, time2, value1, nvalue1, scale);
        setBezier(input, timeline, bezier++, frame, 1, time, time2, value2, nvalue2, scale);
    }
    time = time2;
    value1 = nvalue1;
    value2 = nvalue2;
  }
  return timeline;
}
function setBezier(input, timeline, bezier, frame, value, time1, time2, value1, value2, scale) {
  timeline.setBezier(bezier, frame, value, time1, value1, input.readFloat(), input.readFloat() * scale, input.readFloat(), input.readFloat() * scale, time2, value2);
}
var BONE_ROTATE = 0;
var BONE_TRANSLATE = 1;
var BONE_TRANSLATEX = 2;
var BONE_TRANSLATEY = 3;
var BONE_SCALE = 4;
var BONE_SCALEX = 5;
var BONE_SCALEY = 6;
var BONE_SHEAR = 7;
var BONE_SHEARX = 8;
var BONE_SHEARY = 9;
var SLOT_ATTACHMENT = 0;
var SLOT_RGBA = 1;
var SLOT_RGB = 2;
var SLOT_RGBA2 = 3;
var SLOT_RGB2 = 4;
var SLOT_ALPHA = 5;
var PATH_POSITION = 0;
var PATH_SPACING = 1;
var PATH_MIX = 2;
var CURVE_STEPPED = 1;
var CURVE_BEZIER = 2;

// node_modules/@esotericsoftware/spine-core/dist/polyfills.js
(() => {
  if (typeof Math.fround === "undefined") {
    Math.fround = /* @__PURE__ */ (function(array) {
      return function(x) {
        return array[0] = x, array[0];
      };
    })(new Float32Array(1));
  }
})();

// node_modules/@esotericsoftware/spine-core/dist/vertexeffects/SwirlEffect.js
var SwirlEffect = class _SwirlEffect {
  constructor(radius) {
    this.centerX = 0;
    this.centerY = 0;
    this.radius = 0;
    this.angle = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.radius = radius;
  }
  begin(skeleton) {
    this.worldX = skeleton.x + this.centerX;
    this.worldY = skeleton.y + this.centerY;
  }
  transform(position, uv, light, dark) {
    let radAngle = this.angle * MathUtils.degreesToRadians;
    let x = position.x - this.worldX;
    let y = position.y - this.worldY;
    let dist = Math.sqrt(x * x + y * y);
    if (dist < this.radius) {
      let theta = _SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
      let cos = Math.cos(theta);
      let sin = Math.sin(theta);
      position.x = cos * x - sin * y + this.worldX;
      position.y = sin * x + cos * y + this.worldY;
    }
  }
  end() {
  }
};
SwirlEffect.interpolation = new PowOut(2);

// targets.mjs
var base = "C:/Users/mi/Desktop/NIKKE_Spine_10/c010";
var atlas = new TextureAtlas(import_node_fs.default.readFileSync(base + "/c010_00.atlas", "utf8"));
atlas.pages.forEach((p) => p.setTexture(new FakeTexture({ width: p.width, height: p.height })));
var data = new SkeletonBinary(new AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(import_node_fs.default.readFileSync(base + "/c010_00.skel")));
var sk = new Skeleton(data);
sk.updateWorldTransform();
for (const n of ["ik_arm_r", "face_con", "face4", "head", "body_2", "r_hand_1", "l_hand_1", "gun"]) {
  const b = sk.findBone(n);
  console.log(n, b ? { x: b.x, y: b.y, worldX: b.worldX, worldY: b.worldY, rot: b.rotation, parent: b.data.parent?.name } : null);
}
