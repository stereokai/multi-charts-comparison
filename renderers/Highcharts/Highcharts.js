// import { getBaseDate } from "@/Graphs/graphCommon";
import { graphEventsFactory } from "@/Graphs/graphEvents.js";
// import { channels } from "@/models/state.js";
// import { default as app } from "@/models/ui.js";
import Highcharts from "highcharts/highstock";
import Data from "highcharts/modules/data";
Data(Highcharts);

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

export function init(container) {}

export function update(dataset, timeSeries) {
  const GAP = 5;
  const yAxis = [...Array(dataset.length)].map((_, i, all) => {
    const height = 100 / all.length - GAP / all.length;
    const top = i * (height + GAP / all.length);
    return {
      top: `${top}%`,
      height: `${height}%`,
    };
  });

  for (let i = 0; i < timeSeries.length; i++) {
    for (let j = 0; j < dataset.length; j++) {
      dataset[j].data[i] = [timeSeries[i], dataset[j].data[i]];
    }
  }

  const series = [...Array(dataset.length)].map((_, i, all) => {
    return {
      lineWidth: 1,
      name: `${i}`,
      data: dataset[i].data,
      yAxis: i,
    };
  });

  console.log("update", dataset, timeSeries, yAxis, series);

  Highcharts.stockChart("chart", {
    rangeSelector: {
      selected: 1,
    },
    yAxis,
    series,
    tooltip: {
      split: true,
    },
  });
}

export function buildModel(incomingDataset, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}
