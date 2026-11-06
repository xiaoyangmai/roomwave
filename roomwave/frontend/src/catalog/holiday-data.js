'use strict';
// Native Christmas and Valentine costumes; full painted expressions and clothes-only hangers.
(() => {
  const costumes={
  "lily": {
    "christmas": {
      "atlases": {
        "standing": {
          "url": "/assets/holidays-v1/lily-christmas-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/holidays-v1/lily-christmas-actions-v2.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            124,
            3,
            203,
            507
          ],
          "ground": [
            210,
            509
          ],
          "eyesCenter": [
            212,
            98
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            480,
            3,
            203,
            508
          ],
          "ground": [
            567,
            509
          ],
          "eyesCenter": [
            568,
            98
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            863,
            3,
            204,
            510
          ],
          "ground": [
            952,
            508
          ],
          "eyesCenter": [
            955,
            98
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1236,
            3,
            205,
            508
          ],
          "ground": [
            1328,
            509
          ],
          "eyesCenter": [
            1330,
            98
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            114,
            510,
            215,
            506
          ],
          "ground": [
            208,
            1010
          ],
          "eyesCenter": [
            209,
            605
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            481,
            511,
            209,
            505
          ],
          "ground": [
            575,
            1010
          ],
          "eyesCenter": [
            575,
            604
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            858,
            513,
            214,
            503
          ],
          "ground": [
            956,
            1010
          ],
          "eyesCenter": [
            956,
            615
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1175,
            511,
            347,
            505
          ],
          "ground": [
            1336,
            1010
          ],
          "eyesCenter": [
            1344,
            616
          ],
          "faceWidth": 66,
          "scale": 0.6986027944111777
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            101,
            9,
            260,
            422
          ],
          "ground": [
            219,
            425
          ],
          "eyesCenter": [
            213,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6326034063260341
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            457,
            9,
            259,
            422
          ],
          "ground": [
            575,
            425
          ],
          "eyesCenter": [
            569,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6326034063260341
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            837,
            9,
            260,
            422
          ],
          "ground": [
            956,
            425
          ],
          "eyesCenter": [
            952,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6326034063260341
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1197,
            9,
            258,
            422
          ],
          "ground": [
            1318,
            425
          ],
          "eyesCenter": [
            1313,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6326034063260341
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            53,
            452,
            326,
            553
          ],
          "ground": [
            222,
            999
          ],
          "eyesCenter": [
            234,
            556
          ],
          "faceWidth": 72,
          "scale": 0.6469500924214417
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            473,
            453,
            242,
            552
          ],
          "ground": [
            579,
            999
          ],
          "eyesCenter": [
            579,
            553
          ],
          "faceWidth": 72,
          "scale": 0.6469500924214417,
          "contact": [
            509,
            590
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            814,
            456,
            349,
            550
          ],
          "ground": [
            938,
            1000
          ],
          "eyesCenter": [
            939,
            553
          ],
          "faceWidth": 72,
          "scale": 0.6469500924214417,
          "contact": [
            1121,
            652
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1225,
            462,
            280,
            545
          ],
          "ground": [
            1385,
            1001
          ],
          "eyesCenter": [
            1280,
            574
          ],
          "faceWidth": 72,
          "scale": 0.6469500924214417,
          "contact": [
            1355,
            619
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
    "valentines": {
      "atlases": {
        "standing": {
          "url": "/assets/holidays-v1/lily-valentines-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/holidays-v1/lily-valentines-actions-v2.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            116,
            5,
            212,
            504
          ],
          "ground": [
            211,
            504
          ],
          "eyesCenter": [
            212,
            98
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            471,
            5,
            212,
            505
          ],
          "ground": [
            567,
            504
          ],
          "eyesCenter": [
            568,
            98
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            855,
            4,
            212,
            505
          ],
          "ground": [
            952,
            504
          ],
          "eyesCenter": [
            955,
            98
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1237,
            5,
            212,
            504
          ],
          "ground": [
            1334,
            504
          ],
          "eyesCenter": [
            1339,
            98
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            112,
            509,
            217,
            502
          ],
          "ground": [
            208,
            1005
          ],
          "eyesCenter": [
            209,
            605
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            480,
            510,
            209,
            501
          ],
          "ground": [
            575,
            1005
          ],
          "eyesCenter": [
            575,
            604
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            853,
            509,
            219,
            503
          ],
          "ground": [
            956,
            1006
          ],
          "eyesCenter": [
            956,
            615
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1181,
            509,
            333,
            504
          ],
          "ground": [
            1337,
            1007
          ],
          "eyesCenter": [
            1344,
            616
          ],
          "faceWidth": 66,
          "scale": 0.708502024291498
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            99,
            6,
            260,
            421
          ],
          "ground": [
            217,
            421
          ],
          "eyesCenter": [
            212,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6341463414634146
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            455,
            6,
            262,
            421
          ],
          "ground": [
            574,
            421
          ],
          "eyesCenter": [
            570,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6341463414634146
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            836,
            6,
            261,
            421
          ],
          "ground": [
            955,
            421
          ],
          "eyesCenter": [
            953,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6341463414634146
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1194,
            7,
            261,
            419
          ],
          "ground": [
            1316,
            420
          ],
          "eyesCenter": [
            1316,
            120
          ],
          "faceWidth": 79,
          "scale": 0.6341463414634146
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            40,
            466,
            318,
            538
          ],
          "ground": [
            218,
            998
          ],
          "eyesCenter": [
            212,
            573
          ],
          "faceWidth": 70,
          "scale": 0.6730769230769231
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            472,
            472,
            241,
            531
          ],
          "ground": [
            583,
            997
          ],
          "eyesCenter": [
            581,
            571
          ],
          "faceWidth": 70,
          "scale": 0.6730769230769231,
          "contact": [
            508,
            614
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            827,
            474,
            331,
            530
          ],
          "ground": [
            939,
            998
          ],
          "eyesCenter": [
            936,
            571
          ],
          "faceWidth": 70,
          "scale": 0.6730769230769231,
          "contact": [
            1119,
            676
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1234,
            480,
            257,
            524
          ],
          "ground": [
            1382,
            998
          ],
          "eyesCenter": [
            1287,
            591
          ],
          "faceWidth": 70,
          "scale": 0.6730769230769231,
          "contact": [
            1351,
            644
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
    "christmas": {
      "atlases": {
        "standing": {
          "url": "/assets/holidays-v1/mia-christmas-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/holidays-v1/mia-christmas-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            147,
            3,
            161,
            507
          ],
          "ground": [
            225,
            504
          ],
          "eyesCenter": [
            224,
            87
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            492,
            3,
            161,
            507
          ],
          "ground": [
            572,
            504
          ],
          "eyesCenter": [
            571,
            87
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            876,
            4,
            159,
            505
          ],
          "ground": [
            955,
            504
          ],
          "eyesCenter": [
            953,
            87
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1227,
            3,
            161,
            507
          ],
          "ground": [
            1307,
            504
          ],
          "eyesCenter": [
            1306,
            87
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            119,
            510,
            234,
            497
          ],
          "ground": [
            220,
            1001
          ],
          "eyesCenter": [
            219,
            596
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            489,
            509,
            186,
            498
          ],
          "ground": [
            580,
            1001
          ],
          "eyesCenter": [
            582,
            596
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            858,
            507,
            201,
            500
          ],
          "ground": [
            955,
            1002
          ],
          "eyesCenter": [
            957,
            612
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1224,
            511,
            280,
            498
          ],
          "ground": [
            1318,
            1003
          ],
          "eyesCenter": [
            1321,
            610
          ],
          "faceWidth": 56,
          "scale": 0.6986027944111777
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            141,
            2,
            190,
            410
          ],
          "ground": [
            236,
            406
          ],
          "eyesCenter": [
            231,
            102
          ],
          "faceWidth": 76,
          "scale": 0.6435643564356436
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            494,
            3,
            189,
            409
          ],
          "ground": [
            589,
            406
          ],
          "eyesCenter": [
            585,
            102
          ],
          "faceWidth": 76,
          "scale": 0.6451612903225806
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            851,
            2,
            189,
            410
          ],
          "ground": [
            945,
            406
          ],
          "eyesCenter": [
            939,
            102
          ],
          "faceWidth": 76,
          "scale": 0.6435643564356436
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1211,
            2,
            191,
            410
          ],
          "ground": [
            1303,
            406
          ],
          "eyesCenter": [
            1300,
            102
          ],
          "faceWidth": 76,
          "scale": 0.6435643564356436
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            74,
            414,
            335,
            587
          ],
          "ground": [
            188,
            995
          ],
          "eyesCenter": [
            190,
            510
          ],
          "faceWidth": 66,
          "scale": 0.6024096385542169
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            462,
            413,
            269,
            587
          ],
          "ground": [
            589,
            994
          ],
          "eyesCenter": [
            586,
            506
          ],
          "faceWidth": 66,
          "contact": [
            499,
            544
          ],
          "mirror": true,
          "scale": 0.6024096385542169
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            806,
            413,
            350,
            588
          ],
          "ground": [
            940,
            995
          ],
          "eyesCenter": [
            944,
            506
          ],
          "faceWidth": 66,
          "contact": [
            1101,
            595
          ],
          "scale": 0.6024096385542169
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1226,
            414,
            239,
            586
          ],
          "ground": [
            1362,
            994
          ],
          "eyesCenter": [
            1281,
            507
          ],
          "faceWidth": 60,
          "contact": [
            1372,
            579
          ],
          "scale": 0.6024096385542169
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
    "valentines": {
      "atlases": {
        "standing": {
          "url": "/assets/holidays-v1/mia-valentines-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/holidays-v1/mia-valentines-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            130,
            21,
            206,
            488
          ],
          "ground": [
            233,
            503
          ],
          "eyesCenter": [
            233,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            483,
            21,
            205,
            488
          ],
          "ground": [
            584,
            503
          ],
          "eyesCenter": [
            585,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            839,
            24,
            201,
            485
          ],
          "ground": [
            938,
            505
          ],
          "eyesCenter": [
            938,
            92
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1189,
            21,
            205,
            489
          ],
          "ground": [
            1291,
            504
          ],
          "eyesCenter": [
            1291,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            118,
            522,
            235,
            482
          ],
          "ground": [
            218,
            998
          ],
          "eyesCenter": [
            219,
            598
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            477,
            522,
            207,
            482
          ],
          "ground": [
            581,
            998
          ],
          "eyesCenter": [
            584,
            598
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            831,
            508,
            202,
            495
          ],
          "ground": [
            939,
            999
          ],
          "eyesCenter": [
            940,
            604
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1212,
            508,
            290,
            500
          ],
          "ground": [
            1318,
            1002
          ],
          "eyesCenter": [
            1314,
            603
          ],
          "faceWidth": 56,
          "scale": 0.7261410788381742
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            123,
            17,
            263,
            388
          ],
          "ground": [
            253,
            399
          ],
          "eyesCenter": [
            247,
            107
          ],
          "faceWidth": 78,
          "scale": 0.680628272251309
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            474,
            15,
            263,
            390
          ],
          "ground": [
            605,
            399
          ],
          "eyesCenter": [
            598,
            105
          ],
          "faceWidth": 78,
          "scale": 0.6770833333333334
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            821,
            15,
            265,
            390
          ],
          "ground": [
            953,
            399
          ],
          "eyesCenter": [
            948,
            105
          ],
          "faceWidth": 78,
          "scale": 0.6770833333333334
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1173,
            18,
            263,
            387
          ],
          "ground": [
            1304,
            399
          ],
          "eyesCenter": [
            1299,
            108
          ],
          "faceWidth": 78,
          "scale": 0.6824146981627297
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            102,
            415,
            337,
            578
          ],
          "ground": [
            215,
            987
          ],
          "eyesCenter": [
            214,
            491
          ],
          "faceWidth": 66,
          "scale": 0.6076388888888888
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            477,
            411,
            265,
            582
          ],
          "ground": [
            598,
            987
          ],
          "eyesCenter": [
            598,
            489
          ],
          "faceWidth": 66,
          "contact": [
            511,
            528
          ],
          "mirror": true,
          "scale": 0.6076388888888888
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            801,
            413,
            357,
            580
          ],
          "ground": [
            944,
            987
          ],
          "eyesCenter": [
            939,
            489
          ],
          "faceWidth": 66,
          "contact": [
            1105,
            570
          ],
          "scale": 0.6076388888888888
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1222,
            414,
            269,
            581
          ],
          "ground": [
            1351,
            989
          ],
          "eyesCenter": [
            1271,
            493
          ],
          "faceWidth": 58,
          "contact": [
            1364,
            560
          ],
          "scale": 0.6076388888888888
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
    "christmas": {
      "crop": [
        162,
        7,
        513,
        992
      ],
      "atlas": {
        "url": "/assets/holidays-v1/lily-holiday-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "valentines": {
      "crop": [
        912,
        7,
        479,
        987
      ],
      "atlas": {
        "url": "/assets/holidays-v1/lily-holiday-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  },
  "mia": {
    "christmas": {
      "crop": [
        175,
        10,
        514,
        981
      ],
      "atlas": {
        "url": "/assets/holidays-v1/mia-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    },
    "valentines": {
      "crop": [
        871,
        10,
        468,
        979
      ],
      "atlas": {
        "url": "/assets/holidays-v1/mia-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  }
};
  for(const id of ['lily','mia']){Object.assign(window.outfitSpriteData[id],costumes[id]);Object.assign(window.wardrobeHangers[id].frames,hangers[id]);}
})();
