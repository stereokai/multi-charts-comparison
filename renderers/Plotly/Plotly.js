import { graphEventsFactory } from "@/Graphs/graphEvents.js";

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

let isInitialized = false;

export function init(container) {}

export function update(dataset, timeSeries) {
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
      t: 0,
      b: 0,
      l: 0,
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

  Plotly[!isInitialized ? "newPlot" : "react"]("chart", data, layout, {
    scrollZoom: true,
    responsive: true,
  });
  isInitialized = true;
}

export function buildModel(incomingDataset, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}

import * as Plotly from "plotly.js-dist";

var trace1 = {
  x: [0, 1, 2],
  y: [10, 11, 12],
  xaxis: "x",
  type: "scatter",
};

var trace2 = {
  x: [0, 1, 2],
  y: [100, 110, 120],
  xaxis: "x",
  yaxis: "y2",
  type: "scatter",
};

var trace3 = {
  x: [0, 1, 2],
  y: [1000, 1100, 1200],
  xaxis: "x",
  yaxis: "y3",
  type: "scatter",
};

var data = [trace1, trace2, trace3];
