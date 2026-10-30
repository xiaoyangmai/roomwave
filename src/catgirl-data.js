'use strict';
// Complete native catgirl figures. Source pixels and transparency are unchanged.
(()=>{
const costumes={
  "lily": {
    "catgirl": {
      "atlases": {
        "poses": {
          "url": "assets/catgirl-v1/lily-catgirl.lossless.webp",
          "width": 1254,
          "height": 1254
        }
      },
      "frames": {
        "idle": {
          "atlas": "poses",
          "crop": [
            94,
            6,
            183,
            323
          ],
          "ground": [
            167,
            326
          ],
          "eyesCenter": [
            166,
            75
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "happy": {
          "atlas": "poses",
          "crop": [
            396,
            5,
            184,
            325
          ],
          "ground": [
            475,
            327
          ],
          "eyesCenter": [
            474,
            75
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "surprised": {
          "atlas": "poses",
          "crop": [
            710,
            6,
            182,
            324
          ],
          "ground": [
            783,
            327
          ],
          "eyesCenter": [
            783,
            75
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "angry": {
          "atlas": "poses",
          "crop": [
            1017,
            4,
            185,
            327
          ],
          "ground": [
            1094,
            328
          ],
          "eyesCenter": [
            1093,
            75
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "wave": {
          "atlas": "poses",
          "crop": [
            76,
            338,
            204,
            336
          ],
          "ground": [
            167,
            671
          ],
          "eyesCenter": [
            165,
            414
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "heartLow": {
          "atlas": "poses",
          "crop": [
            403,
            339,
            171,
            335
          ],
          "ground": [
            475,
            671
          ],
          "eyesCenter": [
            474,
            414
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "heart": {
          "atlas": "poses",
          "crop": [
            702,
            341,
            186,
            332
          ],
          "ground": [
            785,
            670
          ],
          "eyesCenter": [
            785,
            416
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "dance1": {
          "atlas": "poses",
          "crop": [
            997,
            343,
            233,
            333
          ],
          "ground": [
            1105,
            673
          ],
          "eyesCenter": [
            1090,
            431
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "kneelShy": {
          "atlas": "poses",
          "crop": [
            95,
            682,
            171,
            246
          ],
          "ground": [
            167,
            925
          ],
          "eyesCenter": [
            167,
            751
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "kneelHappy": {
          "atlas": "poses",
          "crop": [
            406,
            682,
            165,
            247
          ],
          "ground": [
            475,
            926
          ],
          "eyesCenter": [
            474,
            751
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "kneelWorried": {
          "atlas": "poses",
          "crop": [
            711,
            682,
            175,
            247
          ],
          "ground": [
            784,
            926
          ],
          "eyesCenter": [
            784,
            751
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "kneelSad": {
          "atlas": "poses",
          "crop": [
            1026,
            686,
            166,
            243
          ],
          "ground": [
            1093,
            926
          ],
          "eyesCenter": [
            1093,
            756
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "dance2": {
          "atlas": "poses",
          "crop": [
            74,
            934,
            203,
            309
          ],
          "ground": [
            164,
            1240
          ],
          "eyesCenter": [
            171,
            1014
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558
        },
        "gesturePrepare": {
          "atlas": "poses",
          "crop": [
            393,
            941,
            173,
            303
          ],
          "ground": [
            476,
            1241
          ],
          "eyesCenter": [
            492,
            999
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558,
          "contact": [
            541,
            1035
          ]
        },
        "gestureExtend": {
          "atlas": "poses",
          "crop": [
            659,
            940,
            262,
            305
          ],
          "ground": [
            766,
            1242
          ],
          "eyesCenter": [
            791,
            1003
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558,
          "contact": [
            913,
            1024
          ]
        },
        "bow": {
          "atlas": "poses",
          "crop": [
            979,
            940,
            240,
            300
          ],
          "ground": [
            1122,
            1237
          ],
          "eyesCenter": [
            1020,
            1013
          ],
          "faceWidth": 58,
          "scale": 1.09717868338558,
          "contact": [
            1148,
            1066
          ],
          "eyeAngle": 25
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
    "catgirl": {
      "atlases": {
        "poses": {
          "url": "assets/catgirl-v1/mia-catgirl.lossless.webp",
          "width": 1254,
          "height": 1254
        }
      },
      "frames": {
        "idle": {
          "atlas": "poses",
          "crop": [
            113,
            15,
            164,
            341
          ],
          "ground": [
            181,
            353
          ],
          "eyesCenter": [
            176,
            83
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "happy": {
          "atlas": "poses",
          "crop": [
            414,
            14,
            166,
            342
          ],
          "ground": [
            483,
            353
          ],
          "eyesCenter": [
            477,
            83
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "surprised": {
          "atlas": "poses",
          "crop": [
            713,
            15,
            170,
            341
          ],
          "ground": [
            786,
            353
          ],
          "eyesCenter": [
            779,
            83
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "angry": {
          "atlas": "poses",
          "crop": [
            1018,
            14,
            166,
            342
          ],
          "ground": [
            1090,
            353
          ],
          "eyesCenter": [
            1083,
            83
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "wave": {
          "atlas": "poses",
          "crop": [
            91,
            373,
            204,
            342
          ],
          "ground": [
            171,
            712
          ],
          "eyesCenter": [
            176,
            443
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "heartLow": {
          "atlas": "poses",
          "crop": [
            405,
            374,
            185,
            341
          ],
          "ground": [
            477,
            712
          ],
          "eyesCenter": [
            477,
            445
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "heart": {
          "atlas": "poses",
          "crop": [
            702,
            378,
            185,
            337
          ],
          "ground": [
            786,
            712
          ],
          "eyesCenter": [
            780,
            454
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "dance1": {
          "atlas": "poses",
          "crop": [
            978,
            370,
            250,
            348
          ],
          "ground": [
            1101,
            715
          ],
          "eyesCenter": [
            1100,
            447
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "kneelShy": {
          "atlas": "poses",
          "crop": [
            110,
            732,
            175,
            223
          ],
          "ground": [
            176,
            952
          ],
          "eyesCenter": [
            176,
            796
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "kneelHappy": {
          "atlas": "poses",
          "crop": [
            408,
            732,
            182,
            223
          ],
          "ground": [
            477,
            952
          ],
          "eyesCenter": [
            477,
            794
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "kneelWorried": {
          "atlas": "poses",
          "crop": [
            708,
            731,
            181,
            225
          ],
          "ground": [
            780,
            953
          ],
          "eyesCenter": [
            780,
            795
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "kneelSad": {
          "atlas": "poses",
          "crop": [
            1016,
            737,
            184,
            222
          ],
          "ground": [
            1085,
            956
          ],
          "eyesCenter": [
            1085,
            801
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865
        },
        "dance2": {
          "atlas": "poses",
          "crop": [
            63,
            938,
            228,
            307
          ],
          "ground": [
            177,
            1242
          ],
          "eyesCenter": [
            170,
            1008
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865,
          "clipPolygon": [
            [
              63,
              938
            ],
            [
              110,
              938
            ],
            [
              110,
              959
            ],
            [
              291,
              959
            ],
            [
              291,
              1245
            ],
            [
              63,
              1245
            ]
          ]
        },
        "gesturePrepare": {
          "atlas": "poses",
          "crop": [
            391,
            961,
            159,
            286
          ],
          "ground": [
            487,
            1244
          ],
          "eyesCenter": [
            488,
            1020
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865,
          "contact": [
            536,
            1064
          ]
        },
        "gestureExtend": {
          "atlas": "poses",
          "crop": [
            687,
            962,
            227,
            285
          ],
          "ground": [
            787,
            1244
          ],
          "eyesCenter": [
            774,
            1020
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865,
          "contact": [
            908,
            1044
          ]
        },
        "bow": {
          "atlas": "poses",
          "crop": [
            998,
            974,
            241,
            264
          ],
          "ground": [
            1135,
            1235
          ],
          "eyesCenter": [
            1037,
            1037
          ],
          "faceWidth": 55,
          "scale": 1.0385756676557865,
          "contact": [
            1167,
            1078
          ],
          "eyeAngle": 25
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
    "catgirl": {
      "crop": [
        63,
        18,
        700,
        963
      ],
      "atlas": {
        "url": "assets/catgirl-v1/catgirl-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  },
  "mia": {
    "catgirl": {
      "crop": [
        852,
        18,
        662,
        963
      ],
      "atlas": {
        "url": "assets/catgirl-v1/catgirl-hangers.lossless.webp",
        "width": 1536,
        "height": 1024
      }
    }
  }
};
for(const id of ['lily','mia']){Object.assign(window.outfitSpriteData[id],costumes[id]);Object.assign(window.wardrobeHangers[id].frames,hangers[id]);}
})();
