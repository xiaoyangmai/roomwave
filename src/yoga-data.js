'use strict';
// Native yoga costumes; full painted expressions and clothes-only hangers.
(() => {
  const costumes={
  "lily": {
    "yoga": {
      "atlases": {
        "standing": {
          "url": "assets/yoga-v1/lily-yoga-standing-v2.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/yoga-v1/lily-yoga-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            136,
            11,
            186,
            495
          ],
          "ground": [
            211,
            500
          ],
          "eyesCenter": [
            212,
            96
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            490,
            11,
            184,
            496
          ],
          "ground": [
            568,
            501
          ],
          "eyesCenter": [
            568,
            96
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            873,
            11,
            184,
            496
          ],
          "ground": [
            950,
            501
          ],
          "eyesCenter": [
            955,
            96
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1247,
            10,
            186,
            497
          ],
          "ground": [
            1323,
            501
          ],
          "eyesCenter": [
            1328,
            96
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            114,
            515,
            206,
            492
          ],
          "ground": [
            206,
            1001
          ],
          "eyesCenter": [
            207,
            604
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            502,
            516,
            182,
            492
          ],
          "ground": [
            577,
            1002
          ],
          "eyesCenter": [
            575,
            604
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            862,
            513,
            204,
            495
          ],
          "ground": [
            955,
            1002
          ],
          "eyesCenter": [
            955,
            616
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1184,
            512,
            327,
            496
          ],
          "ground": [
            1341,
            1002
          ],
          "eyesCenter": [
            1345,
            614
          ],
          "faceWidth": 65,
          "scale": 0.7157464212678937
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            136,
            42,
            200,
            387
          ],
          "ground": [
            216,
            423
          ],
          "eyesCenter": [
            214,
            142
          ],
          "faceWidth": 74,
          "scale": 0.6824146981627297
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            490,
            41,
            200,
            387
          ],
          "ground": [
            569,
            422
          ],
          "eyesCenter": [
            570,
            142
          ],
          "faceWidth": 74,
          "scale": 0.6824146981627297
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            876,
            41,
            200,
            387
          ],
          "ground": [
            955,
            422
          ],
          "eyesCenter": [
            955,
            142
          ],
          "faceWidth": 74,
          "scale": 0.6824146981627297
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1234,
            41,
            200,
            387
          ],
          "ground": [
            1314,
            422
          ],
          "eyesCenter": [
            1312,
            141
          ],
          "faceWidth": 74,
          "scale": 0.6824146981627297
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            42,
            437,
            295,
            546
          ],
          "ground": [
            211,
            977
          ],
          "eyesCenter": [
            210,
            534
          ],
          "faceWidth": 72,
          "scale": 0.6616257088846881
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            481,
            443,
            210,
            535
          ],
          "ground": [
            575,
            972
          ],
          "eyesCenter": [
            578,
            535
          ],
          "faceWidth": 72,
          "scale": 0.6616257088846881,
          "contact": [
            513,
            575
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            841,
            445,
            301,
            532
          ],
          "ground": [
            939,
            971
          ],
          "eyesCenter": [
            939,
            535
          ],
          "faceWidth": 72,
          "scale": 0.6616257088846881,
          "contact": [
            1105,
            642
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1216,
            451,
            226,
            523
          ],
          "ground": [
            1367,
            968
          ],
          "eyesCenter": [
            1264,
            554
          ],
          "faceWidth": 65,
          "scale": 0.6616257088846881,
          "contact": [
            1357,
            603
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
    "yoga": {
      "atlases": {
        "standing": {
          "url": "assets/yoga-v1/mia-yoga-standing.lossless.webp",
          "width": 1536,
          "height": 1024
        },
        "actions": {
          "url": "assets/yoga-v1/mia-yoga-actions.lossless.webp",
          "width": 1536,
          "height": 1024
        }
      },
      "frames": {
        "idle": {
          "atlas": "standing",
          "crop": [
            170,
            22,
            132,
            484
          ],
          "ground": [
            234,
            500
          ],
          "eyesCenter": [
            233,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "happy": {
          "atlas": "standing",
          "crop": [
            522,
            22,
            133,
            484
          ],
          "ground": [
            587,
            500
          ],
          "eyesCenter": [
            586,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "surprised": {
          "atlas": "standing",
          "crop": [
            876,
            22,
            132,
            484
          ],
          "ground": [
            940,
            500
          ],
          "eyesCenter": [
            940,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "angry": {
          "atlas": "standing",
          "crop": [
            1227,
            22,
            133,
            484
          ],
          "ground": [
            1293,
            500
          ],
          "eyesCenter": [
            1292,
            91
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "wave": {
          "atlas": "standing",
          "crop": [
            126,
            522,
            222,
            477
          ],
          "ground": [
            220,
            993
          ],
          "eyesCenter": [
            219,
            598
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "heartLow": {
          "atlas": "standing",
          "crop": [
            498,
            522,
            174,
            479
          ],
          "ground": [
            585,
            995
          ],
          "eyesCenter": [
            583,
            597
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "heart": {
          "atlas": "standing",
          "crop": [
            852,
            507,
            176,
            495
          ],
          "ground": [
            940,
            996
          ],
          "eyesCenter": [
            940,
            603
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "dance1": {
          "atlas": "standing",
          "crop": [
            1221,
            512,
            271,
            494
          ],
          "ground": [
            1317,
            1000
          ],
          "eyesCenter": [
            1311,
            606
          ],
          "faceWidth": 56,
          "scale": 0.7322175732217573
        },
        "kneelShy": {
          "atlas": "actions",
          "crop": [
            159,
            12,
            184,
            415
          ],
          "ground": [
            250,
            421
          ],
          "eyesCenter": [
            247,
            104
          ],
          "faceWidth": 78,
          "scale": 0.6356968215158925
        },
        "kneelHappy": {
          "atlas": "actions",
          "crop": [
            509,
            12,
            184,
            415
          ],
          "ground": [
            600,
            421
          ],
          "eyesCenter": [
            598,
            104
          ],
          "faceWidth": 78,
          "scale": 0.6356968215158925
        },
        "kneelWorried": {
          "atlas": "actions",
          "crop": [
            854,
            12,
            185,
            416
          ],
          "ground": [
            947,
            422
          ],
          "eyesCenter": [
            946,
            105
          ],
          "faceWidth": 78,
          "scale": 0.6356968215158925
        },
        "kneelSad": {
          "atlas": "actions",
          "crop": [
            1204,
            11,
            185,
            417
          ],
          "ground": [
            1297,
            422
          ],
          "eyesCenter": [
            1295,
            106
          ],
          "faceWidth": 78,
          "scale": 0.6356968215158925
        },
        "dance2": {
          "atlas": "actions",
          "crop": [
            102,
            429,
            334,
            579
          ],
          "ground": [
            201,
            1002
          ],
          "eyesCenter": [
            209,
            511
          ],
          "faceWidth": 64,
          "scale": 0.6151142355008787
        },
        "gesturePrepare": {
          "atlas": "actions",
          "crop": [
            477,
            430,
            252,
            576
          ],
          "ground": [
            594,
            1000
          ],
          "eyesCenter": [
            594,
            511
          ],
          "faceWidth": 64,
          "scale": 0.6151142355008787,
          "contact": [
            510,
            549
          ],
          "mirror": true
        },
        "gestureExtend": {
          "atlas": "actions",
          "crop": [
            811,
            433,
            337,
            573
          ],
          "ground": [
            939,
            1000
          ],
          "eyesCenter": [
            938,
            513
          ],
          "faceWidth": 64,
          "scale": 0.6151142355008787,
          "contact": [
            1104,
            589
          ]
        },
        "bow": {
          "atlas": "actions",
          "crop": [
            1222,
            432,
            218,
            572
          ],
          "ground": [
            1354,
            998
          ],
          "eyesCenter": [
            1274,
            513
          ],
          "faceWidth": 58,
          "scale": 0.6151142355008787,
          "contact": [
            1376,
            586
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
    "yoga": {
      "crop": [
        253,
        13,
        518,
        1459
      ],
      "atlas": {
        "url": "assets/yoga-v1/lily-yoga-hanger.lossless.webp",
        "width": 1024,
        "height": 1536
      }
    }
  },
  "mia": {
    "yoga": {
      "crop": [
        400,
        10,
        454,
        1214
      ],
      "atlas": {
        "url": "assets/yoga-v1/mia-yoga-hanger.lossless.webp",
        "width": 1254,
        "height": 1254
      }
    }
  }
};
  const treeFrames={
    lily:{atlas:'tree',crop:[183,6,596,1483],ground:[525,1477],eyesCenter:[515,208],faceWidth:176,scale:.23},
    mia:{atlas:'tree',crop:[222,13,493,1468],ground:[529,1468],eyesCenter:[516,174],faceWidth:166,scale:.23},
  };
  for(const id of ['lily','mia']){
    const yoga=costumes[id].yoga;
    yoga.atlases.tree={url:`assets/stream-controls-v1/${id}-yoga-tree-v1.lossless.webp`,width:1024,height:1536};
    yoga.frames.tree=treeFrames[id];yoga.poses.yoga={default:'tree',variants:{}};
    Object.assign(window.outfitSpriteData[id],costumes[id]);Object.assign(window.wardrobeHangers[id].frames,hangers[id]);
  }
})();
