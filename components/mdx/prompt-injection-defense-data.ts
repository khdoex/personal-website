export const defenseBehavior = [
  { key: 'baseline', label: 'baseline', target: 0.438, injected: 0.979, sequence: [1, 37, 3, 54, 1] },
  { key: 'hierarchy', label: 'hierarchy prompt', target: 0.469, injected: 0.760, sequence: [23, 13, 9, 51, 0] },
  { key: 'fixed', label: 'fixed delimiters', target: 0.844, injected: 0.333, sequence: [64, 9, 8, 15, 0] },
  { key: 'xml', label: 'xml escape', target: 0.510, injected: 0.490, sequence: [49, 0, 0, 47, 0] },
  { key: 'xml-reminder', label: 'xml + reminder', target: 0.875, injected: 0.125, sequence: [84, 0, 0, 12, 0] },
  { key: 'hash', label: 'hashed boundary', target: 0.792, injected: 0.208, sequence: [76, 0, 0, 20, 0] },
  { key: 'hash-reminder', label: 'hash + reminder*', target: 0.948, injected: 0.052, sequence: [91, 0, 0, 5, 0] },
] as const

export const displacementRetention = {
  primary: [0,0.504,0.485,0.574,0.538,0.532,0.430,0.483,0.518,0.551,0.699,0.617,0.626,0.575,0.605,0.715,0.653,0.725,0.728,0.598,0.593,0.644,0.658,0.657,0.626,0.620,0.564,0.581,0.592],
  otherLo: [0,0.334,0.362,0.534,0.527,0.550,0.470,0.506,0.526,0.575,0.708,0.612,0.629,0.581,0.580,0.639,0.571,0.674,0.692,0.577,0.619,0.669,0.655,0.671,0.631,0.614,0.564,0.555,0.554],
  otherHi: [0,0.946,0.959,0.925,0.921,0.864,0.969,0.926,0.896,0.916,0.965,0.853,0.832,0.869,0.880,0.963,0.969,0.964,0.891,0.825,0.782,0.785,0.753,0.758,0.767,0.757,0.728,0.785,0.909],
} as const

export const defenseTransfer = {
  baseline: {
    label: 'baseline',
    task: [0.5,0.004,0.015,0.006,0.009,0,0.471,0.497,0.259,0.529,0.569,0.583,0.598,0.682,0.708,0.829,0.976,0.985,1,1,0.999,0.998,0.997,0.988,0.983,0.980,0.978,0.956,0.865],
    taskNull: [0.5,0.611,0.614,0.617,0.618,0.623,0.623,0.628,0.620,0.629,0.629,0.618,0.615,0.614,0.611,0.611,0.610,0.621,0.624,0.631,0.629,0.627,0.626,0.624,0.621,0.619,0.622,0.614,0.610],
    wrapper: [0.5,0.652,0.630,0.679,0.738,0.802,0.882,0.956,0.999,1,0.996,0.987,0.993,1,0.998,1,1,1,1,1,1,1,1,1,1,1,1,0.999,0.995],
    wrapperNull: [0.5,0.650,0.641,0.646,0.647,0.648,0.661,0.668,0.682,0.682,0.680,0.678,0.680,0.684,0.687,0.690,0.692,0.692,0.692,0.688,0.686,0.687,0.686,0.689,0.683,0.681,0.680,0.680,0.678],
    taskCrossover: 13,
    wrapperCrossover: 3,
  },
  primary: {
    label: 'xml + reminder',
    task: [0.5,0,0,0.001,0,0,0.150,0.296,0.161,0.383,0.725,0.736,0.768,0.895,0.726,0.904,0.993,1,1,1,0.920,0.924,0.924,0.903,0.899,0.904,0.896,0.863,0.664],
    taskNull: [0.5,0.617,0.615,0.620,0.617,0.614,0.615,0.616,0.615,0.611,0.610,0.611,0.613,0.613,0.624,0.619,0.617,0.618,0.620,0.612,0.605,0.611,0.611,0.603,0.605,0.603,0.601,0.599,0.603],
    wrapper: [0.5,0.618,0.627,0.636,0.708,0.703,0.903,0.868,0.952,0.957,0.981,0.981,0.997,0.998,1,1,1,1,1,1,0.999,0.994,0.993,0.977,0.953,0.966,0.971,0.967,0.947],
    wrapperNull: [0.5,0.645,0.649,0.651,0.647,0.652,0.660,0.665,0.683,0.680,0.675,0.675,0.693,0.690,0.696,0.692,0.696,0.708,0.703,0.704,0.707,0.706,0.710,0.691,0.680,0.680,0.685,0.683,0.684],
    taskCrossover: 10,
    wrapperCrossover: 4,
  },
} as const

export const detectorRates = [
  { label: 'published injection', value: 0.458, lo: 0.396, hi: 0.521 },
  { label: 'matched imperative', value: 0.469, lo: 0.406, hi: 0.531 },
  { label: 'clean external data', value: 0, lo: 0, hi: 0 },
] as const

export const detectorResidualRisk = [
  { label: 'baseline', missed: 54, caught: 40, suppressed: 1 },
  { label: 'hierarchy', missed: 45, caught: 28, suppressed: 23 },
  { label: 'fixed delimiters', missed: 26, caught: 6, suppressed: 64 },
  { label: 'xml escape', missed: 33, caught: 14, suppressed: 49 },
  { label: 'xml + reminder', missed: 10, caught: 2, suppressed: 84 },
  { label: 'hashed boundary', missed: 18, caught: 2, suppressed: 76 },
  { label: 'hash + reminder', missed: 5, caught: 0, suppressed: 91 },
] as const

export const behaviorGeometryJoin = [
  { label: 'late displacement norm', value: 0.125, lo: -4.497, hi: 5.199, digits: 2 },
  { label: 'log retention vs baseline', value: -0.002, lo: -0.074, hi: 0.082, digits: 2 },
  { label: 'alignment with other cases', value: 0.010, lo: -0.020, hi: 0.041, digits: 2 },
] as const
