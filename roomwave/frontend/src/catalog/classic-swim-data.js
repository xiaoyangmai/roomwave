'use strict';
// Additional complete painted swim outfits. Existing costume sets remain available.
(() => {
  const costumes={
  "mia": {
    "atlases": {
      "standing": {
        "url": "/assets/swim-v2/mia-onepiece-standing.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "actions": {
        "url": "/assets/swim-v2/mia-onepiece-actions.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "frames": {
      "idle": {
        "atlas": "standing",
        "crop": [
          173,
          36,
          117,
          454
        ],
        "ground": [
          230,
          486
        ],
        "eyesCenter": [
          228,
          98
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "happy": {
        "atlas": "standing",
        "crop": [
          534,
          36,
          117,
          454
        ],
        "ground": [
          592,
          486
        ],
        "eyesCenter": [
          589,
          98
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "surprised": {
        "atlas": "standing",
        "crop": [
          892,
          36,
          117,
          454
        ],
        "ground": [
          950,
          486
        ],
        "eyesCenter": [
          949,
          98
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "angry": {
        "atlas": "standing",
        "crop": [
          1255,
          36,
          116,
          454
        ],
        "ground": [
          1312,
          486
        ],
        "eyesCenter": [
          1312,
          98
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "wave": {
        "atlas": "standing",
        "crop": [
          128,
          539,
          183,
          443
        ],
        "ground": [
          229,
          978
        ],
        "eyesCenter": [
          224,
          600
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "heartLow": {
        "atlas": "standing",
        "crop": [
          521,
          542,
          151,
          440
        ],
        "ground": [
          594,
          978
        ],
        "eyesCenter": [
          595,
          602
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "heart": {
        "atlas": "standing",
        "crop": [
          865,
          537,
          178,
          445
        ],
        "ground": [
          955,
          978
        ],
        "eyesCenter": [
          956,
          620
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "dance1": {
        "atlas": "standing",
        "crop": [
          1244,
          535,
          217,
          449
        ],
        "ground": [
          1321,
          980
        ],
        "eyesCenter": [
          1315,
          603
        ],
        "faceWidth": 62,
        "scale": 0.7777777777777778
      },
      "kneelShy": {
        "atlas": "actions",
        "crop": [
          94,
          13,
          283,
          413
        ],
        "ground": [
          235,
          422
        ],
        "eyesCenter": [
          231,
          97
        ],
        "faceWidth": 76,
        "scale": 0.6356968215158925
      },
      "kneelWorried": {
        "atlas": "actions",
        "crop": [
          436,
          13,
          286,
          413
        ],
        "ground": [
          579,
          422
        ],
        "eyesCenter": [
          579,
          97
        ],
        "faceWidth": 76,
        "scale": 0.6356968215158925
      },
      "kneelSad": {
        "atlas": "actions",
        "crop": [
          819,
          13,
          285,
          413
        ],
        "ground": [
          961,
          422
        ],
        "eyesCenter": [
          960,
          98
        ],
        "faceWidth": 76,
        "scale": 0.6356968215158925
      },
      "kneelHappy": {
        "atlas": "actions",
        "crop": [
          1184,
          13,
          283,
          413
        ],
        "ground": [
          1325,
          422
        ],
        "eyesCenter": [
          1325,
          99
        ],
        "faceWidth": 76,
        "scale": 0.6356968215158925
      },
      "dance2": {
        "atlas": "actions",
        "crop": [
          104,
          425,
          254,
          578
        ],
        "ground": [
          222,
          999
        ],
        "eyesCenter": [
          217,
          499
        ],
        "faceWidth": 73,
        "scale": 0.6183745583038869
      },
      "bow": {
        "atlas": "actions",
        "crop": [
          495,
          434,
          184,
          560
        ],
        "ground": [
          597,
          990
        ],
        "eyesCenter": [
          558,
          511
        ],
        "faceWidth": 72,
        "scale": 0.6183745583038869,
        "contact": [
          664,
          680
        ]
      },
      "gesturePrepare": {
        "atlas": "actions",
        "crop": [
          866,
          425,
          206,
          570
        ],
        "ground": [
          968,
          991
        ],
        "eyesCenter": [
          961,
          498
        ],
        "faceWidth": 73,
        "scale": 0.6183745583038869,
        "contact": [
          887,
          553
        ]
      },
      "gestureExtend": {
        "atlas": "actions",
        "crop": [
          1217,
          426,
          312,
          572
        ],
        "ground": [
          1345,
          994
        ],
        "eyesCenter": [
          1325,
          500
        ],
        "faceWidth": 73,
        "scale": 0.6183745583038869,
        "contact": [
          1497,
          612
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
  },
  "lily": {
    "atlases": {
      "standing": {
        "url": "/assets/swim-v2/lily-twopiece-standing.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "actions": {
        "url": "/assets/swim-v2/lily-twopiece-actions.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "frames": {
      "idle": {
        "atlas": "standing",
        "crop": [
          98,
          5,
          204,
          505
        ],
        "ground": [
          203,
          507
        ],
        "eyesCenter": [
          201,
          77
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "happy": {
        "atlas": "standing",
        "crop": [
          482,
          4,
          203,
          506
        ],
        "ground": [
          586,
          507
        ],
        "eyesCenter": [
          585,
          77
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "surprised": {
        "atlas": "standing",
        "crop": [
          864,
          4,
          203,
          506
        ],
        "ground": [
          970,
          507
        ],
        "eyesCenter": [
          966,
          77
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "angry": {
        "atlas": "standing",
        "crop": [
          1229,
          4,
          206,
          506
        ],
        "ground": [
          1334,
          507
        ],
        "eyesCenter": [
          1335,
          77
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "wave": {
        "atlas": "standing",
        "crop": [
          87,
          512,
          232,
          504
        ],
        "ground": [
          203,
          1011
        ],
        "eyesCenter": [
          198,
          584
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "heartLow": {
        "atlas": "standing",
        "crop": [
          481,
          513,
          212,
          503
        ],
        "ground": [
          590,
          1011
        ],
        "eyesCenter": [
          587,
          585
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "heart": {
        "atlas": "standing",
        "crop": [
          852,
          509,
          218,
          507
        ],
        "ground": [
          968,
          1011
        ],
        "eyesCenter": [
          963,
          589
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "dance1": {
        "atlas": "standing",
        "crop": [
          1172,
          513,
          323,
          503
        ],
        "ground": [
          1338,
          1011
        ],
        "eyesCenter": [
          1338,
          594
        ],
        "faceWidth": 61,
        "scale": 0.6972111553784861
      },
      "kneelShy": {
        "atlas": "actions",
        "crop": [
          96,
          8,
          259,
          414
        ],
        "ground": [
          228,
          421
        ],
        "eyesCenter": [
          224,
          98
        ],
        "faceWidth": 76,
        "scale": 0.6295399515738499
      },
      "kneelWorried": {
        "atlas": "actions",
        "crop": [
          454,
          8,
          260,
          414
        ],
        "ground": [
          588,
          421
        ],
        "eyesCenter": [
          582,
          99
        ],
        "faceWidth": 76,
        "scale": 0.6295399515738499
      },
      "kneelSad": {
        "atlas": "actions",
        "crop": [
          832,
          8,
          257,
          414
        ],
        "ground": [
          963,
          421
        ],
        "eyesCenter": [
          961,
          100
        ],
        "faceWidth": 76,
        "scale": 0.6295399515738499
      },
      "kneelHappy": {
        "atlas": "actions",
        "crop": [
          1192,
          8,
          258,
          414
        ],
        "ground": [
          1326,
          421
        ],
        "eyesCenter": [
          1323,
          102
        ],
        "faceWidth": 76,
        "scale": 0.6295399515738499
      },
      "dance2": {
        "atlas": "actions",
        "crop": [
          83,
          422,
          310,
          566
        ],
        "ground": [
          238,
          982
        ],
        "eyesCenter": [
          224,
          498
        ],
        "faceWidth": 73,
        "scale": 0.6272401433691757
      },
      "bow": {
        "atlas": "actions",
        "crop": [
          483,
          422,
          244,
          566
        ],
        "ground": [
          618,
          982
        ],
        "eyesCenter": [
          546,
          505
        ],
        "faceWidth": 72,
        "scale": 0.6272401433691757,
        "contact": [
          712,
          661
        ]
      },
      "gesturePrepare": {
        "atlas": "actions",
        "crop": [
          836,
          422,
          244,
          564
        ],
        "ground": [
          959,
          980
        ],
        "eyesCenter": [
          960,
          497
        ],
        "faceWidth": 73,
        "scale": 0.6272401433691757,
        "contact": [
          889,
          555
        ],
        "mirror": true
      },
      "gestureExtend": {
        "atlas": "actions",
        "crop": [
          1190,
          422,
          333,
          564
        ],
        "ground": [
          1318,
          980
        ],
        "eyesCenter": [
          1315,
          498
        ],
        "faceWidth": 73,
        "scale": 0.6272401433691757,
        "contact": [
          1480,
          645
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
  }
};
  window.outfitSpriteData ||= {};
  for (const [id,data] of Object.entries(costumes)) {
    window.outfitSpriteData[id] ||= {};
    window.outfitSpriteData[id][id==='mia'?'one-piece':'two-piece']=data;
  }
})();
