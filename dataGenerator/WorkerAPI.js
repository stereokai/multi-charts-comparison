//#if _DEVELOPMENT
//importScripts();
//#endif

workerpool.worker({
  [DATA_GENERATOR.generateDataSeries]: (data) => {
    return generateDataSeries(
      data.samples,
      data.dataMin,
      data.dataMax,
      data.smoothing,
      data.displacement,
      data.displacementRatio,
      data.easingType,
      data.start,
      data.end
    );
  },
  [DATA_GENERATOR.generateDataWithExtrapolations]: (data) => {
    return generateDataWithExtrapolations(
      data.replaceWith,
      data.samples,
      data.dataMin,
      data.dataMax,
      data.smoothing,
      data.displacement,
      data.displacementRatio,
      data.easingType,
      data.start,
      data.end
    );
  },
  [DATA_GENERATOR.setTotalSamples]: (data) => {
    setTotalSamples(data.samples);
  },
  [DATA_GENERATOR.limitArray]: (data) => {
    return limitArray(data.array, data.dataMin, data.dataMax, data.limitFactor);
  },
  [DATA_GENERATOR.punchHolesInArray]: (data) => {
    return punchHolesInArray(data.array, data.replaceWith);
  },
});
