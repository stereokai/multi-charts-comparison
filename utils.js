export function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export function throttle(callback, limit) {
  let waiting = false;
  return () => {
    if (!waiting) {
      callback.apply(this, arguments);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}

export function debounce(callback, limit) {
  let timeout = null;
  return () => {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      clearTimeout(timeout);
      timeout = null;
      callback.apply(this, arguments);
    }, limit);
  };
}
