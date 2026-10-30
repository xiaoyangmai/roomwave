'use strict';
(() => {
  const banner=document.querySelector('#sprite-loading');
  const message=document.querySelector('#sprite-loading-message');
  const retry=document.querySelector('#sprite-retry');
  function update(){
    const states=window.characterSprites.getLoadingStatus();
    const failed=states.some(state=>state.status==='error');
    const loading=states.some(state=>state.status==='loading');
    banner.hidden=!failed&&!loading;
    message.textContent=failed?'Some artwork couldn’t load.':'Loading artwork…';
    retry.hidden=!failed;
  }
  window.addEventListener('charactersprites:loading',update);
  retry.addEventListener('click',event=>{
    event.stopPropagation();
    window.characterSprites.retryLoading();
    update();
  });
  update();
})();
