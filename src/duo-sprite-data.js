'use strict';
// Complete painted figures with measured registration. Automatic blink swaps are disabled.
window.duoSpriteData = {
  "version": 3,
  "characters": {
    "lily": {
      "atlases": {
        "main": {
          "url": "assets/lily/full-poses-v1.lossless.webp",
          "width": 1448,
          "height": 1086,
          "scale": 0.6395563770794824
        },
        "reactions": {
          "url": "assets/lily/full-poses-reactions-v1.lossless.webp",
          "width": 1448,
          "height": 1086,
          "scale": 0.6336996336996337
        },
        "gestures": {
          "url": "assets/lily/full-gestures-v2.lossless.webp",
          "width": 1448,
          "height": 1086
        },
        "kneeling": {
          "url": "assets/lily/full-kneeling-v1.lossless.webp",
          "width": 1448,
          "height": 1086,
          "scale": 0.4805914972273567
        }
      },
      "frames": {
        "idle": {
          "atlas": "main",
          "crop": [
            109,
            5,
            204,
            547
          ],
          "ground": [
            212,
            552
          ],
          "eyesCenter": [
            212,
            100
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "wave": {
          "atlas": "main",
          "crop": [
            425,
            8,
            238,
            545
          ],
          "ground": [
            550,
            553
          ],
          "eyesCenter": [
            551,
            95
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "heart": {
          "atlas": "main",
          "crop": [
            791,
            1,
            228,
            552
          ],
          "ground": [
            912,
            553
          ],
          "eyesCenter": [
            911,
            118
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "angry": {
          "atlas": "main",
          "crop": [
            1138,
            7,
            217,
            546
          ],
          "ground": [
            1248,
            553
          ],
          "eyesCenter": [
            1245,
            100
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "danceLeft": {
          "atlas": "main",
          "crop": [
            37,
            564,
            292,
            514
          ],
          "ground": [
            200,
            1078
          ],
          "eyesCenter": [
            186,
            650
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "danceRight": {
          "atlas": "main",
          "crop": [
            413,
            560,
            314,
            518
          ],
          "ground": [
            540,
            1078
          ],
          "eyesCenter": [
            547,
            650
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "plead": {
          "atlas": "main",
          "crop": [
            792,
            565,
            218,
            510
          ],
          "ground": [
            904,
            1075
          ],
          "eyesCenter": [
            904,
            665
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "celebrate": {
          "atlas": "main",
          "crop": [
            1099,
            552,
            333,
            527
          ],
          "ground": [
            1260,
            1079
          ],
          "eyesCenter": [
            1266,
            684
          ],
          "faceWidth": 84,
          "scale": 0.6395563770794824
        },
        "blink": {
          "atlas": "reactions",
          "crop": [
            101,
            5,
            215,
            550
          ],
          "ground": [
            210,
            555
          ],
          "eyesCenter": [
            208,
            102
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "surprised": {
          "atlas": "reactions",
          "crop": [
            424,
            8,
            246,
            548
          ],
          "ground": [
            551,
            556
          ],
          "eyesCenter": [
            552,
            102
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "sad": {
          "atlas": "reactions",
          "crop": [
            794,
            14,
            219,
            541
          ],
          "ground": [
            909,
            555
          ],
          "eyesCenter": [
            909,
            111
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "downcast": {
          "atlas": "reactions",
          "crop": [
            1134,
            15,
            226,
            541
          ],
          "ground": [
            1250,
            556
          ],
          "eyesCenter": [
            1253,
            121
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "bent": {
          "atlas": "reactions",
          "crop": [
            76,
            565,
            273,
            509
          ],
          "ground": [
            240,
            1074
          ],
          "eyesCenter": [
            163,
            667
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337,
          "contact": [
            326,
            790
          ]
        },
        "ready": {
          "atlas": "reactions",
          "crop": [
            431,
            557,
            262,
            517
          ],
          "ground": [
            553,
            1074
          ],
          "eyesCenter": [
            559,
            649
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "followThrough": {
          "atlas": "reactions",
          "crop": [
            778,
            558,
            313,
            516
          ],
          "ground": [
            895,
            1074
          ],
          "eyesCenter": [
            904,
            650
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337,
          "contact": [
            1055,
            817
          ]
        },
        "danceCenter": {
          "atlas": "reactions",
          "crop": [
            1091,
            560,
            321,
            514
          ],
          "ground": [
            1252,
            1074
          ],
          "eyesCenter": [
            1254,
            658
          ],
          "faceWidth": 84,
          "scale": 0.6336996336996337
        },
        "waveLift": {
          "atlas": "gestures",
          "crop": [
            89,
            4,
            248,
            553
          ],
          "ground": [
            217,
            555
          ],
          "eyesCenter": [
            221,
            95
          ],
          "faceWidth": 82,
          "scale": 0.6323851203501094
        },
        "waveIn": {
          "atlas": "gestures",
          "crop": [
            439,
            4,
            249,
            553
          ],
          "ground": [
            566,
            555
          ],
          "eyesCenter": [
            568,
            95
          ],
          "faceWidth": 84,
          "scale": 0.6323851203501094
        },
        "waveOut": {
          "atlas": "gestures",
          "crop": [
            795,
            4,
            248,
            553
          ],
          "ground": [
            918.5,
            555
          ],
          "eyesCenter": [
            926,
            95
          ],
          "faceWidth": 82,
          "scale": 0.6337719298245614
        },
        "waveBlink": {
          "atlas": "gestures",
          "crop": [
            1142,
            4,
            247,
            553
          ],
          "ground": [
            1264.5,
            555
          ],
          "eyesCenter": [
            1273,
            100
          ],
          "faceWidth": 78,
          "scale": 0.6337719298245614
        },
        "heartChest": {
          "atlas": "gestures",
          "crop": [
            90,
            559,
            247,
            520
          ],
          "ground": [
            219,
            1077
          ],
          "eyesCenter": [
            214,
            651
          ],
          "faceWidth": 78,
          "scale": 0.6768149882903981
        },
        "heartRise": {
          "atlas": "gestures",
          "crop": [
            443,
            558,
            248,
            521
          ],
          "ground": [
            568.5,
            1077
          ],
          "eyesCenter": [
            568,
            653
          ],
          "faceWidth": 84,
          "scale": 0.6768149882903981
        },
        "heartHold": {
          "atlas": "gestures",
          "crop": [
            792,
            557,
            248,
            522
          ],
          "ground": [
            915.5,
            1077
          ],
          "eyesCenter": [
            917,
            665
          ],
          "faceWidth": 84,
          "scale": 0.7031630170316302
        },
        "heartBlink": {
          "atlas": "gestures",
          "crop": [
            1146,
            557,
            241,
            522
          ],
          "ground": [
            1265,
            1077
          ],
          "eyesCenter": [
            1266,
            666
          ],
          "faceWidth": 84,
          "scale": 0.7031630170316302
        },
        "kneelHopeful": {
          "atlas": "kneeling",
          "crop": [
            38,
            9,
            321,
            536
          ],
          "ground": [
            218,
            543
          ],
          "eyesCenter": [
            201,
            148
          ],
          "faceWidth": 123,
          "scale": 0.48507462686567165
        },
        "kneelBlink": {
          "atlas": "kneeling",
          "crop": [
            392,
            9,
            320,
            536
          ],
          "ground": [
            573,
            543
          ],
          "eyesCenter": [
            555,
            148
          ],
          "faceWidth": 123,
          "scale": 0.48507462686567165
        },
        "kneelWorried": {
          "atlas": "kneeling",
          "crop": [
            744,
            9,
            321,
            536
          ],
          "ground": [
            924,
            543
          ],
          "eyesCenter": [
            907,
            148
          ],
          "faceWidth": 124,
          "scale": 0.48507462686567165
        },
        "kneelSad": {
          "atlas": "kneeling",
          "crop": [
            1099,
            9,
            321,
            536
          ],
          "ground": [
            1279.5,
            543
          ],
          "eyesCenter": [
            1262,
            148
          ],
          "faceWidth": 123,
          "scale": 0.48507462686567165
        },
        "kneelAngry": {
          "atlas": "kneeling",
          "crop": [
            39,
            549,
            320,
            533
          ],
          "ground": [
            219,
            1080
          ],
          "eyesCenter": [
            202,
            688
          ],
          "faceWidth": 122,
          "scale": 0.48507462686567165
        },
        "kneelSurprised": {
          "atlas": "kneeling",
          "crop": [
            392,
            549,
            320,
            533
          ],
          "ground": [
            572,
            1080
          ],
          "eyesCenter": [
            555,
            688
          ],
          "faceWidth": 121,
          "scale": 0.48507462686567165
        },
        "kneelHappy": {
          "atlas": "kneeling",
          "crop": [
            745,
            549,
            320,
            534
          ],
          "ground": [
            925.5,
            1081
          ],
          "eyesCenter": [
            908,
            688
          ],
          "faceWidth": 125,
          "scale": 0.48507462686567165
        },
        "kneelEmbarrassed": {
          "atlas": "kneeling",
          "crop": [
            1100,
            549,
            320,
            534
          ],
          "ground": [
            1280,
            1081
          ],
          "eyesCenter": [
            1263,
            688
          ],
          "faceWidth": 125,
          "scale": 0.48507462686567165
        }
      },
      "poses": {
        "idle": {
          "default": "idle",
          "variants": {
            "blink": "blink",
            "laugh": "blink",
            "happy": "idle",
            "neutral": "idle",
            "relieved": "blink",
            "surprised": "surprised",
            "worried": "sad",
            "sad": "downcast",
            "crying": "downcast",
            "blush": "sad",
            "angry": "angry"
          }
        },
        "wave": {
          "default": "waveOut",
          "variants": {
            "blink": "waveBlink",
            "laugh": "waveBlink",
            "wink": "waveBlink"
          }
        },
        "heart": {
          "default": "heartHold",
          "variants": {
            "blink": "heartBlink",
            "laugh": "heartBlink"
          }
        },
        "dance1": {
          "default": "danceLeft"
        },
        "dance2": {
          "default": "danceRight"
        },
        "kneeling": {
          "default": "kneelHopeful",
          "variants": {
            "neutral": "kneelHopeful",
            "happy": "kneelHappy",
            "relieved": "kneelHappy",
            "blink": "kneelBlink",
            "laugh": "kneelHappy",
            "blush": "kneelEmbarrassed",
            "worried": "kneelWorried",
            "sad": "kneelEmbarrassed",
            "crying": "kneelSad",
            "angry": "kneelAngry",
            "surprised": "kneelSurprised"
          }
        },
        "bow": {
          "default": "bent"
        },
        "gesturePrepare": {
          "default": "ready"
        },
        "gestureExtend": {
          "default": "followThrough"
        },
        "heartLow": {
          "default": "heartChest"
        }
      }
    },
    "mia": {
      "atlases": {
        "poses": {
          "url": "assets/classic-duo-v2/mia-poses.lossless.webp",
          "width": 1448,
          "height": 1086
        },
        "reactions": {
          "url": "assets/classic-duo-v2/mia-reactions.lossless.webp",
          "width": 1448,
          "height": 1086
        },
        "kneeling": {
          "url": "assets/duo-polish-v3/mia-kneeling.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "gestures": {
          "url": "assets/classic-duo-v2/mia-gestures.lossless.webp",
          "width": 1448,
          "height": 1086
        }
      },
      "frames": {
        "idle": {
          "atlas": "poses",
          "crop": [
            109,
            8,
            204,
            546
          ],
          "ground": [
            210,
            551
          ],
          "eyesCenter": [
            212,
            94
          ],
          "faceWidth": 86,
          "scale": 0.6383763837638377
        },
        "wave": {
          "atlas": "poses",
          "crop": [
            432,
            9,
            228,
            545
          ],
          "ground": [
            542,
            551
          ],
          "eyesCenter": [
            552,
            98
          ],
          "faceWidth": 92,
          "scale": 0.6383763837638377
        },
        "heart": {
          "atlas": "poses",
          "crop": [
            806,
            0,
            198,
            554
          ],
          "ground": [
            911,
            551
          ],
          "eyesCenter": [
            907,
            114
          ],
          "faceWidth": 90,
          "scale": 0.6383763837638377
        },
        "angry": {
          "atlas": "poses",
          "crop": [
            1182,
            9,
            179,
            545
          ],
          "ground": [
            1283,
            551
          ],
          "eyesCenter": [
            1250,
            107
          ],
          "faceWidth": 88,
          "scale": 0.6383763837638377
        },
        "danceLeft": {
          "atlas": "poses",
          "crop": [
            35,
            561,
            289,
            518
          ],
          "ground": [
            215,
            1076
          ],
          "eyesCenter": [
            199,
            655
          ],
          "faceWidth": 93,
          "scale": 0.6383763837638377
        },
        "danceRight": {
          "atlas": "poses",
          "crop": [
            429,
            560,
            302,
            519
          ],
          "ground": [
            531,
            1076
          ],
          "eyesCenter": [
            543,
            651
          ],
          "faceWidth": 94,
          "scale": 0.6383763837638377
        },
        "plead": {
          "atlas": "poses",
          "crop": [
            824,
            561,
            163,
            515
          ],
          "ground": [
            906,
            1073
          ],
          "eyesCenter": [
            910,
            654
          ],
          "faceWidth": 92,
          "scale": 0.6383763837638377
        },
        "celebrate": {
          "atlas": "poses",
          "crop": [
            1097,
            551,
            343,
            529
          ],
          "ground": [
            1268,
            1077
          ],
          "eyesCenter": [
            1268,
            663
          ],
          "faceWidth": 95,
          "scale": 0.6383763837638377
        },
        "blink": {
          "atlas": "reactions",
          "crop": [
            110,
            5,
            206,
            552
          ],
          "ground": [
            208,
            554
          ],
          "eyesCenter": [
            209,
            94
          ],
          "faceWidth": 86,
          "scale": 0.6383763837638377
        },
        "surprised": {
          "atlas": "reactions",
          "crop": [
            427,
            5,
            245,
            550
          ],
          "ground": [
            548,
            552
          ],
          "eyesCenter": [
            549,
            91
          ],
          "faceWidth": 92,
          "scale": 0.6383763837638377
        },
        "sad": {
          "atlas": "reactions",
          "crop": [
            828,
            9,
            165,
            548
          ],
          "ground": [
            907,
            554
          ],
          "eyesCenter": [
            908,
            100
          ],
          "faceWidth": 88,
          "scale": 0.6383763837638377
        },
        "downcast": {
          "atlas": "reactions",
          "crop": [
            1177,
            13,
            163,
            543
          ],
          "ground": [
            1250,
            553
          ],
          "eyesCenter": [
            1253,
            116
          ],
          "faceWidth": 89,
          "scale": 0.6383763837638377
        },
        "bent": {
          "atlas": "reactions",
          "crop": [
            84,
            561,
            272,
            513
          ],
          "ground": [
            234,
            1071
          ],
          "eyesCenter": [
            154,
            666
          ],
          "faceWidth": 96,
          "scale": 0.6383763837638377,
          "contact": [
            330,
            788
          ]
        },
        "ready": {
          "atlas": "reactions",
          "crop": [
            458,
            555,
            232,
            519
          ],
          "ground": [
            560,
            1071
          ],
          "eyesCenter": [
            564,
            648
          ],
          "faceWidth": 91,
          "scale": 0.6383763837638377
        },
        "followThrough": {
          "atlas": "reactions",
          "crop": [
            797,
            557,
            299,
            517
          ],
          "ground": [
            897,
            1071
          ],
          "eyesCenter": [
            917,
            651
          ],
          "faceWidth": 90,
          "scale": 0.6383763837638377,
          "contact": [
            1064,
            821
          ]
        },
        "danceCenter": {
          "atlas": "reactions",
          "crop": [
            1110,
            557,
            297,
            517
          ],
          "ground": [
            1250,
            1071
          ],
          "eyesCenter": [
            1256,
            645
          ],
          "faceWidth": 91,
          "scale": 0.6383763837638377
        },
        "kneelHopeful": {
          "atlas": "kneeling",
          "crop": [
            59,
            8,
            316,
            504
          ],
          "ground": [
            217,
            511
          ],
          "eyesCenter": [
            205,
            115
          ],
          "faceWidth": 119,
          "scale": 0.5158730158730159
        },
        "waveLift": {
          "atlas": "gestures",
          "crop": [
            89,
            2,
            239,
            556
          ],
          "ground": [
            217.5,
            556
          ],
          "eyesCenter": [
            220,
            92
          ],
          "faceWidth": 87,
          "scale": 0.6228448275862069
        },
        "waveIn": {
          "atlas": "gestures",
          "crop": [
            458,
            2,
            218,
            556
          ],
          "ground": [
            566,
            556
          ],
          "eyesCenter": [
            568,
            92
          ],
          "faceWidth": 88,
          "scale": 0.6228448275862069
        },
        "waveOut": {
          "atlas": "gestures",
          "crop": [
            805,
            3,
            226,
            553
          ],
          "ground": [
            920.5,
            556
          ],
          "eyesCenter": [
            926,
            94
          ],
          "faceWidth": 79,
          "scale": 0.6255411255411255
        },
        "waveBlink": {
          "atlas": "gestures",
          "crop": [
            1153,
            3,
            227,
            554
          ],
          "ground": [
            1269,
            557
          ],
          "eyesCenter": [
            1274,
            97
          ],
          "faceWidth": 77,
          "scale": 0.6282608695652174
        },
        "heartChest": {
          "atlas": "gestures",
          "crop": [
            98,
            563,
            238,
            517
          ],
          "ground": [
            219,
            1078
          ],
          "eyesCenter": [
            214,
            651
          ],
          "faceWidth": 87,
          "scale": 0.6768149882903981
        },
        "heartRise": {
          "atlas": "gestures",
          "crop": [
            455,
            563,
            232,
            517
          ],
          "ground": [
            567.5,
            1078
          ],
          "eyesCenter": [
            568,
            652
          ],
          "faceWidth": 88,
          "scale": 0.6784037558685446
        },
        "heartHold": {
          "atlas": "gestures",
          "crop": [
            820,
            556,
            203,
            524
          ],
          "ground": [
            915.5,
            1078
          ],
          "eyesCenter": [
            918,
            668
          ],
          "faceWidth": 80,
          "scale": 0.7048780487804878
        },
        "heartBlink": {
          "atlas": "gestures",
          "crop": [
            1172,
            557,
            201,
            523
          ],
          "ground": [
            1266.5,
            1078
          ],
          "eyesCenter": [
            1268,
            672
          ],
          "faceWidth": 72,
          "scale": 0.7118226600985221
        },
        "kneelBlink": {
          "atlas": "kneeling",
          "crop": [
            432,
            8,
            315,
            503
          ],
          "ground": [
            589.5,
            510
          ],
          "eyesCenter": [
            577,
            116
          ],
          "faceWidth": 119,
          "scale": 0.5158730158730159
        },
        "kneelWorried": {
          "atlas": "kneeling",
          "crop": [
            807,
            8,
            316,
            503
          ],
          "ground": [
            965,
            510
          ],
          "eyesCenter": [
            954,
            115
          ],
          "faceWidth": 120,
          "scale": 0.5158730158730159
        },
        "kneelSad": {
          "atlas": "kneeling",
          "crop": [
            1187,
            8,
            315,
            504
          ],
          "ground": [
            1344.5,
            511
          ],
          "eyesCenter": [
            1336,
            116
          ],
          "faceWidth": 120,
          "scale": 0.5158730158730159
        },
        "kneelAngry": {
          "atlas": "kneeling",
          "crop": [
            59,
            514,
            316,
            502
          ],
          "ground": [
            217,
            1015
          ],
          "eyesCenter": [
            205,
            622
          ],
          "faceWidth": 120,
          "scale": 0.5158730158730159
        },
        "kneelSurprised": {
          "atlas": "kneeling",
          "crop": [
            432,
            514,
            315,
            502
          ],
          "ground": [
            589.5,
            1015
          ],
          "eyesCenter": [
            577,
            620
          ],
          "faceWidth": 120,
          "scale": 0.5158730158730159
        },
        "kneelHappy": {
          "atlas": "kneeling",
          "crop": [
            809,
            515,
            316,
            501
          ],
          "ground": [
            967,
            1015
          ],
          "eyesCenter": [
            956,
            624
          ],
          "faceWidth": 120,
          "scale": 0.5158730158730159
        },
        "kneelEmbarrassed": {
          "atlas": "kneeling",
          "crop": [
            1188,
            515,
            315,
            501
          ],
          "ground": [
            1345.5,
            1015
          ],
          "eyesCenter": [
            1336,
            630
          ],
          "faceWidth": 119,
          "scale": 0.5158730158730159
        }
      },
      "poses": {
        "idle": {
          "default": "idle",
          "variants": {
            "blink": "blink",
            "laugh": "blink",
            "happy": "idle",
            "neutral": "idle",
            "relieved": "blink",
            "surprised": "surprised",
            "worried": "sad",
            "sad": "downcast",
            "crying": "downcast",
            "blush": "sad",
            "angry": "angry"
          }
        },
        "wave": {
          "default": "waveOut",
          "variants": {
            "blink": "waveBlink",
            "laugh": "waveBlink",
            "wink": "waveBlink"
          }
        },
        "heart": {
          "default": "heartHold",
          "variants": {
            "blink": "heartBlink",
            "laugh": "heartBlink"
          }
        },
        "dance1": {
          "default": "danceLeft"
        },
        "dance2": {
          "default": "danceRight"
        },
        "kneeling": {
          "default": "kneelHopeful",
          "variants": {
            "neutral": "kneelHopeful",
            "happy": "kneelHappy",
            "relieved": "kneelHappy",
            "blink": "kneelBlink",
            "laugh": "kneelHappy",
            "blush": "kneelHopeful",
            "worried": "kneelWorried",
            "sad": "kneelEmbarrassed",
            "crying": "kneelSad",
            "angry": "kneelAngry",
            "surprised": "kneelSurprised"
          }
        },
        "bow": {
          "default": "bent"
        },
        "gesturePrepare": {
          "default": "ready"
        },
        "gestureExtend": {
          "default": "followThrough"
        },
        "heartLow": {
          "default": "heartChest"
        }
      }
    }
  }
};
