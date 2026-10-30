/* Deliberate, fixed-size painted poses. Only the props and magic move continuously. */
(() => {
  'use strict';
  const cardIds = new Set(['cat', 'lantern', 'door', 'teacup', 'fox', 'thread', 'star', 'plate', 'mirror', 'key']);
  function frame(input = {}, { reduced = false } = {}) {
    let pose = 'idle', cardId = null;
    void reduced;
    if (input.action === 'card') pose = 'shuffle';
    else if (input.action === 'reveal') {
      pose = input.revealed ? 'reveal' : 'shuffle';
      if (input.revealed) {
        const id = input.cards?.[input.selectedIndex]?.id;
        if (cardIds.has(id)) cardId = id;
      }
    } else if (input.action === 'tea' || (!input.action && input.ambientTea)) pose = 'tea';
    else if (!input.action && input.resting) pose = 'idle';
    else if (input.activity === 'crystal') pose = 'crystal';
    else if (input.activity === 'surprise') pose = 'surprise';
    else if (input.result?.kind === 'card' && cardIds.has(input.result.cardId)) {
      pose = 'reveal'; cardId = input.result.cardId;
    }
    return { pose, cardId, showHeldCard: pose === 'reveal' && cardId !== null };
  }
  globalThis.FortuneMotion = Object.freeze({ frame });
})();
