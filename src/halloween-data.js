'use strict';
// Complete painted Halloween costumes, including whole-figure expressions.
(() => {
  const costumes={
  "lily": {
    "halloween": {
      "atlases": {
        "standing": {
          "url": "assets/halloween-v1/lily-halloween-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/halloween-v1/lily-halloween-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            98,
            28,
            212,
            473
          ],
          "ground": [
            202,
            496
          ],
          "eyesCenter": [
            202,
            111
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            473,
            30,
            214,
            471
          ],
          "ground": [
            579,
            496
          ],
          "eyesCenter": [
            578,
            112
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            857,
            29,
            212,
            473
          ],
          "ground": [
            961,
            497
          ],
          "eyesCenter": [
            962,
            112
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1230,
            29,
            214,
            472
          ],
          "ground": [
            1337,
            496
          ],
          "eyesCenter": [
            1337,
            111
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            81,
            528,
            244,
            457
          ],
          "ground": [
            200,
            980
          ],
          "eyesCenter": [
            199,
            607
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            470,
            527,
            220,
            458
          ],
          "ground": [
            579,
            981
          ],
          "eyesCenter": [
            578,
            607
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            853,
            528,
            219,
            457
          ],
          "ground": [
            961,
            980
          ],
          "eyesCenter": [
            962,
            615
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1190,
            530,
            296,
            460
          ],
          "ground": [
            1332,
            985
          ],
          "eyesCenter": [
            1334,
            616
          ],
          "faceWidth": 61,
          "scale": 0.7478632478632479
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            82,
            0,
            270,
            440
          ],
          "ground": [
            216,
            435
          ],
          "eyesCenter": [
            214,
            107
          ],
          "faceWidth": 77,
          "scale": 0.5977011494252874
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            459,
            0,
            270,
            439
          ],
          "ground": [
            590,
            435
          ],
          "eyesCenter": [
            591,
            109
          ],
          "faceWidth": 77,
          "scale": 0.5977011494252874
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            838,
            0,
            269,
            439
          ],
          "ground": [
            972,
            435
          ],
          "eyesCenter": [
            972,
            108
          ],
          "faceWidth": 77,
          "scale": 0.5977011494252874
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1213,
            0,
            270,
            439
          ],
          "ground": [
            1346,
            435
          ],
          "eyesCenter": [
            1346,
            107
          ],
          "faceWidth": 77,
          "scale": 0.5977011494252874
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            71,
            441,
            316,
            568
          ],
          "ground": [
            218,
            1005
          ],
          "eyesCenter": [
            204,
            540
          ],
          "faceWidth": 73,
          "scale": 0.6183745583038869
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            465,
            438,
            278,
            570
          ],
          "ground": [
            620,
            1003
          ],
          "eyesCenter": [
            555,
            543
          ],
          "faceWidth": 73,
          "scale": 0.6183745583038869,
          "contact": [
            714,
            728
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            830,
            437,
            251,
            571
          ],
          "ground": [
            958,
            1003
          ],
          "eyesCenter": [
            954,
            534
          ],
          "faceWidth": 73,
          "scale": 0.6183745583038869,
          "contact": [
            882,
            598
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1199,
            440,
            332,
            568
          ],
          "ground": [
            1331,
            1003
          ],
          "eyesCenter": [
            1330,
            534
          ],
          "faceWidth": 73,
          "scale": 0.6183745583038869,
          "contact": [
            1485,
            680
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
    "halloween": {
      "atlases": {
        "standing": {
          "url": "assets/halloween-v1/mia-halloween-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/halloween-v1/mia-halloween-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            113,
            29,
            234,
            486
          ],
          "ground": [
            229,
            510
          ],
          "eyesCenter": [
            226,
            91
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            476,
            28,
            234,
            487
          ],
          "ground": [
            593,
            510
          ],
          "eyesCenter": [
            591,
            92
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            834,
            29,
            234,
            486
          ],
          "ground": [
            951,
            510
          ],
          "eyesCenter": [
            949,
            93
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1199,
            29,
            234,
            486
          ],
          "ground": [
            1316,
            510
          ],
          "eyesCenter": [
            1315,
            93
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            113,
            529,
            226,
            469
          ],
          "ground": [
            228,
            994
          ],
          "eyesCenter": [
            224,
            596
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            480,
            530,
            231,
            468
          ],
          "ground": [
            595,
            994
          ],
          "eyesCenter": [
            593,
            597
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            838,
            522,
            230,
            476
          ],
          "ground": [
            952,
            994
          ],
          "eyesCenter": [
            951,
            606
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1232,
            524,
            228,
            474
          ],
          "ground": [
            1316,
            994
          ],
          "eyesCenter": [
            1314,
            592
          ],
          "faceWidth": 64,
          "scale": 0.7276507276507277
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            86,
            27,
            303,
            399
          ],
          "ground": [
            237,
            422
          ],
          "eyesCenter": [
            231,
            102
          ],
          "faceWidth": 77,
          "scale": 0.6582278481012658
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            447,
            27,
            300,
            399
          ],
          "ground": [
            597,
            422
          ],
          "eyesCenter": [
            591,
            103
          ],
          "faceWidth": 77,
          "scale": 0.6582278481012658
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            809,
            27,
            301,
            399
          ],
          "ground": [
            958,
            422
          ],
          "eyesCenter": [
            955,
            106
          ],
          "faceWidth": 77,
          "scale": 0.6582278481012658
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1177,
            27,
            299,
            399
          ],
          "ground": [
            1326,
            422
          ],
          "eyesCenter": [
            1321,
            104
          ],
          "faceWidth": 77,
          "scale": 0.6582278481012658
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            98,
            439,
            272,
            562
          ],
          "ground": [
            226,
            996
          ],
          "eyesCenter": [
            228,
            511
          ],
          "faceWidth": 73,
          "scale": 0.6283662477558348
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            488,
            439,
            240,
            556
          ],
          "ground": [
            608,
            991
          ],
          "eyesCenter": [
            589,
            514
          ],
          "faceWidth": 73,
          "scale": 0.6283662477558348,
          "contact": [
            711,
            712
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            842,
            439,
            247,
            561
          ],
          "ground": [
            963,
            996
          ],
          "eyesCenter": [
            955,
            513
          ],
          "faceWidth": 73,
          "scale": 0.6283662477558348,
          "contact": [
            880,
            561
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1211,
            439,
            321,
            561
          ],
          "ground": [
            1336,
            995
          ],
          "eyesCenter": [
            1323,
            512
          ],
          "faceWidth": 73,
          "scale": 0.6283662477558348,
          "contact": [
            1496,
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
    }
  }
};
  window.outfitSpriteData ||= {};
  for(const [id,data] of Object.entries(costumes)){window.outfitSpriteData[id] ||= {};Object.assign(window.outfitSpriteData[id],data);}
})();
