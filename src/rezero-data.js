'use strict';
// Complete painted Re:Zero cosplay outfits. Existing costume sets remain available.
(() => {
  const costumes={
  "mia": {
    "rezero": {
      "atlases": {
        "standing": {
          "url": "assets/rezero-v1/mia-rezero-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/rezero-v1/mia-rezero-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            114,
            15,
            218,
            493
          ],
          "ground": [
            222,
            503
          ],
          "eyesCenter": [
            221,
            94
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            481,
            16,
            220,
            492
          ],
          "ground": [
            588,
            503
          ],
          "eyesCenter": [
            588,
            93
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            843,
            16,
            223,
            491
          ],
          "ground": [
            950,
            502
          ],
          "eyesCenter": [
            951,
            94
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1212,
            16,
            221,
            491
          ],
          "ground": [
            1319,
            503
          ],
          "eyesCenter": [
            1320,
            94
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            94,
            511,
            237,
            483
          ],
          "ground": [
            220,
            989
          ],
          "eyesCenter": [
            220,
            591
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            486,
            513,
            216,
            481
          ],
          "ground": [
            588,
            989
          ],
          "eyesCenter": [
            589,
            591
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            848,
            511,
            218,
            483
          ],
          "ground": [
            952,
            989
          ],
          "eyesCenter": [
            953,
            608
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1235,
            515,
            234,
            479
          ],
          "ground": [
            1324,
            990
          ],
          "eyesCenter": [
            1322,
            596
          ],
          "faceWidth": 65,
          "scale": 0.7172131147540983
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            86,
            11,
            302,
            417
          ],
          "ground": [
            237,
            423
          ],
          "eyesCenter": [
            233,
            99
          ],
          "faceWidth": 78,
          "scale": 0.6310679611650486
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            445,
            10,
            303,
            418
          ],
          "ground": [
            594,
            423
          ],
          "eyesCenter": [
            592,
            99
          ],
          "faceWidth": 78,
          "scale": 0.6295399515738499
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            811,
            9,
            304,
            419
          ],
          "ground": [
            961,
            423
          ],
          "eyesCenter": [
            961,
            101
          ],
          "faceWidth": 78,
          "scale": 0.6280193236714976
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1174,
            7,
            301,
            421
          ],
          "ground": [
            1321,
            424
          ],
          "eyesCenter": [
            1320,
            98
          ],
          "faceWidth": 78,
          "scale": 0.6235011990407674
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            101,
            431,
            269,
            578
          ],
          "ground": [
            228,
            1004
          ],
          "eyesCenter": [
            230,
            514
          ],
          "faceWidth": 73,
          "scale": 0.6194690265486725
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            493,
            431,
            246,
            566
          ],
          "ground": [
            616,
            993
          ],
          "eyesCenter": [
            587,
            521
          ],
          "faceWidth": 73,
          "scale": 0.6194690265486725,
          "contact": [
            716,
            710
          ],
          "eyeAngle": -13
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            842,
            431,
            251,
            569
          ],
          "ground": [
            968,
            996
          ],
          "eyesCenter": [
            964,
            516
          ],
          "faceWidth": 73,
          "scale": 0.6194690265486725,
          "contact": [
            884,
            565
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1213,
            433,
            318,
            570
          ],
          "ground": [
            1331,
            999
          ],
          "eyesCenter": [
            1327,
            518
          ],
          "faceWidth": 73,
          "scale": 0.6194690265486725,
          "contact": [
            1496,
            625
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
    "rezero": {
      "atlases": {
        "standing": {
          "url": "assets/rezero-v1/lily-rezero-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/rezero-v1/lily-rezero-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            101,
            39,
            207,
            434
          ],
          "ground": [
            205,
            469
          ],
          "eyesCenter": [
            204,
            105
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            482,
            38,
            207,
            435
          ],
          "ground": [
            585,
            469
          ],
          "eyesCenter": [
            584,
            105
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            860,
            39,
            207,
            434
          ],
          "ground": [
            963,
            469
          ],
          "eyesCenter": [
            961,
            105
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1240,
            39,
            208,
            434
          ],
          "ground": [
            1343,
            469
          ],
          "eyesCenter": [
            1343,
            105
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            90,
            535,
            241,
            445
          ],
          "ground": [
            202,
            975
          ],
          "eyesCenter": [
            201,
            600
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            472,
            536,
            220,
            444
          ],
          "ground": [
            583,
            975
          ],
          "eyesCenter": [
            582,
            600
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            846,
            537,
            226,
            443
          ],
          "ground": [
            960,
            975
          ],
          "eyesCenter": [
            960,
            619
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1193,
            545,
            306,
            443
          ],
          "ground": [
            1343,
            984
          ],
          "eyesCenter": [
            1351,
            625
          ],
          "faceWidth": 65,
          "scale": 0.813953488372093
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            77,
            6,
            282,
            419
          ],
          "ground": [
            220,
            420
          ],
          "eyesCenter": [
            217,
            91
          ],
          "faceWidth": 78,
          "scale": 0.6280193236714976
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            448,
            6,
            284,
            419
          ],
          "ground": [
            590,
            420
          ],
          "eyesCenter": [
            590,
            91
          ],
          "faceWidth": 78,
          "scale": 0.6280193236714976
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            821,
            6,
            283,
            419
          ],
          "ground": [
            962,
            420
          ],
          "eyesCenter": [
            963,
            91
          ],
          "faceWidth": 78,
          "scale": 0.6280193236714976
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1197,
            6,
            282,
            419
          ],
          "ground": [
            1337,
            420
          ],
          "eyesCenter": [
            1338,
            91
          ],
          "faceWidth": 78,
          "scale": 0.6280193236714976
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            75,
            425,
            322,
            575
          ],
          "ground": [
            225,
            996
          ],
          "eyesCenter": [
            224,
            500
          ],
          "faceWidth": 73,
          "scale": 0.6161971830985915
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            474,
            425,
            280,
            571
          ],
          "ground": [
            633,
            991
          ],
          "eyesCenter": [
            559,
            505
          ],
          "faceWidth": 73,
          "scale": 0.6161971830985915,
          "contact": [
            725,
            681
          ],
          "eyeAngle": -14
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            843,
            424,
            262,
            572
          ],
          "ground": [
            967,
            992
          ],
          "eyesCenter": [
            970,
            500
          ],
          "faceWidth": 73,
          "scale": 0.6161971830985915,
          "contact": [
            890,
            560
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1191,
            423,
            335,
            573
          ],
          "ground": [
            1327,
            992
          ],
          "eyesCenter": [
            1328,
            500
          ],
          "faceWidth": 73,
          "scale": 0.6161971830985915,
          "contact": [
            1492,
            648
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
