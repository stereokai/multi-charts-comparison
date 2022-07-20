import {
  addChannels,
  channels,
  getTransforms,
  regenerateAllChannels as regenerateAllChannelsOperation,
  removeChannels,
  transformAllChannels as transformAllChannelsOperation,
} from "@/models/state.js";
import { renderer } from "@/router.js";
import { getBaseDate, reverseInjection } from "./graphCommon";
export { default as EVENTS } from "./graphEvents.js";
export { renderer };
reverseInjection(regenerateAllChannels, transformAllChannels);

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

function updateInteralState(dataset, channelFilter) {
  for (let i = 0; i < channels.length; i++) {
    delete channels[i].hasTransforms;
  }

  const hasTransforms = !!getTransforms().length;

  if (channelFilter) {
    for (let i = 0, j = 0; i < channels.length && j < dataset.length; i++) {
      if (channelFilter(channels[i])) {
        const channelData = dataset[j++];
        channels[i].dataMin = channelData.dataMin;
        channels[i].dataMax = channelData.dataMax;
        if (hasTransforms) channels[i].hasTransforms = true;
      }
    }
  } else {
    for (let i = 0; i < dataset.length; i++) {
      const channelIndex = channels.length - dataset.length + i;
      const channelData = dataset[i];

      channels[channelIndex].dataMin = channelData.dataMin;
      channels[channelIndex].dataMax = channelData.dataMax;
      if (hasTransforms) channels[channelIndex].hasTransforms = true;
    }
  }
}

function updateChart(dataset, channelFilter) {
  chart.update(dataset, timeSeries, channelFilter);
}

function setChartData(dataOperation, channelFilter) {
  chart.showLoading();

  const operation = dataOperation().then((dataset) => {
    updateInteralState(dataset, channelFilter);
    updateChart(dataset, channelFilter);
    return dataset;
  });

  operation
    .catch((err) => {
      console.error("Operation error", err);
    })
    .finally(() => {
      chart.graphEvents.dataOperationEnded();
      chart.hideLoading();
    });

  return operation;
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
  samplesPerChannel = prevSamplesPerChannel,
  channelFilter
) {
  chart.graphEvents.dataOperationStarted();
  setChartData(
    () => regenerateAllChannelsOperation(samplesPerChannel, channelFilter),
    channelFilter
  );
}

export function transformAllChannels(
  samplesPerChannel = prevSamplesPerChannel,
  channelFilter
) {
  chart.graphEvents.dataOperationStarted();
  setChartData(
    () =>
      transformAllChannelsOperation(
        chart.api.getChannelData,
        samplesPerChannel,
        channelFilter
      ),
    channelFilter
  );
}

export function onSettingChange(
  numberOfChannels,
  samplesPerSecond,
  totalSamples,
  channelFilter
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
    operation = () =>
      regenerateAllChannelsOperation(samplesPerChannel, channelFilter);
  }

  // Channels added
  if (channelsChange > 0) {
    chart.graphEvents.dataOperationStarted();
    operation = () => addChannels(channelsChange, samplesPerChannel);
    channelFilter = false; // messes up calculation of adding channels
  }

  setChartData(operation, channelFilter);
}

export const { api } = chart;
