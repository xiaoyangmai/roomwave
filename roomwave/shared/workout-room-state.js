/* Local workout progress is independent of streamer wallets. */
(() => {
  'use strict';
  const storageKey = 'roomwave-workout-v1';
  const yogaPoses = Object.freeze([
    ['mountain','Mountain','yoga-0',1,false,'Stand tall and settle in.'],
    ['tree','Tree','yoga-1',1,false,'Find your balance.'],
    ['raised-tree','Raised tree','yoga-2',1,false,'Reach toward the sunshine.'],
    ['warrior','Warrior II','yoga-3',1,false,'Steady and strong.'],
    ['triangle','Triangle','yoga-triangle',2,false,'Make a little space to stretch.'],
    ['crescent-lunge','Crescent lunge','yoga-crescent-lunge',2,false,'A gentle reach to the sky.'],
    ['chair','Chair','yoga-chair',2,false,'Take it slow and steady.'],
    ['downward-dog','Downward dog','yoga-downward-dog',2,true,'A long, easy stretch.'],
    ['cobra','Cobra','yoga-cobra',2,true,'Open up to the sunshine.'],
    ['childs-pose',"Child’s pose",'yoga-childs-pose',2,true,'A quiet moment to rest.'],
    ['seated-twist','Seated twist','yoga-seated-twist',2,true,'Unwind a little.'],
    ['butterfly','Butterfly','yoga-butterfly',2,true,'Finish with a peaceful breath.']
  ].map(([id,label,pose,version,floor,text]) => Object.freeze({id,label,pose,version,floor,text})));
  const yogaRoutines = Object.freeze([
    ['mountain', 'tree', 'raised-tree', 'warrior', 'triangle', 'crescent-lunge', 'chair', 'downward-dog', 'cobra', 'childs-pose', 'seated-twist', 'butterfly'],
    ['mountain', 'chair', 'crescent-lunge', 'warrior', 'triangle', 'tree', 'raised-tree', 'downward-dog', 'cobra', 'seated-twist', 'butterfly', 'childs-pose'],
    ['mountain', 'warrior', 'triangle', 'crescent-lunge', 'chair', 'tree', 'raised-tree', 'downward-dog', 'cobra', 'childs-pose', 'seated-twist', 'butterfly']
  ].map(routine => Object.freeze(routine.map(id => yogaPoses.find(pose => pose.id === id)))));
  // ENERGY / STAMINA CONFIGURATION
  // Rates are energy points per second; durations and repetition pauses are milliseconds.
  // Recovery applies during every visible moment. Drain applies only while moving a rep.
  const energyConfig = Object.freeze({
    maximum: 100,
    naturalRecoveryRate: .8,
    pushupDrain: 1.95,
    squatDrain: 1.8,
    weightDrain: 1.7,
    yogaDrain: 0,
    mediumThreshold: 75,
    lowThreshold: 35,
    exhaustionThreshold: 12,
    exhaustedRestDuration: 5500,
    tiredRestDuration: 1900,
    pushupRestTransitionDuration: 360,
    tiredReactionProbability: .24,
    exhaustedReactionProbability: .65,
    reactionCooldownReps: 2,
    restDurationVariation: .15,
    mediumSlowdown: .1,
    lowSlowdown: .3,
    exhaustedSlowdown: .4,
    mediumPause: 280,
    lowPause: 650,
    exhaustedPause: 950
  });
  const reactionPoses = Object.freeze([
    ['pushups-rest-chest', 'pushups', true, 'Chest-down rest'],
    ['pushups-rest-hips', 'pushups', true, 'Catching a breath'],
    ['squats-rest', 'squats', false, 'Hands-on-knees rest'],
    ['weights-rest', 'weights', false, 'Weights-down rest']
  ].map(([pose, action, floor, label]) => Object.freeze({ pose, action, floor, label, version: 3 })));
  const initial = { sets: 0, reps: 0, yogaSessions: 0, energy: energyConfig.maximum };
  const exercises = Object.freeze({
    pushups: Object.freeze({ label: 'Pushups', counter: 'Pushups', repetitions: 8, cycle: 2100 }),
    squats: Object.freeze({ label: 'Squats', counter: 'Squats', repetitions: 10, cycle: 1900 }),
    weights: Object.freeze({ label: 'Weights', counter: 'Curls', repetitions: 10, cycle: 1800 }),
    yoga: Object.freeze({ label: 'Yoga', counter: 'Breaths', repetitions: yogaPoses.length, cycle: 4000 })
  });
  const idleExerciseDelay = 15000;
  function sanitize(saved) {
    const state = { ...initial };
    if (!saved || typeof saved !== 'object') return state;
    for (const key of ['sets', 'reps', 'yogaSessions']) if (Number.isSafeInteger(saved[key]) && saved[key] >= 0) state[key] = Math.min(saved[key], 1e9);
    if (Number.isFinite(saved.energy)) state.energy = Math.max(0, Math.min(energyConfig.maximum, saved.energy));
    return state;
  }
  function create(saved, { random = Math.random } = {}) {
    const state = sanitize(saved);
    let active = false, current = null, elapsed = 0, repetitions = 0, last = null, completed = false, idleElapsed = 0;
    let yogaRoutine = yogaRoutines[0];
    let pace = 1, pauseRemaining = 0, restRemaining = 0, restDuration = 0, reaction = null, reactionPose = null, cooldown = 0;
    const target = name => exercises[name].repetitions;
    const yogaFrame = () => yogaRoutine[Math.min(yogaRoutine.length - 1, repetitions)];
    const energyRange = () => state.energy > energyConfig.mediumThreshold ? 'high'
      : state.energy > energyConfig.lowThreshold ? 'medium'
      : state.energy > energyConfig.exhaustionThreshold ? 'low' : 'exhausted';
    const roll = () => {
      const value = random();
      return Number.isFinite(value) ? Math.max(0, Math.min(.999999, value)) : .5;
    };
    const recover = (duration, drain = 0) => {
      state.energy = Math.max(0, Math.min(energyConfig.maximum, state.energy + (energyConfig.naturalRecoveryRate - drain) * duration / 1000));
    };
    function pacing() {
      const range = energyRange();
      if (range === 'high') return { speed: 1, pause: 0 };
      // Interpolate pacing across the ranges so a threshold never causes a sudden lurch.
      const thresholds = [energyConfig.mediumThreshold, energyConfig.lowThreshold, energyConfig.exhaustionThreshold, 0];
      const slowdowns = [0, energyConfig.mediumSlowdown, energyConfig.lowSlowdown, energyConfig.exhaustedSlowdown];
      const pauses = [0, energyConfig.mediumPause, energyConfig.lowPause, energyConfig.exhaustedPause];
      const index = range === 'medium' ? 0 : range === 'low' ? 1 : 2;
      const amount = (thresholds[index] - state.energy) / (thresholds[index] - thresholds[index + 1]);
      return { speed: 1 + slowdowns[index] + (slowdowns[index + 1] - slowdowns[index]) * amount,
        pause: pauses[index] + (pauses[index + 1] - pauses[index]) * amount };
    }
    function betweenReps() {
      const timing = pacing();
      pace = timing.speed; pauseRemaining = timing.pause;
      if (cooldown > 0) { cooldown--; return; }
      const range = energyRange();
      if (range !== 'low' && range !== 'exhausted') return;
      const exhausted = range === 'exhausted';
      if (roll() >= (exhausted ? energyConfig.exhaustedReactionProbability : energyConfig.tiredReactionProbability)) return;
      reaction = exhausted ? 'exhausted' : 'tired';
      const choices = reactionPoses.filter(item => item.action === current && (exhausted || item.pose !== 'pushups-rest-chest'));
      reactionPose = choices[Math.floor(roll() * choices.length)];
      restDuration = (exhausted ? energyConfig.exhaustedRestDuration : energyConfig.tiredRestDuration)
        * (1 + (roll() * 2 - 1) * energyConfig.restDurationVariation);
      restRemaining = restDuration + (current === 'pushups' ? energyConfig.pushupRestTransitionDuration * 2 : 0);
      pauseRemaining = 0;
      cooldown = energyConfig.reactionCooldownReps;
    }
    function start(exercise) {
      if (!active || typeof exercise !== 'string' || !Object.hasOwn(exercises, exercise)) return false;
      if (current === exercise) return false;
      if (exercise === 'yoga') {
        yogaRoutine = yogaRoutines[state.yogaSessions % yogaRoutines.length];
        state.yogaSessions = state.yogaSessions < 1e9 ? state.yogaSessions + 1 : 0;
      }
      current = exercise; last = exercise; elapsed = 0; repetitions = 0; completed = false; idleElapsed = 0;
      pauseRemaining = 0; restRemaining = 0; reaction = null; reactionPose = null; cooldown = 0;
      pace = exercise === 'yoga' ? 1 : pacing().speed;
      return true;
    }
    return {
      checkpoint() { return globalThis.RoomwaveCodec.encode({ checkpointVersion: 1, state,active,current,elapsed,repetitions,last,completed,idleElapsed,yogaRoutine,pace,pauseRemaining,restRemaining,restDuration,reaction,reactionPose,cooldown }); },
      restore(checkpoint) {
        const data = globalThis.RoomwaveCodec.decode(checkpoint);
        if (data?.checkpointVersion !== 1) throw new Error('Incompatible room checkpoint');
        Object.assign(state, data.state);
        ({active,current,elapsed,repetitions,last,completed,idleElapsed,yogaRoutine,pace,pauseRemaining,restRemaining,restDuration,reaction,reactionPose,cooldown} = data);
        
      },
      get state() { return { ...state }; },
      get active() { return active; },
      get action() { return current; },
      get elapsed() { return elapsed; },
      setActive(value) { active = Boolean(value); },
      start,
      tick(delta) {
        if (!active || !Number.isFinite(delta) || delta <= 0) return null;
        delta = Math.min(delta, 1000);
        let event = null;
        // Split a tick at phase boundaries: resting never accidentally drains energy,
        // and a completed set can recover for the remainder of the same frame.
        while (delta > .000001) {
          if (!current) {
            const idleRemaining = Math.max(0, idleExerciseDelay - idleElapsed);
            const recoveryRemaining = (energyConfig.maximum - state.energy) * 1000 / energyConfig.naturalRecoveryRate;
            const step = Math.min(delta, idleRemaining > 0 ? idleRemaining : Infinity,
              recoveryRemaining > 0 ? recoveryRemaining : Infinity);
            recover(step); idleElapsed = Math.min(idleExerciseDelay, idleElapsed + step); delta -= step;
            // Land exactly on full energy even when a frame crosses the recovery boundary.
            if (step + .000001 >= recoveryRemaining) state.energy = energyConfig.maximum;
            if (step + .000001 >= idleRemaining) idleElapsed = idleExerciseDelay;
            if (idleElapsed >= idleExerciseDelay && state.energy === energyConfig.maximum) {
              const choices = Object.keys(exercises).filter(name => name !== last);
              start(choices[Math.floor(roll() * choices.length)]); event = 'start';
            }
            continue;
          }
          if (restRemaining > 0) {
            const step = Math.min(delta, restRemaining);
            recover(step); restRemaining -= step; delta -= step;
            if (restRemaining <= .000001) {
              restRemaining = 0; reaction = null; reactionPose = null; pace = pacing().speed;
            }
            continue;
          }
          if (pauseRemaining > 0) {
            const step = Math.min(delta, pauseRemaining);
            recover(step); pauseRemaining -= step; delta -= step;
            continue;
          }
          const exercise = exercises[current], count = target(current);
          const remaining = (exercise.cycle * (repetitions + 1) - elapsed) * pace;
          const step = Math.min(delta, remaining);
          const drain = current === 'pushups' ? energyConfig.pushupDrain : current === 'squats' ? energyConfig.squatDrain
            : current === 'weights' ? energyConfig.weightDrain : energyConfig.yogaDrain;
          recover(step, drain); elapsed += step / pace; delta -= step;
          if (step + .000001 >= remaining) {
            repetitions++; elapsed = repetitions * exercise.cycle;
            if (current !== 'yoga') state.reps = Math.min(1e9, state.reps + 1);
            event = 'rep';
            if (repetitions === count) {
              state.sets = Math.min(1e9, state.sets + 1);
              completed = true; current = null; idleElapsed = 0; event = 'complete';
            } else if (current !== 'yoga') betweenReps();
          }
        }
        return event;
      },
      get frame() {
        const name = current || last || 'weights', exercise = exercises[name];
        const selected = yogaFrame();
        const transition = current === 'pushups' ? energyConfig.pushupRestTransitionDuration : 0;
        const reactionStage = !reaction ? null : restRemaining > restDuration + transition ? 'settling'
          : transition > 0 && restRemaining <= transition ? 'resuming' : 'resting';
        const energy = { energy: state.energy, energyRange: energyRange(), resting: Boolean(reaction), reaction,
          reactionStage, reactionPose: reactionPose?.pose || null, pause: pauseRemaining > 0 };
        if (!current) {
          return {
            ...energy,
            action: null, pose: 'weights-0', repetitions,
            target: target(name), label: exercise.counter, progress: completed ? 1 : 0,
            text: completed ? 'Great set! What shall we do next?' : 'Let’s get moving!', cue: completed ? 'Set complete' : 'Choose an exercise', completed,
            poseName: '', floor: false
          };
        }
        const progress = elapsed / (exercise.cycle * target(current));
        const cycle = (elapsed % exercise.cycle) / exercise.cycle;
        let pose, cue, text;
        if (reaction) {
          pose = reactionPose.pose; cue = reaction === 'exhausted' ? 'Catching her breath' : 'Taking a breath';
          text = reaction === 'exhausted' ? 'Whew… just a little breather!' : 'One breath… then another rep!';
          if (reactionStage === 'settling' || reactionStage === 'resuming') {
            const phase = reactionStage === 'settling' ? (restDuration + transition * 2 - restRemaining) / transition
              : (transition - restRemaining) / transition;
            const index = Math.min(2, Math.floor(phase * 3));
            pose = `pushups-${reactionStage === 'settling' ? index + 1 : 3 - index}`;
          }
        } else if (current === 'yoga') {
          pose = selected.pose; cue = cycle < .5 ? 'Breathe in' : 'Breathe out'; text = selected.text;
        } else {
          const index = Math.min(3, Math.round((1 - Math.cos(cycle * Math.PI * 2)) * 1.5));
          pose = `${current}-${index}`;
          cue = current === 'weights' ? (cycle < .5 ? 'Curl up' : 'Lower slowly') : (cycle < .5 ? 'Lower' : 'Push up');
          const remaining = target(current) - repetitions;
          text = remaining <= 3 ? `${remaining === 1 ? 'One' : remaining} more!` : repetitions === 0 ? 'You’ve got this!' : 'Looking strong!';
          if (pauseRemaining > 0) cue = 'Steady breath';
        }
        return { ...energy, action: current, pose, repetitions, target: target(current), label: exercise.counter, progress, text, cue, completed: false,
          poseName: current === 'yoga' ? selected.label : '', floor: reaction ? reactionPose.floor : current === 'yoga' && selected.floor };
      }
    };
  }
  globalThis.WorkoutState = Object.freeze({ create, sanitize, exercises, yogaPoses, yogaRoutines, energyConfig, reactionPoses, storageKey, idleExerciseDelay });
})();
