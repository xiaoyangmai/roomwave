'use strict';
// Clothes-only shop art; native transparent PNG with measured per-outfit crops.
(() => {
  window.wardrobeHangers ||= {};
  window.wardrobeHangers.stella = {
    atlas: {url:'/assets/stella-v1/stella-hangers.lossless.webp',width:1536,height:1024},
    frames: {
      'two-piece':{atlas:{url:'/assets/stella-v1/bikini-hanger.lossless.webp',width:1254,height:1254},crop:[365, 7, 522, 1205]},
      'one-piece':{atlas:{url:'/assets/stella-v1/onepiece-hanger.lossless.webp',width:1254,height:1254},crop:[391, 7, 468, 1200]},
      casual:[325,3,351,450],
      denim:[873,3,318,451],
      sporty:[333,457,335,540],
      spacesuit:[891,458,281,539],
      swimsuit:{atlas:{url:'/assets/stella-v1/swimsuit-hanger.lossless.webp',width:1254,height:1254},crop:[306,8,641,1198]},
      'lilac-daisy':{atlas:{url:'/assets/stella-v1/lilac-daisy-hanger.lossless.webp',width:1254,height:1254},crop:[279,10,696,1215]},
    },
  };
})();
