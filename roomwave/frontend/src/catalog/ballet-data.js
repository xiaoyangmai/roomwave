'use strict';
// Native ballet costumes; full painted expressions and clothes-only hangers.
(() => {
  const costumes={
  "lily": {
    "ballet": {
      "atlases": {
        "standing": {
          "url": "/assets/ballet-v1/lily-ballet-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/ballet-v1/lily-ballet-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            85,
            9,
            260,
            498
          ],
          "ground": [
            204,
            502
          ],
          "eyesCenter": [
            218,
            88
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            448,
            9,
            259,
            498
          ],
          "ground": [
            566,
            502
          ],
          "eyesCenter": [
            580,
            88
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            828,
            9,
            259,
            496
          ],
          "ground": [
            944,
            500
          ],
          "eyesCenter": [
            958,
            88
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1205,
            9,
            258,
            497
          ],
          "ground": [
            1323,
            501
          ],
          "eyesCenter": [
            1336,
            88
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            82,
            518,
            263,
            491
          ],
          "ground": [
            213,
            1004
          ],
          "eyesCenter": [
            217,
            594
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            448,
            519,
            259,
            488
          ],
          "ground": [
            569,
            1002
          ],
          "eyesCenter": [
            577,
            596
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            828,
            509,
            260,
            501
          ],
          "ground": [
            956,
            1005
          ],
          "eyesCenter": [
            960,
            607
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1190,
            506,
            327,
            503
          ],
          "ground": [
            1317,
            1004
          ],
          "eyesCenter": [
            1321,
            604
          ],
          "faceWidth": 70,
          "scale": 0.7099391480730223
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            68,
            16,
            303,
            418
          ],
          "ground": [
            216,
            429
          ],
          "eyesCenter": [
            219,
            115
          ],
          "faceWidth": 83,
          "scale": 0.6295399515738499
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            420,
            16,
            302,
            418
          ],
          "ground": [
            568,
            429
          ],
          "eyesCenter": [
            571,
            115
          ],
          "faceWidth": 83,
          "scale": 0.6295399515738499
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            804,
            17,
            302,
            417
          ],
          "ground": [
            952,
            429
          ],
          "eyesCenter": [
            954,
            115
          ],
          "faceWidth": 83,
          "scale": 0.6310679611650486
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1186,
            16,
            303,
            418
          ],
          "ground": [
            1335,
            429
          ],
          "eyesCenter": [
            1336,
            115
          ],
          "faceWidth": 83,
          "scale": 0.6295399515738499
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            35,
            439,
            339,
            548
          ],
          "ground": [
            221,
            982
          ],
          "eyesCenter": [
            226,
            537
          ],
          "faceWidth": 74,
          "scale": 0.625
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            440,
            435,
            289,
            565
          ],
          "ground": [
            574,
            995
          ],
          "eyesCenter": [
            584,
            520
          ],
          "faceWidth": 74,
          "scale": 0.625,
          "contact": [
            487,
            555
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            803,
            435,
            347,
            565
          ],
          "ground": [
            925,
            995
          ],
          "eyesCenter": [
            936,
            520
          ],
          "faceWidth": 74,
          "scale": 0.625,
          "contact": [
            1106,
            662
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1180,
            552,
            310,
            435
          ],
          "ground": [
            1358,
            982
          ],
          "eyesCenter": [
            1257,
            641
          ],
          "faceWidth": 74,
          "scale": 0.625,
          "contact": [
            1470,
            669
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
  "mia": {
    "ballet": {
      "atlases": {
        "standing": {
          "url": "/assets/ballet-v1/mia-ballet-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/ballet-v1/mia-ballet-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            112,
            24,
            242,
            472
          ],
          "ground": [
            234,
            490
          ],
          "eyesCenter": [
            232,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            465,
            24,
            243,
            472
          ],
          "ground": [
            588,
            490
          ],
          "eyesCenter": [
            588,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            822,
            25,
            243,
            471
          ],
          "ground": [
            945,
            490
          ],
          "eyesCenter": [
            943,
            92
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1199,
            25,
            241,
            471
          ],
          "ground": [
            1324,
            490
          ],
          "eyesCenter": [
            1324,
            92
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            93,
            526,
            253,
            463
          ],
          "ground": [
            216,
            983
          ],
          "eyesCenter": [
            222,
            598
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            461,
            527,
            244,
            464
          ],
          "ground": [
            583,
            985
          ],
          "eyesCenter": [
            586,
            597
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            811,
            507,
            250,
            485
          ],
          "ground": [
            941,
            986
          ],
          "eyesCenter": [
            948,
            604
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1187,
            508,
            302,
            486
          ],
          "ground": [
            1317,
            988
          ],
          "eyesCenter": [
            1318,
            610
          ],
          "faceWidth": 56,
          "scale": 0.7510729613733905
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            71,
            13,
            314,
            428
          ],
          "ground": [
            232,
            435
          ],
          "eyesCenter": [
            228,
            103
          ],
          "faceWidth": 80,
          "scale": 0.6161137440758294
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            437,
            13,
            316,
            428
          ],
          "ground": [
            594,
            435
          ],
          "eyesCenter": [
            595,
            103
          ],
          "faceWidth": 80,
          "scale": 0.6161137440758294
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            805,
            13,
            316,
            428
          ],
          "ground": [
            962,
            435
          ],
          "eyesCenter": [
            963,
            103
          ],
          "faceWidth": 80,
          "scale": 0.6161137440758294
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1173,
            13,
            314,
            428
          ],
          "ground": [
            1329,
            435
          ],
          "eyesCenter": [
            1330,
            103
          ],
          "faceWidth": 80,
          "scale": 0.6161137440758294
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            34,
            448,
            325,
            559
          ],
          "ground": [
            205,
            1001
          ],
          "eyesCenter": [
            191,
            552
          ],
          "faceWidth": 60,
          "scale": 0.6616257088846881
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            454,
            464,
            252,
            535
          ],
          "ground": [
            581,
            993
          ],
          "eyesCenter": [
            579,
            536
          ],
          "faceWidth": 60,
          "scale": 0.6616257088846881,
          "contact": [
            510,
            575
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            799,
            462,
            362,
            537
          ],
          "ground": [
            918,
            993
          ],
          "eyesCenter": [
            919,
            535
          ],
          "faceWidth": 60,
          "scale": 0.6616257088846881,
          "contact": [
            1125,
            587
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1178,
            587,
            325,
            416
          ],
          "ground": [
            1387,
            997
          ],
          "eyesCenter": [
            1256,
            670
          ],
          "faceWidth": 62,
          "scale": 0.6616257088846881,
          "contact": [
            1483,
            710
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
  const hangers={
  "lily": {
    "ballet": {
      "crop": [
        270,
        6,
        715,
        1230
      ],
      "atlas": {
        "url": "/assets/ballet-v1/lily-ballet-hanger.lossless.webp",
        "width": 1254,
        "height": 1254
      }
    }
  },
  "mia": {
    "ballet": {
      "crop": [
        236,
        6,
        783,
        1218
      ],
      "atlas": {
        "url": "/assets/ballet-v1/mia-ballet-hanger.lossless.webp",
        "width": 1254,
        "height": 1254
      }
    }
  }
};
  for(const id of ['lily','mia']){Object.assign(window.outfitSpriteData[id],costumes[id]);Object.assign(window.wardrobeHangers[id].frames,hangers[id]);}
})();
