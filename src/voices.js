'use strict';
(() => {
  const preferenceKey='roomwave-voices-v2';
  const normalize=text=>text.toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}']/gu,'');
  const clips=window.voiceData||{};
  const phrases=new Map(), selections=new Map();
  for(const [speaker,items]of Object.entries(clips))for(const clip of items){
    clip.url=`audio/${speaker}/${clip.file}`;
    for(const text of [clip.text,...(clip.aliases||[])])phrases.set(`${speaker}:${normalize(text)}`,clip);
  }
  let enabled=false,volume=.8,context=null,gain=null,current=null,generation=0,unlocked=false;
  let nextVoiceAt=0,reset=false;
  const voiceChance=.45,voiceSpacing=5500,quietAfterLine=1800;
  const buffers=new Map();
  const roomActive=()=>(window.LiveRooms?.activeRoom??'stream')==='stream';
  const enabledInput=document.querySelector('#voice-enabled'),volumeInput=document.querySelector('#voice-volume');
  const status=document.querySelector('#voice-status');
  const toggle=document.querySelector('#voice-toggle');
  try {const saved=JSON.parse(localStorage.getItem(preferenceKey)||'null');if(saved){enabled=saved.enabled===true;if(Number.isFinite(saved.volume))volume=Math.max(0,Math.min(1,saved.volume));}} catch {}
  function update(){
    if(toggle){toggle.setAttribute('aria-label',enabled?'Mute all audio':'Unmute all audio');toggle.title='For you in every room';toggle.setAttribute('aria-pressed',String(!enabled));toggle.querySelector('use').setAttribute('href',enabled?'#icon-sound':'#icon-muted');}
    if(enabledInput)enabledInput.checked=enabled;
    if(volumeInput){volumeInput.value=String(Math.round(volume*100));volumeInput.disabled=!enabled;}
    if(status)status.textContent=!enabled?'Audio muted for you in every room.':volume===0?'Voice volume is zero.':unlocked?'Voices on.':'Tap a gift to hear the voices.';
  }
  function save(){try{localStorage.setItem(preferenceKey,JSON.stringify({enabled,volume}));}catch{}update();}
  function stop(){
    generation++;
    if(current){const old=current;current=null;try{old.source?.stop();}catch{}old.finish();}
  }
  function unlock(){
    if(reset||!enabled||!roomActive())return;
    try{
      if(!context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext){if(status)status.textContent='Voices are unavailable in this browser.';return;}context=new AudioContext();gain=context.createGain();gain.gain.value=volume;gain.connect(context.destination);}
      const resumed=context.state==='running'?Promise.resolve():context.resume();
      resumed.then(()=>{unlocked=context.state==='running';update();}).catch(()=>{unlocked=false;update();});
    }catch{if(status)status.textContent='Tap again to enable voices.';}
  }
  function load(clip){
    if(!buffers.has(clip.url)){
      const request=new AbortController();const timer=setTimeout(()=>request.abort(),3500);
      const result=fetch(clip.url,{signal:request.signal}).then(response=>{if(!response.ok)throw new Error('Recording unavailable');return response.arrayBuffer();}).then(data=>context.decodeAudioData(data)).finally(()=>clearTimeout(timer));
      buffers.set(clip.url,result);result.catch(()=>buffers.delete(clip.url));
    }
    return buffers.get(clip.url);
  }
  function speak(speaker,text,event=null){
    // Only Mia's recordings are enabled. Voice is an occasional extra, never a queue.
    if(speaker!=='mia'||event==='idle'||current)return Promise.resolve();
    const clip=phrases.get(`${speaker}:${normalize(text)}`);
    if(reset||!clip||!enabled||volume===0||!context||document.hidden||!roomActive())return Promise.resolve();
    const now=Date.now();
    if(now<nextVoiceAt||Math.random()>=voiceChance)return Promise.resolve();
    nextVoiceAt=now+voiceSpacing;
    const token=++generation;
    let resolveDone;
    const job={speaker,clip,source:null,done:new Promise(resolve=>resolveDone=resolve),finish:null};
    const watchdog=setTimeout(()=>{if(current===job)stop();else resolveDone();},8000);
    job.finish=()=>{clearTimeout(watchdog);resolveDone();};current=job;
    (async()=>{
      try{
        if(context.state!=='running')await context.resume();
        const buffer=await load(clip);
        if(reset||token!==generation||current!==job||!enabled||document.hidden||!roomActive()){job.finish();return;}
        const source=context.createBufferSource(),clipGain=context.createGain();job.source=source;source.buffer=buffer;
        clipGain.gain.value=clip.gain||1;source.connect(clipGain);clipGain.connect(gain);
        source.onended=()=>{source.disconnect();clipGain.disconnect();if(current===job){current=null;nextVoiceAt=Math.max(nextVoiceAt,Date.now()+quietAfterLine);}job.finish();};
        source.start();unlocked=true;update();
      }catch{
        if(current===job){current=null;if(status)status.textContent='A recording could not play. Try another gift.';}job.finish();
      }
    })();
    return job.done;
  }
  function selectText(speaker,event,fallback){
    const pool=(clips[speaker]||[]).filter(clip=>clip.events.includes(event));
    if(!pool.length)return fallback;
    const key=`${speaker}:${event}`,previous=selections.get(key);
    const choices=pool.length>1?pool.filter(clip=>clip!==previous):pool;
    const chosen=choices[Math.floor(Math.random()*choices.length)];selections.set(key,chosen);return chosen.text;
  }
  function applyEnabled(value,{gesture=false}={}){
    enabled=Boolean(value);
    if(!enabled)stop();
    else if(gesture){if(volume===0){volume=.8;if(gain)gain.gain.value=volume;}unlock();}
    update();
  }
  if(window.UserAudio)window.UserAudio.subscribe(applyEnabled);
  enabledInput?.addEventListener('change',()=>{if(window.UserAudio){window.UserAudio.setEnabled(enabledInput.checked);return;}enabled=enabledInput.checked;if(enabled)unlock();else stop();save();});
  toggle?.addEventListener('click',event=>{event.stopPropagation();if(window.UserAudio){window.UserAudio.toggle();return;}enabled=!enabled;if(enabled){if(volume===0)volume=.8;unlock();}else stop();save();});
  volumeInput?.addEventListener('input',()=>{volume=Number(volumeInput.value)/100;if(gain)gain.gain.setTargetAtTime(volume,context.currentTime,.025);if(volume===0)stop();save();});
  const isAudioControl=event=>event.target?.closest?.('#voice-toggle,#voice-enabled,#voice-volume');
  // The controls unlock in their own handlers. A capture-phase resume could
  // reset the checkbox to its previous value before its change event runs.
  document.addEventListener('click',event=>{if(!isAudioControl(event))unlock();},{capture:true});
  document.addEventListener('keydown',event=>{if(!isAudioControl(event)&&(event.key==='Enter'||event.key===' '))unlock();},{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('live-room-change',event=>{if(event.detail.room!=='stream')stop();});
  window.addEventListener('stream:resetting',()=>{reset=true;enabled=false;stop();update();});
  window.characterVoices={selectText,speak,stop,get playing(){return Boolean(current);}};update();
})();
