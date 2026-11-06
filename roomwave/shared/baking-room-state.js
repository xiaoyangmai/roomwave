/* The baker commits one choice at a time; only settled cake parts are saved. */
(() => {
  'use strict';
  const storageKey='roomwave-baking-v1';
  const flavors=Object.freeze(['vanilla','chocolate','strawberry']);
  const fillings=Object.freeze(['cream','chocolate','strawberry']);
  const frostings=Object.freeze(['white','pink','chocolate','naked']);
  const ingredients=Object.freeze(['strawberry','chocolate','sprinkles','blueberry','cherry','kiwi','cream','macaron','candle']);
  const maxLayers=4,maximum=60,perIngredient=24;
  const ambientIdle=Object.freeze({delay:12000,variation:8000,duration:3200,actions:Object.freeze(['apron','spoon','strawberry'])});
  const actions=Object.freeze(Object.fromEntries([
    ...flavors.map(key=>[`sponge:${key}`,2400]),
    ...fillings.map(key=>[`filling:${key}`,2000]),
    ...frostings.map(key=>[`icing:${key}`,2600]),
    ...ingredients.map(key=>[`decor:${key}`,1800]),
    ['finish',2600],['flour',2600],['clean',1800]
  ]));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const empty=()=>Object.fromEntries(ingredients.map(key=>[key,0]));
  const amount=decorations=>ingredients.reduce((total,key)=>total+decorations[key],0);
  const initial=()=>({version:3,cakes:0,layers:[],frosting:null,decorations:empty(),placements:[],completed:false,flour:0});
  const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
  const copyPlacements=placements=>placements.map(piece=>({...piece}));
  const ingredientLimit=key=>key==='chocolate'?3:perIngredient;
  const validPoint=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&x*x+y*y<=1;
  function decorationPosition(key,serving=0){
    const type=['strawberry','blueberry','cherry','kiwi','cream','macaron','candle'].indexOf(key);
    if(type<0)return {x:0,y:0};
    const slot=type+serving*7,angle=slot*2.3999632297,ring=Math.sqrt(((slot%21)+.5)/21)*.8;
    return {x:Math.cos(angle)*ring,y:Math.sin(angle)*ring};
  }
  function recount(state){state.decorations=empty();for(const {key} of state.placements)state.decorations[key]++;}
  function ring(keys,radius=.72,offset=-Math.PI/2){return keys.map((key,index)=>({key,x:Math.cos(offset+index*Math.PI*2/keys.length)*radius,y:Math.sin(offset+index*Math.PI*2/keys.length)*radius}));}
  const arrangements={
    berry:[...ring(['strawberry','cream','strawberry','cream','strawberry','cream','strawberry','cream']),...ring(['blueberry','blueberry','blueberry'],.23)],
    party:[...ring(['macaron','cream','macaron','cream','macaron','cream'],.72),...ring(['candle','candle','candle'],.28),...ring(['sprinkles','sprinkles','sprinkles'],.45)],
    chocolate:[{key:'chocolate',x:0,y:0},{key:'chocolate',x:0,y:0},{key:'chocolate',x:0,y:0},...ring(['cherry','cream','cherry','cream','cherry','cream','cherry','cream'])]
  };
  function sanitize(saved) {
    const state=initial();
    if(!saved||typeof saved!=='object'||Array.isArray(saved))return state;
    if(Number.isSafeInteger(saved.cakes)&&saved.cakes>=0)state.cakes=Math.min(saved.cakes,1e9);
    if(Number.isFinite(saved.flour))state.flour=clamp(saved.flour,0,1);
    const modern=saved.version===2||saved.version===3;
    const legacy=!modern&&saved.decorations&&typeof saved.decorations==='object'&&!Array.isArray(saved.decorations)&&ingredients.some(key=>own(saved.decorations,key)&&Number.isSafeInteger(saved.decorations[key])&&saved.decorations[key]>0);
    if(legacy){
      // Old saves decorated a fixed vanilla cake. Its already awarded count is
      // authoritative; restoring it must not award another cake. An untouched
      // legacy cake starts at the empty stand so its owner can build from scratch.
      state.layers=[{flavor:'vanilla',filling:null}];state.frosting='white';
    }else if(modern&&Array.isArray(saved.layers)){
      for(const layer of saved.layers.slice(0,maxLayers)){
        if(!layer||!flavors.includes(layer.flavor))break;
        state.layers.push({flavor:layer.flavor,filling:fillings.includes(layer.filling)?layer.filling:null});
      }
      if(state.layers.length&&frostings.includes(saved.frosting))state.frosting=saved.frosting;
    }
    if(state.layers.length===maxLayers||state.frosting)state.layers.at(-1).filling=null;
    if(state.frosting){
      if(saved.version===3){
        for(const piece of Array.isArray(saved.placements)?saved.placements:[]){
          if(state.placements.length>=maximum)break;
          if(!piece||!ingredients.includes(piece.key)||!validPoint(piece.x,piece.y)||state.decorations[piece.key]>=ingredientLimit(piece.key))continue;
          state.placements.push({key:piece.key,x:piece.x,y:piece.y});state.decorations[piece.key]++;
        }
      }else{
        let remaining=maximum;
        for(const key of ingredients){
          const value=saved.decorations&&own(saved.decorations,key)?saved.decorations[key]:undefined;
          if(!Number.isSafeInteger(value))continue;
          const count=clamp(value,0,Math.min(ingredientLimit(key),remaining));
          for(let index=0;index<count;index++)state.placements.push({key,...decorationPosition(key,index)});
          state.decorations[key]=count;remaining-=count;
        }
      }
      state.completed=legacy?(saved.completed===true||amount(state.decorations)>=6):saved.completed===true;
    }
    return state;
  }
  const labels={vanilla:'Vanilla',chocolate:'Chocolate',strawberry:'Strawberry',cream:'Cream',white:'Vanilla cream',pink:'Pink icing',naked:'Keep the layers',sprinkles:'Sprinkles',blueberry:'Blueberries',cherry:'Cherries',kiwi:'Kiwi',macaron:'Macarons',candle:'Candles'};
  const icons={vanilla:'🍰',chocolate:'🍫',strawberry:'🍓',cream:'🍦',white:'🤍',pink:'🩷',naked:'🍰',sprinkles:'✨',blueberry:'🫐',cherry:'🍒',kiwi:'🥝',macaron:'🧁',candle:'🕯️'};
  const choice=(id,label,icon,detail)=>({id,label,icon,...(detail?{detail}:{})});
  function settledStage(state){
    if(state.completed)return 'finished';
    if(state.frosting)return 'decorate';
    if(!state.layers.length||state.layers.at(-1).filling)return 'sponge';
    return 'build';
  }
  function create(saved,{random=Math.random}={}) {
    const state=sanitize(saved);
    let active=false,current=null,elapsed=0,clock=0,stage=settledStage(state),gesture=false,gestureSaved=false;
    const roll=()=>{const value=typeof random==='function'?random():0;return Number.isFinite(value)?clamp(value,0,1-Number.EPSILON):0;};
    const nextIdleDelay=()=>ambientIdle.delay+roll()*ambientIdle.variation;
    // Idle gestures animate Hazel only; cake snapshots and action events stay unchanged.
    let ambientAction=null,ambientElapsed=0,idleRemaining=nextIdleDelay(),previousAmbient=null;
    const history=[];
    const snapshot=()=>({...state,layers:state.layers.map(layer=>({...layer})),decorations:{...state.decorations},placements:copyPlacements(state.placements)});
    const canDecorate=()=>active&&!current&&stage==='decorate';
    function endDecorationGesture(){const wasOpen=gesture;gesture=false;gestureSaved=false;return wasOpen;}
    function resetAmbient(){ambientAction=null;ambientElapsed=0;idleRemaining=nextIdleDelay();}
    function noteInteraction(){if(!active)return false;resetAmbient();return true;}
    function beginDecorationGesture(){if(!canDecorate())return false;if(!gesture){noteInteraction();gesture=true;gestureSaved=false;}return true;}
    function rememberDecoration(){
      if(!gesture||!gestureSaved){history.push(copyPlacements(state.placements));if(history.length>100)history.shift();if(gesture)gestureSaved=true;}
    }
    function canPlaceDecoration(key){return canDecorate()&&ingredients.includes(key)&&state.placements.length<maximum&&state.decorations[key]<ingredientLimit(key);}
    function commitDecoration(key,x,y){rememberDecoration();state.placements.push({key,x,y});state.decorations[key]++;}
    function placeDecoration(key,x,y){if(!canPlaceDecoration(key)||!validPoint(x,y))return false;noteInteraction();commitDecoration(key,x,y);return true;}
    function undoDecoration(){if(!canDecorate()||!history.length)return false;noteInteraction();endDecorationGesture();state.placements=history.pop();recount(state);return true;}
    function clearDecorations(){if(!canDecorate()||!state.placements.length)return false;noteInteraction();endDecorationGesture();rememberDecoration();state.placements=[];recount(state);return true;}
    function applyArrangement(name){
      if(!canDecorate()||!own(arrangements,name))return false;
      const next=arrangements[name];
      if(JSON.stringify(state.placements)===JSON.stringify(next))return false;
      noteInteraction();endDecorationGesture();rememberDecoration();state.placements=copyPlacements(next);recount(state);return true;
    }
    function choices(){
      if(stage==='sponge')return [
        ...flavors.map(key=>choice(`sponge:${key}`,labels[key],icons[key],state.layers.length?'Next sponge':'First sponge')),
        ...(state.layers.length&&!state.layers.at(-1).filling?[choice('back','Back','↩')]:[])
      ];
      if(stage==='build')return [
        ...(state.layers.length<maxLayers?[choice('menu:fill','Add filling','🍓','Then another layer'),choice('menu:layer','Add a layer','🍰')]:[]),
        choice('menu:icing','Time for icing','🧁',state.layers.length===maxLayers?'Our cake is tall enough!':'Or keep the layers showing')
      ];
      if(stage==='filling')return [...fillings.map(key=>choice(`filling:${key}`,key==='strawberry'?'Strawberry jam':labels[key],icons[key])),choice('back','Back','↩')];
      if(stage==='icing')return [...frostings.map(key=>choice(`icing:${key}`,labels[key],icons[key])),choice('back','Back','↩')];
      if(stage==='decorate')return [
        ...ingredients.map(key=>choice(`decor:${key}`,key==='chocolate'?'Choc drizzle':labels[key],icons[key])),
        choice('finish','Finish cake','🎂','Ready whenever you are')
      ];
      return [choice('newCake','Make another','🍰')];
    }
    function canStart(action){
      if(!active||current||typeof action!=='string')return false;
      if(action==='flour')return true;
      if(action==='clean')return state.flour>.02;
      if(action.startsWith('decor:'))return canPlaceDecoration(action.slice(6));
      return choices().some(option=>option.id===action);
    }
    function start(action){
      if(!canStart(action))return false;
      noteInteraction();endDecorationGesture();
      if(action==='newCake'){
        state.layers=[];state.frosting=null;state.decorations=empty();state.placements=[];history.length=0;state.completed=false;stage='sponge';return true;
      }
      if(action==='back'){stage='build';return true;}
      if(action==='menu:fill'){stage='filling';return true;}
      if(action==='menu:layer'){stage='sponge';return true;}
      if(action==='menu:icing'){stage='icing';return true;}
      if(!own(actions,action))return false;
      current=action;elapsed=0;return true;
    }
    function tick(delta){
      const events=[];
      if(!active||!Number.isFinite(delta)||delta<=0)return events;
      delta=Math.min(delta,100);clock+=delta;
      state.flour=clamp(state.flour-delta*(current==='clean'?.00072:.000007),0,1);
      if(!current){
        if(gesture)return events;
        if(ambientAction){
          ambientElapsed+=delta;
          if(ambientElapsed>=ambientIdle.duration)resetAmbient();
        }else{
          idleRemaining-=delta;
          if(idleRemaining<=0){
            // A tall cake is enlarged while decorating and hides the apron.
            const apronVisible=stage!=='decorate'||state.layers.length<3;
            const candidates=ambientIdle.actions.filter(action=>action!==previousAmbient&&(apronVisible||action!=='apron'));
            ambientAction=candidates[Math.floor(roll()*candidates.length)];previousAmbient=ambientAction;ambientElapsed=0;
          }
        }
        return events;
      }
      elapsed+=delta;
      if(current==='flour'&&elapsed>280)state.flour=clamp(state.flour+delta*.00095,0,1);
      if(elapsed<actions[current])return events;
      const [kind,key]=current.split(':');
      if(kind==='sponge'){state.layers.push({flavor:key,filling:null});stage='build';}
      else if(kind==='filling'){state.layers.at(-1).filling=key;stage='sponge';}
      else if(kind==='icing'){state.frosting=key;stage='decorate';}
      else if(kind==='decor'){const point=decorationPosition(key,state.decorations[key]);commitDecoration(key,point.x,point.y);}
      else if(current==='finish'){
        state.completed=true;state.cakes=Math.min(1e9,state.cakes+1);stage='finished';events.push('cake');
      }else if(current==='clean')state.flour=0;
      current=null;elapsed=0;events.push('complete');return events;
    }
    function copy(){
      const count=amount(state.decorations),[kind,key]=(current||'').split(':');
      const titles={sponge:state.layers.length?'Choose the next layer':'Let’s make a cake',build:'What comes next?',filling:'Choose a filling',icing:'Choose the finish',decorate:'Decorate your cake',finished:'Made together'};
      const prompts={sponge:state.layers.length?'One more sponge to go on top. Which flavor?':'An empty stand and so many possibilities. Pick a sponge!',build:state.layers.length===maxLayers?'Four lovely layers! Let’s choose a finish.':'A filling, another layer, or shall we ice it?',filling:'A little something delicious between the layers…',icing:'Shall we cover it in icing or show those lovely layers?',decorate:count===maximum?'Our cake is full of lovely touches! Undo one, try a new style, or show it off.':'Pick a topping, then tap the cake to place it. Try a pattern and make it your own!',finished:'Look what we made! Shall we make another?'};
      let text=stage==='decorate'&&count<maximum?'A berry border? A sprinkle trail? Make it your own!':prompts[stage];
      if(kind==='sponge')text=`One ${labels[key].toLowerCase()} layer, coming right up…`;
      else if(kind==='filling')text=`Spreading a little ${key==='strawberry'?'strawberry jam':labels[key].toLowerCase()}…`;
      else if(kind==='icing')text=key==='naked'?'Let’s show off our beautiful layers.':'A smooth coat of '+labels[key].toLowerCase()+'…';
      else if(kind==='decor')text=key==='candle'?'A few candles for our special cake…':`Adding ${key==='chocolate'?'a chocolate drizzle':labels[key].toLowerCase()}…`;
      else if(current==='finish')text='Our own little masterpiece. Ready for its close-up!';
      else if(current==='flour')text='Oh! I think I’m wearing the flour!';
      else if(current==='clean')text='There. All tidy again!';
      return {...snapshot(),stage,title:titles[stage],text,action:current,actionProgress:current?clamp(elapsed/actions[current],0,1):0,ambientAction,ambientProgress:ambientAction?clamp(ambientElapsed/ambientIdle.duration,0,1):0,elapsed,duration:current?actions[current]:0,clock,busy:Boolean(current),choices:choices(),count,maximum,maxLayers,canUndo:canDecorate()&&history.length>0,progress:state.completed?100:state.frosting?75:state.layers.length?Math.min(60,15+state.layers.length*10):0};
    }
    return {
      checkpoint() { return globalThis.RoomwaveCodec.encode({ checkpointVersion: 1, state,active,current,elapsed,clock,stage,gesture,gestureSaved,ambientAction,ambientElapsed,idleRemaining,previousAmbient,history }); },
      restore(checkpoint) {
        const data = globalThis.RoomwaveCodec.decode(checkpoint);
        if (data?.checkpointVersion !== 1) throw new Error('Incompatible room checkpoint');
        Object.assign(state, data.state);
        ({active,current,elapsed,clock,stage,gesture,gestureSaved,ambientAction,ambientElapsed,idleRemaining,previousAmbient} = data);
        history.splice(0,history.length,...data.history);
      },
      get state(){return snapshot()},get frame(){return copy()},get active(){return active},get action(){return current},
      setActive(value){active=Boolean(value);if(!active)endDecorationGesture();},canStart,start,tick,noteInteraction,
      canPlaceDecoration,placeDecoration,beginDecorationGesture,endDecorationGesture,undoDecoration,clearDecorations,applyArrangement,
      cancelPending(){endDecorationGesture();resetAmbient();current=null;elapsed=0;stage=settledStage(state);}
    };
  }
  globalThis.BakingState=Object.freeze({storageKey,create,sanitize,actions,ambientIdle,ingredients,flavors,fillings,frostings,maxLayers,maximum,perIngredient,decorationPosition});
})();
