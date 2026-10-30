/* Native gift atlas; keep the inline SVG icons until the image is decoded. */
(() => {
  'use strict';
  if (window.giftArtwork) return;

  const atlasUrl = '/assets/hud-v1/gifts.lossless.webp';
  const atlasWidth = 1024, atlasHeight = 1536;
  // Measured crops from assets/hud-v1/gifts.json; no metadata request is needed.
  const crops = {
    rose: [119, 114, 295, 334],
    heart: [569, 149, 375, 245],
    sunglasses: [71, 647, 397, 196],
    corgi: [610, 576, 332, 344], // Existing Dance action uses the corgi artwork.
    gg: [80, 1094, 386, 259],
  };
  const svgNamespace = 'http://www.w3.org/2000/svg';
  let status = 'idle', attempts = 0, retainedImage = null;
  let readyPromise = Promise.resolve(false);

  function element(name, attributes) {
    const node = document.createElementNS(svgNamespace, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }

  function install() {
    document.querySelectorAll('[data-gift] svg.gift-icon').forEach((svg, index) => {
      const name = svg.closest('[data-gift]').dataset.gift;
      const crop = crops[name];
      if (!crop) return;
      const [x, y, width, height] = crop;
      const clipId = `gift-art-${name}-${index}`;
      const definitions = element('defs', {});
      const clip = element('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
      clip.append(element('rect', { x, y, width, height }));
      definitions.append(clip);
      const drawing = element('image', {
        href: retainedImage.src,
        x: 0, y: 0, width: atlasWidth, height: atlasHeight,
        'clip-path': `url(#${clipId})`,
      });
      // Clip the measured crop explicitly so letterboxing cannot show a neighbour.
      svg.setAttribute('viewBox', crop.join(' '));
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('overflow', 'hidden');
      svg.replaceChildren(definitions, drawing);
      svg.dataset.artwork = 'ready';
    });
  }

  function download() {
    return new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const finish = success => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        image.onload = image.onerror = null;
        resolve(success ? image : null);
      };
      const timeout = setTimeout(() => finish(false), 10000);
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.onload = () => {
        Promise.resolve()
          .then(() => typeof image.decode === 'function' ? image.decode() : undefined)
          .then(() => finish(image.naturalWidth === atlasWidth && image.naturalHeight === atlasHeight))
          .catch(() => finish(false));
      };
      image.onerror = () => finish(false);
      image.src = atlasUrl;
    });
  }

  async function load() {
    if (status === 'loading' || status === 'ready') return status === 'ready';
    status = 'loading';
    attempts = 0;
    try {
      while (attempts < 3) {
        attempts += 1;
        retainedImage = await download();
        if (retainedImage) {
          install();
          status = 'ready';
          return true;
        }
        if (attempts < 3) await new Promise(resolve => setTimeout(resolve, attempts * 600));
      }
    } catch {
      // Artwork is optional: never interrupt the game or remove its fallback icons.
    }
    status = 'failed';
    return false;
  }

  window.giftArtwork = {
    get status() { return status; },
    get attempts() { return attempts; },
    get readyPromise() { return readyPromise; },
  };
  window.addEventListener('online', () => {
    if (status === 'failed') readyPromise = load();
  });
  readyPromise = load();
})();
