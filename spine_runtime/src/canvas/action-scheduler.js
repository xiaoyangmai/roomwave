/*
 * Finite action lifecycle for the Roomwave runtime.
 *
 * This module owns recipe selection, action identity, phase timing and
 * interruption status. It does not know about Spine bones or rendering.
 */
export class ActionScheduler {
  constructor({ manifest = null } = {}) {
    this.manifest = manifest || {};
    this.sequence = 0;
    this.active = null;
    this.activeActionId = null;
    this.activeRecipeId = null;
    this.lastActionId = null;
    this.lastRecipeId = null;
    this.lastStatus = 'idle';
    this.lastAction = null;
  }

  start(action, options = {}) {
    const type = typeof action === 'string' ? action : action?.type;
    if (!type) return false;
    if (this.active) this.interrupt({ reason: 'superseded' });

    const recipe = options.recipe || action?.recipe || this.manifest?.recipes?.[type] || null;
    const recipeId = typeof recipe === 'string'
      ? recipe
      : recipe?.id || action?.recipeId || options.recipeId || type;
    const duration = Math.max(0.35, Number(options.duration || action?.duration || recipe?.duration || (type === 'foam_wipe' ? 2.4 : 1.25)));
    const actionId = String(options.actionId || action?.actionId || `${type}-${String(++this.sequence).padStart(4, '0')}`);
    const generated = {
      actionId,
      recipeId,
      type,
      recipe,
      elapsed: 0,
      duration,
      intensity: Math.max(0, Math.min(1, Number(options.intensity ?? action?.intensity ?? 0.8))),
      seed: Number(options.seed ?? action?.seed ?? 17),
      interrupted: false,
    };

    this.active = generated;
    this.activeActionId = actionId;
    this.activeRecipeId = recipeId;
    this.lastActionId = actionId;
    this.lastRecipeId = recipeId;
    this.lastStatus = 'running';
    this.lastAction = { actionId, recipeId, type, status: 'running', reason: null };
    return generated;
  }

  interrupt({ actionId = null, reason = 'manual', duration = null } = {}) {
    const action = this.active;
    if (!action || (actionId && action.actionId !== actionId)) return false;
    action.interrupted = true;
    action.interruptElapsed = 0;
    action.interruptDuration = Math.max(0.2, Number(duration || action.recipe?.recovery?.maxDuration || 0.45));
    action.interruptReason = reason;
    this.lastStatus = 'interrupting';
    this.lastAction = { actionId: action.actionId, recipeId: action.recipeId, type: action.type, status: 'interrupting', reason };
    return action;
  }

  advance(deltaSeconds) {
    const action = this.active;
    if (!action) return null;
    const dt = Math.max(0, Math.min(0.05, Number(deltaSeconds) || 0));
    if (action.interrupted) {
      action.interruptElapsed = Math.min(action.interruptDuration, action.interruptElapsed + dt);
    } else {
      action.elapsed = Math.min(action.duration, action.elapsed + dt);
    }
    return action;
  }

  phase(action, normalizedProgress) {
    const phases = Array.isArray(action?.recipe?.phases) ? action.recipe.phases : [];
    if (phases.length) {
      const maxTo = Math.max(...phases.map((item) => Number(item.to) || 0));
      const phase = phases.find((item) => normalizedProgress < (
        maxTo <= 1
          ? Number(item.to)
          : Number(item.to) / Math.max(0.001, Number(action.recipe.duration || action.duration))
      )) || phases[phases.length - 1];
      const id = phase?.id || 'notice';
      return id === 'wipe' ? 'contact' : id;
    }
    return normalizedProgress < 0.22 ? 'notice' : normalizedProgress < 0.55 ? 'reach' : normalizedProgress < 0.84 ? 'contact' : 'recover';
  }

  complete(action = this.active, status = 'completed') {
    if (!action || action !== this.active) return false;
    this.active = null;
    this.activeActionId = null;
    this.activeRecipeId = null;
    this.lastStatus = status;
    this.lastAction = {
      actionId: action.actionId,
      recipeId: action.recipeId,
      type: action.type,
      status,
      reason: action.interruptReason || null,
    };
    return true;
  }

  reset() {
    this.active = null;
    this.activeActionId = null;
    this.activeRecipeId = null;
    this.lastStatus = 'idle';
    this.lastAction = null;
  }

  snapshot() {
    return {
      activeActionId: this.activeActionId,
      activeRecipeId: this.activeRecipeId,
      lastActionId: this.lastActionId,
      lastRecipeId: this.lastRecipeId,
      status: this.lastStatus,
      lastAction: this.lastAction,
    };
  }
}
