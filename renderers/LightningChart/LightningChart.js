import { channels } from "@/models/state.js";
import {
  AxisTickStrategies,
  emptyLine,
  lightningChart,
  synchronizeAxisIntervals,
  Themes,
} from "@arction/lcjs";

let chart, series, xAxis;
const DEFAULT_X_RANGE_MS = 30 * 1000;
let graphs;
let isLoaded = false;
export function on() {}

export function init() {
  const dashboard = lightningChart()
    .Dashboard({
      container: document.querySelector("#chart"),
      numberOfColumns: 1,
      numberOfRows: channels.length,
      theme: Themes.light,
    })
    .setSplitterStyle(emptyLine);

  graphs = channels.map((channel, i) => {
    return addChannel(dashboard, channel, i);
  });

  synchronizeAxisIntervals(...graphs.map((ch) => ch.xAxis));

  window.graphs = graphs;
  window.dashboard = dashboard;
}

export function update(dataset, timeSeries) {
  graphs.forEach((signal, i) => {
    // if (i < 5) return;
    // console.log("adding", dataset[i]);
    console.log(dataset[i].length, timeSeries.length);
    signal.series.clear();
    signal.series.addArraysXY(timeSeries, dataset[i]);
    // signal.series.addArrayY(dataset[i]);
  });

  const channelBottom = graphs[graphs.length - 1];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 1);
  baseDate.setHours(22);
  const xAxis = channelBottom.xAxis.setTickStrategy(
    AxisTickStrategies.DateTime,
    (ticks) => ticks.setDateOrigin(baseDate)
    // .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine))
    // .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine))
  );
  xAxis.setInterval(
    timeSeries[0],
    timeSeries[timeSeries.length - 1],
    false,
    true
  );
  xAxis.onScaleChange(() => {
    graphs.forEach((signal, i) => {
      signal.yAxis.setInterval(channels[i].min, channels[i].max);
    });
  });
  // xAxis.setInterval(
  //     graphs[9].series.getXMin(),
  //     graphs[9].series.getXMax(),
  //     false,
  //     true
  //   );
}

export function buildModel(channelsDataArray, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}

function addChannel(dashboard, channel, channelIndex) {
  const chart = dashboard
    .createChartXY({
      columnIndex: 0,
      rowIndex: channelIndex,
      columnSpan: 1,
      rowSpan: 1,
      disableAnimations: true,
    })
    .setTitle("")
    .setPadding({ top: 0, bottom: 0 })
    // .setAutoCursorMode(AutoCursorModes.disabled)
    .setBackgroundStrokeStyle(emptyLine);
  // .setMouseInteractions(false);

  const xAxis = chart
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.Empty)
    .setStrokeStyle(emptyLine);

  const yAxis = chart
    .getDefaultAxisY()
    .setMouseInteractions(false)
    .setChartInteractions(false)
    .setTickStrategy(AxisTickStrategies.Empty)
    .setStrokeStyle(emptyLine)
    .setTitle(channel.name)
    .setTitleRotation(0)
    .setThickness(60)
    .setAnimationZoom(undefined);
  // .fit()
  // .onScaleChange((...args) => {
  //   console.log(...args);
  // });

  const series = chart.addLineSeries({
    dataPattern: { pattern: "ProgressiveX" },
    automaticColorIndex: channelIndex,
  });
  // .setName(`Channel ${iSignal + 1}`)
  // .setDataCleaning({ minDataPointCount: 10000 });

  return { chart, series, xAxis, yAxis };
}
