const DEFAULT_DISPLACEMENT = 20; // arbitrary. Alternative: (start + end) / 2;

let desiredPoints, iterations, actualPoints, base, powerOf2Plus1;
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
function getEasingStep(iteration) {
  const f = 1 / iterations;
  return iteration * f;
}
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
