import * as echarts from "echarts";
import { channels } from "../../models/state.js";
import { throttle } from "../../utils.js";
import { defaults } from "./echartsDefaults";
import { ECHARTS_EVENT_HANDLERS, eventHandlers, on } from "./echartsEvents.js";
import { buildEchartsOptions } from "./echartsOptionsBuilder.js";

let chart;

export { on } from "./echartsEvents.js";

export function init() {
  chart = echarts.init(document.querySelector("#chart"));

  Object.entries(ECHARTS_EVENT_HANDLERS).forEach(([event, handler]) => {
    on(chart, event, handler);
  });

  window.addEventListener(
    "resize",
    throttle(() => {
      chart.resize();
    }, 150)
  );
}

export function update(dataset, timeSeries) {
  eventHandlers.onBeforeDataUpdate();
  if (dataset) {
    dataset = buildModel(dataset, timeSeries);
  }

  const settings = buildEchartsOptions(channels, dataset);
  chart.setOption(Object.assign(defaults, settings), {
    replaceMerge: ["series", "yAxis", "xAxis", "grid"],
  });
}

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

export function showLoading() {
  chart.showLoading();
}
export function hideLoading() {
  chart.hideLoading();
}
