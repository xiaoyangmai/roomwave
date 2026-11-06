'use strict';
(() => {
  const together=Boolean(window.Roomwave?.together);
  const $=s=>document.querySelector(s),dialog=$('#wardrobe-dialog'),items=$('#wardrobe-items');
  const status=$('#wardrobe-status'),retry=$('#wardrobe-retry'),open=$('#wardrobe-open');
  const balance=$('#wardrobe-balance'),details=$('#wardrobe-points-detail');
  const resetDialog=$('#reset-dialog'),resetOpen=$('#reset-open'),resetConfirm=$('#reset-confirm'),resetCancel=$('#reset-cancel'),resetStatus=$('#reset-status');
  const resetKey='roomwave-reset-pending-v1',resetNotice='roomwave-reset-completed-v1';
  const names={mia:'Mia',lily:'Lilly',stella:'Stella'},costs={rose:1,heart:100,sunglasses:200,corgi:300,gg:1};
  const pendingKey='roomwave-pending-gifts-v1',uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data=null,working=false,initialized=false,pending=[],intent=null,retryNeeded=false,refreshQueued=false,nextSync=0;
  let resetIntent=null;
  if(!together)try{const saved=JSON.parse(localStorage.getItem(resetKey)||'null');if(saved?.action==='reset'&&uuid.test(saved.receipt)&&Number.isSafeInteger(saved.epoch))resetIntent=saved;}catch{}
  let message='Loading your shop…',tab='rooms',filter='all',category='all',layout='grid';
  try{const saved=localStorage.getItem('roomwave-closet-layout-v1');if(['grid','rail','list'].includes(saved))layout=saved;}catch{}
  $('#wardrobe-layout').value=layout;
  const collectionScroll={};let renderedCollection=null;
  let legacy={gifts:0,spent:0};
  if(!together)try{legacy=JSON.parse(localStorage.getItem('roomwave-fake-gift-ledger-v1')||'{}');}catch{}
  if(!legacy||typeof legacy!=='object')legacy={gifts:0,spent:0};
  if(!together)try{pending=JSON.parse(localStorage.getItem(pendingKey)||'[]').filter(x=>x?.action==='gift'&&Object.hasOwn(costs,x.gift)&&typeof x.receipt==='string'&&uuid.test(x.receipt)).slice(0,10000);}catch{}
  const initial={gifts:Math.max(0,(Number.isSafeInteger(legacy.gifts)?legacy.gifts:0)-pending.length),coins:Math.max(0,(Number.isSafeInteger(legacy.spent)?legacy.spent:0)-pending.reduce((n,x)=>n+costs[x.gift],0))};
  const persist=()=>{try{localStorage.setItem(pendingKey,JSON.stringify(pending));}catch{}};
  const owned=(character,outfit)=>Boolean(data?.unlocks[character]?.[outfit]);
  const busy=()=>working||Boolean(intent)||pending.length>0||Boolean(resetIntent);
  async function request(body){
    const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),10000);
    try{const response=await fetch(together?'/api/wardrobe?mode=together':'/api/wardrobe',{credentials:'same-origin',signal:abort.signal,...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
      const result=await response.json();if(!response.ok){const error=Error(result.error||'Could not save. Please retry.');error.state=result.state;error.status=response.status;error.reset=result.reset;throw error;}return result;
    }finally{clearTimeout(timer);}
  }
  function apply(result,source='load'){
    if(data&&result.epoch!==data.epoch){finishReset(result.lastReset);return;}
    const before=data;data=result;
    if(together)return;
    for(const id of Object.keys(names))window.__stickStream.equipOutfit(id,result.equipped[id]);
    window.cameraMoment?.setRemovalUpgrade(result.upgrades?.find(item=>item.id==='remove-hand'));
    $('#stage-camera').dataset.room=result.room||'balcony';
    window.dispatchEvent(new CustomEvent('stream:wardrobe',{detail:{state:result,before,source}}));
  }
  const selectedCast=()=>data?.activeCast||['lily','mia'];
  const characterOwned=id=>data?.characters?.find(item=>item.id===id)?.owned??['lily','mia'].includes(id);
  function choices(){if(!data)return [];const list=tab==='characters'?(data.characters||[]).map(x=>({...x,name:names[x.id],type:'character'})):tab==='rooms'?[...(together?[]:data.upgrades||[]).map(x=>({...x,type:'upgrade'})),...data.rooms.map(x=>({...x,type:'room'}))]:(data.catalog[tab]||[]).map(x=>({...x,id:x.outfit,type:'outfit',owned:owned(tab,x.outfit)}));return list.filter(x=>(filter==='all'||x.owned)&&(!names[tab]||category==='all'||x.category===category));}
  function characterArt(id){
    const outfit=data?.equipped?.[id]||(id==='stella'?'casual':'weekend');
    const sheet=window.outfitSpriteData?.[id]?.[outfit]||window.duoSpriteData?.characters?.[id],frame=sheet?.frames?.idle;
    const atlas=frame&&sheet.atlases[frame.atlas];
    if(!atlas)return '<span class="closet-empty">Preview unavailable</span>';
    const [x,y,width,height]=frame.crop,clip=`shop-character-${id}`;
    return `<svg class="character-preview" viewBox="${frame.crop.join(' ')}" role="img" aria-label="${names[id]}"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="${atlas.url}" width="${atlas.width}" height="${atlas.height}" clip-path="url(#${clip})"/></svg>`;
  }
  function characterCard(item,available){
    const selected=selectedCast().includes(item.id),disabled=busy()||(!item.owned&&available<item.price);
    const actions=!item.owned?`<button type="button" data-action="purchaseCharacter" data-type="character" data-id="${item.id}" ${disabled?'disabled':''}>Unlock · ${item.price.toLocaleString()} coins</button>`:selected?`<button type="button" disabled>${window.__stickStream.castChangePending?'Selected':'On stage'}</button>`:selectedCast().map(replace=>`<button type="button" data-action="equipCast" data-type="character" data-id="${item.id}" data-replace="${replace}" aria-label="Replace ${names[replace]} with ${names[item.id]}" ${busy()?'disabled':''}>Replace ${names[replace]}</button>`).join('');
    return `<article class="closet-card is-character ${selected?'is-equipped':''}" role="listitem" data-item="${item.id}" tabindex="-1"><div class="closet-art">${characterArt(item.id)}</div><div class="closet-caption"><small>${item.price===0?'Included':item.owned?'Unlocked':'New character'}</small><h3>${names[item.id]}</h3></div><div class="character-actions">${actions}</div></article>`;
  }
  function hanger(character,outfit,thumbnail=false){
    const sheet=window.wardrobeHangers?.[character],frame=sheet?.frames[outfit];
    if(!frame)return '<span class="closet-empty">Preview unavailable</span>';
    const crop=Array.isArray(frame)?frame:frame.crop;
    const [x,y,width,height]=crop,clip=`hanger-${character}-${outfit}-${thumbnail?'thumb':'large'}`,atlas=frame.atlas||sheet.atlas;
    return `<svg class="hanger-sprite" viewBox="${crop.join(' ')}" ${thumbnail?'aria-hidden="true"':`role="img" aria-label="${names[character]}’s outfit on a hanger"`}><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="${atlas.url}" width="${atlas.width}" height="${atlas.height}" clip-path="url(#${clip})"/></svg>`;
  }
  function render(){
    const appearance=together?window.Roomwave.frame('stream').appearance:null;
    const shared=!names[tab],available=(shared?data?.points.balance:data?.wallets?.[tab])??0;
    balance.textContent=data?available.toLocaleString():'…';
    $('#wardrobe-wallet-label').textContent=together?(shared?'Your coins':`Your ${names[tab]} coins`):shared?'Combined coins':`${names[tab]}’s coins`;
    $('#stream-balance').textContent=data?data.points.balance.toLocaleString():'…';
    const walletHelp=together?(shared?'Your Hangout gifts earn your coins. Choose an owned background for everyone.':`Your gifts to ${names[tab]} earn these coins. Choose an owned outfit for everyone.`):tab==='characters'?`Choose two anchors for the room. Unlocks use combined coins.${window.__stickStream.castChangePending?' Your new pair will join after the current reactions finish.':''}`:shared?'Shared purchases use the girls’ combined coins.':`Outfits use only ${names[tab]}’s coins. Send her gifts to earn more.`;
    $('#wardrobe-wallet-help').textContent=walletHelp;
    details.textContent=data?`${walletHelp}${pending.length?' Saving gifts…':''}`:'Loading your coins…';
    const handUpgrade=data?.upgrades?.find(item=>item.id==='remove-hand');
    $('#hand-upgrade-status').textContent=handUpgrade?.owned?(handUpgrade.equipped?'Random hand removed. Unequip in Rooms to bring it back.':'Random hand enabled. Equip your hand removal in Rooms to stop it.'):'Remove the random hand from the Rooms shop.';
    $('#hand-upgrade-open').textContent=handUpgrade?.owned?'Manage hand upgrade in Rooms':'View hand upgrade in Rooms';
    document.querySelectorAll('[data-wardrobe-tab]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.wardrobeTab===tab));const locked=b.dataset.wardrobeTab==='stella'&&!characterOwned('stella');b.disabled=locked;b.title=locked?'Unlock Stella in Anchors to browse her outfits':'';});
    const oldCollection=items.querySelector('.closet-collection');
    if(oldCollection&&renderedCollection)collectionScroll[renderedCollection]={left:oldCollection.scrollLeft,top:oldCollection.scrollTop};
    const active=document.activeElement,focusId=items.contains(active)?active.closest('[data-item]')?.dataset.item:null;
    const list=choices(),rooms=tab==='rooms';dialog.dataset.section=tab;dialog.dataset.layout=layout;
    $('#wardrobe-category-label').hidden=shared;
    $('#wardrobe-count').textContent=data?(tab==='characters'?`${list.length} anchor${list.length===1?'':'s'}`:`${list.length} ${rooms?'item':'outfit'}${list.length===1?'':'s'}`):'';
    items.innerHTML=`<div class="closet-collection" role="list" tabindex="-1" aria-label="${tab==='characters'?'Choose your anchors':rooms?'Rooms and upgrades':names[tab]+' outfits'}">${list.map(item=>{
      if(item.type==='character')return characterCard(item,available);
      const room=item.type==='room',upgrade=item.type==='upgrade';
      const equipped=upgrade?item.owned&&item.equipped:(room?(appearance?.room??data.room):(appearance?.equipped[tab]??data.equipped[tab]))===item.id,action=upgrade?(item.owned?(equipped?'unequipUpgrade':'equipUpgrade'):'purchaseUpgrade'):room?(item.owned?'equipRoom':'purchaseRoom'):(item.owned?'equip':'purchase');
      const queued=together&&(room?appearance?.pending?.room:appearance?.pending?.equipped[tab])===item.id;
      const label=together?(!item.owned?`Buy · ${item.price.toLocaleString()} coins`:queued?'Changing next':equipped?'On stage':room?'Use for everyone':'Wear for everyone'):upgrade&&item.owned?(equipped?'Unequip':'Equip'):equipped?(room?'Current room':'Wearing'):item.owned?(room?'Use room':'Wear'):`Buy · ${item.price.toLocaleString()} coins`;
      const disabled=busy()||(!upgrade&&equipped&&(!together||item.owned))||(queued&&item.owned)||(!item.owned&&available<item.price);
      const note=upgrade?(item.owned?(equipped?'Equipped · hand removed':'Owned · hand enabled'):'Shared upgrade'):item.price===0?(room?'Included room':'Free starter'):room?'Room':item.category;
      return `<article class="closet-card ${equipped?'is-equipped':''} ${room?'is-room':''} ${upgrade?'is-upgrade':''}" role="listitem" data-item="${item.id}" tabindex="-1"><div class="closet-art">${room?`<img src="${item.image}" alt="" loading="lazy">`:upgrade?'<img class="upgrade-sprite" src="/assets/stream-controls-v1/remove-hand-shop-v1.lossless.webp" alt="A screen-covering hand crossed out" loading="lazy">':hanger(tab,item.id,true)}${item.price===0?'<span class="starter-badge">Free</span>':''}</div><div class="closet-caption"><small>${esc(note)}</small><h3>${esc(item.name)}</h3>${upgrade?`<p>${esc(item.description)}</p>`:''}</div><button type="button" data-action="${action}" data-type="${item.type}" data-id="${item.id}" aria-label="${esc(label+' — '+item.name)}" ${disabled?'disabled':''}>${label}</button></article>`;
    }).join('')||`<p class="closet-empty">${data?'No owned items in this selection yet.':'Loading your wardrobe…'}</p>`}</div>`;
    const collection=items.querySelector('.closet-collection'),key=tab+':'+layout+':'+filter+':'+category;
    collection.scrollLeft=collectionScroll[key]?.left||0;collection.scrollTop=collectionScroll[key]?.top||0;renderedCollection=key;
    if(focusId){const card=items.querySelector(`[data-item="${focusId}"]`),button=card?.querySelector('button');(button&&!button.disabled?button:card||collection).focus({preventScroll:true});}
    status.textContent=message;status.hidden=!message;retry.hidden=!retryNeeded;retry.textContent=intent?'Retry change':'Retry saving';
    resetOpen.disabled=working||!data||Boolean(resetIntent);
    open.setAttribute('aria-label',together?'Open your multiplayer shop':pending.length?`LIVE — open shop. ${pending.length} gifts waiting to save`:'LIVE — open shop');
  }
  async function flush(refresh=false){
    if(together&&!window.Roomwave.connected('stream')){
      if(initialized&&(refresh||intent)){retryNeeded=true;message='Reconnecting to your shop…';render();}
      return;
    }
    if(resetIntent){await performReset();return;}
    if(working){if(together&&refresh)refreshQueued=true;return;}working=true;render();
    try{
      if(!initialized){let result=await request();if(pending.some(gift=>(gift.epoch??0)!==result.epoch)){finishReset(result.lastReset);return;}if(!together&&!result.imported)result=await request({action:'import',epoch:result.epoch,gifts:Math.min(1e9,initial.gifts),coins:Math.min(1e9,initial.coins)});apply(result);initialized=true;message='';}
      else if(refresh)apply(await request());
      if(resetIntent)return;
      if(intent){const current=intent;try{apply(await request(current),current.action);intent=null;message=together?'Unlocked for you. Choose it to put it on the shared stage.':current.action==='purchaseCharacter'?'Stella unlocked. Choose who she replaces.':current.action==='equipCast'?(window.__stickStream.castChangePending?'Pair saved. They will switch after the current reactions finish.':'Your pair is ready.'):current.action==='purchaseUpgrade'?'Unlocked and equipped. You can unequip it any time.':current.action==='equipUpgrade'?'Equipped. The random hand is removed.':current.action==='unequipUpgrade'?'Unequipped. The random hand can appear again.':current.action==='purchaseRoom'?'Unlocked. Choose Use room to enter.':current.action==='purchase'?'Unlocked and wearing it!':'';}catch(error){
        if(error.reset)throw error;
        const rejected=error.status>=400&&error.status<500&&![408,429].includes(error.status);
        if(!error.state&&!rejected)throw error;
        intent=null;apply(error.state||await request());message=error.message;
      }}
      while(pending.length&&!resetIntent){const result=await request(pending[0]);pending.shift();persist();apply(result,'gift');}
      if(['Your gifts are waiting to save. Tap retry.','Could not load your shop. Tap retry.','Reconnecting to your shop…'].includes(message))message='';
      retryNeeded=false;
    }catch(error){if(error.reset){finishReset(error.state?.lastReset);return;}retryNeeded=true;nextSync=Date.now()+3000;message=intent?'Could not confirm your change. Retry safely; purchases only charge once.':together?'Could not load your shop. Tap retry.':'Your gifts are waiting to save. Tap retry.';}
    finally{working=false;render();if(refreshQueued){refreshQueued=false;void flush(true);}}
  }
  function finishReset(receipt=crypto.randomUUID(),broadcast=true){
    resetIntent=resetIntent||{action:'reset'};pending=[];intent=null;
    window.dispatchEvent(new CustomEvent('stream:resetting'));
    try{
      for(const key of Object.keys(localStorage))if(key.startsWith('roomwave-')&&key!==resetKey&&key!==resetNotice)localStorage.removeItem(key);
      if(broadcast)localStorage.setItem(resetNotice,receipt||crypto.randomUUID());
      localStorage.removeItem(resetKey);
    }catch{}
    window.location.reload();
  }
  async function performReset(){
    if(working||!resetIntent)return;
    working=true;resetConfirm.disabled=true;resetCancel.disabled=true;
    resetStatus.textContent='Resetting your game…';render();
    try{const result=await request(resetIntent);finishReset(result.lastReset);}
    catch(error){if(error.reset){finishReset(error.state?.lastReset);return;}resetStatus.textContent='Could not finish the reset. Check your connection, then retry.';resetConfirm.textContent='Retry reset';}
    finally{working=false;resetConfirm.disabled=false;render();}
  }
  resetOpen.addEventListener('click',()=>{if(working||!data)return;resetStatus.textContent='';resetDialog.showModal();resetCancel.focus();});
  resetCancel.addEventListener('click',()=>{if(!resetIntent)resetDialog.close();});
  resetDialog.addEventListener('cancel',event=>{if(resetIntent)event.preventDefault();});
  resetConfirm.addEventListener('click',()=>{
    if(working)return;
    if(!resetIntent){resetIntent={action:'reset',epoch:data.epoch,receipt:crypto.randomUUID()};try{localStorage.setItem(resetKey,JSON.stringify(resetIntent));}catch{}window.dispatchEvent(new CustomEvent('stream:resetting'));}
    performReset();
  });
  window.addEventListener('storage',event=>{if(!together&&event.key===resetNotice&&event.newValue)finishReset(event.newValue,false);});
  function openDialog(){window.streamLife?.interrupt();window.cameraMoment?.stop();dialog.showModal();open.setAttribute('aria-expanded','true');open.querySelector('i').hidden=true;render();flush(true);}
  open.addEventListener('click',event=>{event.stopPropagation();openDialog();});
  dialog.addEventListener('close',()=>open.setAttribute('aria-expanded','false'));
  $('#wardrobe-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  document.querySelectorAll('[data-wardrobe-tab]').forEach(button=>button.addEventListener('click',()=>{tab=button.dataset.wardrobeTab;if(!busy()&&!retryNeeded)message='';render();}));
  $('#hand-upgrade-open').addEventListener('click',()=>{tab='rooms';filter='all';$('#wardrobe-filter').value=filter;$('.studio-music').open=false;render();const card=items.querySelector('[data-item="remove-hand"]');card?.focus({preventScroll:true});card?.scrollIntoView({block:'nearest',inline:'nearest'});});
  $('#wardrobe-filter').addEventListener('change',event=>{filter=event.target.value;render();});
  $('#wardrobe-category').addEventListener('change',event=>{category=event.target.value;render();});
  $('#wardrobe-layout').addEventListener('change',event=>{
    layout=event.target.value;try{localStorage.setItem('roomwave-closet-layout-v1',layout);}catch{}render();
  });
  items.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');if(!button||button.disabled||busy())return;
    const action=button.dataset.action,id=button.dataset.id;
    if(together&&['equip','equipRoom'].includes(action)){
      message=window.Roomwave.send('stream',action==='equip'?'outfit':'background',action==='equip'?[tab,id]:[id])?'Selecting for the shared stage…':'Reconnect to the room to change its appearance.';render();return;
    }
    if(button.dataset.type==='character'){
      if(action==='purchaseCharacter')intent={action,epoch:data.epoch,character:id};
      else {const characters=selectedCast().map(character=>character===button.dataset.replace?id:character);if(new Set(characters).size!==2||!characters.includes(id))return;intent={action,epoch:data.epoch,characters};}
    }else intent=button.dataset.type==='upgrade'?{action,epoch:data.epoch,upgrade:id}:button.dataset.type==='room'?{action,epoch:data.epoch,room:id}:{action,epoch:data.epoch,character:tab,outfit:id};message='Saving…';flush();
  });
  items.addEventListener('keydown',event=>{
    if(layout!=='rail'||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    const card=event.target.closest('[data-item]');if(!card)return;
    const cards=[...items.querySelectorAll('[data-item]')],index=cards.indexOf(card),next=cards[index+(event.key==='ArrowRight'?1:-1)];
    if(next){event.preventDefault();next.focus({preventScroll:true});next.scrollIntoView({block:'nearest',inline:'center'});}
  });
  retry.addEventListener('click',()=>flush(true));window.addEventListener('online',()=>flush(true));
  window.addEventListener('focus',()=>flush(true));
  window.addEventListener('stream:cast',()=>{if(!window.__stickStream.castChangePending&&message==='Pair saved. They will switch after the current reactions finish.')message='Your pair is ready.';if(dialog.open)render();});
  window.wardrobe={get state(){return data;},get ready(){return Boolean(data)&&initialized;},get resetting(){return Boolean(resetIntent);},recordGift(gift,recipient=null){if(together||resetIntent||!data)return;pending.push({action:'gift',epoch:data.epoch,gift,recipient,receipt:crypto.randomUUID()});persist();flush();},refresh:()=>flush(true)};
  if(together){
    open.firstChild.textContent='Shop';
    $('#wardrobe-title').textContent='Your shop';
    let appearanceKey='';
    window.addEventListener('roomwave-state',event=>{
      if(event.detail.room!=='stream')return;
      if(!working&&(!initialized||retryNeeded||intent)&&Date.now()>=nextSync)void flush(true);
      const next=JSON.stringify(window.Roomwave.frame('stream').appearance);
      if(next!==appearanceKey){appearanceKey=next;if(dialog.open)render();}
    });
    window.addEventListener('roomwave-command',event=>{
      const {room,command,outcome}=event.detail;if(room!=='stream')return;
      if(command.method==='send'&&outcome?.accepted)void flush(true);
      if(['outfit','background'].includes(command.method)){
        message=outcome?.accepted?(window.Roomwave.frame('stream').appearance.pending?'Selected. Changes when the current reaction finishes.':'Now on stage for everyone.'):outcome?.reason||'Could not change the stage. Try again.';render();
      }
    });
  }
  if(resetIntent){resetDialog.showModal();window.dispatchEvent(new CustomEvent('stream:resetting'));}
  render();flush();
})();
