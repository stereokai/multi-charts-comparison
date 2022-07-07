function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

const DEFAULT_DISPLACEMENT = 20; // arbitrary. Alternative: (start + end) / 2;
let desiredPoints, iterations, actualPoints, base, powerOf2Plus1;

function ease(easingType, ...args) {
  return easings[easingType](...args);
}
function getEasingStep(iteration) {
  const f = 1 / iterations;
  return iteration * f;
}
const easings = [
  // Bounce to completion
  function easeOutBounce(t) {
    const scaledTime = t / 1;

    if (scaledTime < 1 / 2.75) {
      return 7.5625 * scaledTime * scaledTime;
    } else if (scaledTime < 2 / 2.75) {
      const scaledTime2 = scaledTime - 1.5 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
    } else if (scaledTime < 2.5 / 2.75) {
      const scaledTime2 = scaledTime - 2.25 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
    } else {
      const scaledTime2 = scaledTime - 2.625 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
    }
  },

  // Decelerating to zero velocity
  function easeOutCubic(t) {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  // Fast snap to backwards point then slow resolve to finish
  function easeOutBack(t, magnitude = 1.70158) {
    const scaledTime = t / 1 - 1;

    return (
      scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
    );
  },
];

function setupAlgorithm() {
  iterations = Math.floor(Math.log(desiredPoints * 2 - 1) / Math.log(2));
  powerOf2Plus1 = 2 ** iterations + 1;
  actualPoints = desiredPoints + (desiredPoints % 2 ? 1 : 0); // Make sure there's always a midpoint.
}

function setTotalSamples(samples) {
  if (samples === desiredPoints) {
    return;
  }

  desiredPoints = samples;
  setupAlgorithm();
}

function generateDataSeries(
  samples,
  min = getRandom(0, 50),
  max = getRandom(50, 100),
  smoothing = 1,
  displacement = null,
  displacementRatio = 0.5,
  easingType,
  start,
  end
) {
  start = typeof start !== "undefined" ? start : getRandom(min, max);
  end = typeof end !== "undefined" ? end : getRandom(min, max);

  if (typeof samples === "number") {
    setTotalSamples(samples);
  }

  let vDis =
    (displacement == "function" && displacement(start, end)) ||
    (typeof displacement == "number" && displacement) ||
    (start + end) / 2 ||
    start - end ||
    DEFAULT_DISPLACEMENT;
  let maxDis = vDis;

  const shouldUseEase = !!easings[easingType];

  let iteration = 1;
  const data = new Array(actualPoints).fill(0);
  data[0] = start;

  while (iteration <= iterations) {
    const skipDistance = ~~(powerOf2Plus1 / 2 ** iteration);
    const skips = 2 ** iteration - 1;

    for (
      let i = skipDistance;
      i <= skips * skipDistance;
      i += skipDistance * 2
    ) {
      if (i > actualPoints - 1) {
        break;
      }

      const a = data[i - skipDistance];
      let b = data[i + skipDistance];

      // The fallback to `end` is only needed for the first iteration,
      // because (at line 63) we stop calculating midpoints past the number of desired points.
      // Unless the number of desired points is exactly a power of 2,
      // the end point will be out of the scope of the base array.
      typeof b === "undefined" && (b = end);
      let midpoint = (a + b) / 2;
      const isPositiveDisplacement = Math.random() < displacementRatio;

      data[i] = isPositiveDisplacement
        ? Math.min(max, midpoint + vDis)
        : Math.max(min, midpoint - vDis);

      // Ensure a flat line when start and end are the same.
      if (start === end && iteration === 1) {
        data[i] = midpoint;
      }
    }

    if (shouldUseEase) {
      vDis = (1 - ease(easingType, getEasingStep(iteration))) * maxDis;
    } else {
      vDis = vDis * 2 ** -smoothing;
    }

    iteration++;
  }

  return { data, dataMin: min, dataMax: max };
}

function punchHolesInArray(array, replaceWith) {
  const occurence = 30;
  const oFuzziness = 10;
  const oMin = ((occurence - oFuzziness) / 100) * array.length;
  const oMax = ((occurence + oFuzziness) / 100) * array.length;

  const sampleScale = 10;
  const sampleSize = (sampleScale / 100) * array.length;
  const sFuzziness = 20;

  const spacingOccurence = 100 - occurence;
  const spaceSize =
    (spacingOccurence / (occurence / sampleScale) / 100) * array.length * 0.9; // arbitrarily reduce spacing to maximize occurrence

  const getRandomSampleSize = () =>
    Math.round(
      getRandom(
        sampleSize - (sFuzziness / 100) * sampleSize,
        sampleSize + (sFuzziness / 100) * sampleSize
      )
    );

  const getRandomSpacing = () =>
    Math.round(
      getRandom(
        spaceSize - (sFuzziness / 100) * spaceSize,
        spaceSize + (sFuzziness / 100) * spaceSize
      )
    );

  // let isLastSectionASample = Math.random() >= 0.5; // Heads or tails
  let isLastSectionASample = true;
  const oLimit = Math.round(getRandom(oMin, oMax));
  let count = 0;
  let i = 0;

  while (count < oLimit && i <= array.length) {
    if (isLastSectionASample) {
      const space = getRandomSpacing();
      const adjustedSpaceSize =
        i + space > array.length ? array.length - i : space;
      i = i + adjustedSpaceSize;
      isLastSectionASample = false;
    } else {
      const sampleSize = getRandomSampleSize();
      let adjustedSampleSize = Math.min(
        i + sampleSize > array.length ? array.length - i : sampleSize,
        oLimit - count
      );

      if (typeof replaceWith === "undefined") {
        const prevItem = array[i - 1];
        const nextItem = array[i + adjustedSampleSize + 1];
        const step = (nextItem - prevItem) / adjustedSampleSize;

        array.splice(
          i,
          adjustedSampleSize,
          ...[...new Array(adjustedSampleSize)].map((_, j) => {
            return prevItem + step * j;
          })
        );
      } else {
        array.splice(
          i,
          adjustedSampleSize,
          ...new Array(adjustedSampleSize).fill(NaN)
        );
      }

      count += adjustedSampleSize;
      i += adjustedSampleSize;
      isLastSectionASample = true;
    }

    if (count >= array.length || i >= array.length) {
      break;
    }
  }

  return array;
}

// Same signature as generateDataSeries
function generatePunchedDataSeries(...args) {
  const { data, dataMin, dataMax } = generateDataSeries(...args);
  return { data: punchHolesInArray(data), dataMin, dataMax };
}
