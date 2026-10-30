(() => {
  'use strict';
  const root = typeof window === 'object' ? window : globalThis;
  const validated = new WeakMap();

  function regionsFor(track) {
    const data = root.KaraokeVocalData;
    if (data?.version !== 1 || !track || typeof track.id !== 'string' || !data.tracks || !Object.hasOwn(data.tracks, track.id)) return null;
    const entry = data.tracks[track.id];
    if (!entry || typeof entry !== 'object' || typeof track.src !== 'string' || entry.src !== track.src) return null;
    if (validated.has(entry)) return validated.get(entry);
    let regions = null;
    if (Number.isFinite(entry.duration) && entry.duration > 0 && Array.isArray(entry.intervals)) {
      let previousEnd = 0;
      const valid = entry.intervals.every(range => {
        if (!Array.isArray(range) || range.length !== 2) return false;
        const [start, end] = range;
        if (!Number.isFinite(start) || !Number.isFinite(end) || start < previousEnd || start < 0 || end <= start || end > entry.duration) return false;
        previousEnd = end;
        return true;
      });
      if (valid) regions = entry.intervals.map(range => Object.freeze([...range]));
    }
    validated.set(entry, regions);
    return regions;
  }

  function isSinging(track, currentTime) {
    if (!Number.isFinite(currentTime) || currentTime < 0) return false;
    const regions = regionsFor(track);
    if (!regions) return false;
    // Search from the current media time, so seeks and resumed songs never drift.
    let low = 0, high = regions.length - 1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      const [start, end] = regions[middle];
      if (currentTime < start) high = middle - 1;
      else if (currentTime >= end) low = middle + 1;
      else return true;
    }
    return false;
  }

  root.KaraokeVocals = Object.freeze({ isSinging });
})();
