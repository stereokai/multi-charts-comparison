import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import * as Plotly from "plotly.js-dist";
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
  // buildModel(dataset, timeSeries);
  timeSeries = timeSeries.map((timestamp) => new Date(timestamp));
  let data = (chart && chart.data) || [];
  if (data.length > 0) data[data.length - 1].xaxis = "";
  dataset &&
    dataset.forEach((channel, i, dataset) => {
      i = channels.length - dataset.length + i;

      const trace = {
        x: timeSeries,
        y: channel.data,
        yaxis: !i ? "y" : `y${i + 1}`,
        type: "scattergl",
        mode: "lines",
        hoverinfo: "none",
        line: {
          shape: "spline",
          smoothing: 0,
          width: 1,
          simplify: false,
        },
      };

      data[i] = trace;
    });

  data.splice(channels.length, data.length - channels.length);

  data[data.length - 1].xaxis = "x";

  var layout = {
    margin: {
      t: 50,
      b: 0,
      l: 50,
      r: 0,
    },
    grid: {
      rows: channels.length,
      columns: 1,
      // pattern: "independent",
      // roworder: "bottom to top",
    },
    xaxis: { rangeslider: {} },
    yaxis: {
      fixedrange: true,
    },
    showlegend: false,
    annotations: false,
  };

  if (!hasInitialized) {
    Plotly.newPlot(chart, data, layout, {
      scrollZoom: true,
      responsive: true,
    });
    chart.on("plotly_afterplot", reportRenderEvent);

    chart.addEventListener("mousewheel", zoomHandler);
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
  } else {
    Plotly.react(chart, data, layout, {
      scrollZoom: true,
      responsive: true,
    });
  }
}

function zoomHandler() {
  !lastZoomStart && (lastZoomStart = performance.now());
  chart.removeEventListener("mousewheel", zoomHandler);
}

function buildModel(incomingDataset, timeSeries) {
  const outgoingDataset = [];

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

export function showLoading() {}
export function hideLoading() {}

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
