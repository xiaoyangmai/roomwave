'use strict';
(() => {
  if(window.Roomwave?.together)return;
  const count=document.querySelector('#viewer-count');
  const pill=document.querySelector('#visits-pill');
  const visitId=crypto.randomUUID();
  async function record(attempt=0){
    try {
      const response=await fetch('/api/visits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitId})});
      if(!response.ok)throw Error('Visit counter unavailable');
      const result=await response.json();
      if(!Number.isSafeInteger(result.visits)||result.visits<0)throw Error('Invalid visit count');
      count.textContent=new Intl.NumberFormat(undefined,{notation:'compact',maximumFractionDigits:1}).format(result.visits);
      pill.setAttribute('aria-label',`${result.visits.toLocaleString()} viewers in the simulated room`);
      pill.title=`${result.visits.toLocaleString()} viewers`;
    } catch(error) {
      count.textContent='—';pill.setAttribute('aria-label','Room audience temporarily unavailable');
      if(attempt===0)setTimeout(()=>record(1),2500);
    }
  }
  record();
})();
