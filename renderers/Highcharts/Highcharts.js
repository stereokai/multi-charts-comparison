// import { getBaseDate } from "@/Graphs/graphCommon";
import { graphEventsFactory } from "@/Graphs/graphEvents.js";
// import { channels } from "@/models/state.js";
// import { default as app } from "@/models/ui.js";
import Highcharts from "highcharts/highstock";
import Data from "highcharts/modules/data";
Data(Highcharts);

Highcharts.getJSON(
  "https://demo-live-data.highcharts.com/aapl-ohlcv.json",
  function (data) {
    // split the data set into ohlc and volume
    var ohlc = [],
      volume = [],
      dataLength = data.length,
      // set the allowed units for data grouping
      groupingUnits = [
        [
          "week", // unit name
          [1], // allowed multiples
        ],
        ["month", [1, 2, 3, 4, 6]],
      ],
      i = 0;

    for (i; i < dataLength; i += 1) {
      ohlc.push([
        data[i][0], // the date
        data[i][1], // open
        data[i][2], // high
        data[i][3], // low
        data[i][4], // close
      ]);

      volume.push([
        data[i][0], // the date
        data[i][5], // the volume
      ]);
    }

    // create the chart
    Highcharts.stockChart("chart", {
      rangeSelector: {
        selected: 1,
      },

      title: {
        text: "AAPL Historical",
      },

      yAxis: [
        {
          labels: {
            align: "right",
            x: -3,
          },
          title: {
            text: "OHLC",
          },
          height: "60%",
          lineWidth: 2,
          resize: {
            enabled: true,
          },
        },
        {
          labels: {
            align: "right",
            x: -3,
          },
          title: {
            text: "Volume",
          },
          top: "65%",
          height: "35%",
          offset: 0,
          lineWidth: 2,
        },
      ],

      tooltip: {
        split: true,
      },

      series: [
        {
          type: "candlestick",
          name: "AAPL",
          data: ohlc,
          dataGrouping: {
            units: groupingUnits,
          },
        },
        {
          type: "column",
          name: "Volume",
          data: volume,
          yAxis: 1,
          dataGrouping: {
            units: groupingUnits,
          },
        },
      ],
    });
  }
);

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

export function init(container) {}

export function update(dataset, timeSeries) {}

export function buildModel(incomingDataset, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}
