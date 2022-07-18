const DATA_GENERATOR = {
  generateDataSeries: "generateDataSeries",
  generateDataWithExtrapolations: "generateDataWithExtrapolations",
  limitArray: "limitArray",
  punchHolesInArray: "punchHolesInArray",
  setTotalSamples: "setTotalSamples",
};

DATA_GENERATOR.getTaskConfig = {
  [DATA_GENERATOR.generateDataSeries]: (channel, samples) => ({
    dataMin: channel.dataMin,
    dataMax: channel.dataMax,
    smoothing: channel.smoothing,
    displacement: channel.displacement,
    displacementRatio: channel.displacementRatio,
    easingType: channel.easingType,
    start: channel.start,
    end: channel.end,
    samples,
  }),
  [DATA_GENERATOR.generateDataWithExtrapolations]: (
    channel,
    samples,
    replaceWith
  ) => ({
    ...DATA_GENERATOR.getTaskConfig[DATA_GENERATOR.generateDataSeries](
      channel,
      samples
    ).data,
    replaceWith,
  }),
  [DATA_GENERATOR.limitArray]: (channel, channelData, limitFactor) => ({
    array: channelData,
    dataMin: channel.dataMin,
    dataMax: channel.dataMax,
    limitFactor,
  }),
  [DATA_GENERATOR.punchHolesInArray]: (array, replaceWith) => ({
    array,
    replaceWith,
  }),
};

for (const taskName in DATA_GENERATOR.getTaskConfig) {
  const getTaskConfig = DATA_GENERATOR.getTaskConfig[taskName];
  DATA_GENERATOR.getTaskConfig[taskName] = (...args) => ({
    name: taskName,
    data: getTaskConfig(...args),
  });
}
