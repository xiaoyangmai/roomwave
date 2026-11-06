'use strict';
// Mia's complete painted nun costume: sixteen whole-figure sprites.
(() => {
  const data={
  "atlases": {
    "standing": {
      "url": "/assets/nun-v1/mia-nun-standing.lossless.webp",
      "width": 1536,
      "height": 1024
    },
    "actions": {
      "url": "/assets/nun-v1/mia-nun-actions.lossless.webp",
      "width": 1536,
      "height": 1024
    }
  },
  "frames": {
    "idle": {
      "atlas": "standing",
      "crop": [
        115,
        7,
        215,
        503
      ],
      "ground": [
        222,
        505
      ],
      "eyesCenter": [
        223,
        87
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "happy": {
      "atlas": "standing",
      "crop": [
        481,
        6,
        218,
        504
      ],
      "ground": [
        589,
        505
      ],
      "eyesCenter": [
        588,
        86
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "surprised": {
      "atlas": "standing",
      "crop": [
        848,
        6,
        217,
        504
      ],
      "ground": [
        957,
        505
      ],
      "eyesCenter": [
        957,
        86
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "angry": {
      "atlas": "standing",
      "crop": [
        1221,
        6,
        217,
        504
      ],
      "ground": [
        1329,
        505
      ],
      "eyesCenter": [
        1328,
        87
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "wave": {
      "atlas": "standing",
      "crop": [
        91,
        517,
        242,
        481
      ],
      "ground": [
        223,
        993
      ],
      "eyesCenter": [
        220,
        597
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "heartLow": {
      "atlas": "standing",
      "crop": [
        482,
        516,
        219,
        483
      ],
      "ground": [
        590,
        995
      ],
      "eyesCenter": [
        589,
        597
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "heart": {
      "atlas": "standing",
      "crop": [
        852,
        515,
        218,
        484
      ],
      "ground": [
        957,
        995
      ],
      "eyesCenter": [
        958,
        608
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "dance1": {
      "atlas": "standing",
      "crop": [
        1239,
        518,
        246,
        481
      ],
      "ground": [
        1328,
        995
      ],
      "eyesCenter": [
        1325,
        597
      ],
      "faceWidth": 65,
      "scale": 0.7028112449799196
    },
    "kneelShy": {
      "atlas": "actions",
      "crop": [
        80,
        8,
        315,
        421
      ],
      "ground": [
        238,
        424
      ],
      "eyesCenter": [
        234,
        103
      ],
      "faceWidth": 78,
      "scale": 0.625
    },
    "kneelWorried": {
      "atlas": "actions",
      "crop": [
        438,
        8,
        313,
        421
      ],
      "ground": [
        594,
        425
      ],
      "eyesCenter": [
        590,
        105
      ],
      "faceWidth": 78,
      "scale": 0.6235011990407674
    },
    "kneelSad": {
      "atlas": "actions",
      "crop": [
        796,
        7,
        317,
        423
      ],
      "ground": [
        953,
        425
      ],
      "eyesCenter": [
        954,
        105
      ],
      "faceWidth": 78,
      "scale": 0.6220095693779905
    },
    "kneelHappy": {
      "atlas": "actions",
      "crop": [
        1160,
        5,
        306,
        426
      ],
      "ground": [
        1308,
        426
      ],
      "eyesCenter": [
        1307,
        103
      ],
      "faceWidth": 78,
      "scale": 0.6175771971496437
    },
    "dance2": {
      "atlas": "actions",
      "crop": [
        85,
        433,
        283,
        573
      ],
      "ground": [
        233,
        1001
      ],
      "eyesCenter": [
        226,
        519
      ],
      "faceWidth": 73,
      "scale": 0.6172839506172839
    },
    "bow": {
      "atlas": "actions",
      "crop": [
        477,
        436,
        250,
        569
      ],
      "ground": [
        611,
        1001
      ],
      "eyesCenter": [
        592,
        519
      ],
      "faceWidth": 73,
      "scale": 0.6172839506172839,
      "contact": [
        714,
        755
      ]
    },
    "gesturePrepare": {
      "atlas": "actions",
      "crop": [
        826,
        433,
        266,
        572
      ],
      "ground": [
        961,
        1000
      ],
      "eyesCenter": [
        960,
        518
      ],
      "faceWidth": 73,
      "scale": 0.6172839506172839,
      "contact": [
        875,
        562
      ],
      "mirror": true
    },
    "gestureExtend": {
      "atlas": "actions",
      "crop": [
        1209,
        434,
        326,
        569
      ],
      "ground": [
        1337,
        998
      ],
      "eyesCenter": [
        1319,
        520
      ],
      "faceWidth": 73,
      "scale": 0.6172839506172839,
      "contact": [
        1495,
        635
      ]
    }
  },
  "poses": {
    "wave": {
      "default": "wave",
      "variants": {}
    },
    "heartLow": {
      "default": "heartLow",
      "variants": {}
    },
    "heart": {
      "default": "heart",
      "variants": {}
    },
    "dance1": {
      "default": "dance1",
      "variants": {}
    },
    "dance2": {
      "default": "dance2",
      "variants": {}
    },
    "bow": {
      "default": "bow",
      "variants": {}
    },
    "gesturePrepare": {
      "default": "gesturePrepare",
      "variants": {}
    },
    "gestureExtend": {
      "default": "gestureExtend",
      "variants": {}
    },
    "idle": {
      "default": "idle",
      "variants": {
        "neutral": "idle",
        "blush": "idle",
        "happy": "happy",
        "laugh": "happy",
        "surprised": "surprised",
        "worried": "surprised",
        "angry": "angry",
        "sad": "angry",
        "crying": "angry"
      }
    },
    "kneeling": {
      "default": "kneelShy",
      "variants": {
        "neutral": "kneelShy",
        "blush": "kneelShy",
        "happy": "kneelHappy",
        "laugh": "kneelHappy",
        "worried": "kneelWorried",
        "surprised": "kneelWorried",
        "sad": "kneelSad",
        "angry": "kneelSad",
        "crying": "kneelSad"
      }
    }
  }
};
  window.outfitSpriteData ||= {};
  window.outfitSpriteData.mia ||= {};
  window.outfitSpriteData.mia.nun=data;
})();
