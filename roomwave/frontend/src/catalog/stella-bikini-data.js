'use strict';
// Stella's Pink Polka bikini. Coordinates use the original native-alpha atlas.
// Sixteen distinct painted frames retain the generator's original alpha.
// Kneeling and the polite greeting add a matching tunic cover-up.
// Load after stella-data.js; preserve all other characters and outfits.
(() => {
  const scale = 352 / 500;
  // Match the standing face's size; the seated figure must remain shorter.
  const reactionScale = 66 * scale / 108;
  const outfit = {
    atlases: {
      standing: { url: '/assets/stella-v1/bikini-standing.lossless.webp', width: 1536, height: 1024 },
      gestures: { url: '/assets/stella-v1/bikini-gestures.lossless.webp', width: 1536, height: 1024 },
      reactions: { url: '/assets/stella-v1/bikini-reactions.lossless.webp', width: 1536, height: 1024 },
      dance: { url: '/assets/stella-v1/bikini-dance2.lossless.webp', width: 1024, height: 1536 },
      bow: { url: '/assets/stella-v1/bikini-bow.lossless.webp', width: 1024, height: 1536 },
    },
    frames: {
      idle: {
        atlas: 'standing', crop: [125, 8, 229, 507], ground: [235, 511],
        eyesCenter: [236, 83], faceWidth: 66, scale,
        contact: [292, 163],
      },
      happy: {
        atlas: 'standing', crop: [477, 8, 231, 507], ground: [584, 511],
        eyesCenter: [596, 85], faceWidth: 66, scale,
      },
      surprised: {
        atlas: 'standing', crop: [836, 8, 228, 505], ground: [947, 511],
        eyesCenter: [950, 83], faceWidth: 66, scale,
      },
      angry: {
        atlas: 'standing', crop: [1196, 7, 219, 508], ground: [1301, 512],
        eyesCenter: [1301, 83], faceWidth: 66, scale,
        // Exclude the raised dance hand beside this pose's feet.
        clipPolygon: [[1196, 7], [1415, 7], [1415, 494], [1375, 494], [1375, 515], [1196, 515]],
      },
      wave: {
        atlas: 'standing', crop: [127, 515, 208, 484], ground: [220, 994],
        eyesCenter: [232, 586], faceWidth: 66, scale,
        contact: [306, 612],
      },
      heartLow: {
        atlas: 'standing', crop: [504, 515, 172, 485], ground: [579, 995],
        eyesCenter: [590, 589], faceWidth: 66, scale,
      },
      heart: {
        atlas: 'standing', crop: [858, 513, 185, 489], ground: [947, 997],
        eyesCenter: [950, 602], faceWidth: 66, scale,
      },
      dance1: {
        atlas: 'standing', crop: [1213, 496, 216, 509], ground: [1318, 1000],
        eyesCenter: [1297, 589], faceWidth: 66, scale,
        // Exclude the upper-row feet while retaining this pose's raised fist.
        clipPolygon: [[1388, 496], [1429, 496], [1429, 1005], [1213, 1005], [1213, 515], [1388, 515]],
      },
      gesturePrepare: {
        atlas: 'gestures', crop: [315, 13, 347, 958], ground: [486, 961],
        eyesCenter: [480, 134], faceWidth: 124, scale: 352 / 946,
        contact: [614, 217],
      },
      gestureExtend: {
        atlas: 'gestures', crop: [890, 13, 529, 958], ground: [1062, 961],
        eyesCenter: [1055, 134], faceWidth: 124, scale: 352 / 946,
        contact: [1394, 237],
      },
      kneelShy: {
        atlas: 'reactions', crop: [343, 5, 242, 507], ground: [464, 508],
        eyesCenter: [455, 111], faceWidth: 108, scale: reactionScale,
      },
      kneelHappy: {
        atlas: 'reactions', crop: [970, 5, 241, 507], ground: [1091, 508],
        eyesCenter: [1082, 109], faceWidth: 108, scale: reactionScale,
      },
      kneelWorried: {
        atlas: 'reactions', crop: [344, 512, 239, 509], ground: [464, 1015],
        eyesCenter: [455, 616], faceWidth: 108, scale: reactionScale,
      },
      kneelSad: {
        atlas: 'reactions', crop: [970, 512, 241, 509], ground: [1091, 1016],
        eyesCenter: [1082, 616], faceWidth: 108, scale: reactionScale,
      },
      dance2: {
        atlas: 'dance', crop: [166, 7, 620, 1486], ground: [493, 1484],
        eyesCenter: [516, 250], faceWidth: 182, scale: 352 / 1395,
        eyeAngle: -19,
      },
      bow: {
        // The game action uses a distinct polite nod with clasped hands.
        atlas: 'bow', crop: [333, 20, 358, 1445], ground: [512, 1456],
        eyesCenter: [498, 187], faceWidth: 184, scale: 352 / 1432,
        eyeAngle: -12,
        // Meet the outside of her upper arm, clear of her face.
        contact: [653, 439],
      },
    },
    poses: {
      wave: { default: 'wave', variants: {} },
      heartLow: { default: 'heartLow', variants: {} },
      heart: { default: 'heart', variants: {} },
      dance1: { default: 'dance1', variants: {} },
      dance2: { default: 'dance2', variants: {} },
      bow: { default: 'bow', variants: {} },
      gesturePrepare: { default: 'gesturePrepare', variants: {} },
      gestureExtend: { default: 'gestureExtend', variants: {} },
      idle: {
        default: 'idle',
        variants: {
          neutral: 'idle', blush: 'idle', happy: 'idle', laugh: 'happy',
          surprised: 'surprised', worried: 'surprised', angry: 'angry', sad: 'angry', crying: 'angry',
        },
      },
      kneeling: {
        default: 'kneelShy',
        variants: {
          neutral: 'kneelShy', blush: 'kneelShy', happy: 'kneelHappy', laugh: 'kneelHappy',
          worried: 'kneelWorried', surprised: 'kneelWorried', sad: 'kneelSad', angry: 'kneelSad', crying: 'kneelSad',
        },
      },
    },
  };
  window.outfitSpriteData ||= {};
  window.outfitSpriteData.stella ||= {};
  window.outfitSpriteData.stella['two-piece'] = outfit;
})();
