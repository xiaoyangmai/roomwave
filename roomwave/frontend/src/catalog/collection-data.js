'use strict';
// Native stage, weekend and clown costumes; full painted expressions and clothes-only hangers.
(() => {
  const costumes={
  "lily": {
    "stage": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/lily-stage-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/lily-stage-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            113,
            35,
            223,
            442
          ],
          "ground": [
            222,
            472
          ],
          "eyesCenter": [
            228,
            108
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            468,
            35,
            223,
            443
          ],
          "ground": [
            578,
            473
          ],
          "eyesCenter": [
            584,
            108
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            849,
            35,
            222,
            443
          ],
          "ground": [
            958,
            473
          ],
          "eyesCenter": [
            964,
            108
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1220,
            35,
            221,
            444
          ],
          "ground": [
            1334,
            474
          ],
          "eyesCenter": [
            1338,
            109
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            101,
            552,
            238,
            433
          ],
          "ground": [
            212,
            980
          ],
          "eyesCenter": [
            219,
            624
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            469,
            551,
            223,
            434
          ],
          "ground": [
            576,
            980
          ],
          "eyesCenter": [
            583,
            626
          ],
          "faceWidth": 58,
          "scale": 0.8009153318077803
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            849,
            553,
            216,
            431
          ],
          "ground": [
            943,
            979
          ],
          "eyesCenter": [
            960,
            638
          ],
          "faceWidth": 57,
          "scale": 0.8009153318077803
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1211,
            555,
            260,
            430
          ],
          "ground": [
            1338,
            980
          ],
          "eyesCenter": [
            1331,
            632
          ],
          "faceWidth": 59,
          "scale": 0.8009153318077803
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            93,
            50,
            250,
            361
          ],
          "ground": [
            216,
            406
          ],
          "eyesCenter": [
            220,
            138
          ],
          "faceWidth": 73,
          "scale": 0.7303370786516854
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            448,
            50,
            250,
            362
          ],
          "ground": [
            572,
            407
          ],
          "eyesCenter": [
            575,
            138
          ],
          "faceWidth": 73,
          "scale": 0.7282913165266106
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            832,
            50,
            248,
            362
          ],
          "ground": [
            956,
            407
          ],
          "eyesCenter": [
            959,
            138
          ],
          "faceWidth": 73,
          "scale": 0.7282913165266106
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1195,
            50,
            249,
            362
          ],
          "ground": [
            1320,
            407
          ],
          "eyesCenter": [
            1322,
            139
          ],
          "faceWidth": 73,
          "scale": 0.7282913165266106
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            77,
            541,
            266,
            449
          ],
          "ground": [
            241,
            985
          ],
          "eyesCenter": [
            227,
            642
          ],
          "faceWidth": 57,
          "scale": 0.7936507936507936
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            468,
            547,
            238,
            446
          ],
          "ground": [
            571,
            988
          ],
          "eyesCenter": [
            586,
            615
          ],
          "faceWidth": 57,
          "scale": 0.7936507936507936,
          "contact": [
            506,
            646
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            823,
            546,
            303,
            447
          ],
          "ground": [
            924,
            988
          ],
          "eyesCenter": [
            940,
            615
          ],
          "faceWidth": 57,
          "scale": 0.7936507936507936,
          "contact": [
            1092,
            731
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1195,
            614,
            271,
            367
          ],
          "ground": [
            1370,
            976
          ],
          "eyesCenter": [
            1262,
            692
          ],
          "faceWidth": 58,
          "scale": 0.7936507936507936,
          "contact": [
            1452,
            726
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
    "weekend": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/lily-weekend-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/lily-weekend-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            97,
            18,
            239,
            487
          ],
          "ground": [
            203,
            500
          ],
          "eyesCenter": [
            218,
            96
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            464,
            19,
            241,
            486
          ],
          "ground": [
            576,
            500
          ],
          "eyesCenter": [
            586,
            97
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            840,
            18,
            238,
            487
          ],
          "ground": [
            950,
            500
          ],
          "eyesCenter": [
            962,
            97
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1218,
            19,
            237,
            486
          ],
          "ground": [
            1334,
            500
          ],
          "eyesCenter": [
            1338,
            99
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            84,
            526,
            251,
            483
          ],
          "ground": [
            195,
            1004
          ],
          "eyesCenter": [
            210,
            607
          ],
          "faceWidth": 62,
          "scale": 0.7261410788381742
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            460,
            525,
            238,
            484
          ],
          "ground": [
            579,
            1004
          ],
          "eyesCenter": [
            586,
            606
          ],
          "faceWidth": 62,
          "scale": 0.7261410788381742
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            834,
            524,
            238,
            485
          ],
          "ground": [
            935,
            1004
          ],
          "eyesCenter": [
            960,
            617
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1213,
            518,
            278,
            492
          ],
          "ground": [
            1342,
            1005
          ],
          "eyesCenter": [
            1336,
            612
          ],
          "faceWidth": 61,
          "scale": 0.7261410788381742
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            75,
            48,
            280,
            374
          ],
          "ground": [
            213,
            417
          ],
          "eyesCenter": [
            216,
            140
          ],
          "faceWidth": 76,
          "scale": 0.7046070460704607
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            431,
            48,
            279,
            374
          ],
          "ground": [
            572,
            417
          ],
          "eyesCenter": [
            574,
            140
          ],
          "faceWidth": 76,
          "scale": 0.7046070460704607
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            811,
            48,
            280,
            374
          ],
          "ground": [
            950,
            417
          ],
          "eyesCenter": [
            952,
            140
          ],
          "faceWidth": 76,
          "scale": 0.7046070460704607
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1180,
            49,
            279,
            373
          ],
          "ground": [
            1322,
            417
          ],
          "eyesCenter": [
            1322,
            141
          ],
          "faceWidth": 76,
          "scale": 0.7065217391304348
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            44,
            448,
            323,
            532
          ],
          "ground": [
            243,
            975
          ],
          "eyesCenter": [
            225,
            549
          ],
          "faceWidth": 65,
          "scale": 0.6628787878787878
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            436,
            449,
            287,
            533
          ],
          "ground": [
            557,
            977
          ],
          "eyesCenter": [
            584,
            529
          ],
          "faceWidth": 65,
          "scale": 0.6628787878787878,
          "contact": [
            497,
            557
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            787,
            450,
            369,
            534
          ],
          "ground": [
            910,
            979
          ],
          "eyesCenter": [
            938,
            529
          ],
          "faceWidth": 65,
          "scale": 0.6628787878787878,
          "contact": [
            1120,
            670
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1152,
            524,
            362,
            448
          ],
          "ground": [
            1394,
            967
          ],
          "eyesCenter": [
            1255,
            617
          ],
          "faceWidth": 65,
          "scale": 0.6628787878787878,
          "contact": [
            1492,
            660
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
    "clown": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/lily-clown-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/lily-clown-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            91,
            17,
            243,
            484
          ],
          "ground": [
            206,
            496
          ],
          "eyesCenter": [
            215,
            114
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            462,
            17,
            245,
            484
          ],
          "ground": [
            580,
            496
          ],
          "eyesCenter": [
            589,
            116
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            836,
            17,
            244,
            484
          ],
          "ground": [
            950,
            496
          ],
          "eyesCenter": [
            960,
            116
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1215,
            17,
            246,
            484
          ],
          "ground": [
            1337,
            496
          ],
          "eyesCenter": [
            1340,
            117
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            78,
            523,
            258,
            476
          ],
          "ground": [
            197,
            994
          ],
          "eyesCenter": [
            210,
            619
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            458,
            524,
            249,
            476
          ],
          "ground": [
            572,
            995
          ],
          "eyesCenter": [
            588,
            619
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            835,
            535,
            249,
            464
          ],
          "ground": [
            941,
            994
          ],
          "eyesCenter": [
            962,
            629
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1205,
            531,
            271,
            470
          ],
          "ground": [
            1343,
            996
          ],
          "eyesCenter": [
            1335,
            620
          ],
          "faceWidth": 60,
          "scale": 0.7306889352818372
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            66,
            15,
            286,
            406
          ],
          "ground": [
            213,
            416
          ],
          "eyesCenter": [
            212,
            138
          ],
          "faceWidth": 77,
          "scale": 0.6483790523690773
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            430,
            13,
            287,
            409
          ],
          "ground": [
            577,
            417
          ],
          "eyesCenter": [
            579,
            138
          ],
          "faceWidth": 77,
          "scale": 0.6435643564356436
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            813,
            15,
            287,
            407
          ],
          "ground": [
            958,
            417
          ],
          "eyesCenter": [
            960,
            138
          ],
          "faceWidth": 77,
          "scale": 0.6467661691542289
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1185,
            15,
            286,
            407
          ],
          "ground": [
            1333,
            417
          ],
          "eyesCenter": [
            1333,
            139
          ],
          "faceWidth": 77,
          "scale": 0.6467661691542289
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            51,
            459,
            311,
            539
          ],
          "ground": [
            244,
            993
          ],
          "eyesCenter": [
            229,
            565
          ],
          "faceWidth": 67,
          "scale": 0.6445672191528545
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            447,
            448,
            274,
            548
          ],
          "ground": [
            560,
            991
          ],
          "eyesCenter": [
            590,
            556
          ],
          "faceWidth": 65,
          "scale": 0.6445672191528545,
          "contact": [
            500,
            575
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            809,
            447,
            347,
            549
          ],
          "ground": [
            914,
            991
          ],
          "eyesCenter": [
            945,
            556
          ],
          "faceWidth": 65,
          "scale": 0.6445672191528545,
          "contact": [
            1121,
            668
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1152,
            541,
            344,
            441
          ],
          "ground": [
            1382,
            977
          ],
          "eyesCenter": [
            1267,
            643
          ],
          "faceWidth": 65,
          "scale": 0.6445672191528545,
          "contact": [
            1475,
            696
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
    "stage": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/mia-stage-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/mia-stage-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            170,
            25,
            122,
            464
          ],
          "ground": [
            229,
            485
          ],
          "eyesCenter": [
            230,
            90
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            526,
            25,
            121,
            463
          ],
          "ground": [
            587,
            484
          ],
          "eyesCenter": [
            587,
            90
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            882,
            25,
            120,
            463
          ],
          "ground": [
            942,
            484
          ],
          "eyesCenter": [
            943,
            90
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1252,
            26,
            122,
            463
          ],
          "ground": [
            1314,
            485
          ],
          "eyesCenter": [
            1313,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            132,
            528,
            199,
            454
          ],
          "ground": [
            216,
            978
          ],
          "eyesCenter": [
            222,
            596
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            502,
            528,
            171,
            455
          ],
          "ground": [
            588,
            979
          ],
          "eyesCenter": [
            587,
            595
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            856,
            527,
            170,
            456
          ],
          "ground": [
            939,
            979
          ],
          "eyesCenter": [
            943,
            614
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1229,
            510,
            216,
            475
          ],
          "ground": [
            1334,
            981
          ],
          "eyesCenter": [
            1325,
            611
          ],
          "faceWidth": 56,
          "scale": 0.7608695652173914
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            98,
            11,
            274,
            426
          ],
          "ground": [
            235,
            433
          ],
          "eyesCenter": [
            228,
            102
          ],
          "faceWidth": 80,
          "scale": 0.6161137440758294
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            457,
            10,
            275,
            427
          ],
          "ground": [
            594,
            433
          ],
          "eyesCenter": [
            592,
            102
          ],
          "faceWidth": 80,
          "scale": 0.6146572104018913
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            825,
            10,
            274,
            427
          ],
          "ground": [
            962,
            433
          ],
          "eyesCenter": [
            961,
            102
          ],
          "faceWidth": 80,
          "scale": 0.6146572104018913
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1188,
            10,
            276,
            427
          ],
          "ground": [
            1326,
            433
          ],
          "eyesCenter": [
            1327,
            101
          ],
          "faceWidth": 80,
          "scale": 0.6146572104018913
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            87,
            525,
            225,
            473
          ],
          "ground": [
            211,
            994
          ],
          "eyesCenter": [
            220,
            610
          ],
          "faceWidth": 60,
          "scale": 0.7446808510638298
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            504,
            525,
            185,
            474
          ],
          "ground": [
            589,
            995
          ],
          "eyesCenter": [
            596,
            589
          ],
          "faceWidth": 60,
          "scale": 0.7446808510638298,
          "contact": [
            529,
            628
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            870,
            526,
            276,
            473
          ],
          "ground": [
            948,
            995
          ],
          "eyesCenter": [
            944,
            590
          ],
          "faceWidth": 60,
          "scale": 0.7446808510638298,
          "contact": [
            1111,
            651
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1215,
            630,
            247,
            366
          ],
          "ground": [
            1371,
            992
          ],
          "eyesCenter": [
            1273,
            695
          ],
          "faceWidth": 58,
          "scale": 0.7446808510638298,
          "contact": [
            1457,
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
    },
    "weekend": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/mia-weekend-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/mia-weekend-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            170,
            32,
            120,
            455
          ],
          "ground": [
            227,
            483
          ],
          "eyesCenter": [
            230,
            96
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            524,
            31,
            119,
            457
          ],
          "ground": [
            583,
            484
          ],
          "eyesCenter": [
            584,
            94
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            897,
            31,
            120,
            456
          ],
          "ground": [
            957,
            483
          ],
          "eyesCenter": [
            956,
            96
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1253,
            31,
            121,
            455
          ],
          "ground": [
            1315,
            482
          ],
          "eyesCenter": [
            1314,
            96
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            126,
            548,
            193,
            442
          ],
          "ground": [
            217,
            986
          ],
          "eyesCenter": [
            216,
            613
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            499,
            551,
            185,
            439
          ],
          "ground": [
            584,
            986
          ],
          "eyesCenter": [
            591,
            616
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            872,
            546,
            178,
            445
          ],
          "ground": [
            958,
            987
          ],
          "eyesCenter": [
            962,
            635
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1245,
            540,
            201,
            451
          ],
          "ground": [
            1337,
            987
          ],
          "eyesCenter": [
            1335,
            627
          ],
          "faceWidth": 56,
          "scale": 0.7760532150776053
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            113,
            14,
            244,
            401
          ],
          "ground": [
            235,
            411
          ],
          "eyesCenter": [
            232,
            95
          ],
          "faceWidth": 80,
          "scale": 0.654911838790932
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            462,
            14,
            246,
            401
          ],
          "ground": [
            585,
            411
          ],
          "eyesCenter": [
            587,
            95
          ],
          "faceWidth": 80,
          "scale": 0.654911838790932
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            828,
            13,
            248,
            402
          ],
          "ground": [
            952,
            411
          ],
          "eyesCenter": [
            952,
            94
          ],
          "faceWidth": 80,
          "scale": 0.6532663316582915
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1187,
            13,
            249,
            402
          ],
          "ground": [
            1311,
            411
          ],
          "eyesCenter": [
            1316,
            94
          ],
          "faceWidth": 80,
          "scale": 0.6532663316582915
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            124,
            447,
            257,
            557
          ],
          "ground": [
            226,
            1000
          ],
          "eyesCenter": [
            237,
            536
          ],
          "faceWidth": 74,
          "scale": 0.6457564575645757
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            487,
            458,
            213,
            546
          ],
          "ground": [
            588,
            1000
          ],
          "eyesCenter": [
            598,
            535
          ],
          "faceWidth": 74,
          "scale": 0.6457564575645757,
          "contact": [
            521,
            578
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            819,
            458,
            331,
            546
          ],
          "ground": [
            940,
            1000
          ],
          "eyesCenter": [
            935,
            535
          ],
          "faceWidth": 74,
          "scale": 0.6457564575645757,
          "contact": [
            1106,
            601
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1182,
            554,
            287,
            452
          ],
          "ground": [
            1365,
            1002
          ],
          "eyesCenter": [
            1250,
            630
          ],
          "faceWidth": 74,
          "scale": 0.6457564575645757,
          "contact": [
            1464,
            686
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
    "clown": {
      "atlases": {
        "standing": {
          "url": "/assets/collection-v1/mia-clown-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/collection-v1/mia-clown-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            155,
            5,
            132,
            492
          ],
          "ground": [
            220,
            493
          ],
          "eyesCenter": [
            220,
            93
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            528,
            4,
            132,
            493
          ],
          "ground": [
            594,
            493
          ],
          "eyesCenter": [
            593,
            93
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            890,
            4,
            133,
            493
          ],
          "ground": [
            956,
            493
          ],
          "eyesCenter": [
            957,
            93
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1260,
            3,
            133,
            494
          ],
          "ground": [
            1327,
            493
          ],
          "eyesCenter": [
            1327,
            93
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            121,
            519,
            216,
            477
          ],
          "ground": [
            218,
            992
          ],
          "eyesCenter": [
            220,
            606
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            507,
            519,
            179,
            476
          ],
          "ground": [
            595,
            991
          ],
          "eyesCenter": [
            595,
            604
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            860,
            528,
            185,
            470
          ],
          "ground": [
            950,
            994
          ],
          "eyesCenter": [
            953,
            620
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1225,
            510,
            227,
            489
          ],
          "ground": [
            1338,
            995
          ],
          "eyesCenter": [
            1346,
            612
          ],
          "faceWidth": 58,
          "scale": 0.7172131147540983
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            69,
            11,
            289,
            433
          ],
          "ground": [
            213,
            440
          ],
          "eyesCenter": [
            213,
            120
          ],
          "faceWidth": 82,
          "scale": 0.6060606060606061
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            445,
            10,
            284,
            434
          ],
          "ground": [
            587,
            440
          ],
          "eyesCenter": [
            585,
            120
          ],
          "faceWidth": 82,
          "scale": 0.6046511627906976
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            824,
            10,
            278,
            435
          ],
          "ground": [
            963,
            441
          ],
          "eyesCenter": [
            964,
            120
          ],
          "faceWidth": 82,
          "scale": 0.6032482598607889
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1203,
            10,
            275,
            434
          ],
          "ground": [
            1340,
            440
          ],
          "eyesCenter": [
            1344,
            120
          ],
          "faceWidth": 82,
          "scale": 0.6046511627906976
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            103,
            500,
            251,
            512
          ],
          "ground": [
            215,
            1008
          ],
          "eyesCenter": [
            221,
            605
          ],
          "faceWidth": 64,
          "scale": 0.6972111553784861
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            477,
            502,
            219,
            506
          ],
          "ground": [
            583,
            1004
          ],
          "eyesCenter": [
            586,
            595
          ],
          "faceWidth": 64,
          "scale": 0.6972111553784861,
          "contact": [
            506,
            634
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            849,
            502,
            275,
            509
          ],
          "ground": [
            963,
            1007
          ],
          "eyesCenter": [
            951,
            596
          ],
          "faceWidth": 64,
          "scale": 0.6972111553784861,
          "contact": [
            1089,
            691
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1171,
            610,
            308,
            390
          ],
          "ground": [
            1372,
            996
          ],
          "eyesCenter": [
            1255,
            696
          ],
          "faceWidth": 68,
          "scale": 0.6972111553784861,
          "contact": [
            1474,
            743
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
    "stage": {
      "crop": [
        30,
        9,
        499,
        891
      ],
      "atlas": {
        "url": "/assets/collection-v1/lily-collection-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "weekend": {
      "crop": [
        530,
        9,
        478,
        1007
      ],
      "atlas": {
        "url": "/assets/collection-v1/lily-collection-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "clown": {
      "crop": [
        1012,
        8,
        510,
        1004
      ],
      "atlas": {
        "url": "/assets/collection-v1/lily-collection-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  },
  "mia": {
    "stage": {
      "crop": [
        34,
        39,
        492,
        774
      ],
      "atlas": {
        "url": "/assets/collection-v1/mia-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "weekend": {
      "crop": [
        539,
        38,
        454,
        954
      ],
      "atlas": {
        "url": "/assets/collection-v1/mia-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "clown": {
      "crop": [
        1035,
        37,
        468,
        795
      ],
      "atlas": {
        "url": "/assets/collection-v1/mia-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  }
};
  for(const id of ['lily','mia']){Object.assign(window.outfitSpriteData[id],costumes[id]);Object.assign(window.wardrobeHangers[id].frames,hangers[id]);}
})();
