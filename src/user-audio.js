(() => {
  'use strict';
  // Shared by Solo and Together on this browser; never sent to the room server.
  const storageKey = 'roomwave-user-audio-v1';
  const listeners = new Set();
  function read(key) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      return typeof saved?.enabled === 'boolean' ? saved.enabled : null;
    } catch { return null; }
  }
  let enabled = read(storageKey) ?? read('roomwave-room-music-v1') ?? true;
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify({ enabled })); } catch {}
  }
  function setEnabled(value, { gesture = true, persist = true } = {}) {
    enabled = Boolean(value);
    if (persist) save();
    for (const listener of listeners) listener(enabled, { gesture });
  }
  function refresh() {
    const value = read(storageKey);
    if (value !== null && value !== enabled) setEnabled(value, { gesture: false, persist: false });
  }
  window.UserAudio = Object.freeze({
    get enabled() { return enabled; },
    setEnabled,
    toggle() { setEnabled(!enabled); },
    subscribe(listener) {
      listeners.add(listener);
      listener(enabled, { gesture: false });
      return () => listeners.delete(listener);
    }
  });
  save();
  // Read the latest stored value so delayed events from another tab cannot
  // overwrite a newer click made here. Storage updates never echo a write.
  window.addEventListener('storage', event => { if (event.key === storageKey || event.key === null) refresh(); });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('focus', refresh);
  window.addEventListener('stream:resetting', () => setEnabled(false, { gesture: false }));
})();
