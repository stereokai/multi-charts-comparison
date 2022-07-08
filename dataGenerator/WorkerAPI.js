//#if _DEVELOPMENT
//importScripts();
//#endif

workerpool.worker({
  [DATA_GENERATOR_TASKS.generateDataSeries]: (data) => {
    return generateDataSeries(
      data.samples,
      data.channel.dataMin,
      data.channel.dataMax,
      data.channel.smoothing,
      data.channel.displacement,
      data.channel.displacementRatio,
      data.channel.easingType,
      data.channel.start,
      data.channel.end
    );
  },
  [DATA_GENERATOR_TASKS.generatePunchedDataSeries]: (data) => {
    return generatePunchedDataSeries(
      data.samples,
      data.channel.dataMin,
      data.channel.dataMax,
      data.channel.smoothing,
      data.channel.displacement,
      data.channel.displacementRatio,
      data.channel.easingType,
      data.channel.start,
      data.channel.end
    );
  },
  [DATA_GENERATOR_TASKS.setTotalSamples]: (data) => {
    setTotalSamples(data.samples);
  },
});
