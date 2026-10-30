'use strict';
// Random foreground interruptions are independent of gift animations.
(() => {
  const hand=document.querySelector('#camera-hand');
  let removalEquipped=false;
  const giftChances={rose:.12,heart:.12,sunglasses:.08,corgi:.2,gg:.12};
  let enter=0,leave=0,generation=0,nextAllowed=0;
  let ambient=0,ambientGeneration=0,ambientEnabled=false,pageActive=true,resetting=false;
  const roomActive=()=>(window.LiveRooms?.activeRoom??'stream')==='stream';
  const blocked=()=>!roomActive()||removalEquipped||resetting||!pageActive||document.hidden||!window.__stickStream||window.wardrobe?.resetting||window.wardrobe?.ready===false||Boolean(document.querySelector('dialog[open]'));
  function stop(){
    generation+=1;
    clearTimeout(enter);clearTimeout(leave);enter=leave=0;
    hand.hidden=true;hand.classList.remove('is-visible');
  }
  function schedule(chance,delayFor){
    // Gift bursts never restart a hand or turn it into a continuous cover.
    if(blocked()||enter||leave||performance.now()<nextAllowed)return false;
    if(chance<1&&Math.random()>=chance)return false;
    const current=generation,delay=delayFor(),duration=2000+Math.floor(Math.random()*3001);
    enter=setTimeout(()=>{
      if(current!==generation)return;
      if(blocked()){stop();return;}
      enter=0;
      nextAllowed=performance.now()+15000;
      hand.style.setProperty('--camera-hand-duration',`${duration}ms`);
      hand.hidden=false;hand.classList.add('is-visible');
      leave=setTimeout(()=>{if(current===generation)stop();},duration);
    },delay);
    return true;
  }
  function onGift(gift){
    return Object.hasOwn(giftChances,gift)&&schedule(giftChances[gift],()=>250+Math.floor(Math.random()*851));
  }
  function pauseAmbient(){
    ambientGeneration+=1;clearTimeout(ambient);ambient=0;stop();
  }
  function queueAmbient(){
    if(!roomActive()||removalEquipped||!ambientEnabled||ambient||resetting||document.hidden||!pageActive)return;
    const current=ambientGeneration;
    ambient=setTimeout(()=>{
      if(current!==ambientGeneration)return;
      ambient=0;
      schedule(1,()=>0);
      queueAmbient();
    },25000+Math.floor(Math.random()*30001));
  }
  function startAmbient(){if(!resetting){ambientEnabled=true;queueAmbient();}}
  // Only a purchased, equipped upgrade disables hands; both come from the server.
  function setRemovalUpgrade(upgrade){
    removalEquipped=Boolean(upgrade?.owned&&upgrade?.equipped);
    if(removalEquipped)pauseAmbient();else queueAmbient();
  }
  window.cameraMoment={onGift,startAmbient,stop,setRemovalUpgrade,get enabled(){return !removalEquipped;}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAmbient();else queueAmbient();});
  window.addEventListener('pagehide',()=>{pageActive=false;pauseAmbient();});
  window.addEventListener('pageshow',()=>{pageActive=true;queueAmbient();});
  window.addEventListener('live-room-change',event=>{if(event.detail.room==='stream')queueAmbient();else pauseAmbient();});
  window.addEventListener('stream:resetting',()=>{resetting=true;pauseAmbient();});
})();
