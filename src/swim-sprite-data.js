'use strict';
// Full painted swimsuit variants; original PNG alpha and pixels are unchanged.
(() => {
  const swimsuits={
  "mia": {
    "atlases": {
      "standing": {
        "url": "assets/swim-v1/mia-swim-standing.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "actions": {
        "url": "assets/swim-v1/mia-swim-actions.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "frames": {
      "idle": {
        "atlas": "standing",
        "crop": [
          161,
          37,
          139,
          451
        ],
        "ground": [
          230,
          485
        ],
        "eyesCenter": [
          228,
          98
        ],
        "faceWidth": 62,
        "scale": 0.78125
      },
      "happy": {
        "atlas": "standing",
        "crop": [
          522,
          37,
          137,
          451
        ],
        "ground": [
          592,
          485
        ],
        "eyesCenter": [
          589,
          98
        ],
        "faceWidth": 62,
        "scale": 0.78125
      },
      "surprised": {
        "atlas": "standing",
        "crop": [
          880,
          37,
          139,
          451
        ],
        "ground": [
          950,
          485
        ],
        "eyesCenter": [
          949,
          98
        ],
        "faceWidth": 62,
        "scale": 0.78125
      },
      "angry": {
        "atlas": "standing",
        "crop": [
          1242,
          37,
          138,
          451
        ],
        "ground": [
          1312,
          485
        ],
        "eyesCenter": [
          1312,
          98
        ],
        "faceWidth": 62,
        "scale": 0.78125
      },
      "wave": {
        "atlas": "standing",
        "crop": [
          130,
          540,
          180,
          441
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
        "scale": 0.78125
      },
      "heartLow": {
        "atlas": "standing",
        "crop": [
          523,
          542,
          147,
          439
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
        "scale": 0.78125
      },
      "heart": {
        "atlas": "standing",
        "crop": [
          867,
          538,
          174,
          443
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
        "scale": 0.78125
      },
      "dance1": {
        "atlas": "standing",
        "crop": [
          1245,
          536,
          215,
          446
        ],
        "ground": [
          1321,
          979
        ],
        "eyesCenter": [
          1315,
          603
        ],
        "faceWidth": 62,
        "scale": 0.78125
      },
      "kneelShy": {
        "atlas": "actions",
        "crop": [
          96,
          13,
          278,
          412
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
          440,
          13,
          278,
          412
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
          822,
          13,
          278,
          412
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
          1186,
          13,
          278,
          411
        ],
        "ground": [
          1325,
          421
        ],
        "eyesCenter": [
          1325,
          99
        ],
        "faceWidth": 76,
        "scale": 0.6372549019607843
      },
      "dance2": {
        "atlas": "actions",
        "crop": [
          107,
          426,
          247,
          575
        ],
        "ground": [
          222,
          998
        ],
        "eyesCenter": [
          217,
          499
        ],
        "faceWidth": 73,
        "scale": 0.6216696269982238
      },
      "bow": {
        "atlas": "actions",
        "crop": [
          498,
          436,
          199,
          556
        ],
        "ground": [
          597,
          989
        ],
        "eyesCenter": [
          558,
          511
        ],
        "faceWidth": 72,
        "scale": 0.6216696269982238,
        "contact": [
          659,
          674
        ]
      },
      "gesturePrepare": {
        "atlas": "actions",
        "crop": [
          869,
          427,
          201,
          566
        ],
        "ground": [
          968,
          990
        ],
        "eyesCenter": [
          961,
          498
        ],
        "faceWidth": 73,
        "scale": 0.6216696269982238,
        "contact": [
          887,
          553
        ]
      },
      "gestureExtend": {
        "atlas": "actions",
        "crop": [
          1222,
          428,
          306,
          568
        ],
        "ground": [
          1345,
          993
        ],
        "eyesCenter": [
          1325,
          500
        ],
        "faceWidth": 73,
        "scale": 0.6216696269982238,
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
        "url": "assets/swim-v1/lily-swim-standing.lossless.webp",
        "width": 1536,
        "height": 1024
      },
      "actions": {
        "url": "assets/swim-v1/lily-swim-actions.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "frames": {
      "idle": {
        "atlas": "standing",
        "crop": [
          101,
          6,
          199,
          504
        ],
        "ground": [
          203,
          506
        ],
        "eyesCenter": [
          201,
          77
        ],
        "faceWidth": 61,
        "scale": 0.7
      },
      "happy": {
        "atlas": "standing",
        "crop": [
          484,
          6,
          199,
          504
        ],
        "ground": [
          586,
          506
        ],
        "eyesCenter": [
          585,
          77
        ],
        "faceWidth": 61,
        "scale": 0.7
      },
      "surprised": {
        "atlas": "standing",
        "crop": [
          865,
          5,
          200,
          505
        ],
        "ground": [
          970,
          506
        ],
        "eyesCenter": [
          966,
          77
        ],
        "faceWidth": 61,
        "scale": 0.7
      },
      "angry": {
        "atlas": "standing",
        "crop": [
          1232,
          6,
          199,
          504
        ],
        "ground": [
          1334,
          506
        ],
        "eyesCenter": [
          1335,
          77
        ],
        "faceWidth": 61,
        "scale": 0.7
      },
      "wave": {
        "atlas": "standing",
        "crop": [
          91,
          513,
          226,
          502
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
        "scale": 0.7
      },
      "heartLow": {
        "atlas": "standing",
        "crop": [
          485,
          515,
          204,
          500
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
        "scale": 0.7
      },
      "heart": {
        "atlas": "standing",
        "crop": [
          855,
          510,
          213,
          505
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
        "scale": 0.7
      },
      "dance1": {
        "atlas": "standing",
        "crop": [
          1174,
          514,
          319,
          501
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
        "scale": 0.7
      },
      "kneelShy": {
        "atlas": "actions",
        "crop": [
          100,
          9,
          251,
          412
        ],
        "ground": [
          228,
          417
        ],
        "eyesCenter": [
          224,
          98
        ],
        "faceWidth": 76,
        "scale": 0.6372549019607843
      },
      "kneelWorried": {
        "atlas": "actions",
        "crop": [
          456,
          9,
          255,
          412
        ],
        "ground": [
          588,
          417
        ],
        "eyesCenter": [
          582,
          99
        ],
        "faceWidth": 76,
        "scale": 0.6372549019607843
      },
      "kneelSad": {
        "atlas": "actions",
        "crop": [
          834,
          9,
          251,
          412
        ],
        "ground": [
          963,
          417
        ],
        "eyesCenter": [
          961,
          100
        ],
        "faceWidth": 76,
        "scale": 0.6372549019607843
      },
      "kneelHappy": {
        "atlas": "actions",
        "crop": [
          1194,
          10,
          253,
          411
        ],
        "ground": [
          1326,
          417
        ],
        "eyesCenter": [
          1323,
          102
        ],
        "faceWidth": 76,
        "scale": 0.6388206388206388
      },
      "dance2": {
        "atlas": "actions",
        "crop": [
          86,
          420,
          304,
          563
        ],
        "ground": [
          238,
          979
        ],
        "eyesCenter": [
          224,
          498
        ],
        "faceWidth": 73,
        "scale": 0.625
      },
      "bow": {
        "atlas": "actions",
        "crop": [
          484,
          419,
          249,
          563
        ],
        "ground": [
          618,
          978
        ],
        "eyesCenter": [
          543,
          505
        ],
        "faceWidth": 72,
        "scale": 0.625,
        "contact": [
          705,
          654
        ]
      },
      "gesturePrepare": {
        "atlas": "actions",
        "crop": [
          839,
          418,
          239,
          564
        ],
        "ground": [
          959,
          978
        ],
        "eyesCenter": [
          960,
          497
        ],
        "faceWidth": 73,
        "scale": 0.625,
        "contact": [
          887,
          556
        ],
        "mirror": true
      },
      "gestureExtend": {
        "atlas": "actions",
        "crop": [
          1192,
          422,
          325,
          561
        ],
        "ground": [
          1318,
          979
        ],
        "eyesCenter": [
          1315,
          498
        ],
        "faceWidth": 73,
        "scale": 0.625,
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
  for (const [id,data] of Object.entries(swimsuits)) {
    window.outfitSpriteData[id] ||= {};
    window.outfitSpriteData[id].swimsuit=data;
  }
})();
