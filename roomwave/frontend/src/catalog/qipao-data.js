'use strict';
// Complete painted qipao outfits. Existing costume sets remain available.
(() => {
  const costumes={
  "mia": {
    "qipao": {
      "atlases": {
        "standing": {
          "url": "/assets/qipao-v1/mia-qipao-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/qipao-v1/mia-qipao-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            170,
            35,
            123,
            482
          ],
          "ground": [
            231,
            512
          ],
          "eyesCenter": [
            228,
            96
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            530,
            36,
            125,
            481
          ],
          "ground": [
            592,
            512
          ],
          "eyesCenter": [
            588,
            96
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            890,
            34,
            122,
            483
          ],
          "ground": [
            951,
            512
          ],
          "eyesCenter": [
            947,
            95
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1254,
            34,
            121,
            483
          ],
          "ground": [
            1313,
            512
          ],
          "eyesCenter": [
            1311,
            96
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            128,
            534,
            185,
            468
          ],
          "ground": [
            231,
            997
          ],
          "eyesCenter": [
            224,
            596
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            521,
            537,
            151,
            465
          ],
          "ground": [
            595,
            997
          ],
          "eyesCenter": [
            593,
            599
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            866,
            530,
            177,
            476
          ],
          "ground": [
            956,
            1001
          ],
          "eyesCenter": [
            953,
            617
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1244,
            526,
            220,
            475
          ],
          "ground": [
            1322,
            996
          ],
          "eyesCenter": [
            1315,
            601
          ],
          "faceWidth": 62,
          "scale": 0.7337526205450734
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            96,
            13,
            285,
            419
          ],
          "ground": [
            235,
            427
          ],
          "eyesCenter": [
            233,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6280193236714976
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            439,
            13,
            284,
            418
          ],
          "ground": [
            579,
            426
          ],
          "eyesCenter": [
            576,
            97
          ],
          "faceWidth": 76,
          "scale": 0.6295399515738499
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            816,
            13,
            287,
            418
          ],
          "ground": [
            960,
            426
          ],
          "eyesCenter": [
            954,
            104
          ],
          "faceWidth": 76,
          "scale": 0.6295399515738499
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1184,
            13,
            287,
            417
          ],
          "ground": [
            1327,
            425
          ],
          "eyesCenter": [
            1325,
            101
          ],
          "faceWidth": 76,
          "scale": 0.6310679611650486
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            103,
            437,
            255,
            558
          ],
          "ground": [
            226,
            990
          ],
          "eyesCenter": [
            219,
            507
          ],
          "faceWidth": 73,
          "scale": 0.6352087114337568
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            497,
            440,
            183,
            552
          ],
          "ground": [
            599,
            987
          ],
          "eyesCenter": [
            562,
            518
          ],
          "faceWidth": 73,
          "scale": 0.6352087114337568,
          "contact": [
            668,
            683
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            870,
            436,
            205,
            556
          ],
          "ground": [
            967,
            987
          ],
          "eyesCenter": [
            963,
            507
          ],
          "faceWidth": 73,
          "scale": 0.6352087114337568,
          "contact": [
            888,
            555
          ]
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1220,
            437,
            308,
            555
          ],
          "ground": [
            1344,
            987
          ],
          "eyesCenter": [
            1325,
            508
          ],
          "faceWidth": 73,
          "scale": 0.6352087114337568,
          "contact": [
            1498,
            616
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
  },
  "lily": {
    "qipao": {
      "atlases": {
        "standing": {
          "url": "/assets/qipao-v1/lily-qipao-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/qipao-v1/lily-qipao-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            95,
            7,
            211,
            503
          ],
          "ground": [
            204,
            507
          ],
          "eyesCenter": [
            201,
            80
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            478,
            7,
            212,
            503
          ],
          "ground": [
            588,
            507
          ],
          "eyesCenter": [
            585,
            80
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            863,
            7,
            212,
            503
          ],
          "ground": [
            972,
            507
          ],
          "eyesCenter": [
            970,
            82
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1245,
            7,
            212,
            503
          ],
          "ground": [
            1355,
            507
          ],
          "eyesCenter": [
            1353,
            82
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            87,
            513,
            237,
            499
          ],
          "ground": [
            204,
            1008
          ],
          "eyesCenter": [
            201,
            587
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            479,
            516,
            220,
            495
          ],
          "ground": [
            592,
            1007
          ],
          "eyesCenter": [
            588,
            588
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            850,
            512,
            222,
            500
          ],
          "ground": [
            970,
            1008
          ],
          "eyesCenter": [
            963,
            591
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1184,
            510,
            324,
            502
          ],
          "ground": [
            1347,
            1008
          ],
          "eyesCenter": [
            1347,
            592
          ],
          "faceWidth": 61,
          "scale": 0.7
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            99,
            10,
            257,
            410
          ],
          "ground": [
            229,
            416
          ],
          "eyesCenter": [
            224,
            98
          ],
          "faceWidth": 76,
          "scale": 0.6403940886699507
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            455,
            10,
            257,
            410
          ],
          "ground": [
            587,
            416
          ],
          "eyesCenter": [
            582,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6403940886699507
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            833,
            10,
            255,
            410
          ],
          "ground": [
            963,
            416
          ],
          "eyesCenter": [
            960,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6403940886699507
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1192,
            10,
            256,
            410
          ],
          "ground": [
            1328,
            416
          ],
          "eyesCenter": [
            1323,
            100
          ],
          "faceWidth": 76,
          "scale": 0.6403940886699507
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            81,
            420,
            309,
            564
          ],
          "ground": [
            236,
            980
          ],
          "eyesCenter": [
            224,
            500
          ],
          "faceWidth": 73,
          "scale": 0.6272401433691757
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            474,
            420,
            251,
            560
          ],
          "ground": [
            617,
            976
          ],
          "eyesCenter": [
            544,
            505
          ],
          "faceWidth": 72,
          "scale": 0.6272401433691757,
          "contact": [
            705,
            652
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            832,
            420,
            251,
            562
          ],
          "ground": [
            959,
            978
          ],
          "eyesCenter": [
            960,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6272401433691757,
          "contact": [
            888,
            555
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1186,
            421,
            335,
            561
          ],
          "ground": [
            1328,
            978
          ],
          "eyesCenter": [
            1316,
            500
          ],
          "faceWidth": 73,
          "scale": 0.6272401433691757,
          "contact": [
            1482,
            646
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
  }
};
  window.outfitSpriteData ||= {};
  for (const [id,data] of Object.entries(costumes)) {
    window.outfitSpriteData[id] ||= {};
    Object.assign(window.outfitSpriteData[id],data);
  }
})();
