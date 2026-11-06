import assert from 'node:assert/strict';
import { ActionScheduler } from '../src/canvas/action-scheduler.js';

const scheduler = new ActionScheduler({
  manifest: {
    recipes: {
      foam_wipe: {
        id: 'foam_wipe@0.1.0',
        duration: 2.4,
        phases: [
          { id: 'notice', from: 0, to: 0.55 },
          { id: 'reach', from: 0.55, to: 1.25 },
          { id: 'wipe', from: 1.25, to: 2 },
          { id: 'recover', from: 2, to: 2.4 },
        ],
        recovery: { recipe: 'idle_base', maxDuration: 0.6 },
      },
    },
  },
});

function advanceFor(seconds) {
  const steps = Math.ceil(seconds / 0.05);
  for (let index = 0; index < steps; index += 1) scheduler.advance(0.05);
}

const action = scheduler.start({ type: 'foam_wipe', intensity: 0.85, seed: 17 });
assert.equal(action.actionId, 'foam_wipe-0001');
assert.equal(action.recipeId, 'foam_wipe@0.1.0');
assert.equal(scheduler.lastStatus, 'running');

advanceFor(0.6);
assert.equal(scheduler.phase(action, action.elapsed / action.duration), 'reach');
advanceFor(0.8);
assert.equal(scheduler.phase(action, action.elapsed / action.duration), 'contact');

const interrupted = scheduler.interrupt({ actionId: action.actionId, reason: 'test-interrupt' });
assert.equal(interrupted.interrupted, true);
assert.equal(scheduler.lastStatus, 'interrupting');
advanceFor(0.6);
assert.equal(interrupted.interruptElapsed, interrupted.interruptDuration);
scheduler.complete(interrupted, 'interrupted');
assert.equal(scheduler.lastStatus, 'interrupted');
assert.equal(scheduler.lastAction.actionId, 'foam_wipe-0001');
assert.equal(scheduler.active, null);

const second = scheduler.start('foam_wipe');
assert.equal(second.actionId, 'foam_wipe-0002');
advanceFor(2.4);
scheduler.complete(second, 'completed');
assert.equal(scheduler.lastStatus, 'completed');
assert.equal(scheduler.lastAction.actionId, 'foam_wipe-0002');

console.log('action-scheduler: pass');
