import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import * as Plotly from "plotly.js-dist";
import * as config from "./plotly.config.js";
export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

let lastEvent = null,
  lastZoomStart = null;
let hasInitialized = false;
let chart;

export function init(container) {
  chart = container;
  lastEvent = {
    timestamp: performance.now(),
  };
}

export function update(dataset, timeSeries) {
  if (hasInitialized) {
    lastEvent = {
      timestamp: performance.now(),
    };
  }

  let data = (chart && chart.data) || [];

  // Remove main xaxis in case we'll be adding new channels
  if (data.length > 0) data[data.length - 1].xaxis = "";

  if (dataset) {
    // Plotly doesn't accept unix timestamps, so we need to convert them to dates
    timeSeries = timeSeries.map((timestamp) => new Date(timestamp));

    // Create new traces for each channel
    dataset.forEach((channel, i, dataset) => {
      i = channels.length - dataset.length + i;

      data[i] = Object.assign(
        {
          x: timeSeries,
          y: channel.data,
          yaxis: !i ? "y" : `y${i + 1}`,
        },
        config.trace
      );
    });
  }

  // Remove channels if no data is provided
  data.splice(channels.length, data.length - channels.length);

  // Set main xaxis
  data[data.length - 1].xaxis = "x";

  const layout = Object.assign({}, config.layout);
  layout.grid.rows = channels.length;

  if (!hasInitialized) {
    Plotly.newPlot(chart, data, layout, config.options);
    initEvents();
  } else {
    Plotly.react(chart, data, layout, config.options);
  }
}

function initEvents() {
  chart.addEventListener("mousewheel", zoomHandler);

  chart.on("plotly_afterplot", reportRenderEvent);

  chart.on("plotly_relayout", () => {
    if (lastZoomStart) {
      graphEvents.zoomPan({
        type: GRAPH_EVENTS.zoomPan,
        duration: (performance.now() - lastZoomStart) / 1000,
      });

      lastZoomStart = null;
      chart.addEventListener("mousewheel", zoomHandler);
    }
  });
}

function zoomHandler() {
  !lastZoomStart && (lastZoomStart = performance.now());
  chart.removeEventListener("mousewheel", zoomHandler);
}

function reportRenderEvent() {
  if (!lastEvent) return;
  const duration = (performance.now() - lastEvent.timestamp) / 1000;
  if (!hasInitialized) {
    hasInitialized = true;
    graphEvents.init({
      duration,
      type: GRAPH_EVENTS.init,
    });
  } else {
    graphEvents.render({
      duration,
      type: GRAPH_EVENTS.render,
    });
  }
  lastEvent = null;
}

export function showLoading() {}
export function hideLoading() {}
