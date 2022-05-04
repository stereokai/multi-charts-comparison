import * as echarts from "echarts";
import { defaults } from "../echarts/echartsDefaults";
import { buildEchartsOptions } from "../echarts/echartsOptionsBuilder.js";
import { channels } from "../models/state.js";
import { throttle } from "../utils.js";

let chart;

export function buildModel(channelsDataArray, timeSeries) {
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

export function update(dataset, timeSeries) {
  if (dataset) {
    dataset = buildModel(dataset, timeSeries);
  }

  const settings = buildEchartsOptions(channels, dataset);
  chart.setOption(Object.assign(defaults, settings), {
    replaceMerge: ["series", "yAxis", "xAxis", "grid"],
  });
}

export function init() {
  chart = echarts.init(document.querySelector("#chart"));

  window.addEventListener(
    "resize",
    throttle(() => {
      chart.resize();
    }, 150)
  );
}

export function on(...args) {
  chart.on(...args);
}

export function showLoading() {
  chart.showLoading();
}

export function hideLoading() {
  chart.hideLoading();
}
