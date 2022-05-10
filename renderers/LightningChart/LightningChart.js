import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
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
let minX, maxX;

export const graphEvents = graphEventsFactory();
let lastEvent = null;
let hasInitialized = false;
export function on(...args) {
  graphEvents.on(...args);
}

export function init(container) {
  lastEvent = {
    timestamp: performance.now(),
  };
  const dashboard = lightningChart()
    .Dashboard({
      container,
      numberOfColumns: 1,
      numberOfRows: channels.length,
      theme: Themes.light,
    })
    .setSplitterStyle(emptyLine);

  graphs = channels.map((channel, i) => {
    return addChannel(dashboard, channel, i);
  });

  graphs[graphs.length - 1].xAxis.onScaleChange((start, end) => {
    if (start < minX || end > maxX) {
      requestAnimationFrame(() => {
        graphs.forEach((graph) =>
          graph.chart.setMouseInteractionWheelZoom(false)
        );
        graphs[graphs.length - 1].xAxis.setInterval(minX, maxX, false, true);
        setTimeout(() => {
          graphs.forEach((graph) =>
            graph.chart.setMouseInteractionWheelZoom(true)
          );
        }, 1000);
      });
    }
    graphs.forEach((graph, i) => {
      graph.yAxis.setInterval(channels[i].min, channels[i].max);
    });
  });

  synchronizeAxisIntervals(...graphs.map((ch) => ch.xAxis));

  window.graphs = graphs;
  window.dashboard = dashboard;
  container.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
    },
    {
      passive: false,
    }
  );
}

export function update(dataset, timeSeries) {
  if (hasInitialized) {
    lastEvent = {
      timestamp: performance.now(),
    };
  }

  dataset.forEach((channelData, i) => {
    let graph = graphs[i];

    if (dataset.length < graphs.length) {
      return; // TODO: ask lcjs how to add/remove rows to dashboard
      const channelIndex = graphs.length + i;
      graphs.push(addChannel(dashboard, channels[channelIndex], channelIndex));
      graph = graphs[channelIndex];
    }

    graph.series.clear();
    graph.series.addArraysXY(timeSeries, channelData.data);
    channels[i].min = channelData.min;
    channels[i].max = channelData.max;
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
  if (timeSeries) {
    minX = timeSeries[0];
    maxX = timeSeries[timeSeries.length - 1];
  }
  xAxis.setInterval(minX, maxX, false, true);

  requestAnimationFrame(() => {
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
  });
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
