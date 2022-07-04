import {
  addChannels,
  channels,
  regenerateAllChannels,
  removeChannels,
} from "@/models/state.js";
import { renderer } from "@/router.js";
import { getBaseDate } from "./graphCommon";
export { default as EVENTS } from "./graphEvents.js";
export { renderer };

const chart = await import(`@/renderers/${renderer}/${renderer}.js`);

let prevSamplesPerChannel = 0;
let prevSamplesPerSecond = 0;
let timeSeries;

export function on(...args) {
  (chart.on || chart.graphEvents.on)(...args);
}

export function initGraph(container, samplesPerChannel, samplesPerSecond) {
  onTotalSamplesChange(samplesPerChannel, samplesPerSecond);
  chart.init(container);
  chart.graphEvents.dataOperationStarted();
  setChartData(() => regenerateAllChannels(samplesPerChannel));
}

function updateInteralState(dataset) {
  for (let i = 0; i < dataset.length; i++) {
    const channelIndex = channels.length - dataset.length + i;
    const channelData = dataset[i];

    channels[channelIndex].min = channelData.min;
    channels[channelIndex].max = channelData.max;
  }
}

function updateChart(dataset) {
  chart.update(dataset, timeSeries);
}

function setChartData(dataOperation) {
  chart.showLoading();
  dataOperation()
    .then((dataset) => {
      chart.graphEvents.dataOperationEnded();
      updateInteralState(dataset);
      updateChart(dataset);
    })
    .catch((err) => {
      console.log("Operation error", err);
    })
    .finally(() => {
      chart.hideLoading();
    });
}

function onTotalSamplesChange(samplesPerChannel, samplesPerSecond) {
  prevSamplesPerChannel = samplesPerChannel;
  prevSamplesPerSecond = samplesPerSecond;

  timeSeries = generateTimeseries(
    samplesPerChannel,
    samplesPerSecond,
    chart.baseDate
  );
}

function generateTimeseries(
  totalSamples,
  samplesPerSecond,
  firstTimestamp = getBaseDate()
) {
  const samplesPerTimestampInSeconds = 1 / samplesPerSecond;
  const samplesPerTimestampInMilliseconds = samplesPerTimestampInSeconds * 1000;

  const timestamps = new Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    timestamps[i] = firstTimestamp + i * samplesPerTimestampInMilliseconds;
  }
  return timestamps;
}

export function onSettingChange(
  numberOfChannels,
  samplesPerSecond,
  totalSamples
) {
  const samplesPerChannel = Math.floor(totalSamples / numberOfChannels);
  const channelsChange = numberOfChannels - channels.length;
  let operation;

  // Channels removed
  if (channelsChange < 0) {
    removeChannels(channelsChange);
    updateChart();
    return;
  }

  // No. of samples per channel changed
  if (
    samplesPerChannel !== prevSamplesPerChannel ||
    samplesPerSecond !== prevSamplesPerSecond
  ) {
    onTotalSamplesChange(samplesPerChannel, samplesPerSecond);
    chart.graphEvents.dataOperationStarted();
    operation = () => regenerateAllChannels(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    chart.graphEvents.dataOperationStarted();
    operation = () => addChannels(channelsChange, samplesPerChannel);
  }

  setChartData(operation);
}
