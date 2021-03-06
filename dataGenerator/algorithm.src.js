function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

const DEFAULT_DISPLACEMENT = 20; // arbitrary. Alternative: (start + end) / 2;
let desiredPoints, iterations, actualPoints, base, powerOf2Plus1;

function setupAlgorithm() {
  iterations = Math.floor(Math.log(desiredPoints * 2 - 1) / Math.log(2));
  powerOf2Plus1 = 2 ** iterations + 1;
  actualPoints = desiredPoints + (desiredPoints % 2 ? 1 : 0);
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
  start,
  end
) {
  start = typeof start !== "undefined" ? start : getRandom(min, max);
  end = typeof end !== "undefined" ? end : getRandom(min, max);

  if (typeof samples === "number") {
    setTotalSamples(samples);
  }

  let iteration = 1;
  const data = new Array(actualPoints).fill(0);
  data[0][1] = start;

  let vDis =
    (displacement == "function" && displacement(start, end)) ||
    (typeof displacement == "number" && displacement) ||
    DEFAULT_DISPLACEMENT;

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
      const isPositiveDisplacement = Math.random() < 0.5;

      data[i] = isPositiveDisplacement
        ? Math.min(max, midpoint + vDis)
        : Math.max(min, midpoint - vDis);
    }

    vDis = vDis * 2 ** -smoothing;
    iteration++;
  }

  return data;
}
