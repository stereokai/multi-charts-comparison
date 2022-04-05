import * as echarts from "echarts";
import {
  defaultChannels as channels,
  getRandomChannel,
} from "./channelsConfiguration.js";
import { dataOperation } from "./dataLayer.js";
import { defaults } from "./echartsDefaults";
import { buildEchartsOptions } from "./echartsOptionsBuilder.js";
import { throttle } from "./utils.js";

let chart;
let prevSamplesPerChannel = 0;
let prevSamplesPerSecond = 0;
let timeSeries;

let onBeforeDataUpdate = () => {};
export function on(...args) {
  if (args[0] === "onBeforeDataUpdate") {
    onBeforeDataUpdate = args[1];
    return;
  }

  chart.on(...args);
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

export function initEcharts(samplesPerChannel, samplesPerSecond) {
  prevSamplesPerChannel = samplesPerChannel;
  setSamplesPerSecond(samplesPerSecond);
  chart = echarts.init(document.querySelector("#chart"));
  window.chart = chart;
  window.addEventListener(
    "resize",
    throttle(() => {
      chart.resize();
    }, 150)
  );

  setChartData(regenerateAllChannels(samplesPerChannel));
}

function buildEchartsDatasetArrays(channelsDataArray) {
  const dataset = {};

  for (let i = 0; i < channelsDataArray.length; i++) {
    const channelNumber = channels.length - channelsDataArray.length + i;

    dataset[`channel_${channelNumber}`] = channelsDataArray[i];
  }

  if (channelsDataArray.length === channels.length) {
    dataset.timestamp = timeSeries;
  }

  return dataset;
}

function updateEcharts(dataset) {
  onBeforeDataUpdate(channels);
  const settings = buildEchartsOptions(channels, dataset);
  chart.setOption(Object.assign(defaults, settings), {
    replaceMerge: ["series", "yAxis", "xAxis", "grid"],
  });
  channels.forEach((channels) => {
    if (channels.data) {
      channels.data.length = 0;
      channels.data = null;
      delete channels.data;
    }
  });
}

function setChartData(dataOperation) {
  chart.showLoading();
  dataOperation
    .then(buildEchartsDatasetArrays)
    .then(updateEcharts)
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

function getGenerateDataSeriesTask(channel, samples = prevSamplesPerChannel) {
  return {
    name: "generateDataSeries",
    data: {
      channel,
      samples,
    },
  };
}

function regenerateAllChannels(samplesPerChannel = null) {
  return dataOperation((queueTask) => {
    for (let i = 0; i < channels.length; i++) {
      if (channels.data) {
        channels.data.length = 0;
        channels.data = null;
        delete channels.data;
      }
      queueTask(getGenerateDataSeriesTask(channels[i], samplesPerChannel));
    }
  });
}

function addChannels(numberOfChannelsToAdd, shouldGenerateData = true) {
  if (numberOfChannelsToAdd < 1) {
    throw new Error("Can't add 0 channels");
  }

  return dataOperation((queueTask) => {
    for (let i = 0; i < numberOfChannelsToAdd; i++) {
      const channelNumber = channels.length + 1;
      if (shouldGenerateData) {
        queueTask(
          getGenerateDataSeriesTask(
            channels[channels.push(getRandomChannel(channelNumber)) - 1]
          )
        );
      } else {
        channels.push(getRandomChannel(channelNumber));
      }
    }
  });
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
    channels.splice(channels.length + channelsChange, -channelsChange);
    updateEcharts();
    return;
  }

  // No. of samples per channel changed
  if (samplesPerChannel !== prevSamplesPerChannel) {
    prevSamplesPerChannel = samplesPerChannel;

    if (samplesPerSecond !== prevSamplesPerSecond) {
      setSamplesPerSecond(samplesPerSecond);
    }

    operation = regenerateAllChannels(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    operation = addChannels(channelsChange);
  }

  setChartData(operation);
}
