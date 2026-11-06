/* Bounded runtime trace storage. It records evidence but owns no action logic. */
export class RuntimeTraceRecorder {
  constructor(limit = 240) {
    this.limit = Math.max(1, Number(limit) || 240);
    this.frames = [];
  }

  clear() {
    this.frames.length = 0;
  }

  push(frame) {
    this.frames.push(frame);
    if (this.frames.length > this.limit) this.frames.shift();
    return frame;
  }

  slice(limit = 120) {
    return this.frames.slice(-Math.max(0, Number(limit) || 0));
  }

  snapshot(limit = this.limit) {
    return this.slice(limit);
  }
}
