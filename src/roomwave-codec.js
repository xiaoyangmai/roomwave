(() => {
  'use strict';
  function encode(value) {
    if (typeof value === 'number' && !Number.isFinite(value)) return { $number: String(value) };
    if (value instanceof Map) return { $map: [...value].map(([key, item]) => [encode(key), encode(item)]) };
    if (value instanceof Set) return { $set: [...value].map(encode) };
    if (Array.isArray(value)) return value.map(encode);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
    return value;
  }
  function decode(value) {
    if (Array.isArray(value)) return value.map(decode);
    if (value && typeof value === 'object') {
      if (Object.hasOwn(value, '$number')) return Number(value.$number);
      if (Object.hasOwn(value, '$map')) return new Map(value.$map.map(([key, item]) => [decode(key), decode(item)]));
      if (Object.hasOwn(value, '$set')) return new Set(value.$set.map(decode));
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decode(item)]));
    }
    return value;
  }
  globalThis.RoomwaveCodec = Object.freeze({ encode, decode });
})();
