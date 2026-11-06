'use strict';
// Complete painted pajamas and café uniforms. Existing costume sets remain available.
(() => {
  const costumes={
  "mia": {
    "pajamas": {
      "atlases": {
        "standing": {
          "url": "/assets/cozy-maid-v1/mia-pajamas-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/cozy-maid-v1/mia-pajamas-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            162,
            21,
            140,
            489
          ],
          "ground": [
            231,
            505
          ],
          "eyesCenter": [
            229,
            90
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            521,
            21,
            139,
            488
          ],
          "ground": [
            590,
            505
          ],
          "eyesCenter": [
            586,
            90
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            880,
            20,
            139,
            489
          ],
          "ground": [
            949,
            504
          ],
          "eyesCenter": [
            946,
            89
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1237,
            20,
            139,
            488
          ],
          "ground": [
            1308,
            504
          ],
          "eyesCenter": [
            1303,
            90
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            120,
            523,
            215,
            471
          ],
          "ground": [
            228,
            990
          ],
          "eyesCenter": [
            230,
            593
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            503,
            523,
            179,
            472
          ],
          "ground": [
            592,
            991
          ],
          "eyesCenter": [
            591,
            593
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            850,
            514,
            203,
            481
          ],
          "ground": [
            950,
            991
          ],
          "eyesCenter": [
            953,
            612
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1231,
            518,
            240,
            476
          ],
          "ground": [
            1312,
            990
          ],
          "eyesCenter": [
            1307,
            593
          ],
          "faceWidth": 62,
          "scale": 0.7231404958677686
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            91,
            13,
            286,
            415
          ],
          "ground": [
            234,
            423
          ],
          "eyesCenter": [
            231,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6341463414634146
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            438,
            13,
            282,
            415
          ],
          "ground": [
            578,
            423
          ],
          "eyesCenter": [
            575,
            97
          ],
          "faceWidth": 76,
          "scale": 0.6341463414634146
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            818,
            13,
            285,
            415
          ],
          "ground": [
            958,
            423
          ],
          "eyesCenter": [
            954,
            104
          ],
          "faceWidth": 76,
          "scale": 0.6341463414634146
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1184,
            13,
            283,
            415
          ],
          "ground": [
            1324,
            423
          ],
          "eyesCenter": [
            1324,
            101
          ],
          "faceWidth": 76,
          "scale": 0.6341463414634146
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            106,
            428,
            264,
            567
          ],
          "ground": [
            223,
            992
          ],
          "eyesCenter": [
            221,
            500
          ],
          "faceWidth": 70,
          "scale": 0.6216696269982238
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            495,
            435,
            193,
            558
          ],
          "ground": [
            602,
            990
          ],
          "eyesCenter": [
            561,
            512
          ],
          "faceWidth": 70,
          "scale": 0.6216696269982238,
          "contact": [
            660,
            692
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            865,
            427,
            214,
            567
          ],
          "ground": [
            966,
            990
          ],
          "eyesCenter": [
            961,
            499
          ],
          "faceWidth": 70,
          "scale": 0.6216696269982238,
          "contact": [
            884,
            550
          ]
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1215,
            427,
            314,
            568
          ],
          "ground": [
            1313,
            991
          ],
          "eyesCenter": [
            1324,
            501
          ],
          "faceWidth": 70,
          "scale": 0.6216696269982238,
          "contact": [
            1499,
            611
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
    "maid": {
      "atlases": {
        "standing": {
          "url": "/assets/cozy-maid-v1/mia-maid-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/cozy-maid-v1/mia-maid-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            141,
            22,
            184,
            470
          ],
          "ground": [
            232,
            488
          ],
          "eyesCenter": [
            227,
            96
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            500,
            23,
            187,
            471
          ],
          "ground": [
            591,
            489
          ],
          "eyesCenter": [
            589,
            96
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            857,
            23,
            186,
            470
          ],
          "ground": [
            949,
            489
          ],
          "eyesCenter": [
            947,
            96
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1223,
            23,
            185,
            471
          ],
          "ground": [
            1312,
            489
          ],
          "eyesCenter": [
            1311,
            96
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            126,
            525,
            194,
            462
          ],
          "ground": [
            230,
            983
          ],
          "eyesCenter": [
            224,
            599
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            503,
            527,
            184,
            460
          ],
          "ground": [
            594,
            983
          ],
          "eyesCenter": [
            593,
            602
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            862,
            530,
            183,
            457
          ],
          "ground": [
            954,
            983
          ],
          "eyesCenter": [
            957,
            614
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1246,
            527,
            218,
            460
          ],
          "ground": [
            1316,
            983
          ],
          "eyesCenter": [
            1315,
            603
          ],
          "faceWidth": 60,
          "scale": 0.7510729613733905
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            88,
            9,
            296,
            417
          ],
          "ground": [
            234,
            422
          ],
          "eyesCenter": [
            231,
            100
          ],
          "faceWidth": 76,
          "scale": 0.6295399515738499
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            446,
            9,
            297,
            417
          ],
          "ground": [
            592,
            422
          ],
          "eyesCenter": [
            588,
            98
          ],
          "faceWidth": 76,
          "scale": 0.6295399515738499
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            814,
            9,
            294,
            418
          ],
          "ground": [
            959,
            422
          ],
          "eyesCenter": [
            953,
            105
          ],
          "faceWidth": 76,
          "scale": 0.6295399515738499
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1179,
            7,
            293,
            419
          ],
          "ground": [
            1323,
            422
          ],
          "eyesCenter": [
            1323,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6265060240963856
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            106,
            432,
            262,
            572
          ],
          "ground": [
            226,
            1000
          ],
          "eyesCenter": [
            228,
            515
          ],
          "faceWidth": 69,
          "scale": 0.6261180679785331
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            509,
            434,
            217,
            560
          ],
          "ground": [
            612,
            990
          ],
          "eyesCenter": [
            583,
            524
          ],
          "faceWidth": 70,
          "scale": 0.6261180679785331,
          "contact": [
            682,
            695
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            860,
            433,
            225,
            563
          ],
          "ground": [
            966,
            992
          ],
          "eyesCenter": [
            962,
            517
          ],
          "faceWidth": 70,
          "scale": 0.6261180679785331,
          "contact": [
            885,
            566
          ]
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1216,
            433,
            312,
            567
          ],
          "ground": [
            1336,
            996
          ],
          "eyesCenter": [
            1324,
            517
          ],
          "faceWidth": 70,
          "scale": 0.6261180679785331,
          "contact": [
            1494,
            628
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
    "pajamas": {
      "atlases": {
        "standing": {
          "url": "/assets/cozy-maid-v1/lily-pajamas-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/cozy-maid-v1/lily-pajamas-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            98,
            6,
            207,
            505
          ],
          "ground": [
            203,
            507
          ],
          "eyesCenter": [
            203,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            482,
            5,
            206,
            506
          ],
          "ground": [
            586,
            507
          ],
          "eyesCenter": [
            586,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            864,
            5,
            207,
            506
          ],
          "ground": [
            968,
            507
          ],
          "eyesCenter": [
            968,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1230,
            5,
            208,
            506
          ],
          "ground": [
            1334,
            507
          ],
          "eyesCenter": [
            1336,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            87,
            514,
            232,
            499
          ],
          "ground": [
            201,
            1008
          ],
          "eyesCenter": [
            198,
            584
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            482,
            514,
            213,
            499
          ],
          "ground": [
            585,
            1008
          ],
          "eyesCenter": [
            588,
            585
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            849,
            511,
            223,
            502
          ],
          "ground": [
            964,
            1008
          ],
          "eyesCenter": [
            967,
            590
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1169,
            511,
            329,
            505
          ],
          "ground": [
            1333,
            1011
          ],
          "eyesCenter": [
            1338,
            594
          ],
          "faceWidth": 61,
          "scale": 0.6986027944111777
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            101,
            9,
            253,
            411
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
          "scale": 0.6388206388206388
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            456,
            9,
            257,
            411
          ],
          "ground": [
            588,
            416
          ],
          "eyesCenter": [
            582,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6388206388206388
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            833,
            9,
            254,
            411
          ],
          "ground": [
            961,
            416
          ],
          "eyesCenter": [
            961,
            100
          ],
          "faceWidth": 76,
          "scale": 0.6388206388206388
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1193,
            9,
            256,
            411
          ],
          "ground": [
            1323,
            416
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
            87,
            425,
            305,
            563
          ],
          "ground": [
            236,
            984
          ],
          "eyesCenter": [
            224,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6227758007117438
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            485,
            425,
            239,
            563
          ],
          "ground": [
            622,
            983
          ],
          "eyesCenter": [
            546,
            510
          ],
          "faceWidth": 73,
          "scale": 0.6227758007117438,
          "contact": [
            702,
            658
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            838,
            420,
            241,
            567
          ],
          "ground": [
            961,
            982
          ],
          "eyesCenter": [
            961,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6227758007117438,
          "contact": [
            888,
            555
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1191,
            423,
            329,
            565
          ],
          "ground": [
            1317,
            983
          ],
          "eyesCenter": [
            1316,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6227758007117438,
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
    },
    "maid": {
      "atlases": {
        "standing": {
          "url": "/assets/cozy-maid-v1/lily-maid-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "/assets/cozy-maid-v1/lily-maid-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            95,
            4,
            214,
            510
          ],
          "ground": [
            205,
            511
          ],
          "eyesCenter": [
            204,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            477,
            3,
            211,
            511
          ],
          "ground": [
            584,
            512
          ],
          "eyesCenter": [
            587,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            856,
            3,
            212,
            511
          ],
          "ground": [
            965,
            511
          ],
          "eyesCenter": [
            969,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1225,
            3,
            215,
            511
          ],
          "ground": [
            1336,
            512
          ],
          "eyesCenter": [
            1337,
            77
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            85,
            514,
            246,
            496
          ],
          "ground": [
            202,
            1005
          ],
          "eyesCenter": [
            198,
            584
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            481,
            515,
            213,
            494
          ],
          "ground": [
            588,
            1005
          ],
          "eyesCenter": [
            588,
            585
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            853,
            514,
            218,
            496
          ],
          "ground": [
            963,
            1005
          ],
          "eyesCenter": [
            966,
            590
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1171,
            514,
            322,
            500
          ],
          "ground": [
            1331,
            1010
          ],
          "eyesCenter": [
            1338,
            594
          ],
          "faceWidth": 61,
          "scale": 0.6903353057199211
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            99,
            11,
            256,
            410
          ],
          "ground": [
            227,
            419
          ],
          "eyesCenter": [
            224,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6372549019607843
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            456,
            11,
            256,
            410
          ],
          "ground": [
            587,
            419
          ],
          "eyesCenter": [
            583,
            99
          ],
          "faceWidth": 76,
          "scale": 0.6372549019607843
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            834,
            11,
            254,
            410
          ],
          "ground": [
            959,
            419
          ],
          "eyesCenter": [
            962,
            100
          ],
          "faceWidth": 76,
          "scale": 0.6372549019607843
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            1190,
            11,
            255,
            410
          ],
          "ground": [
            1319,
            419
          ],
          "eyesCenter": [
            1324,
            102
          ],
          "faceWidth": 76,
          "scale": 0.6372549019607843
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            85,
            421,
            306,
            569
          ],
          "ground": [
            237,
            985
          ],
          "eyesCenter": [
            224,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6205673758865248
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            483,
            426,
            248,
            562
          ],
          "ground": [
            621,
            983
          ],
          "eyesCenter": [
            543,
            510
          ],
          "faceWidth": 73,
          "scale": 0.6205673758865248,
          "contact": [
            705,
            660
          ]
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            838,
            421,
            239,
            569
          ],
          "ground": [
            960,
            985
          ],
          "eyesCenter": [
            960,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6205673758865248,
          "contact": [
            888,
            555
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            1189,
            421,
            330,
            570
          ],
          "ground": [
            1319,
            985
          ],
          "eyesCenter": [
            1316,
            498
          ],
          "faceWidth": 73,
          "scale": 0.6205673758865248,
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
  }
};
  window.outfitSpriteData ||= {};
  for (const [id,data] of Object.entries(costumes)) {
    window.outfitSpriteData[id] ||= {};
    Object.assign(window.outfitSpriteData[id],data);
  }
})();
