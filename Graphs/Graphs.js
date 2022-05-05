import {
  addChannels,
  channels,
  regenerateAllChannels,
  removeChannels,
} from "@/models/state.js";
import { renderer } from "@/router.js";

const chart = await import(`@/renderers/${renderer}/${renderer}.js`);

let prevSamplesPerChannel = 0;
let prevSamplesPerSecond = 0;
let timeSeries;

export { default as EVENTS } from "./graphEvents.js";

export function on(...args) {
  chart.on(...args);
}

export function initGraph(samplesPerChannel, samplesPerSecond) {
  prevSamplesPerChannel = samplesPerChannel;
  setSamplesPerSecond(samplesPerSecond);

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

function setSamplesPerSecond(samplesPerSecond) {
  prevSamplesPerSecond = samplesPerSecond;
  timeSeries = generateTimestamps(prevSamplesPerChannel, samplesPerSecond);
}

function generateTimestamps(totalSamples, samplesPerSecond) {
  const baseDate = new Date();
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
  if (samplesPerChannel !== prevSamplesPerChannel) {
    prevSamplesPerChannel = samplesPerChannel;

    if (samplesPerSecond !== prevSamplesPerSecond) {
      setSamplesPerSecond(samplesPerSecond);
    }

    operation = () => regenerateAllChannels(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    operation = () => addChannels(channelsChange, samplesPerChannel);
  }

  setChartData(operation);
}
