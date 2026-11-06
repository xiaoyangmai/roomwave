(() => {
  'use strict';

  const feed = document.getElementById('live-room-feed');
  if (!feed) return;

  const panels = [...feed.querySelectorAll('[data-live-room-panel]')];
  if (!panels.length) return;
  const rotationPanels = panels.filter(panel => panel.dataset.liveRoomRotation !== 'excluded');
  if (!rotationPanels.length) return;
  const query = new URLSearchParams(window.location?.search || '');
  const requestedRoomRaw = query.get('room') || (query.get('spine') === 'c010' ? 'gaming-c010' : null);
  const requestedRoom = requestedRoomRaw === 'gaming_c010' ? 'gaming-c010' : requestedRoomRaw;
  const initialPanel = panels.find(panel => panel.dataset.liveRoomPanel === requestedRoom) || rotationPanels[0];
  // Retired rooms remain available by direct link, but occupy no space in the
  // normal feed. Leaving a preview returns to the current room rotation.
  panels.forEach(panel => {
    if (panel.dataset.liveRoomRotation === 'excluded') panel.hidden = panel !== initialPanel;
  });
  const status = document.getElementById('live-room-status');
  const roomNames = { stream: 'Hangout', 'gaming-seated': 'Gaming', 'gaming-c010': 'Gaming c010', workout: 'Fitness', baking: 'Baking', fortune: 'Fortunes', karaoke: 'Karaoke' };
  const normalizeRoom = room => room === 'gaming_c010' ? 'gaming-c010' : room;
  const roomOrder = rotationPanels.map(panel => panel.dataset.liveRoomPanel);
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeRoom = null;
  let scrollFrame = 0;
  let resizeTimer = 0;
  let resizeRoom = null;
  let settledHeight = feed.clientHeight;
  let wrapping = null;

  const isDialogOpen = () => Boolean(document.querySelector('dialog[open]'));

  function updateRoom(room, announce = true) {
    const currentPanel = panels.find(panel => !panel.hidden && panel.dataset.liveRoomPanel === room);
    if (!currentPanel) return;
    const previousRoom = activeRoom;
    activeRoom = room;
    document.body.dataset.liveRoom = room;

    // A swipe can leave keyboard focus inside the departing room. Move it to
    // the feed before hiding that room from assistive tools.
    const focusedPanel = document.activeElement?.closest('[data-live-room-panel]');
    if (focusedPanel && focusedPanel.dataset.liveRoomPanel !== room) {
      feed.focus({ preventScroll: true });
    }

    panels.forEach(panel => {
      const isActive = panel.dataset.liveRoomPanel === room;
      panel.inert = !isActive;
      panel.setAttribute('aria-hidden', String(!isActive));
    });
    const departingPreview = panels.find(panel => panel.dataset.liveRoomPanel === previousRoom && panel.dataset.liveRoomRotation === 'excluded');
    if (departingPreview && previousRoom !== room) {
      departingPreview.hidden = true;
      feed.scrollTo({ top: currentPanel.offsetTop, behavior: 'instant' });
    }
    if (status && (announce || previousRoom === null) && previousRoom !== room) status.textContent = `${roomNames[room]} live room.`;
    if (previousRoom !== room) window.dispatchEvent(new CustomEvent('live-room-change', { detail: { room, previousRoom } }));
  }

  function syncFromScroll() {
    scrollFrame = 0;
    // Reflow can send a scroll event before scroll-snap reaches the new room
    // offset. Preserve the selected room until the viewport has settled.
    if (resizeRoom || feed.clientHeight !== settledHeight) {
      onResize();
      return;
    }
    if (wrapping && !wrapping.started) return;
    const center = feed.scrollTop + feed.clientHeight / 2;
    const nearest = panels.find(panel => !panel.hidden && center >= panel.offsetTop && center < panel.offsetTop + panel.offsetHeight);
    if (nearest && nearest.dataset.liveRoomPanel !== activeRoom) updateRoom(nearest.dataset.liveRoomPanel);
    if (wrapping && Math.abs(feed.scrollTop - wrapping.target.offsetTop) < 2) finishWrap();
  }

  function finishWrap() {
    if (!wrapping) return;
    const transition = wrapping;
    wrapping = null;
    window.clearTimeout(transition.timer);
    // Move the original node back without rebuilding its controls or game state.
    feed.insertBefore(transition.target, transition.next);
    feed.scrollTo({ top: transition.target.offsetTop, behavior: 'instant' });
    feed.classList.toggle('is-wrapping', false);
    updateRoom(transition.target.dataset.liveRoomPanel);
  }

  function slideAcrossBoundary(target, forward) {
    const from = panels.find(panel => panel.dataset.liveRoomPanel === activeRoom);
    const transition = { target, next: target.nextSibling, started: false, timer: 0 };
    wrapping = transition;
    feed.classList.toggle('is-wrapping', true);
    // Put the destination beside the current endpoint for one native smooth
    // scroll. No cloned room, duplicate IDs, or trip through the other rooms.
    feed.insertBefore(target, forward ? from.nextSibling : from);
    feed.scrollTo({ top: from.offsetTop, behavior: 'instant' });
    window.requestAnimationFrame(() => {
      if (wrapping !== transition) return;
      transition.started = true;
      feed.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      // Also settle safely when a browser cancels scrolling or hides the tab.
      transition.timer = window.setTimeout(finishWrap, 1500);
    });
  }

  function goTo(room, options = {}) {
    room = normalizeRoom(room);
    const target = panels.find(panel => panel.dataset.liveRoomPanel === room);
    if (!target || isDialogOpen()) return false;
    if (target.hidden && target.dataset.liveRoomRotation === 'excluded') target.hidden = false;
    if (wrapping) finishWrap();
    window.clearTimeout(resizeTimer);
    resizeRoom = null;
    settledHeight = feed.clientHeight;
    const firstRoom = roomOrder[0], lastRoom = roomOrder[roomOrder.length - 1];
    const crossesBoundary = (activeRoom === firstRoom && room === lastRoom) || (activeRoom === lastRoom && room === firstRoom);
    const leavingPreview = !roomOrder.includes(activeRoom) && activeRoom !== room;
    const behavior = leavingPreview || options.behavior === 'instant' || motionPreference.matches ? 'instant' : 'smooth';
    if (crossesBoundary && behavior === 'smooth') {
      slideAcrossBoundary(target, activeRoom === lastRoom);
      return true;
    }
    feed.scrollTo({ top: target.offsetTop, behavior });
    // Instant navigation does not need to wait for a browser scroll event.
    if (behavior === 'instant') updateRoom(room);
    return true;
  }

  window.LiveRooms = Object.freeze({ get activeRoom() { return activeRoom; }, goTo });

  feed.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncFromScroll);
  }, { passive: true });
  feed.addEventListener('scrollend', syncFromScroll);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(syncFromScroll, { root: feed, threshold: [0, 0.5, 1] });
    panels.forEach(panel => observer.observe(panel));
  }

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isDialogOpen()) return;
    const target = event.target;
    if (target instanceof Element) {
      if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="slider"]')) return;
      if (target.closest('button, [role="button"], a, summary')) return;
      // Leave scrolling inside any future room-local scroll containers native.
      for (let element = target; element && element !== feed && element !== document.body; element = element.parentElement) {
        if (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY)) return;
      }
    }
    const index = roomOrder.indexOf(activeRoom);
    const previewIndex = panels.findIndex(panel => panel.dataset.liveRoomPanel === activeRoom);
    const nextIndex = index >= 0 ? index + 1 : rotationPanels.filter(panel => panels.indexOf(panel) < previewIndex).length;
    const previousIndex = index >= 0 ? index - 1 : nextIndex - 1;
    const destinations = { ArrowDown: nextIndex, PageDown: nextIndex, End: roomOrder.length - 1, ArrowUp: previousIndex, PageUp: previousIndex, Home: 0 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    if (wrapping) return;
    const destination = destinations[event.key];
    goTo(roomOrder[(destination + roomOrder.length) % roomOrder.length]);
  });

  // Keep native scroll-snap inside the feed. Only a fresh gesture that starts
  // at an end may wrap, so momentum arriving at the last room cannot skip it.
  const formControl = target => target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="slider"]'));
  function nestedCanScroll(target, direction) {
    for (let element = target instanceof Element ? target : null; element && element !== feed && element !== document.body; element = element.parentElement) {
      if (element.scrollHeight <= element.clientHeight + 1 || !/auto|scroll/.test(getComputedStyle(element).overflowY)) continue;
      if (direction > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 1) return true;
    }
    return false;
  }
  function boundaryTarget(direction) {
    if (resizeRoom || feed.clientHeight !== settledHeight || rotationPanels.length < 2) return null;
    const first = rotationPanels[0], last = rotationPanels[rotationPanels.length - 1];
    // Safari can report offsets beyond either end during its elastic bounce.
    // Those are still boundary gestures; offsets inside the feed must settle.
    if (direction > 0 && activeRoom === last.dataset.liveRoomPanel && feed.scrollTop >= last.offsetTop - 2) return first.dataset.liveRoomPanel;
    if (direction < 0 && activeRoom === first.dataset.liveRoomPanel && feed.scrollTop <= first.offsetTop + 2) return last.dataset.liveRoomPanel;
    return null;
  }
  let wheelAt = -Infinity, wheelTarget = null, wheelDistance = 0, wheelDirection = 0, wheelConsumed = false;
  feed.addEventListener('wheel', event => {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || isDialogOpen() || formControl(event.target)) return;
    if (!Number.isFinite(event.deltaY) || Math.abs(event.deltaY) <= Math.abs(event.deltaX || 0)) return;
    const time = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    if (wrapping) { wheelAt=time; wheelConsumed=true; event.preventDefault(); return; }
    const direction = Math.sign(event.deltaY), fresh = time - wheelAt > 200;
    wheelAt = time;
    if (fresh) {
      wheelTarget = nestedCanScroll(event.target, direction) ? null : boundaryTarget(direction);
      wheelDistance = 0; wheelDirection = direction; wheelConsumed = false;
    }
    if (wheelConsumed) { event.preventDefault(); return; }
    if (!wheelTarget || direction !== wheelDirection || boundaryTarget(direction) !== wheelTarget || nestedCanScroll(event.target, direction)) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? feed.clientHeight : 1;
    wheelDistance += Math.abs(event.deltaY) * unit;
    if (wheelDistance >= 48) { wheelConsumed = true; goTo(wheelTarget); }
  }, { passive: false });

  let touchGesture = null;
  feed.addEventListener('touchstart', event => {
    touchGesture = null;
    if (wrapping || event.defaultPrevented || event.touches.length !== 1 || isDialogOpen() || formControl(event.target)) return;
    const touch = event.touches[0];
    touchGesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, room: activeRoom,
      forward: nestedCanScroll(event.target, 1) ? null : boundaryTarget(1),
      backward: nestedCanScroll(event.target, -1) ? null : boundaryTarget(-1) };
  }, { passive: true });
  feed.addEventListener('touchcancel', () => { touchGesture = null; }, { passive: true });
  feed.addEventListener('touchend', event => {
    const gesture = touchGesture; touchGesture = null;
    if (!gesture || event.defaultPrevented || event.touches.length || isDialogOpen() || activeRoom !== gesture.room) return;
    const touch = [...event.changedTouches].find(item => item.identifier === gesture.id);
    if (!touch) return;
    const dy = gesture.y - touch.clientY, dx = gesture.x - touch.clientX;
    if (Math.abs(dy) < 64 || Math.abs(dy) <= Math.abs(dx) * 1.2) return;
    const direction = Math.sign(dy), destination = direction > 0 ? gesture.forward : gesture.backward;
    if (destination && boundaryTarget(direction) === destination) { event.preventDefault(); goTo(destination); }
  }, { passive: false });

  // Native dialogs live outside the feed. Lock only this scroller while they
  // are open, so wardrobe grids retain their own normal scrolling behavior.
  function syncDialogLock() {
    if (wrapping && isDialogOpen()) finishWrap();
    feed.classList.toggle('is-dialog-open', isDialogOpen());
  }
  const dialogObserver = new MutationObserver(syncDialogLock);
  document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));

  // Keep the selected room in place after rotation or mobile toolbar changes.
  function onResize() {
    if (wrapping) finishWrap();
    if (!resizeRoom && feed.clientHeight === settledHeight) return;
    resizeRoom ??= activeRoom;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const room = resizeRoom;
      const target = panels.find(panel => panel.dataset.liveRoomPanel === room);
      settledHeight = feed.clientHeight;
      resizeRoom = null;
      if (target) feed.scrollTo({ top: target.offsetTop, behavior: 'instant' });
      if (room) updateRoom(room);
    }, 100);
  }
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(feed);
  else window.addEventListener('resize', onResize, { passive: true });

  feed.scrollTo({ top: initialPanel.offsetTop, behavior: 'instant' });
  updateRoom(initialPanel.dataset.liveRoomPanel, false);
  syncDialogLock();
})();
