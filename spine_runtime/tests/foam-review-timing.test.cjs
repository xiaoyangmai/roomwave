const test = require('node:test');
const assert = require('node:assert/strict');
const foamReviewTiming = require('./foam-review-timing.cjs');
const foamPalmLineage = require('./foam-review-anchor.cjs');

test('sampling follows the skeleton event phases for different authored timings', () => {
  for (const times of [[0.1, 1.1, 2.15, 3.6], [0.15, 0.65, 1.4, 2.3]]) {
    const names = ['FoamNotice', 'FoamContact', 'FoamCleared', 'FoamComplete'];
    const skeleton = { animations: { foam_wipe: { events: times.map((time, i) => ({ name: names[i], time })) } } };
    const timing = foamReviewTiming(skeleton);
    assert.deepEqual([timing.notice, timing.contact, timing.cleared, timing.complete], times);
    assert.ok(timing.notice < timing.beforeContact && timing.beforeContact < timing.contact);
    assert.ok(timing.contact < timing.contactEarly && timing.contactEarly < timing.contactLate && timing.contactLate < timing.cleared);
    assert.ok(timing.cleared < timing.afterClear && timing.afterClear < timing.complete);
  }
  const zeroTime = { animations: { foam_wipe: { events: [
    { name: 'FoamNotice' }, { name: 'FoamContact', time: 0.5 },
    { name: 'FoamCleared', time: 1 }, { name: 'FoamComplete', time: 2 },
  ] } } };
  assert.equal(foamReviewTiming(zeroTime).notice, 0);
});

test('palm anchor checks the intended hand on the actual skeleton', () => {
  const skeleton = { bones: [
    { name: 'root' }, { name: 'right_hand', parent: 'root' },
    { name: 'index', parent: 'right_hand' }, { name: 'foam_palm_anchor', parent: 'index' },
    { name: 'left_hand', parent: 'root' },
  ] };
  assert.deepEqual(foamPalmLineage(skeleton, 'right_hand'), ['foam_palm_anchor', 'index', 'right_hand', 'root']);
  assert.throws(() => foamPalmLineage(skeleton, 'left_hand'), /not attached/);
});

test('sampling refuses a clip with missing or out-of-order foam events', () => {
  const skeleton = { animations: { foam_wipe: { events: [
    { name: 'FoamNotice', time: 0.1 }, { name: 'FoamContact', time: 1 },
    { name: 'FoamCleared', time: 0.8 }, { name: 'FoamComplete', time: 2 },
  ] } } };
  assert.throws(() => foamReviewTiming(skeleton), /ordered/);
  skeleton.animations.foam_wipe.events.pop();
  assert.throws(() => foamReviewTiming(skeleton), /ordered/);
});
