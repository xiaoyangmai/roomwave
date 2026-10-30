'use strict';
// Passive character banter only. Gifts always interrupt; no missions or chat UI.
(() => {
  if(window.Roomwave?.together)return;
  const content=window.streamDialogue,game=window.__stickStream;
  const characterIds=game.characterIds||['lily','stella','mia'];
  const activeIds=()=>game.activeCharacterIds||characterIds;
  const companion=id=>{const ids=activeIds();return ids[(ids.indexOf(id)+1)%ids.length];};
  const defaultOutfit=id=>id==='stella'?'casual':'weekend';
  const hasNewOutfit=equipped=>characterIds.some(id=>equipped[id]&&equipped[id]!==defaultOutfit(id));
  let token=0,timers=[],speaking=false,outfitContext=null,rescued=null,lastRescue=null;
  let outfitParticipants=characterIds;
  let lastOutfitKey='',firstOutfitSeen=false;
  const previous=new Map();
  const idle=()=>(window.LiveRooms?.activeRoom??'stream')==='stream'&&game.active!==false&&game.phase==='idle'&&!game.busy&&!game.queued&&!document.hidden&&!document.querySelector('dialog[open]');
  const choose=lines=>lines[Math.floor(Math.random()*lines.length)];
  function moodLine(speaker,thankful=false){
    const mood=window.characterMood?.get(speaker);
    if(!mood)return null;
    if(mood.band==='angry'||mood.band==='upset')return {speaker,emotion:mood.expression,text:window.characterMood?.angryLine?.(speaker)||'You’re the worst.'};
    if(thankful&&['happy','delighted'].includes(mood.band))return {speaker,thankful,emotion:mood.expression,text:window.characterMood?.positiveLine?.(speaker)||choose(['You’re making my day!','You’ve been so sweet to me!','I’m feeling very loved right now!'])};
    return null;
  }
  function interrupt(){token++;timers.forEach(clearTimeout);timers=[];speaking=false;game.clearQuiet();}
  function play(lines){
    if(!idle()||speaking)return false;
    lines=lines.filter(line=>activeIds().includes(line.speaker));
    if(!lines.length)return false;
    const mine=++token;speaking=true;
    lines.forEach((line,index)=>timers.push(setTimeout(()=>{
      if(mine===token&&idle()&&activeIds().includes(line.speaker)){
        // Recheck at playback so an older happy line cannot contradict her mood.
        const current=moodLine(line.speaker,line.thankful)||(line.moodOnly?null:line);
        if(current)game.sayQuiet(current.speaker,current.text,current.emotion);
      }
    },index*3400)));
    timers.push(setTimeout(()=>{if(mine!==token)return;speaking=false;game.clearQuiet();timers=[];},lines.length*3400+600));
    return true;
  }
  function banter(key,recipient=null,participants=characterIds){
    participants=participants.filter(id=>activeIds().includes(id));
    const available=content.banter[key]?.filter(lines=>lines.every(line=>participants.includes(line.speaker)));
    if(!available?.length)return false;
    const targeted=available.filter(lines=>lines[0].speaker===recipient);
    const pool=targeted.length?targeted:available;
    const historyKey=`${key}:${recipient||participants.join(',')}`;
    const choices=pool.map((_,i)=>i).filter(i=>i!==previous.get(historyKey));
    const index=choices[Math.floor(Math.random()*choices.length)]??0;
    if(!play(pool[index]))return false;previous.set(historyKey,index);return true;
  }
  window.addEventListener('stream:wardrobe',event=>{
    const {state:current,before,source}=event.detail;
    if(!before){firstOutfitSeen=hasNewOutfit(current.equipped);lastOutfitKey=JSON.stringify(current.equipped);}
    if(source==='equip'||source==='purchase'){
      const key=JSON.stringify(current.equipped);
      if(key!==lastOutfitKey){
        const dressed=hasNewOutfit(current.equipped);
        const matching=activeIds().map(id=>activeIds().filter(other=>current.equipped[id]!==defaultOutfit(id)&&current.equipped[id]&&current.equipped[other]===current.equipped[id])).find(ids=>ids.length>1);
        if(matching){outfitContext='matchingOutfits';outfitParticipants=matching;}
        else if(dressed&&!firstOutfitSeen){outfitContext='firstOutfit';outfitParticipants=characterIds;}
        if(dressed)firstOutfitSeen=true;lastOutfitKey=key;
      }
    }
  });
  window.streamLife={
    interrupt,
    rememberRescue(id){rescued=id;lastRescue=id;},
    afterGift(gift,recipient){
      if(!idle())return;
      // Solo gifts keep their follow-up on the same recipient as the reaction.
      if(gift==='gg')return;
      const thankful=['rose','heart','corgi'].includes(gift),mood=window.characterMood?.get(recipient);
      if(['angry','upset'].includes(mood?.band)||(thankful&&['happy','delighted'].includes(mood?.band))){
        // Pick only at playback so interrupted lines do not consume the rotation.
        play([{speaker:recipient,thankful,moodOnly:true}]);return;
      }
      if(gift==='corgi'){
        const yoga=window.wardrobe?.state?.equipped?.[recipient]==='yoga';
        if(characterIds.includes(recipient)&&Math.random()<.65)play([{speaker:recipient,text:yoga?(recipient==='mia'?'A little balance. A little calm.':'Deep breath… and relax!'):recipient==='mia'?'I counted the steps. Then the steps escaped.':recipient==='stella'?'One more song? I’m just getting started!':'That deserves an imaginary disco ball!',emotion:'happy'}]);
        return;
      }
      const context=rescued?'rescued':outfitContext;
      if(context){const target=rescued;rescued=null;outfitContext=null;banter(context,target,target?characterIds:outfitParticipants);}
      else if(lastRescue&&gift==='heart'&&recipient===lastRescue){
        play([{speaker:lastRescue,text:'You saved me, and now a heart? Thank you.',emotion:'blush'},{speaker:companion(lastRescue),text:'See? Everyone’s looking out for you.',emotion:'happy'}]);lastRescue=null;
      }else if(Math.random()<.65)banter({rose:'giftRose',heart:'giftHeart'}[gift],recipient);
    }
  };
  document.querySelector('#wardrobe-dialog').addEventListener('close',()=>{if(outfitContext&&idle()){const key=outfitContext;outfitContext=null;banter(key,null,outfitParticipants);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});
  window.addEventListener('pagehide',interrupt);
  window.addEventListener('stream:cast',interrupt);
  window.addEventListener('live-room-change',event=>{if(event.detail.room!=='stream')interrupt();});
})();
