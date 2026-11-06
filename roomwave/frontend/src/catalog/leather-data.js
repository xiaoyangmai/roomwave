'use strict';
// Native full-figure leather costume sprites and clothes-only dressing-room hangers.
(() => {
  const costumes={
  "lily": {
    "leather": {
      "atlases": {
        "standing": {
          "url": "/assets/leather-v1/lily-leather-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/leather-v1/lily-leather-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            91,
            3,
            219,
            506
          ],
          "ground": [
            194,
            505
          ],
          "eyesCenter": [
            203,
            84
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            462,
            3,
            223,
            506
          ],
          "ground": [
            570,
            505
          ],
          "eyesCenter": [
            578,
            84
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            846,
            3,
            223,
            506
          ],
          "ground": [
            954,
            505
          ],
          "eyesCenter": [
            960,
            84
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1228,
            3,
            223,
            506
          ],
          "ground": [
            1338,
            505
          ],
          "eyesCenter": [
            1346,
            84
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            77,
            510,
            235,
            506
          ],
          "ground": [
            206,
            1010
          ],
          "eyesCenter": [
            187,
            592
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            461,
            510,
            228,
            504
          ],
          "ground": [
            570,
            1008
          ],
          "eyesCenter": [
            578,
            592
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            839,
            509,
            233,
            507
          ],
          "ground": [
            963,
            1010
          ],
          "eyesCenter": [
            955,
            603
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1200,
            512,
            289,
            504
          ],
          "ground": [
            1348,
            1010
          ],
          "eyesCenter": [
            1328,
            598
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            69,
            7,
            289,
            458
          ],
          "ground": [
            225,
            459
          ],
          "eyesCenter": [
            215,
            119
          ],
          "faceWidth": 101,
          "scale": 0.5752212389380531
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            434,
            6,
            290,
            460
          ],
          "ground": [
            591,
            460
          ],
          "eyesCenter": [
            580,
            119
          ],
          "faceWidth": 101,
          "scale": 0.5726872246696035
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            819,
            6,
            289,
            460
          ],
          "ground": [
            974,
            460
          ],
          "eyesCenter": [
            964,
            119
          ],
          "faceWidth": 101,
          "scale": 0.5726872246696035
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1202,
            6,
            290,
            460
          ],
          "ground": [
            1358,
            460
          ],
          "eyesCenter": [
            1348,
            119
          ],
          "faceWidth": 101,
          "scale": 0.5726872246696035
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            96,
            492,
            257,
            520
          ],
          "ground": [
            228,
            1006
          ],
          "eyesCenter": [
            228,
            600
          ],
          "faceWidth": 73,
          "scale": 0.7028112449799196
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            462,
            507,
            246,
            504
          ],
          "ground": [
            589,
            1005
          ],
          "eyesCenter": [
            583,
            593
          ],
          "faceWidth": 71,
          "scale": 0.7028112449799196,
          "contact": [
            501,
            627
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            819,
            513,
            337,
            500
          ],
          "ground": [
            940,
            1007
          ],
          "eyesCenter": [
            939,
            596
          ],
          "faceWidth": 71,
          "scale": 0.7028112449799196,
          "contact": [
            1114,
            718
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1235,
            534,
            239,
            475
          ],
          "ground": [
            1382,
            1003
          ],
          "eyesCenter": [
            1332,
            624
          ],
          "faceWidth": 76,
          "scale": 0.7028112449799196,
          "contact": [
            1450,
            733
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
    "leather": {
      "atlases": {
        "standing": {
          "url": "/assets/leather-v1/mia-leather-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/leather-v1/mia-leather-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            126,
            7,
            168,
            507
          ],
          "ground": [
            200,
            511
          ],
          "eyesCenter": [
            207,
            80
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            505,
            6,
            168,
            508
          ],
          "ground": [
            579,
            511
          ],
          "eyesCenter": [
            588,
            80
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            878,
            5,
            168,
            509
          ],
          "ground": [
            950,
            511
          ],
          "eyesCenter": [
            960,
            80
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1257,
            6,
            169,
            508
          ],
          "ground": [
            1329,
            511
          ],
          "eyesCenter": [
            1341,
            82
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            109,
            518,
            208,
            497
          ],
          "ground": [
            195,
            1010
          ],
          "eyesCenter": [
            207,
            591
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            493,
            517,
            196,
            498
          ],
          "ground": [
            582,
            1010
          ],
          "eyesCenter": [
            587,
            591
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            871,
            514,
            184,
            501
          ],
          "ground": [
            960,
            1010
          ],
          "eyesCenter": [
            963,
            611
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1258,
            514,
            203,
            502
          ],
          "ground": [
            1354,
            1011
          ],
          "eyesCenter": [
            1345,
            611
          ],
          "faceWidth": 64,
          "scale": 0.6944444444444444
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            103,
            8,
            272,
            423
          ],
          "ground": [
            239,
            429
          ],
          "eyesCenter": [
            230,
            100
          ],
          "faceWidth": 80,
          "scale": 0.6175771971496437
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            460,
            8,
            273,
            423
          ],
          "ground": [
            596,
            429
          ],
          "eyesCenter": [
            592,
            99
          ],
          "faceWidth": 80,
          "scale": 0.6175771971496437
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            826,
            8,
            274,
            423
          ],
          "ground": [
            963,
            429
          ],
          "eyesCenter": [
            958,
            100
          ],
          "faceWidth": 80,
          "scale": 0.6175771971496437
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1194,
            8,
            270,
            423
          ],
          "ground": [
            1329,
            429
          ],
          "eyesCenter": [
            1328,
            101
          ],
          "faceWidth": 80,
          "scale": 0.6175771971496437
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            68,
            431,
            264,
            577
          ],
          "ground": [
            221,
            1003
          ],
          "eyesCenter": [
            232,
            530
          ],
          "faceWidth": 72,
          "scale": 0.6183745583038869
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            497,
            438,
            228,
            571
          ],
          "ground": [
            588,
            1004
          ],
          "eyesCenter": [
            607,
            516
          ],
          "faceWidth": 72,
          "scale": 0.6183745583038869,
          "contact": [
            531,
            558
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            851,
            436,
            339,
            573
          ],
          "ground": [
            947,
            1004
          ],
          "eyesCenter": [
            939,
            515
          ],
          "faceWidth": 72,
          "scale": 0.6183745583038869,
          "contact": [
            1149,
            576
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1233,
            457,
            229,
            545
          ],
          "ground": [
            1373,
            997
          ],
          "eyesCenter": [
            1290,
            538
          ],
          "faceWidth": 66,
          "scale": 0.6183745583038869,
          "contact": [
            1433,
            692
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
    "crop": [
      138,
      14,
      986,
      1133
    ],
    "atlas": {
      "url": "/assets/leather-v1/lily-leather-hanger.lossless.webp",
      "width": 1254,
      "height": 1254
    }
  },
  "mia": {
    "crop": [
      339,
      6,
      579,
      1220
    ],
    "atlas": {
      "url": "/assets/leather-v1/mia-leather-hanger.lossless.webp",
      "width": 1254,
      "height": 1254
    }
  }
};
  for(const id of ['lily','mia']){Object.assign(window.outfitSpriteData[id],costumes[id]);window.wardrobeHangers[id].frames.leather=hangers[id];}
})();
