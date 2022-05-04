const DATA_GENERATOR_TASKS = {
  generateDataSeries: "generateDataSeries",
  setTotalSamples: "setTotalSamples",
};

function getDataTaskConfig(channel, samples) {
  return {
    name: DATA_GENERATOR_TASKS.generateDataSeries,
    data: {
      channel,
      samples,
    },
  };
}
