//#if _DEVELOPMENT
//importScripts();
//#endif

workerpool.worker({
  [DATA_GENERATOR.generateDataSeries]: (data) => {
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
  [DATA_GENERATOR.generateDataWithExtrapolations]: (data) => {
    return generateDataWithExtrapolations(
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
  [DATA_GENERATOR.setTotalSamples]: (data) => {
    setTotalSamples(data.samples);
  },
  [DATA_GENERATOR.limitArray]: (data) => {
    return limitArray(
      data.channelData,
      data.dataMin,
      data.dataMax,
      data.limitFactor
    );
  },
});
