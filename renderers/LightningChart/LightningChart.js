import { getBaseDate } from "@/Graphs/graphCommon";
import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import {
  AxisTickStrategies,
  emptyLine,
  lightningChart,
  synchronizeAxisIntervals,
  Themes,
} from "@arction/lcjs";

let graphs = [],
  dashboard;
let minX, maxX;
export const baseDate = 0;
const getMainXAxis = () => {
  return graphs[graphs.length - 1].xAxis;
};

// For events
let lastEvent = null;
let hasInitialized = false;
export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}
const maxCellsCount = 25;
const updateDashboardRowHeights = () => {
  for (let row = 0; row < maxCellsCount; row += 1) {
    if (row < graphs.length) {
      dashboard.setRowHeight(row, 1);
    } else {
      dashboard.setRowHeight(row, 0.00001);
    }
  }

  dashboard.setRowHeight(graphs[graphs.length - 1].row, 2);
};

export function init(container) {
  lastEvent = {
    timestamp: performance.now(),
  };

  dashboard = lightningChart()
    .Dashboard({
      container,
      numberOfColumns: 1,
      numberOfRows: maxCellsCount,
      theme: Themes.light,
    })
    .setSplitterStyle(emptyLine)
    .setSplitterStyleHighlight(emptyLine);

  graphs = channels.map((channel, i) => {
    return addChannel(dashboard, channel, i);
  });

  registerZoomEvents(container);
}

export function update(dataset = [], timeSeries) {
  if (hasInitialized) {
    lastEvent = {
      timestamp: performance.now(),
    };
  }

  const currGraphsLength = graphs.length;

  dataset.forEach((channelData, i) => {
    let graph = graphs[i];
    let channelIndex = i;

    // Add new channels
    if (dataset.length < currGraphsLength) {
      // return; // TODO: ask lcjs how to add/remove rows to dashboard
      channelIndex = currGraphsLength + i;
      graphs.push(addChannel(dashboard, channels[channelIndex], channelIndex));
      graph = graphs[channelIndex];
    }

    // Update existing channels
    graph.series.clear();
    graph.series.addArraysXY(timeSeries, channelData.data);
    channels[channelIndex].min = channelData.min;
    channels[channelIndex].max = channelData.max;
  });

  graphs
    .splice(channels.length, graphs.length - channels.length)
    .forEach((graph) => {
      graph.chart.dispose();
    });

  if (timeSeries) updateTimeSeries(timeSeries);
  updateDashboardRowHeights();
  getMainXAxis().setInterval(minX, maxX, false, true);
  reportRenderEvent();

  window.dashboard = dashboard;
  window.graphs = graphs;
}

function updateTimeSeries(timeSeries) {
  graphs.forEach((graph, i) => {
    graph.xAxis.setTickStrategy(AxisTickStrategies.Empty);
  });
  getMainXAxis().setTickStrategy(
    AxisTickStrategies.DateTime,
    (ticks) => ticks.setDateOrigin(new Date(getBaseDate()))
    // .setMajorTickStyle((major) => major.setGridStrokeStyle(emptyLine))
    // .setMinorTickStyle((minor) => minor.setGridStrokeStyle(emptyLine))
  );

  if (timeSeries) {
    minX = timeSeries[0];
    maxX = timeSeries[timeSeries.length - 1];
  }
}

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
    .setBackgroundStrokeStyle(emptyLine);

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

  const series = chart.addLineSeries({
    dataPattern: {
      pattern: "ProgressiveX",
      regularProgressiveStep: true,
      allowDataGrouping: true,
    },
    automaticColorIndex: channelIndex,
  });

  // updateDashboardRowHeights();

  return { chart, series, xAxis, yAxis, row: channelIndex };
}

function registerZoomEvents(container) {
  graphs[graphs.length - 1].xAxis.onScaleChange((start, end) => {
    // Prevent zomming out more than full graph width
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

    // Prevent Y axis zoom (Keep full scale of Y axis at all times)
    graphs.forEach((graph, i) => {
      graph.yAxis.setInterval(channels[i].min, channels[i].max);
    });
  });

  // Synchronize zoom and scroll on all channels
  synchronizeAxisIntervals(...graphs.map((ch) => ch.xAxis));

  // Prevent native wheel zoom (interferes with max zoom limitation)
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

function reportRenderEvent() {
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

export function showLoading() {}
export function hideLoading() {}
