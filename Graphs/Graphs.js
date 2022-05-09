import {
  addChannels,
  channels,
  regenerateAllChannels,
  removeChannels,
} from "@/models/state.js";
import { renderer } from "@/router.js";
export { default as EVENTS } from "./graphEvents.js";
export { renderer };

const chart = await import(`@/renderers/${renderer}/${renderer}.js`);

let prevSamplesPerChannel = 0;
let prevSamplesPerSecond = 0;
let timeSeries;

export function on(...args) {
  chart.on(...args);
}

export function initGraph(samplesPerChannel, samplesPerSecond) {
  onTotalSamplesChange(samplesPerChannel, samplesPerSecond);
  chart.init();
  setChartData(() => regenerateAllChannels(samplesPerChannel));
}

function updateChart(dataset) {
  chart.update(dataset, timeSeries);
}

function setChartData(dataOperation) {
  chart.showLoading();
  dataOperation()
    .then(updateChart)
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

  timeSeries = generateTimeseries(samplesPerChannel, samplesPerSecond);
}

function generateTimeseries(totalSamples, samplesPerSecond) {
  // const baseDate = new Date();
  const baseDate = new Date(0);
  baseDate.setDate(baseDate.getDate() - 1);
  const timestamp = baseDate.setHours(22);

  const samplesPerTimestampInSeconds = 1 / samplesPerSecond;
  const samplesPerTimestampInMilliseconds = samplesPerTimestampInSeconds * 1000;

  const timestamps = new Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    timestamps[i] = timestamp + i * samplesPerTimestampInMilliseconds;
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
    operation = () => regenerateAllChannels(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    operation = () => addChannels(channelsChange, samplesPerChannel);
  }

  setChartData(operation);
}
