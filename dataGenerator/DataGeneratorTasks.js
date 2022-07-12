const DATA_GENERATOR_TASKS = {
  generateDataSeries: "generateDataSeries",
  generatePunchedDataSeries: "generatePunchedDataSeries",
  limitArray: "limitArray",
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

function getPunchedDataTaskConfig(channel, samples) {
  return {
    name: DATA_GENERATOR_TASKS.generatePunchedDataSeries,
    data: {
      channel,
      samples,
    },
  };
}

function getLimitArrayTaskConfig(channel, channelData, limitFactor) {
  return {
    name: DATA_GENERATOR_TASKS.limitArray,
    data: {
      channel,
      channelData,
      limitFactor,
    },
  };
}
