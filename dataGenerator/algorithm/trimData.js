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

  for (var i = 0; i < array.length; i++) {
    min = Math.min(min, array[i]);
    max = Math.max(max, array[i]);
    array[i] = array[i] * (1 - limitFactor);
  }

  return {
    data: array,
    dataMin: min,
    dataMax: max,
  };
}
