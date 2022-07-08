const easings = [
  // Slow start and end, two bounces sandwich a fast motion
  function easeInOutElastic(t, magnitude = 0.65) {
    const p = 1 - magnitude;

    if (t === 0 || t === 1) {
      return t;
    }

    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 1;

    const s = (p / (2 * Math.PI)) * Math.asin(1);

    if (scaledTime < 1) {
      return (
        -0.5 *
        (Math.pow(2, 10 * scaledTime1) *
          Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
      );
    }

    return (
      Math.pow(2, -10 * scaledTime1) *
        Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    );
  },
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

function ease(easingType, ...args) {
  return easings[easingType](...args);
}

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
}

// Bounce increasing in velocity until completion
function easeInBounce(t) {
  return 1 - easeOutBounce(1 - t);
}
