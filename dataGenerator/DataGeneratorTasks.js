const DATA_GENERATOR = {
  generateDataSeries: "generateDataSeries",
  generateDataWithExtrapolations: "generateDataWithExtrapolations",
  limitArray: "limitArray",
  setTotalSamples: "setTotalSamples",
  punchHolesInArray: "punchHolesInArray",
};

DATA_GENERATOR.getTaskConfig = {
  [DATA_GENERATOR.generateDataSeries]: (channel, samples) => ({
    channel,
    samples,
  }),
  [DATA_GENERATOR.generateDataWithExtrapolations]: (channel, samples) => ({
    channel,
    samples,
  }),
  [DATA_GENERATOR.limitArray]: (channel, channelData, limitFactor) => ({
    channel,
    channelData,
    limitFactor,
  }),
};

for (const taskName in DATA_GENERATOR.getTaskConfig) {
  const getTaskConfig = DATA_GENERATOR.getTaskConfig[taskName];
  DATA_GENERATOR.getTaskConfig[taskName] = (...args) => ({
    name: taskName,
    data: getTaskConfig(...args),
  });
}
