import {
  addChannels,
  channels,
  regenerateAllChannels as regenerateAllChannelsOperation,
  removeChannels,
  transformAllChannels as transformAllChannelsOperation,
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

  if (channels.length) regenerateAllChannels(samplesPerChannel);
}

function updateInteralState(dataset) {
  for (let i = 0; i < dataset.length; i++) {
    const channelIndex = channels.length - dataset.length + i;
    const channelData = dataset[i];

    channels[channelIndex].dataMin = channelData.dataMin;
    channels[channelIndex].dataMax = channelData.dataMax;
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
      //#if _DEVELOPMENT
      console.log("Operation error", err);
      //#endif
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

export function regenerateAllChannels(
  samplesPerChannel = prevSamplesPerChannel
) {
  chart.graphEvents.dataOperationStarted();
  setChartData(() => regenerateAllChannelsOperation(samplesPerChannel));
}

export function transformAllChannels(
  samplesPerChannel = prevSamplesPerChannel
) {
  chart.graphEvents.dataOperationStarted();
  setChartData(() =>
    transformAllChannelsOperation(chart.api.getChannelData, samplesPerChannel)
  );
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
    operation = () => regenerateAllChannelsOperation(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    chart.graphEvents.dataOperationStarted();
    operation = () => addChannels(channelsChange, samplesPerChannel);
  }

  setChartData(operation);
}

export const { api } = chart;
