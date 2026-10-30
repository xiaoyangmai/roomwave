'use strict';
// Mature evening outfits. Retain the detailed unlock key for existing owners.
(() => {
  const costumes={
  "lily": {
    "detailed": {
      "atlases": {
        "standing": {
          "url": "assets/evening-v1/lily-evening-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/evening-v1/lily-evening-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            185,
            64,
            190,
            439
          ],
          "ground": [
            286,
            499
          ],
          "eyesCenter": [
            274,
            121
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            516,
            64,
            186,
            439
          ],
          "ground": [
            617,
            499
          ],
          "eyesCenter": [
            606,
            120
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            838,
            64,
            186,
            440
          ],
          "ground": [
            938,
            499
          ],
          "eyesCenter": [
            929,
            121
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1171,
            64,
            186,
            440
          ],
          "ground": [
            1272,
            499
          ],
          "eyesCenter": [
            1264,
            121
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            181,
            551,
            192,
            425
          ],
          "ground": [
            305,
            971
          ],
          "eyesCenter": [
            269,
            607
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            516,
            552,
            189,
            419
          ],
          "ground": [
            616,
            966
          ],
          "eyesCenter": [
            604,
            606
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            847,
            545,
            180,
            425
          ],
          "ground": [
            943,
            965
          ],
          "eyesCenter": [
            933,
            619
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1164,
            544,
            221,
            430
          ],
          "ground": [
            1261,
            969
          ],
          "eyesCenter": [
            1260,
            621
          ],
          "faceWidth": 44,
          "scale": 0.8045977011494253
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            129,
            13,
            275,
            408
          ],
          "ground": [
            270,
            417
          ],
          "eyesCenter": [
            255,
            93
          ],
          "faceWidth": 65,
          "scale": 0.6435643564356436
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            457,
            13,
            272,
            406
          ],
          "ground": [
            594,
            415
          ],
          "eyesCenter": [
            587,
            93
          ],
          "faceWidth": 65,
          "scale": 0.6467661691542289
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            815,
            13,
            273,
            406
          ],
          "ground": [
            951,
            415
          ],
          "eyesCenter": [
            945,
            93
          ],
          "faceWidth": 65,
          "scale": 0.6467661691542289
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1158,
            12,
            274,
            407
          ],
          "ground": [
            1298,
            415
          ],
          "eyesCenter": [
            1284,
            93
          ],
          "faceWidth": 65,
          "scale": 0.6451612903225806
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            101,
            423,
            293,
            580
          ],
          "ground": [
            261,
            998
          ],
          "eyesCenter": [
            239,
            495
          ],
          "faceWidth": 59,
          "scale": 0.6076388888888888
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            471,
            421,
            235,
            577
          ],
          "ground": [
            616,
            993
          ],
          "eyesCenter": [
            562,
            495
          ],
          "faceWidth": 59,
          "scale": 0.6076388888888888,
          "contact": [
            653,
            676
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            813,
            421,
            252,
            580
          ],
          "ground": [
            942,
            997
          ],
          "eyesCenter": [
            930,
            495
          ],
          "faceWidth": 59,
          "scale": 0.6076388888888888,
          "contact": [
            862,
            549
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1163,
            421,
            337,
            578
          ],
          "ground": [
            1289,
            995
          ],
          "eyesCenter": [
            1284,
            495
          ],
          "faceWidth": 59,
          "scale": 0.6076388888888888,
          "contact": [
            1458,
            659
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
    "detailed": {
      "atlases": {
        "standing": {
          "url": "assets/evening-v1/mia-evening-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/evening-v1/mia-evening-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            177,
            8,
            174,
            503
          ],
          "ground": [
            264,
            507
          ],
          "eyesCenter": [
            262,
            67
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            499,
            8,
            174,
            503
          ],
          "ground": [
            587,
            507
          ],
          "eyesCenter": [
            585,
            67
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            859,
            8,
            175,
            503
          ],
          "ground": [
            947,
            507
          ],
          "eyesCenter": [
            943,
            67
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1191,
            7,
            175,
            504
          ],
          "ground": [
            1278,
            507
          ],
          "eyesCenter": [
            1275,
            67
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            153,
            522,
            173,
            489
          ],
          "ground": [
            291,
            1006
          ],
          "eyesCenter": [
            251,
            579
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            501,
            521,
            183,
            483
          ],
          "ground": [
            584,
            1000
          ],
          "eyesCenter": [
            588,
            579
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            852,
            511,
            190,
            492
          ],
          "ground": [
            946,
            998
          ],
          "eyesCenter": [
            948,
            602
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1205,
            511,
            208,
            495
          ],
          "ground": [
            1280,
            1001
          ],
          "eyesCenter": [
            1278,
            601
          ],
          "faceWidth": 48,
          "scale": 0.7014028056112225
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            100,
            8,
            286,
            436
          ],
          "ground": [
            243,
            440
          ],
          "eyesCenter": [
            234,
            89
          ],
          "faceWidth": 66,
          "scale": 0.6018518518518519
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            452,
            9,
            284,
            435
          ],
          "ground": [
            593,
            440
          ],
          "eyesCenter": [
            585,
            89
          ],
          "faceWidth": 66,
          "scale": 0.6032482598607889
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            825,
            9,
            286,
            435
          ],
          "ground": [
            967,
            439
          ],
          "eyesCenter": [
            959,
            95
          ],
          "faceWidth": 66,
          "scale": 0.6046511627906976
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1191,
            8,
            283,
            436
          ],
          "ground": [
            1330,
            439
          ],
          "eyesCenter": [
            1323,
            89
          ],
          "faceWidth": 66,
          "scale": 0.6032482598607889
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            85,
            444,
            281,
            565
          ],
          "ground": [
            230,
            1005
          ],
          "eyesCenter": [
            217,
            511
          ],
          "faceWidth": 58,
          "scale": 0.6238859180035651
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            493,
            447,
            217,
            557
          ],
          "ground": [
            596,
            999
          ],
          "eyesCenter": [
            579,
            518
          ],
          "faceWidth": 58,
          "scale": 0.6238859180035651,
          "contact": [
            663,
            747
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            850,
            444,
            221,
            566
          ],
          "ground": [
            959,
            1005
          ],
          "eyesCenter": [
            958,
            510
          ],
          "faceWidth": 58,
          "scale": 0.6238859180035651,
          "contact": [
            880,
            549
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1204,
            444,
            325,
            566
          ],
          "ground": [
            1302,
            1006
          ],
          "eyesCenter": [
            1320,
            511
          ],
          "faceWidth": 58,
          "scale": 0.6238859180035651,
          "contact": [
            1495,
            609
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
  for(const [id,data] of Object.entries(costumes)){window.outfitSpriteData[id] ||= {};Object.assign(window.outfitSpriteData[id],data);}
})();
