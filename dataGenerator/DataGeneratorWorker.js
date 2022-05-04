//#if _DEVELOPMENT
//importScripts();
//#endif

workerpool.worker({
  [DATA_GENERATOR_TASKS.generateDataSeries]: (data) => {
    return generateDataSeries(
      data.samples,
      data.channel.min,
      data.channel.max,
      data.channel.smoothing,
      data.channel.displacement,
      data.channel.start,
      data.channel.end
    );
  },
  [DATA_GENERATOR_TASKS.setTotalSamples]: (data) => {
    setTotalSamples(data.samples);
  },
});
