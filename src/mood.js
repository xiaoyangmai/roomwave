'use strict';
// A small, personal mood memory. Reactions and countdowns keep control of poses.
(() => {
  const storageKey='roomwave-mood-v1',halfLife=5*60*1000;
  const names={lily:'Lily',stella:'Stella',mia:'Mia'},ids=Object.keys(names);
  const goodGifts=new Set(['rose','heart','corgi']);
  const badGifts=new Set(['gg','sunglasses']);
  const angryLines=[
    'I hate you.',
    'You’re worse than a dog.',
    'You’re the worst.',
    'You’re such an idiot.',
    'You’re a walking headache.',
    'Even a dog has better manners.',
    'I’m so done with you.',
    'You’re really getting on my nerves.',
    'You’re such a loser.',
    'You’re a complete nuisance.',
    'You’re as useful as a broken umbrella.',
    'I’ve met houseplants with more sense.',
    'Did you leave your brain somewhere?',
    'You have the charm of a wet sock.',
    'You make being annoying look effortless.',
    'Your gifts beat your personality.',
    'You’re embarrassing yourself.',
    'You really don’t know when to quit.',
    'You’re all trouble and no charm.',
    'Congratulations. You’re still the worst.',
    'If being annoying paid, you’d be rich.',
    'You couldn’t behave if you tried.',
    'You’re a headache with a gift button.',
    'A mute button would suit you.',
    'Even my patience wants to block you.',
    'You make a terrible first impression.',
    'You’re the reason eye rolls exist.',
    'Annoying me is your only talent.',
    'A mosquito is better company than you.',
    'You’re a clown without the funny part.',
    'Do you practice being this obnoxious?',
    'The door has more charm than you.',
    'Leave the room.',
    'Block him.',
    'Don’t you love me? Prove it by buying me a dance.'
  ];
  const happyLines=[
    'You always know how to make me smile.',
    'You’re pretty adorable, you know that?',
    'That was cute. Just like you.',
    'You’ve got a good heart.',
    'You have excellent taste. Obviously.',
    'You make this stream so much more fun.',
    'Look at you, making my day again.',
    'You’re getting really good at spoiling me.',
    'You’re my kind of trouble.',
    'I was hoping you’d come back today.'
  ];
  const delightedLines=[
    'You’re making me blush. Happy now?',
    'You’re making it hard to play it cool.',
    'If you were here, you’d get a hug.',
    'Keep being this cute and I’ll get distracted.',
    'I’ll call you after work. I have a special surprise for you.',
    'Careful. I might start flirting back.',
    'If you were here, I’d pull you a little closer.',
    'Keep spoiling me and I might spoil you back.',
    'You’d be trouble on a date. The fun kind.',
    'I wish this screen wasn’t between us.',
    'Keep that up and you might earn a kiss.',
    'Meet me on the balcony after the stream.',
    'I was trying to behave. Then you showed up.',
    'You’re lucky there’s a camera watching us.',
    'That charm of yours should come with a warning.',
    'Save some of that attention for me after work.',
    'I’ve got a little surprise with your name on it.',
    'If I whisper it, will you come closer?',
    'You have no idea what you do to me.',
    'Stay until the end. I’ve saved something for you.'
  ];
  const dialogueRotations=new Map();
  const mouths={
    angry:'M-2.6 3 Q0 0 2.6 3',
    upset:'M-2.6 3 Q0 1 2.6 3',
    calm:'M-2.6 2.5 Q0 2.5 2.6 2.5',
    happy:'M-2.6 1.8 Q0 5 2.6 1.8',
    delighted:'M-3 1.5 Q0 6 3 1.5 Z'
  };
  const fresh=now=>Object.fromEntries(ids.map(id=>[id,{value:50,updatedAt:now}]));
  function parse(raw,now=Date.now()){
    const result=fresh(now);
    try{
      const saved=JSON.parse(raw);
      if(saved?.version!==1)return result;
      for(const id of ids){
        const entry=saved.characters?.[id];
        if(!entry||!Number.isFinite(entry.value)||entry.value<0||entry.value>100||
          !Number.isFinite(entry.updatedAt)||entry.updatedAt<0)continue;
        result[id]={value:entry.value,updatedAt:Math.min(now,entry.updatedAt)};
      }
    }catch{}
    return result;
  }
  function read(){
    try{const raw=window.localStorage.getItem(storageKey);return {raw,characters:parse(raw)};}
    catch{return null;}
  }
  const initial=read();
  let characters=initial?.characters||fresh(Date.now()),lastStorageRaw=initial?.raw??null;
  function get(id){
    if(!ids.includes(id))return null;
    const entry=characters[id],age=Math.max(0,Date.now()-entry.updatedAt);
    const value=50+(entry.value-50)*Math.pow(.5,age/halfLife);
    const band=value<25?'angry':value<45?'upset':value<=55?'calm':value<80?'happy':'delighted';
    const expression=band==='calm'?(id==='mia'?'embarrassed':'happy'):
      ({angry:'angry',upset:'annoyed',happy:'happy',delighted:'excited'})[band];
    return {value,band,label:band[0].toUpperCase()+band.slice(1),expression};
  }
  function nextLine(id,tier,lines){
    const key=`${id}:${tier}`;
    let rotation=dialogueRotations.get(key);
    if(!rotation?.remaining.length){
      const remaining=[...lines];
      for(let i=remaining.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [remaining[i],remaining[j]]=[remaining[j],remaining[i]];
      }
      // A new shuffled cycle must not echo the previous cycle’s final line.
      if(remaining[0]===rotation?.last)[remaining[0],remaining[1]]=[remaining[1],remaining[0]];
      rotation={remaining,last:null};dialogueRotations.set(key,rotation);
    }
    const text=rotation.remaining.shift();rotation.last=text;
    return text;
  }
  function angryLine(id){
    return ['angry','upset'].includes(get(id)?.band)?nextLine(id,'angry',angryLines):null;
  }
  function positiveLine(id){
    const band=get(id)?.band;
    return band==='happy'?nextLine(id,band,happyLines):band==='delighted'?nextLine(id,band,delightedLines):null;
  }
  const previousBands=Object.fromEntries(ids.map(id=>[id,get(id).band]));
  function refresh(){
    if(window.Roomwave?.together)return;
    for(const id of ids){
      const mood=get(id),tag=document.querySelector(`#${id} .name-tag`);
      if(tag){
        tag.dataset.mood=mood.band;
        tag.setAttribute('aria-label',`Send gifts to ${names[id]}. Mood: ${mood.label}`);
        tag.querySelector('[data-mood-face]')?.setAttribute('data-mood',mood.band);
        tag.querySelector('[data-mood-mouth]')?.setAttribute('d',mouths[mood.band]);
        tag.querySelector('[data-mood-fill]')?.setAttribute('d',`M52 32H${(52+64*mood.value/100).toFixed(2)}`);
        const label=tag.querySelector('[data-mood-label]');
        if(label)label.textContent=`${names[id]} is ${mood.label.toLowerCase()}. Good gifts lift her mood; GG and glasses lower it.`;
      }
      if(previousBands[id]!==mood.band){
        previousBands[id]=mood.band;
        window.dispatchEvent(new CustomEvent('stream:mood',{detail:{id,...mood}}));
      }
    }
  }
  function recordGift(gift,recipient){
    if(!ids.includes(recipient)||(!goodGifts.has(gift)&&!badGifts.has(gift)))return null;
    // Read the latest tab's accepted gifts before extending the same mood history.
    const saved=read();
    if(saved&&saved.raw!==lastStorageRaw){characters=saved.characters;lastStorageRaw=saved.raw;}
    const mood=get(recipient);
    characters[recipient]={value:mood.value*.8+(goodGifts.has(gift)?100:0)*.2,updatedAt:Date.now()};
    try{
      const raw=JSON.stringify({version:1,characters});
      window.localStorage.setItem(storageKey,raw);lastStorageRaw=raw;
    }catch{}
    refresh();
    return get(recipient);
  }
  function reset(){
    characters=fresh(Date.now());
    dialogueRotations.clear();
    try{window.localStorage.removeItem(storageKey);lastStorageRaw=null;}catch{}
    refresh();
  }
  window.characterMood={recordGift,get,angryLine,positiveLine,idleExpression:id=>get(id)?.expression??null,refresh,reset};
  window.addEventListener('stream:resetting',reset);
  window.addEventListener('storage',event=>{
    if(event.key!==storageKey&&event.key!==null)return;
    const saved=event.key===null?read():{raw:event.newValue,characters:parse(event.newValue)};
    characters=saved?.characters||fresh(Date.now());lastStorageRaw=saved?.raw??null;
    refresh();
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  setInterval(refresh,15000);
  refresh();
})();
