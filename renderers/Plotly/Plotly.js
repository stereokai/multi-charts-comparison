import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import * as Plotly from "plotly.js-dist";

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

let lastEvent = null;
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

  timeSeries = timeSeries.map((timestamp) => new Date(timestamp));

  var data = dataset.map((channel, i, dataset) => ({
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
  }));

  data[data.length - 1].xaxis = "x";

  var layout = {
    margin: {
      t: 50,
      b: 0,
      l: 50,
      r: 0,
    },
    grid: {
      rows: data.length,
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
  } else {
    Plotly.react(chart, data, layout, {
      scrollZoom: true,
      responsive: true,
    });
  }
}

export function showLoading() {}
export function hideLoading() {}

function reportRenderEvent() {
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
