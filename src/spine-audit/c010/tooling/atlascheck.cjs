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

// atlascheck.mjs
var import_node_fs = __toESM(require("node:fs"), 1);

// node_modules/@esotericsoftware/spine-core/dist/Utils.js
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

// node_modules/@esotericsoftware/spine-core/dist/Texture.js
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

// node_modules/@esotericsoftware/spine-core/dist/BoneData.js
var TransformMode;
(function(TransformMode2) {
  TransformMode2[TransformMode2["Normal"] = 0] = "Normal";
  TransformMode2[TransformMode2["OnlyTranslation"] = 1] = "OnlyTranslation";
  TransformMode2[TransformMode2["NoRotationOrReflection"] = 2] = "NoRotationOrReflection";
  TransformMode2[TransformMode2["NoScale"] = 3] = "NoScale";
  TransformMode2[TransformMode2["NoScaleOrReflection"] = 4] = "NoScaleOrReflection";
})(TransformMode || (TransformMode = {}));

// node_modules/@esotericsoftware/spine-core/dist/PathConstraintData.js
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
  constructor(data, skeleton) {
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
    if (!data)
      throw new Error("data cannot be null.");
    if (!skeleton)
      throw new Error("skeleton cannot be null.");
    this.data = data;
    this.bones = new Array();
    for (let i = 0, n = data.bones.length; i < n; i++)
      this.bones.push(skeleton.findBone(data.bones[i].name));
    this.target = skeleton.findSlot(data.target.name);
    this.position = data.position;
    this.spacing = data.spacing;
    this.mixRotate = data.mixRotate;
    this.mixX = data.mixX;
    this.mixY = data.mixY;
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
    let data = this.data;
    let tangents = data.rotateMode == RotateMode.Tangent, scale = data.rotateMode == RotateMode.ChainScale;
    let bones = this.bones;
    let boneCount = bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
    let spaces = Utils.setArraySize(this.spaces, spacesCount), lengths = scale ? this.lengths = Utils.setArraySize(this.lengths, boneCount) : null;
    let spacing = this.spacing;
    switch (data.spacingMode) {
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
        let lengthSpacing = data.spacingMode == SpacingMode.Length;
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
    let boneX = positions[0], boneY = positions[1], offsetRotation = data.offsetRotation;
    let tip = false;
    if (offsetRotation == 0)
      tip = data.rotateMode == RotateMode.Chain;
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

// node_modules/@esotericsoftware/spine-core/dist/SlotData.js
var BlendMode;
(function(BlendMode2) {
  BlendMode2[BlendMode2["Normal"] = 0] = "Normal";
  BlendMode2[BlendMode2["Additive"] = 1] = "Additive";
  BlendMode2[BlendMode2["Multiply"] = 2] = "Multiply";
  BlendMode2[BlendMode2["Screen"] = 3] = "Screen";
})(BlendMode || (BlendMode = {}));

// node_modules/@esotericsoftware/spine-core/dist/SkeletonBinary.js
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

// atlascheck.mjs
var t = new TextureAtlas(import_node_fs.default.readFileSync("C:/Users/mi/Desktop/NIKKE_Spine_10/c010/c010_00.atlas", "utf8"));
console.log(t.findRegion("acc_1"));
console.log(t.regions.slice(0, 10).map((x) => x.name));
