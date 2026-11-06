const assert = require('node:assert/strict');

// Read the timing from the same skeleton that the test will load, not a prior pack.
module.exports = function foamReviewTiming(skeleton) {
  const events = Object.fromEntries(skeleton.animations.foam_wipe.events.map(({ name, time = 0 }) => [name, time]));
  const notice = events.FoamNotice;
  const contact = events.FoamContact;
  const cleared = events.FoamCleared;
  const complete = events.FoamComplete;
  assert.ok(notice >= 0 && notice < contact && contact < cleared && cleared < complete,
    'foam_wipe requires ordered notice, contact, clear and complete events for these checks.');
  return {
    notice, contact, cleared, complete,
    beforeContact: (notice + contact) / 2,
    contactEarly: contact + (cleared - contact) / 4,
    contactLate: contact + (cleared - contact) * 3 / 4,
    afterClear: (cleared + complete) / 2,
  };
};
