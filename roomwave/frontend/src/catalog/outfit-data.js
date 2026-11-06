'use strict';
// Complete painted outfit poses. Native image bytes and alpha are preserved.
window.outfitSpriteData = {
  "mia": {
    "cat-hoodie": {
      "atlases": {
        "standing": {
          "url": "/assets/wardrobe-v1/mia-hoodie-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/wardrobe-v1/mia-hoodie-seated-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            164,
            3,
            140,
            516
          ],
          "ground": [
            236,
            515
          ],
          "eyesCenter": [
            236,
            86
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            525,
            4,
            140,
            516
          ],
          "ground": [
            597,
            516
          ],
          "eyesCenter": [
            597,
            86
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            879,
            4,
            140,
            516
          ],
          "ground": [
            951,
            516
          ],
          "eyesCenter": [
            951,
            86
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1234,
            4,
            140,
            516
          ],
          "ground": [
            1305,
            516
          ],
          "eyesCenter": [
            1305,
            86
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            131,
            522,
            201,
            495
          ],
          "ground": [
            234,
            1013
          ],
          "eyesCenter": [
            235,
            603
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            510,
            522,
            177,
            495
          ],
          "ground": [
            597,
            1013
          ],
          "eyesCenter": [
            599,
            603
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            847,
            522,
            204,
            495
          ],
          "ground": [
            958,
            1013
          ],
          "eyesCenter": [
            950,
            614
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1221,
            523,
            215,
            494
          ],
          "ground": [
            1310,
            1013
          ],
          "eyesCenter": [
            1298,
            610
          ],
          "faceWidth": 58,
          "scale": 0.6862745098039216
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            83,
            7,
            284,
            415
          ],
          "ground": [
            225,
            418
          ],
          "eyesCenter": [
            225,
            116
          ],
          "faceWidth": 76,
          "scale": 0.6356968215158925
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            435,
            7,
            286,
            415
          ],
          "ground": [
            580,
            418
          ],
          "eyesCenter": [
            580,
            116
          ],
          "faceWidth": 76,
          "scale": 0.6356968215158925
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            821,
            7,
            285,
            415
          ],
          "ground": [
            966,
            418
          ],
          "eyesCenter": [
            966,
            116
          ],
          "faceWidth": 76,
          "scale": 0.6356968215158925
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1205,
            7,
            283,
            415
          ],
          "ground": [
            1349,
            418
          ],
          "eyesCenter": [
            1349,
            116
          ],
          "faceWidth": 76,
          "scale": 0.6356968215158925
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            94,
            427,
            257,
            577
          ],
          "ground": [
            203,
            1000
          ],
          "eyesCenter": [
            209,
            518
          ],
          "faceWidth": 65,
          "scale": 0.6118881118881119
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            473,
            427,
            208,
            576
          ],
          "ground": [
            592,
            999
          ],
          "eyesCenter": [
            540,
            535
          ],
          "faceWidth": 65,
          "scale": 0.6118881118881119,
          "contact": [
            659,
            682
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            872,
            425,
            183,
            578
          ],
          "ground": [
            970,
            999
          ],
          "eyesCenter": [
            961,
            515
          ],
          "faceWidth": 65,
          "scale": 0.6118881118881119,
          "contact": [
            891,
            573
          ]
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1242,
            424,
            267,
            578
          ],
          "ground": [
            1363,
            998
          ],
          "eyesCenter": [
            1334,
            517
          ],
          "faceWidth": 65,
          "scale": 0.6118881118881119,
          "contact": [
            1480,
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
  },
  "lily": {
    "bunny-hoodie": {
      "atlases": {
        "standing": {
          "url": "/assets/wardrobe-v1/lily-hoodie-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/wardrobe-v1/lily-hoodie-seated-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            129,
            65,
            175,
            369
          ],
          "ground": [
            214,
            430
          ],
          "eyesCenter": [
            215.5,
            120.5
          ],
          "faceWidth": 55,
          "scale": 0.9641873278236914
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            503,
            65,
            174,
            369
          ],
          "ground": [
            590,
            430
          ],
          "eyesCenter": [
            590.5,
            119
          ],
          "faceWidth": 55,
          "scale": 0.9641873278236914
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            863,
            65,
            176,
            369
          ],
          "ground": [
            951,
            430
          ],
          "eyesCenter": [
            952,
            120.5
          ],
          "faceWidth": 55,
          "scale": 0.9641873278236914
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1242,
            65,
            176,
            369
          ],
          "ground": [
            1329,
            430
          ],
          "eyesCenter": [
            1328.5,
            120.5
          ],
          "faceWidth": 55,
          "scale": 0.9641873278236914
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            125,
            621,
            184,
            352
          ],
          "ground": [
            215,
            969
          ],
          "eyesCenter": [
            216,
            677
          ],
          "faceWidth": 57,
          "scale": 0.9641873278236914
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            504,
            620,
            178,
            353
          ],
          "ground": [
            591,
            969
          ],
          "eyesCenter": [
            592,
            676.5
          ],
          "faceWidth": 57,
          "scale": 0.9641873278236914
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            861,
            616,
            183,
            357
          ],
          "ground": [
            951,
            969
          ],
          "eyesCenter": [
            952,
            677.5
          ],
          "faceWidth": 57,
          "scale": 0.9641873278236914
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1212,
            598,
            251,
            375
          ],
          "ground": [
            1338,
            969
          ],
          "eyesCenter": [
            1338,
            671.5
          ],
          "faceWidth": 57,
          "scale": 0.9641873278236914
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            110,
            17,
            235,
            391
          ],
          "ground": [
            227,
            404
          ],
          "eyesCenter": [
            225.5,
            101.5
          ],
          "faceWidth": 79,
          "scale": 0.6753246753246753
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            452,
            16,
            237,
            391
          ],
          "ground": [
            570,
            403
          ],
          "eyesCenter": [
            569,
            101.5
          ],
          "faceWidth": 79,
          "scale": 0.6753246753246753
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            838,
            16,
            236,
            390
          ],
          "ground": [
            956,
            402
          ],
          "eyesCenter": [
            956,
            102.5
          ],
          "faceWidth": 79,
          "scale": 0.6770833333333334
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1204,
            16,
            238,
            390
          ],
          "ground": [
            1327,
            402
          ],
          "eyesCenter": [
            1326,
            103
          ],
          "faceWidth": 79,
          "scale": 0.6770833333333334
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            94,
            438,
            304,
            545
          ],
          "ground": [
            242,
            979
          ],
          "eyesCenter": [
            236.5,
            514.5
          ],
          "faceWidth": 80,
          "scale": 0.6238859180035651
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            446,
            430,
            265,
            547
          ],
          "ground": [
            614,
            973
          ],
          "eyesCenter": [
            513.5,
            512.5
          ],
          "faceWidth": 74,
          "scale": 0.6238859180035651,
          "contact": [
            686,
            650
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            843,
            413,
            233,
            567
          ],
          "ground": [
            959,
            976
          ],
          "eyesCenter": [
            957,
            491
          ],
          "faceWidth": 80,
          "scale": 0.6238859180035651,
          "contact": [
            879,
            553
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1151,
            421,
            299,
            559
          ],
          "ground": [
            1335,
            976
          ],
          "eyesCenter": [
            1335,
            497.5
          ],
          "faceWidth": 80,
          "scale": 0.6238859180035651,
          "contact": [
            1180,
            637
          ],
          "mirror": true
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
