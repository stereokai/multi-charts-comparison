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
let signals;
let isLoaded = false;
export function on() {}

export function init() {
  const dashboard = lightningChart()
    .Dashboard({
      container: document.querySelector("#chart"),
      numberOfColumns: 1,
      numberOfRows: channels.length,
      theme: Themes.darkGold,
    })
    .setSplitterStyle(emptyLine);

  signals = channels.map((signal, iSignal) => {
    const chart = dashboard
      .createChartXY({
        columnIndex: 0,
        rowIndex: iSignal,

        columnSpan: 1,
        rowSpan: 1,
        disableAnimations: true,
      })
      .setTitle("")
      .setPadding({ top: 0, bottom: 0 })
      // .setAutoCursorMode(AutoCursorModes.disabled)
      .setBackgroundStrokeStyle(emptyLine);
    // .setMouseInteractions(false);

    const axisX = chart
      .getDefaultAxisX()
      .setTickStrategy(AxisTickStrategies.Empty)
      .setStrokeStyle(emptyLine);
    // .setScrollStrategy(AxisScrollStrategies.progressive)
    // .setInterval();
    const axisY = chart
      .getDefaultAxisY()
      .setMouseInteractions(false)
      .setChartInteractions(false)
      .setChartInteractionFitByDrag(false)
      .setChartInteractionZoomByDrag(false)
      .setChartInteractionPanByDrag(false)
      .setChartInteractionZoomByWheel(false)
      .setTickStrategy(AxisTickStrategies.Empty)
      .setStrokeStyle(emptyLine)
      .setTitle(signal.name)
      .setTitleRotation(0)
      .setThickness(60)
      .setAnimationZoom(undefined);
    // .fit()
    // .onScaleChange((...args) => {
    //   console.log(...args);
    // });

    const series = chart.addLineSeries({
      dataPattern: { pattern: "ProgressiveX" },
      automaticColorIndex: iSignal,
    });
    // .setName(`Channel ${iSignal + 1}`)
    // .setDataCleaning({ minDataPointCount: 10000 });

    return { chart, series, axisX, axisY };
  });
  // const channelTop = signals[0];

  // channelTop.chart;
  // .setTitle("Multi-channel real-time monitoring (10 chs, 1000 Hz)")
  // .setPadding({ top: 8 });

  synchronizeAxisIntervals(...signals.map((ch) => ch.axisX));
  // axisX.setInterval(0, 100);
}

export function update(dataset, timeSeries) {
  if (isLoaded) return;
  isLoaded = true;
  signals.forEach((signal, i) => {
    // if (i < 5) return;
    // console.log("adding", dataset[i]);
    console.log(dataset[i].length, timeSeries.length);
    signal.series.addArraysXY(timeSeries, dataset[i]);
    // signal.series.addArrayY(dataset[i]);
  });

  const channelBottom = signals[signals.length - 1];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 1);
  baseDate.setHours(22);
  const axisX = channelBottom.axisX.setTickStrategy(
    AxisTickStrategies.DateTime,
    (ticks) => ticks.setDateOrigin(baseDate)
    // .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine))
    // .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine))
  );
  axisX.onScaleChange(() => {
    signals.forEach((signal, i) => {
      signal.axisY.setInterval(channels[i].min, channels[i].max);
    });
  });
  // axisX.setInterval(
  //     signals[9].series.getXMin(),
  //     signals[9].series.getXMax(),
  //     false,
  //     true
  //   );
}

export function buildModel(channelsDataArray, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}
