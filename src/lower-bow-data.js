'use strict';
// Native lower waist bows, keeping existing pose families and painted frames.
(() => {
const patches={
  "lily": {
    "christmas": {
      "atlas": {
        "url": "assets/lower-bows-v1/lily-holiday-bows-v3.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "frame": {
        "atlas": "lowerBow",
        "crop": [
          63,
          185,
          405,
          651
        ],
        "ground": [
          305,
          820
        ],
        "eyesCenter": [
          144,
          349
        ],
        "faceWidth": 65,
        "scale": 0.46,
        "contact": [
          239,
          336
        ]
      }
    },
    "valentines": {
      "atlas": {
        "url": "assets/lower-bows-v1/lily-holiday-bows-v3.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "frame": {
        "atlas": "lowerBow",
        "crop": [
          582,
          190,
          379,
          646
        ],
        "ground": [
          808,
          823
        ],
        "eyesCenter": [
          658,
          351
        ],
        "faceWidth": 65,
        "scale": 0.46,
        "contact": [
          759,
          336
        ]
      }
    }
  },
  "mia": {
    "christmas": {
      "atlas": {
        "url": "assets/lower-bows-v1/mia-bows-holidays-weekend-spaced.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "frame": {
        "atlas": "lowerBow",
        "crop": [
          100,
          269,
          320,
          534
        ],
        "ground": [
          307,
          796
        ],
        "eyesCenter": [
          163,
          399
        ],
        "faceWidth": 66,
        "scale": 0.547645125958379,
        "contact": [
          282,
          400
        ],
        "eyeAngle": -15
      }
    },
    "valentines": {
      "atlas": {
        "url": "assets/lower-bows-v1/mia-bows-holidays-weekend-spaced.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "frame": {
        "atlas": "lowerBow",
        "crop": [
          614,
          303,
          337,
          501
        ],
        "ground": [
          818,
          797
        ],
        "eyesCenter": [
          681,
          400
        ],
        "faceWidth": 66,
        "scale": 0.5339856902356902,
        "contact": [
          798,
          396
        ],
        "eyeAngle": -15
      }
    }
  }
};
for(const [id,outfits] of Object.entries(patches))for(const [outfit,patch] of Object.entries(outfits)){
  const data=outfit==='casual'?window.duoSpriteData.characters[id]:window.outfitSpriteData[id][outfit];
  data.atlases.lowerBow=patch.atlas;
  const family=data.poses.bow;
  for(const name of new Set([family.default,...Object.values(family.variants||{})]))data.frames[name]={...patch.frame};
}
})();
