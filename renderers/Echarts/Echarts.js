import { channels } from "@/models/state.js";
import { throttle } from "@/utils.js";
import * as echarts from "echarts";
import { defaults } from "./echartsDefaults";
import { ECHARTS_EVENT_HANDLERS, graphEvents, on } from "./echartsEvents.js";
import { buildEchartsOptions } from "./echartsOptionsBuilder.js";

let chart;

export { on } from "./echartsEvents.js";

let hasInitialized = false;

export function init(container) {
  graphEvents.onBeforeDataUpdate();
  chart = echarts.init(container);

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
  if (hasInitialized) {
    graphEvents.onBeforeDataUpdate();
  } else {
    hasInitialized = true;
  }

  if (dataset) {
    dataset = buildModel(dataset, timeSeries);
  }

  const settings = buildEchartsOptions(channels, dataset);
  chart.setOption(Object.assign(defaults, settings), {
    replaceMerge: ["series", "yAxis", "xAxis", "grid"],
  });
}

export function buildModel(incomingDataset, timeSeries) {
  const outgoingDataset = {};

  for (let i = 0; i < incomingDataset.length; i++) {
    const channelNumber = channels.length - incomingDataset.length + i;
    const channel = incomingDataset[i];

    outgoingDataset[`channel_${channelNumber}`] = channel.data;
  }

  if (incomingDataset.length === channels.length) {
    outgoingDataset.timestamp = timeSeries;
  }

  return outgoingDataset;
}

export function showLoading() {
  chart.showLoading();
}
export function hideLoading() {
  chart.hideLoading();
}
