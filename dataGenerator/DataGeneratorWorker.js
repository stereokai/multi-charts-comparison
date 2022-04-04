//#if _DEVELOPMENT
importScripts();
//#endif

workerpool.worker({
  generateDataSeries: (data) => {
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
  setTotalSamples: (data) => {
    setTotalSamples(data.samples);
  },
});
