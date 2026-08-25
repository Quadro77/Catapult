import type { BakedGeometry } from './bake.ts'

export const BAKED: BakedGeometry = {
  "titleImages": [
    {
      "id": "bg",
      "key": "bg-building",
      "x": 643,
      "y": 364,
      "rotation": 0,
      "scale": 0.714,
      "depth": 1
    },
    {
      "id": "title",
      "key": "ui-title",
      "x": 654,
      "y": 165,
      "rotation": 0,
      "scale": 0.5200542786151454,
      "depth": 10
    },
    {
      "id": "lady",
      "key": "lady",
      "x": 1032,
      "y": 476,
      "rotation": 0,
      "scale": 0.721355356629047,
      "depth": 12
    },
    {
      "id": "sling",
      "key": "slingshot",
      "x": 217,
      "y": 488,
      "rotation": 0,
      "scale": 0.35924657794500753,
      "depth": 12
    },
    {
      "id": "img-1786865887876",
      "key": "cat-fly",
      "x": 646,
      "y": 385,
      "rotation": 0,
      "scale": 0.4,
      "depth": 15
    }
  ],
  "titleButtons": [
    {
      "id": "play",
      "x": 644,
      "y": 611,
      "rotation": 0
    },
    {
      "id": "editor",
      "x": 216,
      "y": 66,
      "rotation": 0
    }
  ],
  "levels": {
    "brownstone-1": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.5421875,
          "ny": 0.11527777777777778,
          "nw": 0.06328125,
          "nh": 0.1375
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.69296875,
          "ny": 0.10833333333333334,
          "nw": 0.065625,
          "nh": 0.14305555555555555
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.85078125,
          "ny": 0.10694444444444444,
          "nw": 0.06640625,
          "nh": 0.14166666666666666
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.5421875,
          "ny": 0.35,
          "nw": 0.065625,
          "nh": 0.1388888888888889
        },
        {
          "id": "f1b1",
          "floor": 1,
          "bay": 1,
          "nx": 0.69140625,
          "ny": 0.35,
          "nw": 0.0671875,
          "nh": 0.14166666666666666
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.84921875,
          "ny": 0.3486111111111111,
          "nw": 0.0671875,
          "nh": 0.14166666666666666
        },
        {
          "id": "f2b0",
          "floor": 2,
          "bay": 0,
          "nx": 0.54453125,
          "ny": 0.5805555555555556,
          "nw": 0.06015625,
          "nh": 0.13472222222222222
        },
        {
          "id": "f2b1",
          "floor": 2,
          "bay": 1,
          "nx": 0.6921875,
          "ny": 0.5847222222222223,
          "nw": 0.0640625,
          "nh": 0.14166666666666666
        },
        {
          "id": "f2b2",
          "floor": 2,
          "bay": 2,
          "nx": 0.84765625,
          "ny": 0.5791666666666667,
          "nw": 0.06640625,
          "nh": 0.14722222222222223
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1257,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          2000,
          3600
        ],
        "visibleMs": [
          2000,
          3200
        ],
        "maxConcurrent": 3,
        "catcherChance": 0.4,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 243,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 1500,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 9,
      "angerLimit": 6
    },
    "adobe": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.50234375,
          "ny": 0.23472222222222222,
          "nw": 0.0421875,
          "nh": 0.09027777777777778
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.89140625,
          "ny": 0.10138888888888889,
          "nw": 0.05625,
          "nh": 0.12222222222222222
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.70234375,
          "ny": 0.10694444444444444,
          "nw": 0.05546875,
          "nh": 0.1125
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.60625,
          "ny": 0.4013888888888889,
          "nw": 0.05625,
          "nh": 0.1388888888888889
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.77265625,
          "ny": 0.35694444444444445,
          "nw": 0.05625,
          "nh": 0.1388888888888889
        },
        {
          "id": "w5",
          "floor": 0,
          "bay": 5,
          "nx": 0.40625,
          "ny": 0.6611111111111111,
          "nw": 0.0625,
          "nh": 0.1388888888888889
        },
        {
          "id": "w6",
          "floor": 0,
          "bay": 6,
          "nx": 0.4796875,
          "ny": 0.4527777777777778,
          "nw": 0.04765625,
          "nh": 0.10694444444444444
        },
        {
          "id": "w7",
          "floor": 0,
          "bay": 7,
          "nx": 0.55859375,
          "ny": 0.6527777777777778,
          "nw": 0.05703125,
          "nh": 0.11944444444444445
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1240,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          1900,
          3420
        ],
        "visibleMs": [
          1900,
          3040
        ],
        "maxConcurrent": 2,
        "catcherChance": 0.45,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 200,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 1600,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 14,
      "angerLimit": 5
    },
    "machiya": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.84765625,
          "ny": 0.6319444444444444,
          "nw": 0.0625,
          "nh": 0.125
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.56953125,
          "ny": 0.2569444444444444,
          "nw": 0.0625,
          "nh": 0.125
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.7359375,
          "ny": 0.20972222222222223,
          "nw": 0.0625,
          "nh": 0.125
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.4921875,
          "ny": 0.6208333333333333,
          "nw": 0.0625,
          "nh": 0.1388888888888889
        },
        {
          "id": "f1b1",
          "floor": 1,
          "bay": 1,
          "nx": 0.61875,
          "ny": 0.6194444444444445,
          "nw": 0.0625,
          "nh": 0.1388888888888889
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.76171875,
          "ny": 0.625,
          "nw": 0.0625,
          "nh": 0.1388888888888889
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1240,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          1800,
          3240
        ],
        "visibleMs": [
          1800,
          2880
        ],
        "maxConcurrent": 2,
        "catcherChance": 0.5,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 200,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 1700,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 19,
      "angerLimit": 4
    },
    "chalet": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.57109375,
          "ny": 0.4361111111111111,
          "nw": 0.05078125,
          "nh": 0.09583333333333334
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.6203125,
          "ny": 0.23055555555555557,
          "nw": 0.05234375,
          "nh": 0.09583333333333334
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.71796875,
          "ny": 0.21388888888888888,
          "nw": 0.05625,
          "nh": 0.10416666666666667
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.54765625,
          "ny": 0.6208333333333333,
          "nw": 0.059375,
          "nh": 0.1388888888888889
        },
        {
          "id": "f1b1",
          "floor": 1,
          "bay": 1,
          "nx": 0.8484375,
          "ny": 0.4083333333333333,
          "nw": 0.05859375,
          "nh": 0.10416666666666667
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.68984375,
          "ny": 0.41388888888888886,
          "nw": 0.0578125,
          "nh": 0.1
        },
        {
          "id": "w6",
          "floor": 0,
          "bay": 6,
          "nx": 0.86328125,
          "ny": 0.6361111111111111,
          "nw": 0.05703125,
          "nh": 0.10972222222222222
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1240,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          1700,
          3060
        ],
        "visibleMs": [
          1700,
          2720
        ],
        "maxConcurrent": 1,
        "catcherChance": 0.55,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 200,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 1800,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 24,
      "angerLimit": 3
    },
    "chateau": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.5578125,
          "ny": 0.11666666666666667,
          "nw": 0.0546875,
          "nh": 0.12222222222222222
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.6015625,
          "ny": 0.33055555555555555,
          "nw": 0.05546875,
          "nh": 0.1388888888888889
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.7171875,
          "ny": 0.30277777777777776,
          "nw": 0.06171875,
          "nh": 0.1486111111111111
        },
        {
          "id": "f0b3",
          "floor": 0,
          "bay": 3,
          "nx": 0.840625,
          "ny": 0.04027777777777778,
          "nw": 0.0546875,
          "nh": 0.12222222222222222
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.48984375,
          "ny": 0.35694444444444445,
          "nw": 0.0546875,
          "nh": 0.1361111111111111
        },
        {
          "id": "f1b1",
          "floor": 1,
          "bay": 1,
          "nx": 0.48828125,
          "ny": 0.6097222222222223,
          "nw": 0.0546875,
          "nh": 0.1361111111111111
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.7171875,
          "ny": 0.5916666666666667,
          "nw": 0.0546875,
          "nh": 0.1361111111111111
        },
        {
          "id": "f1b3",
          "floor": 1,
          "bay": 3,
          "nx": 0.86328125,
          "ny": 0.5763888888888888,
          "nw": 0.0546875,
          "nh": 0.1361111111111111
        },
        {
          "id": "w8",
          "floor": 0,
          "bay": 8,
          "nx": 0.8640625,
          "ny": 0.2777777777777778,
          "nw": 0.0625,
          "nh": 0.1388888888888889
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1240,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          1600,
          2880
        ],
        "visibleMs": [
          1600,
          2560
        ],
        "maxConcurrent": 1,
        "catcherChance": 0.6,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 200,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 1900,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 29,
      "angerLimit": 2
    },
    "palace": {
      "windows": [
        {
          "id": "f0b0",
          "floor": 0,
          "bay": 0,
          "nx": 0.55546875,
          "ny": 0.3138888888888889,
          "nw": 0.05703125,
          "nh": 0.09861111111111111
        },
        {
          "id": "f0b1",
          "floor": 0,
          "bay": 1,
          "nx": 0.66015625,
          "ny": 0.19027777777777777,
          "nw": 0.065625,
          "nh": 0.12777777777777777
        },
        {
          "id": "f0b2",
          "floor": 0,
          "bay": 2,
          "nx": 0.78984375,
          "ny": 0.16805555555555557,
          "nw": 0.065625,
          "nh": 0.12777777777777777
        },
        {
          "id": "f1b0",
          "floor": 1,
          "bay": 0,
          "nx": 0.4546875,
          "ny": 0.5902777777777778,
          "nw": 0.05,
          "nh": 0.11527777777777778
        },
        {
          "id": "f1b2",
          "floor": 1,
          "bay": 2,
          "nx": 0.79296875,
          "ny": 0.5402777777777777,
          "nw": 0.065625,
          "nh": 0.14444444444444443
        },
        {
          "id": "w6",
          "floor": 0,
          "bay": 6,
          "nx": 0.4671875,
          "ny": 0.3277777777777778,
          "nw": 0.05390625,
          "nh": 0.11388888888888889
        }
      ],
      "bounds": {
        "groundY": 686,
        "wallRight": 1240,
        "wallTop": 0
      },
      "director": {
        "popInterval": [
          1500,
          2700
        ],
        "visibleMs": [
          1500,
          2400
        ],
        "maxConcurrent": 1,
        "catcherChance": 0.65,
        "pool": [
          "oldLady",
          "dogCatcher"
        ]
      },
      "slingshot": {
        "origin": {
          "x": 200,
          "y": 600
        },
        "maxPull": 132,
        "power": 8,
        "gravity": 2000,
        "ghostT": 0.25
      },
      "lives": 3,
      "bonusEvery": 34,
      "angerLimit": 1
    }
  }
}
