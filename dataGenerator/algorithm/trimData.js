// function limitArray(array, min, max, limitFactor = 1) {
//   const tmin = min * (1 - limitFactor);
//   const tmax = max * (1 - limitFactor);

//   array = array.map((value) => {
//     const fix = Math.max(tmin, Math.min(tmax), value);
//     console.log(value, fix, tmin, tmax, min, max);
//     return fix;
//   });

//   return { data: array, dataMin: min, dataMax: max };
// }

function limitArray(array, min, max, limitFactor = 1) {
  min = Infinity;
  max = -Infinity;

  return {
    data: array.map((value) => {
      min = Math.min(min, value);
      max = Math.max(max, value);
      return value * (1 - limitFactor);
    }),
    dataMin: min,
    dataMax: max,
  };
}
